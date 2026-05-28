import { useEffect, useRef, useState } from 'react'
import { Bot, FileText, Send, Sparkles, User } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { mockRagAnswer, ragSuggestions } from '@/data/mocks'

function Assistant() {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([
    {
      id: 0,
      role: 'assistant',
      content:
        'Olá. Sou o assistente técnico da plataforma Space Connect. Posso ajudar com normas de eficiência hídrica e energética para edifícios verdes (LEED, AQUA-HQE, BREEAM, ASHRAE 90.1, NBR 15527 e NBR 16401-1) e com a aplicabilidade dessas referências a estações remotas e missões espaciais. O que gostaria de saber?',
      sources: ['Espaço de conhecimento padrão'],
    },
  ])
  const [pending, setPending] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [history, pending])

  const send = (text) => {
    const q = text.trim()
    if (!q || pending) return
    const userMsg = { id: Date.now(), role: 'user', content: q }
    setHistory((h) => [...h, userMsg])
    setInput('')
    setPending(true)
    const delay = 600 + Math.random() * 800
    setTimeout(() => {
      const { answer, sources } = mockRagAnswer(q)
      setHistory((h) => [
        ...h,
        { id: Date.now() + 1, role: 'assistant', content: answer, sources },
      ])
      setPending(false)
    }, delay)
  }

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Assistente Técnico</h1>
        <p className="text-sm text-(--color-muted)">
          Camada combinada das disciplinas de NLP (chatbot fine-tuned em Edifícios Verdes)
          e Generative AI (RAG sobre documentos espaciais). Esta versão pública usa respostas
          simuladas; o pipeline real consome o modelo ajustado e o vector store.
        </p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-(--color-accent)" />
              Conversa
            </CardTitle>
            <CardDescription>NLP + RAG · {history.filter((m) => m.role !== 'system').length} mensagens</CardDescription>
          </div>
          <Badge variant="outline">Mock</Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div
            ref={scrollRef}
            className="h-[420px] overflow-y-auto pr-2 scrollbar-thin flex flex-col gap-3"
          >
            {history.map((m) => (
              <Message key={m.id} message={m} />
            ))}
            {pending && (
              <div className="flex items-start gap-2.5 max-w-[85%]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--color-accent)/15 text-(--color-accent)">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            )}
          </div>

          <Separator />

          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte sobre NBR 15527, ASHRAE 90.1, Net Zero, certificações…"
            />
            <Button type="submit" disabled={pending || !input.trim()}>
              <Send className="h-4 w-4" />
              Enviar
            </Button>
          </form>

          <div className="flex flex-wrap gap-2">
            {ragSuggestions.map((s) => (
              <Button
                key={s}
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => send(s)}
                disabled={pending}
              >
                {s}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Message({ message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex items-start gap-2.5 max-w-[88%] ${isUser ? 'self-end flex-row-reverse' : ''}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser
            ? 'bg-(--color-panel-2) text-(--color-muted)'
            : 'bg-(--color-accent)/15 text-(--color-accent)'
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={`rounded-lg px-3.5 py-2.5 text-sm leading-relaxed ${
            isUser
              ? 'bg-(--color-accent)/10 text-(--color-text) border border-(--color-accent)/30'
              : 'bg-(--color-panel-2) text-(--color-text) border border-(--color-line)'
          }`}
        >
          {message.content}
        </div>
        {message.sources && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1 text-[11px] text-(--color-muted)">
              <FileText className="h-3 w-3" />
              fontes:
            </span>
            {message.sources.map((s) => (
              <span
                key={s}
                className="rounded-full bg-(--color-panel-2) px-2 py-0.5 text-[11px] text-(--color-muted) border border-(--color-line)"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Assistant
