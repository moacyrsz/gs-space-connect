import { cn } from '@/lib/utils'

function Input({ className, type = 'text', ...props }) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-8 w-full rounded-md border border-(--color-line) bg-(--color-panel) px-2.5 text-[13px] text-(--color-text) placeholder:text-(--color-faint) focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--color-accent) focus-visible:border-(--color-accent) disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
