// Dados mockados para o dashboard. O enunciado da disciplina permite
// dados simulados; quando as outras disciplinas estiverem prontas, basta
// substituir as funções aqui por chamadas reais a APIs.

export const initialAlerts = [
  {
    id: 1,
    severity: 'high',
    source: 'visao',
    region: 'Pantanal — MS',
    coords: '-19.012, -57.654',
    message: 'Classificador detectou padrão wildfire (prob. 0.92)',
    at: '14:02',
  },
  {
    id: 2,
    severity: 'medium',
    source: 'iot',
    region: 'Estação Cerrado — GO',
    coords: '-15.781, -47.929',
    message: 'Temperatura 41,2°C + umidade 18% por 12 minutos',
    at: '13:47',
  },
  {
    id: 3,
    severity: 'low',
    source: 'rpa',
    region: 'TerraBrasilis (INPE)',
    coords: '—',
    message: 'Novo lote de focos publicado: 312 registros',
    at: '13:31',
  },
]

export const mockSamples = [
  { id: 'S-001', region: 'Floresta Amazônica — PA', proba: 0.87, label: 'wildfire' },
  { id: 'S-002', region: 'Mata Atlântica — SP', proba: 0.12, label: 'nowildfire' },
  { id: 'S-003', region: 'Caatinga — BA', proba: 0.74, label: 'wildfire' },
  { id: 'S-004', region: 'Cerrado — GO', proba: 0.34, label: 'nowildfire' },
  { id: 'S-005', region: 'Pampa — RS', proba: 0.06, label: 'nowildfire' },
]

const round = (v, d = 2) => Number(v.toFixed(d))

export function mockSensorReading() {
  return {
    temperatura: round(28 + Math.random() * 16),
    umidade: round(15 + Math.random() * 50),
    radiacao: round(0.2 + Math.random() * 0.6),
    perdaComunicacao: round(Math.random() * 5),
    indicePoeira: round(0.1 + Math.random() * 0.4),
  }
}

const cannedAnswers = {
  default:
    'Posso responder sobre normas de eficiência hídrica e energética para edifícios verdes (LEED, AQUA-HQE, BREEAM, ASHRAE 90.1, NBR 15575) e sua aplicabilidade a estações remotas e missões espaciais. Reformule a pergunta para um destes tópicos.',
  agua:
    'A NBR 15527 trata do aproveitamento de água da chuva em coberturas urbanas. Para estações remotas, princípios de captação e reuso aproximam o sistema de operação fechada (similar ao ECLSS de missões orbitais).',
  energia:
    'A ASHRAE 90.1 e a NBR 16401-1 estabelecem requisitos mínimos de eficiência energética em edificações. A lógica de envelope térmico, controles e setpoints transfere-se para módulos pressurizados em estações remotas, ajustando a referência ambiental externa.',
  netzero:
    'Net Zero de Energia exige que a geração local renovável compense o consumo anual. Em missões espaciais, o equivalente é o balanço energético do módulo, dimensionado para sobreviver ao pior caso de irradiação solar e ciclos térmicos extremos.',
  certificacao:
    'LEED v4.1, AQUA-HQE e GBC Brasil Casa avaliam categorias como sítio sustentável, eficiência da água, energia, materiais, qualidade ambiental interna e inovação. Estações remotas reaproveitam a métrica de eficiência da água e energia, e adicionam restrições de massa de lançamento.',
}

export function mockRagAnswer(question) {
  const q = question.toLowerCase()
  if (q.includes('água') || q.includes('agua') || q.includes('hidri')) return cannedAnswers.agua
  if (q.includes('energia') || q.includes('ashrae') || q.includes('iso 50001')) return cannedAnswers.energia
  if (q.includes('net zero') || q.includes('zero')) return cannedAnswers.netzero
  if (q.includes('leed') || q.includes('aqua') || q.includes('certifica')) return cannedAnswers.certificacao
  return cannedAnswers.default
}
