import { useEffect, useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Map,
  MessageCircle,
  Code2,
  Satellite,
  Activity,
  ExternalLink,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn, formatTime } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Visão Geral', icon: LayoutDashboard, end: true },
  { to: '/mapa', label: 'Mapa de Alertas', icon: Map },
  { to: '/assistente', label: 'Assistente Técnico', icon: MessageCircle },
]

const REFRESH_INTERVAL = 90 // s

function Layout() {
  const [now, setNow] = useState(new Date())
  const [refreshIn, setRefreshIn] = useState(REFRESH_INTERVAL)

  useEffect(() => {
    const tick = setInterval(() => {
      setNow(new Date())
      setRefreshIn((r) => (r <= 1 ? REFRESH_INTERVAL : r - 1))
    }, 1000)
    return () => clearInterval(tick)
  }, [])

  return (
    <div className="flex min-h-screen text-(--color-text)">
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-(--color-line) bg-(--color-panel) px-4 py-5">
        <Link to="/" className="flex items-center gap-2.5 px-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--color-accent)/15 text-(--color-accent)">
            <Satellite className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight">Space Connect</span>
            <span className="text-[11px] text-(--color-muted)">FIAP · GS 2026.1</span>
          </div>
        </Link>

        <nav className="flex flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-(--color-panel-2) text-(--color-text)'
                    : 'text-(--color-muted) hover:bg-(--color-panel-2)/60 hover:text-(--color-text)',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2 px-1">
          <a
            href="https://github.com/moacyrsz/gs-space-connect"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-lg border border-(--color-line) px-3 py-2 text-xs text-(--color-muted) hover:bg-(--color-panel-2) hover:text-(--color-text)"
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
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-(--color-line) bg-(--color-bg)/80 px-5 backdrop-blur">
          <div className="flex items-center gap-3 min-w-0">
            <Badge variant="high" className="gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-(--color-fire-high) opacity-75 live-pulse" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-(--color-fire-high)" />
              </span>
              LIVE
            </Badge>
            <span className="hidden md:block text-xs text-(--color-muted)">
              Próxima atualização em {refreshIn}s
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-(--color-muted) tabular-nums">
            <Activity className="h-3.5 w-3.5" />
            <span>{formatTime(now)}</span>
          </div>
        </header>

        <main className="flex-1 px-5 py-6 lg:px-7">
          <Outlet />
        </main>

        <footer className="border-t border-(--color-line) px-5 py-3 text-[11px] text-(--color-muted) lg:px-7">
          GS 2026.1 · Space Connect · Dados mockados para fins didáticos · Moacyr Cabral
          da Silva (RM 559263)
        </footer>
      </div>
    </div>
  )
}

export default Layout
