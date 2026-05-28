import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md px-2 h-[22px] text-[11px] font-medium transition-colors leading-none tracking-[-0.005em]',
  {
    variants: {
      variant: {
        default:
          'bg-(--color-surface-elevated) text-(--color-text-soft) shadow-[inset_0_0_0_1px_var(--color-line-strong)]',
        high:
          'bg-(--color-danger)/10 text-(--color-danger) shadow-[inset_0_0_0_1px_oklch(0.68_0.20_22_/_0.3)]',
        medium:
          'bg-(--color-warning)/10 text-(--color-warning) shadow-[inset_0_0_0_1px_oklch(0.82_0.15_75_/_0.3)]',
        low:
          'bg-(--color-success)/10 text-(--color-success) shadow-[inset_0_0_0_1px_oklch(0.78_0.14_155_/_0.3)]',
        outline:
          'text-(--color-muted) shadow-[inset_0_0_0_1px_var(--color-line-strong)]',
        accent:
          'bg-(--color-accent)/10 text-(--color-accent) shadow-[inset_0_0_0_1px_oklch(0.72_0.15_215_/_0.3)]',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
