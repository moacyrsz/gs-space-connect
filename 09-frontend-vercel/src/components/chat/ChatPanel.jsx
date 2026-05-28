import { useEffect, useRef } from 'react'
import { Send, Square } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import ChatMessage from './ChatMessage'

/**
 * Painel de chat reutilizável (mensagens + composer + sugestões).
 * Usado tanto na página /assistente quanto no ChatWidget flutuante.
 */
function ChatPanel({
  history,
  pending,
  input,
  onInputChange,
  onSend,
  onStop,
  suggestions = [],
  dense = false,
  className,
  scrollClassName,
}) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history, pending])

  const submit = (e) => {
    e.preventDefault()
    onSend(input)
  }

  return (
    <div className={cn('flex flex-col min-h-0', className)}>
      <div
        ref={scrollRef}
        className={cn(
          'flex-1 overflow-y-auto scrollbar-thin flex flex-col gap-3.5',
          dense ? 'px-4 py-3.5' : 'px-5 py-4',
          scrollClassName,
        )}
      >
        {history.map((m) => (
          <ChatMessage key={m.id} message={m} dense={dense} />
        ))}
      </div>

      <div className={cn('border-t border-(--color-line)', dense ? 'px-4 py-3' : 'px-5 py-4')}>
        <form className="flex items-center gap-2" onSubmit={submit}>
          <Input
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={
              dense
                ? 'Pergunte ao assistente…'
                : 'Pergunte sobre NBR 15527, ASHRAE 90.1, Net Zero, certificações…'
            }
            disabled={pending}
            autoFocus={dense}
          />
          {pending ? (
            <Button type="button" variant="secondary" size={dense ? 'sm' : 'default'} onClick={onStop}>
              <Square className="h-3 w-3" strokeWidth={2.5} />
              {!dense && 'Parar'}
            </Button>
          ) : (
            <Button type="submit" size={dense ? 'sm' : 'default'} disabled={!input.trim()}>
              <Send className="h-3.5 w-3.5" strokeWidth={1.75} />
              {!dense && 'Enviar'}
            </Button>
          )}
        </form>

        {suggestions.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSend(s)}
                disabled={pending}
                className="rounded-full px-2.5 py-1 text-[11px] text-(--color-muted) shadow-[inset_0_0_0_1px_var(--color-line)] hover:bg-(--color-surface-elevated) hover:text-(--color-text) transition-colors disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatPanel
