import { useState } from 'react'
import { BellRing, Check, ChevronDown, CircleDollarSign, CookingPot, Pencil, Settings2, Sparkles } from 'lucide-react'
import { Modal } from '../components/Modal'
import { Button, Card, Pill, SectionHeading, Toggle } from '../components/ui'
import { calculateNutritionTarget } from '../domain/calculations'
import { foodOptions, getRecipeIngredients, recipesForAvailableFoods, type Recipe } from '../data/nutrition'
import type { MealLog, Profile, ReminderSettings } from '../domain/types'

export function Nutrition({ profile, mealLogs, reminders, onLogMeal, onUpdateProfile, onUpdateReminders }: { profile: Profile; mealLogs: MealLog[]; reminders: ReminderSettings; onLogMeal: (recipe: Recipe) => void; onUpdateProfile: (profile: Profile) => void; onUpdateReminders: (settings: ReminderSettings) => void }) {
  const [showList, setShowList] = useState(false)
  const [editingFoods, setEditingFoods] = useState(false)
  const target = calculateNutritionTarget(profile)
  const day = new Date().toISOString().slice(0, 10)
  const today = mealLogs.filter((log) => log.date.slice(0, 10) === day)
  const eatenCalories = today.reduce((total, item) => total + item.calories, 0)
  const eatenProtein = today.reduce((total, item) => total + item.protein, 0)
  const usedRecipeIds = new Set(today.map((item) => item.mealId))
  const percentage = Math.min(100, Math.round(eatenCalories / target.calories * 100))
  const selectedFoodIds = profile.availableFoodIds ?? []
  const availableRecipes = recipesForAvailableFoods(selectedFoodIds)
  const updateReminder = <K extends keyof ReminderSettings>(key: K, value: ReminderSettings[K]) => onUpdateReminders({ ...reminders, [key]: value })
  const requestNotifications = async (enabled: boolean) => {
    if (!enabled) return updateReminder('enabled', false)
    if (!('Notification' in window)) return onUpdateReminders({ ...reminders, enabled: false, notificationPermission: 'unsupported' })
    const permission = await Notification.requestPermission()
    onUpdateReminders({ ...reminders, enabled: permission === 'granted', notificationPermission: permission })
  }

  return <>
    <section className="page-intro"><p className="eyebrow">ALIMENTAÇÃO DO SEU JEITO</p><h1>Coma o que <span>cabe na sua vida.</span></h1><p className="page-lead">O BodyUp só sugere refeições montadas com os alimentos que você disse ter acesso ou conseguir comer.</p></section>
    <Card className="food-target"><div className="food-target-head"><span>Hoje</span><Pill tone="mint">{target.method}</Pill></div><div className="macro-grid"><div><span>Energia</span><b>{eatenCalories.toLocaleString('pt-BR')}<small> / {target.calories.toLocaleString('pt-BR')} kcal</small></b><i><i style={{ width: `${percentage}%` }}/></i></div><div><span>Proteína</span><b>{eatenProtein}g<small> / {target.protein}g</small></b><i><i style={{ width: `${Math.min(100, eatenProtein / target.protein * 100)}%` }}/></i></div></div><p><Sparkles size={15}/> Faltam cerca de <b>{Math.max(0, target.calories - eatenCalories).toLocaleString('pt-BR')} kcal</b>. Ajuste as porções conforme apetite e orientação profissional.</p></Card>
    <section className="section-block"><SectionHeading eyebrow="SUA DISPONIBILIDADE" title={`${selectedFoodIds.length} alimentos liberados`} action={<button type="button" className="text-action" onClick={() => setEditingFoods(true)}>Editar <Pencil size={14}/></button>}/><Card className="available-foods-card"><div className="food-tags">{selectedFoodIds.length ? selectedFoodIds.map((id) => <span key={id}>{foodOptions.find((food) => food.id === id)?.name}</span>) : <span className="empty-tag">Nenhum alimento selecionado</span>}</div><button type="button" onClick={() => setEditingFoods(true)}><Settings2 size={15}/>Alterar o que tenho para comer</button></Card></section>
    <section className="section-block"><SectionHeading eyebrow="IDEIAS POSSÍVEIS" title="Refeições liberadas"/>{availableRecipes.length ? <div className="recipe-list">{availableRecipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} completed={usedRecipeIds.has(recipe.id)} onLog={() => onLogMeal(recipe)}/>)}</div> : <Card className="no-recipes"><CookingPot size={22}/><div><b>Sem receita compatível por enquanto</b><p>Edite os alimentos disponíveis para liberar sugestões que realmente cabem na sua rotina.</p></div><button type="button" onClick={() => setEditingFoods(true)}>Escolher alimentos</button></Card>}</section>
    <section className="section-block"><SectionHeading eyebrow="ORÇAMENTO" title="Compras com intenção"/><Card className="budget-card"><div className="budget-top"><span className="budget-icon"><CircleDollarSign size={20}/></span><div><span>Seu teto mensal</span><strong>R$ {profile.foodBudget.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</strong></div><button type="button" onClick={() => setShowList(!showList)} aria-expanded={showList}>{showList ? 'Fechar' : 'Ver lista'}<ChevronDown size={16}/></button></div><p>A lista abaixo vem apenas do que você liberou. Preços continuam editáveis conforme sua região.</p>{showList && <ul className="shopping-list">{selectedFoodIds.map((id, index) => { const food = foodOptions.find((item) => item.id === id); return food ? <li key={id}><span>{String(index + 1).padStart(2, '0')}</span><div><b>{food.name}</b><small>{food.note}</small></div><Check size={17}/></li> : null })}</ul>}</Card></section>
    <section className="section-block"><SectionHeading eyebrow="LEMBRETES" title="Não deixe a refeição sumir"/><Card className="reminder-card"><Toggle checked={reminders.enabled} onChange={requestNotifications} label="Lembretes de refeições" detail={reminders.notificationPermission === 'denied' ? 'Permissão bloqueada pelo navegador' : 'Você escolhe os horários'}/>{reminders.enabled && <div className="reminder-times"><label><span>Café</span><input type="time" value={reminders.breakfast} onChange={(event) => updateReminder('breakfast', event.target.value)}/></label><label><span>Almoço</span><input type="time" value={reminders.lunch} onChange={(event) => updateReminder('lunch', event.target.value)}/></label><label><span>Jantar</span><input type="time" value={reminders.dinner} onChange={(event) => updateReminder('dinner', event.target.value)}/></label></div>}<p className="reminder-note"><BellRing size={14}/> Nesta versão, os avisos são verificados enquanto o app está aberto e dependem da permissão do navegador.</p></Card></section>
    {editingFoods && <FoodEditor profile={profile} onClose={() => setEditingFoods(false)} onSave={(ids) => { onUpdateProfile({ ...profile, availableFoodIds: ids }); setEditingFoods(false) }}/>}
  </>
}

function FoodEditor({ profile, onClose, onSave }: { profile: Profile; onClose: () => void; onSave: (ids: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>(profile.availableFoodIds ?? [])
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  return <Modal title="O que você consegue comer?" onClose={onClose}><p className="modal-copy">Marque somente o que faz parte da sua realidade. As receitas serão filtradas por esta seleção.</p><div className="food-picker modal-food-picker">{foodOptions.map((food) => <button type="button" key={food.id} className={selected.includes(food.id) ? 'is-selected' : ''} onClick={() => toggle(food.id)}><span><b>{food.name}</b><small>{food.note}</small></span>{selected.includes(food.id) && <Check size={16}/>}</button>)}</div><Button className="wide" disabled={selected.length < 3} onClick={() => onSave(selected)}>Salvar {selected.length} alimentos</Button></Modal>
}

function RecipeCard({ recipe, completed, onLog }: { recipe: Recipe; completed: boolean; onLog: () => void }) {
  const [open, setOpen] = useState(false)
  const ingredientNames = getRecipeIngredients(recipe).map((food) => food.name)
  return <Card className={`recipe-card ${completed ? 'is-completed' : ''}`}><button type="button" className="recipe-main" onClick={() => setOpen(!open)}><span className="recipe-icon"><CookingPot size={19}/></span><div><Pill tone="neutral">{recipe.meal}</Pill><b>{recipe.name}</b><small>{recipe.calories} kcal · {recipe.protein}g proteína · ≈ R$ {recipe.estimatedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</small></div><ChevronDown size={18}/></button>{open && <div className="recipe-expanded"><p>{recipe.prep}</p><span>{ingredientNames.join(' · ')}</span></div>}<button type="button" className="recipe-log" disabled={completed} onClick={onLog}>{completed ? <><Check size={16}/> Registrado</> : <>Registrar <span>+</span></>}</button></Card>
}
