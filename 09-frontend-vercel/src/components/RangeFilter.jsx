import { ranges } from '@/data/mocks'
import { cn } from '@/lib/utils'

function RangeFilter({ value, onChange }) {
  return (
    <div className="inline-flex items-center rounded-md border border-(--color-line) p-0.5">
      {ranges.map((r) => (
        <button
          key={r.id}
          type="button"
          onClick={() => onChange(r.id)}
          className={cn(
            'rounded px-2.5 py-1 text-[11px] font-medium transition-colors',
            value === r.id
              ? 'bg-(--color-panel-2) text-(--color-text)'
              : 'text-(--color-muted) hover:text-(--color-text)',
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  )
}

export default RangeFilter
