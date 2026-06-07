# Etapa 3 — Relatório de geração de pares Q&A

Geração executada no Google Colab (GPU T4), a partir do corpus limpo, com o próprio
modelo base.

- **Total de pares gerados:** 942
- **Divisão para o fine-tuning:** 894 treino / 48 validação (split 95/5, `seed=42`)
- **Modelo gerador:** `meta-llama/Llama-3.2-3B-Instruct` (o próprio modelo base)
- **Estratégia:** geração **extrativa e grounded** por passagem do corpus, temperatura
  0,3 — o modelo extrai perguntas cujas respostas estão no texto, atuando como extrator
  e não como fonte de conhecimento.
- **Contexto de geração:** modelo carregado com janela de 2048 tokens; passagens de
  ~480 tokens (no tokenizer do Llama) para caber prompt + resposta sem truncamento.

## Filtros de qualidade aplicados

Cada par candidato passou por:

1. **Verificação anti-alucinação** (`grounded()` em `src/gerar_qa.py`): descarta a
   resposta se algum número substantivo (percentual, valor, número de norma) não
   aparecer na passagem de origem.
2. **Tamanho mínimo:** respostas com menos de 30 caracteres são descartadas.
3. **Anti-repetição:** descarta respostas que apenas repetem a pergunta (Jaccard alto).
4. **Deduplicação:** descarta perguntas quase idênticas a outra já aceita (Jaccard > 0,85).

## Amostragem balanceada

Para evitar que documentos extensos dominem o conjunto (o Manual Fotovoltaico do
CRESESB sozinho gera ~495 passagens), aplicou-se um **teto de 60 passagens por
documento**, com amostragem espaçada — preservando a representação de normas de água e
certificações frente aos manuais de energia.

> Observação: a distribuição fina por categoria/tipo é impressa pela célula de geração
> no notebook executado (`notebooks/finetuning_llama_qlora.ipynb`) e salva em
> `data/pares_qa.jsonl` no ambiente Colab. Os números-chave da execução de referência
> (942 pares, split 894/48) estão consolidados acima e no relatório crítico.
