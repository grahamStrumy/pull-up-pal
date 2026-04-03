import { AppShell } from '../components/AppShell';
import { PrimaryButton } from '../components/PrimaryButton';
import { getPreviewDays } from '../lib/plan';
import type { GeneratedPlan } from '../types/app';

type PlanPreviewScreenProps = {
  plan: GeneratedPlan;
  onStart: () => void;
  onBack: () => void;
};

export function PlanPreviewScreen({ plan, onStart, onBack }: PlanPreviewScreenProps) {
  const previewDays = getPreviewDays(plan);

  return (
    <AppShell eyebrow="Your Plan" title={`Train toward ${plan.goal} pull-ups`}>
      <section className="content-stack">
        <div className="hero-card hero-card--animated">
          <div className="hero-card__headline">
            <span className="hero-card__badge hero-card__badge--glow">Goal locked</span>
            <p className="support-copy">
              A clean progression built around consistent workout days and recovery.
            </p>
          </div>
          <div className="summary-row">
            <span className="summary-label">Estimated duration</span>
            <strong>{plan.estimatedDurationWeeks} weeks</strong>
          </div>
          <div className="summary-row">
            <span className="summary-label">First phase</span>
            <strong>{previewDays.length} workouts previewed</strong>
          </div>
        </div>

        <div className="section-card">
          <h2>Early workouts</h2>
          <div className="preview-list">
            {previewDays.map((day) => (
              <article key={day.id} className="mini-row-card">
                <span className="mini-row-card__meta">Day {day.dayNumber}</span>
                <strong>{day.summary}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>
      <footer className="screen-footer">
        <div className="footer-actions">
          <PrimaryButton variant="secondary" onClick={onBack}>
            Back
          </PrimaryButton>
          <PrimaryButton onClick={onStart}>Start Plan</PrimaryButton>
        </div>
      </footer>
    </AppShell>
  );
}
