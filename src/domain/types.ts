export type Sex = 'masculino' | 'feminino' | 'prefiro-nao-informar'
export type Experience = 'sedentario' | 'iniciante' | 'intermediario'
export type TrainingLocation = 'casa' | 'academia'
export type AppTab = 'hoje' | 'treino' | 'alimentacao' | 'evolucao' | 'perfil'
export type FormQuality = 'boa' | 'ok' | 'ajustar'
export type TrainingDifficulty = 1 | 2 | 3 | 4 | 5

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
  /** IDs do catálogo que a pessoa disse ter acesso/aceitar comer. */
  availableFoodIds?: string[]
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
  /** Da variação mais simples para a mais exigente. */
  progression: string[]
}

export type AdaptationMode = 'base' | 'consolidar' | 'avancar'

export interface PlannedExercise extends Exercise {
  displayName: string
  adaptation: {
    mode: AdaptationMode
    note: string
    completedGoodSessions: number
  }
}

export interface PlanSession {
  id: string
  code: string
  title: string
  focus: string
  estimatedMinutes: number
  /** Dia estável dentro do plano. Não depende de sorte ou da ordem de cliques. */
  dayNumber: number
  weekday: number
  weekdayLabel: string
  programWeek: number
  exercises: PlannedExercise[]
}

export interface ExerciseResult {
  exerciseId: string
  reps: number
  form: FormQuality
}

export interface WorkoutLog {
  id: string
  sessionId: string
  completedAt: string
  /** Data de referência do Dia N. Permite visualizar aderência no calendário. */
  plannedDate?: string
  difficulty?: TrainingDifficulty
  volume?: number
  exerciseResults: ExerciseResult[]
}

/** Progresso parcial de um Dia, persistido caso a pessoa feche o app no meio do treino. */
export interface WorkoutDraft {
  sessionId: string
  plannedDate: string
  updatedAt: string
  exerciseResults: ExerciseResult[]
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

export interface Achievement {
  id: string
  unlockedAt: string
}

export interface PersistedAppState {
  id: 'current'
  profile?: Profile
  weightEntries: WeightEntry[]
  measurements: Measurements[]
  progressPhotos: ProgressPhoto[]
  workoutLogs: WorkoutLog[]
  workoutDrafts?: WorkoutDraft[]
  mealLogs: MealLog[]
  achievements?: Achievement[]
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
