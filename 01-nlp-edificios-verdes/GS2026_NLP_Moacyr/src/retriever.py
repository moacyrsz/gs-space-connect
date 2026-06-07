#!/usr/bin/env python3
"""Recuperador (RAG opcional) sobre o ChromaDB construido na Etapa 4.

Usado pelo chatbot quando o modo RAG esta ligado: recupera os chunks mais
relevantes do corpus para complementar o conhecimento incorporado pelo fine-tuning.

Detalhe do e5: as CONSULTAS usam o prefixo "query: " (os documentos foram indexados
com "passage: "). Sem isso o retrieval degrada.
"""
from __future__ import annotations

from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CHROMA_DIR = RAIZ / "data" / "chroma_db"
COLLECTION = "edificios_verdes"
MODELO_EMBED = "intfloat/multilingual-e5-large"


class Retriever:
    def __init__(self):
        from sentence_transformers import SentenceTransformer
        import chromadb

        self.modelo = SentenceTransformer(MODELO_EMBED)
        client = chromadb.PersistentClient(path=str(CHROMA_DIR))
        self.col = client.get_collection(COLLECTION)

    def buscar(self, pergunta: str, k: int = 4) -> list[dict]:
        emb = self.modelo.encode([f"query: {pergunta}"], normalize_embeddings=True)
        res = self.col.query(query_embeddings=[emb[0].tolist()], n_results=k)
        saida = []
        for doc, meta, dist in zip(res["documents"][0], res["metadatas"][0],
                                   res["distances"][0]):
            saida.append({"texto": doc, "fonte": meta.get("titulo", ""),
                          "org": meta.get("org", ""), "categoria": meta.get("categoria", ""),
                          "similaridade": round(1 - dist, 3)})
        return saida

    def contexto(self, pergunta: str, k: int = 4) -> str:
        trechos = self.buscar(pergunta, k)
        return "\n\n".join(
            f"[{i+1}] ({t['org']}) {t['texto']}" for i, t in enumerate(trechos))


def disponivel() -> bool:
    return (CHROMA_DIR / "chroma.sqlite3").exists()
