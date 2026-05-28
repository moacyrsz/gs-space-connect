import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { cn, formatNumber } from '@/lib/utils'

const accentStrokes = {
  default: 'oklch(0.72 0.15 215)',
  fire: 'oklch(0.68 0.20 22)',
  vegetation: 'oklch(0.78 0.14 155)',
  info: 'oklch(0.72 0.15 215)',
  purple: 'oklch(0.7 0.16 290)',
  warning: 'oklch(0.82 0.15 75)',
}

const accentTints = {
  default: 'text-(--color-accent)',
  fire: 'text-(--color-danger)',
  vegetation: 'text-(--color-success)',
  info: 'text-(--color-accent)',
  purple: 'text-(--color-purple)',
  warning: 'text-(--color-warning)',
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
  const trend = delta == null ? 'flat' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
  const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : null
  const trendColors = {
    up: 'text-(--color-danger)',
    down: 'text-(--color-success)',
    flat: 'text-(--color-muted)',
  }

  const stroke = accentStrokes[accent]
  const gradId = `kpi-${label.replace(/\s+/g, '-').toLowerCase()}-${accent}`

  return (
    <div className="surface hover-lift relative overflow-hidden">
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-(--color-faint)">
            {label}
          </span>
          {Icon && (
            <span className={cn('opacity-90', accentTints[accent])}>
              <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
            </span>
          )}
        </div>
        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-baseline gap-2">
              <span
                className="number-display number-tween text-[34px] leading-none text-(--color-text)"
                style={{ fontWeight: 538 }}
              >
                {typeof value === 'number' ? formatNumber(value) : value}
              </span>
              {unit && (
                <span className="text-[11px] text-(--color-muted) font-medium">{unit}</span>
              )}
            </div>
            {delta != null && (
              <div className="flex items-center gap-1 text-[11px]">
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 font-medium tabular-nums',
                    trendColors[trend],
                  )}
                >
                  {TrendIcon && <TrendIcon className="h-2.5 w-2.5" strokeWidth={2.5} />}
                  {Math.abs(delta).toFixed(1)}%
                </span>
                <span className="text-(--color-faint)">vs. anterior</span>
              </div>
            )}
          </div>
          {sparklineData && (
            <div className="h-12 w-24 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
                  <defs>
                    <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={stroke} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={stroke}
                    strokeWidth={1.5}
                    fill={`url(#${gradId})`}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default KpiCard
