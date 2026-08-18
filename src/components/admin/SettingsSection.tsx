import type { Dispatch, SetStateAction } from 'react'
import type { SettingsForm } from '../../types/queue'

interface SettingsSectionProps {
  active: boolean
  settingsForm: SettingsForm
  onSettingsFormChange: Dispatch<SetStateAction<SettingsForm>>
  onSave: () => void
  onReset: () => void
}

export default function SettingsSection({ active, settingsForm, onSettingsFormChange, onSave, onReset }: SettingsSectionProps) {
  return (
    <div className={`admin-screen${active ? ' active' : ''}`}>
      <div className="dashboard-card">
        <div className="dashboard-card-header"><h3>⚙️ System Settings</h3></div>
        <div className="dashboard-card-body">
          <div style={{ maxWidth: 500 }}>
            <div className="form-group">
              <label>Auto-call next queue</label>
              <select style={{ padding: '10px 14px', border: '2px solid var(--gray-200)', borderRadius: 8, fontSize: 14, fontFamily: 'var(--font)', width: '100%' }}
                value={settingsForm.autoCallNext ? 'true' : 'false'}
                onChange={e => onSettingsFormChange(f => ({ ...f, autoCallNext: e.target.value === 'true' }))}>
                <option value="true">Enabled</option><option value="false">Disabled</option>
              </select>
            </div>
            <div className="form-group">
              <label>Minutes per transaction</label>
              <input type="number" min={1} max={60}
                value={settingsForm.interval}
                onChange={e => onSettingsFormChange(f => ({ ...f, interval: e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0 }))}
                style={{ padding: '10px 14px', border: '2px solid var(--gray-200)', borderRadius: 8, fontSize: 14, fontFamily: 'var(--font)', width: '100%' }} />
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--gray-200)', margin: '16px 0' }} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={onSave}>Save</button>
              <button className="btn btn-danger" onClick={onReset}>Reset Data</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
