import { useMemo, useState } from 'react'
import { AlertTriangle, ChevronDown, Clock3, Dumbbell, Info, Play, Sparkles, TimerReset } from 'lucide-react'
import { Modal } from '../components/Modal'
import { Button, Card, Pill, SectionHeading } from '../components/ui'
import { getProgressionSuggestion } from '../domain/progression'
import { generateTrainingPlan } from '../domain/planGenerator'
import type { PlanSession, Profile, WorkoutLog } from '../domain/types'

function SessionLogger({ session, onClose, onComplete }: { session: PlanSession; onClose: () => void; onComplete: (results: WorkoutLog['exerciseResults']) => void }) {
  const [results, setResults] = useState<WorkoutLog['exerciseResults']>(session.exercises.map((exercise) => ({ exerciseId: exercise.id, reps: exercise.repRange[1], form: 'boa' })))
  const patch = (index: number, updates: Partial<WorkoutLog['exerciseResults'][number]>) => setResults((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...updates } : item))
  return <Modal title="Registrar sessão" onClose={onClose}><p className="modal-copy">Registre o melhor resultado de cada exercício. Boa forma é mais importante que repetir rápido.</p><div className="logger-list">{session.exercises.map((exercise, index) => <div className="logger-row" key={exercise.id}><div><b>{exercise.name}</b><small>faixa {exercise.repRange[0]}–{exercise.repRange[1]}</small></div><label><span>reps</span><input aria-label={`Repetições em ${exercise.name}`} type="number" min="0" value={results[index].reps} onChange={(event) => patch(index, { reps: Number(event.target.value) })}/></label><label><span>forma</span><select value={results[index].form} onChange={(event) => patch(index, { form: event.target.value as WorkoutLog['exerciseResults'][number]['form'] })}><option value="boa">Boa</option><option value="ok">Ok</option><option value="ajustar">Ajustar</option></select></label></div>)}</div><Button className="wide" onClick={() => onComplete(results)}>Concluir treino</Button></Modal>
}

export function Training({ profile, workoutLogs, onComplete }: { profile: Profile; workoutLogs: WorkoutLog[]; onComplete: (session: PlanSession, results: WorkoutLog['exerciseResults']) => void }) {
  const plan = generateTrainingPlan(profile)
  const [selected, setSelected] = useState(0)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [logging, setLogging] = useState(false)
  const session = plan[selected]
  const suggestions = useMemo(() => session.exercises.map((exercise) => getProgressionSuggestion(exercise, workoutLogs)).filter(Boolean), [session, workoutLogs])

  return <>
    <section className="page-intro"><p className="eyebrow">SEU PLANO · {profile.daysPerWeek}X/SEMANA</p><h1>Treine com <span>direção.</span></h1><p className="page-lead">Aumente a dificuldade quando dominar o movimento — não só porque chegou uma segunda-feira.</p></section>
    <div className="plan-tabs" role="tablist" aria-label="Sessões do plano">{plan.map((item, index) => <button role="tab" type="button" key={item.id} className={selected === index ? 'is-active' : ''} aria-selected={selected === index} onClick={() => setSelected(index)}><b>{item.code}</b><span>{item.title.replace('Inferiores', 'Inf.').replace('Superiores', 'Sup.')}</span></button>)}</div>
    <Card className="session-hero"><div><Pill tone="blue">{session.code}</Pill><h2>{session.title}</h2><p>{session.focus}</p></div><div className="session-time"><Clock3 size={17}/><b>{session.estimatedMinutes}</b><span>min</span></div></Card>
    {suggestions.length > 0 && <section className="progression-alert"><span><Sparkles size={19}/></span><div><b>Hora de considerar uma evolução</b><p>{suggestions.map((item) => `${item?.current} → ${item?.next}`).join(' · ')}</p></div></section>}
    <section className="section-block training-block"><SectionHeading eyebrow={`${session.exercises.length} EXERCÍCIOS`} title="Seu treino de hoje"/><div className="exercise-list">{session.exercises.map((exercise, index) => <Card className={`exercise-card ${expanded === exercise.id ? 'is-open' : ''}`} key={exercise.id}><button className="exercise-summary" type="button" onClick={() => setExpanded(expanded === exercise.id ? null : exercise.id)}><span className="exercise-index">{String(index + 1).padStart(2, '0')}</span><span className="exercise-copy"><b>{exercise.name}</b><small>{exercise.sets} séries · {exercise.repRange[0]}–{exercise.repRange[1]} reps</small></span><ChevronDown size={19}/></button>{expanded === exercise.id && <div className="exercise-detail"><div><span><TimerReset size={15}/> descanso</span><b>{exercise.restSeconds}s</b></div><p>{exercise.cue}</p>{exercise.caution && <p className="caution"><AlertTriangle size={14}/>{exercise.caution}</p>}<span className="progression-line">Progressão: {exercise.progression.join(' → ')}</span></div>}</Card>)}</div></section>
    <Card className="training-tip"><Info size={19}/><p>Se houver dor aguda, tontura ou insegurança no apoio, interrompa o exercício e procure orientação profissional.</p></Card>
    <div className="sticky-cta"><Button className="wide" onClick={() => setLogging(true)}><Play size={17} fill="currentColor"/>Registrar treino</Button></div>
    {logging && <SessionLogger session={session} onClose={() => setLogging(false)} onComplete={(results) => { onComplete(session, results); setLogging(false) }}/>}
  </>
}
