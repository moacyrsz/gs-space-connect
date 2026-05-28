import { cva } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-(--color-accent) text-(--color-bg) hover:bg-(--color-accent)/90',
        secondary:
          'bg-(--color-panel-2) text-(--color-text) hover:bg-(--color-panel-2)/70 border border-(--color-line)',
        ghost:
          'text-(--color-text) hover:bg-(--color-panel-2) hover:text-(--color-text)',
        outline:
          'border border-(--color-line) bg-transparent text-(--color-text) hover:bg-(--color-panel-2)',
        destructive:
          'bg-(--color-fire-high) text-white hover:bg-(--color-fire-high)/90',
        link:
          'text-(--color-accent) underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-10 px-6',
        icon: 'h-9 w-9',
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
