import { describe, expect, it } from 'vitest'
import { calculateForecast, calculateNutritionTarget } from './calculations'
import { getProgressionSuggestion } from './progression'
import { adaptExercise, generateTrainingPlan } from './planGenerator'
import { recipesForAvailableFoods } from '../data/nutrition'
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

  it('reduces the next prescription after two difficult sessions', () => {
    const difficult = [
      { ...log('2026-11-01T12:00:00Z', 8, 'ajustar'), difficulty: 4 as const },
      { ...log('2026-11-08T12:00:00Z', 8, 'ok'), difficulty: 5 as const }
    ]
    const adapted = adaptExercise(exercise, difficult)
    expect(adapted.adaptation.mode).toBe('consolidar')
    expect(adapted.sets).toBe(2)
    expect(adapted.repRange[1]).toBeLessThan(exercise.repRange[1])
  })

  it('increases reps and volume only after repeatable good sessions', () => {
    const successful = [1, 2, 3, 4].map((index) => ({ ...log(`2026-11-0${index}T12:00:00Z`, 15, 'boa'), difficulty: 2 as const }))
    const adapted = adaptExercise(exercise, successful)
    expect(adapted.adaptation.mode).toBe('avancar')
    expect(adapted.sets).toBe(4)
    expect(adapted.repRange[0]).toBeGreaterThan(exercise.repRange[0])
  })
})

describe('deterministic plan and food filtering', () => {
  it('assigns fixed days for a four-day plan', () => {
    const plan = generateTrainingPlan(profile, [], new Date('2026-11-18T12:00:00'))
    expect(plan.map((session) => [session.dayNumber, session.weekday])).toEqual([[1, 1], [2, 2], [3, 4], [4, 5]])
  })

  it('only releases recipes compatible with selected foods', () => {
    const recipes = recipesForAvailableFoods(['milk', 'banana', 'oats', 'peanuts'])
    expect(recipes.map((recipe) => recipe.id)).toEqual(['smoothie', 'oats'])
  })
})
