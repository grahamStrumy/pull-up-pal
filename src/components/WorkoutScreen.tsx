import {
  formatDateLabel,
  formatShortWeekday,
  getCurrentStreak,
  getNextTrainingDay,
  markDayStatus,
} from '../lib/program'
import { formatTimer } from '../app/formatters'
import { BottomNav } from './BottomNav'
import type { Screen } from '../app/types'
import type { ProgramState, WorkoutSessionState } from '../types/program'

export function WorkoutScreen({
  screen,
  todayDate,
  todayWorkoutLabel,
  workoutSession,
  activeSet,
  nextSet,
  restRemainingMs,
  programState,
  onBeginWorkout,
  onCompleteSet,
  onSkipRest,
  onRestartRest,
  onReturnToToday,
  onNavigate,
}: {
  screen: Screen
  todayDate: string
  todayWorkoutLabel: string
  workoutSession: WorkoutSessionState
  activeSet: WorkoutSessionState['queue'][number] | null
  nextSet: WorkoutSessionState['queue'][number] | null
  restRemainingMs: number
  programState: ProgramState
  onBeginWorkout: () => void
  onCompleteSet: () => void
  onSkipRest: () => void
  onRestartRest: () => void
  onReturnToToday: () => void
  onNavigate: (screen: Screen) => void
}) {
  const nextTrainingDay = getNextTrainingDay(programState.plan, workoutSession.dayId)

  return (
    <main className="app-shell app-shell-workout">
      <section className="workout-screen">
        <div className="card-header">
          <div>
            <p className="section-label">Workout</p>
            <h2>Today&apos;s workout</h2>
          </div>
          <button
            className="secondary-button secondary-button-compact"
            type="button"
            onClick={onReturnToToday}
          >
            Back
          </button>
        </div>

        <div className="workout-summary">
          <span className="status-pill status-pill-neutral">{todayWorkoutLabel}</span>
          <p className="workout-copy">{formatDateLabel(todayDate)}</p>
        </div>

        {workoutSession.status === 'ready' && activeSet ? (
          <section className="focus-card">
            <p className="section-label">Ready to start</p>
            <h1 className="focus-reps">{activeSet.reps} pull-up</h1>
            <p className="focus-copy">
              You&apos;ll work through one set at a time. Tap only after you finish each
              set.
            </p>
            <button
              className="primary-button primary-button-large"
              type="button"
              onClick={onBeginWorkout}
            >
              Start Workout
            </button>
          </section>
        ) : null}

        {workoutSession.status === 'active' && activeSet ? (
          <section className="focus-card">
            <p className="section-label">
              Ladder {activeSet.ladderIndex + 1} | Step {activeSet.stepIndex + 1}
            </p>
            <h1 className="focus-reps">
              {activeSet.reps} {activeSet.reps === 1 ? 'pull-up' : 'pull-ups'}
            </h1>
            <div className="support-panel">
              <div>
                <span className="metric-label">Total reps done</span>
                <strong>{workoutSession.repsCompleted}</strong>
              </div>
              <div>
                <span className="metric-label">Up next</span>
                <strong>{nextSet ? `${nextSet.reps} reps` : 'Workout complete'}</strong>
              </div>
            </div>
            <button
              className="primary-button primary-button-large"
              type="button"
              onClick={onCompleteSet}
            >
              Done Set
            </button>
          </section>
        ) : null}

        {workoutSession.status === 'resting' ? (
          <section className="focus-card">
            <p className="section-label">
              {workoutSession.restType === 'ladder' ? 'Ladder rest' : 'Step rest'}
            </p>
            <h1 className="focus-timer">{formatTimer(restRemainingMs)}</h1>
            <p className="focus-copy">
              {workoutSession.restType === 'ladder'
                ? 'Take a full reset before starting the next ladder.'
                : 'Shake out and get ready for the next step.'}
            </p>
            <div className="support-panel">
              <div>
                <span className="metric-label">Next set</span>
                <strong>{activeSet ? `${activeSet.reps} reps` : 'Done'}</strong>
              </div>
              <div>
                <span className="metric-label">Total reps done</span>
                <strong>{workoutSession.repsCompleted}</strong>
              </div>
            </div>
            <div className="button-row">
              <button className="primary-button" type="button" onClick={onSkipRest}>
                Skip Rest
              </button>
              <button className="secondary-button" type="button" onClick={onRestartRest}>
                Restart Timer
              </button>
            </div>
          </section>
        ) : null}

        {workoutSession.status === 'complete' ? (
          <section className="focus-card">
            <p className="section-label">Workout complete</p>
            <h1 className="focus-reps">{workoutSession.repsCompleted} total reps</h1>
            <div className="support-panel">
              <div>
                <span className="metric-label">Current streak</span>
                <strong>
                  {
                    getCurrentStreak(
                      markDayStatus(programState.plan, workoutSession.dayId, 'complete'),
                    )
                  }
                </strong>
              </div>
              <div>
                <span className="metric-label">Next training day</span>
                <strong>
                  {nextTrainingDay
                    ? `${formatShortWeekday(nextTrainingDay.date)} ${nextTrainingDay.date}`
                    : 'Program complete'}
                </strong>
              </div>
            </div>
            <button
              className="primary-button primary-button-large"
              type="button"
              onClick={onReturnToToday}
            >
              Return To Today
            </button>
          </section>
        ) : null}
      </section>

      <BottomNav screen={screen} onNavigate={onNavigate} />
    </main>
  )
}
