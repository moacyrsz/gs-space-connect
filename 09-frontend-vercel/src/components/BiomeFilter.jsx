import { cn } from '@/lib/utils'
import { biomes } from '@/data/mocks'

function BiomeFilter({ value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="text-[10px] uppercase tracking-wider text-(--color-faint) font-medium mr-2">
        Bioma
      </span>
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          'rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors',
          value == null
            ? 'border-(--color-line-strong) bg-(--color-panel-2) text-(--color-text)'
            : 'border-(--color-line) text-(--color-muted) hover:border-(--color-line-strong) hover:text-(--color-text)',
        )}
      >
        Todos
      </button>
      {biomes.map((b) => {
        const active = value === b.id
        return (
          <button
            key={b.id}
            type="button"
            onClick={() => onChange(b.id)}
            className={cn(
              'flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors',
              active
                ? 'border-(--color-line-strong) bg-(--color-panel-2) text-(--color-text)'
                : 'border-(--color-line) text-(--color-muted) hover:border-(--color-line-strong) hover:text-(--color-text)',
            )}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: b.color }}
            />
            {b.label}
          </button>
        )
      })}
    </div>
  )
}

export default BiomeFilter
