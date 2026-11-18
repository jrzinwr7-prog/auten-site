import type { Exercise, WorkoutLog } from './types'

export interface ProgressionSuggestion {
  exerciseId: string
  current: string
  next: string
}

/**
 * Propõe uma evolução quando o teto da faixa foi registrado com boa forma
 * nas duas últimas sessões que contêm o exercício. A pessoa sempre confirma.
 */
export function getProgressionSuggestion(exercise: Exercise, logs: WorkoutLog[]): ProgressionSuggestion | null {
  const attempts = logs
    .map((log) => ({ log, result: log.exerciseResults.find((result) => result.exerciseId === exercise.id) }))
    .filter((item): item is { log: WorkoutLog; result: NonNullable<typeof item.result> } => Boolean(item.result))
    .sort((a, b) => b.log.completedAt.localeCompare(a.log.completedAt))
    .slice(0, 2)

  if (attempts.length < 2) return null
  const reachedTopTwice = attempts.every(({ result }) => result.reps >= exercise.repRange[1] && result.form === 'boa')
  if (!reachedTopTwice || exercise.progression.length < 2) return null

  return {
    exerciseId: exercise.id,
    current: exercise.progression[0],
    next: exercise.progression[1]
  }
}
