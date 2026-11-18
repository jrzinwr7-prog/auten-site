import { Award, X } from 'lucide-react'
import { getAchievement } from '../domain/achievements'

export function AchievementCelebration({ achievementId, onClose }: { achievementId: string; onClose: () => void }) {
  const achievement = getAchievement(achievementId)
  if (!achievement) return null
  return <div className="achievement-overlay" role="dialog" aria-modal="true" aria-label="Nova conquista"><div className="achievement-burst" aria-hidden="true"><i/><i/><i/><i/><i/></div><section className="achievement-modal"><button type="button" className="achievement-close" onClick={onClose} aria-label="Fechar conquista"><X size={18}/></button><span className="achievement-medal">{achievement.icon}</span><p>NOVA CONQUISTA</p><h2>{achievement.title}</h2><span>{achievement.description}</span><button type="button" onClick={onClose}><Award size={16}/>Continuar</button></section></div>
}
