import { cn } from '@/lib/utils'

function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-[10px] bg-(--color-surface) text-(--color-text) border border-(--color-line) shadow-[0_1px_2px_rgba(31,29,26,0.04)]',
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }) {
  return (
    <div className={cn('flex flex-col gap-1 px-5 pt-5 pb-4', className)} {...props} />
  )
}

function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn(
        'text-[14px] leading-tight tracking-[-0.005em] text-(--color-text)',
        className,
      )}
      style={{ fontWeight: 500 }}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }) {
  return (
    <p
      className={cn('text-[12px] text-(--color-muted) leading-relaxed', className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }) {
  return <div className={cn('px-5 pb-5', className)} {...props} />
}

function CardFooter({ className, ...props }) {
  return (
    <div
      className={cn(
        'flex items-center px-5 py-4 border-t border-(--color-line)',
        className,
      )}
      {...props}
    />
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
