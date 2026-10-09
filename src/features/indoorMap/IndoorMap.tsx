import { useCallback, useState } from 'react'
import { CHIPS, COL, FLOORS, FLOOR_ORDER, SC, START, VIEW_BOX, type FloorNum, type RoomTuple } from './data'
import { ALL_LAYOUTS, BOX_RENDERS, ROOM_RENDERS, type LabelLayout } from './labels'
import { buildGraph, type MapNode } from './graph'
import { astar, type PathResult } from './astar'
import { buildSteps, floorName, type Step } from './directions'
import { LOCATION_BY_ID, MAP_LOCATIONS, searchLocations } from './locations'
import MapSearchBar from './MapSearchBar'

const GRAPH = buildGraph()

const DEST_IDS = new Set(MAP_LOCATIONS.map(l => l.id))

const LEGEND: [string, string][] = [
  ['#a8e063', 'Classrooms'],
  ['#84c1ff', 'Offices'],
  ['#ffd23f', 'Special rooms'],
  ['#2b9348', 'You are here'],
  ['#d6336c', 'Your destination'],
]

function LabelG({ l }: { l: LabelLayout }) {
  return (
    <g clipPath={`url(#${l.clipId})`}>
      <g transform={l.rotated ? `translate(${l.cx},${l.cy}) rotate(-90) translate(${-l.cx},${-l.cy})` : undefined}>
        {l.lines.map((ln, i) => (
          <text key={i} x={l.cx} y={l.originY + i * l.lineHeight} fontSize={ln.size} fontWeight={ln.weight}>
            {ln.text}
          </text>
        ))}
      </g>
    </g>
  )
}

function RoomRect({
  floor,
  room,
  layout,
  selected,
  onPick,
}: {
  floor: FloorNum
  room: RoomTuple
  layout: LabelLayout
  selected: boolean
  onPick: (id: string) => void
}) {
  const [id, x1, x2, side, color, title, sub] = room
  const top = side === 't'
  const y = top ? 25 : 340
  const h = top ? 208 : 207
  const key = `${floor}:${id}`

  const handleKeyDown = (e: React.KeyboardEvent<SVGRectElement>) => {
    if (e.key === 'Enter') onPick(key)
  }

  return (
    <>
      <rect
        x={x1}
        y={y}
        width={x2 - x1}
        height={h}
        className={selected ? 'im-room sel' : 'im-room'}
        fill={COL[color]}
        tabIndex={0}
        role="button"
        aria-label={`${title} ${sub}`}
        onClick={() => onPick(key)}
        onKeyDown={handleKeyDown}
      />
      <LabelG l={layout} />
    </>
  )
}

export default function IndoorMap() {
  const [floor, setFloor] = useState<FloorNum>(1)
  const [dest, setDest] = useState('')
  const [query, setQuery] = useState('')
  const [hasRun, setHasRun] = useState(false)
  const [res, setRes] = useState<PathResult | null>(null)
  const [steps, setSteps] = useState<Step[]>([])
  const [stepIdx, setStepIdx] = useState(0)

  const labelOf = useCallback((id: string) => {
    const loc = LOCATION_BY_ID[id]
    if (!loc) return ''
    return loc.detail ? `${loc.name} – ${loc.detail}` : loc.name
  }, [])

  const run = useCallback((raw: string) => {
    const g = DEST_IDS.has(raw) ? raw : ''
    setDest(g)
    setQuery(g && LOCATION_BY_ID[g] ? labelOf(g) : '')
    setHasRun(true)
    if (!g || g === START) {
      setRes(null)
      setSteps([])
      setStepIdx(0)
      setFloor(1)
      return
    }
    const found = astar(GRAPH.nodes, GRAPH.adj, START, g)
    if (!found) {
      setRes(null)
      setSteps([])
      setStepIdx(0)
      setFloor(1)
      return
    }
    const built = buildSteps(GRAPH.nodes, found)
    setRes(found)
    setSteps(built)
    setStepIdx(0)
    const destFloor = GRAPH.nodes[g].f as FloorNum | undefined
    setFloor(destFloor ?? (built.length ? (built[0].f as FloorNum) : 1))
  }, [labelOf])

  const pick = useCallback((id: string) => {
    run(id)
  }, [run])

  /** Navigates to whatever the search box currently holds, else the last pick. */
  const getDirections = useCallback(() => {
    const hit = query.trim() ? searchLocations(query, 1)[0] : undefined
    run(hit ? hit.id : dest)
  }, [query, dest, run])

  const clear = useCallback(() => run(''), [run])

  const gotoStep = useCallback((i: number) => {
    setStepIdx(i)
    setFloor(steps[i].f as FloorNum)
  }, [steps])

  const routePaths: string[] = []
  if (res) {
    let seg: string[] = []
    const flush = () => {
      if (seg.length > 1) routePaths.push(seg.map((n, i) => (i ? 'L' : 'M') + GRAPH.nodes[n].x + ' ' + GRAPH.nodes[n].y).join(' '))
      seg = []
    }
    res.path.forEach(n => {
      if (GRAPH.nodes[n].f === floor) seg.push(n)
      else flush()
    })
    flush()
  }

  const pinY = (n: MapNode) => (n.pt ? n.y : n.side === 't' ? n.y - 22 : n.side === 'b' ? n.y + 22 : n.y)

  const startNode = GRAPH.nodes[START]
  const destNode = dest ? GRAPH.nodes[dest] : null
  const showStart = startNode.f === floor
  const showDest = !!destNode && !!res && destNode.f === floor

  const metres = res ? Math.round(res.cost * SC) : 0
  const mins = Math.max(1, Math.round(metres / 1.3 / 6) / 10)

  const fallbackMsg = hasRun
    ? dest === START
      ? "You're already there! 🎉"
      : 'Pick where you want to go above — or tap a room on the map.'
    : 'Pick where you are and where you want to go above — or just tap a room on the map.'

  return (
    <div className="im-root">
      <div className="im-bar">
        <label>
          📍 You are here
          <div className="im-fake-input">Registrar (Kiosk)</div>
        </label>
        <MapSearchBar value={query} onChange={setQuery} onSelect={pick} onClear={clear} />
        <button onClick={getDirections}>Get Directions</button>
        <button className="im-sec" onClick={clear}>Clear</button>
      </div>

      <div className="im-chips">
        {CHIPS.map(([id, lb]) => (
          <button key={id} className="im-chip" onClick={() => run(id)}>{lb}</button>
        ))}
      </div>

      <div className="im-tabs" role="group" aria-label="Floor">
        {FLOOR_ORDER.map(f => (
          <button key={f} aria-pressed={floor === f} onClick={() => setFloor(f)}>{floorName(f)}</button>
        ))}
      </div>

      <div className="im-wrap">
        <svg className="im-map" viewBox={VIEW_BOX} role="img" aria-label="Floor plan">
          <defs>
            {ALL_LAYOUTS.map(l => (
              <clipPath key={l.clipId} id={l.clipId}>
                <rect x={l.cx - l.w / 2} y={l.cy - l.h / 2} width={l.w} height={l.h} />
              </clipPath>
            ))}
          </defs>

          {FLOOR_ORDER.map(f => (
            <g key={f} style={floor === f ? undefined : { display: 'none' }}>
              <rect x={22} y={22} width={1406} height={318} fill="none" stroke="#1d2433" strokeWidth={2} />

              {BOX_RENDERS[f].map((b, i) => (
                <g key={i}>
                  <rect x={b.x1} y={25} width={b.x2 - b.x1} height={208} className="im-box" />
                  <LabelG l={b.layout} />
                </g>
              ))}

              {f === 2 && <path d="M755 440v50M743 454h24" stroke="#1d2433" strokeWidth={4} fill="none" />}

              {ROOM_RENDERS[f].map(rr => {
                const roomKey = `${f}:${rr.room[0]}`
                return (
                  <RoomRect
                    key={roomKey}
                    floor={f}
                    room={rr.room}
                    layout={rr.layout}
                    selected={f === floor && (roomKey === START || roomKey === dest)}
                    onPick={pick}
                  />
                )
              })}

              {FLOORS[f].P.filter(p => p[0] !== 'CH').map(p => (
                <text key={p[0]} x={p[2]} y={322} className="im-tag">{p[1]}</text>
              ))}

              {f === 2 && <text x={755} y={545} className="im-tag">CHAPEL</text>}
            </g>
          ))}

          <g>
            {routePaths.map((d, i) => (
              <path key={i} className="im-route" d={d} />
            ))}
            {showStart && <circle cx={startNode.x} cy={pinY(startNode)} r={11} fill="#2b9348" className="im-pin" />}
            {showDest && destNode && <circle cx={destNode.x} cy={pinY(destNode)} r={11} fill="#d6336c" className="im-pin" />}
          </g>
        </svg>
      </div>

      <div className="im-legend">
        {LEGEND.map(([c, t]) => (
          <span key={t}><i style={{ background: c }}></i>{t}</span>
        ))}
      </div>

      <div className="im-out">
        {steps.length > 0 ? (
          <>
            <b>🧭 Your Route</b>{' '}
            <span className="im-stat">· about {metres} m · ~{mins} min walk</span>
            <div className="im-curstep" dangerouslySetInnerHTML={{ __html: steps[stepIdx].t }} />
            <div className="im-stepbar">
              <button className="im-sec" disabled={stepIdx === 0} onClick={() => gotoStep(stepIdx - 1)}>⬅ Back</button>
              <span className="im-stepdot">Step {stepIdx + 1} of {steps.length}</span>
              <button disabled={stepIdx === steps.length - 1} onClick={() => gotoStep(stepIdx + 1)}>Next ➡</button>
            </div>
          </>
        ) : (
          <>
            <b>👋 Where to?</b>
            <p className="im-stat">{fallbackMsg}</p>
          </>
        )}
      </div>
    </div>
  )
}
