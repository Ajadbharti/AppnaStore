export const storeCategories = [
  { name: 'Kirana', emoji: '🛒', aliases: ['kirana', 'staples', 'household', 'grocery'] },
  { name: 'Dairy', emoji: '🥛', aliases: ['dairy'] },
  { name: 'Fruits & Veg', emoji: '🥬', aliases: ['fruits', 'fruit', 'fresh vegetables', 'vegetables', 'veg'] },
  { name: 'Bakery', emoji: '🍞', aliases: ['bakery'] },
  { name: 'Medical', emoji: '💊', aliases: ['medical'] },
  { name: 'Stationery', emoji: '✏️', aliases: ['stationery'] },
  { name: 'Hardware', emoji: '🔧', aliases: ['hardware'] },
  { name: 'Electronics', emoji: '🔌', aliases: ['electronics'] },
  { name: 'Pet Supplies', emoji: '🐾', aliases: ['pet supplies', 'pet'] },
]

export function categoryOf(productCategory) {
  const key = (productCategory || '').trim().toLowerCase()
  return storeCategories.find(
    (c) => c.name.toLowerCase() === key || c.aliases.includes(key)
  )
}

export function matchesCategory(selected, productCategory) {
  if (!selected) return true
  return categoryOf(productCategory)?.name === selected
}

export function emojiFor(productCategory) {
  return categoryOf(productCategory)?.emoji ?? '📦'
}