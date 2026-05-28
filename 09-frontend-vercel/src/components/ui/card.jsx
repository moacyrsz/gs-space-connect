import { cn } from '@/lib/utils'

function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-md border border-(--color-line) bg-(--color-panel) text-(--color-text)',
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-0.5 px-4 pt-4 pb-3 border-b border-(--color-line)',
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn(
        'text-[13px] font-medium leading-tight tracking-tight text-(--color-text)',
        className,
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }) {
  return (
    <p
      className={cn('text-[11px] text-(--color-muted)', className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }) {
  return <div className={cn('p-4', className)} {...props} />
}

function CardFooter({ className, ...props }) {
  return (
    <div
      className={cn('flex items-center px-4 py-3 border-t border-(--color-line)', className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
