import { describe, expect, it } from 'vitest'
import { calculateForecast, calculateNutritionTarget } from './calculations'
import { getProgressionSuggestion } from './progression'
import type { Exercise, Profile, WorkoutLog } from './types'

const profile: Profile = {
  id: 'test', sex: 'prefiro-nao-informar', age: 20, heightCm: 172, weightKg: 56,
  experience: 'iniciante', location: 'casa', daysPerWeek: 4, foodBudget: 200,
  goalWeightKg: 62, createdAt: '2026-01-01T12:00:00.000Z'
}

describe('nutrition and forecast estimates', () => {
  it('returns rounded, useful initial targets', () => {
    const result = calculateNutritionTarget(profile)
    expect(result.calories).toBeGreaterThan(1500)
    expect(result.calories % 50).toBe(0)
    expect(result.protein).toBe(95)
  })

  it('uses the stated 0.4–0.6 kg weekly forecast band', () => {
    const forecast = calculateForecast(profile)
    expect(forecast.minWeeks).toBe(10)
    expect(forecast.maxWeeks).toBe(15)
    expect(forecast.paceMin).toBe(.4)
    expect(forecast.paceMax).toBe(.6)
  })
})

describe('progression rule', () => {
  const exercise: Exercise = { id: 'squat', name: 'Agachamento', movement: 'agachar', equipment: 'nenhum', sets: 3, repRange: [10, 15], restSeconds: 60, cue: 'Controle', progression: ['Agachamento', 'Búlgaro'] }
  const log = (date: string, reps: number, form: WorkoutLog['exerciseResults'][number]['form']): WorkoutLog => ({ id: date, sessionId: 'lower-a', completedAt: date, exerciseResults: [{ exerciseId: 'squat', reps, form }] })

  it('suggests the next level after two top-rep sessions with good form', () => {
    expect(getProgressionSuggestion(exercise, [log('2026-11-01T12:00:00Z', 15, 'boa'), log('2026-11-08T12:00:00Z', 15, 'boa')])).toMatchObject({ current: 'Agachamento', next: 'Búlgaro' })
  })

  it('does not progress when form needs adjustment', () => {
    expect(getProgressionSuggestion(exercise, [log('2026-11-01T12:00:00Z', 15, 'boa'), log('2026-11-08T12:00:00Z', 15, 'ajustar')])).toBeNull()
  })
})
