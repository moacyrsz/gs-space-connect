import { useState } from 'react'

const samples = [
  'Como a NBR 15527 se aplica a estações remotas?',
  'O que muda em ASHRAE 90.1 para módulos pressurizados?',
  'Net Zero de energia funciona em ambiente espacial?',
  'Quais certificações fazem sentido para edifícios verdes?',
]

function RagAssistant({ askMock }) {
  const [question, setQuestion] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)

  const ask = (text) => {
    if (!text.trim()) return
    setLoading(true)
    setTimeout(() => {
      const answer = askMock(text)
      setHistory((prev) => [{ id: Date.now(), q: text, a: answer }, ...prev].slice(0, 5))
      setQuestion('')
      setLoading(false)
    }, 400)
  }

  return (
    <section className="card rag" aria-label="assistente RAG">
      <h2>Assistente técnico (NLP + RAG)</h2>
      <p className="card-hint">
        Camada das disciplinas de NLP (chatbot fine-tuned em Edifícios Verdes / Net Zero)
        e Generative AI (RAG sobre documentos espaciais). Mock baseado em respostas
        canned.
      </p>

      <form
        className="ask-form"
        onSubmit={(e) => {
          e.preventDefault()
          ask(question)
        }}
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Faça uma pergunta técnica…"
        />
        <button type="submit" className="primary" disabled={loading}>
          {loading ? 'Pensando…' : 'Perguntar'}
        </button>
      </form>

      <div className="suggestions">
        {samples.map((s) => (
          <button key={s} type="button" className="ghost" onClick={() => ask(s)}>
            {s}
          </button>
        ))}
      </div>

      {history.length > 0 && (
        <ul className="history">
          {history.map((h) => (
            <li key={h.id} className="qa">
              <p className="q">
                <strong>Você:</strong> {h.q}
              </p>
              <p className="a">
                <strong>Assistente:</strong> {h.a}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default RagAssistant
