import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Pílulas executivas (Notion/Tremor): bg-soft + text-strong da mesma família,
// border 1px da cor accent — nunca cor saturada como bg.
const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md px-2 h-[22px] text-[11px] font-medium transition-colors leading-none tracking-[-0.005em]',
  {
    variants: {
      variant: {
        default:
          'bg-(--color-surface-elevated) text-(--color-text-soft) border border-(--color-line)',
        high:
          'bg-(--color-danger-soft) text-(--color-danger) border border-(--color-danger)/20',
        medium:
          'bg-(--color-warning-soft) text-(--color-warning) border border-(--color-warning)/20',
        low:
          'bg-(--color-success-soft) text-(--color-success) border border-(--color-success)/20',
        outline: 'text-(--color-muted) border border-(--color-line)',
        accent:
          'bg-(--color-accent-soft) text-(--color-accent) border border-(--color-accent)/20',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
