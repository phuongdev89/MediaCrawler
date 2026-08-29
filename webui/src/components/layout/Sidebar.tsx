import { BarChart3, BookOpen, Bug, Wifi } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCrawlerStore } from '@/store/crawlerStore'
import { useCrawlerStatus } from '@/hooks/useCrawler'
import { LanguageSwitch } from './LanguageSwitch'
import { ThemeToggle } from './ThemeToggle'

type AppPage = 'dashboard' | 'xhs'

interface SidebarProps {
  activePage: AppPage
  onPageChange: (page: AppPage) => void
}

const menuItems = [
  { page: 'dashboard' as const, label: 'Dashboard', icon: BarChart3 },
  { page: 'xhs' as const, label: 'Xiaohongshu', icon: BookOpen },
]

export function Sidebar({ activePage, onPageChange }: SidebarProps) {
  const { t } = useTranslation()
  const status = useCrawlerStore((state) => state.status)

  useCrawlerStatus()

  const isRunning = status === 'running'

  return (
    <header className="h-14 flex-shrink-0 glass-panel border-b border-cyber-border-subtle relative z-10">
      <div className="h-full px-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Bug className="w-5 h-5 text-cyber-neon-cyan" />
          <span className="font-mono font-bold text-cyber-text-primary tracking-wider text-sm">
            MediaCrawler
          </span>
          {isRunning && (
            <Badge variant="running" className="text-[10px]">
              {t('status.active')}
            </Badge>
          )}
          {isRunning && (
            <span className="w-2 h-2 bg-cyber-neon-green rounded-full shadow-glow-green-sm animate-pulse-fast" />
          )}
        </div>

        <nav className="flex items-center gap-1 rounded-lg border border-cyber-border-subtle bg-cyber-bg-tertiary/40 p-1">
          {menuItems.map(({ page, label, icon: Icon }) => {
            const isActive = activePage === page

            return (
              <Button
                key={page}
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(page)}
                className={`h-8 px-3 font-mono text-xs ${
                  isActive
                    ? 'bg-cyber-neon-cyan/20 text-cyber-neon-cyan border border-cyber-neon-cyan/40 shadow-glow-cyan-sm'
                    : 'text-cyber-text-secondary hover:text-cyber-neon-cyan'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Button>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LanguageSwitch />

          <div className="hidden lg:flex items-center gap-2 text-xs font-mono">
            <span className="text-cyber-text-muted">{t('sidebar.api')}:</span>
            <span className="text-cyber-neon-green">v1.0.0</span>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3 h-3 text-cyber-text-secondary" />
              <span className="text-cyber-text-secondary">{t('sidebar.local')}</span>
              <span className="status-dot status-dot-online" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
