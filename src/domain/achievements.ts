import type { Achievement, MealLog, Profile, WeightEntry, WorkoutLog } from './types'

export const achievementCatalog = [
  { id: 'first-workout', title: 'Primeiro passo', description: 'Você concluiu seu primeiro Dia de treino.', icon: '⚡' },
  { id: 'three-workouts', title: 'Ritmo criado', description: 'Três treinos registrados: você já está construindo uma rotina.', icon: '🔥' },
  { id: 'first-meal', title: 'Combustível colocado', description: 'Sua primeira refeição foi registrada.', icon: '🥣' },
  { id: 'week-strong', title: 'Semana firme', description: 'Você concluiu todos os treinos programados em uma semana.', icon: '🏅' },
  { id: 'first-kilo', title: 'Marco de 1 kg', description: 'Sua tendência avançou 1 kg desde o início.', icon: '📈' }
] as const

export type AchievementId = typeof achievementCatalog[number]['id']

export function findNewAchievements({ profile, workoutLogs, mealLogs, weights, current }: { profile: Profile; workoutLogs: WorkoutLog[]; mealLogs: MealLog[]; weights: WeightEntry[]; current: Achievement[] }): Achievement[] {
  const unlocked = new Set(current.map((achievement) => achievement.id))
  const candidates: AchievementId[] = []
  if (workoutLogs.length >= 1) candidates.push('first-workout')
  if (workoutLogs.length >= 3) candidates.push('three-workouts')
  if (mealLogs.length >= 1) candidates.push('first-meal')
  if (workoutLogs.filter((log) => Date.now() - new Date(log.completedAt).getTime() < 7 * 86400000).length >= profile.daysPerWeek) candidates.push('week-strong')
  if (weights.some((weight) => weight.weightKg >= profile.weightKg + 1)) candidates.push('first-kilo')
  const now = new Date().toISOString()
  return candidates.filter((id) => !unlocked.has(id)).map((id) => ({ id, unlockedAt: now }))
}

export function getAchievement(id: string) {
  return achievementCatalog.find((achievement) => achievement.id === id)
}
