import { useEffect, useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { Toaster } from 'sonner'
import {
  LayoutDashboard,
  Map,
  MessageCircle,
  Code2,
  Activity,
  ExternalLink,
  Search,
  Bell,
  Wifi,
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

function Layout() {
  const [now, setNow] = useState(new Date())
  const [cmdOpen, setCmdOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000)
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
            borderRadius: '6px',
          },
        }}
      />

      <CommandMenu open={cmdOpen} onOpenChange={setCmdOpen} />

      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-(--color-line) bg-(--color-panel)/40 px-3 py-4">
        <Link
          to="/"
          className="flex items-center gap-2.5 px-2 py-1.5 mb-6 rounded-md hover:bg-(--color-panel-2) transition-colors"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-(--color-line) bg-(--color-bg)">
            <span className="text-[11px] font-mono font-semibold tracking-tight text-(--color-accent)">
              SC
            </span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[13px] font-medium tracking-tight text-(--color-text)">
              Space Connect
            </span>
            <span className="text-[10px] text-(--color-faint)">FIAP · GS 2026.1</span>
          </div>
        </Link>

        {navSections.map((section) => (
          <div key={section.label} className="flex flex-col gap-0.5 mb-5">
            <p className="px-2.5 mb-1 text-[10px] font-medium uppercase tracking-wider text-(--color-faint)">
              {section.label}
            </p>
            {section.items.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] transition-colors',
                    isActive
                      ? 'bg-(--color-panel-2) text-(--color-text)'
                      : 'text-(--color-muted) hover:bg-(--color-panel-2)/60 hover:text-(--color-text-soft)',
                  )
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </NavLink>
            ))}
          </div>
        ))}

        <div className="mt-auto flex flex-col gap-2 px-1">
          <div className="rounded-md border border-(--color-line) px-2.5 py-2">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-(--color-success)" />
                <span className="text-[11px] text-(--color-text)">Pipeline</span>
              </div>
              <span className="text-[10px] text-(--color-success) font-medium">
                online
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-(--color-muted)">
              <span className="flex items-center gap-1">
                <Wifi className="h-2.5 w-2.5" /> MQTT
              </span>
              <span className="font-mono tabular-nums">12 ms</span>
            </div>
          </div>

          <a
            href="https://github.com/moacyrsz/gs-space-connect"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] text-(--color-muted) hover:bg-(--color-panel-2) hover:text-(--color-text) transition-colors"
          >
            <Code2 className="h-3 w-3" />
            <span className="flex-1">Repositório</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
          <p className="px-2.5 text-[10px] leading-relaxed text-(--color-faint)">
            Moacyr Cabral da Silva
            <br />
            RM 559263
          </p>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-(--color-line) bg-(--color-bg)/95 px-5">
          <Badge variant="outline" className="gap-1.5 hidden sm:inline-flex h-5 px-2 text-[10px]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-(--color-danger) badge-pulse" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-(--color-danger)" />
            </span>
            <span className="text-(--color-text-soft) font-medium">LIVE</span>
          </Badge>

          <button
            type="button"
            onClick={() => setCmdOpen(true)}
            className="hidden md:flex flex-1 max-w-md items-center gap-2 rounded-md border border-(--color-line) px-2.5 py-1 text-[12px] text-(--color-muted) hover:bg-(--color-panel-2)/60 hover:border-(--color-line-strong) transition-colors"
          >
            <Search className="h-3 w-3" />
            <span className="flex-1 text-left">Buscar páginas, biomas, ações</span>
            <kbd className="rounded border border-(--color-line) bg-(--color-panel) px-1.5 py-0.5 font-mono text-[10px] text-(--color-muted)">
              ⌘K
            </kbd>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <NotificationsButton open={notifOpen} onOpenChange={setNotifOpen} />

            <div className="hidden md:flex items-center gap-1.5 rounded-md border border-(--color-line) px-2 py-1 text-[11px] text-(--color-muted) tabular-nums font-mono">
              <Activity className="h-2.5 w-2.5" />
              {formatTime(now)}
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-7 lg:px-8">
          <div className="fade-up max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-(--color-line) px-6 py-3 text-[11px] text-(--color-muted) lg:px-8 flex flex-wrap items-center justify-between gap-2">
          <span>GS 2026.1 · Space Connect · Dados mockados para fins didáticos</span>
          <span className="flex items-center gap-3">
            <span>Moacyr Cabral da Silva</span>
            <span className="text-(--color-faint)">·</span>
            <span className="font-mono">RM 559263</span>
            <span className="text-(--color-faint)">·</span>
            <a
              href="https://github.com/moacyrsz/gs-space-connect"
              target="_blank"
              rel="noreferrer"
              className="text-(--color-text-soft) hover:text-(--color-accent) transition-colors"
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
        className="relative flex h-7 w-7 items-center justify-center rounded-md border border-(--color-line) text-(--color-muted) hover:bg-(--color-panel-2)/60 hover:text-(--color-text) transition-colors"
        aria-label="Notificações"
      >
        <Bell className="h-3 w-3" />
        {high > 0 && (
          <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-(--color-danger) px-1 text-[9px] font-semibold text-white">
            {high}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => onOpenChange(false)} />
          <div className="absolute right-0 mt-2 w-80 surface-elev z-50 fade-up overflow-hidden">
            <div className="border-b border-(--color-line) px-3.5 py-2.5">
              <p className="text-[13px] font-medium">Notificações</p>
              <p className="text-[10px] text-(--color-faint) mt-0.5">
                {initialAlerts.length} alertas no recorte atual
              </p>
            </div>
            <div className="max-h-80 overflow-y-auto p-1.5 scrollbar-thin">
              {initialAlerts.slice(0, 5).map((a) => (
                <div
                  key={a.id}
                  className="rounded-md px-2.5 py-2 hover:bg-(--color-panel-2) transition-colors cursor-default"
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge variant={a.severity} className="text-[9px] h-4 px-1.5">
                      {a.severity.toUpperCase()}
                    </Badge>
                    <span className="text-[10px] text-(--color-faint) ml-auto">
                      {sourceLabels[a.source]}
                    </span>
                  </div>
                  <p className="text-[12px] font-medium truncate">{a.region}</p>
                  <p className="text-[11px] text-(--color-muted) line-clamp-1">
                    {a.message}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-(--color-line) px-3.5 py-2">
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
