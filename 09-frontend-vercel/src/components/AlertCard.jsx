import { MapPin, Satellite, Cpu, Workflow, Sparkles, Bot, ShieldCheck } from 'lucide-react'
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
      className="group w-full text-left rounded-md p-3.5 transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] border border-(--color-line) bg-(--color-surface) hover:border-(--color-line-strong) hover:shadow-[0_2px_4px_rgba(31,29,26,0.05)]"
    >
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <Badge variant={alert.severity} className="h-[18px] px-1.5 text-[9px] font-medium">
            {severityCopy[alert.severity]}
          </Badge>
          <span className="flex items-center gap-1 text-[10px] text-(--color-faint) truncate">
            <Icon className="h-2.5 w-2.5 shrink-0" strokeWidth={1.5} />
            {sourceLabels[alert.source]}
          </span>
        </div>
        <span
          className="text-[10px] tabular-nums text-(--color-faint) shrink-0"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {timeAgo(alert.at)}
        </span>
      </div>
      <p className="flex items-center gap-1.5 text-[13px] text-(--color-text) mb-1 tracking-[-0.005em]" style={{ fontWeight: 500 }}>
        <MapPin className="h-3 w-3 text-(--color-faint) shrink-0" strokeWidth={1.5} />
        <span className="truncate">{alert.region}</span>
      </p>
      <p className="text-[11px] leading-relaxed text-(--color-muted) line-clamp-2">
        {alert.message}
      </p>
      {alert.proba != null && (
        <div className="mt-2.5 flex items-center gap-2">
          <span className="flex items-center gap-1 text-[9px] uppercase tracking-[0.06em] text-(--color-faint) font-medium">
            <ShieldCheck className="h-2.5 w-2.5" strokeWidth={1.75} />
            Confiança
          </span>
          <div className="flex-1 h-1 rounded-full bg-(--color-surface-elevated) overflow-hidden">
            <div
              className="h-full rounded-full bg-(--color-accent) transition-all duration-500 ease-out"
              style={{ width: `${Math.round(alert.proba * 100)}%` }}
            />
          </div>
          <span
            className="text-[10px] tabular-nums text-(--color-text-soft) font-medium"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {Math.round(alert.proba * 100)}%
          </span>
        </div>
      )}
    </button>
  )
}

export default AlertCard
