import { useEffect, useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { Toaster, toast } from 'sonner'
import {
  LayoutDashboard,
  Map,
  MessageCircle,
  Code2,
  Satellite,
  Activity,
  ExternalLink,
  Search,
  Bell,
  Command as CommandIcon,
  Wifi,
  RefreshCcw,
  CheckCircle2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CommandMenu } from '@/components/CommandMenu'
import { cn, formatTime } from '@/lib/utils'
import { initialAlerts, sourceLabels } from '@/data/mocks'

const navSections = [
  {
    label: 'Plataforma',
    items: [
      { to: '/', label: 'Visão Geral', icon: LayoutDashboard, end: true },
      { to: '/mapa', label: 'Mapa de Alertas', icon: Map },
      { to: '/assistente', label: 'Assistente Técnico', icon: MessageCircle },
    ],
  },
]

const REFRESH_INTERVAL = 90 // s

function Layout() {
  const [now, setNow] = useState(new Date())
  const [refreshIn, setRefreshIn] = useState(REFRESH_INTERVAL)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  useEffect(() => {
    const tick = setInterval(() => {
      setNow(new Date())
      setRefreshIn((r) => {
        if (r <= 1) {
          // Trigger a tiny "refreshed" toast each cycle to feel realtime
          toast.success('Telemetria atualizada', {
            description: `${initialAlerts.length} alertas ativos · sincronizado às ${formatTime(new Date())}`,
            duration: 2200,
          })
          return REFRESH_INTERVAL
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(tick)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCmdOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex min-h-screen text-(--color-text)">
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--color-panel)',
            border: '1px solid var(--color-line)',
            color: 'var(--color-text)',
            fontSize: '13px',
          },
        }}
      />

      <CommandMenu open={cmdOpen} onOpenChange={setCmdOpen} />

      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-(--color-line) bg-(--color-panel)/50 px-4 py-5">
        <Link to="/" className="flex items-center gap-2.5 px-2 mb-7 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-(--color-accent) to-(--color-accent-strong) shadow-[0_0_24px_-4px_oklch(0.72_0.18_50_/_0.6)]">
            <Satellite className="h-5 w-5 text-(--color-bg)" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight gradient-text">
              Space Connect
            </span>
            <span className="text-[11px] text-(--color-muted)">FIAP · GS 2026.1</span>
          </div>
        </Link>

        {navSections.map((section) => (
          <div key={section.label} className="flex flex-col gap-0.5 mb-5">
            <p className="px-3 mb-1 text-[10px] font-medium uppercase tracking-wider text-(--color-faint)">
              {section.label}
            </p>
            {section.items.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-(--color-panel-2) text-(--color-text)'
                      : 'text-(--color-muted) hover:bg-(--color-panel-2)/60 hover:text-(--color-text)',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full transition-colors',
                        isActive ? 'bg-(--color-accent)' : 'bg-transparent',
                      )}
                    />
                    <Icon className="h-4 w-4" />
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}

        <div className="mt-auto flex flex-col gap-2 px-1">
          <div className="rounded-lg border border-(--color-line) bg-(--color-panel-2)/40 px-3 py-2.5">
            <div className="flex items-center gap-2 mb-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-(--color-vegetation)" />
              <span className="text-xs text-(--color-text)">Pipeline saudável</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-(--color-muted)">
              <span className="flex items-center gap-1">
                <Wifi className="h-3 w-3" /> MQTT
              </span>
              <span className="text-(--color-vegetation) font-medium">online</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-(--color-muted) mt-0.5">
              <span className="flex items-center gap-1">
                <Satellite className="h-3 w-3" /> Telemetria
              </span>
              <span className="text-(--color-vegetation) font-medium">12 ms</span>
            </div>
          </div>

          <a
            href="https://github.com/moacyrsz/gs-space-connect"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-lg border border-(--color-line) px-3 py-2 text-xs text-(--color-muted) hover:bg-(--color-panel-2) hover:text-(--color-text) transition-colors"
          >
            <Code2 className="h-3.5 w-3.5" />
            <span className="flex-1">Repositório</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <p className="px-1 text-[11px] leading-relaxed text-(--color-muted)">
            Moacyr Cabral da Silva
            <br />
            RM 559263
          </p>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-(--color-line) bg-(--color-bg)/85 px-5 backdrop-blur-md">
          <Badge variant="high" className="gap-1.5 hidden sm:inline-flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-(--color-fire-high) badge-pulse" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-(--color-fire-high)" />
            </span>
            LIVE
          </Badge>

          <button
            type="button"
            onClick={() => setCmdOpen(true)}
            className="hidden md:flex flex-1 max-w-md items-center gap-2 rounded-lg border border-(--color-line) bg-(--color-panel-2)/40 px-3 py-1.5 text-xs text-(--color-muted) hover:bg-(--color-panel-2) hover:border-(--color-line-strong) transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1 text-left">Buscar páginas, biomas, ações…</span>
            <kbd className="rounded bg-(--color-panel-3) px-1.5 py-0.5 font-mono text-[10px] text-(--color-text-soft)">
              ⌘K
            </kbd>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden lg:flex items-center gap-1.5 text-[11px] text-(--color-muted) tabular-nums">
              <RefreshCcw className="h-3 w-3" />
              próx. atualização em {refreshIn}s
            </span>

            <NotificationsButton open={notifOpen} onOpenChange={setNotifOpen} />

            <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-(--color-line) bg-(--color-panel-2)/40 px-2.5 py-1.5 text-[11px] text-(--color-muted) tabular-nums">
              <Activity className="h-3 w-3" />
              {formatTime(now)}
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 py-6 lg:px-7">
          <div className="fade-up">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-(--color-line) px-5 py-3 text-[11px] text-(--color-muted) lg:px-7 flex flex-wrap items-center justify-between gap-2">
          <span>
            GS 2026.1 · Space Connect · Dados mockados para fins didáticos
          </span>
          <span>
            Moacyr Cabral da Silva · RM 559263 ·{' '}
            <a
              href="https://github.com/moacyrsz/gs-space-connect"
              target="_blank"
              rel="noreferrer"
              className="text-(--color-accent) hover:underline"
            >
              github.com/moacyrsz
            </a>
          </span>
        </footer>
      </div>
    </div>
  )
}

function NotificationsButton({ open, onOpenChange }) {
  const high = initialAlerts.filter((a) => a.severity === 'high').length
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-(--color-line) bg-(--color-panel-2)/40 text-(--color-muted) hover:bg-(--color-panel-2) hover:text-(--color-text) transition-colors"
        aria-label="Notificações"
      >
        <Bell className="h-3.5 w-3.5" />
        {high > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-(--color-fire-high) px-1 text-[10px] font-semibold text-white">
            {high}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => onOpenChange(false)}
          />
          <div className="absolute right-0 mt-2 w-80 surface-elev z-50 fade-up">
            <div className="border-b border-(--color-line) px-4 py-3">
              <p className="text-sm font-medium">Notificações</p>
              <p className="text-[11px] text-(--color-muted)">
                {initialAlerts.length} alertas no recorte atual
              </p>
            </div>
            <div className="max-h-80 overflow-y-auto p-2 scrollbar-thin">
              {initialAlerts.slice(0, 5).map((a) => (
                <div
                  key={a.id}
                  className="rounded-lg px-2.5 py-2 hover:bg-(--color-panel-2) transition-colors"
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge variant={a.severity} className="text-[9px] px-1.5 py-0">
                      {a.severity.toUpperCase()}
                    </Badge>
                    <span className="text-[11px] text-(--color-muted) ml-auto">
                      {sourceLabels[a.source]}
                    </span>
                  </div>
                  <p className="text-xs font-medium truncate">{a.region}</p>
                  <p className="text-[11px] text-(--color-muted) line-clamp-1">
                    {a.message}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-(--color-line) px-4 py-2.5">
              <Link
                to="/mapa"
                onClick={() => onOpenChange(false)}
                className="text-[11px] text-(--color-accent) hover:underline"
              >
                Ver todos no mapa →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Layout
