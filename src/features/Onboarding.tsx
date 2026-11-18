import { useMemo, useState } from 'react'
import { ArrowLeft, CalendarDays, House, Info, Landmark, Sparkles } from 'lucide-react'
import type { Experience, Profile, Sex, TrainingLocation } from '../domain/types'
import { calculateForecast, calculateNutritionTarget, formatKg } from '../domain/calculations'
import { Button, Insight, Pill } from '../components/ui'

type Draft = Omit<Profile, 'id' | 'createdAt'>

const initialDraft: Draft = {
  displayName: '', sex: 'prefiro-nao-informar', age: 18, heightCm: 170, weightKg: 60,
  experience: 'iniciante', location: 'casa', daysPerWeek: 3, foodBudget: 250, goalWeightKg: 65, goalDate: ''
}

const steps = ['Boas-vindas', 'Seu ponto de partida', 'Sua rotina', 'Sua meta', 'Plano inicial']

function OptionCard({ selected, onClick, icon, title, detail }: { selected: boolean; onClick: () => void; icon?: React.ReactNode; title: string; detail: string }) {
  return <button type="button" className={`option-card ${selected ? 'is-selected' : ''}`} onClick={onClick}>{icon && <span className="option-icon">{icon}</span>}<span><b>{title}</b><small>{detail}</small></span><i/></button>
}

export function Onboarding({ onComplete, onBack }: { onComplete: (profile: Profile) => void; onBack: () => void }) {
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Draft>(initialDraft)
  const patch = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }))
  const previewProfile = useMemo(() => ({ ...draft, id: 'preview', createdAt: new Date().toISOString() }), [draft])
  const target = calculateNutritionTarget(previewProfile)
  const forecast = calculateForecast(previewProfile)
  const next = () => step < steps.length - 1 ? setStep(step + 1) : onComplete({ ...draft, id: crypto.randomUUID(), createdAt: new Date().toISOString() })
  const back = () => step ? setStep(step - 1) : onBack()

  return <main className="onboarding-page">
    <header className="onboarding-header"><button type="button" onClick={back} aria-label="Voltar"><ArrowLeft size={21}/></button><div className="step-progress" aria-label={`Etapa ${step + 1} de ${steps.length}`}><span style={{ width: `${((step + 1) / steps.length) * 100}%` }}/></div><small>{step + 1}/{steps.length}</small></header>
    <div className="onboarding-body">
      <p className="eyebrow">{steps[step]}</p>
      {step === 0 && <section className="onboarding-section intro-section"><span className="intro-icon"><Sparkles size={27}/></span><h1>Vamos deixar isso com a sua cara.</h1><p>São poucas perguntas para criar um ponto de partida. Você pode editar tudo depois.</p><label className="field"><span>Como quer ser chamado? <small>opcional</small></span><input autoFocus value={draft.displayName} maxLength={24} placeholder="Ex.: Alex" onChange={(event) => patch('displayName', event.target.value)}/></label><Insight>Este app ajuda a organizar hábitos. Não substitui acompanhamento médico, nutricional ou profissional de educação física.</Insight></section>}
      {step === 1 && <section className="onboarding-section"><h1>Onde você está começando?</h1><p className="section-intro">Usamos estas informações apenas para criar estimativas iniciais e acompanhar sua evolução no dispositivo.</p><div className="two-fields"><label className="field"><span>Idade</span><input type="number" min="14" max="100" value={draft.age} onChange={(event) => patch('age', Number(event.target.value))}/></label><label className="field"><span>Sexo <small>para estimativa</small></span><select value={draft.sex} onChange={(event) => patch('sex', event.target.value as Sex)}><option value="masculino">Masculino</option><option value="feminino">Feminino</option><option value="prefiro-nao-informar">Prefiro não informar</option></select></label></div><div className="two-fields"><label className="field"><span>Altura (cm)</span><input type="number" min="120" max="230" value={draft.heightCm} onChange={(event) => patch('heightCm', Number(event.target.value))}/></label><label className="field"><span>Peso atual (kg)</span><input type="number" min="30" max="300" step="0.1" value={draft.weightKg} onChange={(event) => patch('weightKg', Number(event.target.value))}/></label></div>{draft.age < 18 && <Insight>Como você ainda está em fase de crescimento, trate metas de peso e calorias como ponto de partida e converse com um profissional de saúde se puder.</Insight>}</section>}
      {step === 2 && <section className="onboarding-section"><h1>Como a semana funciona para você?</h1><p className="section-intro">Seu plano começa simples e se adapta quando sua rotina mudar.</p><div className="option-stack"><OptionCard selected={draft.location === 'casa'} onClick={() => patch('location', 'casa')} icon={<House size={20}/>} title="Treino em casa" detail="Sem equipamento obrigatório"/><OptionCard selected={draft.location === 'academia'} onClick={() => patch('location', 'academia')} icon={<Landmark size={20}/>} title="Academia" detail="Vamos liberar opções com aparelhos depois"/></div><p className="field-label">Nível atual</p><div className="segmented">{([['sedentario', 'Sedentário'], ['iniciante', 'Iniciante'], ['intermediario', 'Já treino']] as Array<[Experience, string]>).map(([value, label]) => <button type="button" key={value} className={draft.experience === value ? 'is-selected' : ''} onClick={() => patch('experience', value)}>{label}</button>)}</div><label className="range-field"><span>Dias disponíveis <b>{draft.daysPerWeek}x por semana</b></span><input type="range" min="2" max="4" value={draft.daysPerWeek} onChange={(event) => patch('daysPerWeek', Number(event.target.value))}/><div><small>2 dias</small><small>4 dias</small></div></label></section>}
      {step === 3 && <section className="onboarding-section"><h1>Para onde você quer ir?</h1><p className="section-intro">Metas pequenas e ajustáveis são mais fáceis de sustentar.</p><label className="field"><span>Meta de peso</span><div className="suffix-input"><input type="number" min={draft.weightKg + 1} max="300" step="0.1" value={draft.goalWeightKg} onChange={(event) => patch('goalWeightKg', Number(event.target.value))}/><b>kg</b></div></label><label className="field"><span>Prazo desejado <small>opcional</small></span><div className="input-with-icon"><CalendarDays size={17}/><input type="date" value={draft.goalDate} onChange={(event) => patch('goalDate', event.target.value)}/></div></label><label className="field"><span>Orçamento mensal de comida</span><div className="suffix-input"><b>R$</b><input type="number" min="0" step="10" value={draft.foodBudget} onChange={(event) => patch('foodBudget', Number(event.target.value))}/></div></label><Insight>O orçamento orienta sugestões e lista de compras; os preços podem ser ajustados à sua região.</Insight></section>}
      {step === 4 && <section className="onboarding-section plan-summary"><Pill tone="mint">PLANO INICIAL PRONTO</Pill><h1>Um passo de cada vez.</h1><p className="section-intro">Você começa com uma base que pode ser ajustada conforme aprende o que funciona para você.</p><div className="summary-grid"><div><span>Treino</span><b>{draft.daysPerWeek} dias/semana</b><small>{draft.location === 'casa' ? 'Casa, sem equipamento obrigatório' : 'Academia'}</small></div><div><span>Meta inicial</span><b>{formatKg(draft.weightKg)} → {formatKg(draft.goalWeightKg)}</b><small>+{(draft.goalWeightKg - draft.weightKg).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg no total</small></div><div><span>Nutrição estimada</span><b>{target.calories.toLocaleString('pt-BR')} kcal · {target.protein}g</b><small>{target.method}</small></div><div><span>Previsão em faixa</span><b>{forecast.minWeeks}–{forecast.maxWeeks} semanas</b><small>ganho de 0,4–0,6 kg/semana</small></div></div><div className="callout"><Info size={18}/><p>Uma previsão é uma faixa, não uma promessa. Pesagens, sono, treino e apetite ajudam você a ajustar a rota.</p></div></section>}
    </div>
    <footer className="onboarding-footer"><Button onClick={next} className="wide">{step === steps.length - 1 ? 'Ver meu plano' : 'Continuar'}</Button></footer>
  </main>
}
