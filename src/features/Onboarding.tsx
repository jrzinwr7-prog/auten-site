import { useMemo, useState, type ReactNode } from 'react'
import { ArrowLeft, CalendarDays, Check, House, Info, Landmark, Sparkles } from 'lucide-react'
import type { Experience, Profile, Sex, TrainingLocation } from '../domain/types'
import { calculateForecast, calculateNutritionTarget, formatKg } from '../domain/calculations'
import { Button, Insight, Pill } from '../components/ui'
import { NumericInput } from '../components/NumericInput'
import { foodOptions } from '../data/nutrition'

type Draft = Omit<Profile, 'id' | 'createdAt'>

const initialDraft: Draft = {
  displayName: '', sex: 'prefiro-nao-informar', age: 18, heightCm: 170, weightKg: 60,
  experience: 'iniciante', location: 'casa', daysPerWeek: 3, foodBudget: 250, goalWeightKg: 65, goalDate: '', availableFoodIds: []
}

const steps = ['Boas-vindas', 'Ponto de partida', 'Sua rotina', 'Sua cozinha', 'Sua meta', 'Plano inicial']

function OptionCard({ selected, onClick, icon, title, detail }: { selected: boolean; onClick: () => void; icon?: ReactNode; title: string; detail: string }) {
  return <button type="button" className={`option-card ${selected ? 'is-selected' : ''}`} onClick={onClick}>{icon && <span className="option-icon">{icon}</span>}<span><b>{title}</b><small>{detail}</small></span><i/></button>
}

export function Onboarding({ onComplete, onBack }: { onComplete: (profile: Profile) => void; onBack: () => void }) {
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Draft>(initialDraft)
  const [error, setError] = useState('')
  const patch = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }))
  const previewProfile = useMemo(() => ({ ...draft, id: 'preview', createdAt: new Date().toISOString() }), [draft])
  const target = calculateNutritionTarget(previewProfile)
  const forecast = calculateForecast(previewProfile)
  const toggleFood = (id: string) => patch('availableFoodIds', draft.availableFoodIds?.includes(id) ? draft.availableFoodIds.filter((food) => food !== id) : [...(draft.availableFoodIds ?? []), id])

  const next = () => {
    setError('')
    if (step === 1 && (!Number.isInteger(draft.age) || draft.age < 14 || draft.age > 100)) return setError('Digite uma idade entre 14 e 100 anos.')
    if (step === 3 && (draft.availableFoodIds?.length ?? 0) < 3) return setError('Selecione pelo menos 3 alimentos que você consegue comer ou comprar.')
    if (step < steps.length - 1) setStep(step + 1)
    else onComplete({ ...draft, id: crypto.randomUUID(), createdAt: new Date().toISOString() })
  }
  const back = () => step ? setStep(step - 1) : onBack()

  return <main className="onboarding-page">
    <header className="onboarding-header"><button type="button" onClick={back} aria-label="Voltar"><ArrowLeft size={21}/></button><div className="step-progress" aria-label={`Etapa ${step + 1} de ${steps.length}`}><span style={{ width: `${((step + 1) / steps.length) * 100}%` }}/></div><small>{step + 1}/{steps.length}</small></header>
    <div className="onboarding-body">
      <p className="eyebrow">{steps[step]}</p>
      {step === 0 && <section className="onboarding-section intro-section"><span className="intro-icon"><Sparkles size={27}/></span><h1>Vamos deixar isso com a sua cara.</h1><p>São poucas perguntas para criar um ponto de partida. Você pode editar tudo depois.</p><label className="field"><span>Como quer ser chamado? <small>opcional</small></span><input autoFocus value={draft.displayName} maxLength={24} placeholder="Ex.: Alex" onChange={(event) => patch('displayName', event.target.value)}/></label><Insight>Este app ajuda a organizar hábitos. Não substitui acompanhamento médico, nutricional ou profissional de educação física.</Insight></section>}
      {step === 1 && <section className="onboarding-section"><h1>Onde você está começando?</h1><p className="section-intro">Usamos estas informações apenas para criar estimativas iniciais e acompanhar sua evolução no dispositivo.</p><div className="two-fields"><label className="field"><span>Idade</span><NumericInput integer minimum={14} maximum={100} autoComplete="off" placeholder="Ex.: 18" value={draft.age} onValueChange={(value) => patch('age', value)}/></label><label className="field"><span>Sexo <small>para estimativa</small></span><select value={draft.sex} onChange={(event) => patch('sex', event.target.value as Sex)}><option value="masculino">Masculino</option><option value="feminino">Feminino</option><option value="prefiro-nao-informar">Prefiro não informar</option></select></label></div><div className="two-fields"><label className="field"><span>Altura (cm)</span><NumericInput integer minimum={120} maximum={230} value={draft.heightCm} onValueChange={(value) => patch('heightCm', value)}/></label><label className="field"><span>Peso atual (kg)</span><NumericInput minimum={30} maximum={300} value={draft.weightKg} onValueChange={(value) => patch('weightKg', value)}/></label></div>{draft.age < 18 && <Insight>Como você ainda está em fase de crescimento, trate metas de peso e calorias como ponto de partida e converse com um profissional de saúde se puder.</Insight>}</section>}
      {step === 2 && <section className="onboarding-section"><h1>Como a semana funciona para você?</h1><p className="section-intro">Seu plano é fixo por dia da semana e se adapta à sua resposta, não ao acaso.</p><div className="option-stack"><OptionCard selected={draft.location === 'casa'} onClick={() => patch('location', 'casa')} icon={<House size={20}/>} title="Treino em casa" detail="Sem equipamento obrigatório"/><OptionCard selected={draft.location === 'academia'} onClick={() => patch('location', 'academia')} icon={<Landmark size={20}/>} title="Academia" detail="Base para adaptações futuras"/></div><p className="field-label">Nível atual</p><div className="segmented">{([['sedentario', 'Sedentário'], ['iniciante', 'Iniciante'], ['intermediario', 'Já treino']] as Array<[Experience, string]>).map(([value, label]) => <button type="button" key={value} className={draft.experience === value ? 'is-selected' : ''} onClick={() => patch('experience', value)}>{label}</button>)}</div><label className="range-field"><span>Dias disponíveis <b>{draft.daysPerWeek}x por semana</b></span><input type="range" min="2" max="4" value={draft.daysPerWeek} onChange={(event) => patch('daysPerWeek', Number(event.target.value))}/><div><small>2 dias</small><small>4 dias</small></div></label></section>}
      {step === 3 && <section className="onboarding-section"><h1>O que você realmente consegue comer?</h1><p className="section-intro">Selecione apenas o que costuma ter em casa, comprar ou aceitar comer. Seu plano alimentar usará somente estes itens.</p><div className="food-picker">{foodOptions.map((food) => <button type="button" key={food.id} className={draft.availableFoodIds?.includes(food.id) ? 'is-selected' : ''} onClick={() => toggleFood(food.id)}><span><b>{food.name}</b><small>{food.note}</small></span>{draft.availableFoodIds?.includes(food.id) && <Check size={16}/>}</button>)}</div><p className="selection-count">{draft.availableFoodIds?.length ?? 0} alimentos selecionados</p></section>}
      {step === 4 && <section className="onboarding-section"><h1>Para onde você quer ir?</h1><p className="section-intro">Metas pequenas e ajustáveis são mais fáceis de sustentar.</p><label className="field"><span>Meta de peso</span><div className="suffix-input"><NumericInput minimum={draft.weightKg + 1} maximum={300} value={draft.goalWeightKg} onValueChange={(value) => patch('goalWeightKg', value)}/><b>kg</b></div></label><label className="field"><span>Prazo desejado <small>opcional</small></span><div className="input-with-icon"><CalendarDays size={17}/><input type="date" value={draft.goalDate} onChange={(event) => patch('goalDate', event.target.value)}/></div></label><label className="field"><span>Orçamento mensal de comida</span><div className="suffix-input"><b>R$</b><NumericInput integer minimum={0} value={draft.foodBudget} onValueChange={(value) => patch('foodBudget', value)}/></div></label><Insight>O orçamento orienta sugestões e lista de compras; preços e porções podem ser ajustados depois.</Insight></section>}
      {step === 5 && <section className="onboarding-section plan-summary"><Pill tone="mint">PLANO INICIAL PRONTO</Pill><h1>Um passo de cada vez.</h1><p className="section-intro">Você começa com um plano previsível, que reduz pressão quando necessário e progride quando sua técnica mostra que é hora.</p><div className="summary-grid"><div><span>Treino</span><b>{draft.daysPerWeek} dias/semana</b><small>Dia 1, Dia 2 e evolução por desempenho</small></div><div><span>Comida selecionada</span><b>{draft.availableFoodIds?.length ?? 0} itens disponíveis</b><small>receitas filtradas pela sua seleção</small></div><div><span>Nutrição estimada</span><b>{target.calories.toLocaleString('pt-BR')} kcal · {target.protein}g</b><small>{target.method}</small></div><div><span>Previsão em faixa</span><b>{forecast.minWeeks}–{forecast.maxWeeks} semanas</b><small>ganho de 0,4–0,6 kg/semana</small></div></div><div className="callout"><Info size={18}/><p>Uma previsão é uma faixa, não uma promessa. O plano se adapta à sua execução, recuperação e constância.</p></div></section>}
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
    <footer className="onboarding-footer"><Button onClick={next} className="wide">{step === steps.length - 1 ? 'Ver meu plano' : 'Continuar'}</Button></footer>
  </main>
}
