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
  if (minutes < 60) return `há ${minutes}m`
  const hours = Math.floor(minutes / 60)
  return `há ${hours}h`
}

function AlertCard({ alert, onSelect }) {
  const Icon = sourceIcons[alert.source]
  return (
    <button
      type="button"
      onClick={() => onSelect?.(alert)}
      className="group w-full text-left rounded-md border border-(--color-line) p-3 transition-colors hover:border-(--color-line-strong) hover:bg-(--color-panel-2)/40"
    >
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <Badge variant={alert.severity} className="h-4 px-1.5 text-[9px]">
            {severityCopy[alert.severity]}
          </Badge>
          <span className="flex items-center gap-1 text-[10px] text-(--color-faint) truncate">
            <Icon className="h-2.5 w-2.5 shrink-0" />
            {sourceLabels[alert.source]}
          </span>
        </div>
        <span className="text-[10px] tabular-nums text-(--color-faint) shrink-0">
          {timeAgo(alert.at)}
        </span>
      </div>
      <p className="flex items-center gap-1 text-[13px] font-medium text-(--color-text) mb-0.5">
        <MapPin className="h-3 w-3 text-(--color-faint) shrink-0" />
        <span className="truncate">{alert.region}</span>
      </p>
      <p className="text-[11px] leading-snug text-(--color-muted) line-clamp-2">
        {alert.message}
      </p>
      {alert.proba != null && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[9px] uppercase tracking-wider text-(--color-faint) font-medium">
            Prob.
          </span>
          <div className="flex-1 h-1 rounded-full bg-(--color-panel-2)">
            <div
              className="h-full rounded-full bg-(--color-accent)"
              style={{ width: `${Math.round(alert.proba * 100)}%` }}
            />
          </div>
          <span className="text-[10px] tabular-nums text-(--color-text-soft) font-medium">
            {Math.round(alert.proba * 100)}%
          </span>
        </div>
      )}
    </button>
  )
}

export default AlertCard
