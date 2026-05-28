import { useEffect, useState } from 'react'
import { Command } from 'cmdk'
import * as Dialog from '@radix-ui/react-dialog'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Map,
  MessageCircle,
  Code2,
  ExternalLink,
  Trees,
  Flame,
  Settings2,
  ChevronRight,
} from 'lucide-react'
import { biomes } from '@/data/mocks'

export function CommandMenu({ open, onOpenChange }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!open) setSearch('')
  }, [open])

  const go = (to) => {
    onOpenChange(false)
    navigate(to)
  }

  const link = (url) => {
    onOpenChange(false)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-[20%] z-50 w-[92vw] max-w-xl -translate-x-1/2 surface-elev"
        >
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          <Command label="Comandos" loop>
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Buscar páginas, biomas, ações…"
            />
            <Command.List>
              <Command.Empty>Nada encontrado.</Command.Empty>

              <Command.Group heading="Navegação">
                <Command.Item onSelect={() => go('/')}>
                  <LayoutDashboard className="h-4 w-4 text-(--color-muted)" />
                  Visão Geral
                  <ChevronRight className="ml-auto h-3.5 w-3.5 text-(--color-faint)" />
                </Command.Item>
                <Command.Item onSelect={() => go('/mapa')}>
                  <Map className="h-4 w-4 text-(--color-muted)" />
                  Mapa de Alertas
                  <ChevronRight className="ml-auto h-3.5 w-3.5 text-(--color-faint)" />
                </Command.Item>
                <Command.Item onSelect={() => go('/assistente')}>
                  <MessageCircle className="h-4 w-4 text-(--color-muted)" />
                  Assistente Técnico
                  <ChevronRight className="ml-auto h-3.5 w-3.5 text-(--color-faint)" />
                </Command.Item>
              </Command.Group>

              <Command.Group heading="Filtros — biomas">
                {biomes.map((b) => (
                  <Command.Item
                    key={b.id}
                    onSelect={() => go(`/mapa?bioma=${b.id}`)}
                  >
                    <Trees className="h-4 w-4 text-(--color-muted)" />
                    Filtrar por {b.label}
                    <span
                      className="ml-auto h-2 w-2 rounded-full"
                      style={{ background: b.color }}
                    />
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Group heading="Ações rápidas">
                <Command.Item onSelect={() => go('/mapa?severity=high')}>
                  <Flame className="h-4 w-4 text-(--color-fire-high)" />
                  Ver apenas alertas críticos
                </Command.Item>
                <Command.Item onSelect={() => go('/assistente?q=net+zero')}>
                  <MessageCircle className="h-4 w-4 text-(--color-accent)" />
                  Perguntar sobre Net Zero
                </Command.Item>
              </Command.Group>

              <Command.Group heading="Externos">
                <Command.Item
                  onSelect={() => link('https://github.com/moacyrsz/gs-space-connect')}
                >
                  <Code2 className="h-4 w-4 text-(--color-muted)" />
                  Repositório no GitHub
                  <ExternalLink className="ml-auto h-3.5 w-3.5 text-(--color-faint)" />
                </Command.Item>
                <Command.Item
                  onSelect={() => link('https://firms.modaps.eosdis.nasa.gov/map')}
                >
                  <Settings2 className="h-4 w-4 text-(--color-muted)" />
                  NASA FIRMS
                  <ExternalLink className="ml-auto h-3.5 w-3.5 text-(--color-faint)" />
                </Command.Item>
                <Command.Item
                  onSelect={() => link('https://terrabrasilis.dpi.inpe.br/')}
                >
                  <Settings2 className="h-4 w-4 text-(--color-muted)" />
                  INPE TerraBrasilis
                  <ExternalLink className="ml-auto h-3.5 w-3.5 text-(--color-faint)" />
                </Command.Item>
              </Command.Group>
            </Command.List>
            <div className="flex items-center justify-between border-t border-(--color-line) px-3 py-2 text-[11px] text-(--color-faint)">
              <span>↑↓ navegar · ↵ selecionar · esc fechar</span>
              <span className="font-mono">Cmd / Ctrl + K</span>
            </div>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
