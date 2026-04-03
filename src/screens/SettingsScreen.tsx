import { AppShell } from '../components/AppShell';
import { PrimaryButton } from '../components/PrimaryButton';
import type { AppTab } from '../types/app';

type SettingsScreenProps = {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onReset: () => void;
};

export function SettingsScreen({ activeTab, onTabChange, onReset }: SettingsScreenProps) {
  return (
    <AppShell
      eyebrow="Minimal Setup"
      title="Settings"
      showTabs
      activeTab={activeTab}
      onTabChange={onTabChange}
    >
      <section className="content-stack">
        <div className="section-card">
          <h2>Reset plan</h2>
          <p className="support-copy">
            Clear local progress and go back through setup. This is the only settings action in v1.
          </p>
          <PrimaryButton variant="secondary" onClick={onReset}>
            Reset Plan
          </PrimaryButton>
        </div>
      </section>
    </AppShell>
  );
}
