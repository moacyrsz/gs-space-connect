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
  ReferenceLine,
} from 'recharts'
import { toast } from 'sonner'
import {
  Flame,
  ShieldAlert,
  TrendingUp,
  Activity,
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
import ActivityFeed from '@/components/ActivityFeed'
import BiomeFilter from '@/components/BiomeFilter'
import RangeFilter from '@/components/RangeFilter'
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

// Paleta de chart light: mono-cromática queimada para séries categóricas
// (Tremor/Bloomberg-light), com biomas em verdes-terra
const biomePaletteLight = {
  amazonia: '#16A34A',
  cerrado: '#A16207',
  caatinga: '#CA8A04',
  'mata-atlantica': '#15803D',
  pampa: '#65A30D',
  pantanal: '#0E7490',
}

function Overview() {
  const [biomeFilter, setBiomeFilter] = useState(null)
  const [range, setRange] = useState('30d')
  const [reading, setReading] = useState(mockSensorReading())
  const [sensorHistory, setSensorHistory] = useState(() =>
    buildSensorHistory(mockSensorReading()),
  )

  // Crosshair sincronizado entre o LineChart e os sparklines do dia
  const [hoverIndex, setHoverIndex] = useState(null)

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
  const biomeBars = useMemo(
    () =>
      buildBiomeBars(timeSeries, rangeDays).map((b) => ({
        ...b,
        color: biomePaletteLight[b.biomeId] ?? b.color,
      })),
    [timeSeries, rangeDays],
  )
  const totalFocos = biomeBars.reduce((acc, b) => acc + b.focos, 0)
  const ativos = filteredAlerts.length
  const criticos = filteredAlerts.filter((a) => a.severity === 'high').length

  const sparklineSeries = (key) =>
    timeSeries.slice(-rangeDays).map((d) => ({ v: d[key] || 0 }))

  const sourceDist = useMemo(() => {
    const map = {}
    initialAlerts.forEach((a) => {
      map[a.source] = (map[a.source] ?? 0) + 1
    })
    // Cores light: accent + neutros para distribuição
    const lightSourceColors = {
      visao: '#B45309',
      iot: '#0E7490',
      rpa: '#7C3AED',
      qml: '#A16207',
      nlp: '#16A34A',
    }
    return Object.entries(map).map(([id, value]) => ({
      id,
      name: sourceLabels[id] ?? id,
      value,
      color: lightSourceColors[id] ?? '#82827C',
    }))
  }, [])

  const isCritical =
    reading.temperatura > 38 || reading.umidade < 22 || reading.radiacao > 0.7

  const trimmedTimeSeries = timeSeries.slice(-rangeDays)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1.5">
          <p className="label-caps">Dashboard</p>
          <h1 className="heading-display text-[30px] leading-[1.1] text-(--color-text)">
            Visão Geral
          </h1>
          <p className="text-[13px] text-(--color-muted) max-w-2xl leading-relaxed text-balance">
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
            className="inline-flex items-center gap-1.5 rounded-md px-3 h-7 text-[11px] text-(--color-text-soft) border border-(--color-line) bg-(--color-surface) hover:bg-(--color-surface-elevated) hover:border-(--color-line-strong) transition-colors"
          >
            <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
            Exportar snapshot
          </button>
        </div>
      </div>

      <BiomeFilter value={biomeFilter} onChange={setBiomeFilter} />

      {/* KPIs com threshold lines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard
          label="Focos detectados"
          value={totalFocos}
          unit="no período"
          delta={12.4}
          sparklineData={sparklineSeries('amazonia')}
          accent="fire"
          icon={Flame}
          thresholds={{ warning: 0.6, danger: 0.85 }}
        />
        <KpiCard
          label="Alertas ativos"
          value={ativos}
          unit={`${criticos} críticos`}
          delta={ativos > 4 ? 8.7 : -3.1}
          sparklineData={sparklineSeries('cerrado')}
          accent="warning"
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
          accent="vegetation"
          icon={Droplets}
        />
      </div>

      {/* Stats secundárias */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatRow icon={Globe2} label="Biomas monitorados" value="6" />
        <StatRow icon={Satellite} label="Imagens classificadas / dia" value="42.857" />
        <StatRow icon={TrendingUp} label="Acurácia do modelo" value="94,2%" />
        <StatRow icon={Activity} label="Latência p95 inferência" value="180 ms" />
      </div>

      {/* Linha 1: bar chart + Activity Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        <Card className="xl:col-span-8 hover-lift">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Flame
                    className="h-3.5 w-3.5 text-(--color-danger)"
                    strokeWidth={1.5}
                  />
                  Focos por bioma
                </CardTitle>
                <CardDescription>Soma agregada do recorte selecionado</CardDescription>
              </div>
              <Badge variant="outline" style={{ fontFamily: 'var(--font-mono)' }}>
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

        <div className="xl:col-span-4">
          <ActivityFeed alerts={filteredAlerts} />
        </div>
      </div>

      {/* Linha 2: tendência (com crosshair sincronizado) + distribuição */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        <Card className="xl:col-span-8 hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp
                className="h-3.5 w-3.5 text-(--color-muted)"
                strokeWidth={1.5}
              />
              Tendência diária por bioma
            </CardTitle>
            <CardDescription>
              Série temporal das últimas {rangeDays} {rangeDays === 1 ? 'leitura' : 'leituras'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="h-[260px]"
              onMouseLeave={() => setHoverIndex(null)}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trimmedTimeSeries}
                  margin={{ left: -10, right: 4, top: 8, bottom: 0 }}
                  onMouseMove={(state) => {
                    if (state && state.activeTooltipIndex != null) {
                      setHoverIndex(state.activeTooltipIndex)
                    }
                  }}
                >
                  <CartesianGrid {...CHART_GRID_PROPS} />
                  <XAxis
                    dataKey="date"
                    {...CHART_AXIS_PROPS}
                    interval={Math.max(0, Math.floor(rangeDays / 8) - 1)}
                  />
                  <YAxis {...CHART_AXIS_PROPS} />
                  <RechartsTooltip
                    cursor={{
                      stroke: 'rgba(31,29,26,0.15)',
                      strokeDasharray: '2 2',
                    }}
                    content={<ChartTooltip unit=" focos" />}
                  />
                  {biomes.map((b) => (
                    <Line
                      key={b.id}
                      type="monotone"
                      dataKey={b.id}
                      name={b.label}
                      stroke={biomePaletteLight[b.id]}
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
                <div
                  key={b.id}
                  className="flex items-center gap-1.5 text-[11px] text-(--color-muted)"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: biomePaletteLight[b.id] }}
                  />
                  {b.label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-4 hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow
                className="h-3.5 w-3.5 text-(--color-muted)"
                strokeWidth={1.5}
              />
              Origem dos alertas
            </CardTitle>
            <CardDescription>Distribuição por sistema</CardDescription>
          </CardHeader>
          <CardContent>
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
                    stroke="#FFFFFF"
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
            <div className="flex flex-col gap-1.5 text-[12px] mt-3">
              {sourceDist.map((s) => {
                const Icon = sourceIcons[s.id] ?? Sparkles
                const pct = Math.round((s.value / initialAlerts.length) * 100)
                return (
                  <div key={s.id} className="flex items-center gap-2">
                    <span
                      className="h-1.5 w-1.5 rounded-full shrink-0"
                      style={{ background: s.color }}
                    />
                    <Icon
                      className="h-3 w-3 text-(--color-faint) shrink-0"
                      strokeWidth={1.5}
                    />
                    <span className="text-(--color-text-soft) truncate flex-1">
                      {s.name}
                    </span>
                    <span
                      className="text-(--color-faint) tabular-nums text-[11px]"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {pct}%
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Linha 3: estação IoT */}
      <Card className="hover-lift">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Cpu
                  className="h-3.5 w-3.5 text-(--color-success)"
                  strokeWidth={1.5}
                />
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
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-[12px]">
            <ReadingItem label="Temp." value={`${reading.temperatura} °C`} />
            <ReadingItem label="Umidade" value={`${reading.umidade}%`} />
            <ReadingItem label="Radiação" value={reading.radiacao} />
            <ReadingItem label="Comm." value={`${reading.perdaComunicacao}%`} />
            <ReadingItem label="Poeira" value={reading.indicePoeira} />
            <ReadingItem label="CO₂" value={`${reading.co2} ppm`} />
          </div>

          <div className="h-[80px] -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={sensorHistory}
                margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="iotTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B91C1C" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#B91C1C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="temperatura"
                  stroke="#B91C1C"
                  strokeWidth={1.4}
                  fill="url(#iotTemp)"
                  isAnimationActive={false}
                />
                <RechartsTooltip
                  content={<ChartTooltip unit="°C" />}
                  cursor={{ stroke: 'rgba(31,29,26,0.12)' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] text-(--color-muted) pt-2 border-t border-(--color-line)">
            <span className="flex items-center gap-1.5">
              <Battery className="h-3 w-3" strokeWidth={1.5} />
              Bateria{' '}
              <span
                className={cn(
                  'font-medium tabular-nums',
                  reading.bateria > 60
                    ? 'text-(--color-success)'
                    : 'text-(--color-warning)',
                )}
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {reading.bateria}%
              </span>
            </span>
            <span
              className="flex items-center gap-1.5"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <Wifi className="h-3 w-3" strokeWidth={1.5} />
              BR-CER-01
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-md px-3.5 py-2.5 border border-(--color-line) bg-(--color-surface) hover-lift">
      <Icon className="h-3.5 w-3.5 text-(--color-faint)" strokeWidth={1.5} />
      <div className="min-w-0 flex-1">
        <p className="label-caps truncate">{label}</p>
        <p
          className="number-display text-[15px] text-(--color-text)"
          style={{ fontWeight: 500 }}
        >
          {value}
        </p>
      </div>
    </div>
  )
}

function ReadingItem({ label, value }) {
  return (
    <div className="flex flex-col rounded-md px-2.5 py-1.5 border border-(--color-line) bg-(--color-surface)">
      <span className="label-caps">{label}</span>
      <span
        className="text-[13px] tabular-nums"
        style={{ fontWeight: 500, fontFamily: 'var(--font-mono)' }}
      >
        {value}
      </span>
    </div>
  )
}

export default Overview
