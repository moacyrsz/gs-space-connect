# GS 2026.1 — SpaceTrain Energy

**Disciplina:** Cluster Computing, Computação Neuromórfica e Supercomputadores
**Atividade:** GS - Computação Neuromórfica e Cluster
**Aluno:** Moacyr Cabral da Silva — RM 559263
**Entrega:** 2026-06-09

---

## 1. Cenário escolhido

Estação de monitoramento de risco crítico em campo, ligada à plataforma **Space Connect** descrita em [`00-cenario/cenario.md`](../00-cenario/cenario.md). A estação combina dados orbitais (NASA POWER, INPE) com leituras locais de temperatura, radiação, perda de comunicação, variação de energia, atraso de sinal e índice de poeira. O modelo deve sinalizar quando o conjunto de leituras configura risco crítico (queimada iminente, falha em estação remota terrestre ou em ambiente extremo análogo a missão lunar/marciana).

A relevância está em três pontos: a estação opera em borda, com restrição energética; a decisão precisa ser rápida (alerta acionável); e o mesmo modelo precisa escalar de protótipo até constelação global de sensores quando integrado a uma operação multi-país de monitoramento ambiental.

## 2. Tabela 1 — Resultados dos três jobs

Os valores abaixo vêm da execução do notebook `Colab_SpaceTrain_Energy.ipynb` (sem alterar o dataset), com 300 registros simulados (5 horas, um por minuto) e fórmula didática `Energia (pJ) = 640 × RAM + 5 × Registradores + 10 × ULA`.

| Job | Features | Épocas | Forwards | RAM | Registradores | ULA | Energia treino (pJ) | Acurácia teste |
|---|---|---|---|---|---|---|---|---|
| A — Edge espacial simples | 2 | 8 | 1.680 | 15.120 | 20.160 | 25.200 | 10.029.600 | 0,944 |
| B — Operação Terra-espaço | 4 | 15 | 3.150 | 47.250 | 56.700 | 72.450 | 31.248.000 | 0,978 |
| C — Escala ampliada | 6 | 25 | 5.250 | 110.250 | 126.000 | 162.750 | 72.817.500 | 1,000 |

Treino com 210 amostras e teste com 90 amostras em todos os jobs (split fixo 70/30).

## 3. Tabela 2 — Projeção de escala e decisão de infraestrutura

| Escala | Amostras | Épocas | Energia A (pJ) | Infra A | Energia B (pJ) | Infra B | Energia C (pJ) | Infra C |
|---|---|---|---|---|---|---|---|---|
| Protótipo didático | 10.000 | 20 | 1,19 × 10⁹ | Máquina local | 1,98 × 10⁹ | Máquina local | 2,77 × 10⁹ | Máquina local |
| Operação regional | 200.000 | 50 | 5,97 × 10¹⁰ | Workstation/GPU | 9,92 × 10¹⁰ | Workstation/GPU | 1,39 × 10¹¹ | Workstation/GPU |
| Constelação global | 10.000.000 | 100 | 5,97 × 10¹² | Cluster | 9,92 × 10¹² | Cluster | 1,39 × 10¹³ | Cluster |
| Missão massiva | 100.000.000 | 200 | 1,19 × 10¹⁴ | Supercomputador / revisão neuromórfica | 1,98 × 10¹⁴ | Supercomputador / revisão neuromórfica | 2,77 × 10¹⁴ | Supercomputador / revisão neuromórfica |

## 4. Respostas às perguntas obrigatórias

**1. Qual cenário foi escolhido e por que é relevante?**
Estação de monitoramento de risco crítico em campo, integrada à plataforma Space Connect. A relevância vem da exigência energética em borda, do tempo de resposta curto exigido pelo alerta e da necessidade de escalar para uma constelação global no horizonte da operação.

**2. Qual job consumiu mais energia no treinamento?**
O job C (72.817.500 pJ) — 7,3 vezes mais que o job A. O salto vem da combinação de mais features (6 vs. 2), mais épocas (25 vs. 8) e dos efeitos cruzados nas operações da ULA (cada amostra força mais multiplicações, somas parciais e atualizações de gradiente). RAM e registradores também escalam aproximadamente linearmente com features × épocas.

**3. O aumento da energia parece estar mais ligado ao número de variáveis, ao número de épocas ou à escala de amostras?**
No experimento atual, o número de amostras é fixo (210 em treino), portanto o crescimento depende de variáveis e épocas. Em todos os jobs vale a relação `energia ≈ k × n_features × épocas × n_amostras_treino`. Quando a projeção de escala entra (Tabela 2), o produto `amostras × épocas` domina: a missão massiva (100M × 200) é 4,76 milhões de vezes mais cara que o treino de 210 × 25 do job C, mesmo mantendo o número de features.

**4. Em qual escala a solução deixa de ser adequada para máquina local?**
Já na operação regional (200.000 amostras × 50 épocas) os três jobs ultrapassam o limite de 10¹⁰ pJ e exigem workstation/GPU. Para o job C, o protótipo didático (2,77 × 10⁹ pJ) ainda cabe em máquina local; para B e A também.

**5. Em qual escala aparece a necessidade de workstation/GPU, cluster ou supercomputador?**
- Workstation/GPU: operação regional (10¹⁰–10¹² pJ) para todos os jobs.
- Cluster: constelação global (10¹²–10¹⁴ pJ) para todos os jobs.
- Supercomputador / revisão neuromórfica: missão massiva (≥10¹⁴ pJ) para todos os jobs.

**6. O principal gargalo está apenas na ULA ou também no movimento de dados entre memória, registradores e processamento?**
Está no movimento de dados. Multiplicando os pesos didáticos: para o job C, 640 × 110.250 = 70,56 × 10⁶ pJ vêm de RAM, 5 × 126.000 = 0,63 × 10⁶ pJ vêm de registradores e 10 × 162.750 = 1,63 × 10⁶ pJ vêm da ULA. Mais de 96% da energia vem dos acessos à memória — exatamente o gargalo de von Neumann que motiva computação neuromórfica e processamento próximo à memória.

**7. Que estratégia recomendaria para reduzir custo energético sem perder a utilidade da solução?**
Filtrar dados na borda antes de enviar para treinamento. Como o gargalo é movimento de dados, evitar transportar leituras sem evento crítico para o cluster reduz acessos à RAM em ordens de magnitude, sem perder casos relevantes (a classe `risco_critico` representa 27% do dataset). Combinada a uma seleção de features mais ricas (a saturação de acurácia ocorreu já no job B, com F=4 e ε=15), o sistema mantém qualidade com energia ~2× menor que o job C.

**8. Apenas mais infraestrutura ou também revisão arquitetural?**
Revisão arquitetural. Escalar para missão massiva exige supercomputador *ou* arquitetura neuromórfica/processamento de borda — o limite de 10¹⁴ pJ é atingido em qualquer um dos três jobs nessa escala. Adicionar mais GPUs ataca a ULA (4% da energia); reduzir movimento de dados ataca a RAM (96%). A revisão é mais alavancada que a expansão de infraestrutura.

## 5. Estratégia de redução de custo

**Estratégia escolhida: filtragem na borda + treino menos frequente.** A leitura é feita pelo dispositivo a cada minuto, mas o envio para o pipeline central só ocorre quando a janela móvel de 5 minutos cruza um threshold composto de temperatura, perda de comunicação e radiação. Treinos completos passam a ocorrer apenas semanalmente, com retreino incremental sobre o adaptador, em vez de retreino full do zero. O ganho energético combina três efeitos: (i) menos amostras movidas da memória para a ULA, atacando o gargalo de von Neumann que respondeu por 96% da energia nos jobs; (ii) menos épocas por ciclo, aproveitando que a curva de acurácia satura entre B e C; (iii) menor dependência de hardware caro — operação regional cabe em workstation/GPU em vez de cluster. A contrapartida é a defasagem entre o evento e o retreino do modelo, mitigável por uma camada de regras determinísticas para alertas críticos imediatos.

## 6. Evidência de execução

Saída completa do notebook reproduzida em [`execucao_log.txt`](execucao_log.txt). Tabelas 1 e 2 também exportadas em [`resultado_jobs.csv`](resultado_jobs.csv) e [`resultado_escala.csv`](resultado_escala.csv).

Trecho do resumo automático impresso pelo Passo 7 do notebook:

```
A - Edge espacial simples: features=2, épocas=8, RAM=15120, Registradores=20160, ULA=25200, energia=10029600 pJ, acurácia=0.944
B - Operação Terra-espaço: features=4, épocas=15, RAM=47250, Registradores=56700, ULA=72450, energia=31248000 pJ, acurácia=0.978
C - Escala ampliada: features=6, épocas=25, RAM=110250, Registradores=126000, ULA=162750, energia=72817500 pJ, acurácia=1.000
```

## 7. Recomendação final

Para o cenário Space Connect, manter o treino na configuração do **job B em workstation/GPU** quando a operação for regional (200.000 amostras, 50 épocas): cabe em 9,92 × 10¹⁰ pJ, atinge 0,978 de acurácia e fica abaixo do limite de cluster. Quando a operação escalar para constelação global, migrar para cluster e adotar filtragem na borda para evitar o salto para supercomputador na missão massiva. A revisão neuromórfica entra como roadmap de médio prazo se a missão massiva se concretizar.
