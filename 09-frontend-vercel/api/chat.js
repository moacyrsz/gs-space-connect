// Vercel Edge Function: proxy seguro para a Google Gemini API.
// A chave fica em GEMINI_API_KEY (env var na Vercel) e nunca chega ao
// browser. Resposta é streamada via Server-Sent Events para o front
// renderizar token-a-token. Modelo: gemini-2.0-flash (free tier).

export const config = { runtime: 'edge' }

const SYSTEM_PROMPT = `Você é o assistente técnico da plataforma Space Connect, da Global Solution 2026.1 da FIAP. Atue como especialista em duas áreas combinadas:

1. **Edifícios verdes e Net Zero** — normas brasileiras (NBR 15527, NBR 16401-1, NBR 15575) e internacionais (ASHRAE 90.1, LEED v4.1, AQUA-HQE, BREEAM, ISO 50001), eficiência hídrica, eficiência energética, certificações.

2. **Aplicação dessas práticas a infraestrutura espacial** — estações remotas, missões orbitais, estações lunares e marcianas, sistemas ECLSS (Environmental Control and Life Support).

Sempre conecte os dois mundos quando fizer sentido. Use a linguagem técnica correta, cite a norma específica quando relevante, e seja conciso (3-6 parágrafos curtos no máximo).

Se a pergunta fugir completamente desses tópicos (ex.: receitas, política, esportes), redirecione gentilmente: "Posso ajudar com normas de eficiência hídrica/energética e sua aplicação a infraestrutura espacial. Quer reformular?"

Use markdown leve (negrito em **NBR 15527**, itálico em *exemplos*). Não use listas extensas — prefira parágrafos.`

const MODEL = 'gemini-2.0-flash'

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return json(
      {
        error:
          'GEMINI_API_KEY ausente no servidor. Configure a variável de ambiente na Vercel.',
      },
      500,
    )
  }

  let body
  try {
    body = await req.json()
  } catch {
    return json({ error: 'JSON inválido no corpo da requisição.' }, 400)
  }

  const messages = Array.isArray(body?.messages) ? body.messages : null
  if (!messages || messages.length === 0) {
    return json({ error: 'Campo "messages" obrigatório.' }, 400)
  }

  // Sanitiza: aceita apenas user/assistant e limita tamanho do histórico.
  const safe = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
    .slice(-12)
    .map((m) => ({
      role: m.role,
      content: String(m.content ?? '').slice(0, 4000),
    }))

  while (safe.length > 0 && safe[0].role !== 'user') safe.shift()
  if (safe.length === 0) {
    return json({ error: 'Histórico inválido após sanitização.' }, 400)
  }

  // Gemini usa "user" e "model" como roles
  const contents = safe.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`

  const upstream = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 800,
        topP: 0.95,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      ],
    }),
  })

  if (!upstream.ok || !upstream.body) {
    const err = await upstream.text().catch(() => '')
    return json(
      {
        error: 'Falha ao chamar a Gemini API',
        status: upstream.status,
        detail: err.slice(0, 500),
      },
      upstream.status || 502,
    )
  }

  // Gemini SSE: cada evento `data: { candidates: [...] }` traz texto
  // incremental em candidates[0].content.parts[0].text.
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body.getReader()
      let buffer = ''
      try {
        for (;;) {
          const { value, done } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const parts = buffer.split('\n\n')
          buffer = parts.pop() ?? ''
          for (const part of parts) {
            const lines = part.split('\n')
            for (const line of lines) {
              if (!line.startsWith('data:')) continue
              const payload = line.slice(5).trim()
              if (!payload) continue
              try {
                const parsed = JSON.parse(payload)
                const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text
                if (text) {
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ delta: text })}\n\n`,
                    ),
                  )
                }
                const finishReason = parsed?.candidates?.[0]?.finishReason
                if (finishReason && finishReason !== 'FINISH_REASON_UNSPECIFIED' && finishReason !== 'STOP') {
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({
                        error: 'finish_reason',
                        message: `Resposta interrompida: ${finishReason}`,
                      })}\n\n`,
                    ),
                  )
                }
              } catch {
                // ignora pedaços malformados
              }
            }
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } catch (e) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              error: 'stream_error',
              message: String(e),
            })}\n\n`,
          ),
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    status: 200,
    headers: {
      ...corsHeaders(),
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders(),
      'Content-Type': 'application/json',
    },
  })
}
