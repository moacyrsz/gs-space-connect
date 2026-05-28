import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-(--color-line) bg-(--color-panel-2) text-(--color-text)',
        high:
          'border-(--color-fire-high)/40 bg-(--color-fire-high)/15 text-(--color-fire-high)',
        medium:
          'border-(--color-fire-mid)/40 bg-(--color-fire-mid)/15 text-(--color-fire-mid)',
        low:
          'border-(--color-vegetation)/40 bg-(--color-vegetation)/15 text-(--color-vegetation)',
        outline: 'border-(--color-line) text-(--color-muted)',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

function Badge({ className, variant, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
