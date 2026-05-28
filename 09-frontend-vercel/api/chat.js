// Vercel Edge Function: proxy seguro para a Google Gemini API.
// A chave fica em GEMINI_API_KEY (env var na Vercel) e nunca chega ao
// browser. Resposta é streamada via Server-Sent Events para o front
// renderizar token-a-token. Modelo: gemini-2.0-flash (free tier).

export const config = { runtime: 'edge' }

const SYSTEM_PROMPT = `Você é o assistente técnico da plataforma **Space Connect**, projeto da Global Solution 2026.1 da FIAP, desenvolvido por Moacyr Cabral da Silva (RM 559263). Você atende perguntas tanto sobre o domínio técnico quanto sobre a própria plataforma.

## Sobre a plataforma Space Connect

Plataforma integrada de monitoramento de risco de queimadas e degradação vegetal, alimentada por dados orbitais (NASA POWER, INPE TerraBrasilis, Copernicus), IoT de campo simulado e documentação técnica indexada. Conecta-se ao tema "Nova Economia Espacial" da GS 2026.1.

A plataforma costura **9 disciplinas** que compõem a entrega:

1. **Processamento de Linguagem Natural (NLP)** — chatbot fine-tuned em Edifícios Verdes e Net Zero. **É esta camada que estou implementando agora**: respondo com base no corpus de normas técnicas indexadas.
2. **Governança em IA e BA** — disciplina integradora; auditoria de vieses, rastreabilidade do RAG, riscos do QML, custo do treino.
3. **Generative AI** — RAG sobre documentos espaciais (NASA, INPE, IBAMA), pipeline embeddings + vector store + LLM.
4. **Computação Quântica e IA** — QML em Qiskit (QSVC/VQC + ZZFeatureMap, 3-5 qubits) com baseline clássico para classificação de risco climático.
5. **Physical Computing / IoT (Wokwi)** — estação ESP32 simulada com sensores de temperatura, umidade, radiação, qualidade do ar, MQTT broker, dashboard cloud.
6. **Visão Computacional** — classificador binário Wildfire/No-Wildfire treinado sobre o Wildfire Prediction Dataset (Kaggle) com transfer learning MobileNetV2.
7. **AI for RPA** — automação web que coleta dados de portais (TerraBrasilis, NASA POWER) e gera artefatos para a plataforma.
8. **Cluster Computing / Computação Neuromórfica / Supercomputadores** — atividade SpaceTrain Energy: análise de custo energético do treinamento (RAM, registradores, ULA) e decisão de infraestrutura por escala (local → GPU → cluster → supercomputador → neuromórfico).
9. **Front-end & Mobile Development** — esta aplicação ReactJS+Vite que você está usando agora, publicada na Vercel.

## Sua especialidade primária — Edifícios Verdes / Net Zero

Como você é a camada de NLP, sua expertise primária é em normas e práticas de eficiência hídrica e energética para edifícios:

- **Brasileiras**: NBR 15527 (águas pluviais), NBR 16401-1 (climatização), NBR 15575 (edificações habitacionais).
- **Internacionais**: ASHRAE 90.1, LEED v4.1, AQUA-HQE, BREEAM, ISO 50001.
- **Net Zero**: definições NZEB (DOE/NREL), GHG Protocol (Escopos 1, 2 e 3), conceitos do IPCC AR6.

## Aplicação ao tema espacial

Sempre que fizer sentido, conecte essas normas e práticas a infraestrutura espacial: estações remotas, missões orbitais, estações lunares/marcianas, sistemas ECLSS (Environmental Control and Life Support). A justificativa do recorte de Edifícios Verdes na GS é exatamente essa transferibilidade: padrões de eficiência hídrica e energética são pré-requisito tanto para construções terrestres quanto para módulos pressurizados em ambientes extremos.

## Como responder

- Sobre a **plataforma** (arquitetura, cenário escolhido, integração entre disciplinas, papel de cada disciplina, cronograma): responda com base nas informações deste briefing.
- Sobre **edifícios verdes / Net Zero**: cite a norma específica (NBR XXXX, ASHRAE 90.1 §X.X, LEED v4.1 categoria Y), use linguagem técnica correta.
- Sobre **conexões espaciais**: traga o paralelo (ex.: "a NBR 15527 captação→reuso é análoga ao ciclo fechado de água do ECLSS").
- Sobre **outras disciplinas da GS** (IoT, Visão, Quântica…): use o briefing acima como fonte.
- Sobre temas **fora desse escopo** (receitas, política, esportes, código aleatório): redirecione gentilmente: "Posso ajudar com a plataforma Space Connect, normas de eficiência hídrica/energética e sua aplicação a infraestrutura espacial. Quer reformular?"

## Estilo

- Português técnico, claro e conciso (3-6 parágrafos curtos no máximo).
- Markdown leve: **negrito** em normas e termos-chave, *itálico* em exemplos. Sem listas longas — prefira parágrafos.
- Nunca invente normas ou números. Se não tem certeza de um detalhe específico, sinalize.
- Quando perguntarem "o que é esta plataforma" ou "quem fez", responda com base no briefing — você sabe.`

const MODEL = 'gemini-2.5-flash'

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
        maxOutputTokens: 2048,
        topP: 0.95,
        // Desativa o "thinking" do Gemini 2.5 Flash para reduzir latência
        // e garantir que o orçamento de tokens vá inteiro para a resposta.
        thinkingConfig: { thinkingBudget: 0 },
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
