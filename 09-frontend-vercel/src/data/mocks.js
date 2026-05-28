// Dados mockados embasados em referências reais (NASA FIRMS, INPE TerraBrasilis,
// Global Forest Watch). O enunciado da disciplina permite dados simulados.
// Substituir por chamadas reais quando as demais disciplinas estiverem prontas.

export const biomes = [
  { id: 'amazonia', label: 'Amazônia', color: 'oklch(0.62 0.18 145)' },
  { id: 'cerrado', label: 'Cerrado', color: 'oklch(0.78 0.15 90)' },
  { id: 'caatinga', label: 'Caatinga', color: 'oklch(0.74 0.16 60)' },
  { id: 'mata-atlantica', label: 'Mata Atlântica', color: 'oklch(0.65 0.18 160)' },
  { id: 'pampa', label: 'Pampa', color: 'oklch(0.78 0.12 130)' },
  { id: 'pantanal', label: 'Pantanal', color: 'oklch(0.7 0.15 200)' },
]

export const ranges = [
  { id: '24h', label: '24h' },
  { id: '7d', label: '7 dias' },
  { id: '30d', label: '30 dias' },
]

export const initialAlerts = [
  {
    id: 'A-2406-0921',
    severity: 'high',
    source: 'visao',
    biome: 'pantanal',
    region: 'Corumbá — MS',
    coords: [-19.012, -57.654],
    message: 'Classificador detectou padrão wildfire (prob. 0.92)',
    proba: 0.92,
    at: new Date(Date.now() - 13 * 60 * 1000),
  },
  {
    id: 'A-2406-0918',
    severity: 'medium',
    source: 'iot',
    biome: 'cerrado',
    region: 'Estação Cerrado — Brasília, GO',
    coords: [-15.781, -47.929],
    message: 'Temp. 41,2°C + umidade 18% por 12 minutos consecutivos',
    proba: 0.71,
    at: new Date(Date.now() - 28 * 60 * 1000),
  },
  {
    id: 'A-2406-0915',
    severity: 'high',
    source: 'visao',
    biome: 'amazonia',
    region: 'Floresta Amazônica — Marabá, PA',
    coords: [-5.368, -49.117],
    message: 'Pluma de fumaça detectada em recorte 350x350',
    proba: 0.87,
    at: new Date(Date.now() - 42 * 60 * 1000),
  },
  {
    id: 'A-2406-0911',
    severity: 'low',
    source: 'rpa',
    biome: 'cerrado',
    region: 'TerraBrasilis (INPE)',
    coords: [-15.78, -47.93],
    message: 'Novo lote de focos publicado: 312 registros',
    proba: null,
    at: new Date(Date.now() - 67 * 60 * 1000),
  },
  {
    id: 'A-2406-0907',
    severity: 'medium',
    source: 'visao',
    biome: 'caatinga',
    region: 'Caatinga — Petrolina, PE',
    coords: [-9.389, -40.503],
    message: 'Recorte com baixa cobertura vegetal — risco moderado',
    proba: 0.58,
    at: new Date(Date.now() - 95 * 60 * 1000),
  },
  {
    id: 'A-2406-0902',
    severity: 'low',
    source: 'rpa',
    biome: 'mata-atlantica',
    region: 'NASA POWER — coleta agendada',
    coords: [-22.91, -43.17],
    message: 'Telemetria climática semanal sincronizada',
    proba: null,
    at: new Date(Date.now() - 130 * 60 * 1000),
  },
]

export const sourceLabels = {
  visao: 'Visão Computacional',
  iot: 'Estação IoT',
  rpa: 'Automação RPA',
  qml: 'QML',
  nlp: 'Assistente NLP',
}

export const sourceColors = {
  visao: 'oklch(0.65 0.21 25)',
  iot: 'oklch(0.78 0.18 70)',
  rpa: 'oklch(0.7 0.15 200)',
  qml: 'oklch(0.7 0.18 290)',
  nlp: 'oklch(0.72 0.16 155)',
}

// Série temporal de focos por bioma (últimos 30 dias). Valores na faixa
// observada pelo INPE (programa Queimadas) em meses de pico.
export function buildTimeSeries(days = 30) {
  const series = []
  for (let d = days - 1; d >= 0; d--) {
    const date = new Date(Date.now() - d * 24 * 60 * 60 * 1000)
    const base = 80 + Math.sin(d / 4) * 35 + (days - d) * 2
    series.push({
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      ts: date.getTime(),
      amazonia: Math.round(base * 1.8 + Math.random() * 30),
      cerrado: Math.round(base * 1.4 + Math.random() * 25),
      caatinga: Math.round(base * 0.6 + Math.random() * 12),
      'mata-atlantica': Math.round(base * 0.3 + Math.random() * 8),
      pampa: Math.round(base * 0.2 + Math.random() * 6),
      pantanal: Math.round(base * 0.9 + Math.random() * 18),
    })
  }
  return series
}

export function buildBiomeBars(timeSeries, range = 30) {
  const slice = timeSeries.slice(-range)
  return biomes.map((b) => ({
    biome: b.label,
    biomeId: b.id,
    color: b.color,
    focos: slice.reduce((acc, d) => acc + (d[b.id] || 0), 0),
  }))
}

const round = (v, d = 2) => Number(v.toFixed(d))

export function mockSensorReading() {
  return {
    temperatura: round(28 + Math.random() * 16),
    umidade: round(15 + Math.random() * 50),
    radiacao: round(0.2 + Math.random() * 0.6),
    perdaComunicacao: round(Math.random() * 5),
    indicePoeira: round(0.1 + Math.random() * 0.4),
    co2: round(380 + Math.random() * 80),
    bateria: round(70 + Math.random() * 25, 0),
  }
}

export function buildSensorHistory(reading, points = 24) {
  const series = []
  for (let i = points - 1; i >= 0; i--) {
    const ts = new Date(Date.now() - i * 5 * 60 * 1000)
    series.push({
      ts: ts.getTime(),
      label: ts.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      temperatura: round(reading.temperatura - 2 + Math.random() * 4),
      umidade: round(reading.umidade - 4 + Math.random() * 8),
      radiacao: round(reading.radiacao - 0.05 + Math.random() * 0.1),
    })
  }
  return series
}

export const wildfireSamples = [
  {
    id: 'S-AMZ-001',
    region: 'Floresta Amazônica — Marabá, PA',
    biome: 'amazonia',
    coords: [-5.368, -49.117],
    proba: 0.87,
    label: 'wildfire',
  },
  {
    id: 'S-MA-002',
    region: 'Mata Atlântica — Ubatuba, SP',
    biome: 'mata-atlantica',
    coords: [-23.434, -45.071],
    proba: 0.12,
    label: 'nowildfire',
  },
  {
    id: 'S-CAA-003',
    region: 'Caatinga — Petrolina, PE',
    biome: 'caatinga',
    coords: [-9.389, -40.503],
    proba: 0.74,
    label: 'wildfire',
  },
  {
    id: 'S-CER-004',
    region: 'Cerrado — Goiás, GO',
    biome: 'cerrado',
    coords: [-15.781, -47.929],
    proba: 0.34,
    label: 'nowildfire',
  },
  {
    id: 'S-PAN-005',
    region: 'Pantanal — Corumbá, MS',
    biome: 'pantanal',
    coords: [-19.012, -57.654],
    proba: 0.91,
    label: 'wildfire',
  },
]

const ragKnowledge = [
  {
    keys: ['água', 'agua', 'hídric', 'hidric', 'nbr 15527', 'reuso'],
    sources: ['NBR 15527:2019', 'LEED v4.1 — Water Efficiency'],
    answer:
      'A NBR 15527:2019 estabelece os requisitos para o aproveitamento de água da chuva em coberturas urbanas. Em estações remotas e missões espaciais, os mesmos princípios sustentam sistemas de operação fechada — análogos aos ECLSS (Environmental Control and Life Support Systems) de plataformas orbitais. A categoria *Water Efficiency* do LEED v4.1 cobre redução de consumo, monitoramento e captação alternativa.',
  },
  {
    keys: ['energia', 'ashrae', '90.1', 'iso 50001', 'eficiência', 'eficiencia'],
    sources: ['ASHRAE 90.1-2019', 'NBR 16401-1:2008', 'ISO 50001'],
    answer:
      'A ASHRAE 90.1-2019 e a NBR 16401-1 estabelecem requisitos mínimos de eficiência energética em edificações comerciais. A lógica de envelope térmico, controles e setpoints transfere-se para módulos pressurizados em estações remotas, ajustando a referência ambiental para o pior caso climático local. ISO 50001 dá o framework de gestão de energia para certificação contínua.',
  },
  {
    keys: ['net zero', 'zero net', 'nzeb', 'autossuficien'],
    sources: ['NZEB Definition (DOE/NREL)', 'IEA Annex 52'],
    answer:
      'Net Zero Energy Building (NZEB) exige que a geração local renovável compense o consumo anual. Em missões espaciais o equivalente é o balanço energético do módulo, dimensionado para sobreviver ao pior caso de irradiação solar e ciclos térmicos extremos. Para Net Zero de Água, a referência é descarte zero combinado com captação e reuso integral.',
  },
  {
    keys: ['leed', 'aqua', 'breeam', 'certifica', 'gbc'],
    sources: ['LEED v4.1', 'AQUA-HQE', 'BREEAM International'],
    answer:
      'LEED v4.1, AQUA-HQE, BREEAM e GBC Brasil Casa avaliam categorias como sítio sustentável, eficiência da água, energia, materiais, qualidade ambiental interna e inovação. Estações remotas reaproveitam as métricas de eficiência da água e energia e adicionam restrições de massa de lançamento, materiais resistentes a radiação e operação não tripulada.',
  },
  {
    keys: ['emiss', 'co2', 'carbono', 'gee'],
    sources: ['GHG Protocol', 'IPCC AR6'],
    answer:
      'A contabilidade de emissões em edifícios verdes segue o GHG Protocol (Escopos 1, 2 e 3). Para missões espaciais, a relevância está em emissões de lançamento (Escopo 1) e cadeia de suprimentos de materiais (Escopo 3) — pontos de mitigação são propulsores reutilizáveis e materiais com pegada de carbono incorporada baixa.',
  },
]

export function mockRagAnswer(question) {
  const q = question.toLowerCase()
  for (const entry of ragKnowledge) {
    if (entry.keys.some((k) => q.includes(k))) {
      return { answer: entry.answer, sources: entry.sources }
    }
  }
  return {
    answer:
      'Posso responder sobre normas de eficiência hídrica e energética para edifícios verdes (LEED, AQUA-HQE, BREEAM, ASHRAE 90.1, NBR 15575) e sua aplicabilidade a estações remotas e missões espaciais. Tente reformular a pergunta para um desses tópicos.',
    sources: ['Espaço de conhecimento padrão'],
  }
}

export const ragSuggestions = [
  'Como a NBR 15527 se aplica a estações remotas?',
  'O que muda em ASHRAE 90.1 para módulos pressurizados?',
  'Net Zero de energia funciona em ambiente espacial?',
  'Quais certificações fazem sentido para edifícios verdes?',
  'Como contabilizar emissões em missões espaciais?',
]
