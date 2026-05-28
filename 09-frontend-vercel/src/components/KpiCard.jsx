import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn, formatNumber } from '@/lib/utils'

const accentStrokes = {
  default: 'oklch(0.72 0.18 50)',
  fire: 'oklch(0.66 0.22 25)',
  vegetation: 'oklch(0.72 0.16 155)',
  info: 'oklch(0.7 0.15 250)',
  purple: 'oklch(0.7 0.18 290)',
}

const accentTints = {
  default: 'text-(--color-accent)',
  fire: 'text-(--color-fire-high)',
  vegetation: 'text-(--color-vegetation)',
  info: 'text-(--color-info)',
  purple: 'text-(--color-purple)',
}

function KpiCard({
  label,
  value,
  unit,
  delta,
  sparklineData,
  accent = 'default',
  icon: Icon,
}) {
  const trend =
    delta == null ? 'flat' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
  const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus
  const trendColors = {
    up: 'text-(--color-fire-high) bg-(--color-fire-high)/10 border-(--color-fire-high)/30',
    down: 'text-(--color-vegetation) bg-(--color-vegetation)/10 border-(--color-vegetation)/30',
    flat: 'text-(--color-muted) bg-(--color-panel-2) border-(--color-line)',
  }

  const stroke = accentStrokes[accent]
  const gradId = `kpi-grad-${label.replace(/\s+/g, '-').toLowerCase()}-${accent}`

  return (
    <Card className="overflow-hidden hover-lift relative">
      <CardContent className="flex flex-col gap-2.5 p-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-(--color-muted)">
            {label}
          </span>
          {Icon && (
            <span
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md bg-(--color-panel-2)',
                accentTints[accent],
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold tabular-nums tracking-tight text-(--color-text)">
            {typeof value === 'number' ? formatNumber(value) : value}
          </span>
          {unit && (
            <span className="text-xs text-(--color-muted)">{unit}</span>
          )}
        </div>
        {delta != null && (
          <div className="flex items-center gap-1.5 text-[11px]">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 font-medium tabular-nums',
                trendColors[trend],
              )}
            >
              <TrendIcon className="h-3 w-3" />
              {Math.abs(delta).toFixed(1)}%
            </span>
            <span className="text-(--color-muted)">vs. período anterior</span>
          </div>
        )}
        {sparklineData && (
          <div className="-mx-5 -mb-5 mt-1 h-14">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={stroke} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={stroke}
                  strokeWidth={1.6}
                  fill={`url(#${gradId})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default KpiCard
