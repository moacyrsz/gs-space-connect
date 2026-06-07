#!/usr/bin/env python3
"""Etapa 4 — Segmentacao (chunking), embeddings e indexacao vetorial.

Le data/textos_limpos.jsonl, segmenta cada documento em chunks de ~512 tokens com
sobreposicao de ~25% (dentro da faixa 20-30% do enunciado, respeitando paragrafos e
frases para nao cortar requisitos/tabelas no meio), gera embeddings com
intfloat/multilingual-e5-large e indexa no ChromaDB persistente, guardando os
metadados (id do doc, categoria, subcategoria, ano, vigencia, idioma) em cada chunk.

Detalhe critico do e5: documentos sao indexados com o prefixo "passage: " e as
consultas (no chatbot) usam "query: " — exigencia do modelo para retrieval correto.

Saidas:
  - data/chroma_db/                      (banco vetorial persistente)
  - data/chunks.jsonl                    (todos os chunks + metadados)
  - relatorios/chunking_embeddings.md    (total, distribuicao por categoria, media tok)

Uso:
    python src/chunking_e_index.py
"""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

import chunking

RAIZ = Path(__file__).resolve().parent.parent
ENTRADA = RAIZ / "data" / "textos_limpos.jsonl"
CHUNKS_JSONL = RAIZ / "data" / "chunks.jsonl"
CHROMA_DIR = RAIZ / "data" / "chroma_db"
RELATORIO = RAIZ / "relatorios" / "chunking_embeddings.md"

MODELO_EMBED = "intfloat/multilingual-e5-large"
COLLECTION = "edificios_verdes"
ALVO_TOKENS = 512
SOBREPOSICAO = 0.25


def construir_chunks() -> list[dict]:
    docs = [json.loads(l) for l in ENTRADA.read_text(encoding="utf-8").splitlines()]
    docs = [d for d in docs if d.get("palavras", 0) >= 500]  # descarta B1 escaneado
    chunks: list[dict] = []
    for d in docs:
        for c in chunking.segmentar(d["texto"], alvo_tokens=ALVO_TOKENS,
                                    sobreposicao=SOBREPOSICAO):
            cid = f"{d['id']}-{c['indice']:04d}"
            chunks.append({
                "id": cid,
                "texto": c["texto"],
                "tokens": c["tokens"],
                "doc_id": d["id"],
                "titulo": d["titulo"],
                "org": d["org"],
                "categoria": d["categoria"],
                "subcategoria": d["subcategoria"],
                "ano": d["ano"],
                "vigencia": d["vigencia"],
                "idioma": d["idioma"],
            })
    return chunks


def main() -> int:
    from sentence_transformers import SentenceTransformer
    import chromadb

    chunks = construir_chunks()
    CHUNKS_JSONL.parent.mkdir(parents=True, exist_ok=True)
    with open(CHUNKS_JSONL, "w", encoding="utf-8") as f:
        for c in chunks:
            f.write(json.dumps(c, ensure_ascii=False) + "\n")
    print(f"Chunks gerados: {len(chunks)}")

    print(f"Carregando modelo de embedding: {MODELO_EMBED} …")
    modelo = SentenceTransformer(MODELO_EMBED)

    # e5 exige prefixo "passage: " para documentos indexados
    textos = [f"passage: {c['texto']}" for c in chunks]
    print("Gerando embeddings (pode levar alguns minutos na CPU)…")
    vetores = modelo.encode(textos, batch_size=16, show_progress_bar=True,
                            normalize_embeddings=True)

    # (re)cria a colecao do zero para idempotencia
    if CHROMA_DIR.exists():
        import shutil
        shutil.rmtree(CHROMA_DIR)
    CHROMA_DIR.mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(path=str(CHROMA_DIR))
    col = client.create_collection(name=COLLECTION, metadata={"hnsw:space": "cosine"})

    # insere em lotes
    B = 256
    for i in range(0, len(chunks), B):
        lote = chunks[i:i + B]
        col.add(
            ids=[c["id"] for c in lote],
            embeddings=[v.tolist() for v in vetores[i:i + B]],
            documents=[c["texto"] for c in lote],
            metadatas=[{k: c[k] for k in ("doc_id", "titulo", "org", "categoria",
                                          "subcategoria", "ano", "vigencia",
                                          "idioma", "tokens")} for c in lote],
        )
    print(f"Indexados {col.count()} chunks no ChromaDB em {CHROMA_DIR.relative_to(RAIZ)}")

    # ---- relatorio ----
    por_cat = Counter(c["categoria"] for c in chunks)
    por_sub = Counter(c["subcategoria"] for c in chunks)
    por_doc = Counter(c["doc_id"] for c in chunks)
    media_tok = sum(c["tokens"] for c in chunks) / max(len(chunks), 1)
    linhas = [
        "# Etapa 4 — Relatorio de chunking e embeddings", "",
        f"- **Total de chunks:** {len(chunks)}",
        f"- **Tamanho medio:** {media_tok:.0f} tokens (alvo {ALVO_TOKENS}, "
        f"sobreposicao {int(SOBREPOSICAO*100)}%)",
        f"- **Modelo de embedding:** `{MODELO_EMBED}` (1024 dim, normalizado, cosine)",
        f"- **Banco vetorial:** ChromaDB persistente, colecao `{COLLECTION}`", "",
        "## Distribuicao por categoria", "",
        "| categoria | chunks |", "|---|---:|",
        *[f"| {k} | {v} |" for k, v in por_cat.most_common()], "",
        "## Distribuicao por subcategoria", "",
        "| subcategoria | chunks |", "|---|---:|",
        *[f"| {k} | {v} |" for k, v in por_sub.most_common()], "",
        "## Distribuicao por documento", "",
        "| doc | chunks |", "|---|---:|",
        *[f"| {k} | {v} |" for k, v in sorted(por_doc.items())], "",
    ]
    RELATORIO.parent.mkdir(parents=True, exist_ok=True)
    RELATORIO.write_text("\n".join(linhas) + "\n", encoding="utf-8")
    print(f"Relatorio -> {RELATORIO.relative_to(RAIZ)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
