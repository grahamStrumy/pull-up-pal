import {
  formatDateLabel,
  formatShortWeekday,
  formatWorkoutLabel,
  getCompletionLabel,
} from '../lib/program'
import type { ProgramDay, ProgramSettings } from '../types/program'

export function TodayScreen({
  settings,
  today,
  weekPreview,
  snapshot,
  currentStreak,
  recoveryDay,
  onStartWorkout,
  onDoMissedWorkoutToday,
  onSkipMissedWorkout,
  onShiftProgramForward,
}: {
  settings: ProgramSettings
  today: ProgramDay
  weekPreview: ProgramDay[]
  snapshot: {
    daysRemaining: number
    completedSessions: number
    nextTrainingDay: ProgramDay | null
    overdueTrainingDays: ProgramDay[]
  }
  currentStreak: number
  recoveryDay: ProgramDay | null
  onStartWorkout: () => void
  onDoMissedWorkoutToday: () => void
  onSkipMissedWorkout: () => void
  onShiftProgramForward: () => void
}) {
  return (
    <>
      <section className="hero-panel">
        <p className="eyebrow">PullUp Ladder</p>
        <h1>Dial in your starting point and let the 8 week ladder plan take shape.</h1>
        <p className="hero-copy">
          The core plan, workout flow, and local persistence are in place. You
          can move between today, the full planner, progress, and settings
          without losing state.
        </p>

        <div className="hero-actions">
          <div className="inline-metrics">
            <div>
              <span className="metric-label">Start</span>
              <strong>{settings.startDate}</strong>
            </div>
            <div>
              <span className="metric-label">Current max</span>
              <strong>{settings.currentMax}</strong>
            </div>
            <div>
              <span className="metric-label">Target</span>
              <strong>{settings.targetMax}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="today-card">
        <div className="card-header">
          <div>
            <p className="section-label">Today</p>
            <h2>{formatDateLabel(today.date)}</h2>
          </div>
          <span
            className={
              today.type === 'training'
                ? 'status-pill status-pill-train'
                : 'status-pill status-pill-rest'
            }
          >
            {today.type === 'training' ? 'Training day' : 'Rest day'}
          </span>
        </div>

        <div className="metric-grid">
          <article className="metric-card">
            <span className="metric-label">Current week</span>
            <strong>Week {today.week}</strong>
          </article>
          <article className="metric-card">
            <span className="metric-label">Days left</span>
            <strong>{snapshot.daysRemaining}</strong>
          </article>
          <article className="metric-card">
            <span className="metric-label">Completed</span>
            <strong>{snapshot.completedSessions} sessions</strong>
          </article>
          <article className="metric-card">
            <span className="metric-label">Overdue</span>
            <strong>{snapshot.overdueTrainingDays.length} workouts</strong>
          </article>
        </div>

        {recoveryDay ? (
          <article className="recovery-card">
            <div>
              <p className="section-label">Missed Day Recovery</p>
              <h3>{formatDateLabel(recoveryDay.date)}</h3>
            </div>
            <p className="workout-copy">
              You have a missed training day waiting. Pick the simplest way to
              get back on track today.
            </p>
            <div className="support-panel">
              <div>
                <span className="metric-label">Missed workout</span>
                <strong>{formatWorkoutLabel(recoveryDay.workout)}</strong>
              </div>
              <div>
                <span className="metric-label">Overdue count</span>
                <strong>{snapshot.overdueTrainingDays.length}</strong>
              </div>
            </div>
            <div className="button-stack">
              <button className="primary-button" type="button" onClick={onDoMissedWorkoutToday}>
                Do Missed Workout Today
              </button>
              <button className="secondary-button" type="button" onClick={onSkipMissedWorkout}>
                Skip And Continue
              </button>
              <button className="secondary-button" type="button" onClick={onShiftProgramForward}>
                Move Program Forward
              </button>
            </div>
          </article>
        ) : null}

        <article className="workout-card">
          <div>
            <p className="section-label">
              {today.type === 'training' ? "Today's ladder" : 'Recovery plan'}
            </p>
            <h3>{formatWorkoutLabel(today.workout)}</h3>
          </div>

          <p className="workout-copy">
            {today.type === 'training'
              ? `Today is a working day. You will complete ${today.workout?.totalReps ?? 0} total reps with big single-tap set confirmations.`
              : snapshot.nextTrainingDay
                ? `Rest day. Recover well and come back on ${formatDateLabel(snapshot.nextTrainingDay.date)}.`
                : 'Rest day. You have completed the current plan.'}
          </p>

          <div className="support-panel">
            <div>
              <span className="metric-label">Status</span>
              <strong>{getCompletionLabel(today.status)}</strong>
            </div>
            <div>
              <span className="metric-label">Current streak</span>
              <strong>{currentStreak}</strong>
            </div>
          </div>

          <button className="primary-button" type="button" onClick={onStartWorkout}>
            {recoveryDay
              ? 'Recovery Options Above'
              : today.type === 'training'
                ? 'Start Workout'
                : snapshot.nextTrainingDay
                  ? `Next: ${formatShortWeekday(snapshot.nextTrainingDay.date)}`
                  : 'Program Complete'}
          </button>
        </article>
      </section>

      <section className="week-card">
        <div className="card-header">
          <div>
            <p className="section-label">Week Preview</p>
            <h2>Week {today.week} training rhythm</h2>
          </div>
          <span className="status-pill status-pill-neutral">5 train / 2 rest</span>
        </div>

        <div className="week-list">
          {weekPreview.map((day) => (
            <article className="week-item" key={day.id}>
              <div>
                <p className="week-day">
                  {formatShortWeekday(day.date)} | {day.date}
                </p>
                <p className="week-detail">{formatWorkoutLabel(day.workout)}</p>
              </div>
              <div className="week-item-meta">
                <span
                  className={
                    day.type === 'training'
                      ? 'status-pill status-pill-train'
                      : 'status-pill status-pill-rest'
                  }
                >
                  {day.type === 'training' ? 'Train' : 'Rest'}
                </span>
                <span className="week-status">{getCompletionLabel(day.status)}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
