/** Curated five-letter words. The answer for a day stays inside this module. */

const ANSWERS = [
  'amber', 'apple', 'baker', 'bench', 'berry', 'bloom', 'board', 'books', 'bread', 'brick',
  'brush', 'cabin', 'cedar', 'chair', 'chalk', 'clock', 'cloud', 'coral', 'couch', 'cream',
  'daisy', 'dance', 'denim', 'dream', 'field', 'flame', 'flora', 'frame', 'fresh', 'glass',
  'grape', 'green', 'heart', 'honey', 'house', 'ivory', 'jolly', 'latte', 'leafy', 'lemon',
  'light', 'linen', 'lotus', 'lucky', 'lunch', 'maple', 'music', 'olive', 'paint', 'paper',
  'peace', 'peach', 'pearl', 'petal', 'piano', 'pixel', 'plant', 'plaza', 'plush', 'quiet',
  'river', 'robin', 'sandy', 'shelf', 'smile', 'solar', 'spice', 'stone', 'story', 'sunny',
  'sweet', 'table', 'steam', 'toast', 'tulip', 'vivid', 'water', 'wheat', 'white', 'woody',
] as const

const EXTRA = [
  'about', 'above', 'after', 'again', 'along', 'among', 'angel', 'ankle', 'apart', 'arrow',
  'audio', 'avoid', 'awake', 'beach', 'begin', 'being', 'below', 'black', 'blank', 'blast',
  'bliss', 'block', 'blood', 'blown', 'blues', 'blunt', 'boast', 'bonus', 'bound', 'brain',
  'brand', 'brave', 'break', 'brief', 'bring', 'broad', 'brown', 'build', 'bunch', 'candy',
  'carry', 'catch', 'cause', 'chain', 'charm', 'cheap', 'check', 'cheek', 'chest', 'chief',
  'child', 'civil', 'claim', 'class', 'clean', 'clear', 'click', 'climb', 'cling', 'close',
  'coast', 'color', 'comet', 'count', 'cover', 'craft', 'crane', 'crash', 'crazy', 'crisp',
  'cross', 'crowd', 'crown', 'curve', 'cycle', 'daily', 'delay', 'dense', 'depth', 'diary',
  'doubt', 'draft', 'drain', 'drawn', 'dress', 'drift', 'drink', 'drive', 'eager', 'early',
  'earth', 'eight', 'elbow', 'empty', 'enjoy', 'enter', 'equal', 'error', 'event', 'every',
  'exact', 'exist', 'extra', 'fairy', 'faith', 'false', 'fancy', 'fault', 'feast', 'fence',
  'fever', 'fibre', 'fiber', 'fifth', 'fifty', 'final', 'first', 'fixed', 'flake', 'flash',
  'fleet', 'float', 'flood', 'floor', 'flour', 'fluid', 'focus', 'force', 'forge', 'forth',
  'found', 'frank', 'front', 'frost', 'fruit', 'fully', 'funny', 'given', 'globe', 'glory',
  'glove', 'going', 'grace', 'grade', 'grain', 'grand', 'grant', 'grass', 'great', 'greet',
  'group', 'guard', 'guess', 'guest', 'guide', 'habit', 'happy', 'harsh', 'haste', 'haven',
  'heavy', 'hence', 'hobby', 'honor', 'horse', 'hotel', 'human', 'humor', 'ideal', 'image',
  'index', 'inner', 'input', 'irony', 'issue', 'joint', 'judge', 'juice', 'knack', 'kneel',
  'knife', 'knock', 'known', 'label', 'large', 'later', 'laugh', 'layer', 'learn', 'leave',
  'legal', 'level', 'limit', 'local', 'lodge', 'logic', 'loose', 'lover', 'lower', 'loyal',
  'lunar', 'lunch', 'magic', 'major', 'maker', 'march', 'match', 'maybe', 'mayor', 'meant',
  'media', 'mercy', 'merit', 'metal', 'meter', 'midst', 'might', 'minor', 'model', 'money',
  'month', 'moral', 'motor', 'mount', 'mouse', 'mouth', 'movie', 'needs', 'never', 'night',
  'noble', 'noise', 'north', 'novel', 'nurse', 'occur', 'ocean', 'offer', 'often', 'order',
  'other', 'ought', 'outer', 'owner', 'oxide', 'panel', 'party', 'pasta', 'patch', 'pause',
  'phase', 'phone', 'photo', 'piece', 'pilot', 'pitch', 'place', 'plain', 'plane', 'plate',
  'point', 'porch', 'pound', 'power', 'press', 'price', 'pride', 'prime', 'print', 'prior',
  'prize', 'proof', 'proud', 'prove', 'queen', 'quick', 'quota', 'quote', 'radio', 'raise',
  'range', 'rapid', 'ratio', 'reach', 'react', 'ready', 'realm', 'refer', 'relax', 'reply',
  'right', 'rival', 'roast', 'robot', 'rocky', 'rough', 'round', 'route', 'royal', 'rural',
  'salad', 'sauce', 'scale', 'scene', 'scope', 'score', 'sense', 'serve', 'setup', 'seven',
  'shade', 'shake', 'shall', 'shape', 'share', 'sharp', 'sheep', 'sheet', 'shift', 'shine',
  'shirt', 'shock', 'shore', 'short', 'shout', 'sight', 'since', 'sixth', 'skill', 'skirt',
  'sleep', 'slide', 'small', 'smart', 'smell', 'smoke', 'snack', 'solid', 'solve', 'sorry',
  'sound', 'south', 'space', 'spare', 'speak', 'speed', 'spend', 'spoke', 'sport', 'staff',
  'stage', 'stair', 'stake', 'stand', 'start', 'state', 'steep', 'stick', 'still', 'stock',
  'stood', 'store', 'storm', 'stove', 'study', 'style', 'sugar', 'suite', 'super', 'swear',
  'sweep', 'swing', 'taste', 'teach', 'teeth', 'thank', 'theme', 'there', 'these', 'thick',
  'thing', 'think', 'third', 'those', 'three', 'throw', 'tight', 'today', 'token', 'total',
  'touch', 'tough', 'tower', 'track', 'trade', 'train', 'treat', 'trend', 'trial', 'tribe',
  'trick', 'tried', 'troop', 'truck', 'truly', 'trust', 'truth', 'twice', 'under', 'union',
  'until', 'upper', 'upset', 'urban', 'usual', 'valid', 'value', 'video', 'visit', 'vital',
  'voice', 'waste', 'watch', 'weigh', 'where', 'which', 'while', 'whole', 'whose', 'woman',
  'world', 'worry', 'worth', 'would', 'write', 'wrong', 'wrote', 'yield', 'young', 'youth',
]

const DICTIONARY = new Set<string>([...ANSWERS, ...EXTRA])

export type Mark = 'correct' | 'present' | 'absent'

export function utcDay(now = new Date()): string {
  return now.toISOString().slice(0, 10)
}

export function puzzleNumber(day: string): number {
  const start = Date.UTC(2026, 0, 1)
  const t = Date.parse(`${day}T00:00:00Z`)
  return Math.floor((t - start) / 86_400_000) + 1
}

export function nextReset(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
}

export function isWord(guess: string): boolean {
  return DICTIONARY.has(guess.toLowerCase())
}

/** Answer stays unexported. Callers receive marks only. */
export function answerForDay(day: string): string {
  const index = Math.abs(puzzleNumber(day) - 1) % ANSWERS.length
  return ANSWERS[index]
}

export function markGuess(answer: string, guess: string): Mark[] {
  const marks: Mark[] = Array(5).fill('absent')
  const left: Record<string, number> = {}
  for (const letter of answer) left[letter] = (left[letter] ?? 0) + 1
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) {
      marks[i] = 'correct'
      left[guess[i]] -= 1
    }
  }
  for (let i = 0; i < 5; i++) {
    if (marks[i] === 'correct') continue
    if ((left[guess[i]] ?? 0) > 0) {
      marks[i] = 'present'
      left[guess[i]] -= 1
    }
  }
  return marks
}
