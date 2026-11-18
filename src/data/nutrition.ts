export interface FoodOption {
  id: string
  name: string
  category: 'proteina' | 'energia' | 'fruta' | 'complemento'
  note: string
}

export interface Recipe {
  id: string
  name: string
  meal: 'cafe' | 'almoco' | 'lanche' | 'jantar'
  calories: number
  protein: number
  prep: string
  /** IDs do catálogo; a receita aparece somente quando todos estão selecionados. */
  ingredients: string[]
  estimatedCost: number
}

export const foodOptions: FoodOption[] = [
  { id: 'eggs', name: 'Ovos', category: 'proteina', note: 'versátil e prático' },
  { id: 'milk', name: 'Leite', category: 'proteina', note: 'para vitaminas e mingaus' },
  { id: 'chicken', name: 'Frango', category: 'proteina', note: 'proteína principal' },
  { id: 'beans', name: 'Feijão', category: 'proteina', note: 'proteína + energia' },
  { id: 'rice', name: 'Arroz', category: 'energia', note: 'base de almoço e jantar' },
  { id: 'oats', name: 'Aveia', category: 'energia', note: 'lanche prático' },
  { id: 'bread', name: 'Pão', category: 'energia', note: 'café da manhã rápido' },
  { id: 'pasta', name: 'Macarrão', category: 'energia', note: 'energia fácil de montar' },
  { id: 'banana', name: 'Banana', category: 'fruta', note: 'fruta calórica e prática' },
  { id: 'seasonal-fruit', name: 'Fruta da estação', category: 'fruta', note: 'escolha a mais acessível' },
  { id: 'peanuts', name: 'Amendoim', category: 'complemento', note: 'completa calorias' },
  { id: 'vegetables', name: 'Legumes/verduras', category: 'complemento', note: 'varie com a feira' }
]

export const recipes: Recipe[] = [
  { id: 'smoothie', name: 'Vitamina prática', meal: 'cafe', calories: 590, protein: 21, prep: 'Bata leite, banana, aveia e amendoim. Ajuste a porção ao seu apetite.', ingredients: ['milk', 'banana', 'oats', 'peanuts'], estimatedCost: 5.4 },
  { id: 'eggs-toast', name: 'Ovos com pão e fruta', meal: 'cafe', calories: 510, protein: 25, prep: 'Prepare os ovos do jeito que preferir e complete com pão e uma fruta.', ingredients: ['eggs', 'bread', 'banana'], estimatedCost: 4.8 },
  { id: 'rice-beans', name: 'Arroz, feijão e ovos', meal: 'almoco', calories: 680, protein: 30, prep: 'Monte um prato com arroz, feijão, ovos e legumes que você selecionou.', ingredients: ['rice', 'beans', 'eggs', 'vegetables'], estimatedCost: 6.7 },
  { id: 'chicken-rice', name: 'Frango, arroz e feijão', meal: 'almoco', calories: 720, protein: 42, prep: 'Use frango, arroz, feijão e legumes. Ajuste as porções ao apetite.', ingredients: ['chicken', 'rice', 'beans', 'vegetables'], estimatedCost: 8.3 },
  { id: 'oats', name: 'Aveia reforçada', meal: 'lanche', calories: 430, protein: 16, prep: 'Misture aveia com leite e banana; acrescente amendoim se estiver disponível.', ingredients: ['oats', 'milk', 'banana', 'peanuts'], estimatedCost: 3.9 },
  { id: 'pasta-eggs', name: 'Macarrão com ovos', meal: 'jantar', calories: 700, protein: 29, prep: 'Finalize o macarrão com ovos e legumes. Faça uma porção que caiba na sua fome.', ingredients: ['pasta', 'eggs', 'vegetables'], estimatedCost: 6.2 },
  { id: 'rice-eggs', name: 'Arroz com ovos', meal: 'jantar', calories: 610, protein: 25, prep: 'Uma base simples: arroz, ovos e legumes.', ingredients: ['rice', 'eggs', 'vegetables'], estimatedCost: 5.7 }
]

export function getRecipeIngredients(recipe: Recipe): FoodOption[] {
  return recipe.ingredients.map((id) => foodOptions.find((food) => food.id === id)).filter((food): food is FoodOption => Boolean(food))
}

export function recipesForAvailableFoods(foodIds: string[]): Recipe[] {
  const selected = new Set(foodIds)
  return recipes.filter((recipe) => recipe.ingredients.every((ingredient) => selected.has(ingredient)))
}
