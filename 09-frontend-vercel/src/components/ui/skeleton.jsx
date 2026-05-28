import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-(--color-panel-2)', className)}
      {...props}
    />
  )
}

export { Skeleton }
