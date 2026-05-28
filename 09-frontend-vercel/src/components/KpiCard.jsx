import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { cn, formatNumber } from '@/lib/utils'

const accentStrokes = {
  default: 'oklch(0.585 0.165 270)',
  fire: 'oklch(0.640 0.180 25)',
  vegetation: 'oklch(0.700 0.130 155)',
  info: 'oklch(0.585 0.165 270)',
  purple: 'oklch(0.640 0.110 290)',
  warning: 'oklch(0.790 0.140 85)',
}

const accentTints = {
  default: 'text-(--color-muted)',
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
  const trend =
    delta == null ? 'flat' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
  const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : null
  // Cores Plausible-like: subir é vermelho (mais focos = pior), descer é verde
  const trendColors = {
    up: 'text-(--color-danger)',
    down: 'text-(--color-success)',
    flat: 'text-(--color-muted)',
  }

  const stroke = accentStrokes[accent]
  const gradId = `kpi-${label.replace(/\s+/g, '-').toLowerCase()}-${accent}`

  return (
    <div className="surface hover-lift relative overflow-hidden">
      <div className="flex flex-col gap-2.5 p-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-wider text-(--color-faint)">
            {label}
          </span>
          {Icon && (
            <span className={cn('text-(--color-faint)', accentTints[accent])}>
              <Icon className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[28px] leading-none font-semibold tabular-nums tracking-[-0.01em] text-(--color-text)">
            {typeof value === 'number' ? formatNumber(value) : value}
          </span>
          {unit && (
            <span className="text-[11px] text-(--color-muted)">{unit}</span>
          )}
        </div>
        {delta != null && (
          <div className="flex items-center gap-1 text-[11px]">
            <span className={cn('inline-flex items-center gap-0.5 font-medium tabular-nums', trendColors[trend])}>
              {TrendIcon && <TrendIcon className="h-3 w-3" />}
              {Math.abs(delta).toFixed(1)}%
            </span>
            <span className="text-(--color-faint)">vs. período anterior</span>
          </div>
        )}
      </div>
      {sparklineData && (
        <div className="h-10 -mt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={stroke}
                strokeWidth={1.4}
                fill={`url(#${gradId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default KpiCard
