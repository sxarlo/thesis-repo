import { BOXES, FLOORS, type FloorNum, type RoomTuple, type StaticBox } from './data'

export interface LabelLine {
  text: string
  size: number
  weight: number
}

export interface LabelLayout {
  clipId: string
  cx: number
  cy: number
  w: number
  h: number
  rotated: boolean
  lines: LabelLine[]
  originY: number
  lineHeight: number
}

/** Word-wrap by character budget (matches the reference `wrap()` helper). */
export function wrap(s: string, n: number): string[] {
  const o: string[] = []
  let c = ''
  s.split(' ').forEach(w => {
    if (c && (c + ' ' + w).length > n) {
      o.push(c)
      c = w
    } else {
      c = c ? c + ' ' + w : w
    }
  })
  if (c) o.push(c)
  return o
}

/**
 * Port of the reference `label()` routine: shrinks font sizes, then drops
 * trailing lines, until the text block fits inside the room/box rectangle.
 */
export function layoutLabel(
  clipId: string,
  cx: number,
  cy: number,
  w: number,
  h: number,
  title: string,
  sub: string,
  rot: boolean,
): LabelLayout {
  const boxH = h || 34
  const ew = Math.max(14, (rot ? boxH : w) - 6)
  const eh = Math.max(10, (rot ? w : boxH) - 4)

  const build = (fz: number, fzs: number, withSub: boolean): LabelLine[] => {
    const L: LabelLine[] = wrap(title, Math.max(3, Math.floor(ew / (fz * 0.56)))).map(t => ({
      text: t,
      size: fz,
      weight: 700,
    }))
    if (withSub && sub) {
      wrap(sub, Math.max(3, Math.floor(ew / (fzs * 0.56)))).forEach(t => L.push({ text: t, size: fzs, weight: 400 }))
    }
    return L
  }

  let fz = 13
  let fzs = 11
  let lh = 15
  let lines = build(fz, fzs, true)

  while (lines.length * lh > eh && fz > 8) {
    fz--
    fzs = Math.max(7, fzs - 1)
    lh = Math.max(9, lh - 1)
    lines = build(fz, fzs, true)
  }
  if (lines.length * lh > eh) lines = build(fz, fzs, false)
  while (lines.length > 1 && lines.length * lh > eh) lines.pop()

  const totalH = lines.length * lh
  return { clipId, cx, cy, w, h: boxH, rotated: rot, lines, originY: cy - totalH / 2 + lh * 0.72, lineHeight: lh }
}

export interface BoxRender extends StaticBox {
  layout: LabelLayout
}

export interface RoomRender {
  room: RoomTuple
  layout: LabelLayout
}

export const BOX_RENDERS: Record<FloorNum, BoxRender[]> = {
  1: BOXES[1].map((b, i) => ({
    ...b,
    layout: layoutLabel(`imlc-b1-${i}`, (b.x1 + b.x2) / 2, 130, b.x2 - b.x1, 208, b.label, '', b.x2 - b.x1 < 100),
  })),
  2: BOXES[2].map((b, i) => ({
    ...b,
    layout: layoutLabel(`imlc-b2-${i}`, (b.x1 + b.x2) / 2, 130, b.x2 - b.x1, 208, b.label, '', b.x2 - b.x1 < 100),
  })),
  3: BOXES[3].map((b, i) => ({
    ...b,
    layout: layoutLabel(`imlc-b3-${i}`, (b.x1 + b.x2) / 2, 130, b.x2 - b.x1, 208, b.label, '', b.x2 - b.x1 < 100),
  })),
}

function roomRender(floor: FloorNum, r: RoomTuple, i: number): RoomRender {
  const top = r[3] === 't'
  const y = top ? 25 : 340
  const h = top ? 208 : 207
  const w = r[2] - r[1]
  return {
    room: r,
    layout: layoutLabel(`imlc-r${floor}-${i}`, (r[1] + r[2]) / 2, y + h / 2, w, h, r[5], r[6], w < 80),
  }
}

export const ROOM_RENDERS: Record<FloorNum, RoomRender[]> = {
  1: FLOORS[1].R.map((r, i) => roomRender(1, r, i)),
  2: FLOORS[2].R.map((r, i) => roomRender(2, r, i)),
  3: FLOORS[3].R.map((r, i) => roomRender(3, r, i)),
}

export const ALL_LAYOUTS: LabelLayout[] = [
  ...BOX_RENDERS[1], ...BOX_RENDERS[2], ...BOX_RENDERS[3],
  ...ROOM_RENDERS[1], ...ROOM_RENDERS[2], ...ROOM_RENDERS[3],
].map(l => l.layout)
