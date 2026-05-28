import { cva } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-[12px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5 [&_svg]:shrink-0 leading-none',
  {
    variants: {
      variant: {
        default:
          'bg-(--color-accent) text-white hover:bg-(--color-accent-strong)',
        secondary:
          'bg-(--color-panel-2) text-(--color-text) hover:bg-(--color-panel-3) border border-(--color-line)',
        ghost:
          'text-(--color-muted) hover:bg-(--color-panel-2) hover:text-(--color-text)',
        outline:
          'border border-(--color-line) bg-transparent text-(--color-text-soft) hover:bg-(--color-panel-2) hover:border-(--color-line-strong)',
        destructive:
          'bg-(--color-danger) text-white hover:bg-(--color-danger)/90',
        link: 'text-(--color-accent) underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-8 px-3',
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
