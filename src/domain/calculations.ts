import type { Forecast, NutritionTarget, Profile, WeightEntry } from './types'

const roundTo = (value: number, step: number) => Math.round(value / step) * step

/** Estimativa inicial para orientar ajustes, não uma prescrição nutricional. */
export function calculateNutritionTarget(profile: Profile): NutritionTarget {
  const isAdult = profile.age >= 18
  const sexAdjustment = profile.sex === 'masculino' ? 5 : profile.sex === 'feminino' ? -161 : -78
  const bmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + sexAdjustment
  const activityFactor = profile.experience === 'sedentario' ? 1.3 : 1.42
  const weightBasedCalories = profile.weightKg * (profile.experience === 'sedentario' ? 43 : 46)
  const formulaCalories = bmr * activityFactor + 280
  const calories = roundTo(Math.max(1500, isAdult ? formulaCalories : weightBasedCalories), 50)

  return {
    calories,
    protein: roundTo(profile.weightKg * 1.7, 5),
    method: isAdult ? 'estimativa por fórmula' : 'estimativa inicial por peso'
  }
}

export function calculateForecast(profile: Profile): Forecast {
  const gainNeeded = Math.max(0, profile.goalWeightKg - profile.weightKg)
  const minWeeks = Math.ceil(gainNeeded / 0.6)
  const maxWeeks = Math.ceil(gainNeeded / 0.4)
  const start = new Date()
  const earliest = new Date(start)
  earliest.setDate(start.getDate() + minWeeks * 7)
  const latest = new Date(start)
  latest.setDate(start.getDate() + maxWeeks * 7)

  return {
    minWeeks,
    maxWeeks,
    paceMin: 0.4,
    paceMax: 0.6,
    projectedStart: earliest.toISOString(),
    projectedEnd: latest.toISOString()
  }
}

export function currentWeight(profile: Profile, entries: WeightEntry[]): number {
  if (!entries.length) return profile.weightKg
  return [...entries].sort((a, b) => b.date.localeCompare(a.date))[0].weightKg
}

export function formatKg(weight: number): string {
  return `${weight.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg`
}

export function calculateStreak(logs: Array<{ completedAt: string }>): number {
  if (!logs.length) return 0
  const uniqueDays = new Set(logs.map((log) => log.completedAt.slice(0, 10)))
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  let streak = 0
  while (uniqueDays.has(cursor.toISOString().slice(0, 10))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function formatShortDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(date))
}
