import { ArrowUpRight, CalendarCheck2, ChevronRight, CircleCheck, Dumbbell, Flame, Plus, Scale, Trophy, Utensils } from 'lucide-react'
import { DisciplineCalendar } from '../components/DisciplineCalendar'
import { Card, Metric, Pill, SectionHeading } from '../components/ui'
import { calculateForecast, calculateNutritionTarget, calculateStreak, currentWeight, formatKg, formatShortDate } from '../domain/calculations'
import { getAchievement } from '../domain/achievements'
import { generateTrainingPlan, getTodaySession, isSessionDone, sessionDate, weekCompletion } from '../domain/planGenerator'
import type { Achievement, AppTab, MealLog, Profile, WeightEntry, WorkoutDraft, WorkoutLog } from '../domain/types'

function WeightSparkline({ entries, startingWeight }: { entries: WeightEntry[]; startingWeight: number }) {
  const points = entries.length ? entries : [{ id: 'initial', date: new Date().toISOString(), weightKg: startingWeight }]
  const values = points.map((entry) => entry.weightKg)
  const min = Math.min(...values) - .2
  const max = Math.max(...values) + .2
  const width = 300
  const height = 76
  const coordinates = values.map((value, index) => `${values.length === 1 ? width / 2 : (index / (values.length - 1)) * width},${height - ((value - min) / Math.max(max - min, .1)) * (height - 12) - 6}`).join(' ')
  return <div className="sparkline"><svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-label="Evolução recente do peso"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#79E7FF" stopOpacity=".35"/><stop offset="1" stopColor="#79E7FF" stopOpacity="0"/></linearGradient></defs><path d={`M0,${height} L${coordinates.replaceAll(' ', ' L')} L${width},${height} Z`} fill="url(#chartFill)"/><polyline points={coordinates} fill="none" stroke="#79E7FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg><div className="sparkline-labels"><span>{formatShortDate(points[0].date)}</span><span>{formatShortDate(points[points.length - 1].date)}</span></div></div>
}

export function Dashboard({ profile, weightEntries, workoutLogs, workoutDrafts = [], mealLogs, achievements = [], onTabChange, onLogMeal, onOpenWeight }: { profile: Profile; weightEntries: WeightEntry[]; workoutLogs: WorkoutLog[]; workoutDrafts?: WorkoutDraft[]; mealLogs: MealLog[]; achievements?: Achievement[]; onTabChange: (tab: AppTab) => void; onLogMeal: () => void; onOpenWeight: () => void }) {
  const target = calculateNutritionTarget(profile)
  const forecast = calculateForecast(profile)
  const plan = generateTrainingPlan(profile, workoutLogs)
  const todaySession = getTodaySession(plan)
  const activeWeight = currentWeight(profile, weightEntries)
  const todayKey = new Date().toISOString().slice(0, 10)
  const todayMeals = mealLogs.filter((log) => log.date.slice(0, 10) === todayKey)
  const calories = todayMeals.reduce((sum, log) => sum + log.calories, 0)
  const protein = todayMeals.reduce((sum, log) => sum + log.protein, 0)
  const streak = calculateStreak(workoutLogs)
  const progress = weekCompletion(plan, workoutLogs)
  const completedToday = todaySession ? isSessionDone(todaySession, workoutLogs) : false
  const todayDraft = todaySession ? workoutDrafts.find((draft) => draft.sessionId === todaySession.id && draft.plannedDate === sessionDate(todaySession)) : undefined
  const dayProgress = todaySession ? completedToday ? 100 : Math.round((todayDraft?.exerciseResults.length ?? 0) / todaySession.exercises.length * 100) : 0
  const completion = Math.min(100, Math.round(calories / target.calories * 100))
  const greeting = profile.displayName?.trim() ? `Oi, ${profile.displayName.trim()}` : 'Seu plano está pronto'
  const latestAchievements = achievements.slice(-2).map((item) => getAchievement(item.id)).filter(Boolean)

  return <>
    <section className="page-intro dashboard-intro"><div><p className="eyebrow">{new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</p><h1>{greeting}<span>.</span></h1></div><Pill tone={streak ? 'mint' : 'neutral'}>{streak ? `${streak} dias ativo` : 'sem pressão'}</Pill></section>
    {todaySession ? <Card className={`today-card ${completedToday ? 'is-complete' : ''}`}><div className="today-glow"/><div className="today-top"><span className="icon-badge">{completedToday ? <CircleCheck size={19}/> : <Dumbbell size={19}/>}</span><Pill tone={completedToday ? 'mint' : 'blue'}>{completedToday ? 'DIA CONCLUÍDO' : `DIA ${todaySession.dayNumber}`}</Pill></div><div className="today-content"><p>{completedToday ? 'Você cumpriu o plano de hoje' : `Semana ${todaySession.programWeek} · ${todaySession.weekdayLabel}`}</p><h2>{todaySession.title}</h2><span>{todaySession.focus} · {todaySession.estimatedMinutes} min · semana {progress}%</span></div><button type="button" className="card-cta" onClick={() => onTabChange('treino')}>{completedToday ? 'Rever sessão' : dayProgress ? 'Continuar Dia ' + todaySession.dayNumber : 'Começar Dia ' + todaySession.dayNumber} <ArrowUpRight size={18}/></button><div className="today-rule"><span>{dayProgress}%</span> do Dia</div></Card> : <Card className="today-card rest-card"><div className="today-top"><span className="icon-badge"><CalendarCheck2 size={19}/></span><Pill tone="mint">DESCANSO PLANEJADO</Pill></div><div className="today-content"><p>Hoje não existe treino marcado</p><h2>Recuperar também é treinar.</h2><span>Coma, durma e volte no próximo Dia do seu plano.</span></div><button type="button" className="card-cta" onClick={() => onTabChange('treino')}>Ver cronograma <ArrowUpRight size={18}/></button><div className="today-rule"><span>{progress}%</span> do plano semanal</div></Card>}
    <section className="metrics-grid"><Metric label="Peso atual" value={formatKg(activeWeight)} detail={`${formatKg(profile.goalWeightKg)} é sua meta`} accent/><Metric label="Alimentação" value={`${completion}%`} detail={`${Math.max(0, target.calories - calories).toLocaleString('pt-BR')} kcal para a meta`}/></section>
    <section className="quick-actions"><button type="button" onClick={onLogMeal}><span><Utensils size={19}/></span>Registrar refeição<Plus size={17}/></button><button type="button" onClick={onOpenWeight}><span><Scale size={19}/></span>Pesar hoje<Plus size={17}/></button></section>
    <section className="section-block"><SectionHeading eyebrow="RITMO REAL" title="Disciplina nos últimos 28 dias"/><DisciplineCalendar profile={profile} logs={workoutLogs}/></section>
    {latestAchievements.length > 0 && <section className="section-block"><SectionHeading eyebrow="CONQUISTAS" title="Você já construiu"/><div className="achievement-row">{latestAchievements.map((achievement) => achievement && <Card className="achievement-card" key={achievement.id}><span>{achievement.icon}</span><div><b>{achievement.title}</b><small>{achievement.description}</small></div><Trophy size={17}/></Card>)}</div></section>}
    <section className="section-block"><SectionHeading eyebrow="SEU DIA" title="O básico que move você" action={<button type="button" className="text-action" onClick={() => onTabChange('alimentacao')}>Detalhes <ChevronRight size={15}/></button>}/><Card className="nutrition-glance"><div className="glance-progress"><svg viewBox="0 0 42 42"><circle cx="21" cy="21" r="17"/><circle cx="21" cy="21" r="17" style={{ strokeDasharray: '107', strokeDashoffset: `${107 - 107 * completion / 100}` }}/></svg><b>{completion}%</b></div><div><span>Energia de hoje</span><strong>{calories.toLocaleString('pt-BR')} <small>/ {target.calories.toLocaleString('pt-BR')} kcal</small></strong></div><div className="protein-chip"><b>{protein}g</b><span>proteína</span></div></Card></section>
    <section className="section-block"><SectionHeading eyebrow="EVOLUÇÃO" title="Sua tendência" action={<button type="button" className="text-action" onClick={() => onTabChange('evolucao')}>Abrir <ChevronRight size={15}/></button>}/><Card className="trend-card"><div className="trend-head"><div><span>Últimos registros</span><strong>{formatKg(activeWeight)}</strong></div><div className="trend-up"><Flame size={15}/> +{Math.max(0, activeWeight - profile.weightKg).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg</div></div><WeightSparkline entries={weightEntries.slice(-6)} startingWeight={profile.weightKg}/><div className="trend-foot"><span>Previsão inicial: {forecast.minWeeks}–{forecast.maxWeeks} semanas</span><button type="button" onClick={onOpenWeight}><CircleCheck size={15}/> registrar peso</button></div></Card></section>
  </>
}
