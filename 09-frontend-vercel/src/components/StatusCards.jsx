function StatusCards({ alerts, reading }) {
  const high = alerts.filter((a) => a.severity === 'high').length
  const medium = alerts.filter((a) => a.severity === 'medium').length

  const cards = [
    { label: 'Alertas críticos', value: high, tone: 'high' },
    { label: 'Alertas médios', value: medium, tone: 'medium' },
    { label: 'Temp. estação (°C)', value: reading.temperatura, tone: reading.temperatura > 38 ? 'high' : 'ok' },
    { label: 'Umidade (%)', value: reading.umidade, tone: reading.umidade < 25 ? 'high' : 'ok' },
  ]

  return (
    <section className="card status-cards" aria-label="resumo">
      <h2>Resumo operacional</h2>
      <div className="kpi-row">
        {cards.map((c) => (
          <div key={c.label} className={`kpi tone-${c.tone}`}>
            <span className="kpi-value">{c.value}</span>
            <span className="kpi-label">{c.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default StatusCards
