export interface Recipe {
  id: string
  name: string
  meal: 'cafe' | 'almoco' | 'lanche' | 'jantar'
  calories: number
  protein: number
  prep: string
  ingredients: string[]
  estimatedCost: number
}

export const recipes: Recipe[] = [
  { id: 'smoothie', name: 'Vitamina prática', meal: 'cafe', calories: 590, protein: 21, prep: 'Bata leite, banana, aveia e amendoim. Ajuste a porção ao seu apetite.', ingredients: ['leite', 'banana', 'aveia', 'amendoim'], estimatedCost: 5.4 },
  { id: 'eggs-toast', name: 'Ovos com pão e fruta', meal: 'cafe', calories: 510, protein: 25, prep: 'Prepare os ovos do jeito que preferir e complete com pão e uma fruta.', ingredients: ['ovos', 'pão', 'banana'], estimatedCost: 4.8 },
  { id: 'rice-beans', name: 'Arroz, feijão e ovos', meal: 'almoco', calories: 680, protein: 30, prep: 'Monte um prato completo com arroz, feijão, ovos e legumes da estação.', ingredients: ['arroz', 'feijão', 'ovos', 'legumes'], estimatedCost: 6.7 },
  { id: 'oats', name: 'Aveia reforçada', meal: 'lanche', calories: 430, protein: 16, prep: 'Misture aveia com leite ou iogurte e acrescente banana e amendoim.', ingredients: ['aveia', 'leite', 'banana', 'amendoim'], estimatedCost: 3.9 },
  { id: 'pasta', name: 'Macarrão com ovos', meal: 'jantar', calories: 700, protein: 29, prep: 'Finalize o macarrão com ovos mexidos e legumes disponíveis.', ingredients: ['macarrão', 'ovos', 'legumes'], estimatedCost: 6.2 }
]

export const starterShoppingList = [
  { name: 'Ovos', note: 'prioridade de proteína versátil' },
  { name: 'Leite', note: 'base para lanches e vitaminas' },
  { name: 'Aveia', note: 'energia fácil de combinar' },
  { name: 'Banana', note: 'fruta prática e calórica' },
  { name: 'Amendoim', note: 'complemente porções, se couber no orçamento' }
]
