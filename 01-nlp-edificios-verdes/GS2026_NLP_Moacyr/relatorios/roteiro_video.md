# Roteiro do vídeo — NLP / Chatbot Edifícios Verdes (até 5 min)

**GS 2026.1 — Space Connect**
Aluno: Moacyr Cabral da Silva — RM 559263
Disciplina: Processamento de Linguagem Natural, Chatbots & Virtual Agents

> Gravar **depois** de rodar o notebook no Colab (precisa das métricas reais e do
> chatbot ajustado funcionando). Publicar no YouTube como **Não Listado** e anotar o
> link no README e no relatório integrador da Governança.

## Estrutura

| Tempo | Bloco | O que falar | O que mostrar na tela |
|---|---|---|---|
| 0:00–0:25 | Identificação | Nome, RM, disciplina, projeto Space Connect; esta é a camada de NLP — um chatbot especialista em edifícios verdes e Net Zero de energia e água. | Slide título + nome + tema |
| 0:25–1:00 | Problema | LLMs generalistas conhecem LEED/AQUA-HQE/Net Zero só superficialmente e erram requisitos normativos. Objetivo: incorporar o conhecimento do domínio nos pesos via fine-tuning, não só consultar. | Trecho do enunciado + exemplo de pergunta normativa |
| 1:00–1:40 | Corpus e preparação | 14 documentos técnicos em 3 categorias (certificação, relatórios, manuais), equilíbrio água/energia. Mostrar metadata.json. Citar a dificuldade real: descarte do BEN da EPE por ser PDF escaneado. | `corpus/metadata.json` + relatório de limpeza |
| 1:40–2:20 | Chunking, embeddings, Q&A | Chunks ~512 tokens com 25% de overlap, embeddings e5-large, ChromaDB. Pares Q&A gerados pelo próprio Llama 3B em modo extrativo + verificação anti-alucinação. | Relatório de chunks + `relatorios/qa_geracao.md` |
| 2:20–3:10 | Fine-tuning QLoRA | Llama 3.2 3B em 4-bit, adaptador LoRA (r=16, alpha=32, lr=2e-4, 2 épocas) em GPU T4. Mostrar a célula de treino rodando e a perda caindo. | Notebook §6 em execução (loss) |
| 3:10–4:05 | Avaliação base vs. ajustado | 10 perguntas técnicas. BERTScore F1: base **0,6898** → ajustado **0,7123** (Δ **+0,0225**), com loss caindo de 2,66 a 0,70. Ser honesto: o ganho é de estilo/aderência ao domínio; persistem erros factuais (NBR, LEED). | Notebook §7 + `avaliacao_resultado.json` |
| 4:05–4:40 | Chatbot ao vivo | Rodar a célula de chat do notebook (§8): 2 perguntas encadeadas mostrando o **histórico de sessão** (memória multi-turno). | Notebook §8 (célula de chat) |
| 4:40–5:00 | Análise crítica + encerramento | Limitação principal: dados sintéticos do próprio 3B → erros factuais; melhoria nº1 = gerador mais forte + RAG. Como entra no Space Connect (eficiência hídrica/energética transferível a estações remotas). Agradecer. | Slide final + link GitHub |

## Notas de gravação

- 5 min ≈ 600–700 palavras: ~70–80 palavras por bloco. Não enrolar na intro.
- Mostrar o notebook **em execução** (treino e avaliação) — autenticidade conta mais que slide.
- Áudio limpo é prioridade sobre câmera. Voz + tela é o formato mais rápido de gravar.
- A célula de chat (§8) carrega rápido porque reaproveita o modelo já em memória — rode o notebook todo antes de gravar.
- **Tom:** assumir os erros factuais com naturalidade é ponto forte, não fraqueza — o enunciado pede análise crítica das falhas (Etapa 8).

## Pendências

- [x] Rodar o notebook no Colab e anotar BERTScore real: base 0,6898 / ajustado 0,7123 / Δ +0,0225.
- [ ] Gravar, publicar como "Não Listado" no YouTube, anotar link no README e no relatório da Governança.
