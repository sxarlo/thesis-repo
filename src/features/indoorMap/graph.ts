import { CY, FLOORS, STAIR_IDS, VL, type FloorNum, type RoomSide } from './data'

export interface MapNode {
  x: number
  y: number
  label: string
  f?: number
  cx?: number
  side?: RoomSide
  room?: number
  pt?: number
  short?: string
}

export type AdjMap = Record<string, [string, number][]>
export type NodeMap = Record<string, MapNode>

export interface Graph {
  nodes: NodeMap
  adj: AdjMap
}

/**
 * Port of the reference graph builder: every room gets a node plus a corridor
 * node on the centre line, corridor points are chained left-to-right per floor,
 * and the three stairwells are linked vertically across floors.
 */
export function buildGraph(): Graph {
  const nodes: NodeMap = {}
  const adj: AdjMap = {}

  const addNode = (id: string, x: number, y: number, lb: string) => {
    if (!nodes[id]) {
      nodes[id] = { x, y, label: lb }
      adj[id] = []
    }
  }

  const link = (a: string, b: string, w?: number) => {
    const weight = w ?? Math.hypot(nodes[a].x - nodes[b].x, nodes[a].y - nodes[b].y)
    adj[a].push([b, weight])
    adj[b].push([a, weight])
  }

  const floors: FloorNum[] = [1, 2, 3]

  floors.forEach(f => {
    const chain: string[] = []
    const { R, P } = FLOORS[f]

    R.forEach(([id, x1, x2, s, , title, sub]) => {
      const top = s === 't'
      const cx = (x1 + x2) / 2
      const nid = `${f}:${id}`
      addNode(nid, cx, top ? 233 : 340, `F${f} ` + title + (sub ? ` (${sub})` : ''))
      Object.assign(nodes[nid], { side: s, cx, f, room: 1, short: title })

      const kid = `${f}:k${cx}`
      addNode(kid, cx, CY, 'corridor')
      nodes[kid].f = f
      nodes[kid].cx = cx
      chain.push(kid)
      link(nid, kid)
    })

    P.forEach(([id, lb, x]) => {
      const nid = `${f}:${id}`
      addNode(nid, x, CY, `F${f} ${lb}`)
      Object.assign(nodes[nid], { pt: 1, cx: x, f, short: lb })

      if (id === 'CH') {
        nodes[nid].y = 470
        nodes[nid].side = 'b'
        link(nid, `${f}:C`)
      } else if (STAIR_IDS.includes(id)) {
        const k = `${f}:k${id}`
        nodes[nid].y = 130
        nodes[nid].side = 't'
        addNode(k, x, CY, 'corridor')
        Object.assign(nodes[k], { f, cx: x })
        chain.push(k)
        link(nid, k)
      } else {
        chain.push(nid)
      }
    })

    chain.sort((a, b) => nodes[a].x - nodes[b].x)
    for (let i = 0; i < chain.length - 1; i++) link(chain[i], chain[i + 1])
  })

  STAIR_IDS.forEach(k => {
    link(`1:${k}`, `2:${k}`, VL)
    link(`2:${k}`, `3:${k}`, VL)
  })

  return { nodes, adj }
}
