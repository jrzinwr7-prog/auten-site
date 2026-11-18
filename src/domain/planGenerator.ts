import { homeExercises as ex } from '../data/exercises'
import type { Exercise, PlanSession, PlannedExercise, Profile, WorkoutLog } from './types'

const weekdayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

type SessionTemplate = Omit<PlanSession, 'dayNumber' | 'weekday' | 'weekdayLabel' | 'programWeek' | 'exercises'> & { exercises: Exercise[] }

const templates: Record<string, SessionTemplate> = {
  lowerA: { id: 'lower-a', code: 'INF A', title: 'Inferiores A', focus: 'Coxas + panturrilhas', estimatedMinutes: 38, exercises: [ex.squat, ex.bulgarian, ex.calf, ex.bridge, ex.plank] },
  upperA: { id: 'upper-a', code: 'SUP A', title: 'Superiores A', focus: 'Peito + costas + core', estimatedMinutes: 40, exercises: [ex.pushup, ex.backpackRow, ex.pike, ex.curlBag, ex.deadBug] },
  lowerB: { id: 'lower-b', code: 'INF B', title: 'Inferiores B', focus: 'Posterior + estabilidade', estimatedMinutes: 39, exercises: [ex.lunge, ex.curl, ex.bridge, ex.calf, ex.sidePlank] },
  upperB: { id: 'upper-b', code: 'SUP B', title: 'Superiores B', focus: 'Braços + costas + core', estimatedMinutes: 40, exercises: [ex.diamond, ex.tableRow, ex.dip, ex.ytw, ex.legRaise] },
  fullA: { id: 'full-a', code: 'FULL A', title: 'Corpo todo A', focus: 'Força de base', estimatedMinutes: 38, exercises: [ex.squat, ex.pushup, ex.backpackRow, ex.bridge, ex.plank] },
  fullB: { id: 'full-b', code: 'FULL B', title: 'Corpo todo B', focus: 'Base + estabilidade', estimatedMinutes: 38, exercises: [ex.lunge, ex.pike, ex.backpackRow, ex.curl, ex.deadBug] }
}

function stableSchedule(daysPerWeek: number): Array<{ key: keyof typeof templates; weekday: number }> {
  if (daysPerWeek <= 2) return [{ key: 'fullA', weekday: 2 }, { key: 'fullB', weekday: 5 }]
  if (daysPerWeek === 3) return [{ key: 'lowerA', weekday: 1 }, { key: 'upperA', weekday: 3 }, { key: 'fullA', weekday: 5 }]
  return [{ key: 'lowerA', weekday: 1 }, { key: 'upperA', weekday: 2 }, { key: 'lowerB', weekday: 4 }, { key: 'upperB', weekday: 5 }]
}

function mondayOf(date: Date): Date {
  const result = new Date(date)
  const offset = (result.getDay() + 6) % 7
  result.setHours(0, 0, 0, 0)
  result.setDate(result.getDate() - offset)
  return result
}

export function dateKey(date: Date): string {
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10)
}

export function programWeek(profile: Profile, reference = new Date()): number {
  const start = mondayOf(new Date(profile.createdAt))
  const current = mondayOf(reference)
  return Math.max(1, Math.floor((current.getTime() - start.getTime()) / 604800000) + 1)
}

function recentResults(exercise: Exercise, logs: WorkoutLog[]) {
  return logs
    .map((log) => ({ log, result: log.exerciseResults.find((result) => result.exerciseId === exercise.id) }))
    .filter((item): item is { log: WorkoutLog; result: NonNullable<typeof item.result> } => Boolean(item.result))
    .sort((a, b) => b.log.completedAt.localeCompare(a.log.completedAt))
}

/**
 * Auto-regulação previsível: o treino reduz quando a dificuldade se repete
 * e só aumenta reps/volume depois de sessões bem executadas. Nunca é aleatório.
 */
export function adaptExercise(exercise: Exercise, logs: WorkoutLog[]): PlannedExercise {
  const attempts = recentResults(exercise, logs)
  const lastTwo = attempts.slice(0, 2)
  const needsConsolidation = lastTwo.length === 2 && lastTwo.every(({ log, result }) => (log.difficulty ?? 3) >= 4 || result.form === 'ajustar')
  // Só conta uma sequência recente de boas sessões. Um período difícil interrompe a progressão.
  const firstNonSuccessful = attempts.findIndex(({ log, result }) => !(result.form === 'boa' && result.reps >= exercise.repRange[1] && (log.difficulty ?? 3) <= 3))
  const successful = attempts.slice(0, firstNonSuccessful === -1 ? attempts.length : firstNonSuccessful)

  if (needsConsolidation) {
    const max = Math.max(exercise.repRange[0], exercise.repRange[1] - 3)
    return {
      ...exercise,
      displayName: `${exercise.progression[0]} · consolidação`,
      sets: Math.max(2, exercise.sets - 1),
      repRange: [Math.max(4, exercise.repRange[0] - 2), max],
      adaptation: { mode: 'consolidar', note: 'Duas sessões difíceis: reduzimos o volume para dominar a técnica com segurança.', completedGoodSessions: successful.length }
    }
  }

  if (successful.length >= 2) {
    const repBoost = Math.min(2, Math.floor(successful.length / 2))
    const nextVariation = exercise.progression[1]
    return {
      ...exercise,
      displayName: exercise.progression[0],
      sets: successful.length >= 4 ? exercise.sets + 1 : exercise.sets,
      repRange: [exercise.repRange[0] + repBoost, exercise.repRange[1] + repBoost],
      adaptation: {
        mode: 'avancar',
        note: nextVariation ? `Você dominou a faixa. Próxima sugestão: ${nextVariation}.` : 'Você dominou a faixa. Mantenha técnica e controle.',
        completedGoodSessions: successful.length
      }
    }
  }

  return { ...exercise, displayName: exercise.progression[0], adaptation: { mode: 'base', note: 'Construa controle antes de aumentar a dificuldade.', completedGoodSessions: successful.length } }
}

export function generateTrainingPlan(profile: Profile, logs: WorkoutLog[] = [], reference = new Date()): PlanSession[] {
  const week = programWeek(profile, reference)
  return stableSchedule(profile.daysPerWeek).map(({ key, weekday }, index) => {
    const template = templates[key]
    return {
      ...template,
      dayNumber: index + 1,
      weekday,
      weekdayLabel: weekdayNames[weekday],
      programWeek: week,
      exercises: template.exercises.map((exercise) => adaptExercise(exercise, logs))
    }
  })
}

export function sessionDate(session: PlanSession, reference = new Date()): string {
  const monday = mondayOf(reference)
  const target = new Date(monday)
  target.setDate(monday.getDate() + ((session.weekday + 6) % 7))
  return dateKey(target)
}

export function getTodaySession(plan: PlanSession[], reference = new Date()): PlanSession | undefined {
  return plan.find((session) => session.weekday === reference.getDay())
}

export function sessionVolume(session: PlanSession, results: WorkoutLog['exerciseResults']): number {
  return session.exercises.reduce((total, exercise) => {
    const result = results.find((item) => item.exerciseId === exercise.id)
    return total + (result?.reps ?? 0) * exercise.sets
  }, 0)
}

export function isSessionDone(session: PlanSession, logs: WorkoutLog[], reference = new Date()): boolean {
  const target = sessionDate(session, reference)
  return logs.some((log) => log.sessionId === session.id && (log.plannedDate === target || log.completedAt.slice(0, 10) === target))
}

export function weekCompletion(plan: PlanSession[], logs: WorkoutLog[], reference = new Date()): number {
  if (!plan.length) return 0
  return Math.round(plan.filter((session) => isSessionDone(session, logs, reference)).length / plan.length * 100)
}
