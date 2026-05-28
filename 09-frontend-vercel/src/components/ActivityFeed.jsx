import { Satellite, Cpu, Workflow, Sparkles, Bot } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { sourceLabels } from '@/data/mocks'

const sourceIcons = {
  visao: Satellite,
  iot: Cpu,
  rpa: Workflow,
  qml: Sparkles,
  nlp: Bot,
}

function timeAgo(date) {
  const minutes = Math.round((Date.now() - new Date(date).getTime()) / 60000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `há ${minutes}m`
  const hours = Math.floor(minutes / 60)
  return `há ${hours}h`
}

// Sparkline pequeno para cada item — gera mock determinístico baseado no id
function genSpark(seed, points = 16) {
  let s = String(seed)
    .split('')
    .reduce((a, c) => a + c.charCodeAt(0), 0)
  const out = []
  for (let i = 0; i < points; i++) {
    s = (s * 9301 + 49297) % 233280
    out.push({ v: 0.3 + (s / 233280) * 0.7 })
  }
  return out
}

const accentBy = {
  high: '#B91C1C',
  medium: '#B45309',
  low: '#2A7E3B',
}

/**
 * Activity Feed estilo Vercel: timestamp + ícone severidade + label +
 * sparkline 60×20 inline para cada item.
 */
function ActivityFeed({ alerts = [], title = 'Atividade recente', limit = 8 }) {
  const items = alerts.slice(0, limit)
  return (
    <Card className="hover-lift">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Cruzamento Visão · IoT · RPA</CardDescription>
      </CardHeader>
      <CardContent className="!p-0">
        <ul className="flex flex-col">
          {items.map((a, idx) => {
            const Icon = sourceIcons[a.source] ?? Sparkles
            const stroke = accentBy[a.severity]
            const spark = genSpark(a.id)
            return (
              <li
                key={a.id}
                className={`flex items-center gap-3 px-5 py-3 transition-colors hover:bg-(--color-surface-elevated)/60 ${idx < items.length - 1 ? 'border-b border-(--color-line)' : ''}`}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-(--color-surface-elevated) border border-(--color-line)">
                  <Icon
                    className="h-3 w-3 text-(--color-muted)"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Badge variant={a.severity} className="h-[16px] text-[9px] px-1.5">
                      {a.severity.toUpperCase()}
                    </Badge>
                    <span
                      className="text-[10px] text-(--color-faint) truncate"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {sourceLabels[a.source]}
                    </span>
                    <span
                      className="ml-auto text-[10px] text-(--color-faint) shrink-0"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {timeAgo(a.at)}
                    </span>
                  </div>
                  <p
                    className="text-[12.5px] text-(--color-text) truncate"
                    style={{ fontWeight: 500 }}
                  >
                    {a.region}
                  </p>
                  <p className="text-[11px] text-(--color-muted) line-clamp-1 leading-relaxed mt-0.5">
                    {a.message}
                  </p>
                </div>
                <div className="h-7 w-16 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={spark} margin={{ top: 1, right: 0, left: 0, bottom: 1 }}>
                      <defs>
                        <linearGradient id={`af-${a.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={stroke} stopOpacity={0.18} />
                          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke={stroke}
                        strokeWidth={1.2}
                        fill={`url(#af-${a.id})`}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

export default ActivityFeed
