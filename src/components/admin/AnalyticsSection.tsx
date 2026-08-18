import { CONFIG } from '../../config'
import type { DB } from '../../types/queue'
import { getDailyStats7, getServiceStats } from '../../utils/queue'

interface AnalyticsSectionProps {
  active: boolean
  db: DB
}

export default function AnalyticsSection({ active, db }: AnalyticsSectionProps) {
  return (
    <div className={`admin-screen${active ? ' active' : ''}`}>
      {(function() {
        const ds30 = getDailyStats7(db)
        const t30 = ds30.reduce((s, d) => s + d.total, 0)
        const c30 = ds30.reduce((s, d) => s + d.completed, 0)
        const avg = t30 ? Math.round(t30 / 7) : 0
        const rate = t30 ? Math.round((c30 / t30) * 100) : 0
        return <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12 }}>
            <div style={{ background: 'var(--gray-50)', padding: 16, borderRadius: 8, textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 800, color: 'var(--ceu-pink)' }}>{t30}</div><div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Total (7d)</div></div>
            <div style={{ background: 'var(--success-light)', padding: 16, borderRadius: 8, textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 800, color: 'var(--success)' }}>{c30}</div><div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Completed</div></div>
            <div style={{ background: 'var(--info-light)', padding: 16, borderRadius: 8, textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 800, color: 'var(--info)' }}>{avg}</div><div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Avg/Day</div></div>
            <div style={{ background: 'var(--warning-light)', padding: 16, borderRadius: 8, textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 800, color: '#856404' }}>{rate}%</div><div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Rate</div></div>
          </div>
        </div>
      })()}
      <div className="analytics-grid">
        <div className="analytics-card full">
          <h3>Daily Transactions (7 Days)</h3>
          <div className="chart-placeholder">
            {(() => {
              const ds = getDailyStats7(db)
              const mx = Math.max(...ds.map(s => s.total), 1)
              return ds.map((s, i) => {
                const h = Math.max((s.total / mx) * 100, 4)
                return <div key={i} className="chart-bar" style={{ height: `${h}%` }}><span className="bar-value">{s.total}</span><span className="bar-label">{s.label}</span></div>
              })
            })()}
          </div>
        </div>
        <div className="analytics-card">
          <h3>Service Distribution</h3>
          <div>
            {(() => {
              const svcs = getServiceStats(db)
              const entries = Object.entries(svcs)
              const total = entries.reduce((s, c) => s + c[1], 0)
              const colors = ['#B83B5E', '#D4617A', '#E8A0B4', '#8E1D40', '#F8B8C8']
              return entries.map((e, i) => {
                const pct = total ? Math.round((e[1] / total) * 100) : 0
                return <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>{e[0]}</span><span style={{ color: 'var(--gray-500)' }}>{e[1]} ({pct}%)</span></div>
                  <div style={{ height: 8, background: 'var(--gray-200)', borderRadius: 4, overflow: 'hidden' }}><div style={{ height: '100%', width: `${pct}%`, background: colors[i % colors.length], borderRadius: 4 }}></div></div>
                </div>
              })
            })()}
          </div>
        </div>
        <div className="analytics-card">
          <h3>System Info</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}><span style={{ color: 'var(--gray-500)' }}>Version</span><span style={{ fontWeight: 600 }}>{CONFIG.version}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}><span style={{ color: 'var(--gray-500)' }}>University</span><span style={{ fontWeight: 600 }}>{CONFIG.university}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}><span style={{ color: 'var(--gray-500)' }}>Counters</span><span style={{ fontWeight: 600 }}>{CONFIG.counters.length}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}><span style={{ color: 'var(--gray-500)' }}>Total Queue</span><span style={{ fontWeight: 600 }}>{db.queue.length}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}><span style={{ color: 'var(--gray-500)' }}>Status</span><span style={{ fontWeight: 600, color: 'var(--success)' }}>● Active</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
