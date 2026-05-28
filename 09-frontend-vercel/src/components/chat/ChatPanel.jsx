import { useEffect, useRef, useState } from 'react'
import { Send, Square } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import ChatMessage from './ChatMessage'

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
  const sendBtnRef = useRef(null)
  const [magnet, setMagnet] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history, pending])

  // Magnetic hover: o botão Enviar segue o cursor levemente em raio 40px
  useEffect(() => {
    const btn = sendBtnRef.current
    if (!btn) return
    const onMove = (e) => {
      const rect = btn.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 60) {
        const factor = (60 - dist) / 60
        setMagnet({ x: dx * 0.18 * factor, y: dy * 0.18 * factor })
      } else if (magnet.x !== 0 || magnet.y !== 0) {
        setMagnet({ x: 0, y: 0 })
      }
    }
    const onLeave = () => setMagnet({ x: 0, y: 0 })
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

      <div
        className={cn(
          'border-t border-(--color-line)',
          dense ? 'px-4 py-3' : 'px-5 py-4',
        )}
      >
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
            <Button
              type="button"
              variant="secondary"
              size={dense ? 'sm' : 'default'}
              onClick={onStop}
            >
              <Square className="h-3 w-3" strokeWidth={2.5} />
              {!dense && 'Parar'}
            </Button>
          ) : (
            <Button
              ref={sendBtnRef}
              type="submit"
              size={dense ? 'sm' : 'default'}
              disabled={!input.trim()}
              className="magnetic"
              style={{ transform: `translate(${magnet.x}px, ${magnet.y}px)` }}
            >
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
                className="rounded-full px-2.5 py-1 text-[11px] text-(--color-muted) border border-(--color-line) bg-(--color-surface) hover:bg-(--color-surface-elevated) hover:text-(--color-text) hover:border-(--color-line-strong) transition-colors disabled:opacity-50"
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
