// Cliente do endpoint /api/chat. Faz fetch streaming (SSE) e chama onDelta a
// cada token recebido, onError em falha de rede/servidor, onDone ao final.

export async function streamChat({ messages, onDelta, onDone, onError, signal }) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal,
    })

    if (!res.ok) {
      const errBody = await safeJson(res)
      onError?.(errBody?.error || `HTTP ${res.status}`, errBody)
      return
    }

    if (!res.body) {
      onError?.('Resposta sem corpo (streaming não disponível)')
      return
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const parts = buffer.split('\n\n')
      buffer = parts.pop() ?? ''
      for (const part of parts) {
        const line = part.trim()
        if (!line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (payload === '[DONE]') {
          onDone?.()
          return
        }
        try {
          const evt = JSON.parse(payload)
          if (evt.delta) onDelta?.(evt.delta)
          else if (evt.error) onError?.(evt.message || evt.error, evt)
        } catch {
          // ignora pedaços incompletos
        }
      }
    }
    onDone?.()
  } catch (e) {
    if (e.name === 'AbortError') return
    onError?.(e.message || 'Falha de rede', e)
  }
}

async function safeJson(res) {
  try {
    return await res.json()
  } catch {
    return null
  }
}
