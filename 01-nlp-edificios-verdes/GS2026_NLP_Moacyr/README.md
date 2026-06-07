# Chatbot Especialista em Edifícios Verdes / Net Zero de Energia e Água

**GS 2026.1 — Space Connect**
**Disciplina:** Processamento de Linguagem Natural, Chatbots & Virtual Agents
**Atividade:** Chat Bot com LLM fine tunned
**Aluno:** Moacyr Cabral da Silva — RM 559263

Chatbot especialista construído por **fine-tuning QLoRA** de `meta-llama/Llama-3.2-3B-Instruct`
sobre um corpus técnico próprio (14 documentos) a respeito de edifícios capazes de suprir
metade ou todas as suas necessidades de água e energia sem depender de fontes externas.

## Mapa das 8 etapas do enunciado

| Etapa | Onde está | Roda em |
|---|---|---|
| 1. Planejamento e escopo | [`relatorios/01_planejamento.md`](relatorios/01_planejamento.md) | — |
| 2. Construção do corpus | [`corpus/metadata.json`](corpus/metadata.json) + [`scripts/baixar_corpus.py`](scripts/baixar_corpus.py) | local |
| 3. Limpeza + pares Q&A | [`src/extrair_e_limpar.py`](src/extrair_e_limpar.py) + [`src/gerar_qa.py`](src/gerar_qa.py) | local + Colab |
| 4. Chunking + embeddings + índice | [`src/chunking_e_index.py`](src/chunking_e_index.py) | local |
| 5. Fine-tuning QLoRA | [`notebooks/finetuning_llama_qlora.ipynb`](notebooks/finetuning_llama_qlora.ipynb) | **Colab T4** |
| 6. Avaliação base vs. ajustado | notebook §7 + [`relatorios/perguntas_referencia.json`](relatorios/perguntas_referencia.json) | **Colab T4** |
| 7. Chatbot | [`app/chatbot_streamlit.py`](app/chatbot_streamlit.py) | local / Colab |
| 8. Relatório crítico | [`relatorios/relatorio_critico.md`](relatorios/relatorio_critico.md) | — |

## Corpus (14 documentos, 3 categorias)

Fontes públicas verificadas (HTTP 200 + validação de PDF nativo), equilibrando **energia** e **água**:

- **Certificação/normas (5):** LEED v4.1 (EN), LEED v4 (PT, GBC Brasil), INI-C (Inmetro), RTQ-R, Selo Casa Azul CAIXA.
- **Relatórios técnico-científicos (4):** Manual de aplicação da INI-C (PROCEL), IRENA *Future of Solar PV*, 2 estudos de caso de água pluvial (SciELO/UEPG).
- **Manuais de tecnologia (5):** Manual de Engenharia FV (CRESESB), aquecimento solar (LabEEE/UFSC), micro/minigeração (ANEEL), Guia de conservação de água/NBR 15527 (CBIC), reúso de águas cinzas (IPT).

> O Balanço Energético Nacional da EPE (candidato inicial "B1") foi **descartado**: é um PDF
> digitalizado (~35 caracteres/página), impróprio para fine-tuning. Decisão registrada na Etapa 8.

## Decisões técnicas (resumo)

- **Modelo base:** Llama 3.2 3B Instruct (recomendado pelo enunciado; cabe em T4 com QLoRA).
- **Geração dos pares Q&A:** feita pelo **próprio modelo base**, em modo **extrativo/grounded**
  com **verificação anti-alucinação** (descarta respostas cujos números não estão na passagem).
- **Embeddings:** `intfloat/multilingual-e5-large` (prefixos `passage:` / `query:`), 1024 dim.
- **Banco vetorial:** ChromaDB persistente.
- **Ajuste:** QLoRA 4-bit (`r=16`, `alpha=32`, `lr=2e-4`, cosine, 2 épocas, batch efetivo 16).
- **Avaliação:** 10 perguntas técnicas, base vs. ajustado, métrica **BERTScore** (F1).
- **Chatbot:** Streamlit com histórico de sessão e RAG opcional sobre o ChromaDB.

## Como reproduzir

### Parte local (corpus → índice)

```bash
cd GS2026_NLP_Moacyr
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # preencha HF_TOKEN (e GEMINI_API_KEY se for usar)

python scripts/baixar_corpus.py     # baixa os 14 PDFs (idempotente)
python src/extrair_e_limpar.py      # -> data/textos_limpos.jsonl
python src/chunking_e_index.py      # -> data/chroma_db + relatorios/chunking_embeddings.md
```

### Parte GPU (Colab T4)

Abra [`notebooks/finetuning_llama_qlora.ipynb`](notebooks/finetuning_llama_qlora.ipynb) no
Google Colab, selecione **Runtime → T4 GPU** e execute as células em ordem. O notebook clona
este repositório, gera os pares Q&A, treina o adaptador QLoRA, avalia base vs. ajustado e salva
`adaptador_lora/`.

### Chatbot

```bash
# Local (após copiar adaptador_lora/ do Colab para esta pasta):
export HF_TOKEN=hf_...
streamlit run app/chatbot_streamlit.py

# Colab (no fim do notebook): subir com streamlit + túnel cloudflared/pyngrok.
```

Se o adaptador não estiver presente, o chatbot usa o modelo base e avisa na interface
(para a demonstração nunca ficar travada).

## Estrutura

```
GS2026_NLP_Moacyr/
├── corpus/              # 14 PDFs + metadata.json (PDFs no .gitignore; rebaixáveis)
├── data/                # textos_limpos.jsonl, chunks.jsonl, pares_qa.jsonl, chroma_db/
├── src/                 # extrair_e_limpar, chunking, chunking_e_index, gerar_qa, retriever
├── scripts/             # baixar_corpus.py (idempotente)
├── notebooks/           # finetuning_llama_qlora.ipynb (Colab)
├── app/                 # chatbot_streamlit.py
├── relatorios/          # planejamento, relatórios de etapa, perguntas, relatório crítico
├── build_notebook.py    # gera o .ipynb a partir de Python (padrão do monorepo)
└── requirements.txt
```
