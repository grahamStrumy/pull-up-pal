import { AppShell } from '../components/AppShell';
import { OptionCard } from '../components/OptionCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { baselineOptions } from '../lib/constants';
import type { BaselineOption } from '../types/app';

type OnboardingBaselineScreenProps = {
  value: BaselineOption | null;
  onChange: (value: BaselineOption) => void;
  onContinue: () => void;
};

export function OnboardingBaselineScreen({
  value,
  onChange,
  onContinue
}: OnboardingBaselineScreenProps) {
  return (
    <AppShell eyebrow="PullUp Pal" title="How many pull-ups can you do?">
      <section className="content-stack">
        <p className="support-copy">
          Pick the option that feels true right now. We will keep the plan simple and focused.
        </p>
        <div className="option-list">
          {baselineOptions.map((option) => (
            <OptionCard
              key={option.value}
              label={option.label}
              selected={value === option.value}
              onClick={() => onChange(option.value)}
            />
          ))}
        </div>
      </section>
      <footer className="screen-footer">
        <span className="step-indicator">Step 1 of 2</span>
        <PrimaryButton disabled={!value} onClick={onContinue}>
          Continue
        </PrimaryButton>
      </footer>
    </AppShell>
  );
}
