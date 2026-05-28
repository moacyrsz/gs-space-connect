import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-(--color-surface-elevated)', className)}
      {...props}
    />
  )
}

export { Skeleton }
