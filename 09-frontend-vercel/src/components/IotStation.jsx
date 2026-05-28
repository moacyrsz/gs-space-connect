function IotStation({ reading, onAlert }) {
  const isCritical =
    reading.temperatura > 38 || reading.umidade < 22 || reading.radiacao > 0.7

  const dispatch = () => {
    onAlert({
      severity: 'medium',
      source: 'iot',
      region: 'Estação simulada (Wokwi)',
      coords: '-15.781, -47.929',
      message: `Leitura crítica: temp ${reading.temperatura}°C, umidade ${reading.umidade}%, radiação ${reading.radiacao}`,
      at: new Date().toLocaleTimeString('pt-BR').slice(0, 5),
    })
  }

  return (
    <section className="card iot" aria-label="estação IoT">
      <h2>Estação IoT (Wokwi)</h2>
      <p className="card-hint">
        Camada da disciplina de Physical Computing & IoT. Leitura simulada chega via
        MQTT. Atualiza a cada 5 segundos.
      </p>

      <ul className="readings">
        <li>
          <span>Temperatura</span>
          <strong>{reading.temperatura} °C</strong>
        </li>
        <li>
          <span>Umidade</span>
          <strong>{reading.umidade} %</strong>
        </li>
        <li>
          <span>Radiação relativa</span>
          <strong>{reading.radiacao}</strong>
        </li>
        <li>
          <span>Perda comunicação</span>
          <strong>{reading.perdaComunicacao} %</strong>
        </li>
        <li>
          <span>Índice de poeira</span>
          <strong>{reading.indicePoeira}</strong>
        </li>
      </ul>

      {isCritical ? (
        <div className="status-bad">
          <p>Combinação de leituras configura risco crítico.</p>
          <button type="button" className="primary" onClick={dispatch}>
            Notificar operação
          </button>
        </div>
      ) : (
        <p className="status-ok">Operação dentro de envelope normal.</p>
      )}
    </section>
  )
}

export default IotStation
