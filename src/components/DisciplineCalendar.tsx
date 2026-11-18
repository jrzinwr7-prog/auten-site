import { CalendarDays, ShieldCheck } from 'lucide-react'
import { buildDisciplineCalendar, disciplineScore } from '../domain/discipline'
import type { Profile, WorkoutLog } from '../domain/types'

export function DisciplineCalendar({ profile, logs }: { profile: Profile; logs: WorkoutLog[] }) {
  const days = buildDisciplineCalendar(profile, logs)
  const score = disciplineScore(days)
  return <section className="discipline-calendar" aria-label="Calendário de disciplina dos últimos 28 dias"><header><span className="discipline-icon"><CalendarDays size={17}/></span><div><p>CALENDÁRIO DA DISCIPLINA</p><b>{score.percent}% de aderência</b></div><span className="discipline-count"><ShieldCheck size={15}/>{score.completed}/{score.scheduled}</span></header><div className="calendar-weekdays" aria-hidden="true">{['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div><div className="calendar-grid">{days.map((day) => <span key={day.date} className={`calendar-day ${day.status}`} title={`${day.date}: ${day.label}`} aria-label={`${day.day}: ${day.label}`}>{day.day}</span>)}</div><footer><span><i className="legend-completed"/>feito</span><span><i className="legend-planned"/>planejado</span><span><i className="legend-missed"/>não concluído</span><span><i className="legend-rest"/>descanso</span></footer></section>
}
