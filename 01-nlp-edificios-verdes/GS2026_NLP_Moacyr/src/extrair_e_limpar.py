#!/usr/bin/env python3
"""Etapa 3 (parte 1) — Extracao e limpeza do corpus.

Le os PDFs listados em corpus/metadata.json, extrai o texto com PyMuPDF e aplica
limpeza conservadora:

  - remove cabecalhos/rodapes repetidos (linhas curtas que reaparecem em muitas
    paginas, tipicas de cabecalho/rodape de PDF tecnico);
  - remove numeros de pagina isolados (linha contendo SO digitos);
  - junta palavras quebradas por hifenizacao de fim de linha;
  - normaliza encoding (NFKC), espacos multiplos e caracteres de controle.

PRESERVA deliberadamente:
  - requisitos normativos numerados (ex.: "4.11 Area de permanencia ..."), que NAO
    sao numeros de pagina e carregam o conteudo tecnico;
  - tabelas de parametros (linhas com multiplos numeros/limites), mantendo a quebra
    de linha original onde a remocao poderia fundir colunas.

Saida:
  - data/textos_limpos/<id>.txt          (um arquivo por documento)
  - data/textos_limpos.jsonl             (texto + metadados, 1 objeto por linha)
  - relatorios/limpeza_corpus.md         (relatorio de extracao por documento)

Uso:
    python src/extrair_e_limpar.py
"""
from __future__ import annotations

import json
import re
import unicodedata
from collections import Counter
from pathlib import Path

import fitz  # PyMuPDF

RAIZ = Path(__file__).resolve().parent.parent
CORPUS_DIR = RAIZ / "corpus"
METADATA = CORPUS_DIR / "metadata.json"
SAIDA_TXT_DIR = RAIZ / "data" / "textos_limpos"
SAIDA_JSONL = RAIZ / "data" / "textos_limpos.jsonl"
RELATORIO = RAIZ / "relatorios" / "limpeza_corpus.md"

# Linha considerada "numero de pagina" se for so digitos (com pontuacao/espaco trivial).
RE_NUM_PAGINA = re.compile(r"^\s*[ivxlcdmIVXLCDM]{0,6}\s*\d{1,4}\s*[.\-—]?\s*$")
# Item normativo numerado: "4.11 Texto", "1.2.3 Texto", "Art. 5 ..." -> NAO e ruido.
RE_ITEM_NUMERADO = re.compile(r"^\s*(\d+(\.\d+)+|\d+\s+[A-Za-zÀ-ÿ]|art\.?\s*\d+)", re.IGNORECASE)
# Hifenizacao de fim de linha: "ocupa-\ncao" -> "ocupacao".
RE_HIFEN_QUEBRA = re.compile(r"(\w)-\s*\n\s*(\w)")
RE_ESPACOS = re.compile(r"[ \t ]{2,}")
RE_QUEBRAS_EXCESSO = re.compile(r"\n{3,}")
RE_CTRL = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f]")


def normalizar_encoding(texto: str) -> str:
    texto = unicodedata.normalize("NFKC", texto)
    texto = RE_CTRL.sub("", texto)
    # aspas/hifens tipograficos -> ASCII simples (mantem legibilidade tecnica)
    for a, b in [("‘", "'"), ("’", "'"), ("“", '"'), ("”", '"'),
                 ("–", "-"), ("—", "-"), ("﻿", "")]:
        texto = texto.replace(a, b)
    return texto


def detectar_cabecalhos_rodapes(paginas: list[str]) -> set[str]:
    """Linhas curtas (<=80 chars) que aparecem em >=30% das paginas e nao sao
    itens numerados -> tratadas como cabecalho/rodape repetido."""
    if len(paginas) < 5:
        return set()
    contador: Counter[str] = Counter()
    for pg in paginas:
        vistos = set()
        for linha in pg.splitlines():
            l = linha.strip()
            if l and len(l) <= 80 and not RE_ITEM_NUMERADO.match(l):
                vistos.add(l)
        contador.update(vistos)
    limite = max(3, int(0.30 * len(paginas)))
    return {linha for linha, n in contador.items() if n >= limite}


def limpar_pagina(texto: str, repetidos: set[str]) -> str:
    linhas_saida = []
    for linha in texto.splitlines():
        l = linha.strip()
        if not l:
            linhas_saida.append("")
            continue
        if l in repetidos:                       # cabecalho/rodape repetido
            continue
        if RE_NUM_PAGINA.match(l) and not RE_ITEM_NUMERADO.match(l):  # num. de pagina
            continue
        linhas_saida.append(linha.rstrip())
    return "\n".join(linhas_saida)


def limpar_documento(caminho: Path) -> tuple[str, dict]:
    doc = fitz.open(caminho)
    paginas_brutas = [doc[i].get_text() for i in range(doc.page_count)]
    n_paginas = doc.page_count
    doc.close()

    repetidos = detectar_cabecalhos_rodapes(paginas_brutas)
    paginas_limpas = [limpar_pagina(p, repetidos) for p in paginas_brutas]
    texto = "\n\n".join(paginas_limpas)

    # juncao de hifenizacao e normalizacao final
    texto = RE_HIFEN_QUEBRA.sub(r"\1\2", texto)
    texto = normalizar_encoding(texto)
    texto = RE_ESPACOS.sub(" ", texto)
    texto = RE_QUEBRAS_EXCESSO.sub("\n\n", texto).strip()

    stats = {
        "paginas": n_paginas,
        "linhas_cabecalho_rodape_removidas": len(repetidos),
        "chars_limpos": len(texto),
        "palavras": len(texto.split()),
    }
    return texto, stats


def main() -> int:
    meta = json.loads(METADATA.read_text(encoding="utf-8"))
    SAIDA_TXT_DIR.mkdir(parents=True, exist_ok=True)
    SAIDA_JSONL.parent.mkdir(parents=True, exist_ok=True)
    RELATORIO.parent.mkdir(parents=True, exist_ok=True)

    registros = []
    linhas_rel = [
        "# Etapa 3 — Relatorio de extracao e limpeza do corpus",
        "",
        f"Documentos processados: {len(meta['documentos'])}",
        "",
        "| id | doc | paginas | cab/rod removidos | palavras | chars |",
        "|----|-----|--------:|------------------:|---------:|------:|",
    ]
    total_palavras = 0

    for doc in meta["documentos"]:
        caminho = CORPUS_DIR / doc["arquivo"]
        if not caminho.exists():
            print(f"  AVISO: {doc['arquivo']} ausente — pulando")
            continue
        texto, stats = limpar_documento(caminho)
        (SAIDA_TXT_DIR / f"{doc['id']}.txt").write_text(texto, encoding="utf-8")
        registros.append({
            "id": doc["id"],
            "titulo": doc["titulo"],
            "org": doc["org"],
            "categoria": doc["categoria"],
            "subcategoria": doc["subcategoria"],
            "ano": doc["ano"],
            "vigencia": doc["vigencia"],
            "idioma": doc["idioma"],
            "texto": texto,
            **stats,
        })
        total_palavras += stats["palavras"]
        linhas_rel.append(
            f"| {doc['id']} | {doc['arquivo']} | {stats['paginas']} | "
            f"{stats['linhas_cabecalho_rodape_removidas']} | {stats['palavras']:,} | "
            f"{stats['chars_limpos']:,} |"
        )
        print(f"  {doc['id']}: {stats['palavras']:,} palavras "
              f"({stats['linhas_cabecalho_rodape_removidas']} cab/rod removidos)")

    with open(SAIDA_JSONL, "w", encoding="utf-8") as f:
        for r in registros:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    linhas_rel += ["", f"**Total:** {len(registros)} documentos, "
                   f"{total_palavras:,} palavras limpas."]
    RELATORIO.write_text("\n".join(linhas_rel) + "\n", encoding="utf-8")

    print(f"\nOK: {len(registros)} documentos limpos, {total_palavras:,} palavras.")
    print(f"  -> {SAIDA_JSONL.relative_to(RAIZ)}")
    print(f"  -> {RELATORIO.relative_to(RAIZ)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
