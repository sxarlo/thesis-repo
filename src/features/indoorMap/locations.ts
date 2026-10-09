import { FLOORS, FLOOR_ORDER, STAIR_IDS, type FloorNum, type RoomTuple } from './data'
import { floorName } from './directions'

export type LocCategory = 'classroom' | 'office' | 'special' | 'stairs' | 'landmark'

export interface MapLocation {
  /** Graph node id, e.g. `1:REGISTRAR` — same value used for pathfinding. */
  id: string
  name: string
  detail: string
  floor: FloorNum
  category: LocCategory
  aliases: string[]
  /** Lowercased blob every query token is matched against. */
  haystack: string
}

export const CAT_ICON: Record<LocCategory, string> = {
  classroom: '🏫',
  office: '🏢',
  special: '✨',
  stairs: '🪜',
  landmark: '🧭',
}

export const CAT_LABEL: Record<LocCategory, string> = {
  classroom: 'Classroom',
  office: 'Office',
  special: 'Special room',
  stairs: 'Stairs',
  landmark: 'Landmark',
}

/** Extra search aliases keyed by graph node id (`floor:roomId`). */
const ALIASES: Record<string, string[]> = {
  '1:REGISTRAR': ['registrar', 'registration', 'enrollment', 'records'],
  '1:ACCOUNTING & PROPERTY': ['accounting', 'property', 'supply'],
  '1:CASHIER': ['cashier', 'payment', 'tuition payment'],
  '1:PSYCH LAB': ['psych', 'psychology laboratory', 'psych lab'],
  '1:RPMS': ['rpms', 'performance management'],
  '1:SASS': ['sass', 'student affairs'],
  '1:Health Services': ['clinic', 'nurse', 'medical', 'health'],
  '1:Marketing Communications Dept': ['marketing communication', 'marketing', 'marcom', 'communications'],
  '1:Guidance & Counseling': ['guidance', 'counseling', 'counselling'],
  '1:Testing Room': ['testing room', 'testing', 'exam room'],
  "1:VP's Office": ['vp', 'vice president', 'vp office'],
  '1:Meeting Room': ['meeting', 'conference', 'meeting room'],
  '1:CEIS - SHS': ['ceis', 'shs', 'senior high school', 'senior high'],
  '1:CLASSROOM': ['classroom', 'class room', 'class'],
  '1:CANTEEN': ['canteen', 'cafeteria', 'food', 'lunch'],
  '1:Comfort Room 1': ['comfort room', 'cr', 'restroom', 'toilet', 'bathroom', 'washroom', 'comfort room 1'],
  '1:Comfort Room 2': ['comfort room', 'cr', 'restroom', 'toilet', 'bathroom', 'washroom', 'comfort room 2'],
  '1:ADA Hotel': ['ada', 'hotel', 'ada hotel'],
  '1:MIR': ['mir', 'media information room'],
  '1:TLTS': ['tlts', 'technology lab'],
  '1:CHM Department': ['chm', 'chemistry', 'chemistry department'],
  '1:Uniform Section': ['uniform', 'uniforms'],
  '1:Property Stock Room': ['stock room', 'stockroom', 'property stock', 'warehouse'],
  '1:PHL Room 101': ['phl 101', 'philosophy 101'],
  '1:PHL Room 102': ['phl 102', 'philosophy 102'],
  '1:PHL Room 103': ['phl 103', 'philosophy 103'],
  '1:PHL Room 104': ['phl 104', 'philosophy 104'],
  '2:214': ['health research room', 'health research', 'presentation room'],
  '2:212': ['bank and investment room', 'banking room'],
  '2:210': ['accounting room'],
  '2:208': ['quality and productivity room', 'qa room'],
  '2:206': ['s and d room', 'sd room'],
  '2:CELAS': ['celas', 'faculty room'],
  '2:CAMT': ['camt', 'faculty room'],
  '2:209': ['communication and humanities department', 'humanities department'],
  '2:207': ['soc arts room', 'social arts room'],
  '3:Library-N': ['library', 'reading room', 'library north'],
  '3:Library-S': ['library', 'reading room', 'library south'],
  '3:Room 305': ['biological science laboratory', 'biology lab'],
  '3:Room 306': ['physical science laboratory', 'physics lab'],
  '3:Room 307': ['pharmacy laboratory', 'pharmacy lab'],
  '3:Computer Lab 301': ['computer lab', 'computer laboratory'],
  '3:Computer Lab 302': ['computer lab', 'computer laboratory'],
  '3:Computer Lab 303': ['computer lab', 'computer laboratory'],
  '3:Computer Lab Coordinator': [
    'ict',
    'ict coordinator',
    'ict office',
    'information and communications technology',
    'computer laboratory coordinator',
  ],
  '3:Physics/Tablet/Instr': ['physics room', 'tablet room', 'instrumentation room'],
  '3:Writing/Store/QC': ['writing room', 'general store', 'quality control'],
  '3:Comfort Rooms': ['comfort room', 'cr', 'restroom', 'toilet', 'bathroom'],
  '3:Comfort Rooms N': ['comfort room', 'cr', 'restroom', 'toilet', 'bathroom'],
  SL: ['west stairs', 'west stairway'],
  SM: ['center stairs', 'centre stairs', 'middle stairs'],
  SR: ['east stairs', 'east stairway'],
  N: ['north exit', 'north entrance'],
  S: ['south exit', 'south entrance'],
  C: ['center gate', 'centre gate', 'main gate', 'entrance'],
  CH: ['chapel'],
  '2:C': ['center exit', 'centre exit'],
}

const CATEGORY_BY_COLOR: Record<string, LocCategory> = { g: 'classroom', b: 'office', y: 'special' }

function buildAliases(name: string, detail: string, extra: string[]): string[] {
  const out = new Set<string>(extra)
  const phl = /^PHL RM (\d+)$/.exec(name)
  if (phl) out.add(`PHL Room ${phl[1]}`)
  if (detail && detail !== name) out.add(detail)
  return [...out].filter(Boolean)
}

function roomLocation(floor: FloorNum, r: RoomTuple): MapLocation {
  const [id, , , , color, title, sub] = r
  const node = `${floor}:${id}`
  const name = title
  const detail = sub && sub !== title ? sub : ''
  const category = CATEGORY_BY_COLOR[color] ?? 'special'
  const aliases = buildAliases(name, detail, ALIASES[node] ?? [])
  return {
    id: node,
    name,
    detail,
    floor,
    category,
    aliases,
    haystack: [node, name, detail, ...aliases, floorName(floor)].join(' ').toLowerCase(),
  }
}

function pointLocation(floor: FloorNum, [id, label]: readonly [string, string, number]): MapLocation {
  const node = `${floor}:${id}`
  const category: LocCategory = STAIR_IDS.includes(id) ? 'stairs' : 'landmark'
  const aliases = buildAliases(label, '', ALIASES[node] ?? ALIASES[id] ?? [])
  return {
    id: node,
    name: label,
    detail: '',
    floor,
    category,
    aliases,
    haystack: [node, label, ...aliases, floorName(floor)].join(' ').toLowerCase(),
  }
}

/** Every navigable node on the map — rooms, offices, stairs and exits. */
function buildLocations(): MapLocation[] {
  const raw = FLOOR_ORDER.flatMap(f => [
    ...FLOORS[f].R.map(r => roomLocation(f, r)),
    ...FLOORS[f].P.map(p => pointLocation(f, p)),
  ])

  // Two rooms can share a printed name (e.g. both comfort rooms read
  // "COMFORT ROOM") — fall back to the node id so suggestions stay distinct.
  const dupes = new Map<string, number>()
  raw.forEach(l => {
    const k = `${l.floor}|${l.name}|${l.detail}`
    dupes.set(k, (dupes.get(k) ?? 0) + 1)
  })

  return raw.map(l => {
    const k = `${l.floor}|${l.name}|${l.detail}`
    if ((dupes.get(k) ?? 0) < 2 || l.detail) return l
    const detail = l.id.slice(l.id.indexOf(':') + 1)
    return { ...l, detail, haystack: `${l.haystack} ${detail}`.toLowerCase() }
  })
}

export const MAP_LOCATIONS: MapLocation[] = buildLocations()

export const LOCATION_BY_ID: Record<string, MapLocation> = Object.fromEntries(
  MAP_LOCATIONS.map(l => [l.id, l]),
)

const BOUNDARY = /[\s:.,/\\&'’"()|–—+-]/

function atWordStart(hay: string, j: number): boolean {
  return j === 0 || BOUNDARY.test(hay[j - 1])
}

/**
 * Word-aware fuzzy match: each needle character must either continue the
 * current run of matched characters or land on a word start (so `crt` still
 * finds "Center Room Two"-style labels while `registrar` no longer matches
 * every label that happens to contain those letters in order).
 */
export function isSubsequence(needle: string, hay: string): boolean {
  let i = 0
  let prev = -1
  for (let j = 0; j < hay.length && i < needle.length; j++) {
    if (hay[j] !== needle[i]) continue
    const allowed = prev < 0 ? atWordStart(hay, j) : j === prev + 1 || atWordStart(hay, j)
    if (allowed) {
      prev = j
      i++
    }
  }
  return i === needle.length
}

/**
 * Fuzzy filter: every whitespace-separated token must either appear verbatim
 * anywhere in the location's haystack (substring — ranked highest) or at least
 * as a character subsequence (typo tolerance — ranked lower).
 */
export function searchLocations(query: string, limit = 8): MapLocation[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const tokens = q.split(/\s+/).filter(Boolean)
  const hits: { loc: MapLocation; score: number }[] = []

  for (const loc of MAP_LOCATIONS) {
    const name = loc.name.toLowerCase()
    let score = 0
    let matched = true

    for (const t of tokens) {
      const idx = loc.haystack.indexOf(t)
      if (idx >= 0) {
        score += 100
        if (name.startsWith(t)) score += 45
        else if (name.includes(t)) score += 25
        else if (loc.aliases.some(a => a.toLowerCase().startsWith(t))) score += 15
        score += Math.max(0, 20 - Math.floor(idx / 6))
      } else if (isSubsequence(t, loc.haystack)) {
        score += 30
      } else {
        matched = false
        break
      }
    }

    if (matched) {
      if (name === q) score += 120
      else if (name.startsWith(q)) score += 60
      hits.push({ loc, score })
    }
  }

  hits.sort((a, b) => b.score - a.score || a.loc.name.localeCompare(b.loc.name))
  return hits.slice(0, limit).map(h => h.loc)
}
