import { AppShell } from '../components/AppShell';
import { OptionCard } from '../components/OptionCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { goalPresets } from '../lib/constants';

type OnboardingGoalScreenProps = {
  goal: number | null;
  customGoal: string;
  onSelectGoal: (goal: number) => void;
  onCustomGoalChange: (value: string) => void;
  onContinue: () => void;
  onBack: () => void;
};

export function OnboardingGoalScreen({
  goal,
  customGoal,
  onSelectGoal,
  onCustomGoalChange,
  onContinue,
  onBack
}: OnboardingGoalScreenProps) {
  const customSelected = goal !== null && !goalPresets.includes(goal);

  return (
    <AppShell eyebrow="PullUp Pal" title="How many pull-ups do you want to do?">
      <section className="content-stack">
        <p className="support-copy">Most people train toward 8-20 pull-ups.</p>
        <div className="option-grid">
          {goalPresets.map((preset) => (
            <OptionCard
              key={preset}
              label={`${preset}`}
              selected={goal === preset}
              onClick={() => onSelectGoal(preset)}
            />
          ))}
          <div className={`custom-goal-card${customSelected ? ' is-selected' : ''}`}>
            <label htmlFor="custom-goal" className="custom-goal-card__label">
              Custom
            </label>
            <input
              id="custom-goal"
              inputMode="numeric"
              min="1"
              max="50"
              placeholder="Enter goal"
              value={customGoal}
              onChange={(event) => onCustomGoalChange(event.target.value)}
            />
          </div>
        </div>
      </section>
      <footer className="screen-footer">
        <div className="footer-actions">
          <PrimaryButton variant="secondary" onClick={onBack}>
            Back
          </PrimaryButton>
          <PrimaryButton disabled={!goal} onClick={onContinue}>
            Preview Plan
          </PrimaryButton>
        </div>
        <span className="step-indicator">Step 2 of 2</span>
      </footer>
    </AppShell>
  );
}
