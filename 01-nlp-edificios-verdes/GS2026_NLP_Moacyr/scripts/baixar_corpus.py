#!/usr/bin/env python3
"""Baixa o corpus de Edificios Verdes / Net Zero a partir de corpus/metadata.json.

Idempotente: pula arquivos ja baixados e validos. Valida que cada PDF comeca com
o magic number %PDF e tem tamanho minimo. Atualiza corpus/metadata.json com o
tamanho de cada arquivo e grava um corpus/download_log.json com o resultado.

Uso:
    python scripts/baixar_corpus.py            # baixa o que falta
    python scripts/baixar_corpus.py --forcar   # rebaixa tudo
"""
from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.request
import urllib.error
import urllib.parse
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CORPUS_DIR = RAIZ / "corpus"
METADATA = CORPUS_DIR / "metadata.json"
LOG = CORPUS_DIR / "download_log.json"

TAMANHO_MINIMO_BYTES = 50 * 1024  # 50 KB
TIMEOUT = 90
TENTATIVAS = 3
# Alguns servidores (gov.br, labeee) rejeitam requests sem User-Agent de navegador.
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    ),
    "Accept": "application/pdf,*/*",
}


def eh_pdf_valido(caminho: Path) -> bool:
    """Verifica magic number %PDF e tamanho minimo."""
    if not caminho.exists() or caminho.stat().st_size < TAMANHO_MINIMO_BYTES:
        return False
    try:
        with open(caminho, "rb") as f:
            return f.read(5).startswith(b"%PDF")
    except OSError:
        return False


def sanitizar_url(url: str) -> str:
    """Percent-encoda caracteres nao-ASCII no path/query (ex: 'Síntese')."""
    partes = urllib.parse.urlsplit(url)
    path = urllib.parse.quote(partes.path, safe="/%")
    query = urllib.parse.quote(partes.query, safe="=&%")
    return urllib.parse.urlunsplit(
        (partes.scheme, partes.netloc, path, query, partes.fragment)
    )


def baixar(url: str, destino: Path) -> tuple[bool, str]:
    """Baixa url para destino com tentativas. Retorna (ok, mensagem)."""
    url = sanitizar_url(url)
    ultimo_erro = ""
    for tentativa in range(1, TENTATIVAS + 1):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
                dados = resp.read()
            tmp = destino.with_suffix(destino.suffix + ".part")
            tmp.write_bytes(dados)
            if not dados[:5].startswith(b"%PDF"):
                tmp.unlink(missing_ok=True)
                ultimo_erro = f"conteudo nao e PDF (inicio={dados[:8]!r})"
                # nao adianta repetir se o servidor devolve HTML; aborta cedo
                break
            if len(dados) < TAMANHO_MINIMO_BYTES:
                tmp.unlink(missing_ok=True)
                ultimo_erro = f"arquivo pequeno demais ({len(dados)} bytes)"
                break
            tmp.replace(destino)
            return True, f"{len(dados):,} bytes"
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as e:
            ultimo_erro = f"{type(e).__name__}: {e}"
            if tentativa < TENTATIVAS:
                time.sleep(2 * tentativa)
    return False, ultimo_erro


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--forcar", action="store_true", help="rebaixa mesmo se ja existir")
    args = ap.parse_args()

    if not METADATA.exists():
        print(f"ERRO: nao encontrei {METADATA}", file=sys.stderr)
        return 1

    meta = json.loads(METADATA.read_text(encoding="utf-8"))
    docs = meta["documentos"]
    CORPUS_DIR.mkdir(parents=True, exist_ok=True)

    log: list[dict] = []
    ok_count = falha_count = pulado_count = 0

    for i, doc in enumerate(docs, 1):
        destino = CORPUS_DIR / doc["arquivo"]
        prefixo = f"[{i:2d}/{len(docs)}] {doc['id']} {doc['arquivo']}"

        if not args.forcar and eh_pdf_valido(destino):
            tam = destino.stat().st_size
            doc["tamanho_bytes"] = tam
            print(f"{prefixo}: ja existe e valido ({tam:,} bytes) — pulando")
            log.append({"id": doc["id"], "status": "pulado", "bytes": tam})
            pulado_count += 1
            continue

        print(f"{prefixo}: baixando…")
        ok, msg = baixar(doc["url"], destino)
        if ok:
            tam = destino.stat().st_size
            doc["tamanho_bytes"] = tam
            print(f"           OK — {msg}")
            log.append({"id": doc["id"], "status": "ok", "bytes": tam})
            ok_count += 1
        else:
            print(f"           FALHA — {msg}", file=sys.stderr)
            log.append({"id": doc["id"], "status": "falha", "erro": msg, "url": doc["url"]})
            falha_count += 1

    # Persiste metadata atualizado (com tamanhos) e o log.
    METADATA.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    LOG.write_text(json.dumps(log, ensure_ascii=False, indent=2), encoding="utf-8")

    print(
        f"\nResumo: {ok_count} baixados, {pulado_count} pulados, "
        f"{falha_count} falhas (de {len(docs)})."
    )
    if falha_count:
        print("Documentos com falha (ver download_log.json):", file=sys.stderr)
        for item in log:
            if item["status"] == "falha":
                print(f"  - {item['id']}: {item['erro']}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
