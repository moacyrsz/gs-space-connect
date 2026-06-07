# Próximos passos — NLP

Última atualização: 2026-06-06. Entrega GS: 2026-06-09 23h55.

## Estado atual (o que JÁ está pronto)

Todo o material **local** e o **código** das 8 etapas estão prontos e versionáveis:

- ✅ Etapa 1 — planejamento (`relatorios/01_planejamento.md`)
- ✅ Etapa 2 — corpus: 14 PDFs verificados + `corpus/metadata.json` + `scripts/baixar_corpus.py`
- ✅ Etapa 3 — limpeza (`data/textos_limpos.jsonl`) + gerador de Q&A com Llama 3B (`src/gerar_qa.py`)
- ✅ Etapa 4 — chunking + embeddings e5-large + ChromaDB (`src/chunking_e_index.py`)
- ✅ Etapa 5/6 — notebook Colab (`notebooks/finetuning_llama_qlora.ipynb`, 28 células)
- ✅ Etapa 6 — 10 perguntas de avaliação (`relatorios/perguntas_referencia.json`)
- ✅ Etapa 7 — chatbot Streamlit (`app/chatbot_streamlit.py`) + retriever
- ✅ Etapa 8 — relatório crítico (estrutura) + roteiro de vídeo
- ✅ Credenciais: `HF_TOKEN` no `.env` (acesso ao Llama 3.2 3B confirmado). Token será regenerado pelo usuário no fim.

## O que FALTA (precisa de GPU / ação do usuário)

1. **Rodar o notebook no Colab (T4)** — gera os pares Q&A, treina o QLoRA, salva `adaptador_lora/` e produz `relatorios/avaliacao_resultado.json`.
2. **Preencher os números reais** no `relatorio_critico.md` (campos `‹preencher após o Colab›`) com o BERTScore base vs. ajustado.
3. **Gravar o vídeo** (até 5 min) seguindo `relatorios/roteiro_video.md`; publicar como Não Listado no YouTube.
4. **Push pro GitHub** do repo integrador (a pasta NLP está untracked — ver tarefa de fechamento).

## Observações

- O corpus inicial tinha 15 docs; o "B1" (BEN/EPE) foi descartado por ser PDF escaneado. Ficaram 14 (≥10, 3 categorias OK).
- `bitsandbytes`/QLoRA NÃO rodam no Mac — fine-tuning só no Colab. Por isso as etapas 5/6 estão no notebook.
- A geração de Q&A usa o próprio Llama 3B (decisão do usuário), com verificação anti-alucinação para mitigar o risco.
