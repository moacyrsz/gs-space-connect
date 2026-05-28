import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header'
import StatusCards from './components/StatusCards'
import AlertsPanel from './components/AlertsPanel'
import WildfireClassifier from './components/WildfireClassifier'
import IotStation from './components/IotStation'
import RagAssistant from './components/RagAssistant'
import { initialAlerts, mockSamples, mockSensorReading, mockRagAnswer } from './mocks'

function App() {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [reading, setReading] = useState(mockSensorReading())
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const tick = setInterval(() => {
      setNow(new Date())
      setReading(mockSensorReading())
    }, 5000)
    return () => clearInterval(tick)
  }, [])

  const dismissAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  const addAlert = (alert) => {
    setAlerts((prev) => [{ ...alert, id: Date.now() }, ...prev].slice(0, 8))
  }

  return (
    <div className="app">
      <Header now={now} />
      <main className="grid">
        <StatusCards alerts={alerts} reading={reading} />
        <AlertsPanel alerts={alerts} onDismiss={dismissAlert} />
        <WildfireClassifier samples={mockSamples} onAlert={addAlert} />
        <IotStation reading={reading} onAlert={addAlert} />
        <RagAssistant askMock={mockRagAnswer} />
      </main>
      <footer className="footer">
        <p>
          GS 2026.1 — Space Connect · Moacyr Cabral da Silva (RM 559263) · Dados mockados
          para fins didáticos · <a href="https://github.com/moacyrsz/gs-space-connect">GitHub</a>
        </p>
      </footer>
    </div>
  )
}

export default App
