import { cn } from '@/lib/utils'

function Input({ className, type = 'text', ...props }) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-8 w-full rounded-md bg-(--color-surface) px-3 text-[13px] text-(--color-text) placeholder:text-(--color-faint) shadow-[inset_0_0_0_1px_var(--color-line-strong),inset_0_1px_0_oklch(1_0_0_/_0.02)] transition-shadow duration-200 focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_1px_var(--color-accent),0_0_0_2px_oklch(0.72_0.15_215_/_0.15)] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
