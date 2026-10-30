import type { CafeDrink, CarriedItem, FinishedDrink, LatteArt } from '../../types'

export function isFinished(item: CarriedItem | null | undefined): item is FinishedDrink {
  return !!item && typeof item === 'object'
}

export function isBook(item: CarriedItem | null | undefined) {
  return item === 'book'
}

export function isHeldDrink(item: CarriedItem | null | undefined) {
  return item === 'coffee_mug' || item === 'tea_mug' || isFinished(item)
}

export function isTeaDrink(item: CarriedItem | null | undefined) {
  return item === 'tea_mug' || (isFinished(item) && item.drink === 'tea')
}

const NAMES: Record<CafeDrink, string> = {
  espresso: 'Espresso',
  latte: 'Latte',
  cappuccino: 'Cappuccino',
  flat_white: 'Flat white',
  cocoa: 'Hot chocolate',
  tea: 'Tea',
}

export function drinkName(drink: CafeDrink) {
  return NAMES[drink]
}

export function carriedLabel(item: CarriedItem) {
  if (item === 'book') return 'Book'
  if (item === 'coffee_mug') return 'Coffee'
  if (item === 'tea_mug') return 'Tea'
  const stars = '★'.repeat(item.stars)
  const art = item.art ? ` · ${item.art}` : ''
  return `${drinkName(item.drink)} ${stars}${art}`
}

export function carriedShort(item: CarriedItem) {
  if (item === 'book') return 'a book'
  if (item === 'coffee_mug') return 'a coffee'
  if (item === 'tea_mug') return 'a tea'
  const praise = item.stars >= 5 ? `${item.stars}-star ` : ''
  return `a ${praise}${drinkName(item.drink).toLowerCase()}`
}

export function carriedEmoji(item: CarriedItem | null | undefined) {
  if (!item || item === 'book') return '📖'
  if (item === 'tea_mug' || (isFinished(item) && item.drink === 'tea')) return '🍵'
  if (isFinished(item) && item.drink === 'cocoa') return '☕'
  return '☕'
}

export function drawHeldItem(
  ctx: CanvasRenderingContext2D,
  item: CarriedItem,
  ix: number,
  iy: number,
  sipping: boolean,
) {
  const s = 2
  const y = sipping ? iy - 12 : iy
  if (item === 'book') {
    ctx.fillStyle = '#8B4513'
    ctx.fillRect(ix, y - s, 6 * s, 7 * s)
    ctx.fillStyle = '#D4C9B0'
    ctx.fillRect(ix + s, y - s, 4 * s, 7 * s)
    ctx.fillStyle = '#F2E8D8'
    ctx.fillRect(ix + 2 * s, y, 2 * s, 5 * s)
    return
  }
  const drink: CafeDrink | 'coffee' | 'tea' = item === 'coffee_mug' ? 'coffee' : item === 'tea_mug' ? 'tea' : item.drink
  const art = isFinished(item) ? item.art : undefined
  const topping = isFinished(item) ? item.topping : undefined
  drawCup(ctx, ix, y, s, drink, art, topping)
}

function drawCup(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  drink: CafeDrink | 'coffee' | 'tea',
  art?: LatteArt,
  topping?: string,
) {
  const px = (dx: number, dy: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color
    ctx.fillRect(x + dx * s, y + dy * s, w * s, h * s)
  }
  if (drink === 'espresso') {
    px(1, 2, 3, 3, '#F4EFE6')
    px(4, 3, 1, 1, '#C4B6A4')
    px(1, 2, 3, 1, '#3C2418')
    return
  }
  if (drink === 'tea') {
    px(0, 4, 5, 1, '#E4D2B0')
    px(1, 1, 3, 3, '#F7F1E6')
    px(4, 2, 1, 1, '#C4B6A4')
    px(1, 1, 3, 1, '#C4A15A')
    return
  }
  if (drink === 'cappuccino') {
    px(0, 1, 5, 4, '#F7F1E6')
    px(5, 2, 1, 2, '#D9CBB8')
    px(0, 1, 5, 2, '#F3E6D4')
    if (topping === 'cocoa') {
      px(1, 1, 1, 1, '#6B4226')
      px(3, 1, 1, 1, '#6B4226')
    }
    return
  }
  if (drink === 'latte' || drink === 'flat_white') {
    const tall = drink === 'latte'
    px(0, tall ? 0 : 1, 4, tall ? 6 : 5, '#F7F1E6')
    px(4, 2, 1, 2, '#D9CBB8')
    px(0, tall ? 0 : 1, 4, 1, '#F4EFE4')
    if (art === 'heart') px(1, tall ? 0 : 1, 2, 1, '#F7F1E6')
    else px(1, tall ? 0 : 1, 1, 1, '#E7D3B5')
    return
  }
  if (drink === 'cocoa') {
    px(0, 1, 4, 5, '#F4E7D4')
    px(4, 2, 1, 2, '#C4A574')
    px(0, 1, 4, 1, '#6B3A28')
    if (topping === 'cream') px(1, 0, 2, 1, '#FFFEFA')
    else if (topping === 'shavings' || topping === 'cocoa') {
      px(1, 1, 1, 1, '#6B4226')
      px(2, 0, 1, 1, '#6B4226')
    } else {
      px(1, 0, 1, 1, '#F7F1E6')
      px(2, 0, 1, 1, '#F7F1E6')
    }
    return
  }
  px(0, 1, 4, 5, '#F2E8D8')
  px(4, 2, 2, 3, '#B8A898')
  px(1, 1, 2, 1, '#6B3F28')
  px(1, -1, 1, 1, 'rgba(255,255,255,0.7)')
}

export function drawBrewingMark(ctx: CanvasRenderingContext2D, x: number, y: number, tick: number) {
  const rise = (tick * 0.4) % 8
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.fillRect(x, y - rise, 2, 2)
  ctx.fillRect(x + 4, y - ((rise + 3) % 8), 2, 2)
}
