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
  ChevronRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CommandMenu } from '@/components/CommandMenu'
import ChatWidget from '@/components/chat/ChatWidget'
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

const routeLabels = {
  '/': 'Visão Geral',
  '/mapa': 'Mapa de Alertas',
  '/assistente': 'Assistente Técnico',
}

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
        theme="light"
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--color-surface)',
            border: '1px solid var(--color-line)',
            color: 'var(--color-text)',
            fontSize: '13px',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-pop)',
          },
        }}
      />

      <CommandMenu open={cmdOpen} onOpenChange={setCmdOpen} />

      <aside className="hidden md:flex w-[248px] shrink-0 flex-col border-r border-(--color-line) bg-(--color-surface-overlay)/30 px-3.5 py-5">
        <Link
          to="/"
          className="flex items-center gap-2.5 px-2 py-1.5 mb-7 rounded-md hover:bg-(--color-surface-elevated) transition-colors"
        >
          <div className="relative flex h-8 w-8 items-center justify-center rounded-md bg-(--color-text) text-white">
            <span
              className="font-mono text-[11px] tracking-tight"
              style={{ fontWeight: 600 }}
            >
              SC
            </span>
          </div>
          <div className="flex flex-col leading-tight">
            <span
              className="text-[13px] tracking-[-0.01em] text-(--color-text)"
              style={{ fontWeight: 500 }}
            >
              Space Connect
            </span>
            <span
              className="text-[10px] text-(--color-faint)"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              FIAP · GS 2026.1
            </span>
          </div>
        </Link>

        {navSections.map((section) => (
          <div key={section.label} className="flex flex-col gap-0.5 mb-6">
            <p className="px-2.5 mb-1.5 label-caps">{section.label}</p>
            {section.items.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors duration-150',
                    isActive
                      ? 'bg-(--color-surface) text-(--color-text) border border-(--color-line) shadow-[0_1px_2px_rgba(31,29,26,0.04)]'
                      : 'text-(--color-muted) hover:bg-(--color-surface-elevated) hover:text-(--color-text)',
                  )
                }
                style={{ fontWeight: 500 }}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                {label}
              </NavLink>
            ))}
          </div>
        ))}

        <div className="mt-auto flex flex-col gap-2 px-1">
          <div className="rounded-md p-3 border border-(--color-line) bg-(--color-surface)">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <CheckCircle2
                  className="h-3 w-3 text-(--color-success)"
                  strokeWidth={2}
                />
                <span
                  className="text-[11px] text-(--color-text)"
                  style={{ fontWeight: 500 }}
                >
                  Pipeline
                </span>
              </div>
              <span className="text-[10px] text-(--color-success) font-medium">
                online
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-(--color-muted)">
              <span className="flex items-center gap-1">
                <Wifi className="h-2.5 w-2.5" strokeWidth={1.5} /> MQTT
              </span>
              <span
                className="tabular-nums"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                12 ms
              </span>
            </div>
          </div>

          <a
            href="https://github.com/moacyrsz/gs-space-connect"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] text-(--color-muted) hover:bg-(--color-surface-elevated) hover:text-(--color-text) transition-colors"
          >
            <Code2 className="h-3 w-3" strokeWidth={1.5} />
            <span className="flex-1">Repositório</span>
            <ExternalLink className="h-2.5 w-2.5" strokeWidth={1.5} />
          </a>
          <p className="px-2.5 text-[10px] leading-relaxed text-(--color-faint)">
            Moacyr Cabral da Silva
            <br />
            <span style={{ fontFamily: 'var(--font-mono)' }}>RM 559263</span>
          </p>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-(--color-line) bg-(--color-bg)/85 px-5 backdrop-blur-md">
          <Badge variant="outline" className="gap-1.5 hidden sm:inline-flex h-5 px-2 text-[10px]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-(--color-danger) badge-pulse" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-(--color-danger)" />
            </span>
            <span className="text-(--color-text-soft) font-medium tracking-[0.04em]">LIVE</span>
          </Badge>

          <Breadcrumb />

          <button
            type="button"
            onClick={() => setCmdOpen(true)}
            className="ml-auto flex items-center gap-2 rounded-md px-3 h-7 text-[12px] text-(--color-muted) border border-(--color-line) bg-(--color-surface) hover:bg-(--color-surface-elevated) hover:border-(--color-line-strong) transition-colors"
          >
            <Search className="h-3 w-3" strokeWidth={1.5} />
            <span className="hidden md:inline">Buscar</span>
            <kbd
              className="rounded px-1.5 py-0.5 text-[10px] text-(--color-text-soft) border border-(--color-line) bg-(--color-surface-elevated)"
              style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}
            >
              ⌘K
            </kbd>
          </button>

          <NotificationsButton open={notifOpen} onOpenChange={setNotifOpen} />

          <div className="hidden md:flex items-center gap-1.5 rounded-md px-2.5 h-7 text-[11px] text-(--color-muted) tabular-nums border border-(--color-line) bg-(--color-surface)" style={{ fontFamily: 'var(--font-mono)' }}>
            <Activity className="h-2.5 w-2.5" strokeWidth={1.5} />
            {formatTime(now)}
          </div>
        </header>

        <main className="flex-1 px-7 py-8 lg:px-10">
          <div className="fade-up max-w-[1440px] mx-auto">
            <Outlet />
          </div>
        </main>

        <ChatWidget />

        <footer className="border-t border-(--color-line) px-7 py-4 text-[11px] text-(--color-muted) lg:px-10 flex flex-wrap items-center justify-between gap-2">
          <span>GS 2026.1 · Space Connect · Dados mockados para fins didáticos</span>
          <span className="flex items-center gap-3">
            <span>Moacyr Cabral da Silva</span>
            <span className="text-(--color-faint)">·</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>RM 559263</span>
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

function Breadcrumb() {
  const pathname = window.location.pathname
  const current = routeLabels[pathname] || routeLabels['/']
  return (
    <div className="flex items-center gap-1.5 text-[12px] text-(--color-muted)">
      <span className="hidden md:inline">Space Connect</span>
      <ChevronRight
        className="hidden md:inline h-3 w-3 text-(--color-ghost)"
        strokeWidth={1.5}
      />
      <span className="text-(--color-text)" style={{ fontWeight: 500 }}>
        {current}
      </span>
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
        className="relative flex h-7 w-7 items-center justify-center rounded-md text-(--color-muted) border border-(--color-line) bg-(--color-surface) hover:bg-(--color-surface-elevated) hover:text-(--color-text) transition-colors"
        aria-label="Notificações"
      >
        <Bell className="h-3 w-3" strokeWidth={1.5} />
        {high > 0 && (
          <span
            className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-(--color-danger) px-1 text-[9px] font-semibold text-white"
            style={{ boxShadow: '0 0 0 2px var(--color-bg)' }}
          >
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
          <div className="absolute right-0 mt-2 w-80 surface-pop z-50 fade-up overflow-hidden">
            <div className="px-4 py-3 border-b border-(--color-line)">
              <p className="text-[13px]" style={{ fontWeight: 500 }}>
                Notificações
              </p>
              <p className="text-[10px] text-(--color-faint) mt-0.5">
                {initialAlerts.length} alertas no recorte atual
              </p>
            </div>
            <div className="max-h-80 overflow-y-auto p-1.5 scrollbar-thin">
              {initialAlerts.slice(0, 5).map((a) => (
                <div
                  key={a.id}
                  className="rounded-md px-2.5 py-2 hover:bg-(--color-surface-elevated) transition-colors cursor-default"
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge
                      variant={a.severity}
                      className="text-[9px] h-[16px] px-1.5"
                    >
                      {a.severity.toUpperCase()}
                    </Badge>
                    <span
                      className="text-[10px] text-(--color-faint) ml-auto"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {sourceLabels[a.source]}
                    </span>
                  </div>
                  <p className="text-[12px] truncate" style={{ fontWeight: 500 }}>
                    {a.region}
                  </p>
                  <p className="text-[11px] text-(--color-muted) line-clamp-1 leading-relaxed">
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
