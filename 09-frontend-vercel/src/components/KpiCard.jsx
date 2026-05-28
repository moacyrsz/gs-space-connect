import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn, formatNumber } from '@/lib/utils'

function KpiCard({ label, value, unit, delta, sparklineData, accent = 'default' }) {
  const trend =
    delta == null ? 'flat' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
  const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus

  const trendColors = {
    up: 'text-(--color-fire-high)',
    down: 'text-(--color-vegetation)',
    flat: 'text-(--color-muted)',
  }

  const accentStrokes = {
    default: 'oklch(0.72 0.18 50)',
    fire: 'oklch(0.65 0.21 25)',
    vegetation: 'oklch(0.72 0.16 155)',
    info: 'oklch(0.7 0.15 250)',
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex flex-col gap-2 p-5">
        <span className="text-xs font-medium uppercase tracking-wider text-(--color-muted)">
          {label}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold tabular-nums tracking-tight text-(--color-text)">
            {typeof value === 'number' ? formatNumber(value) : value}
          </span>
          {unit && (
            <span className="text-xs text-(--color-muted)">{unit}</span>
          )}
        </div>
        {delta != null && (
          <div className={cn('flex items-center gap-1 text-xs', trendColors[trend])}>
            <TrendIcon className="h-3 w-3" />
            <span className="font-medium">{Math.abs(delta).toFixed(1)}%</span>
            <span className="text-(--color-muted)">vs. período anterior</span>
          </div>
        )}
        {sparklineData && (
          <div className="-mx-5 -mb-5 mt-2 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accentStrokes[accent]} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={accentStrokes[accent]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={accentStrokes[accent]}
                  strokeWidth={1.5}
                  fill={`url(#grad-${label})`}
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
