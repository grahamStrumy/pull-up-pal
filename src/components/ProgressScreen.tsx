import type { MaxTestEntry } from '../types/program'

export function ProgressScreen({
  completedDays,
  skippedDays,
  currentStreak,
  completionPercentage,
  totalRepsCompleted,
  overdueCount,
  maxTests,
  maxTestDraft,
  onMaxTestDraftChange,
  onAddMaxTest,
}: {
  completedDays: number
  skippedDays: number
  currentStreak: number
  completionPercentage: number
  totalRepsCompleted: number
  overdueCount: number
  maxTests: MaxTestEntry[]
  maxTestDraft: { date: string; reps: string }
  onMaxTestDraftChange: (value: { date: string; reps: string }) => void
  onAddMaxTest: () => void
}) {
  return (
    <>
      <section className="stack-card">
        <div className="card-header">
          <div>
            <p className="section-label">Progress</p>
            <h2>Training summary</h2>
          </div>
          <span className="status-pill status-pill-neutral">{completionPercentage}% complete</span>
        </div>

        <div className="metric-grid">
          <article className="metric-card">
            <span className="metric-label">Completed days</span>
            <strong>{completedDays}</strong>
          </article>
          <article className="metric-card">
            <span className="metric-label">Skipped or missed</span>
            <strong>{skippedDays}</strong>
          </article>
          <article className="metric-card">
            <span className="metric-label">Current streak</span>
            <strong>{currentStreak}</strong>
          </article>
          <article className="metric-card">
            <span className="metric-label">Completion</span>
            <strong>{completionPercentage}%</strong>
          </article>
          <article className="metric-card">
            <span className="metric-label">Total reps</span>
            <strong>{totalRepsCompleted}</strong>
          </article>
          <article className="metric-card">
            <span className="metric-label">Overdue now</span>
            <strong>{overdueCount}</strong>
          </article>
        </div>
      </section>

      <section className="stack-card">
        <div className="card-header">
          <div>
            <p className="section-label">Max Test Log</p>
            <h2>Track your top set</h2>
          </div>
        </div>

        <div className="form-grid">
          <label className="field">
            <span className="field-label">Test date</span>
            <input
              type="date"
              value={maxTestDraft.date}
              onChange={(event) =>
                onMaxTestDraftChange({
                  ...maxTestDraft,
                  date: event.target.value,
                })
              }
            />
          </label>
          <label className="field">
            <span className="field-label">Max reps</span>
            <input
              type="number"
              min={1}
              max={50}
              value={maxTestDraft.reps}
              onChange={(event) =>
                onMaxTestDraftChange({
                  ...maxTestDraft,
                  reps: event.target.value,
                })
              }
            />
          </label>
        </div>
        <button className="primary-button" type="button" onClick={onAddMaxTest}>
          Add Max Test Result
        </button>

        <div className="week-list">
          {maxTests.length === 0 ? (
            <article className="week-item">
              <div>
                <p className="week-day">No tests yet</p>
                <p className="week-detail">
                  Log a fresh max set when you want a clean progress checkpoint.
                </p>
              </div>
            </article>
          ) : (
            maxTests.map((entry) => (
              <article className="week-item" key={entry.id}>
                <div>
                  <p className="week-day">{entry.date}</p>
                  <p className="week-detail">{entry.reps} pull-ups</p>
                </div>
                <span className="status-pill status-pill-neutral">Logged</span>
              </article>
            ))
          )}
        </div>
      </section>
    </>
  )
}
