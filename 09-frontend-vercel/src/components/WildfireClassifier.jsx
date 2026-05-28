import { useState } from 'react'

function WildfireClassifier({ samples, onAlert }) {
  const [selected, setSelected] = useState(samples[0].id)
  const [threshold, setThreshold] = useState(0.5)

  const sample = samples.find((s) => s.id === selected)
  const classified = sample.proba >= threshold ? 'wildfire' : 'nowildfire'
  const matchesGroundTruth = classified === sample.label

  const sendToAlerts = () => {
    if (classified !== 'wildfire') return
    onAlert({
      severity: sample.proba > 0.8 ? 'high' : 'medium',
      source: 'visao',
      region: sample.region,
      coords: '—',
      message: `Classificador (mock) inferiu wildfire com prob. ${sample.proba}`,
      at: new Date().toLocaleTimeString('pt-BR').slice(0, 5),
    })
  }

  return (
    <section className="card classifier" aria-label="classificador wildfire">
      <h2>Classificador Wildfire / No-Wildfire</h2>
      <p className="card-hint">
        Camada da disciplina de Visão Computacional. Inferência sobre imagem de satélite
        350x350. Resultados reais virão do modelo MobileNetV2 treinado no Colab.
      </p>

      <label className="field">
        <span>Amostra de imagem</span>
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          {samples.map((s) => (
            <option key={s.id} value={s.id}>
              {s.id} — {s.region}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Threshold operacional ({threshold.toFixed(2)})</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
        />
      </label>

      <div className="result">
        <p>
          Probabilidade prevista: <strong>{sample.proba}</strong>
        </p>
        <p>
          Classe inferida:{' '}
          <strong className={`pill sev-${classified === 'wildfire' ? 'high' : 'low'}`}>
            {classified}
          </strong>
        </p>
        <p className={matchesGroundTruth ? 'ok' : 'warn'}>
          {matchesGroundTruth ? 'Concorda com ground truth' : 'Diverge do ground truth'}
        </p>
      </div>

      <button type="button" className="primary" onClick={sendToAlerts}>
        Disparar alerta para o painel
      </button>
    </section>
  )
}

export default WildfireClassifier
