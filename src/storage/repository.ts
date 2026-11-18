import Dexie, { type Table } from 'dexie'
import type { PersistedAppState } from '../domain/types'

const defaultState: PersistedAppState = {
  id: 'current',
  weightEntries: [],
  measurements: [],
  progressPhotos: [],
  workoutLogs: [],
  workoutDrafts: [],
  mealLogs: [],
  achievements: [],
  reminders: {
    enabled: false,
    breakfast: '07:00',
    lunch: '12:30',
    dinner: '19:30'
  }
}

function normalizeState(state: PersistedAppState): PersistedAppState {
  return {
    ...structuredClone(defaultState),
    ...state,
    achievements: state.achievements ?? [],
    workoutDrafts: state.workoutDrafts ?? [],
    profile: state.profile ? { ...state.profile, availableFoodIds: state.profile.availableFoodIds ?? [] } : undefined,
    reminders: { ...defaultState.reminders, ...state.reminders }
  }
}

class BodyUpDatabase extends Dexie {
  app!: Table<PersistedAppState, string>

  constructor() {
    super('bodyup-local')
    this.version(1).stores({ app: 'id' })
  }
}

const database = new BodyUpDatabase()

export const localRepository = {
  async load(): Promise<PersistedAppState> {
    const saved = await database.app.get('current')
    return normalizeState(saved ?? structuredClone(defaultState))
  },
  async save(state: PersistedAppState): Promise<void> {
    await database.app.put(normalizeState({ ...state, id: 'current' }))
  },
  async clear(): Promise<void> {
    await database.app.clear()
  }
}

/** Contract kept deliberately narrow so a remote/sync adapter can replace it later. */
export type AppRepository = typeof localRepository
export { defaultState, normalizeState }
