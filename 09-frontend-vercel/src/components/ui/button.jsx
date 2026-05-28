import { cva } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-[12px] font-medium transition-[box-shadow,background-color,color] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5 [&_svg]:shrink-0 leading-none tracking-[-0.005em]',
  {
    variants: {
      variant: {
        default:
          'bg-(--color-accent) text-white shadow-[inset_0_1px_0_oklch(1_0_0_/_0.15),0_0_0_1px_oklch(0.78_0.16_215_/_0.5)] hover:bg-(--color-accent-strong)',
        secondary:
          'bg-(--color-surface-elevated) text-(--color-text-soft) shadow-[inset_0_0_0_1px_var(--color-line-strong),inset_0_1px_0_oklch(1_0_0_/_0.04)] hover:bg-(--color-surface-overlay) hover:text-(--color-text)',
        ghost:
          'text-(--color-muted) hover:bg-(--color-surface-elevated) hover:text-(--color-text)',
        outline:
          'bg-transparent text-(--color-text-soft) shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-(--color-surface-elevated) hover:shadow-[inset_0_0_0_1px_var(--color-line-strongest)]',
        destructive:
          'bg-(--color-danger) text-white hover:bg-(--color-danger)/90',
        link:
          'text-(--color-accent) underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-8 px-3.5',
        sm: 'h-7 px-2.5 text-[11px]',
        lg: 'h-9 px-4',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
