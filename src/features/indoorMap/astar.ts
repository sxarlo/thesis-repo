import type { AdjMap, NodeMap } from './graph'

export interface PathResult {
  path: string[]
  cost: number
  ex: number
}

/** Port of the reference A* search (Euclidean heuristic over node coordinates). */
export function astar(nodes: NodeMap, adj: AdjMap, s: string, g: string): PathResult | null {
  const D: Record<string, number> = { [s]: 0 }
  const P: Record<string, string> = {}
  const open: [string, number][] = [[s, 0]]
  const cl = new Set<string>()
  let ex = 0

  const h = (n: string) => Math.hypot(nodes[n].x - nodes[g].x, nodes[n].y - nodes[g].y)

  while (open.length) {
    open.sort((a, b) => a[1] - b[1])
    const [u] = open.shift()!
    if (cl.has(u)) continue
    cl.add(u)
    ex++
    if (u === g) {
      const p = [g]
      while (P[p[0]]) p.unshift(P[p[0]])
      return { path: p, cost: D[g], ex }
    }
    for (const [v, w] of adj[u]) {
      const t = D[u] + w
      if (t < (D[v] ?? Infinity)) {
        D[v] = t
        P[v] = u
        open.push([v, t + h(v)])
      }
    }
  }
  return null
}
