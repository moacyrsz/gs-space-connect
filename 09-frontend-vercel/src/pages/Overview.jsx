import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Flame, Droplets, Wind, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import KpiCard from '@/components/KpiCard'
import AlertCard from '@/components/AlertCard'
import BiomeFilter from '@/components/BiomeFilter'
import RangeFilter from '@/components/RangeFilter'
import {
  biomes,
  buildBiomeBars,
  buildSensorHistory,
  buildTimeSeries,
  initialAlerts,
  mockSensorReading,
} from '@/data/mocks'

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Visão Geral</h1>
          <p className="text-sm text-(--color-muted)">
            Risco de queimadas e degradação vegetal — dados orbitais cruzados com IoT de campo.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <RangeFilter value={range} onChange={setRange} />
        </div>
      </div>

      <BiomeFilter value={biomeFilter} onChange={setBiomeFilter} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Focos detectados"
          value={totalFocos}
          unit="no período"
          delta={12.4}
          sparklineData={sparklineSeries('amazonia')}
          accent="fire"
        />
        <KpiCard
          label="Alertas ativos"
          value={ativos}
          unit={`${criticos} críticos`}
          delta={ativos > 4 ? 8.7 : -3.1}
          sparklineData={sparklineSeries('cerrado')}
          accent="default"
        />
        <KpiCard
          label="Temp. estação"
          value={reading.temperatura}
          unit="°C"
          delta={reading.temperatura > 38 ? 5.2 : -2.4}
          sparklineData={sensorHistory.map((s) => ({ v: s.temperatura }))}
          accent="fire"
        />
        <KpiCard
          label="Umidade relativa"
          value={reading.umidade}
          unit="%"
          delta={reading.umidade < 25 ? -14.6 : 4.8}
          sparklineData={sensorHistory.map((s) => ({ v: s.umidade }))}
          accent="info"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-(--color-fire-high)" />
              Focos por bioma — últimos {rangeDays} dia{rangeDays > 1 ? 's' : ''}
            </CardTitle>
            <CardDescription>
              Soma de focos detectados por bioma. Eixo logarítmico em deltas grandes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={biomeBars} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-line)" strokeDasharray="2 4" vertical={false} />
                  <XAxis
                    dataKey="biome"
                    stroke="var(--color-muted)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--color-muted)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip
                    cursor={{ fill: 'var(--color-panel-2)' }}
                    contentStyle={{
                      background: 'var(--color-panel)',
                      border: '1px solid var(--color-line)',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="focos" radius={[6, 6, 0, 0]}>
                    {biomeBars.map((entry) => (
                      <Cell key={entry.biomeId} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-(--color-fire-mid)" />
              Alertas recentes
            </CardTitle>
            <CardDescription>Cruzamento de Visão, IoT e RPA.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredAlerts.map((a) => (
                <AlertCard key={a.id} alert={a} />
              ))}
              {filteredAlerts.length === 0 && (
                <p className="text-xs text-(--color-muted) text-center py-6">
                  Sem alertas para este filtro.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Tendência diária — focos por bioma</CardTitle>
            <CardDescription>
              Série temporal dos últimos 30 dias, com sazonalidade simulada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeries.slice(-rangeDays)} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-line)" strokeDasharray="2 4" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="var(--color-muted)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    interval={Math.max(0, Math.floor(rangeDays / 8) - 1)}
                  />
                  <YAxis
                    stroke="var(--color-muted)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      background: 'var(--color-panel)',
                      border: '1px solid var(--color-line)',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {biomes.map((b) => (
                    <Line
                      key={b.id}
                      type="monotone"
                      dataKey={b.id}
                      name={b.label}
                      stroke={b.color}
                      strokeWidth={1.6}
                      dot={false}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-(--color-vegetation)" />
              Estação IoT — leituras
            </CardTitle>
            <CardDescription>Atualiza a cada 5 segundos · Wokwi simulado</CardDescription>
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
            <Separator />
            <div className="flex items-center gap-3 text-xs text-(--color-muted)">
              <Wind className="h-3.5 w-3.5" />
              Bateria: <span className="text-(--color-text) font-medium">{reading.bateria}%</span>
              <span className="ml-auto">MQTT broker: hivemq</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ReadingItem({ label, value }) {
  return (
    <div className="flex flex-col rounded-lg border border-(--color-line) bg-(--color-panel-2)/50 px-3 py-2">
      <span className="text-[11px] uppercase tracking-wider text-(--color-muted)">{label}</span>
      <span className="text-base font-medium tabular-nums">{value}</span>
    </div>
  )
}

export default Overview
