import type { ProgramSettings } from '../types/program'

export function SettingsScreen({
  draftSettings,
  activeSettings,
  onUpdateSettings,
  onApplySettings,
  onResetProgress,
}: {
  draftSettings: ProgramSettings
  activeSettings: ProgramSettings
  onUpdateSettings: <K extends keyof ProgramSettings>(
    key: K,
    value: ProgramSettings[K],
  ) => void
  onApplySettings: () => void
  onResetProgress: () => void
}) {
  return (
    <>
      <section className="setup-card">
        <div className="card-header">
          <div>
            <p className="section-label">Settings</p>
            <h2>Program controls</h2>
          </div>
          <span className="status-pill status-pill-neutral">Saved locally</span>
        </div>

        <div className="form-grid">
          <label className="field">
            <span className="field-label">Start date</span>
            <input
              type="date"
              value={draftSettings.startDate}
              onChange={(event) => onUpdateSettings('startDate', event.target.value)}
            />
          </label>

          <label className="field">
            <span className="field-label">Current max pull-ups</span>
            <input
              type="number"
              min={1}
              max={50}
              value={draftSettings.currentMax}
              onChange={(event) =>
                onUpdateSettings('currentMax', Number(event.target.value || 1))
              }
            />
          </label>

          <label className="field">
            <span className="field-label">Target pull-ups</span>
            <input
              type="number"
              min={1}
              max={50}
              value={draftSettings.targetMax}
              onChange={(event) =>
                onUpdateSettings('targetMax', Number(event.target.value || 1))
              }
            />
          </label>
        </div>

        <button
          className={
            draftSettings.useRandomRestDays
              ? 'toggle-chip toggle-chip-active'
              : 'toggle-chip'
          }
          type="button"
          onClick={() =>
            onUpdateSettings('useRandomRestDays', !draftSettings.useRandomRestDays)
          }
        >
          {draftSettings.useRandomRestDays
            ? 'Semi-random rest days enabled'
            : 'Fixed rest days enabled'}
        </button>

        <div className="button-row">
          <button className="primary-button" type="button" onClick={onApplySettings}>
            Regenerate Plan
          </button>
          <button className="secondary-button" type="button" onClick={onResetProgress}>
            Reset Progress
          </button>
        </div>
      </section>

      <section className="stack-card">
        <div className="card-header">
          <div>
            <p className="section-label">Current Setup</p>
            <h2>Active program settings</h2>
          </div>
        </div>

        <div className="metric-grid">
          <article className="metric-card">
            <span className="metric-label">Start date</span>
            <strong>{activeSettings.startDate}</strong>
          </article>
          <article className="metric-card">
            <span className="metric-label">Current max</span>
            <strong>{activeSettings.currentMax}</strong>
          </article>
          <article className="metric-card">
            <span className="metric-label">Target</span>
            <strong>{activeSettings.targetMax}</strong>
          </article>
        </div>
      </section>
    </>
  )
}
