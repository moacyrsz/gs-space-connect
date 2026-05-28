import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Bot,
  FileText,
  Send,
  Sparkles,
  User,
  Copy,
  Check,
  RotateCcw,
  Database,
  BookOpen,
  Leaf,
  Zap,
  Award,
} from 'lucide-react'
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
import { cn } from '@/lib/utils'

const introMessage = {
  id: 'intro',
  role: 'assistant',
  content:
    'Olá. Sou o assistente técnico da plataforma **Space Connect**. Posso ajudar com normas de eficiência hídrica e energética para edifícios verdes — *LEED v4.1, AQUA-HQE, BREEAM, ASHRAE 90.1, NBR 15527, NBR 16401-1* — e com a aplicabilidade dessas referências a estações remotas e missões espaciais. O que gostaria de saber?',
  sources: ['Espaço de conhecimento padrão'],
}

const quickActions = [
  { icon: Leaf, label: 'Sobre eficiência hídrica', q: 'Como a NBR 15527 se aplica a estações remotas?' },
  { icon: Zap, label: 'Sobre eficiência energética', q: 'O que muda em ASHRAE 90.1 para módulos pressurizados?' },
  { icon: Award, label: 'Sobre certificações', q: 'Quais certificações fazem sentido para edifícios verdes?' },
  { icon: Database, label: 'Sobre Net Zero', q: 'Net Zero de energia funciona em ambiente espacial?' },
]

const STREAM_CHARS_PER_TICK = 3
const STREAM_TICK_MS = 18

function Assistant() {
  const [params] = useSearchParams()
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([introMessage])
  const [pending, setPending] = useState(false)
  const scrollRef = useRef(null)
  const streamTimerRef = useRef(null)

  // Permite pré-preencher via ?q= (Command Palette)
  useEffect(() => {
    const q = params.get('q')
    if (q) {
      setInput(q.replace(/\+/g, ' '))
    }
  }, [params])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history, pending])

  useEffect(() => {
    return () => {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current)
    }
  }, [])

  const send = (text) => {
    const q = text.trim()
    if (!q || pending) return

    const userMsg = { id: Date.now(), role: 'user', content: q }
    setHistory((h) => [...h, userMsg])
    setInput('')
    setPending(true)

    // Simula latência inicial antes de começar a "streamar"
    setTimeout(() => {
      const { answer, sources } = mockRagAnswer(q)
      const assistantId = Date.now() + 1
      // adiciona com conteúdo vazio + flag streaming
      setHistory((h) => [
        ...h,
        { id: assistantId, role: 'assistant', content: '', sources, streaming: true },
      ])

      let i = 0
      streamTimerRef.current = setInterval(() => {
        i = Math.min(i + STREAM_CHARS_PER_TICK, answer.length)
        setHistory((h) =>
          h.map((m) =>
            m.id === assistantId
              ? { ...m, content: answer.slice(0, i), streaming: i < answer.length }
              : m,
          ),
        )
        if (i >= answer.length) {
          clearInterval(streamTimerRef.current)
          streamTimerRef.current = null
          setPending(false)
        }
      }, STREAM_TICK_MS)
    }, 320)
  }

  const reset = () => {
    if (pending) return
    setHistory([introMessage])
    toast.success('Conversa reiniciada')
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
      <div className="xl:col-span-8 flex flex-col gap-4">
        <div>
          <Badge variant="outline" className="mb-2 font-mono">
            <Sparkles className="h-3 w-3 mr-1" /> NLP fine-tuned + RAG
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight gradient-text">
            Assistente Técnico
          </h1>
          <p className="mt-1 text-sm text-(--color-muted) max-w-2xl">
            Camada combinada das disciplinas de NLP (chatbot fine-tuned em Edifícios Verdes /
            Net Zero) e Generative AI (RAG sobre documentos espaciais). Esta versão pública
            usa respostas simuladas; a versão fim-a-fim consome o modelo ajustado com LoRA
            e o vector store da disciplina de GenAI.
          </p>
        </div>

        <Card className="hover-lift overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-(--color-line) py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-(--color-accent) to-(--color-accent-strong) shadow-[0_0_24px_-6px_oklch(0.72_0.18_50_/_0.6)]">
                <Bot className="h-4 w-4 text-(--color-bg)" />
              </div>
              <div>
                <CardTitle>Conversa</CardTitle>
                <CardDescription>
                  {history.filter((m) => m.role !== 'system').length} mensagens · Mock didático
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              disabled={pending || history.length <= 1}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Limpar
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-0">
            <div
              ref={scrollRef}
              className="h-[480px] overflow-y-auto px-5 py-4 scrollbar-thin flex flex-col gap-4"
            >
              {history.map((m) => (
                <Message key={m.id} message={m} />
              ))}
              {pending && history[history.length - 1]?.role !== 'assistant' && (
                <div className="flex items-start gap-2.5 max-w-[85%]">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-(--color-accent) to-(--color-accent-strong)">
                    <Bot className="h-4 w-4 text-(--color-bg)" />
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

            <div className="px-5 py-4">
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
                  disabled={pending}
                />
                <Button type="submit" disabled={pending || !input.trim()}>
                  <Send className="h-4 w-4" />
                  Enviar
                </Button>
              </form>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {ragSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    disabled={pending}
                    className="rounded-full border border-(--color-line) bg-(--color-panel-2)/40 px-2.5 py-1 text-[11px] text-(--color-muted) hover:bg-(--color-panel-2) hover:text-(--color-text) transition-colors disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar com quick actions e knowledge */}
      <div className="xl:col-span-4 flex flex-col gap-4">
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-(--color-accent)" />
              Atalhos
            </CardTitle>
            <CardDescription>Tópicos populares</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {quickActions.map((qa) => (
              <button
                key={qa.label}
                type="button"
                onClick={() => send(qa.q)}
                disabled={pending}
                className="group flex items-center gap-3 rounded-lg border border-(--color-line) bg-(--color-panel-2)/40 px-3 py-2.5 text-left transition-colors hover:bg-(--color-panel-2) disabled:opacity-50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-(--color-accent)/15 text-(--color-accent)">
                  <qa.icon className="h-3.5 w-3.5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-(--color-text) group-hover:text-(--color-accent) transition-colors">
                    {qa.label}
                  </p>
                  <p className="text-[11px] text-(--color-muted) truncate">{qa.q}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-(--color-vegetation)" />
              Base de conhecimento
            </CardTitle>
            <CardDescription>Fontes indexadas</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5 text-xs">
            {[
              'NBR 15527:2019 — Aproveitamento de água da chuva',
              'NBR 16401-1:2008 — Climatização e qualidade do ar',
              'NBR 15575:2013 — Edificações habitacionais',
              'ASHRAE 90.1-2019 — Energy Standard',
              'LEED v4.1 — Building Design and Construction',
              'AQUA-HQE — Processo Brasileiro',
              'BREEAM International New Construction',
              'ISO 50001:2018 — Energy management systems',
              'NZEB — DOE/NREL definitions',
              'GHG Protocol Corporate Standard',
            ].map((d) => (
              <div
                key={d}
                className="flex items-center gap-2 rounded-md bg-(--color-panel-2)/40 px-2.5 py-1.5"
              >
                <FileText className="h-3 w-3 text-(--color-muted) shrink-0" />
                <span className="text-(--color-text-soft) truncate">{d}</span>
              </div>
            ))}
            <p className="text-[11px] text-(--color-faint) mt-2 px-1">
              10 documentos indexados · ChromaDB · embeddings multilingual-e5-large
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Message({ message }) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    toast.success('Resposta copiada')
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div
      className={cn(
        'flex items-start gap-2.5 max-w-[88%] fade-up',
        isUser && 'self-end flex-row-reverse',
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser
            ? 'bg-(--color-panel-2) text-(--color-muted) border border-(--color-line)'
            : 'bg-gradient-to-br from-(--color-accent) to-(--color-accent-strong) text-(--color-bg) shadow-[0_0_16px_-4px_oklch(0.72_0.18_50_/_0.5)]',
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            'rounded-lg px-3.5 py-2.5 text-sm leading-relaxed prose prose-invert prose-sm max-w-none',
            isUser
              ? 'bg-(--color-accent)/10 text-(--color-text) border border-(--color-accent)/30'
              : 'bg-(--color-panel-2) text-(--color-text-soft) border border-(--color-line)',
          )}
        >
          {message.streaming && !message.content ? (
            <span className="text-(--color-muted)">Pensando…</span>
          ) : isUser ? (
            <p className="m-0">{message.content}</p>
          ) : (
            <div className={cn(message.streaming && 'streaming-caret')}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: (props) => <p className="m-0 mb-1 last:mb-0" {...props} />,
                  strong: (props) => (
                    <strong className="text-(--color-text) font-semibold" {...props} />
                  ),
                  em: (props) => <em className="text-(--color-accent)" {...props} />,
                  code: (props) => (
                    <code
                      className="rounded bg-(--color-panel-3) px-1 py-0.5 text-[12px] font-mono text-(--color-text)"
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
        {!isUser && message.sources && !message.streaming && message.content && (
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
            <button
              type="button"
              onClick={onCopy}
              className="ml-auto flex items-center gap-1 rounded-md border border-(--color-line) bg-(--color-panel-2) px-1.5 py-0.5 text-[11px] text-(--color-muted) hover:text-(--color-text) hover:bg-(--color-panel-3) transition-colors"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? 'copiado' : 'copiar'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Assistant
