import { useEffect, useState } from 'react'
import { AppShell } from './components/AppShell'
import { Toast } from './components/Toast'
import { Dashboard } from './features/Dashboard'
import { Nutrition } from './features/Nutrition'
import { Onboarding } from './features/Onboarding'
import { downloadState, parseBackup, ProfileView } from './features/Profile'
import { Progress } from './features/Progress'
import { Training } from './features/Training'
import { Welcome } from './features/Welcome'
import { demoState } from './fixtures/demoState'
import type { AppTab, Measurements, PersistedAppState, PlanSession, Profile, ProgressPhoto, WorkoutLog } from './domain/types'
import type { Recipe } from './data/nutrition'
import { defaultState, localRepository } from './storage/repository'

function useMealReminders(enabled: boolean, times: string[]) {
  useEffect(() => {
    if (!enabled || !('Notification' in window) || Notification.permission !== 'granted') return
    const announce = () => {
      const now = new Date()
      const time = now.toTimeString().slice(0, 5)
      if (!times.includes(time)) return
      const key = `bodyup-reminded-${now.toISOString().slice(0, 10)}-${time}`
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
      new Notification('BodyUp', { body: 'Pausa rápida: que tal cuidar da sua próxima refeição?' })
    }
    announce()
    const interval = window.setInterval(announce, 30000)
    return () => window.clearInterval(interval)
  }, [enabled, times])
}

export default function App() {
  const [state, setState] = useState<PersistedAppState | null>(null)
  const [screen, setScreen] = useState<'welcome' | 'onboarding' | 'app'>('welcome')
  const [activeTab, setActiveTab] = useState<AppTab>('hoje')
  const [toast, setToast] = useState<string | null>(null)
  const [openWeightKey, setOpenWeightKey] = useState(0)

  useEffect(() => {
    localRepository.load().then((loaded) => {
      setState(loaded)
      if (loaded.profile) setScreen('app')
    }).catch(() => setState(structuredClone(defaultState)))
  }, [])

  useEffect(() => {
    if (state) void localRepository.save(state)
  }, [state])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 3600)
    return () => window.clearTimeout(timeout)
  }, [toast])

  useMealReminders(Boolean(state?.reminders.enabled), state ? [state.reminders.breakfast, state.reminders.lunch, state.reminders.dinner] : [])

  const updateState = (updater: (current: PersistedAppState) => PersistedAppState) => setState((current) => current ? updater(current) : current)
  const startApp = (nextState: PersistedAppState) => { setState(nextState); setScreen('app'); setActiveTab('hoje') }
  const profile = state?.profile

  const completeProfile = (nextProfile: Profile) => startApp({ ...structuredClone(defaultState), profile: nextProfile, weightEntries: [{ id: crypto.randomUUID(), date: new Date().toISOString(), weightKg: nextProfile.weightKg }] })
  const openWeight = () => { setActiveTab('evolucao'); setOpenWeightKey((current) => current + 1) }

  if (!state) return <div className="loading-screen"><div className="loading-mark"/><p>Preparando seu espaço...</p></div>
  if (screen === 'welcome' && !profile) return <Welcome onStart={() => setScreen('onboarding')} onDemo={() => startApp(structuredClone(demoState))}/>
  if (screen === 'onboarding' && !profile) return <Onboarding onBack={() => setScreen('welcome')} onComplete={completeProfile}/>
  if (!profile) return <Welcome onStart={() => setScreen('onboarding')} onDemo={() => startApp(structuredClone(demoState))}/>

  const logMeal = (recipe: Recipe) => {
    updateState((current) => ({ ...current, mealLogs: [...current.mealLogs, { id: crypto.randomUUID(), date: new Date().toISOString(), mealId: recipe.id, calories: recipe.calories, protein: recipe.protein }] }))
    setToast(`${recipe.name} registrada. Boa!`)
  }
  const logWorkout = (session: PlanSession, results: WorkoutLog['exerciseResults']) => {
    updateState((current) => ({ ...current, workoutLogs: [...current.workoutLogs, { id: crypto.randomUUID(), sessionId: session.id, completedAt: new Date().toISOString(), exerciseResults: results }] }))
    setToast('Treino registrado. Recupere-se e volte no próximo passo.')
  }
  const logWeight = (weight: number) => {
    updateState((current) => ({ ...current, weightEntries: [...current.weightEntries, { id: crypto.randomUUID(), date: new Date().toISOString(), weightKg: weight }] }))
    setToast('Peso salvo. Olhe a tendência com calma.')
  }
  const logMeasurements = (values: Omit<Measurements, 'id' | 'date'>) => {
    updateState((current) => ({ ...current, measurements: [...current.measurements, { id: crypto.randomUUID(), date: new Date().toISOString(), ...values }] }))
    setToast('Medidas atualizadas.')
  }
  const addPhoto = (photo: Omit<ProgressPhoto, 'id' | 'date'>) => {
    updateState((current) => ({ ...current, progressPhotos: [...current.progressPhotos, { id: crypto.randomUUID(), date: new Date().toISOString(), ...photo }] }))
    setToast('Foto guardada somente neste dispositivo.')
  }
  const importBackup = async (file: File) => {
    const backup = await parseBackup(file)
    if (!backup) { setToast('Não reconhecemos este arquivo de backup.'); return false }
    setState(backup)
    setToast('Backup restaurado neste dispositivo.')
    return true
  }
  const reset = async () => {
    await localRepository.clear()
    setState(structuredClone(defaultState))
    setScreen('welcome')
    setToast(null)
  }

  return <AppShell activeTab={activeTab} onTabChange={setActiveTab} profile={profile}>
    {activeTab === 'hoje' && <Dashboard profile={profile} weightEntries={state.weightEntries} workoutLogs={state.workoutLogs} mealLogs={state.mealLogs} onTabChange={setActiveTab} onLogMeal={() => setActiveTab('alimentacao')} onOpenWeight={openWeight}/>}
    {activeTab === 'treino' && <Training profile={profile} workoutLogs={state.workoutLogs} onComplete={logWorkout}/>}
    {activeTab === 'alimentacao' && <Nutrition profile={profile} mealLogs={state.mealLogs} reminders={state.reminders} onLogMeal={logMeal} onUpdateReminders={(reminders) => updateState((current) => ({ ...current, reminders }))}/>}
    {activeTab === 'evolucao' && <Progress profile={profile} weightEntries={state.weightEntries} measurements={state.measurements} photos={state.progressPhotos} openWeightModal={openWeightKey} onLogWeight={logWeight} onLogMeasurements={logMeasurements} onAddPhoto={addPhoto}/>}
    {activeTab === 'perfil' && <ProfileView profile={profile} onUpdate={(nextProfile) => updateState((current) => ({ ...current, profile: nextProfile }))} onExport={() => downloadState(state)} onImport={importBackup} onReset={reset}/>}
    {toast && <Toast message={toast} onClose={() => setToast(null)}/>}
  </AppShell>
}
