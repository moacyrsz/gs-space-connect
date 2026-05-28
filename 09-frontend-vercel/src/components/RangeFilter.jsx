import { Calendar } from 'lucide-react'
import { ranges } from '@/data/mocks'
import { cn } from '@/lib/utils'

function RangeFilter({ value, onChange }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-(--color-line) bg-(--color-panel-2) p-0.5">
      <span className="flex items-center gap-1.5 px-2 text-xs text-(--color-muted)">
        <Calendar className="h-3.5 w-3.5" />
      </span>
      {ranges.map((r) => (
        <button
          key={r.id}
          type="button"
          onClick={() => onChange(r.id)}
          className={cn(
            'rounded-md px-3 py-1 text-xs font-medium transition-colors',
            value === r.id
              ? 'bg-(--color-panel) text-(--color-text)'
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
