# Cenário da Global Solution 2026.1 — Space Connect

**Aluno:** Moacyr Cabral da Silva — RM 559263
**Curso/Turma:** FIAP — Tecnologia em IA (TIAPR)
**Entrega:** 2026-06-09 23h55

---

## 1. Problema

A nova economia espacial gera um volume crescente de dados orbitais (satélites, sensoriamento remoto, telemetria) que, combinados a sensores terrestres, podem apoiar decisões em tempo real sobre a saúde de ecossistemas naturais. O Brasil, em particular, sofre com queimadas e supressão vegetal em escala continental, e o desafio de transformar imagens de satélite, séries temporais climáticas e leituras locais em alertas acionáveis é simultaneamente técnico, ambiental e econômico.

## 2. Cenário escolhido

**Plataforma integrada de monitoramento de risco de queimadas e degradação vegetal**, alimentada por:

- imagens de satélite (classificação Wildfire / No-Wildfire);
- dados climáticos orbitais (NASA POWER, INPE, Copernicus);
- estação IoT de campo simulada que mede temperatura, umidade, radiação e qualidade do ar;
- documentos técnicos e normativos (relatórios climáticos, normas ambientais, certificações de eficiência);
- automação de coleta de dados de portais públicos.

A plataforma entrega **alerta de risco**, **dashboard de monitoramento**, **assistentes conversacionais** para suporte técnico e **análise comparativa** entre abordagens clássicas e quânticas para classificação de eventos críticos.

## 3. Conexão com o tema "Space Connect"

O cenário fica no centro da Nova Economia Espacial em três eixos:

1. **Dados orbitais aplicados à Terra** — satélites e sensoriamento remoto como fonte primária de evidência ambiental.
2. **Infraestrutura sustentável Terra-espaço** — padrões de eficiência de água e energia (corpus do chatbot NLP) que são pré-requisito tanto para construções terrestres quanto para estações remotas, lunares ou marcianas.
3. **Decisão sob restrição computacional** — análise de custo energético de treino (Neuromórfica) em escalas que vão de protótipo local a missão massiva orbital.

## 4. ODS-alvo

- **ODS 9** — Indústria, inovação e infraestrutura.
- **ODS 11** — Cidades e comunidades sustentáveis.
- **ODS 13** — Ação contra a mudança global do clima.

(ODS 2 e 8 aparecem perifericamente via agronegócio e novos modelos de negócio espacial, mas não são alvo principal.)

## 5. Como cada disciplina entra na plataforma

| Disciplina (nome oficial) | Camada na plataforma |
|---|---|
| Visão Computacional | Classificador de imagens de satélite Wildfire/No-Wildfire (CNN com transfer learning). |
| Generative AI & Advanced Nets | Assistente conversacional RAG sobre documentos espaciais e ambientais (NASA, INPE, IBAMA). |
| Processamento de Linguagem Natural, Chatbots & Virtual Agents | Chatbot especialista em **Edifícios Verdes / Net Zero de Energia e Água** — referência técnica para infraestrutura sustentável aplicável a estações remotas e missões espaciais. |
| Computação Quântica & IA | QML (QSVC/VQC em Qiskit) sobre dados climáticos orbitais; baseline clássico para benchmark. |
| Physical Computing, Embedded AI, Robotics & Cognitive IoT | Estação simulada no Wokwi com ESP32 + sensores ambientais + MQTT + plataforma cloud + ML externo. |
| AI for Robotic Process Automation | Automação web que coleta dados de portais públicos (TerraBrasilis, NASA POWER, Disaster Charter) e gera artefatos para a plataforma. |
| Cluster Computing, Computação Neuromórfica e Supercomputadores | Análise de custo energético do treino (SpaceTrain Energy) e recomendação de infraestrutura por escala (local → GPU → cluster → supercomputador → neuromórfico). |
| Front-end & Mobile Development | Aplicação ReactJS + Vite publicada na Vercel com dashboards, alertas e interface conversacional (dados mockados). |
| Governança em IA e Business Analytics | Documento integrador ABNT 10-15pp + vídeo + repositório, auditando vieses do classificador, rastreabilidade do RAG, riscos do QML e custo do treino. |

## 6. Restrições e decisões

- **Equipe:** 1 integrante (Moacyr).
- **NLP:** corpus mantido em Edifícios Verdes / Net Zero conforme enunciado original.
- **IoT:** simulação em Wokwi.
- **Front-End:** dados mockados aceitos.
- **GenAI:** sem restrição de provedor de LLM.
- **Prazo único:** 2026-06-09 23h55.

## 7. Riscos conhecidos

- **R1.** Disponibilidade de GPU para fine-tuning NLP (LoRA/QLoRA) — plano B é cair para RAG puro reusando pipeline de GenAI.
- **R2.** Janela de 13 dias corridos para 9 disciplinas em modo solo — exige reuso intenso entre disciplinas e versões mínimas viáveis.
- **R3.** Coerência narrativa do NLP (Edifícios Verdes) com o restante (monitoramento ambiental) — costurada via "infraestrutura sustentável Terra-espaço".
