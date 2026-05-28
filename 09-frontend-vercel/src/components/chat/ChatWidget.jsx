import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bot, X, RotateCcw, ExternalLink, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useChat } from './useChat'
import ChatPanel from './ChatPanel'
import { cn } from '@/lib/utils'

const widgetSuggestions = [
  'O que é a plataforma Space Connect?',
  'Como as 9 disciplinas se conectam?',
  'Como aplicar NBR 15527 em estações remotas?',
]

/**
 * Floating Action Button + popup do chat (estilo Intercom/HubSpot).
 * Aparece em todas as rotas exceto /assistente (que já tem a versão full).
 */
function ChatWidget() {
  const location = useLocation()
  const isAssistantPage = location.pathname.startsWith('/assistente')

  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const { history, pending, send, stop, reset } = useChat()

  // ESC para fechar
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const handleSend = (text) => {
    send(text)
    setInput('')
  }

  if (isAssistantPage) return null

  // Conta mensagens reais (excluindo intro) para badge no botão
  const realMessages = history.filter((m) => m.id !== 'intro').length

  return (
    <>
      {/* FAB */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Fechar assistente' : 'Abrir assistente'}
        className={cn(
          'fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]',
          open
            ? 'bg-(--color-surface-overlay) text-(--color-text) shadow-[inset_0_0_0_1px_var(--color-line-strongest),0_8px_24px_-8px_oklch(0_0_0_/_0.5)]'
            : 'bg-gradient-to-br from-(--color-accent) to-(--color-accent-strong) text-white shadow-[inset_0_1px_0_oklch(1_0_0_/_0.2),0_0_0_1px_oklch(0.78_0.16_215_/_0.4),0_8px_24px_-4px_oklch(0.72_0.15_215_/_0.5),0_0_32px_-8px_oklch(0.72_0.15_215_/_0.5)]',
        )}
        style={{ transform: open ? 'rotate(0deg)' : undefined }}
      >
        {open ? (
          <X className="h-5 w-5" strokeWidth={2} />
        ) : (
          <Bot className="h-5 w-5" strokeWidth={2} />
        )}
        {!open && realMessages > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-(--color-bg) px-1 text-[10px] font-semibold text-(--color-accent) shadow-[inset_0_0_0_1px_var(--color-accent)]">
            {realMessages}
          </span>
        )}
      </button>

      {/* Popup */}
      {open && (
        <div
          className="fixed bottom-20 right-5 z-50 w-[380px] max-w-[calc(100vw-2.5rem)] h-[560px] max-h-[calc(100vh-7rem)] flex flex-col surface-pop overflow-hidden fade-up"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-(--color-line)">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-(--color-accent) to-(--color-accent-strong) text-white shadow-[inset_0_1px_0_oklch(1_0_0_/_0.2),0_0_0_1px_oklch(0.78_0.16_215_/_0.4),0_0_16px_-4px_oklch(0.72_0.15_215_/_0.4)]">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[13px] tracking-[-0.005em] text-(--color-text) leading-tight"
                style={{ fontWeight: 538 }}
              >
                Assistente Space Connect
              </p>
              <p className="text-[11px] text-(--color-muted) font-mono leading-tight mt-0.5">
                gemini-2.5-flash · {realMessages} {realMessages === 1 ? 'msg' : 'msgs'}
              </p>
            </div>
            <Badge variant="accent" className="hidden sm:inline-flex h-[18px] text-[9px]">
              <span className="relative flex h-1 w-1">
                <span className="absolute inline-flex h-full w-full rounded-full bg-(--color-accent) badge-pulse" />
                <span className="relative inline-flex h-1 w-1 rounded-full bg-(--color-accent)" />
              </span>
              ONLINE
            </Badge>
          </div>

          {/* Painel reutilizado */}
          <ChatPanel
            history={history}
            pending={pending}
            input={input}
            onInputChange={setInput}
            onSend={handleSend}
            onStop={stop}
            suggestions={widgetSuggestions}
            dense
            className="flex-1 min-h-0"
          />

          {/* Footer com ações */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-(--color-line) bg-(--color-bg-canvas)/40">
            <button
              type="button"
              onClick={reset}
              disabled={pending || realMessages === 0}
              className="flex items-center gap-1 text-[11px] text-(--color-muted) hover:text-(--color-text) transition-colors disabled:opacity-40"
            >
              <RotateCcw className="h-2.5 w-2.5" strokeWidth={2} />
              Limpar
            </button>
            <Link
              to="/assistente"
              onClick={() => setOpen(false)}
              className="flex items-center gap-1 text-[11px] text-(--color-accent) hover:underline"
            >
              Abrir conversa completa
              <ExternalLink className="h-2.5 w-2.5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatWidget
