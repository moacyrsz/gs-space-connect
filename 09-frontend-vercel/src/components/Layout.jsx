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
            background: 'var(--color-surface-overlay)',
            boxShadow:
              'inset 0 0 0 1px var(--color-line-strong), 0 8px 24px -8px oklch(0 0 0 / 0.5)',
            color: 'var(--color-text)',
            fontSize: '13px',
            borderRadius: '10px',
          },
        }}
      />

      <CommandMenu open={cmdOpen} onOpenChange={setCmdOpen} />

      <aside className="hidden md:flex w-[248px] shrink-0 flex-col border-r border-(--color-line) bg-(--color-bg-canvas)/60 px-3.5 py-5 backdrop-blur-sm">
        <Link
          to="/"
          className="flex items-center gap-2.5 px-2 py-1.5 mb-7 rounded-md hover:bg-(--color-surface-elevated)/50 transition-colors"
        >
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-(--color-surface-overlay) to-(--color-surface-elevated) shadow-[inset_0_0_0_1px_var(--color-line-strongest),inset_0_1px_0_oklch(1_0_0_/_0.06),0_2px_8px_-2px_oklch(0_0_0_/_0.4)]">
            <span
              className="font-mono text-[11px] tracking-tight text-(--color-accent)"
              style={{ fontWeight: 600 }}
            >
              SC
            </span>
          </div>
          <div className="flex flex-col leading-tight">
            <span
              className="text-[13px] tracking-[-0.01em] text-(--color-text)"
              style={{ fontWeight: 510 }}
            >
              Space Connect
            </span>
            <span className="text-[10px] text-(--color-faint) font-mono">FIAP · GS 2026.1</span>
          </div>
        </Link>

        {navSections.map((section) => (
          <div key={section.label} className="flex flex-col gap-0.5 mb-6">
            <p className="px-2.5 mb-1.5 text-[10px] uppercase tracking-[0.08em] text-(--color-faint) font-medium">
              {section.label}
            </p>
            {section.items.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors duration-150',
                    isActive
                      ? 'bg-(--color-surface-elevated) text-(--color-text) shadow-[inset_0_0_0_1px_var(--color-line),inset_0_1px_0_oklch(1_0_0_/_0.03)]'
                      : 'text-(--color-muted) hover:bg-(--color-surface-elevated)/40 hover:text-(--color-text-soft)',
                  )
                }
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                {label}
              </NavLink>
            ))}
          </div>
        ))}

        <div className="mt-auto flex flex-col gap-2 px-1">
          <div className="rounded-md p-3 shadow-[inset_0_0_0_1px_var(--color-line-strong),inset_0_1px_0_oklch(1_0_0_/_0.03)]">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-(--color-success)" strokeWidth={2} />
                <span className="text-[11px] text-(--color-text)" style={{ fontWeight: 510 }}>
                  Pipeline
                </span>
              </div>
              <span className="text-[10px] text-(--color-success) font-medium">online</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-(--color-muted)">
              <span className="flex items-center gap-1">
                <Wifi className="h-2.5 w-2.5" strokeWidth={1.75} /> MQTT
              </span>
              <span className="font-mono tabular-nums">12 ms</span>
            </div>
          </div>

          <a
            href="https://github.com/moacyrsz/gs-space-connect"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] text-(--color-muted) hover:bg-(--color-surface-elevated)/50 hover:text-(--color-text) transition-colors"
          >
            <Code2 className="h-3 w-3" strokeWidth={1.75} />
            <span className="flex-1">Repositório</span>
            <ExternalLink className="h-2.5 w-2.5" strokeWidth={1.75} />
          </a>
          <p className="px-2.5 text-[10px] leading-relaxed text-(--color-faint)">
            Moacyr Cabral da Silva
            <br />
            <span className="font-mono">RM 559263</span>
          </p>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-(--color-line) bg-(--color-bg)/80 px-5 backdrop-blur-md">
          <Badge variant="outline" className="gap-1.5 hidden sm:inline-flex h-5 px-2 text-[10px]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-(--color-danger) badge-pulse" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-(--color-danger)" />
            </span>
            <span className="text-(--color-text-soft) font-medium tracking-[0.02em]">LIVE</span>
          </Badge>

          <button
            type="button"
            onClick={() => setCmdOpen(true)}
            className="hidden md:flex flex-1 max-w-md items-center gap-2 rounded-md px-3 h-7 text-[12px] text-(--color-muted) shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-(--color-surface-elevated)/50 hover:text-(--color-text) transition-colors"
          >
            <Search className="h-3 w-3" strokeWidth={1.75} />
            <span className="flex-1 text-left">Buscar páginas, biomas, ações</span>
            <kbd
              className="rounded px-1.5 py-0.5 font-mono text-[10px] text-(--color-text-soft) shadow-[inset_0_0_0_1px_var(--color-line-strong)]"
              style={{ fontWeight: 510 }}
            >
              ⌘K
            </kbd>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <NotificationsButton open={notifOpen} onOpenChange={setNotifOpen} />

            <div className="hidden md:flex items-center gap-1.5 rounded-md px-2.5 h-7 text-[11px] text-(--color-muted) tabular-nums font-mono shadow-[inset_0_0_0_1px_var(--color-line-strong)]">
              <Activity className="h-2.5 w-2.5" strokeWidth={1.75} />
              {formatTime(now)}
            </div>
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
        className="relative flex h-7 w-7 items-center justify-center rounded-md text-(--color-muted) shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-(--color-surface-elevated)/60 hover:text-(--color-text) transition-colors"
        aria-label="Notificações"
      >
        <Bell className="h-3 w-3" strokeWidth={1.75} />
        {high > 0 && (
          <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-(--color-danger) px-1 text-[9px] font-semibold text-white shadow-[0_0_0_2px_var(--color-bg)]">
            {high}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => onOpenChange(false)} />
          <div className="absolute right-0 mt-2 w-80 surface-pop z-50 fade-up overflow-hidden">
            <div className="px-4 py-3 border-b border-(--color-line)">
              <p className="text-[13px]" style={{ fontWeight: 510 }}>Notificações</p>
              <p className="text-[10px] text-(--color-faint) mt-0.5">
                {initialAlerts.length} alertas no recorte atual
              </p>
            </div>
            <div className="max-h-80 overflow-y-auto p-1.5 scrollbar-thin">
              {initialAlerts.slice(0, 5).map((a) => (
                <div
                  key={a.id}
                  className="rounded-md px-2.5 py-2 hover:bg-(--color-surface-elevated)/60 transition-colors cursor-default"
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge variant={a.severity} className="text-[9px] h-[16px] px-1.5">
                      {a.severity.toUpperCase()}
                    </Badge>
                    <span className="text-[10px] text-(--color-faint) ml-auto font-mono">
                      {sourceLabels[a.source]}
                    </span>
                  </div>
                  <p className="text-[12px] truncate" style={{ fontWeight: 510 }}>{a.region}</p>
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
