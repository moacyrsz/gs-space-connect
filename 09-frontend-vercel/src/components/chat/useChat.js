import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { streamChat } from '@/lib/chat'

export const introMessage = {
  id: 'intro',
  role: 'assistant',
  content:
    'Olá. Sou o assistente técnico da plataforma **Space Connect** — projeto integrador da Global Solution 2026.1 da FIAP. Posso responder sobre:\n\n- a própria plataforma e como suas 9 disciplinas se conectam (Visão Computacional, IoT, Computação Quântica, RPA, GenAI, Neuromórfica, Front-end, Governança e a camada de NLP que é onde estou agora);\n- normas de eficiência hídrica e energética para edifícios verdes (*NBR 15527, NBR 16401-1, ASHRAE 90.1, LEED v4.1, AQUA-HQE, BREEAM, ISO 50001*);\n- aplicação dessas práticas a infraestrutura espacial — estações remotas, missões orbitais, sistemas ECLSS.\n\nO que gostaria de saber?',
}

/**
 * Hook compartilhado entre /assistente (página) e ChatWidget (FAB).
 * Cada instância mantém seu próprio histórico e abort controller.
 */
export function useChat() {
  const [history, setHistory] = useState([introMessage])
  const [pending, setPending] = useState(false)
  const abortRef = useRef(null)

  useEffect(() => () => abortRef.current?.abort(), [])

  const send = useCallback(
    async (text) => {
      const q = String(text ?? '').trim()
      if (!q || pending) return

      const userMsg = { id: Date.now(), role: 'user', content: q }
      const assistantId = Date.now() + 1
      const assistantSeed = {
        id: assistantId,
        role: 'assistant',
        content: '',
        streaming: true,
      }

      const apiMessages = [
        ...history
          .filter(
            (m) => m.id !== 'intro' && (m.role === 'user' || m.role === 'assistant'),
          )
          .map(({ role, content }) => ({ role, content })),
        { role: 'user', content: q },
      ]

      setHistory((h) => [...h, userMsg, assistantSeed])
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
                ? { ...m, streaming: false, error: msg, content: m.content || '' }
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
              description: 'Aguarde alguns minutos e tente novamente.',
            })
          } else {
            toast.error('Falha no assistente', { description: msg })
          }
        },
      })
    },
    [history, pending],
  )

  const stop = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setHistory((h) => h.map((m) => (m.streaming ? { ...m, streaming: false } : m)))
    setPending(false)
  }, [])

  const reset = useCallback(() => {
    if (pending) return
    setHistory([introMessage])
    toast.success('Conversa reiniciada')
  }, [pending])

  return { history, pending, send, stop, reset }
}
