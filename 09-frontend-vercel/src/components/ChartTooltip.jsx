// Tooltip customizado para Recharts. Resolve o bug do "cursor invisível" em
// charts dark e garante consistência visual com o design system.

export function ChartTooltip({ active, payload, label, formatter, labelFormatter, unit }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-(--color-line-strong) bg-(--color-panel) px-3 py-2 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]">
      {label != null && (
        <p className="text-[11px] uppercase tracking-wider text-(--color-faint) mb-1.5">
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
            <span className="ml-auto font-medium tabular-nums text-(--color-text)">
              {formatter ? formatter(p.value) : p.value}
              {unit && <span className="text-(--color-muted) ml-0.5">{unit}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export const CHART_CURSOR = {
  fill: 'oklch(0.288 0.028 270 / 0.5)',
  stroke: 'oklch(0.4 0.028 270)',
  strokeDasharray: '3 3',
  strokeWidth: 1,
}

export const CHART_GRID_PROPS = {
  stroke: 'oklch(0.32 0.026 270)',
  strokeDasharray: '2 4',
  vertical: false,
}

export const CHART_AXIS_PROPS = {
  stroke: 'oklch(0.5 0.02 270)',
  fontSize: 11,
  tickLine: false,
  axisLine: false,
  tick: { fill: 'oklch(0.66 0.018 270)' },
}
