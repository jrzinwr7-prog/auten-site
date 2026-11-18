import type { ReactNode } from 'react'
import { Apple, ChartNoAxesCombined, Dumbbell, House, UserRound } from 'lucide-react'
import type { AppTab, Profile } from '../domain/types'
import { Brand } from './ui'

const navItems: Array<{ id: AppTab; label: string; Icon: typeof House }> = [
  { id: 'hoje', label: 'Hoje', Icon: House },
  { id: 'treino', label: 'Treino', Icon: Dumbbell },
  { id: 'alimentacao', label: 'Comer', Icon: Apple },
  { id: 'evolucao', label: 'Evolução', Icon: ChartNoAxesCombined },
  { id: 'perfil', label: 'Perfil', Icon: UserRound }
]

export function AppShell({ activeTab, onTabChange, profile, children }: { activeTab: AppTab; onTabChange: (tab: AppTab) => void; profile: Profile; children: ReactNode }) {
  const greeting = profile.displayName?.trim() || 'você'
  return <div className="app-shell">
    <header className="app-header"><Brand /><button className="avatar" type="button" aria-label="Abrir perfil" onClick={() => onTabChange('perfil')}>{greeting.charAt(0).toUpperCase()}</button></header>
    <main className="app-content">{children}</main>
    <nav className="bottom-nav" aria-label="Navegação principal">
      {navItems.map(({ id, label, Icon }) => <button key={id} type="button" className={activeTab === id ? 'is-active' : ''} onClick={() => onTabChange(id)}><Icon size={20} strokeWidth={activeTab === id ? 2.7 : 2}/><span>{label}</span></button>)}
    </nav>
  </div>
}
