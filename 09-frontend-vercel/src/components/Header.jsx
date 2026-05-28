function Header({ now }) {
  const time = now.toLocaleTimeString('pt-BR')
  const date = now.toLocaleDateString('pt-BR')
  return (
    <header className="header">
      <div>
        <h1>Space Connect</h1>
        <p className="subtitle">Plataforma integrada de monitoramento de risco ambiental</p>
      </div>
      <div className="header-meta">
        <span className="badge">GS 2026.1 · FIAP</span>
        <span className="clock" aria-label="data e hora">
          {date} · {time}
        </span>
      </div>
    </header>
  )
}

export default Header
