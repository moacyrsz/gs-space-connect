# 06 — Visão Computacional

Atividade no portal: **GS - Visão Computacional**.

## Conteúdo

- [`wildfire_classifier.ipynb`](wildfire_classifier.ipynb) — notebook Colab pronto para execução.
- [`build_notebook.py`](build_notebook.py) — gera o `.ipynb` a partir de Python (rodar sempre que editar o conteúdo).
- [`roteiro_video.md`](roteiro_video.md) — roteiro de 3 min para o vídeo de apresentação.

## Como executar

1. Abrir o `wildfire_classifier.ipynb` no Google Colab.
2. Em **Ambiente de execução → Alterar tipo de ambiente de execução → GPU T4**.
3. Executar células em ordem. Quando pedir, fazer upload do `kaggle.json` (gerado em https://www.kaggle.com/settings/account → "Create New Token").
4. Esperar download do dataset (~2 min) e treino (~10–15 min com subset 20%).

## Decisões de modelagem

- **Arquitetura:** MobileNetV2 com transfer learning (base congelada + head + fine-tuning leve dos últimos 30 layers).
- **Subset 20%:** ~8.500 imagens para a primeira rodada (em vez de ~42.850), com `random.seed(42)` para reproducibilidade.
- **Resolução de entrada:** 224×224 (entrada nativa do MobileNetV2; o dataset original é 350×350).
- **Augmentação:** flip horizontal, rotação leve (±0.05) e zoom (±0.1) — apenas no treino.
- **Métricas:** acurácia, precisão, recall, F1, matriz de confusão e ROC AUC; foco analítico em falsos negativos.

## Justificativas alinhadas ao enunciado

- "Uso de modelos pré-treinados é recomendado" — MobileNetV2 é exemplo do próprio enunciado.
- "Falsos negativos representam áreas de risco não identificadas corretamente" — análise de threshold + curva precisão/recall reforça esse ponto.
- "Proposta de integração com solução real" — seção 10 do notebook descreve a integração com a plataforma Space Connect (front-end, IoT, RPA, NLP/GenAI).

## Pendências para a versão final

- Executar no Colab e capturar os números reais (acurácia, AUC, matriz de confusão).
- Atualizar `relatorio.md` (a criar) com os números obtidos.
- Gravar vídeo de 3 min seguindo `roteiro_video.md`.
- Se sobrar tempo: rodar com 100% do dataset.
