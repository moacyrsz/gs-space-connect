# Etapa 4 — Relatorio de chunking e embeddings

- **Total de chunks:** 2523
- **Tamanho medio:** 401 tokens (alvo 512, sobreposicao 25%)
- **Modelo de embedding:** `intfloat/multilingual-e5-large` (1024 dim, normalizado, cosine)
- **Banco vetorial:** ChromaDB persistente, colecao `edificios_verdes`

## Distribuicao por categoria

| categoria | chunks |
|---|---:|
| certificacao | 1292 |
| manual_tecnologia | 1143 |
| relatorio_tecnico | 88 |

## Distribuicao por subcategoria

| subcategoria | chunks |
|---|---:|
| energia | 1402 |
| ambos | 854 |
| agua | 267 |

## Distribuicao por documento

| doc | chunks |
|---|---:|
| A1 | 175 |
| A2 | 303 |
| A3 | 263 |
| A4 | 175 |
| A5 | 376 |
| B2 | 35 |
| B3 | 7 |
| B4 | 34 |
| B5 | 12 |
| C1 | 807 |
| C2 | 87 |
| C3 | 28 |
| C4 | 205 |
| C5 | 16 |

