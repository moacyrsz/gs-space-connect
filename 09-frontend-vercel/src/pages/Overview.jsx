import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts'
import { toast } from 'sonner'
import {
  Flame,
  Wind,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Activity,
  AlertTriangle,
  Cpu,
  Satellite,
  Droplets,
  Workflow,
  Bot,
  Sun,
  Battery,
  Globe2,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ChartTooltip,
  CHART_AXIS_PROPS,
  CHART_CURSOR,
  CHART_GRID_PROPS,
} from '@/components/ChartTooltip'
import KpiCard from '@/components/KpiCard'
import AlertCard from '@/components/AlertCard'
import BiomeFilter from '@/components/BiomeFilter'
import RangeFilter from '@/components/RangeFilter'
import { Link } from 'react-router-dom'
import {
  biomes,
  buildBiomeBars,
  buildSensorHistory,
  buildTimeSeries,
  initialAlerts,
  mockSensorReading,
  sourceColors,
  sourceLabels,
} from '@/data/mocks'
import { cn } from '@/lib/utils'

const sourceIcons = { visao: Satellite, iot: Cpu, rpa: Workflow, qml: Sparkles, nlp: Bot }

function Overview() {
  const [biomeFilter, setBiomeFilter] = useState(null)
  const [range, setRange] = useState('30d')
  const [reading, setReading] = useState(mockSensorReading())
  const [sensorHistory, setSensorHistory] = useState(() =>
    buildSensorHistory(mockSensorReading()),
  )

  useEffect(() => {
    const id = setInterval(() => {
      const r = mockSensorReading()
      setReading(r)
      setSensorHistory(buildSensorHistory(r))
    }, 5000)
    return () => clearInterval(id)
  }, [])

  const timeSeries = useMemo(() => buildTimeSeries(30), [])
  const rangeDays = range === '24h' ? 1 : range === '7d' ? 7 : 30
  const filteredAlerts = useMemo(
    () =>
      biomeFilter == null
        ? initialAlerts
        : initialAlerts.filter((a) => a.biome === biomeFilter),
    [biomeFilter],
  )
  const biomeBars = useMemo(() => buildBiomeBars(timeSeries, rangeDays), [timeSeries, rangeDays])
  const totalFocos = biomeBars.reduce((acc, b) => acc + b.focos, 0)
  const ativos = filteredAlerts.length
  const criticos = filteredAlerts.filter((a) => a.severity === 'high').length

  const sparklineSeries = (key) =>
    timeSeries.slice(-rangeDays).map((d) => ({ v: d[key] || 0 }))

  // Top regiões = ordena alertas por proba/severidade e pega as 4 primeiras
  const topRegions = useMemo(() => {
    const score = { high: 100, medium: 60, low: 30 }
    return [...initialAlerts]
      .map((a) => ({ ...a, score: score[a.severity] + (a.proba ?? 0) * 10 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
  }, [])

  // Distribuição por origem
  const sourceDist = useMemo(() => {
    const map = {}
    initialAlerts.forEach((a) => {
      map[a.source] = (map[a.source] ?? 0) + 1
    })
    return Object.entries(map).map(([id, value]) => ({
      id,
      name: sourceLabels[id] ?? id,
      value,
      color: sourceColors[id] ?? 'oklch(0.66 0.018 270)',
    }))
  }, [])

  const isCritical =
    reading.temperatura > 38 || reading.umidade < 22 || reading.radiacao > 0.7

  return (
    <div className="flex flex-col gap-6">
      {/* Hero header */}
      <div className="relative overflow-hidden surface-elev px-6 py-6">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-(--color-vegetation) mr-1.5" />
                Operacional
              </Badge>
              <span className="text-[11px] text-(--color-muted)">
                Última varredura · há 12s
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight gradient-text">
              Visão Geral
            </h1>
            <p className="mt-1 text-sm text-(--color-muted) max-w-xl">
              Cruzamento de dados orbitais, IoT de campo e automação para
              monitorar risco de queimadas e degradação vegetal em tempo
              quase-real.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <RangeFilter value={range} onChange={setRange} />
            <button
              type="button"
              onClick={() =>
                toast.success('Snapshot exportado', {
                  description: 'JSON com KPIs e alertas baixado para downloads',
                })
              }
              className="inline-flex items-center gap-2 rounded-lg border border-(--color-line) bg-(--color-panel-2)/50 px-3 py-1.5 text-xs text-(--color-text-soft) hover:bg-(--color-panel-2) transition-colors"
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              Exportar snapshot
            </button>
          </div>
        </div>
      </div>

      <BiomeFilter value={biomeFilter} onChange={setBiomeFilter} />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Focos detectados"
          value={totalFocos}
          unit="no período"
          delta={12.4}
          sparklineData={sparklineSeries('amazonia')}
          accent="fire"
          icon={Flame}
        />
        <KpiCard
          label="Alertas ativos"
          value={ativos}
          unit={`${criticos} críticos`}
          delta={ativos > 4 ? 8.7 : -3.1}
          sparklineData={sparklineSeries('cerrado')}
          accent="default"
          icon={ShieldAlert}
        />
        <KpiCard
          label="Temp. estação"
          value={reading.temperatura}
          unit="°C"
          delta={reading.temperatura > 38 ? 5.2 : -2.4}
          sparklineData={sensorHistory.map((s) => ({ v: s.temperatura }))}
          accent="fire"
          icon={Sun}
        />
        <KpiCard
          label="Umidade relativa"
          value={reading.umidade}
          unit="%"
          delta={reading.umidade < 25 ? -14.6 : 4.8}
          sparklineData={sensorHistory.map((s) => ({ v: s.umidade }))}
          accent="info"
          icon={Droplets}
        />
      </div>

      {/* Stats secundárias */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatChip
          icon={Globe2}
          label="Biomas monitorados"
          value="6"
          accent="vegetation"
        />
        <StatChip
          icon={Satellite}
          label="Imagens classificadas / dia"
          value="42.857"
          accent="info"
        />
        <StatChip
          icon={TrendingUp}
          label="Acurácia do modelo"
          value="94,2%"
          accent="default"
        />
        <StatChip
          icon={Activity}
          label="Latência p95 inferência"
          value="180 ms"
          accent="purple"
        />
      </div>

      {/* Linha 1: bar chart + pizza origem + top regiões */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <Card className="xl:col-span-7 hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-(--color-fire-high)" />
              Focos por bioma
              <Badge variant="outline" className="ml-auto font-normal">
                últimos {rangeDays} {rangeDays === 1 ? 'dia' : 'dias'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Soma de focos detectados, agregados a partir de imagens de satélite e relatos da automação RPA.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={biomeBars}
                  margin={{ left: -10, right: 8, top: 10, bottom: 0 }}
                >
                  <CartesianGrid {...CHART_GRID_PROPS} />
                  <XAxis
                    dataKey="biome"
                    {...CHART_AXIS_PROPS}
                    interval={0}
                    angle={-12}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis {...CHART_AXIS_PROPS} />
                  <RechartsTooltip
                    cursor={CHART_CURSOR}
                    content={<ChartTooltip unit=" focos" />}
                  />
                  <Bar dataKey="focos" name="Focos" radius={[6, 6, 0, 0]}>
                    {biomeBars.map((entry) => (
                      <Cell key={entry.biomeId} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-5 hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-4 w-4 text-(--color-purple)" />
              Distribuição por origem
            </CardTitle>
            <CardDescription>
              Quem está produzindo os alertas atuais.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sourceDist}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={2}
                      stroke="oklch(0.205 0.022 270)"
                      strokeWidth={2}
                    >
                      {sourceDist.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<ChartTooltip unit=" alertas" />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2 text-xs">
                {sourceDist.map((s) => {
                  const Icon = sourceIcons[s.id] ?? Sparkles
                  const pct = Math.round((s.value / initialAlerts.length) * 100)
                  return (
                    <div key={s.id} className="flex items-center gap-2.5">
                      <span
                        className="h-7 w-7 rounded-md flex items-center justify-center"
                        style={{
                          background: s.color + '26',
                          color: s.color,
                        }}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-(--color-text) truncate">{s.name}</p>
                        <p className="text-(--color-muted)">{pct}% · {s.value} alertas</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Linha 2: line chart histórico + top regiões */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <Card className="xl:col-span-8 hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-(--color-accent)" />
              Tendência diária por bioma
            </CardTitle>
            <CardDescription>
              Série temporal mostrando o ritmo de detecção em cada bioma.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={timeSeries.slice(-rangeDays)}
                  margin={{ left: -10, right: 8, top: 10, bottom: 0 }}
                >
                  <CartesianGrid {...CHART_GRID_PROPS} />
                  <XAxis
                    dataKey="date"
                    {...CHART_AXIS_PROPS}
                    interval={Math.max(0, Math.floor(rangeDays / 8) - 1)}
                  />
                  <YAxis {...CHART_AXIS_PROPS} />
                  <RechartsTooltip
                    cursor={{ stroke: 'oklch(0.4 0.028 270)', strokeDasharray: '3 3' }}
                    content={<ChartTooltip unit=" focos" />}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                    iconType="circle"
                  />
                  {biomes.map((b) => (
                    <Line
                      key={b.id}
                      type="monotone"
                      dataKey={b.id}
                      name={b.label}
                      stroke={b.color}
                      strokeWidth={1.8}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-4 hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-(--color-fire-mid)" />
              Top regiões em risco
            </CardTitle>
            <CardDescription>
              Score combinando severidade e probabilidade.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {topRegions.map((r, idx) => (
              <Link
                key={r.id}
                to="/mapa"
                className="group flex items-start gap-3 rounded-lg border border-(--color-line) bg-(--color-panel-2)/40 p-3 hover:border-(--color-line-strong) hover:bg-(--color-panel-2) transition-colors"
              >
                <span className="font-mono text-[11px] text-(--color-faint) tabular-nums shrink-0 mt-0.5">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-(--color-text) truncate group-hover:text-(--color-accent) transition-colors">
                    {r.region}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={r.severity} className="text-[9px] px-1.5 py-0">
                      {r.severity.toUpperCase()}
                    </Badge>
                    <span className="text-[11px] text-(--color-muted) truncate">
                      {sourceLabels[r.source]}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-(--color-faint) shrink-0 mt-1 group-hover:text-(--color-accent) transition-colors" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Linha 3: alertas + estação IoT */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <Card className="xl:col-span-7 hover-lift">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-(--color-fire-mid)" />
                  Alertas recentes
                </CardTitle>
                <CardDescription>
                  Cruzamento de Visão, IoT e RPA — clique para ver no mapa.
                </CardDescription>
              </div>
              <Link
                to="/mapa"
                className="text-[11px] text-(--color-accent) hover:underline flex items-center gap-1"
              >
                Ver todos <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredAlerts.map((a) => (
                <AlertCard key={a.id} alert={a} />
              ))}
              {filteredAlerts.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
                  <ShieldAlert className="h-8 w-8 text-(--color-faint) mb-2" />
                  <p className="text-sm text-(--color-muted)">
                    Sem alertas para este filtro.
                  </p>
                  <p className="text-[11px] text-(--color-faint) mt-1">
                    Tente "Todos" para voltar a ver todos os biomas.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-5 hover-lift">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-(--color-vegetation)" />
                  Estação IoT — telemetria
                </CardTitle>
                <CardDescription>
                  Wokwi simulado · MQTT broker hivemq · refresh 5s
                </CardDescription>
              </div>
              {isCritical ? (
                <Badge variant="high">Risco crítico</Badge>
              ) : (
                <Badge variant="low">Operação normal</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <ReadingItem label="Temperatura" value={`${reading.temperatura} °C`} />
              <ReadingItem label="Umidade" value={`${reading.umidade} %`} />
              <ReadingItem label="Radiação" value={reading.radiacao} />
              <ReadingItem label="Comunicação" value={`${reading.perdaComunicacao} %`} />
              <ReadingItem label="Poeira" value={reading.indicePoeira} />
              <ReadingItem label="CO₂" value={`${reading.co2} ppm`} />
            </div>

            <div className="h-[80px] -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sensorHistory} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="iotTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.66 0.22 25)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="oklch(0.66 0.22 25)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="temperatura"
                    stroke="oklch(0.66 0.22 25)"
                    strokeWidth={1.6}
                    fill="url(#iotTemp)"
                    isAnimationActive={false}
                  />
                  <RechartsTooltip
                    content={<ChartTooltip unit="°C" />}
                    cursor={{ stroke: 'oklch(0.4 0.028 270)' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <Separator />

            <div className="flex items-center justify-between text-[11px] text-(--color-muted)">
              <span className="flex items-center gap-1.5">
                <Battery className="h-3.5 w-3.5" />
                Bateria{' '}
                <span
                  className={cn(
                    'font-medium',
                    reading.bateria > 60 ? 'text-(--color-vegetation)' : 'text-(--color-fire-mid)',
                  )}
                >
                  {reading.bateria}%
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <Wind className="h-3.5 w-3.5" />
                Estação ESP32 · BR-CER-01
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatChip({ icon: Icon, label, value, accent = 'default' }) {
  const tones = {
    default: 'text-(--color-accent)',
    fire: 'text-(--color-fire-high)',
    vegetation: 'text-(--color-vegetation)',
    info: 'text-(--color-info)',
    purple: 'text-(--color-purple)',
  }
  return (
    <div className="flex items-center gap-3 rounded-lg border border-(--color-line) bg-(--color-panel)/60 px-3.5 py-2.5 hover-lift">
      <span className={cn('flex h-8 w-8 items-center justify-center rounded-md bg-(--color-panel-2)', tones[accent])}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-(--color-muted) truncate">{label}</p>
        <p className="text-sm font-semibold tabular-nums text-(--color-text)">{value}</p>
      </div>
    </div>
  )
}

function ReadingItem({ label, value }) {
  return (
    <div className="flex flex-col rounded-lg border border-(--color-line) bg-(--color-panel-2)/50 px-3 py-2">
      <span className="text-[11px] uppercase tracking-wider text-(--color-muted)">
        {label}
      </span>
      <span className="text-base font-medium tabular-nums">{value}</span>
    </div>
  )
}

export default Overview
