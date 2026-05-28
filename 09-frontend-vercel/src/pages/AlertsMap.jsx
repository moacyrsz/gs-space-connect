import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'
import { toast } from 'sonner'
import {
  Layers,
  Search,
  Flame,
  Cpu,
  Workflow,
  X,
  Crosshair,
  Filter,
  Bell,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AlertCard from '@/components/AlertCard'
import BiomeFilter from '@/components/BiomeFilter'
import { initialAlerts, sourceColors, sourceLabels } from '@/data/mocks'
import { cn } from '@/lib/utils'

const severityRadius = { high: 12, medium: 9, low: 6 }
const severityColor = {
  high: 'oklch(0.640 0.180 25)',
  medium: 'oklch(0.790 0.140 85)',
  low: 'oklch(0.700 0.130 155)',
}
const severityCopy = { high: 'Crítico', medium: 'Médio', low: 'Info' }

const sourceIcons = { visao: Flame, iot: Cpu, rpa: Workflow }

function FlyTo({ coords }) {
  const map = useMap()
  useEffect(() => {
    if (coords) map.flyTo(coords, 6, { duration: 0.6 })
  }, [coords, map])
  return null
}

function AlertsMap() {
  const [params, setParams] = useSearchParams()

  const [biomeFilter, setBiomeFilter] = useState(params.get('bioma') || null)
  const [severityFilter, setSeverityFilter] = useState(
    params.get('severity')
      ? new Set([params.get('severity')])
      : new Set(['high', 'medium', 'low']),
  )
  const [sourceFilter, setSourceFilter] = useState(new Set(['visao', 'iot', 'rpa']))
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(initialAlerts[0])
  const [flyTarget, setFlyTarget] = useState(null)

  useEffect(() => {
    const next = new URLSearchParams()
    if (biomeFilter) next.set('bioma', biomeFilter)
    if (severityFilter.size === 1) next.set('severity', [...severityFilter][0])
    setParams(next, { replace: true })
  }, [biomeFilter, severityFilter, setParams])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return initialAlerts.filter((a) => {
      if (biomeFilter && a.biome !== biomeFilter) return false
      if (!severityFilter.has(a.severity)) return false
      if (!sourceFilter.has(a.source)) return false
      if (q && !a.region.toLowerCase().includes(q) && !a.message.toLowerCase().includes(q))
        return false
      return true
    })
  }, [biomeFilter, severityFilter, sourceFilter, search])

  const stats = useMemo(
    () => ({
      total: filtered.length,
      high: filtered.filter((a) => a.severity === 'high').length,
      medium: filtered.filter((a) => a.severity === 'medium').length,
      low: filtered.filter((a) => a.severity === 'low').length,
    }),
    [filtered],
  )

  const toggleSeverity = (sev) => {
    setSeverityFilter((prev) => {
      const next = new Set(prev)
      next.has(sev) ? next.delete(sev) : next.add(sev)
      if (next.size === 0) return prev
      return next
    })
  }

  const toggleSource = (src) => {
    setSourceFilter((prev) => {
      const next = new Set(prev)
      next.has(src) ? next.delete(src) : next.add(src)
      if (next.size === 0) return prev
      return next
    })
  }

  const handleSelect = (alert) => {
    setSelected(alert)
    setFlyTarget(alert.coords)
  }

  const dispatch = () => {
    toast.success('Equipe acionada', {
      description: `${selected.region} · prioridade ${selected.severity.toUpperCase()}`,
    })
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1.5">
          <p className="text-[11px] uppercase tracking-[0.08em] text-(--color-faint) font-medium">
            Geoespacial
          </p>
          <h1
            className="heading-display text-[30px] leading-[1.1] text-(--color-text)"
            style={{ fontWeight: 580 }}
          >
            Mapa de Alertas
          </h1>
          <p className="text-[13px] text-(--color-muted) max-w-2xl leading-relaxed">
            Geolocalização dos alertas ativos sobre tile dark CARTO. Marcadores
            dimensionados por severidade.
          </p>
        </div>
        <div className="relative w-full lg:w-72">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-(--color-faint) pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar região ou mensagem"
            className="pl-8"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-(--color-faint) hover:text-(--color-text)"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <StatPill label="Total" value={stats.total} variant="default" />
        <StatPill label="Críticos" value={stats.high} variant="high" />
        <StatPill label="Médios" value={stats.medium} variant="medium" />
        <StatPill label="Informativos" value={stats.low} variant="low" />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2.5">
        <BiomeFilter value={biomeFilter} onChange={setBiomeFilter} />
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-(--color-faint) font-medium mr-1">
            <Filter className="h-3 w-3" /> Severidade
          </span>
          {['high', 'medium', 'low'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSeverity(s)}
              className={cn(
                'flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors',
                severityFilter.has(s)
                  ? 'border-(--color-line-strong) bg-(--color-panel-2) text-(--color-text)'
                  : 'border-(--color-line) bg-transparent text-(--color-faint) line-through',
              )}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: severityColor[s] }}
              />
              {severityCopy[s]}
            </button>
          ))}

          <span className="text-[10px] uppercase tracking-wider text-(--color-faint) font-medium ml-3 mr-1">
            Origem
          </span>
          {['visao', 'iot', 'rpa'].map((s) => {
            const Icon = sourceIcons[s]
            const active = sourceFilter.has(s)
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSource(s)}
                className={cn(
                  'flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors',
                  active
                    ? 'border-(--color-line-strong) bg-(--color-panel-2) text-(--color-text)'
                    : 'border-(--color-line) bg-transparent text-(--color-faint) line-through',
                )}
              >
                <Icon className="h-3 w-3" />
                {sourceLabels[s]}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card className="lg:col-span-2 overflow-hidden p-0">
          <CardContent className="p-0 relative">
            <div className="h-[560px] w-full">
              <MapContainer
                center={[-14.235, -51.925]}
                zoom={4}
                scrollWheelZoom
                zoomControl={false}
                className="h-full w-full"
                style={{ background: 'var(--color-bg)' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  subdomains={['a', 'b', 'c', 'd']}
                />
                <FlyTo coords={flyTarget} />
                {filtered.map((a) => (
                  <CircleMarker
                    key={a.id}
                    center={a.coords}
                    radius={severityRadius[a.severity]}
                    pathOptions={{
                      color: severityColor[a.severity],
                      fillColor: severityColor[a.severity],
                      fillOpacity: 0.5,
                      weight: 1.5,
                    }}
                    eventHandlers={{ click: () => handleSelect(a) }}
                  >
                    <Popup>
                      <div className="space-y-0.5">
                        <p className="font-semibold text-(--color-text)">
                          {a.region}
                        </p>
                        <p className="text-(--color-muted)">
                          {sourceLabels[a.source]} · {severityCopy[a.severity]}
                        </p>
                        <p className="text-(--color-text-soft)">{a.message}</p>
                        {a.proba != null && (
                          <p className="text-(--color-muted)">
                            probabilidade {Math.round(a.proba * 100)}%
                          </p>
                        )}
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>

              {/* Hint sutil */}
              <div className="absolute top-3 left-3 z-[400]">
                <div className="rounded-md border border-(--color-line) bg-(--color-panel) px-2.5 py-1.5 text-[11px] text-(--color-muted) flex items-center gap-1.5">
                  <Crosshair className="h-3 w-3" />
                  Clique em um marcador para detalhes
                </div>
              </div>

              {/* Legenda */}
              <div className="absolute bottom-3 left-3 z-[400] rounded-md border border-(--color-line) bg-(--color-panel) p-2.5 w-48">
                <p className="text-[9px] uppercase tracking-wider text-(--color-faint) font-medium mb-1.5">
                  Legenda
                </p>
                <div className="flex flex-col gap-1 text-[11px]">
                  {['high', 'medium', 'low'].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ background: severityColor[s] }}
                      />
                      <span className="text-(--color-muted)">
                        {severityCopy[s]}
                      </span>
                      <span className="ml-auto text-(--color-faint) font-mono text-[10px]">
                        {s === 'high' ? '>0.8' : s === 'medium' ? '0.5–0.8' : '<0.5'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <Card className="hover-lift">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Detalhe do alerta</CardTitle>
                <Badge variant={selected.severity}>
                  {severityCopy[selected.severity]}
                </Badge>
              </div>
              <CardDescription className="font-mono text-[10px]">
                {selected.id}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 text-[12px]">
              <DetailRow label="Região" value={selected.region} />
              <DetailRow
                label="Coordenadas"
                value={
                  <span className="font-mono text-[11px]">
                    {selected.coords[0]}, {selected.coords[1]}
                  </span>
                }
              />
              <DetailRow
                label="Origem"
                value={
                  <span className="flex items-center gap-1.5">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: sourceColors[selected.source] }}
                    />
                    {sourceLabels[selected.source]}
                  </span>
                }
              />
              <DetailRow label="Mensagem" value={selected.message} />
              {selected.proba != null && (
                <DetailRow
                  label="Probabilidade"
                  value={
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 rounded-full bg-(--color-panel-2)">
                        <div
                          className="h-full rounded-full bg-(--color-accent)"
                          style={{ width: `${Math.round(selected.proba * 100)}%` }}
                        />
                      </div>
                      <span className="text-[11px] tabular-nums">
                        {Math.round(selected.proba * 100)}%
                      </span>
                    </div>
                  }
                />
              )}
              <div className="flex gap-2 pt-1">
                <Button onClick={dispatch} size="sm" className="flex-1">
                  <Bell className="h-3 w-3" />
                  Acionar equipe
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setFlyTarget([...selected.coords])}
                >
                  <Crosshair className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Lista de alertas</span>
                <Badge variant="outline" className="font-mono">
                  {filtered.length}
                </Badge>
              </CardTitle>
              <CardDescription>Clique para focar no mapa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
                {filtered.map((a) => (
                  <AlertCard key={a.id} alert={a} onSelect={handleSelect} />
                ))}
                {filtered.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Layers className="h-7 w-7 text-(--color-faint) mb-1.5" />
                    <p className="text-[12px] text-(--color-muted)">
                      Nada encontrado.
                    </p>
                    <p className="text-[10px] text-(--color-faint) mt-0.5">
                      Tente afrouxar os filtros.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatPill({ label, value, variant = 'default' }) {
  const ringStyles = {
    default: 'shadow-[inset_0_0_0_1px_var(--color-line-strong),inset_0_1px_0_oklch(1_0_0_/_0.03)]',
    high: 'shadow-[inset_0_0_0_1px_oklch(0.68_0.20_22_/_0.4),inset_0_1px_0_oklch(1_0_0_/_0.03)]',
    medium: 'shadow-[inset_0_0_0_1px_oklch(0.82_0.15_75_/_0.4),inset_0_1px_0_oklch(1_0_0_/_0.03)]',
    low: 'shadow-[inset_0_0_0_1px_oklch(0.78_0.14_155_/_0.4),inset_0_1px_0_oklch(1_0_0_/_0.03)]',
  }
  const valueColors = {
    default: 'text-(--color-text)',
    high: 'text-(--color-danger)',
    medium: 'text-(--color-warning)',
    low: 'text-(--color-success)',
  }
  return (
    <div className={cn('rounded-lg px-4 py-3 hover-lift', ringStyles[variant])}>
      <p className="text-[10px] uppercase tracking-[0.08em] text-(--color-faint) font-medium">
        {label}
      </p>
      <p
        className={cn(
          'text-[24px] tabular-nums tracking-[-0.018em] mt-1',
          valueColors[variant],
        )}
        style={{ fontWeight: 538 }}
      >
        {value}
      </p>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-(--color-faint) font-medium mb-0.5">
        {label}
      </p>
      <div className="text-[12px] text-(--color-text)">{value}</div>
    </div>
  )
}

export default AlertsMap
