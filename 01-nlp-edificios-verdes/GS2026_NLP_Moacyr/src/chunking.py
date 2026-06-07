#!/usr/bin/env python3
"""Modulo de segmentacao (chunking) compartilhado.

Usado por:
  - Etapa 3 (gerar_qa.py): passagens maiores (~800 tokens) para dar contexto rico
    ao gerador de Q&A;
  - Etapa 4 (chunking_e_index.py): chunks <=512 tokens para respeitar a janela do
    modelo de embedding intfloat/multilingual-e5-large.

A contagem de tokens usa tiktoken (cl100k_base) como aproximacao rapida e estavel.
E uma estimativa — o tokenizer real do e5/Llama difere —, suficiente para decidir
fronteiras de corte. A segmentacao respeita limites de paragrafo e de frase para
nao cortar requisitos normativos ou tabelas no meio.
"""
from __future__ import annotations

import re

import tiktoken

_ENC = tiktoken.get_encoding("cl100k_base")

# Divide em frases por pontuacao final seguida de espaco/maiuscula, preservando
# numeros como "15.527" ou "4.11" (nao quebra em ponto entre digitos).
_RE_FRASE = re.compile(r"(?<=[.!?:;])\s+(?=[A-ZÀ-Þ0-9])")
_RE_PARAGRAFO = re.compile(r"\n\s*\n")


def contar_tokens(texto: str) -> int:
    return len(_ENC.encode(texto))


def _dividir_em_blocos(texto: str) -> list[str]:
    """Quebra em paragrafos; paragrafos muito longos viram frases."""
    blocos: list[str] = []
    for par in _RE_PARAGRAFO.split(texto):
        par = par.strip()
        if not par:
            continue
        if contar_tokens(par) <= 400:
            blocos.append(par)
        else:
            frase_atual = ""
            for frase in _RE_FRASE.split(par):
                if contar_tokens(frase_atual + " " + frase) > 400 and frase_atual:
                    blocos.append(frase_atual.strip())
                    frase_atual = frase
                else:
                    frase_atual = (frase_atual + " " + frase).strip()
            if frase_atual:
                blocos.append(frase_atual.strip())
    return blocos


def segmentar(
    texto: str,
    alvo_tokens: int = 512,
    sobreposicao: float = 0.25,
    minimo_tokens: int = 80,
) -> list[dict]:
    """Segmenta texto em chunks ~alvo_tokens com sobreposicao fracionaria.

    Retorna lista de dicts: {"texto", "tokens", "indice"}. A sobreposicao reaproveita
    os ultimos blocos do chunk anterior para preservar contexto entre fronteiras.
    """
    blocos = _dividir_em_blocos(texto)
    chunks: list[dict] = []
    atual: list[str] = []
    tokens_atual = 0

    def fechar():
        nonlocal atual, tokens_atual
        if not atual:
            return
        corpo = "\n\n".join(atual).strip()
        if contar_tokens(corpo) >= minimo_tokens:
            chunks.append({"texto": corpo, "tokens": contar_tokens(corpo),
                           "indice": len(chunks)})

    for bloco in blocos:
        t = contar_tokens(bloco)
        if tokens_atual + t > alvo_tokens and atual:
            fechar()
            # monta sobreposicao: ultimos blocos ate ~sobreposicao*alvo
            mant: list[str] = []
            acc = 0
            for b in reversed(atual):
                bt = contar_tokens(b)
                if acc + bt > sobreposicao * alvo_tokens:
                    break
                mant.insert(0, b)
                acc += bt
            atual = mant + [bloco]
            tokens_atual = acc + t
        else:
            atual.append(bloco)
            tokens_atual += t
    fechar()
    return chunks


if __name__ == "__main__":
    import json
    import sys
    from pathlib import Path

    jsonl = Path(__file__).resolve().parent.parent / "data" / "textos_limpos.jsonl"
    alvo = int(sys.argv[1]) if len(sys.argv) > 1 else 512
    total = 0
    for linha in jsonl.read_text(encoding="utf-8").splitlines():
        d = json.loads(linha)
        cs = segmentar(d["texto"], alvo_tokens=alvo)
        total += len(cs)
        print(f"{d['id']:4} {len(cs):4d} chunks  (media "
              f"{sum(c['tokens'] for c in cs)//max(len(cs),1)} tok)")
    print(f"TOTAL: {total} chunks @ alvo={alvo}")
