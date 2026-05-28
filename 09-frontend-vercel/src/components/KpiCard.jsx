import { Area, AreaChart, ReferenceLine, ResponsiveContainer } from 'recharts'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { cn, formatNumber } from '@/lib/utils'
import { useCountUp } from '@/lib/useCountUp'

// Paleta mono por accent (Tremor-style)
const accentStrokes = {
  default: '#B45309', // terra
  fire: '#B91C1C', // fogo
  vegetation: '#2A7E3B', // bioma
  info: '#B45309',
  warning: '#B45309',
}

function KpiCard({
  label,
  value,
  unit,
  delta,
  sparklineData,
  accent = 'default',
  icon: Icon,
  thresholds, // { warning: 0.6, danger: 0.85 } como % do max — opcional
}) {
  const numericValue = typeof value === 'number' ? value : null
  const animated = useCountUp(numericValue ?? 0)
  const display = numericValue != null ? formatNumber(Number(animated)) : value

  const trend = delta == null ? 'flat' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
  const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : null
  // Plausible: subir = pior (vermelho), descer = melhor (verde)
  const trendStyles = {
    up: 'bg-(--color-danger-soft) text-(--color-danger)',
    down: 'bg-(--color-success-soft) text-(--color-success)',
    flat: 'bg-(--color-surface-elevated) text-(--color-muted)',
  }

  const stroke = accentStrokes[accent]
  const gradId = `kpi-${label.replace(/\s+/g, '-').toLowerCase()}-${accent}`

  // Threshold lines (opcional) — calcula y absoluto baseado no max do sparkline
  const max = sparklineData?.length
    ? Math.max(...sparklineData.map((d) => d.v))
    : 0

  return (
    <div className="surface hover-lift overflow-hidden">
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="label-caps">{label}</span>
          {Icon && (
            <span className="text-(--color-faint)">
              <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
            </span>
          )}
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-baseline gap-2">
              <span
                className="number-display number-tween text-[32px] leading-none text-(--color-text)"
                style={{ fontWeight: 500 }}
              >
                {display}
              </span>
              {unit && (
                <span className="text-[11px] text-(--color-muted) font-medium">
                  {unit}
                </span>
              )}
            </div>
            {delta != null && (
              <div className="flex items-center gap-1.5 text-[11px]">
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium tabular-nums',
                    trendStyles[trend],
                  )}
                >
                  {TrendIcon && <TrendIcon className="h-2.5 w-2.5" strokeWidth={2.25} />}
                  {Math.abs(delta).toFixed(1)}%
                </span>
                <span className="text-(--color-faint)">vs. anterior</span>
              </div>
            )}
          </div>

          {sparklineData && (
            <div className="h-12 w-24 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={sparklineData}
                  margin={{ top: 2, right: 0, left: 0, bottom: 2 }}
                >
                  <defs>
                    <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={stroke} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  {thresholds?.warning && max > 0 && (
                    <ReferenceLine
                      y={thresholds.warning * max}
                      stroke="#B45309"
                      strokeDasharray="2 2"
                      strokeOpacity={0.4}
                    />
                  )}
                  {thresholds?.danger && max > 0 && (
                    <ReferenceLine
                      y={thresholds.danger * max}
                      stroke="#B91C1C"
                      strokeDasharray="2 2"
                      strokeOpacity={0.5}
                    />
                  )}
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
