import { useMemo, useState } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import { Layers } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AlertCard from '@/components/AlertCard'
import BiomeFilter from '@/components/BiomeFilter'
import { biomes, initialAlerts, sourceColors, sourceLabels } from '@/data/mocks'

const severityRadius = { high: 14, medium: 10, low: 7 }
const severityColor = {
  high: 'oklch(0.65 0.21 25)',
  medium: 'oklch(0.78 0.18 70)',
  low: 'oklch(0.72 0.16 155)',
}

function AlertsMap() {
  const [biomeFilter, setBiomeFilter] = useState(null)
  const [selected, setSelected] = useState(initialAlerts[0])

  const filtered = useMemo(
    () =>
      biomeFilter == null
        ? initialAlerts
        : initialAlerts.filter((a) => a.biome === biomeFilter),
    [biomeFilter],
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mapa de Alertas</h1>
          <p className="text-sm text-(--color-muted)">
            Geolocalização dos alertas ativos. Tile dark CARTO. Marcadores dimensionados pela severidade.
          </p>
        </div>
        <Badge variant="outline" className="self-start lg:self-auto">
          <Layers className="h-3 w-3" />
          {filtered.length} alertas no recorte
        </Badge>
      </div>

      <BiomeFilter value={biomeFilter} onChange={setBiomeFilter} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 overflow-hidden">
          <CardContent className="p-0">
            <div className="h-[520px] w-full">
              <MapContainer
                center={[-14.235, -51.925]}
                zoom={4}
                scrollWheelZoom
                className="h-full w-full"
                style={{ background: 'var(--color-bg)' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  subdomains={['a', 'b', 'c', 'd']}
                />
                {filtered.map((a) => (
                  <CircleMarker
                    key={a.id}
                    center={a.coords}
                    radius={severityRadius[a.severity]}
                    pathOptions={{
                      color: severityColor[a.severity],
                      fillColor: severityColor[a.severity],
                      fillOpacity: 0.55,
                      weight: 1.5,
                    }}
                    eventHandlers={{ click: () => setSelected(a) }}
                  >
                    <Popup>
                      <strong>{a.region}</strong>
                      <br />
                      {sourceLabels[a.source]} · {a.severity.toUpperCase()}
                      <br />
                      {a.message}
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Detalhe do alerta</CardTitle>
              <CardDescription>Selecione um marcador no mapa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-(--color-muted)">
                  Identificador
                </span>
                <p className="font-mono text-xs text-(--color-text)">{selected.id}</p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-(--color-muted)">
                  Região
                </span>
                <p className="text-(--color-text)">{selected.region}</p>
                <p className="text-[11px] tabular-nums text-(--color-muted)">
                  lat {selected.coords[0]} · lon {selected.coords[1]}
                </p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-(--color-muted)">
                  Origem
                </span>
                <p className="flex items-center gap-2 text-(--color-text)">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: sourceColors[selected.source] }}
                  />
                  {sourceLabels[selected.source]}
                </p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-(--color-muted)">
                  Mensagem
                </span>
                <p className="text-(--color-text)">{selected.message}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lista de alertas</CardTitle>
              <CardDescription>Clique para selecionar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
                {filtered.map((a) => (
                  <AlertCard key={a.id} alert={a} onSelect={setSelected} />
                ))}
                {filtered.length === 0 && (
                  <p className="text-xs text-(--color-muted) text-center py-4">
                    Sem alertas para este filtro.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Legenda</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-xs">
              {[
                { key: 'high', label: 'Crítico (>0.8)' },
                { key: 'medium', label: 'Médio (0.5–0.8)' },
                { key: 'low', label: 'Informativo (<0.5)' },
              ].map((s) => (
                <div key={s.key} className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ background: severityColor[s.key], boxShadow: '0 0 8px ' + severityColor[s.key] }}
                  />
                  <span className="text-(--color-muted)">{s.label}</span>
                </div>
              ))}
              <div className="mt-1 h-px bg-(--color-line)" />
              {biomes.map((b) => (
                <div key={b.id} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: b.color }} />
                  <span className="text-(--color-muted)">{b.label}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AlertsMap
