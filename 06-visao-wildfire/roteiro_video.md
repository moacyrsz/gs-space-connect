# Roteiro do vídeo — Visão Computacional (até 3 min)

**GS 2026.1 — Space Connect**
Aluno: Moacyr Cabral da Silva — RM 559263

## Estrutura

| Tempo | Bloco | O que falar | O que mostrar na tela |
|---|---|---|---|
| 0:00–0:20 | Identificação | Nome, RM, disciplina, projeto Space Connect, e que esta é a camada de Visão Computacional da plataforma integrada. | Slide com título + nome + tema |
| 0:20–0:50 | Problema | Monitoramento de queimadas e supressão vegetal em escala continental, sensoriamento remoto via satélite como fonte primária de evidência. | Imagem do dataset (Wildfire vs. No-Wildfire lado a lado) |
| 0:50–1:20 | Dataset e estratégia | Wildfire Prediction Dataset do Kaggle, ~42.850 imagens 350x350 em duas classes, divisão 70/15/15. Subset de 20% para a primeira rodada com `random.seed(42)`. | Saída da célula de EDA com contagens por classe |
| 1:20–1:50 | Modelo | Transfer learning com MobileNetV2 (base congelada + head Dropout+Dense), 5 épocas iniciais + 3 de fine-tuning leve, augmentação simples (flip, rotação, zoom). | Diagrama do modelo + `model.summary()` |
| 1:50–2:20 | Resultados | Acurácia, precisão, recall, F1, AUC. Citar matriz de confusão com ênfase em falsos negativos (áreas de risco perdidas). [PREENCHER NÚMEROS REAIS APÓS RODAR] | Curva ROC + matriz de confusão |
| 2:20–2:50 | Integração | Como o classificador entra na plataforma Space Connect: API consumida pelo front-end, cruzamento com IoT, alerta acionável no dashboard. | Diagrama da arquitetura integrada (do `00-cenario/cenario.md`) |
| 2:50–3:00 | Encerramento | Limitações (binário, sem localização), próximos passos (Grad-CAM, dataset 100%), agradecimento. | Slide final com link do GitHub |

## Notas de gravação

- Manter ritmo. 3 min é curto: ler em ritmo natural rende ~360 palavras → cada bloco precisa de no máximo 50 palavras.
- Mostrar o notebook em execução em pelo menos um momento (autenticidade > slide bonito).
- Áudio limpo > câmera. Pode gravar em loop até soar natural.

## Pendências

- [ ] Substituir [PREENCHER NÚMEROS REAIS] por valores reais do treino.
- [ ] Decidir entre webcam + tela ou só voz + tela. Voz + tela é mais rápido de gravar.
