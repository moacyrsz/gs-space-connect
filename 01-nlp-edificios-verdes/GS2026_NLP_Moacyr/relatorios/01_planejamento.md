# Etapa 1 — Planejamento e Escopo

**GS 2026.1 — Processamento de Linguagem Natural**
**Aluno:** Moacyr Cabral da Silva — RM 559263
**Tema:** Assistente para Projeto de Edifícios Eficientes quanto a Água e Energia

---

## 1. Recorte temático

O recorte adotado é o **caso integrado água + energia**, alinhado à passagem destacada do enunciado: *"de modo que o edifício seja capaz de suprir metade ou todas suas necessidades de água e energia sem depender de fontes externas"*. Restringir o assistente a apenas um dos insumos empobreceria o caso de uso real — projetistas de edifícios Net Zero precisam balancear os dois domínios simultaneamente (ex.: bombas de uma cisterna pluvial dependem do dimensionamento fotovoltaico).

**Sub-temas cobertos pelo corpus:**

| Domínio | Sub-tema |
|---|---|
| Energia | Eficiência energética em edificações (envelope, iluminação, HVAC) |
| Energia | Geração distribuída por sistemas fotovoltaicos |
| Energia | Building Energy Management Systems (BEMS) |
| Água | Captação e aproveitamento de águas pluviais |
| Água | Reúso de águas cinzas |
| Transversal | Certificações ambientais (LEED, AQUA-HQE, GBC Brasil Casa, NBR 15575) |
| Transversal | Conceito Net Zero / Zero Energy Building (ZEB) |

## 2. Decisões de tecnologia

### 2.1 Modelo base

**Escolha:** `meta-llama/Llama-3.2-3B-Instruct`

- 3,2 bilhões de parâmetros — cabe em GPU T4 (16 GB) com QLoRA 4-bit, com folga para batch size razoável.
- Treinado nativamente para conversação (variante *Instruct*), o que reduz o risco de regressão estilística após o ajuste.
- Bom desempenho em português técnico segundo benchmarks públicos da Meta (Belebele, MGSM-PT).
- Recomendado textualmente pelo enunciado.

**Alternativas descartadas:**

- `Qwen 2.5 3B` — comparável tecnicamente, sem licença-gate, mas foge da recomendação textual do enunciado.
- `Phi-3.5 mini` (3.8B) — bom raciocínio, PT mais fraco.
- Modelos ≥7B — não cabem em T4 free.

### 2.2 Modelo de embedding

**Escolha:** `intfloat/multilingual-e5-large`

- 1024 dimensões, 100+ idiomas, treinado especificamente para retrieval.
- Padrão de fato em RAG técnico em PT segundo o leaderboard MTEB.
- Recomendado pelo enunciado.

**Alternativa considerada:** `paraphrase-multilingual-mpnet-base-v2` (768 dim), mais leve mas com recall inferior em consultas técnicas longas.

### 2.3 Banco vetorial

**Escolha:** `ChromaDB` persistente.

- Persistência local em SQLite + arquivos `.bin` — sem servidor externo.
- Mesma stack já validada na disciplina de GenAI (coerência arquitetural na entrega integrada Space Connect).
- API simples para metadados estruturados (categoria, fonte, ano, vigência).

### 2.4 Estratégia de fine-tuning

**Escolha:** `QLoRA` (LoRA com base quantizada em 4 bits via `bitsandbytes`).

- LoRA puro em 16 bits demanda ~12 GB de VRAM para Llama 3B + gradientes — apertado em T4.
- QLoRA reduz a base para ~2,5 GB e libera espaço para batch size 4–8 sem OOM.
- Treina apenas o adaptador (~30–50 MB), facilitando versionamento e distribuição (Hugging Face Hub).

**Hiperparâmetros previstos (sujeitos a ajuste após validação):**

| Hiperparâmetro | Valor | Justificativa |
|---|---|---|
| `r` (rank LoRA) | 16 | Padrão para QLoRA SFT em 3B; ganhos marginais acima disso |
| `lora_alpha` | 32 | Convenção `alpha = 2·r` |
| `lora_dropout` | 0.05 | Pequeno, dataset não é grande o suficiente para over-regularização |
| Target modules | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` | Cobertura completa das atenções e MLPs |
| `learning_rate` | 2e-4 | Padrão de SFT QLoRA validado pelo time HF |
| `lr_scheduler` | cosine | Suaviza convergência ao final |
| `epochs` | 2–3 | Datasets pequenos (≈1000 pares) tendem a overfit acima de 3 épocas |
| `batch_size` (per_device) | 4 | Cabe em T4 com `max_seq_length=1024` em 4-bit |
| `gradient_accumulation_steps` | 4 | Batch efetivo de 16 |
| `max_seq_length` | 1024 | Coberto pelos chunks (512–1024 tokens) e pelos pares Q&A |
| `optimizer` | `paged_adamw_8bit` | Recomendado para QLoRA, evita pico de VRAM |
| Quantização | 4-bit NF4, double-quant | Configuração canônica QLoRA do paper original |

**Bibliotecas:** `transformers` + `peft` + `bitsandbytes` + `trl` (`SFTTrainer`).

### 2.5 Geração dos pares Q&A

**Escolha:** geração sintética via LLM grande (Gemini 2.5 Flash Lite, mesma chave já configurada na disciplina de GenAI), grounded em cada chunk do corpus, com revisão por amostragem.

- Para cada chunk, prompt instrui o modelo a gerar 3–5 pares Q&A apoiados estritamente no chunk, em PT-BR, com perguntas variadas (definição, requisito numérico, comparativo, aplicação prática).
- Meta: ~1000 pares cobrindo os 10+ documentos do corpus.
- Pós-filtro automático: remoção de pares com resposta < 30 caracteres, perguntas duplicadas (Jaccard > 0.85), respostas que apenas repetem a pergunta.
- Revisão manual: amostragem aleatória de 30 pares para garantir qualidade.

### 2.6 Avaliação

- 10 perguntas técnicas formuladas manualmente, cobrindo todos os sub-temas do recorte (energia + água + certificações).
- Comparação **modelo base vs. modelo fine-tunado** nas mesmas 10 perguntas.
- Métrica automática: **BERTScore** (F1) em relação a respostas de referência escritas pelo aluno — mais robusta que BLEU/ROUGE para texto técnico em PT, pois opera no espaço de embeddings semânticos em vez de n-gramas.
- Análise qualitativa de cada caso: precisão factual, profundidade, aderência ao domínio.

### 2.7 Deploy do chatbot

**Escolha:** Streamlit dentro do próprio notebook Colab, exposto via `pyngrok` ou `cloudflared`.

- Após o fine-tuning, célula final do notebook carrega o adaptador, instancia o modelo e sobe a UI.
- Histórico de conversa em `st.session_state`.
- Sem dependência de máquina local com GPU para a demonstração — vídeo gravado no próprio Colab.

### 2.8 Ambiente de execução

| Etapa | Onde roda |
|---|---|
| 1. Planejamento | Local (Markdown) |
| 2. Coleta corpus | Local (downloads + metadados) |
| 3. Limpeza + Q&A | Local (Python + Gemini API) |
| 4. Chunking + embeddings + Chroma | Local (CPU é suficiente para o volume) |
| 5. Fine-tuning QLoRA | **Google Colab GPU T4** |
| 6. Avaliação | **Google Colab GPU T4** (precisa carregar modelo) |
| 7. Chatbot Streamlit | **Google Colab GPU T4** + ngrok |
| 8. Relatório crítico | Local (Markdown → PDF) |

## 3. Estrutura de entrega prevista

```
GS2026_NLP_Moacyr/
├── relatorios/
│   ├── 01_planejamento.md          # este documento
│   ├── relatorio_final.pdf         # relatório crítico (Etapa 8)
│   └── avaliacao.md                # 10 perguntas: base vs. fine-tuned (Etapa 6)
├── corpus/                         # 10+ PDFs com metadados (Etapa 2)
│   └── metadata.json
├── data/
│   ├── chunks.jsonl                # chunks com metadados (Etapa 4)
│   ├── pares_qa.jsonl              # 500-1500 pares (Etapa 3)
│   └── chroma_db/                  # vector store (Etapa 4)
├── src/
│   ├── extrair_e_limpar.py         # pipeline de limpeza
│   ├── gerar_qa.py                 # geração sintética via Gemini
│   ├── chunking_e_index.py         # chunking + embeddings + Chroma
│   └── avaliar.py                  # BERTScore base vs. ajustado
├── notebooks/
│   └── finetuning_llama_qlora.ipynb  # notebook Colab (Etapas 5, 6, 7)
├── app/
│   └── chatbot_streamlit.py        # UI conversacional
├── scripts/
│   └── baixar_corpus.py            # idempotente, com fontes URL
├── README.md
├── requirements.txt
└── demo.mov                        # vídeo demonstrativo
```

## 4. Cronograma resumido

| Etapa | Onde | Estimativa |
|---|---|---|
| 1 — Planejamento | Local | feita |
| 2 — Corpus | Local | 2 h |
| 3 — Limpeza + Q&A | Local | 3 h (geração ~30 min de cota Gemini) |
| 4 — Chunking + embeddings | Local | 1 h |
| 5 — Fine-tuning | Colab T4 | 1–2 h treino + 1 h prep |
| 6 — Avaliação | Colab | 1 h |
| 7 — Chatbot | Colab | 1 h |
| 8 — Relatório + vídeo | Local | 2 h |
| **Total** | | ~12 h efetivas |

## 5. Riscos identificados

1. **Acesso ao Llama 3.2 — gated.** A licença Meta exige solicitação no HF Hub. Ação: solicitar acesso já no início da Etapa 2.
2. **Cota free do Gemini para Q&A.** 1000 req/dia no `flash-lite`. Mitigação: gerar pares em batch ao longo de 1–2 dias se necessário; reaproveitar pares entre chunks adjacentes.
3. **GPU T4 do Colab pode desconectar.** Mitigação: salvar checkpoint a cada N steps no Drive; rodar em sessões de no máximo 8 h.
4. **PDFs de certificação podem ter texto digitalizado (OCR).** Mitigação: usar PyMuPDF (já validado na GenAI) e fallback para `pytesseract` se necessário. Documentos brasileiros oficiais (LEED Brasil, GBC) costumam ter PDF nativo.
