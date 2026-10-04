import { FLOORS, SC, type FloorNum } from './data'
import type { NodeMap } from './graph'
import type { PathResult } from './astar'

export interface Step {
  f: number
  t: string
}

export function floorName(f: number): string {
  return f === 1 ? '1st Floor' : f === 2 ? '2nd Floor' : '3rd Floor'
}

/**
 * Port of the reference turn-by-turn direction builder.
 * Produces the same HTML strings (including the scoped `im-stat` spans).
 */
export function buildSteps(nodes: NodeMap, r: PathResult): Step[] {
  const segs: string[][] = []
  r.path.forEach(n => {
    const l = segs[segs.length - 1]
    if (l && nodes[l[0]].f === nodes[n].f) l.push(n)
    else segs.push([n])
  })

  const st: Step[] = []
  const nm = (n: string) => nodes[n].label.replace(/^F\d /, '')
  const door = (n: string) => nodes[n].room || nodes[n].side

  segs.forEach((p, i) => {
    const first = i === 0
    const last = i === segs.length - 1
    const f = nodes[p[0]].f as number
    const x0 = nodes[p[0]].cx as number
    const x1 = nodes[p[p.length - 1]].cx as number
    const east = x1 > x0
    const S = nodes[p[0]]
    const D = nodes[p[p.length - 1]]
    const side = (sd: string | undefined, e: boolean) => (sd === 't') === e ? 'left' : 'right'

    if (first) {
      if (door(p[0]) && !S.pt) {
        st.push({ f, t: `🚪 Leave <b>${nm(p[0])}</b> and turn <b>${S.side === 't' === east ? 'left' : 'right'}</b>.` })
      } else {
        st.push({ f, t: `🏁 Start at <b>${nm(p[0])}</b>, on the ${floorName(f)}.` })
      }
    } else {
      st.push({
        f,
        t: `🪜 You're now on the <b>${floorName(f)}</b>, near <b>${nm(p[0])}</b>. Turn <b>${S.side === 't' === east ? 'left' : 'right'}</b>.`,
      })
    }

    if (Math.abs(x1 - x0) > 1) {
      const L: [number, string][] = []
      const R: [number, string][] = []
      FLOORS[f as FloorNum].R.forEach(([id, a, b, sd, , rt]) => {
        const cx = (a + b) / 2
        if (
          `${f}:${id}` !== p[0] &&
          `${f}:${id}` !== p[p.length - 1] &&
          cx > Math.min(x0, x1) + 1 &&
          cx < Math.max(x0, x1) - 1
        ) {
          ;(side(sd, east) === 'left' ? L : R).push(east ? [cx, rt] : [-cx, rt])
        }
      })
      const fmt = (a: [number, string][]) => a.sort((u, v) => u[0] - v[0]).map(z => z[1]).join(', ')
      let s = `🚶 Walk straight for about <b>${Math.round(Math.abs(x1 - x0) * SC)} m</b>.`
      if (L.length) s += `<br><span class="im-stat">Pass on your left: ${fmt(L)}</span>`
      if (R.length) s += `<br><span class="im-stat">Pass on your right: ${fmt(R)}</span>`
      st.push({ f, t: s })
    }

    if (last) {
      if (D.room) {
        const dir = Math.abs(x1 - x0) > 1 ? side(D.side, east) : (D.side === 't' ? 'left' : 'right')
        st.push({ f, t: `✅ <b>${nm(p[p.length - 1])}</b> is on your <b>${dir}</b>. You've arrived!` })
      } else {
        st.push({ f, t: `✅ You've arrived at <b>${nm(p[p.length - 1])}</b>!` })
      }
    } else {
      const nf = nodes[segs[i + 1][0]].f as number
      st.push({
        f,
        t: `🪜 Take the stairs at <b>${nm(p[p.length - 1])}</b> and go <b>${nf > f ? 'up' : 'down'}</b> to the ${floorName(nf)}.`,
      })
    }
  })

  return st
}
