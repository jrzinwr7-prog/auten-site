import { dateKey, generateTrainingPlan, sessionDate } from './planGenerator'
import type { Profile, WorkoutLog } from './types'

export type DisciplineStatus = 'completed' | 'missed' | 'planned' | 'rest' | 'future'

export interface DisciplineDay {
  date: string
  day: number
  status: DisciplineStatus
  label: string
}

/** Últimos 28 dias: agenda definida pelo plano, não pela ordem aleatória de treinos. */
export function buildDisciplineCalendar(profile: Profile, logs: WorkoutLog[], reference = new Date()): DisciplineDay[] {
  const plan = generateTrainingPlan(profile, logs, reference)
  const sessionsByWeekday = new Map(plan.map((session) => [session.weekday, session]))
  const days: DisciplineDay[] = []
  for (let offset = 27; offset >= 0; offset -= 1) {
    const current = new Date(reference)
    current.setHours(0, 0, 0, 0)
    current.setDate(current.getDate() - offset)
    const key = dateKey(current)
    const scheduled = sessionsByWeekday.get(current.getDay())
    const done = scheduled && logs.some((log) => log.sessionId === scheduled.id && (log.plannedDate === key || log.completedAt.slice(0, 10) === key))
    let status: DisciplineStatus = 'rest'
    if (done) status = 'completed'
    else if (scheduled && current.getTime() < new Date(reference.getFullYear(), reference.getMonth(), reference.getDate()).getTime()) status = 'missed'
    else if (scheduled && key === dateKey(reference)) status = 'planned'
    else if (current > reference) status = 'future'
    days.push({ date: key, day: current.getDate(), status, label: done ? 'Dia concluído' : scheduled ? status === 'missed' ? 'Treino não concluído' : 'Treino planejado' : 'Descanso planejado' })
  }
  return days
}

export function disciplineScore(days: DisciplineDay[]) {
  const scheduled = days.filter((day) => ['completed', 'missed', 'planned'].includes(day.status))
  const completed = scheduled.filter((day) => day.status === 'completed').length
  return { completed, scheduled: scheduled.length, percent: scheduled.length ? Math.round(completed / scheduled.length * 100) : 0 }
}
