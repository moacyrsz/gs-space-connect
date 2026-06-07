"""Gera relatorio.pdf consolidando os relatorios de etapa do projeto de NLP.

Junta, em um unico PDF de entrega: o relatorio critico (Etapa 8, documento principal),
seguido dos relatorios de apoio (planejamento, limpeza do corpus, chunking/embeddings,
geracao de Q&A). Mantem o mesmo padrao visual das demais disciplinas da GS.

Uso:
    cd GS2026_NLP_Moacyr
    source .venv/bin/activate
    pip install markdown-pdf
    python scripts/gerar_relatorio_pdf.py
"""
from __future__ import annotations

from pathlib import Path

from markdown_pdf import MarkdownPdf, Section

ROOT = Path(__file__).resolve().parents[1]
REL = ROOT / "relatorios"
PDF = REL / "relatorio.pdf"

# Ordem de consolidacao: critico primeiro (documento principal da Etapa 8),
# depois os relatorios de apoio gerados pelas etapas 1, 3 e 4.
PARTES = [
    REL / "relatorio_critico.md",   # Etapa 8 — documento principal
    REL / "01_planejamento.md",      # Etapa 1
    REL / "limpeza_corpus.md",       # Etapa 3 (extracao/limpeza)
    REL / "qa_geracao.md",           # Etapa 3 (geracao de Q&A)
    REL / "chunking_embeddings.md",  # Etapa 4
]

CSS = """
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    line-height: 1.55;
    color: #1d1d1f;
    max-width: 720px;
    margin: 0 auto;
}
h1 { font-size: 22pt; margin-top: 1.5em; border-bottom: 1px solid #ddd; padding-bottom: 0.3em; }
h2 { font-size: 15pt; margin-top: 1.6em; border-bottom: 1px solid #eee; padding-bottom: 0.2em; }
h3 { font-size: 12pt; margin-top: 1.2em; }
p, li { font-size: 10.5pt; }
code { font-family: 'SF Mono', Menlo, Consolas, monospace; font-size: 9.5pt;
       background: #f5f5f7; padding: 1px 4px; border-radius: 3px; }
pre { background: #f5f5f7; padding: 12px; border-radius: 6px; overflow-x: auto;
      font-size: 9pt; line-height: 1.4; }
pre code { background: transparent; padding: 0; }
table { border-collapse: collapse; margin: 0.8em 0; font-size: 10pt; width: 100%; }
th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; vertical-align: top; }
th { background: #f5f5f7; font-weight: 600; }
hr { border: none; border-top: 1px solid #ddd; margin: 2em 0; }
blockquote { margin-left: 0; padding-left: 1em; border-left: 3px solid #ddd; color: #555; }
"""


def main() -> int:
    pdf = MarkdownPdf(toc_level=2, optimize=True)
    pdf.meta["title"] = "GS 2026.1 — NLP — Chatbot Edificios Verdes / Net Zero"
    pdf.meta["author"] = "Moacyr Cabral da Silva — RM 559263"
    pdf.meta["subject"] = "Global Solution 2026.1 — Processamento de Linguagem Natural"

    for parte in PARTES:
        if not parte.exists():
            print(f"  AVISO: {parte.name} ausente — pulando")
            continue
        # quebra de pagina entre relatorios de apoio
        pdf.add_section(Section(parte.read_text(encoding="utf-8"), toc=False), user_css=CSS)

    pdf.save(str(PDF))
    print(f"PDF gerado: {PDF} ({PDF.stat().st_size / 1024:.0f} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
