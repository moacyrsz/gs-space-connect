import { cva } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

// Botão executivo: primary preto sólido (Linear/Vercel), secondary com
// border fina, sem gradient nem glow.
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-[12px] font-medium transition-[background-color,color,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5 [&_svg]:shrink-0 leading-none tracking-[-0.005em]',
  {
    variants: {
      variant: {
        // Primary preto sólido — ação executiva principal (Vercel/Linear)
        default:
          'bg-(--color-text) text-white hover:bg-(--color-text-soft)',
        secondary:
          'bg-(--color-surface) text-(--color-text) border border-(--color-line) hover:border-(--color-line-strong) hover:bg-(--color-surface-elevated)',
        ghost:
          'text-(--color-muted) hover:bg-(--color-surface-elevated) hover:text-(--color-text)',
        outline:
          'bg-transparent text-(--color-text-soft) border border-(--color-line) hover:bg-(--color-surface-elevated) hover:border-(--color-line-strong)',
        accent:
          'bg-(--color-accent) text-white hover:bg-(--color-accent-strong)',
        destructive:
          'bg-(--color-danger) text-white hover:opacity-90',
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
