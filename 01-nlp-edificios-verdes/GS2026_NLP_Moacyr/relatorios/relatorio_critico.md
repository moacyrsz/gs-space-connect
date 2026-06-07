# Relatório Crítico — Chatbot Especialista em Edifícios Verdes / Net Zero

**GS 2026.1 — Space Connect · Disciplina de NLP**
**Aluno:** Moacyr Cabral da Silva — RM 559263

> **Nota de preenchimento:** as seções 2 e 3 contêm campos marcados com `‹preencher
> após o Colab›`. Eles dependem dos números reais produzidos pela execução do
> notebook (BERTScore e respostas geradas) e devem ser preenchidos com os valores de
> `relatorios/avaliacao_resultado.json` — não estimar.

---

## 1. Dificuldades na coleta e preparação dos dados

**Documento digitalizado no corpus.** O candidato inicial de relatório técnico de
energia — o *Balanço Energético Nacional* da EPE — revelou-se um PDF digitalizado
(imagens de infográficos), com extração de apenas ~35 caracteres por página contra
1.500–2.400 dos demais. Como o enunciado pede que se preservem tabelas e requisitos
numerados, e um texto desse tipo só entraria via OCR de baixa qualidade, o documento
foi **descartado** e o corpus seguiu com 14 documentos (acima do mínimo de 10, com as
três categorias mantidas). Lição: a verificação de um PDF não pode parar no HTTP 200 e
no *content-type*; é preciso medir a densidade de texto extraível antes de aceitá-lo.

**Desequilíbrio de volume entre documentos.** O Manual de Engenharia Fotovoltaica
(CRESESB, 530 páginas) sozinho gera ~495 passagens — quase um terço do corpus —, o que
enviesaria os pares de treino para energia solar. Mitigação: a geração de Q&A aplica um
**teto por documento** (amostragem espaçada de no máximo 60 passagens/documento), para
que normas de água e certificações não fossem ofuscadas.

**Ruído estrutural dos PDFs técnicos.** Cabeçalhos/rodapés repetidos, numeração de
página e hifenização de fim de linha exigiram limpeza. O cuidado central foi **não
remover requisitos normativos numerados** (ex.: "4.39 Edificação de energia quase
zero"), que à primeira vista parecem numeração de página mas carregam o conteúdo
técnico. A regra de limpeza distingue "linha só com dígitos" de "item normativo".

**Escolha do gerador dos pares Q&A.** Optou-se por gerar os pares com o **próprio
Llama 3.2 3B** (sem LLM externo). O risco conhecido é a circularidade — treinar o
modelo nas suas próprias saídas — e a alucinação de números normativos. Mitigação
adotada: geração **extrativa e grounded** (temperatura 0.3, ancorada em cada passagem)
e uma **verificação anti-alucinação** que descarta respostas cujos números/percentuais
não aparecem na passagem de origem. O total de pares rejeitados por essa verificação
está em `relatorios/qa_geracao.md` e é, por si, um indicador da propensão do modelo
base a inventar.

## 2. Impacto do fine-tuning (modelo base vs. ajustado)

A avaliação (notebook §7) compara as respostas do modelo base e do ajustado às mesmas
10 perguntas técnicas (`relatorios/perguntas_referencia.json`), cobrindo energia, água
e certificações.

- **BERTScore F1 — base:** `‹preencher após o Colab›`
- **BERTScore F1 — ajustado:** `‹preencher após o Colab›`
- **Δ (ajustado − base):** `‹preencher após o Colab›`

**Análise qualitativa esperada e a confirmar:** o ganho deve concentrar-se nas
perguntas de **requisito normativo** (definição de NZEB com o critério de 50%, fins não
potáveis da NBR 15527, níveis do LEED), onde o modelo base tende a respostas vagas ou a
trocar números. Em perguntas conceituais amplas (ex.: "o que é irradiação solar"), a
diferença tende a ser menor, pois o conhecimento já existe no modelo base. `‹substituir
por exemplos reais de 2–3 pares de respostas após o Colab›`

## 3. Análise das métricas

O **BERTScore** foi escolhido em vez de BLEU/ROUGE-L por operar no espaço de embeddings
semânticos — mais adequado a respostas técnicas em português, que podem estar corretas
com fraseado diferente da referência. Limitação da métrica: ela mede **similaridade
semântica com a referência**, não **correção factual**; uma resposta fluente mas com um
número errado pode pontuar alto. Por isso a leitura quantitativa é acompanhada da
análise qualitativa caso a caso. `‹comentar os casos de maior e menor F1 após o Colab›`

## 4. Limitações do modelo ajustado

- **Escala do modelo (3B):** capacidade de raciocínio e retenção factual limitadas;
  perguntas que exigem cruzar vários requisitos podem produzir respostas incompletas.
- **Cobertura do corpus:** 14 documentos não esgotam o domínio; temas pouco
  representados (ex.: BEMS/automação predial, detalhes da NBR 15575) terão respostas
  mais fracas.
- **Origem sintética dos pares:** apesar da verificação anti-alucinação, pares gerados
  pelo próprio modelo base podem propagar simplificações.
- **Sem garantia de rastreabilidade no modo puro:** o fine-tuning incorpora
  conhecimento nos pesos, mas não cita a fonte; a rastreabilidade só aparece quando o
  RAG opcional é ativado no chatbot.

## 5. Melhorias propostas (com mais tempo/recursos)

1. **Gerador de Q&A mais forte + curadoria humana.** Gerar os pares com um modelo maior
   (ex.: Llama 70B via provedor) e revisar manualmente uma amostra maior reduziria a
   circularidade e elevaria a qualidade factual do conjunto de treino.
2. **RAG como padrão (não opcional) + avaliação de fidelidade.** Tornar o RAG o modo
   padrão do chatbot e medir *faithfulness*/groundedness (resposta ancorada nos trechos
   recuperados), unindo o conhecimento incorporado pelo fine-tuning à rastreabilidade
   das fontes — exatamente o tipo de auditoria que a disciplina de Governança valoriza.
3. *(extra)* **Expandir o corpus com a NBR 15575 e material de BEMS** e re-treinar, para
   cobrir as lacunas identificadas na seção 4.
