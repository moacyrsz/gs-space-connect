import { Trees } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { biomes } from '@/data/mocks'

function BiomeFilter({ value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="flex items-center gap-1.5 text-xs text-(--color-muted) mr-1">
        <Trees className="h-3.5 w-3.5" />
        Bioma
      </span>
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          'rounded-full border px-3 py-1 text-xs transition-colors',
          value == null
            ? 'border-(--color-accent)/40 bg-(--color-accent)/15 text-(--color-accent)'
            : 'border-(--color-line) text-(--color-muted) hover:border-(--color-accent)/30 hover:text-(--color-text)',
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
              'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors',
              active
                ? 'border-(--color-accent)/40 bg-(--color-accent)/15 text-(--color-text)'
                : 'border-(--color-line) text-(--color-muted) hover:border-(--color-accent)/30 hover:text-(--color-text)',
            )}
          >
            <span
              className="h-2 w-2 rounded-full"
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
