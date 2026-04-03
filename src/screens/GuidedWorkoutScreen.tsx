import { AppShell } from '../components/AppShell';
import { PrimaryButton } from '../components/PrimaryButton';
import type { LadderWorkout, WorkoutSession } from '../types/app';

type GuidedWorkoutScreenProps = {
  workout: LadderWorkout;
  session: WorkoutSession;
  onDoneSet: () => void;
  onSkipRest: () => void;
};

function formatSeconds(secondsRemaining: number) {
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  return `${minutes}:${`${seconds}`.padStart(2, '0')}`;
}

export function GuidedWorkoutScreen({
  workout,
  session,
  onDoneSet,
  onSkipRest
}: GuidedWorkoutScreenProps) {
  const currentReps = workout.sequence[session.stepIndex];
  const isRestPhase = session.phase !== 'work';
  const isLadderRest = session.phase === 'rest-ladder';

  return (
    <AppShell eyebrow="Workout In Progress" title="Today's workout">
      <section className="content-stack">
        <div className="hero-card hero-card--animated">
          <span className="hero-card__badge hero-card__badge--glow">
            Ladder {session.ladderIndex + 1} of {workout.ladders}
          </span>
          {!isRestPhase ? (
            <>
              <h2>Set {session.stepIndex + 1}</h2>
              <p className="hero-card__metric">
                {currentReps} {currentReps === 1 ? 'pull-up' : 'pull-ups'}
              </p>
              <p className="support-copy">
                Complete the reps, then tap done to move into the rest interval.
              </p>
            </>
          ) : (
            <>
              <h2>{isLadderRest ? 'Ladder rest' : 'Step rest'}</h2>
              <p className="hero-card__metric">{formatSeconds(session.secondsRemaining)}</p>
              <p className="support-copy">
                {isLadderRest
                  ? 'Take 120 seconds before the next ladder begins.'
                  : 'Take 90 seconds before the next step.'}
              </p>
            </>
          )}
        </div>

        <div className="section-card">
          <h2>{workout.ladders} ladders of {workout.sequence.join('-')}</h2>
          <p className="support-copy">
            Move one set at a time. The workout only completes after the final ladder is done.
          </p>
        </div>

        {!isRestPhase ? <PrimaryButton onClick={onDoneSet}>Done Set</PrimaryButton> : null}

        {isRestPhase ? (
          <button className="ghost-action" onClick={onSkipRest} type="button">
            Skip rest
          </button>
        ) : null}
      </section>
    </AppShell>
  );
}
