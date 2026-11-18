import type { PersistedAppState } from '../domain/types'

/** A fictional, opt-in demo. It is never used as a new user's personal profile. */
export const demoState: PersistedAppState = {
  id: 'current',
  profile: {
    id: 'demo-profile',
    displayName: 'Seu perfil',
    sex: 'prefiro-nao-informar',
    age: 20,
    heightCm: 172,
    weightKg: 56,
    experience: 'iniciante',
    location: 'casa',
    daysPerWeek: 4,
    foodBudget: 220,
    goalWeightKg: 62,
    goalDate: '',
    availableFoodIds: ['eggs', 'milk', 'rice', 'beans', 'oats', 'banana', 'peanuts', 'vegetables', 'bread'],
    createdAt: '2026-11-18T12:00:00.000Z'
  },
  weightEntries: [
    { id: 'w1', date: '2026-10-14T09:00:00.000Z', weightKg: 55.1 },
    { id: 'w2', date: '2026-10-21T09:00:00.000Z', weightKg: 55.4 },
    { id: 'w3', date: '2026-10-28T09:00:00.000Z', weightKg: 55.7 },
    { id: 'w4', date: '2026-11-04T09:00:00.000Z', weightKg: 55.8 },
    { id: 'w5', date: '2026-11-11T09:00:00.000Z', weightKg: 56 }
  ],
  measurements: [],
  progressPhotos: [],
  workoutLogs: [],
  mealLogs: [],
  reminders: { enabled: false, breakfast: '07:00', lunch: '12:30', dinner: '19:30' }
}
