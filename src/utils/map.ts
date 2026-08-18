import type { Room } from '../types/map'

export function hexRGBA(h: string, a: number): string {
  return `rgba(${parseInt(h.slice(1, 3), 16)},${parseInt(h.slice(3, 5), 16)},${parseInt(h.slice(5, 7), 16)},${a})`
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export function getRooms(w: number, h: number): Room[] {
  const m = 40, g = 16
  const uW = w - m * 2, uH = h - m * 2
  const rW = (uW - g * 2) / 3, rH = (uH - g * 2) / 3
  return [
    { id: 'registrar', x: m, y: m, w: rW * 2 + g, h: rH, label: 'Registrar Office', color: '#B83B5E' },
    { id: 'cashier', x: m + rW * 2 + g * 2, y: m, w: rW, h: rH, label: 'Cashier', color: '#FF8F00' },
    { id: 'assessment', x: m, y: m + rH + g, w: rW, h: rH, label: 'Assessment', color: '#1565C0' },
    { id: 'guidance', x: m + rW + g, y: m + rH + g, w: rW, h: rH, label: 'Guidance Office', color: '#6A1B9A' },
    { id: 'osas', x: m + rW * 2 + g * 2, y: m + rH + g, w: rW, h: rH, label: 'OSAS', color: '#C62828' },
    { id: 'waiting', x: m, y: m + (rH + g) * 2, w: rW * 2 + g, h: rH, label: 'Waiting Area', color: '#78909C' },
    { id: 'entrance', x: m + rW * 2 + g * 2, y: m + (rH + g) * 2, w: rW, h: rH, label: 'Entrance / Exit', color: '#37474F' },
  ]
}

export function renderMap(canvas: HTMLCanvasElement, selected: string | null, hovered: string | null) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width, h = canvas.height
  ctx.clearRect(0, 0, w, h)
  const rooms = getRooms(w, h)
  rooms.forEach(r => {
    const isSel = selected === r.id, isHov = hovered === r.id
    const alpha = isSel ? 1 : isHov ? 0.9 : 0.8
    ctx.save()
    if (isSel) {
      ctx.shadowColor = 'rgba(0,0,0,0.3)'
      ctx.shadowBlur = 20
      ctx.shadowOffsetY = 4
    }
    ctx.fillStyle = hexRGBA(r.color, alpha)
    ctx.strokeStyle = isSel ? '#FFD700' : 'rgba(255,255,255,0.6)'
    ctx.lineWidth = isSel ? 4 : 2
    roundRect(ctx, r.x, r.y, r.w, r.h, 10)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
    if (isSel) {
      ctx.save()
      ctx.shadowColor = 'rgba(255,215,0,0.5)'
      ctx.shadowBlur = 30
      ctx.strokeStyle = '#FFD700'
      ctx.lineWidth = 4
      roundRect(ctx, r.x, r.y, r.w, r.h, 10)
      ctx.stroke()
      ctx.restore()
    }
    ctx.fillStyle = 'rgba(255,255,255,0.95)'
    ctx.font = `bold ${Math.min(r.h * 0.16, 18)}px 'Segoe UI',sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(r.label, r.x + r.w / 2, r.y + r.h / 2)
  })
  ctx.fillStyle = '#FFD700'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('★ You are here', 40, h - 20)
}
