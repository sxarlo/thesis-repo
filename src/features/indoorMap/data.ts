export type RoomSide = 't' | 'b'
export type RoomColorKey = 'g' | 'b' | 'y'
export type FloorNum = 1 | 2 | 3

/** [id, x1, x2, side, color, title, sub] */
export type RoomTuple = readonly [string, number, number, RoomSide, RoomColorKey, string, string]
/** [id, label, x] */
export type CorridorPoint = readonly [string, string, number]

export const CY = 286
export const SC = 0.065
export const VL = 200
export const VIEW_BOX = '0 0 1450 570'

export const COL: Record<RoomColorKey, string> = { g: '#a8e063', b: '#84c1ff', y: '#ffd23f' }

export const X = (y: number) => 1428 - (y - 5) * 2
export const X3 = (y: number) => 1396 - (y - 32) * 1.473

const f2 = (id: number, a: number, b: number, s: RoomSide, c: RoomColorKey, n?: string): RoomTuple =>
  [String(id), a, b, s, c, 'PHL RM ' + id, n || '']

const F2: RoomTuple[] = [
  f2(226, 195, 265, 't', 'g'), f2(224, 265, 345, 't', 'g'), f2(222, 345, 420, 't', 'g'), f2(220, 420, 495, 't', 'g'),
  f2(218, 495, 572, 't', 'b'), f2(216, 572, 648, 't', 'b'),
  f2(214, 799, 873, 't', 'b', 'Health Research and Presentation Room'), f2(212, 873, 946, 't', 'b', 'Bank and Investment Room'),
  f2(210, 946, 1020, 't', 'b', 'Accounting Room'), f2(208, 1020, 1096, 't', 'b', 'Quality and Productivity Room'),
  f2(206, 1096, 1170, 't', 'b', 'S & D Room'), f2(204, 1170, 1246, 't', 'b'), f2(202, 1246, 1311, 't', 'y'),
  f2(227, 70, 155, 'b', 'g'), f2(225, 155, 238, 'b', 'g'), f2(223, 238, 322, 'b', 'g'), f2(221, 322, 405, 'b', 'g'),
  f2(219, 405, 489, 'b', 'g'), f2(217, 489, 571, 'b', 'b'),
  ['CELAS', 634, 714, 'b', 'b', 'CELAS', 'Faculty Room'], ['CAMT', 798, 878, 'b', 'b', 'CAMT', 'Faculty Room'],
  f2(211, 941, 1015, 'b', 'b'), f2(209, 1015, 1101, 'b', 'b', 'Communication and Humanities Department'),
  f2(207, 1101, 1171, 'b', 'b', 'Soc Arts Room'), f2(205, 1171, 1245, 'b', 'b'), f2(203, 1245, 1318, 'b', 'y'),
  f2(201, 1318, 1396, 'b', 'y'),
]

const r1 = (id: string, y1: number, y2: number, s: RoomSide, c: RoomColorKey, t?: string): RoomTuple =>
  [id, X(y2), X(y1), s, c, t || id, '']

const F1: RoomTuple[] = [
  r1('Meeting Room', 98, 155, 't', 'y'), r1('SASS', 155, 208, 't', 'b'), r1('RPMS', 208, 233, 't', 'b'),
  r1('PSYCH LAB', 233, 262, 't', 'b'), r1('CASHIER', 262, 277, 't', 'b'), r1('ACCOUNTING & PROPERTY', 277, 305, 't', 'b'),
  r1('REGISTRAR', 305, 345, 't', 'b'),
  r1('MIR', 442, 473, 't', 'b'), r1('TLTS', 473, 494, 't', 'b'), r1('CEIS - SHS', 494, 545, 't', 'g'),
  r1('CLASSROOM', 545, 583, 't', 'g'), r1('CANTEEN', 583, 642, 't', 'g'),
  r1('Comfort Room 1', 642, 658, 't', 'g', 'COMFORT ROOM'), r1('Comfort Room 2', 658, 676, 't', 'g', 'COMFORT ROOM'),
  r1('ADA Hotel', 32, 155, 'b', 'y', 'ADA HOTEL'), r1("VP's Office", 155, 208, 'b', 'b'), r1('Testing Room', 208, 233, 'b', 'b'),
  r1('Guidance & Counseling', 233, 262, 'b', 'b'), r1('Marketing Communications Dept', 305, 345, 'b', 'b'),
  r1('Health Services', 390, 443, 'b', 'b'),
  r1('PHL Room 101', 480, 510, 'b', 'g'), r1('PHL Room 102', 510, 540, 'b', 'g'), r1('CHM Department', 540, 568, 'b', 'g'),
  r1('Property Stock Room', 568, 592, 'b', 'g'), r1('Uniform Section', 592, 610, 'b', 'g'),
  r1('PHL Room 103', 610, 645, 'b', 'g'), r1('PHL Room 104', 645, 676, 'b', 'g'),
]

const r3 = (id: string, y1: number, y2: number, s: RoomSide, c: RoomColorKey, t?: string): RoomTuple =>
  [id, X3(y2), X3(y1), s, c, t || id, '']

const F3: RoomTuple[] = [
  r3('Comfort Rooms', 32, 84, 't', 'y', 'COMFORT ROOM 1 & 2'), r3('PHL Room 310', 84, 112, 't', 'y', 'Server Room'),
  r3('PHL Room 309', 142, 178, 't', 'y'), r3('Writing/Store/QC', 178, 204, 't', 'y', 'Writing Enclosed / General Store / Quality Control'),
  r3('PHL Room 308', 204, 244, 't', 'y'), r3('Room 307', 244, 268, 't', 'y', 'Pharmacy Laboratory'),
  r3('Physics/Tablet/Instr', 268, 294, 't', 'b', 'Physics / Tablet / Instrumentation Rooms'),
  r3('Room 306', 294, 328, 't', 'b', 'Physical Science Laboratory'),
  r3('Science Lab', 328, 372, 't', 'b'), r3('Science Lab Stock Room', 372, 402, 't', 'b'),
  r3('Room 305', 402, 522, 't', 'b', 'Biological Science Laboratory'),
  r3('Computer Lab 303', 635, 685, 't', 'b'), r3('Computer Lab Coordinator', 685, 715, 't', 'b'),
  r3('Internet Room 1', 715, 748, 't', 'g'),
  r3('Library-N', 748, 880, 't', 'g', 'Library'), r3('Comfort Rooms N', 880, 932, 't', 'g', 'COMFORT ROOM 1 & 2'),
  r3('PHL Room 311', 44, 112, 'b', 'y'), r3('Manufacturing Room', 142, 178, 'b', 'y'),
  r3('Technical Room', 402, 440, 'b', 'b'), r3('Computer Lab 302', 440, 490, 'b', 'b'), r3('Computer Lab 301', 490, 522, 'b', 'b'),
  r3('Bulacan Heritage Center', 635, 672, 'b', 'b'), r3('Discussion Room', 672, 705, 'b', 'b'),
  r3('Technical Services Section', 705, 748, 'b', 'g'),
  r3('Library-S', 748, 880, 'b', 'g', 'Library'), r3('Registrar Stock Room', 880, 932, 'b', 'g'),
]

const P2: CorridorPoint[] = [
  ['N', 'North Exit', 110], ['C', 'Center Exit', 755], ['S', 'South Exit', 1340],
  ['SL', 'West Stairs', 52], ['SM', 'Center Stairs', 690], ['SR', 'East Stairs', 1405], ['CH', 'Chapel', 755],
]
const P1: CorridorPoint[] = [
  ['N', 'North Exit', 110], ['C', 'Center Gate', 703], ['S', 'South Exit', 1340],
  ['SL', 'West Stairs', 52], ['SM', 'Center Stairs', 653], ['SR', 'East Stairs', 1405],
]
const P3: CorridorPoint[] = [
  ['N', 'North Exit', 80], ['S', 'South Exit', 1370],
  ['SL', 'West Stairs', 55], ['SM', 'Center Stairs', 592], ['SR', 'East Stairs', 1410],
]

export const FLOORS: Record<FloorNum, { R: RoomTuple[]; P: CorridorPoint[] }> = {
  1: { R: F1, P: P1 },
  2: { R: F2, P: P2 },
  3: { R: F3, P: P3 },
}

export const FLOOR_ORDER: FloorNum[] = [1, 2, 3]
export const STAIR_IDS = ['SL', 'SM', 'SR']
export const START = '1:REGISTRAR'

export interface StaticBox {
  x1: number
  x2: number
  label: string
}

const box = (x1: number, x2: number, label: string): StaticBox => ({ x1, x2, label })

export const BOXES: Record<FloorNum, StaticBox[]> = {
  1: [box(25, 80, 'Stairs'), box(1378, 1428, 'Stairs'), box(X(440), X(345), 'Stairs'), box(X(98), X(32), 'ADA HOTEL')],
  2: [
    box(25, 80, 'Stairs'), box(1378, 1428, 'Stairs'),
    box(80, 115, 'COMFORT ROOM'), box(115, 148, 'COMFORT ROOM'), box(148, 195, 'STOCK ROOM'),
    box(1311, 1345, 'COMFORT ROOM'), box(1345, 1378, 'COMFORT ROOM'), box(650, 730, 'Stairs'),
  ],
  3: [box(25, 80, 'Stairs'), box(1378, 1428, 'Stairs'), box(X3(635) - 70, X3(522), 'Stairs')],
}

export const CHIPS: [string, string][] = [
  ['3:Library-N', '📚 Library'],
  ['1:CANTEEN', '🍽️ Canteen'],
  ['1:Health Services', '🏥 Health Services'],
  ['1:Comfort Room 1', '🚻 Comfort Room'],
  ['2:214', '🔬 Health Research Room'],
]
