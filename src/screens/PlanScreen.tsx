import { AppShell } from '../components/AppShell';
import type { AppTab, GeneratedPlan } from '../types/app';

type PlanScreenProps = {
  plan: GeneratedPlan;
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
};

export function PlanScreen({ plan, activeTab, onTabChange }: PlanScreenProps) {
  return (
    <AppShell
      eyebrow="Planned Workouts"
      title="Plan"
      showTabs
      activeTab={activeTab}
      onTabChange={onTabChange}
    >
      <section className="content-stack">
        <div className="section-card">
          <p className="support-copy">
            A simple readable list of the plan. Workout days stay focused, rest days stay calm.
          </p>
          <div className="plan-summary-row">
            <div className="plan-summary-pill">
              <span className="summary-label">Goal</span>
              <strong>{plan.goal} reps</strong>
            </div>
            <div className="plan-summary-pill">
              <span className="summary-label">Length</span>
              <strong>{plan.estimatedDurationWeeks} weeks</strong>
            </div>
          </div>
        </div>
        <div className="preview-list">
          {plan.days.map((day) => (
            <article key={day.id} className="mini-row-card">
              <span className="mini-row-card__meta">
                Week {day.weekNumber} • Day {day.dayNumber}
              </span>
              <strong>{day.type === 'rest' ? 'Rest day' : day.summary}</strong>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
