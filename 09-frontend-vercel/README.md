# 09 — Front-end & Mobile Development

Atividade no portal: **Global Solution Front-end e Mobile Development**.

Plataforma web Space Connect — visualização integrada de risco de queimadas e degradação vegetal alimentada por dados orbitais e IoT de campo. Aplicação ReactJS + Vite publicada na Vercel.

## Aplicação no ar

**https://space-connect-mu.vercel.app**

Rotas:
- `/` Visão Geral — KPIs, tendência por bioma, alertas recentes, leituras IoT.
- `/mapa` Mapa de Alertas — react-leaflet com tile CARTO Dark, marcadores por severidade, painel de detalhe.
- `/assistente` Assistente Técnico — chat com sugestões e fontes citadas, simula NLP fine-tuned + RAG.

## Stack

| Camada | Tecnologia |
|---|---|
| Bundler | Vite 8 (Rolldown) |
| Framework | React 19 + react-router-dom 7 |
| Estilo | Tailwind CSS 4 (`@tailwindcss/vite`) |
| Design system | shadcn/ui patterns (Button, Card, Badge, Input, Tabs, ScrollArea, Skeleton, Tooltip, Separator) |
| Ícones | lucide-react |
| Gráficos | recharts (Bar, Line, Area sparklines) |
| Mapa | react-leaflet + Leaflet 1.9 + tiles CARTO Dark |
| Utilitários | clsx, tailwind-merge, class-variance-authority, @radix-ui (Slot, Tabs, Tooltip, ScrollArea, Separator) |

## Conceitos React aplicados (conforme enunciado)

| Requisito | Implementação |
|---|---|
| Componentes funcionais | Todas as páginas e componentes em [`src/components/`](src/components) e [`src/pages/`](src/pages) |
| Props | `KpiCard({ label, value, ...})`, `AlertCard({ alert, onSelect })`, `BiomeFilter({ value, onChange })` |
| `useState` | filtros de bioma e janela temporal, leitura corrente, histórico de chat, threshold do classificador |
| `useEffect` | clock global ([`Layout.jsx:30`](src/components/Layout.jsx)) e leitura IoT que atualiza a cada 5 s ([`Overview.jsx:42`](src/pages/Overview.jsx)) |
| Renderização condicional | severidade, estado vazio, presença de probabilidade, mensagem de loading do chat |
| Listas | alertas, biomas, séries temporais, histórico de chat, sugestões |
| Eventos | onClick (filtros, alertas, sugestões), onChange (input/select/slider), onSubmit (chat) |
| Publicação Vercel | `vercel.json` configurado com SPA rewrite |
| README + commits | aqui + repositório com histórico de commits da evolução |

## Decisões visuais embasadas

Paleta, layout e padrões inspirados em referências reais de monitoramento ambiental:

- **NASA FIRMS** — chips 24h/7d/30d, marcadores circulares por severidade, legenda flutuante.
- **INPE TerraBrasilis (Programa Queimadas)** — filtro por bioma como pills, KPIs comparativos por período.
- **Global Forest Watch** — padrão "Big Number Card" (KPI grande + sparkline + delta), painel lateral de alertas.
- **NASA Worldview** — tema dark (zinc-950/zinc-900), basemap satélite-like, hierarquia tipográfica.
- **GitHub: bhumify/disasteralert-dashboard** — estrutura KPIs → mapa → alerts list, severity badge.
- **GitHub: Anuvrat-0707/GeoSentinel** — tema dinâmico orange-fire, badge LIVE pulsante, timer de próxima atualização.

## Estrutura de pastas

```
09-frontend-vercel/
├── index.html
├── package.json
├── vite.config.js          # alias @ → src/, plugins react + tailwindcss
├── jsconfig.json           # path mapping para o IDE
├── vercel.json             # SPA rewrite
├── entrega.txt             # arquivo .txt da entrega FIAP
└── src/
    ├── main.jsx            # BrowserRouter
    ├── App.jsx             # rotas
    ├── index.css           # @theme tokens + leaflet css
    ├── lib/utils.js        # cn + formatters pt-BR
    ├── data/mocks.js       # alertas, biomas, séries, knowledge base RAG
    ├── components/
    │   ├── Layout.jsx           # sidebar + topbar com clock e LIVE
    │   ├── KpiCard.jsx          # KPI com sparkline Recharts
    │   ├── AlertCard.jsx        # cartão de alerta com badge e barra de probabilidade
    │   ├── BiomeFilter.jsx      # pills de bioma
    │   ├── RangeFilter.jsx      # 24h/7d/30d
    │   └── ui/                  # primitivos shadcn (button, card, badge, input, tabs, scroll-area, tooltip, skeleton, separator)
    └── pages/
        ├── Overview.jsx         # 4 KPIs + bar chart + line chart + alerts + IoT
        ├── AlertsMap.jsx        # mapa Leaflet + popup + lista + legenda
        └── Assistant.jsx        # chat com skeleton, sugestões e fontes
```

## Como rodar

```bash
cd 09-frontend-vercel
npm install
npm run dev          # http://localhost:5173
npm run build        # build de produção em dist/
```

## Deploy

```bash
./node_modules/.bin/vercel deploy --prod
```

## Entrega no portal FIAP

`entrega.txt`:

- Nome e RM: Moacyr Cabral da Silva — RM 559263
- GitHub: https://github.com/moacyrsz/gs-space-connect
- Vercel: https://space-connect-mu.vercel.app
