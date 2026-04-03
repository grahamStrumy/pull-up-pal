import { AppShell } from '../components/AppShell';
import { PrimaryButton } from '../components/PrimaryButton';
import { getCurrentPlanDay } from '../lib/plan';
import type { AppTab, GeneratedPlan } from '../types/app';

type DailyWorkoutScreenProps = {
  plan: GeneratedPlan;
  currentDayIndex: number;
  supportiveMessage: string | null;
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onStartWorkout: () => void;
  onSkipDay: () => void;
};

export function DailyWorkoutScreen({
  plan,
  currentDayIndex,
  supportiveMessage,
  activeTab,
  onTabChange,
  onStartWorkout,
  onSkipDay
}: DailyWorkoutScreenProps) {
  const today = getCurrentPlanDay(plan, currentDayIndex);
  const progressLabel = `Week ${today.weekNumber} of ${plan.totalWeeks}`;
  const isFinalDay = currentDayIndex === plan.totalDays - 1;

  return (
    <AppShell
      eyebrow={progressLabel}
      title={today.type === 'rest' ? 'Recover today' : "Today's workout"}
      showTabs
      activeTab={activeTab}
      onTabChange={onTabChange}
    >
      <section className="content-stack">
        <div className={`hero-card${today.completed ? ' hero-card--completed' : ''}`}>
          <span className="hero-card__badge hero-card__badge--glow">
            Day {today.dayNumber} of {plan.totalDays}
          </span>
          {today.type === 'rest' ? (
            <>
              <h2>Rest day</h2>
              <p className="hero-card__metric hero-card__metric--rest">Reset</p>
              <p className="support-copy">
                Let today be light. Recovery is part of the plan, not time off the plan.
              </p>
            </>
          ) : today.completed ? (
            <>
              <h2>Completed today</h2>
              <p className="hero-card__metric">Done</p>
              <p className="support-copy">
                Nice work. {isFinalDay ? 'You reached the end of this plan.' : 'Come back tomorrow and keep building.'}
              </p>
            </>
          ) : (
            <>
              <h2>{today.summary}</h2>
              <p className="hero-card__metric">{today.ladder?.sequence.join('-')}</p>
              <p className="support-copy">
                Ladder the reps smoothly and stay controlled between sets.
              </p>
            </>
          )}
        </div>

        {supportiveMessage ? <div className="support-banner">{supportiveMessage}</div> : null}

        {today.type === 'workout' && !today.completed ? (
          <div className="footer-actions footer-actions--stacked">
            <PrimaryButton onClick={onStartWorkout}>Start Today's Pull-Ups</PrimaryButton>
            <PrimaryButton variant="secondary" onClick={onSkipDay}>
              Missed today
            </PrimaryButton>
          </div>
        ) : null}

        {today.type === 'rest' ? (
          <div className="section-card">
            <h2>Up next</h2>
            <p className="support-copy">
              Check back tomorrow for the next ladder session.
            </p>
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}
