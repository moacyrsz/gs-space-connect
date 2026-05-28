import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  Cell,
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
  ShieldAlert,
  TrendingUp,
  Activity,
  AlertTriangle,
  Cpu,
  Satellite,
  Droplets,
  Workflow,
  Sparkles,
  Bot,
  Sun,
  Battery,
  Globe2,
  ArrowUpRight,
  ChevronRight,
  Wifi,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

  const topRegions = useMemo(() => {
    const score = { high: 100, medium: 60, low: 30 }
    return [...initialAlerts]
      .map((a) => ({ ...a, score: score[a.severity] + (a.proba ?? 0) * 10 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
  }, [])

  const sourceDist = useMemo(() => {
    const map = {}
    initialAlerts.forEach((a) => {
      map[a.source] = (map[a.source] ?? 0) + 1
    })
    return Object.entries(map).map(([id, value]) => ({
      id,
      name: sourceLabels[id] ?? id,
      value,
      color: sourceColors[id] ?? 'oklch(0.640 0.010 265)',
    }))
  }, [])

  const isCritical =
    reading.temperatura > 38 || reading.umidade < 22 || reading.radiacao > 0.7

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-(--color-faint) font-medium mb-1">
            Dashboard
          </p>
          <h1 className="text-[26px] font-semibold tracking-[-0.01em] text-(--color-text)">
            Visão Geral
          </h1>
          <p className="mt-1 text-[13px] text-(--color-muted) max-w-2xl">
            Cruzamento de dados orbitais, IoT de campo e automação para monitorar
            risco de queimadas e degradação vegetal em tempo quase-real.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RangeFilter value={range} onChange={setRange} />
          <button
            type="button"
            onClick={() =>
              toast.success('Snapshot exportado', {
                description: 'JSON com KPIs e alertas baixado para downloads',
              })
            }
            className="inline-flex items-center gap-1.5 rounded-md border border-(--color-line) px-2.5 py-1 text-[11px] text-(--color-muted) hover:bg-(--color-panel-2) hover:text-(--color-text) transition-colors"
          >
            <ArrowUpRight className="h-3 w-3" />
            Exportar snapshot
          </button>
        </div>
      </div>

      <BiomeFilter value={biomeFilter} onChange={setBiomeFilter} />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
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

      {/* Stats secundárias — estilo Plausible (uppercase tabular) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatRow
          icon={Globe2}
          label="Biomas monitorados"
          value="6"
        />
        <StatRow
          icon={Satellite}
          label="Imagens classificadas / dia"
          value="42.857"
        />
        <StatRow
          icon={TrendingUp}
          label="Acurácia do modelo"
          value="94,2%"
        />
        <StatRow
          icon={Activity}
          label="Latência p95 inferência"
          value="180 ms"
        />
      </div>

      {/* Linha 1: bar chart + pizza origem */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        <Card className="xl:col-span-7 hover-lift">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-3.5 w-3.5 text-(--color-danger)" />
                  Focos por bioma
                </CardTitle>
                <CardDescription>
                  Soma agregada do recorte selecionado
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono">
                últimos {rangeDays}d
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={biomeBars}
                  margin={{ left: -10, right: 4, top: 8, bottom: 0 }}
                >
                  <CartesianGrid {...CHART_GRID_PROPS} />
                  <XAxis
                    dataKey="biome"
                    {...CHART_AXIS_PROPS}
                    interval={0}
                    angle={-12}
                    textAnchor="end"
                    height={48}
                  />
                  <YAxis {...CHART_AXIS_PROPS} />
                  <RechartsTooltip
                    cursor={CHART_CURSOR}
                    content={<ChartTooltip unit=" focos" />}
                  />
                  <Bar dataKey="focos" name="Focos" radius={[3, 3, 0, 0]}>
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
              <Workflow className="h-3.5 w-3.5 text-(--color-muted)" />
              Distribuição por origem
            </CardTitle>
            <CardDescription>Quem está produzindo os alertas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sourceDist}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={42}
                      outerRadius={64}
                      paddingAngle={2}
                      stroke="oklch(0.195 0.003 270)"
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
              <div className="flex flex-col gap-1.5 text-[12px]">
                {sourceDist.map((s) => {
                  const Icon = sourceIcons[s.id] ?? Sparkles
                  const pct = Math.round((s.value / initialAlerts.length) * 100)
                  return (
                    <div key={s.id} className="flex items-center gap-2">
                      <span
                        className="h-1.5 w-1.5 rounded-full shrink-0"
                        style={{ background: s.color }}
                      />
                      <Icon className="h-3 w-3 text-(--color-faint) shrink-0" />
                      <span className="text-(--color-text-soft) truncate flex-1">
                        {s.name}
                      </span>
                      <span className="text-(--color-faint) tabular-nums font-mono text-[11px]">
                        {pct}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Linha 2: tendência + top regiões */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        <Card className="xl:col-span-8 hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-(--color-muted)" />
              Tendência diária por bioma
            </CardTitle>
            <CardDescription>
              Série temporal de detecções nas últimas {rangeDays} {rangeDays === 1 ? 'leitura' : 'leituras'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={timeSeries.slice(-rangeDays)}
                  margin={{ left: -10, right: 4, top: 8, bottom: 0 }}
                >
                  <CartesianGrid {...CHART_GRID_PROPS} />
                  <XAxis
                    dataKey="date"
                    {...CHART_AXIS_PROPS}
                    interval={Math.max(0, Math.floor(rangeDays / 8) - 1)}
                  />
                  <YAxis {...CHART_AXIS_PROPS} />
                  <RechartsTooltip
                    cursor={{ stroke: 'oklch(0.310 0.005 270)', strokeDasharray: '3 3' }}
                    content={<ChartTooltip unit=" focos" />}
                  />
                  {biomes.map((b) => (
                    <Line
                      key={b.id}
                      type="monotone"
                      dataKey={b.id}
                      name={b.label}
                      stroke={b.color}
                      strokeWidth={1.4}
                      dot={false}
                      activeDot={{ r: 3, strokeWidth: 0 }}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              {biomes.map((b) => (
                <div key={b.id} className="flex items-center gap-1.5 text-[11px] text-(--color-muted)">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: b.color }} />
                  {b.label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-4 hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-(--color-warning)" />
              Top regiões em risco
            </CardTitle>
            <CardDescription>Score por severidade e probabilidade</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {topRegions.map((r, idx) => (
              <Link
                key={r.id}
                to="/mapa"
                className="group flex items-center gap-3 rounded-md border border-transparent px-2 py-2 hover:border-(--color-line) hover:bg-(--color-panel-2)/40 transition-colors"
              >
                <span className="font-mono text-[11px] text-(--color-faint) tabular-nums shrink-0 w-5">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-(--color-text) truncate">
                    {r.region}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant={r.severity} className="h-4 text-[9px] px-1.5">
                      {r.severity.toUpperCase()}
                    </Badge>
                    <span className="text-[10px] text-(--color-faint) truncate">
                      {sourceLabels[r.source]}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-(--color-faint) shrink-0 group-hover:text-(--color-text) transition-colors" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Linha 3: alertas + estação IoT */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        <Card className="xl:col-span-7 hover-lift">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="h-3.5 w-3.5 text-(--color-warning)" />
                  Alertas recentes
                </CardTitle>
                <CardDescription>
                  Cruzamento de Visão, IoT e RPA
                </CardDescription>
              </div>
              <Link
                to="/mapa"
                className="text-[11px] text-(--color-text-soft) hover:text-(--color-accent) flex items-center gap-1 transition-colors"
              >
                Ver todos <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredAlerts.map((a) => (
                <AlertCard key={a.id} alert={a} />
              ))}
              {filteredAlerts.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
                  <ShieldAlert className="h-7 w-7 text-(--color-faint) mb-2" />
                  <p className="text-[13px] text-(--color-muted)">
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
                  <Cpu className="h-3.5 w-3.5 text-(--color-success)" />
                  Estação IoT — telemetria
                </CardTitle>
                <CardDescription>
                  Wokwi · MQTT hivemq · refresh 5s
                </CardDescription>
              </div>
              {isCritical ? (
                <Badge variant="high">Risco crítico</Badge>
              ) : (
                <Badge variant="low">Normal</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-2 text-[12px]">
              <ReadingItem label="Temp." value={`${reading.temperatura} °C`} />
              <ReadingItem label="Umidade" value={`${reading.umidade}%`} />
              <ReadingItem label="Radiação" value={reading.radiacao} />
              <ReadingItem label="Comm." value={`${reading.perdaComunicacao}%`} />
              <ReadingItem label="Poeira" value={reading.indicePoeira} />
              <ReadingItem label="CO₂" value={`${reading.co2} ppm`} />
            </div>

            <div className="h-[60px] -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sensorHistory} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="iotTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.640 0.180 25)" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="oklch(0.640 0.180 25)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="temperatura"
                    stroke="oklch(0.640 0.180 25)"
                    strokeWidth={1.4}
                    fill="url(#iotTemp)"
                    isAnimationActive={false}
                  />
                  <RechartsTooltip
                    content={<ChartTooltip unit="°C" />}
                    cursor={{ stroke: 'oklch(0.310 0.005 270)' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-[11px] text-(--color-muted) pt-1 border-t border-(--color-line)">
              <span className="flex items-center gap-1.5">
                <Battery className="h-3 w-3" />
                Bateria{' '}
                <span
                  className={cn(
                    'font-medium tabular-nums',
                    reading.bateria > 60 ? 'text-(--color-success)' : 'text-(--color-warning)',
                  )}
                >
                  {reading.bateria}%
                </span>
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[10px]">
                <Wifi className="h-3 w-3" />
                BR-CER-01
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-(--color-line) px-3 py-2.5 hover-lift">
      <Icon className="h-3.5 w-3.5 text-(--color-faint)" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-(--color-faint) font-medium truncate">
          {label}
        </p>
        <p className="text-[14px] font-semibold tabular-nums text-(--color-text)">
          {value}
        </p>
      </div>
    </div>
  )
}

function ReadingItem({ label, value }) {
  return (
    <div className="flex flex-col rounded-md border border-(--color-line) px-2.5 py-1.5">
      <span className="text-[9px] uppercase tracking-wider text-(--color-faint) font-medium">
        {label}
      </span>
      <span className="text-[13px] font-medium tabular-nums">{value}</span>
    </div>
  )
}

export default Overview
