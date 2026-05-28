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
  AlertTriangle,
  Square,
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
import { streamChat } from '@/lib/chat'
import { cn } from '@/lib/utils'

const introMessage = {
  id: 'intro',
  role: 'assistant',
  content:
    'Olá. Sou o assistente técnico da plataforma **Space Connect** — projeto integrador da Global Solution 2026.1 da FIAP. Posso responder sobre:\n\n- a própria plataforma e como suas 9 disciplinas se conectam (Visão Computacional, IoT, Computação Quântica, RPA, GenAI, Neuromórfica, Front-end, Governança e a camada de NLP que é onde estou agora);\n- normas de eficiência hídrica e energética para edifícios verdes (*NBR 15527, NBR 16401-1, ASHRAE 90.1, LEED v4.1, AQUA-HQE, BREEAM, ISO 50001*);\n- aplicação dessas práticas a infraestrutura espacial — estações remotas, missões orbitais, sistemas ECLSS.\n\nO que gostaria de saber?',
}

const quickActions = [
  {
    icon: Sparkles,
    label: 'Sobre a plataforma',
    q: 'Explique o que é a plataforma Space Connect, qual o cenário escolhido e como ela cobre as 9 disciplinas da GS 2026.1.',
  },
  {
    icon: Leaf,
    label: 'Eficiência hídrica',
    q: 'Como a NBR 15527 se aplica ao aproveitamento de água em estações remotas?',
  },
  {
    icon: Zap,
    label: 'Eficiência energética',
    q: 'O que muda em ASHRAE 90.1 quando aplicada a módulos pressurizados em órbita?',
  },
  {
    icon: Award,
    label: 'Net Zero e ECLSS',
    q: 'O conceito de Net Zero Energy se aplica a missões espaciais e como ele dialoga com sistemas ECLSS?',
  },
]

const promptSuggestions = [
  'O que é a plataforma Space Connect?',
  'Como as 9 disciplinas da GS se conectam?',
  'Compare LEED, AQUA-HQE e BREEAM',
  'Princípios ECLSS aplicáveis a edifícios na Terra',
]

function Assistant() {
  const [params] = useSearchParams()
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([introMessage])
  const [pending, setPending] = useState(false)
  const scrollRef = useRef(null)
  const abortRef = useRef(null)

  useEffect(() => {
    const q = params.get('q')
    if (q) setInput(q.replace(/\+/g, ' '))
  }, [params])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history, pending])

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  const send = async (text) => {
    const q = text.trim()
    if (!q || pending) return

    const userMsg = { id: Date.now(), role: 'user', content: q }
    const assistantId = Date.now() + 1
    const assistantSeed = {
      id: assistantId,
      role: 'assistant',
      content: '',
      streaming: true,
    }

    // Snapshot do histórico que será enviado à API (somente user/assistant
    // já existentes, mais a nova pergunta — sem o intro fixo nem a seed vazia).
    const apiMessages = [
      ...history
        .filter((m) => m.id !== 'intro' && (m.role === 'user' || m.role === 'assistant'))
        .map(({ role, content }) => ({ role, content })),
      { role: 'user', content: q },
    ]

    setHistory((h) => [...h, userMsg, assistantSeed])
    setInput('')
    setPending(true)

    const controller = new AbortController()
    abortRef.current = controller

    await streamChat({
      messages: apiMessages,
      signal: controller.signal,
      onDelta: (delta) => {
        setHistory((h) =>
          h.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + delta } : m,
          ),
        )
      },
      onDone: () => {
        setHistory((h) =>
          h.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m)),
        )
        setPending(false)
        abortRef.current = null
      },
      onError: (msg, payload) => {
        setHistory((h) =>
          h.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  streaming: false,
                  error: msg,
                  content: m.content || '',
                }
              : m,
          ),
        )
        setPending(false)
        abortRef.current = null
        if (payload?.status === 401 || payload?.status === 403) {
          toast.error('Chave do Gemini inválida ou ausente', {
            description: 'Configure GEMINI_API_KEY na Vercel.',
          })
        } else if (payload?.status === 429) {
          toast.error('Limite de uso atingido', {
            description: 'Free tier: 15 req/min, 1.500 req/dia. Aguarde alguns minutos.',
          })
        } else {
          toast.error('Falha no assistente', { description: msg })
        }
      },
    })
  }

  const stop = () => {
    abortRef.current?.abort()
    abortRef.current = null
    setHistory((h) =>
      h.map((m) => (m.streaming ? { ...m, streaming: false } : m)),
    )
    setPending(false)
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
          <p className="text-[11px] uppercase tracking-wider text-(--color-faint) font-medium mb-1">
            Camada de IA · NLP + GenAI
          </p>
          <h1 className="text-[26px] font-semibold tracking-[-0.01em] text-(--color-text)">
            Assistente Técnico
          </h1>
          <p className="mt-1 text-[13px] text-(--color-muted) max-w-2xl">
            Respostas geradas em tempo real por <strong className="text-(--color-text)">Gemini 2.5 Flash</strong> com
            prompt sistêmico especializado na plataforma Space Connect, em
            normas de eficiência hídrica e energética e em sua aplicação a
            infraestrutura espacial.
          </p>
        </div>

        <Card className="hover-lift overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md border border-(--color-line) bg-(--color-panel-2) text-(--color-accent)">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div>
                <CardTitle>Conversa</CardTitle>
                <CardDescription className="font-mono">
                  {history.filter((m) => m.role !== 'system').length} mensagens · gemini-2.5-flash
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
                {pending ? (
                  <Button type="button" variant="secondary" onClick={stop}>
                    <Square className="h-4 w-4" />
                    Parar
                  </Button>
                ) : (
                  <Button type="submit" disabled={!input.trim()}>
                    <Send className="h-4 w-4" />
                    Enviar
                  </Button>
                )}
              </form>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {promptSuggestions.map((s) => (
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
                  <p className="text-[11px] text-(--color-muted) line-clamp-2">
                    {qa.q}
                  </p>
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
            <CardDescription>Tópicos cobertos pelo prompt</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5 text-xs">
            {[
              'NBR 15527:2019 — aproveitamento de água da chuva',
              'NBR 16401-1:2008 — climatização e qualidade do ar',
              'NBR 15575:2013 — edificações habitacionais',
              'ASHRAE 90.1-2019 — Energy Standard',
              'LEED v4.1 — Building Design and Construction',
              'AQUA-HQE — processo brasileiro',
              'BREEAM International New Construction',
              'ISO 50001:2018 — gestão de energia',
              'NZEB — definições DOE/NREL',
              'ECLSS — Environmental Control and Life Support Systems',
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
              Atendido por Google Gemini 2.5 Flash com prompt sistêmico
              especializado. Pipeline completo de RAG sobre PDFs ficará
              disponível na disciplina de GenAI.
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

  if (message.error && !message.content) {
    return (
      <div className="flex items-start gap-2.5 max-w-[88%] fade-up">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-(--color-danger)/30 bg-(--color-danger)/10 text-(--color-danger)">
          <AlertTriangle className="h-3.5 w-3.5" />
        </div>
        <div className="rounded-md border border-(--color-danger)/30 bg-(--color-danger)/5 px-3 py-2 text-[13px] text-(--color-text)">
          <p className="font-medium mb-0.5">Não consegui responder agora.</p>
          <p className="text-[11px] text-(--color-muted)">{message.error}</p>
        </div>
      </div>
    )
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
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border',
          isUser
            ? 'bg-(--color-panel-2) text-(--color-muted) border-(--color-line)'
            : 'bg-(--color-accent)/10 text-(--color-accent) border-(--color-accent)/30',
        )}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            'rounded-md px-3 py-2 text-[13px] leading-relaxed max-w-none',
            isUser
              ? 'bg-(--color-accent)/10 text-(--color-text) border border-(--color-accent)/30'
              : 'bg-(--color-panel-2) text-(--color-text-soft) border border-(--color-line)',
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
                  p: (props) => <p className="m-0 mb-2 last:mb-0" {...props} />,
                  strong: (props) => (
                    <strong className="text-(--color-text) font-semibold" {...props} />
                  ),
                  em: (props) => (
                    <em className="text-(--color-accent) not-italic font-medium" {...props} />
                  ),
                  code: (props) => (
                    <code
                      className="rounded bg-(--color-panel-3) px-1 py-0.5 text-[12px] font-mono text-(--color-text)"
                      {...props}
                    />
                  ),
                  ul: (props) => (
                    <ul className="m-0 mb-2 ml-5 list-disc space-y-0.5" {...props} />
                  ),
                  ol: (props) => (
                    <ol className="m-0 mb-2 ml-5 list-decimal space-y-0.5" {...props} />
                  ),
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
          <div className="mt-1.5 flex items-center gap-1.5">
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
