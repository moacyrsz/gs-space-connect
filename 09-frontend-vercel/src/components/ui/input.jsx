import { cn } from '@/lib/utils'

function Input({ className, type = 'text', ...props }) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-8 w-full rounded-md bg-(--color-surface) px-3 text-[13px] text-(--color-text) placeholder:text-(--color-faint) border border-(--color-line) transition-[border-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:border-(--color-accent) focus-visible:shadow-[0_0_0_3px_rgba(180,83,9,0.12)] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
