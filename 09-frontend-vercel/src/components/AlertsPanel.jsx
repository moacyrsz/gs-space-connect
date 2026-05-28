const labels = {
  visao: 'Visão Computacional',
  iot: 'Estação IoT',
  rpa: 'Automação RPA',
  qml: 'QML',
}

function AlertsPanel({ alerts, onDismiss }) {
  return (
    <section className="card alerts-panel" aria-label="alertas">
      <h2>Alertas ativos</h2>
      {alerts.length === 0 ? (
        <p className="empty">Sem alertas ativos no momento.</p>
      ) : (
        <ul className="alert-list">
          {alerts.map((a) => (
            <li key={a.id} className={`alert sev-${a.severity}`}>
              <div className="alert-head">
                <span className={`pill sev-${a.severity}`}>{a.severity.toUpperCase()}</span>
                <span className="alert-source">{labels[a.source] || a.source}</span>
                <span className="alert-time">{a.at}</span>
              </div>
              <p className="alert-region">
                <strong>{a.region}</strong> · <span className="coords">{a.coords}</span>
              </p>
              <p className="alert-message">{a.message}</p>
              <button type="button" className="ghost" onClick={() => onDismiss(a.id)}>
                Dispensar
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default AlertsPanel
