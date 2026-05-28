# 09 — Front-end & Mobile Development

Atividade no portal: **Global Solution Front-end e Mobile Development**.

App ReactJS + Vite que representa a plataforma integrada Space Connect.
Publicado na Vercel com link público (ver seção Deploy abaixo).

## Stack

- ReactJS 19 + Vite 8
- Componentes funcionais, props, `useState`, `useEffect`
- Renderização condicional, listas, eventos
- CSS puro (sem framework de UI)

## Estrutura

```
09-frontend-vercel/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    ├── index.css
    ├── mocks.js
    └── components/
        ├── Header.jsx
        ├── StatusCards.jsx
        ├── AlertsPanel.jsx
        ├── WildfireClassifier.jsx
        ├── IotStation.jsx
        └── RagAssistant.jsx
```

## Componentes

- **Header** — título, data e hora (`useEffect` com `setInterval`).
- **StatusCards** — KPIs com renderização condicional por tom (alto/médio/ok).
- **AlertsPanel** — lista de alertas com botão para dispensar (handler de evento).
- **WildfireClassifier** — seleção de amostra + slider de threshold; dispara alerta para o painel.
- **IotStation** — leitura simulada que atualiza a cada 5 s; aciona alerta quando entra em envelope crítico.
- **RagAssistant** — formulário de pergunta com histórico mockado; respostas canned baseadas em palavras-chave.

## Conexão com o cenário

Este front-end é a camada de visualização da plataforma Space Connect.
Cada componente reflete uma disciplina: Visão Computacional (classificador),
IoT (estação Wokwi), NLP+GenAI (assistente). Os dados são mockados conforme
permitido pelo enunciado.

## Como rodar localmente

```
cd 09-frontend-vercel
npm install
npm run dev
```

Abrir http://localhost:5173.

## Build de produção

```
npm run build
npm run preview
```

## Deploy na Vercel

```
npx vercel login        # autentica via browser (uma vez)
npx vercel --prod       # deploy de produção
```

A primeira execução pergunta o nome do projeto (`space-connect`) e detecta
Vite automaticamente. Saída inclui o link público.

## Entrega

Conforme o enunciado, a entrega é um arquivo `.txt` com:

- Nome e RM do integrante: Moacyr Cabral da Silva — RM 559263
- Link do GitHub: https://github.com/moacyrsz/gs-space-connect
- Link da Vercel: https://space-connect-mu.vercel.app

Ver [`entrega.txt`](entrega.txt).
