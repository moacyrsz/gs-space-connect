import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Bot,
  FileText,
  Sparkles,
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
import { Button } from '@/components/ui/button'
import ChatPanel from '@/components/chat/ChatPanel'
import { useChat } from '@/components/chat/useChat'

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

const knowledgeBase = [
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
]

function Assistant() {
  const [params] = useSearchParams()
  const [input, setInput] = useState('')
  const { history, pending, send, stop, reset } = useChat()

  useEffect(() => {
    const q = params.get('q')
    if (q) setInput(q.replace(/\+/g, ' '))
  }, [params])

  const handleSend = (text) => {
    send(text)
    setInput('')
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
      <div className="xl:col-span-8 flex flex-col gap-4">
        <div className="space-y-1.5">
          <p className="label-caps">Camada de IA · NLP + GenAI</p>
          <h1 className="heading-display text-[30px] leading-[1.1] text-(--color-text)">
            Assistente Técnico
          </h1>
          <p className="text-[13px] text-(--color-muted) max-w-2xl leading-relaxed text-balance">
            Respostas geradas em tempo real por{' '}
            <strong
              className="text-(--color-text)"
              style={{ fontWeight: 600 }}
            >
              Gemini 2.5 Flash
            </strong>{' '}
            com prompt sistêmico especializado na plataforma Space Connect, em
            normas de eficiência hídrica e energética e em sua aplicação a
            infraestrutura espacial.
          </p>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between !pb-3 !border-b !border-(--color-line)">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-(--color-accent) text-white">
                <Bot className="h-3.5 w-3.5" strokeWidth={2} />
              </div>
              <div>
                <CardTitle>Conversa</CardTitle>
                <CardDescription style={{ fontFamily: 'var(--font-mono)' }}>
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
              <RotateCcw className="h-3 w-3" strokeWidth={1.75} />
              Limpar
            </Button>
          </CardHeader>
          <CardContent className="!p-0">
            <ChatPanel
              history={history}
              pending={pending}
              input={input}
              onInputChange={setInput}
              onSend={handleSend}
              onStop={stop}
              suggestions={promptSuggestions}
              scrollClassName="h-[480px]"
            />
          </CardContent>
        </Card>
      </div>

      <div className="xl:col-span-4 flex flex-col gap-4">
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-(--color-accent)" strokeWidth={1.5} />
              Atalhos
            </CardTitle>
            <CardDescription>Tópicos populares</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {quickActions.map((qa) => (
              <button
                key={qa.label}
                type="button"
                onClick={() => handleSend(qa.q)}
                disabled={pending}
                className="group flex items-center gap-3 rounded-md px-3 py-2.5 text-left transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] border border-(--color-line) bg-(--color-surface) hover:border-(--color-line-strong) hover:bg-(--color-surface-elevated) disabled:opacity-50"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-(--color-accent-soft) text-(--color-accent) border border-(--color-accent)/20">
                  <qa.icon className="h-3 w-3" strokeWidth={1.5} />
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[12.5px] text-(--color-text) leading-tight tracking-[-0.005em]"
                    style={{ fontWeight: 500 }}
                  >
                    {qa.label}
                  </p>
                  <p className="text-[11px] text-(--color-muted) line-clamp-2 leading-relaxed mt-0.5">
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
              <BookOpen className="h-3.5 w-3.5 text-(--color-success)" strokeWidth={1.5} />
              Base de conhecimento
            </CardTitle>
            <CardDescription>Tópicos cobertos pelo prompt</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-xs">
            {knowledgeBase.map((d) => (
              <div
                key={d}
                className="flex items-center gap-2 rounded-md px-2.5 py-1.5 border border-(--color-line) bg-(--color-surface)"
              >
                <FileText
                  className="h-3 w-3 text-(--color-faint) shrink-0"
                  strokeWidth={1.5}
                />
                <span className="text-[11.5px] text-(--color-text-soft) truncate">
                  {d}
                </span>
              </div>
            ))}
            <p className="text-[11px] text-(--color-faint) mt-2 px-1 leading-relaxed">
              Atendido por Google Gemini 2.5 Flash com prompt sistêmico especializado.
              Pipeline completo de RAG sobre PDFs ficará disponível na disciplina de
              GenAI.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Assistant
