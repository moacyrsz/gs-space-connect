# Relatório Crítico — Chatbot Especialista em Edifícios Verdes / Net Zero

**GS 2026.1 — Space Connect · Disciplina de NLP**
**Aluno:** Moacyr Cabral da Silva — RM 559263

> Execução de referência: Google Colab (GPU T4), 942 pares de treino, fine-tuning
> QLoRA de 112 passos (2 épocas), loss de treino 2,66 → 0,70. Resultados completos em
> `relatorios/avaliacao_resultado.json`.

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

| Modelo | BERTScore F1 |
|---|---|
| Base (Llama 3.2 3B, sem ajuste) | **0,6898** |
| Ajustado (QLoRA) | **0,7123** |
| **Δ (ajustado − base)** | **+0,0225** |

O fine-tuning produziu um **ganho consistente e na direção esperada**: as respostas do
modelo ajustado ficaram semanticamente mais próximas das referências escritas pelo
aluno. O ganho é **modesto em magnitude** (+2,25 pontos de F1), compatível com o que se
pode esperar de um adaptador LoRA sobre um modelo de 3B treinado com ~900 pares
sintéticos — e a curva de perda caindo de 2,66 para 0,70 confirma que houve
aprendizado efetivo, sem sinais de divergência.

**Onde o ganho se manifestou (estilo e formato).** O efeito mais visível do ajuste foi
de **aderência ao domínio e ao formato de resposta**: o modelo ajustado responde de
forma mais direta e no registro técnico do corpus, em vez do tom genérico do modelo
base. É isso que o BERTScore captura e premia.

**Onde o ganho NÃO se manifestou (correção factual) — análise honesta.** Inspecionando
as respostas do modelo ajustado uma a uma, persistem **erros factuais graves**, que é
fundamental reconhecer:

- **NBR da água de chuva:** o modelo respondeu *"ABNT NBR 15548"* — o número correto é
  **NBR 15527**. Alucinação de um identificador normativo.
- **Águas cinzas:** respondeu que resultam *"da coleta de águas pluviais e de chuva"* —
  **conceito trocado**: águas cinzas vêm de banho e máquina de lavar; água de chuva é
  outra categoria (água pluvial). O modelo fundiu os dois temas do corpus.
- **Níveis do LEED:** respondeu *"Plata, Prata, Ouro e Diamante"* — os níveis corretos
  são Certified, Silver, Gold e **Platinum**. "Diamante" não existe e há redundância
  ("Plata"/"Prata").
- **NZEB:** a resposta foi curta e circular ("é um critério mínimo de geração
  renovável"), sem chegar ao critério de **50% da demanda anual** que está no corpus.

Ou seja: o ajuste melhorou a **forma** mais do que o **conteúdo factual**. Isso é
coerente com a natureza do treino (ver seção 3 sobre o limite da métrica e seção 4
sobre as causas).

## 3. Análise das métricas

O **BERTScore** foi escolhido em vez de BLEU/ROUGE-L por operar no espaço de embeddings
semânticos — mais adequado a respostas técnicas em português, que podem estar corretas
com fraseado diferente da referência.

**Limitação da métrica, confirmada na prática.** O BERTScore mede **similaridade
semântica com a referência**, não **correção factual** — e este experimento é uma
ilustração didática disso. A resposta sobre a NBR da água de chuva ("ABNT NBR 15548 —
Aproveitamento de água de chuva em edificações") é **lexicalmente quase idêntica** à
referência ("ABNT NBR 15527… aproveitamento de água de chuva… fins não potáveis"):
mesmo tema, mesma estrutura, mesma terminologia. O BERTScore a pontua alto, **apesar do
número da norma estar errado**. Isso explica por que o F1 pode subir (+0,0225) enquanto
erros factuais persistem: a métrica recompensa o modelo por "falar como o corpus",
que foi exatamente o que o fine-tuning ensinou.

**Conclusão metodológica:** para um assistente normativo, BERTScore é um indicador
**necessário mas não suficiente**. Uma avaliação completa exigiria uma verificação
factual dedicada (checar se o número da norma/percentual citado bate com a fonte) — o
que se conecta à melhoria proposta nº 2.

## 4. Limitações do modelo ajustado

- **Circularidade dos dados de treino (causa principal dos erros factuais).** Os pares
  Q&A foram gerados pelo próprio Llama 3.2 3B. A verificação anti-alucinação descarta
  respostas com **números** ausentes na passagem, mas **não valida fatos não-numéricos**
  (qual norma, qual conceito). Assim, erros como trocar NBR 15527 por "15548" ou
  confundir águas cinzas com água de chuva podem entrar no conjunto de treino e ser
  reforçados — o modelo aprende a "soar correto" sem garantia de "ser correto".
- **Escala do modelo (3B):** capacidade de raciocínio e retenção factual limitadas;
  perguntas que exigem cruzar vários requisitos produzem respostas incompletas ou
  circulares (caso do NZEB, em que o modelo não chegou ao critério de 50%).
- **Cobertura e desequilíbrio do corpus:** 14 documentos não esgotam o domínio, e a
  distribuição é desigual (energia domina; só 88 chunks de relatórios técnicos). Temas
  pouco representados terão respostas mais fracas.
- **Sem rastreabilidade da fonte:** o fine-tuning incorpora conhecimento nos pesos, mas
  o modelo não cita de onde tirou a informação — o que agrava o risco quando ele erra,
  pois a resposta errada vem com o mesmo tom de confiança de uma correta.

## 5. Melhorias propostas (com mais tempo/recursos)

1. **Gerador de Q&A mais forte + curadoria humana + verificação factual.** A causa-raiz
   dos erros (seção 4) é a circularidade do treino. Gerar os pares com um modelo maior
   (ex.: Llama 70B via provedor de inferência) e adicionar uma verificação factual que
   valide **nomes de normas e conceitos** (não só números) contra o corpus elevaria
   diretamente a correção — atacando os casos NBR 15527, LEED e águas cinzas.
2. **Acoplar recuperação (RAG) ao modelo ajustado.** O sistema já tem o corpus indexado
   em ChromaDB (`src/retriever.py`). Combinar o modelo ajustado com a recuperação dos
   trechos relevantes a cada pergunta colocaria o número/conceito correto **na frente do
   modelo no momento da resposta**, corrigindo justamente as alucinações observadas, e
   ainda traria **rastreabilidade da fonte** — o tipo de auditoria que a disciplina de
   Governança valoriza. Mediria-se também a *faithfulness* (resposta ancorada no trecho).
3. **Expandir e equilibrar o corpus** (NBR 15575, material de BEMS, mais relatórios
   técnicos para reduzir o desequilíbrio de 88 chunks da categoria) e re-treinar com
   mais épocas sobre um conjunto curado.
