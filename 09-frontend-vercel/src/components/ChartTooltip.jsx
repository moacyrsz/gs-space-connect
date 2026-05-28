// Tooltip e constantes de Recharts no padrão Tremor/Bloomberg-light:
// border 1px, sombra microscópica, sem arrow, valores em Geist Mono.

export function ChartTooltip({ active, payload, label, formatter, labelFormatter, unit }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-(--color-line) bg-(--color-surface) px-3 py-2 shadow-[0_4px_12px_rgba(31,29,26,0.06)]">
      {label != null && (
        <p className="text-[11px] uppercase tracking-[0.06em] text-(--color-faint) font-medium mb-1.5">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((p) => (
          <div key={p.dataKey ?? p.name} className="flex items-center gap-2 text-xs">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ background: p.color || p.fill }}
            />
            <span className="text-(--color-muted)">{p.name || p.dataKey}</span>
            <span
              className="ml-auto font-medium tabular-nums text-(--color-text)"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {formatter ? formatter(p.value) : p.value}
              {unit && <span className="text-(--color-faint) ml-0.5">{unit}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export const CHART_CURSOR = {
  fill: 'rgba(31, 29, 26, 0.04)',
  stroke: 'rgba(31, 29, 26, 0.12)',
  strokeDasharray: '2 2',
  strokeWidth: 1,
}

export const CHART_GRID_PROPS = {
  stroke: '#E8E6E1',
  strokeDasharray: '2 2',
  vertical: false,
}

export const CHART_AXIS_PROPS = {
  stroke: '#82827C',
  fontSize: 11,
  tickLine: false,
  axisLine: false,
  tick: { fill: '#82827C', fontFamily: "'Geist Mono', monospace" },
}
