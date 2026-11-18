import { useState } from 'react'
import { BellRing, Check, ChevronDown, CircleDollarSign, CookingPot, ShoppingBasket, Sparkles } from 'lucide-react'
import { Card, Pill, SectionHeading, Toggle } from '../components/ui'
import { calculateNutritionTarget } from '../domain/calculations'
import { recipes, starterShoppingList, type Recipe } from '../data/nutrition'
import type { MealLog, Profile, ReminderSettings } from '../domain/types'

export function Nutrition({ profile, mealLogs, reminders, onLogMeal, onUpdateReminders }: { profile: Profile; mealLogs: MealLog[]; reminders: ReminderSettings; onLogMeal: (recipe: Recipe) => void; onUpdateReminders: (settings: ReminderSettings) => void }) {
  const [showList, setShowList] = useState(false)
  const target = calculateNutritionTarget(profile)
  const day = new Date().toISOString().slice(0, 10)
  const today = mealLogs.filter((log) => log.date.slice(0, 10) === day)
  const eatenCalories = today.reduce((total, item) => total + item.calories, 0)
  const eatenProtein = today.reduce((total, item) => total + item.protein, 0)
  const usedRecipeIds = new Set(today.map((item) => item.mealId))
  const percentage = Math.min(100, Math.round(eatenCalories / target.calories * 100))
  const updateReminder = <K extends keyof ReminderSettings>(key: K, value: ReminderSettings[K]) => onUpdateReminders({ ...reminders, [key]: value })
  const requestNotifications = async (enabled: boolean) => {
    if (!enabled) return updateReminder('enabled', false)
    if (!('Notification' in window)) return onUpdateReminders({ ...reminders, enabled: false, notificationPermission: 'unsupported' })
    const permission = await Notification.requestPermission()
    onUpdateReminders({ ...reminders, enabled: permission === 'granted', notificationPermission: permission })
  }

  return <>
    <section className="page-intro"><p className="eyebrow">ALIMENTAÇÃO SEM COMPLICAÇÃO</p><h1>Coma para <span>sustentar</span> o plano.</h1><p className="page-lead">Sugestões práticas para completar energia e proteína. Ajuste tudo ao que existe na sua casa e na sua região.</p></section>
    <Card className="food-target"><div className="food-target-head"><span>Hoje</span><Pill tone="mint">{target.method}</Pill></div><div className="macro-grid"><div><span>Energia</span><b>{eatenCalories.toLocaleString('pt-BR')}<small> / {target.calories.toLocaleString('pt-BR')} kcal</small></b><i><i style={{ width: `${percentage}%` }}/></i></div><div><span>Proteína</span><b>{eatenProtein}g<small> / {target.protein}g</small></b><i><i style={{ width: `${Math.min(100, eatenProtein / target.protein * 100)}%` }}/></i></div></div><p><Sparkles size={15}/> Faltam cerca de <b>{Math.max(0, target.calories - eatenCalories).toLocaleString('pt-BR')} kcal</b>. Uma refeição simples já movimenta essa meta.</p></Card>
    <section className="section-block"><SectionHeading eyebrow="IDEIAS PARA HOJE" title="Refeições possíveis"/><div className="recipe-list">{recipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} completed={usedRecipeIds.has(recipe.id)} onLog={() => onLogMeal(recipe)}/>)}</div></section>
    <section className="section-block"><SectionHeading eyebrow="ORÇAMENTO" title="Compras com intenção"/><Card className="budget-card"><div className="budget-top"><span className="budget-icon"><CircleDollarSign size={20}/></span><div><span>Seu teto mensal</span><strong>R$ {profile.foodBudget.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</strong></div><button type="button" onClick={() => setShowList(!showList)} aria-expanded={showList}>{showList ? 'Fechar' : 'Ver lista'}<ChevronDown size={16}/></button></div><p>Preços variam por região. Use a lista como ordem de prioridade e ajuste quantidades no mercado.</p>{showList && <ul className="shopping-list">{starterShoppingList.map((item, index) => <li key={item.name}><span>{String(index + 1).padStart(2, '0')}</span><div><b>{item.name}</b><small>{item.note}</small></div><Check size={17}/></li>)}</ul>}</Card></section>
    <section className="section-block"><SectionHeading eyebrow="LEMBRETES" title="Não deixe a refeição sumir"/><Card className="reminder-card"><Toggle checked={reminders.enabled} onChange={requestNotifications} label="Lembretes de refeições" detail={reminders.notificationPermission === 'denied' ? 'Permissão bloqueada pelo navegador' : 'Você escolhe os horários'}/>{reminders.enabled && <div className="reminder-times"><label><span>Café</span><input type="time" value={reminders.breakfast} onChange={(event) => updateReminder('breakfast', event.target.value)}/></label><label><span>Almoço</span><input type="time" value={reminders.lunch} onChange={(event) => updateReminder('lunch', event.target.value)}/></label><label><span>Jantar</span><input type="time" value={reminders.dinner} onChange={(event) => updateReminder('dinner', event.target.value)}/></label></div>}<p className="reminder-note"><BellRing size={14}/> Nesta versão, os avisos são verificados enquanto o app está aberto e dependem da permissão do navegador.</p></Card></section>
  </>
}

function RecipeCard({ recipe, completed, onLog }: { recipe: Recipe; completed: boolean; onLog: () => void }) {
  const [open, setOpen] = useState(false)
  return <Card className={`recipe-card ${completed ? 'is-completed' : ''}`}><button type="button" className="recipe-main" onClick={() => setOpen(!open)}><span className="recipe-icon"><CookingPot size={19}/></span><div><Pill tone="neutral">{recipe.meal}</Pill><b>{recipe.name}</b><small>{recipe.calories} kcal · {recipe.protein}g proteína · ≈ R$ {recipe.estimatedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</small></div><ChevronDown size={18}/></button>{open && <div className="recipe-expanded"><p>{recipe.prep}</p><span>{recipe.ingredients.join(' · ')}</span></div>}<button type="button" className="recipe-log" disabled={completed} onClick={onLog}>{completed ? <><Check size={16}/> Registrado</> : <>Registrar <span>+</span></>}</button></Card>
}
