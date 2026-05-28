import { MapPin, Satellite, Cpu, Workflow, Sparkles, Bot } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { sourceLabels } from '@/data/mocks'

const sourceIcons = {
  visao: Satellite,
  iot: Cpu,
  rpa: Workflow,
  qml: Sparkles,
  nlp: Bot,
}

const severityCopy = {
  high: 'CRÍTICO',
  medium: 'MÉDIO',
  low: 'INFO',
}

function timeAgo(date) {
  const minutes = Math.round((Date.now() - new Date(date).getTime()) / 60000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `há ${minutes} min`
  const hours = Math.floor(minutes / 60)
  return `há ${hours}h`
}

function AlertCard({ alert, onSelect }) {
  const Icon = sourceIcons[alert.source]
  return (
    <button
      type="button"
      onClick={() => onSelect?.(alert)}
      className="group w-full text-left rounded-lg border border-(--color-line) bg-(--color-panel-2)/60 p-3 transition-colors hover:border-(--color-accent)/40 hover:bg-(--color-panel-2)"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant={alert.severity}>{severityCopy[alert.severity]}</Badge>
          <span className="flex items-center gap-1.5 text-[11px] text-(--color-muted)">
            <Icon className="h-3 w-3" />
            {sourceLabels[alert.source]}
          </span>
        </div>
        <span className="text-[11px] tabular-nums text-(--color-muted)">{timeAgo(alert.at)}</span>
      </div>
      <p className="mt-2 flex items-center gap-1 text-sm font-medium text-(--color-text)">
        <MapPin className="h-3.5 w-3.5 text-(--color-muted)" />
        {alert.region}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-(--color-muted)">{alert.message}</p>
      {alert.proba != null && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-(--color-muted)">
            Probabilidade
          </span>
          <div className="flex-1 h-1.5 rounded-full bg-(--color-line)">
            <div
              className="h-full rounded-full bg-(--color-accent)"
              style={{ width: `${Math.round(alert.proba * 100)}%` }}
            />
          </div>
          <span className="text-[11px] tabular-nums text-(--color-text)">
            {Math.round(alert.proba * 100)}%
          </span>
        </div>
      )}
    </button>
  )
}

export default AlertCard
