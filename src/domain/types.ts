export type Sex = 'masculino' | 'feminino' | 'prefiro-nao-informar'
export type Experience = 'sedentario' | 'iniciante' | 'intermediario'
export type TrainingLocation = 'casa' | 'academia'
export type AppTab = 'hoje' | 'treino' | 'alimentacao' | 'evolucao' | 'perfil'

export interface Profile {
  id: string
  displayName?: string
  sex: Sex
  age: number
  heightCm: number
  weightKg: number
  experience: Experience
  location: TrainingLocation
  daysPerWeek: number
  foodBudget: number
  goalWeightKg: number
  goalDate?: string
  createdAt: string
}

export interface Exercise {
  id: string
  name: string
  movement: 'agachar' | 'empurrar' | 'puxar' | 'quadril' | 'panturrilha' | 'core' | 'braco' | 'costas'
  equipment: 'nenhum' | 'mochila' | 'mesa' | 'cadeiras' | 'degrau'
  sets: number
  repRange: [number, number]
  restSeconds: number
  cue: string
  caution?: string
  progression: string[]
}

export interface PlanSession {
  id: string
  code: string
  title: string
  focus: string
  estimatedMinutes: number
  exercises: Exercise[]
}

export interface WorkoutLog {
  id: string
  sessionId: string
  completedAt: string
  exerciseResults: Array<{
    exerciseId: string
    reps: number
    form: 'boa' | 'ok' | 'ajustar'
  }>
}

export interface WeightEntry {
  id: string
  date: string
  weightKg: number
}

export interface Measurements {
  id: string
  date: string
  thighCm?: number
  calfCm?: number
  armCm?: number
  chestCm?: number
  waistCm?: number
}

export interface ProgressPhoto {
  id: string
  date: string
  dataUrl: string
  note?: string
}

export interface MealLog {
  id: string
  date: string
  mealId: string
  calories: number
  protein: number
}

export interface ReminderSettings {
  enabled: boolean
  breakfast: string
  lunch: string
  dinner: string
  notificationPermission?: NotificationPermission | 'unsupported'
}

export interface PersistedAppState {
  id: 'current'
  profile?: Profile
  weightEntries: WeightEntry[]
  measurements: Measurements[]
  progressPhotos: ProgressPhoto[]
  workoutLogs: WorkoutLog[]
  mealLogs: MealLog[]
  reminders: ReminderSettings
}

export interface NutritionTarget {
  calories: number
  protein: number
  method: 'estimativa por fórmula' | 'estimativa inicial por peso'
}

export interface Forecast {
  minWeeks: number
  maxWeeks: number
  paceMin: number
  paceMax: number
  projectedStart: string
  projectedEnd: string
}
