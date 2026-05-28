import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { toast } from 'sonner'
import { AlertTriangle, Bot, Check, Copy, User } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/**
 * Bubble com avatar refinado:
 * - Bot: gradiente accent + glow leve (consistente com a estética premium)
 * - User: surface-elevated com inner-highlight
 * - Markdown completo com componentes estilizados
 * - Botão de copiar inline em hover/foco
 */
function ChatMessage({ message, dense = false }) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    toast.success('Resposta copiada')
    setTimeout(() => setCopied(false), 1500)
  }

  if (message.error && !message.content) {
    return (
      <div className="flex items-start gap-2.5 max-w-[88%] fade-up">
        <Avatar variant="error" />
        <div className="rounded-lg px-3 py-2 text-[13px] text-(--color-text) shadow-[inset_0_0_0_1px_oklch(0.68_0.20_22_/_0.3)] bg-(--color-danger)/5">
          <p className="font-medium mb-0.5" style={{ fontWeight: 510 }}>
            Não consegui responder agora.
          </p>
          <p className="text-[11px] text-(--color-muted)">{message.error}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-start gap-2.5 fade-up group/msg',
        isUser ? 'self-end flex-row-reverse max-w-[88%]' : 'max-w-[92%]',
      )}
    >
      <Avatar variant={isUser ? 'user' : 'bot'} />
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            'rounded-lg leading-relaxed max-w-none',
            dense ? 'px-3 py-2 text-[12.5px]' : 'px-3.5 py-2.5 text-[13px]',
            isUser
              ? 'bg-(--color-accent)/10 text-(--color-text) shadow-[inset_0_0_0_1px_oklch(0.72_0.15_215_/_0.3)]'
              : 'bg-(--color-surface-elevated) text-(--color-text-soft) shadow-[inset_0_0_0_1px_var(--color-line),inset_0_1px_0_oklch(1_0_0_/_0.03)]',
          )}
        >
          {message.streaming && !message.content ? (
            <div className="space-y-2 py-1">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ) : isUser ? (
            <p className="m-0">{message.content}</p>
          ) : (
            <div className={cn(message.streaming && 'streaming-caret')}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: (props) => (
                    <p className="m-0 mb-2 last:mb-0 leading-relaxed" {...props} />
                  ),
                  strong: (props) => (
                    <strong
                      className="text-(--color-text)"
                      style={{ fontWeight: 538 }}
                      {...props}
                    />
                  ),
                  em: (props) => (
                    <em
                      className="text-(--color-accent) not-italic"
                      style={{ fontWeight: 510 }}
                      {...props}
                    />
                  ),
                  code: (props) => (
                    <code
                      className="rounded bg-(--color-surface-overlay) px-1 py-0.5 text-[12px] font-mono text-(--color-text)"
                      {...props}
                    />
                  ),
                  ul: (props) => (
                    <ul className="m-0 mb-2 ml-5 list-disc space-y-1" {...props} />
                  ),
                  ol: (props) => (
                    <ol className="m-0 mb-2 ml-5 list-decimal space-y-1" {...props} />
                  ),
                  li: (props) => <li className="leading-relaxed" {...props} />,
                  a: (props) => (
                    <a
                      className="text-(--color-accent) underline-offset-2 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                      {...props}
                    />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        {!isUser && message.content && !message.streaming && (
          <div className="mt-1 flex items-center gap-1.5 opacity-0 group-hover/msg:opacity-100 transition-opacity duration-150">
            <button
              type="button"
              onClick={onCopy}
              className="ml-auto flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-(--color-muted) shadow-[inset_0_0_0_1px_var(--color-line)] hover:text-(--color-text) hover:bg-(--color-surface-elevated) transition-colors"
            >
              {copied ? (
                <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
              ) : (
                <Copy className="h-2.5 w-2.5" strokeWidth={2} />
              )}
              {copied ? 'copiado' : 'copiar'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Avatar({ variant }) {
  if (variant === 'user') {
    return (
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-(--color-surface-elevated) text-(--color-muted) shadow-[inset_0_0_0_1px_var(--color-line-strong),inset_0_1px_0_oklch(1_0_0_/_0.04)]">
        <User className="h-3.5 w-3.5" strokeWidth={1.75} />
      </div>
    )
  }
  if (variant === 'error') {
    return (
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-(--color-danger)/10 text-(--color-danger) shadow-[inset_0_0_0_1px_oklch(0.68_0.20_22_/_0.3)]">
        <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.75} />
      </div>
    )
  }
  // bot — visual refinado: gradiente accent com glow
  return (
    <div
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-(--color-accent) to-(--color-accent-strong) text-white shadow-[inset_0_1px_0_oklch(1_0_0_/_0.2),0_0_0_1px_oklch(0.78_0.16_215_/_0.4),0_0_16px_-4px_oklch(0.72_0.15_215_/_0.4)]"
    >
      <Bot className="h-3.5 w-3.5" strokeWidth={2} />
    </div>
  )
}

export default ChatMessage
