import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded border px-1.5 py-0 h-5 text-[11px] font-medium transition-colors leading-none',
  {
    variants: {
      variant: {
        default: 'border-(--color-line) bg-(--color-panel-2) text-(--color-text-soft)',
        high:
          'border-(--color-danger)/30 bg-(--color-danger)/10 text-(--color-danger)',
        medium:
          'border-(--color-warning)/30 bg-(--color-warning)/10 text-(--color-warning)',
        low:
          'border-(--color-success)/30 bg-(--color-success)/10 text-(--color-success)',
        outline: 'border-(--color-line) text-(--color-muted)',
        accent: 'border-(--color-accent)/30 bg-(--color-accent)/10 text-(--color-accent)',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
