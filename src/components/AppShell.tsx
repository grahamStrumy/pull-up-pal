import type { ReactNode } from 'react';
import type { AppTab } from '../types/app';

type AppShellProps = {
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  showTabs?: boolean;
  activeTab?: AppTab;
  onTabChange?: (tab: AppTab) => void;
};

const tabs: { key: AppTab; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'plan', label: 'Plan' },
  { key: 'settings', label: 'Settings' }
];

export function AppShell({
  title,
  eyebrow,
  children,
  showTabs = false,
  activeTab = 'today',
  onTabChange
}: AppShellProps) {
  return (
    <div className="app-shell">
      <main className="screen-frame">
        {(eyebrow || title) && (
          <header className="screen-header">
            {eyebrow ? <span className="screen-eyebrow">{eyebrow}</span> : null}
            {title ? <h1>{title}</h1> : null}
          </header>
        )}
        {children}
      </main>
      {showTabs ? (
        <nav className="tab-bar" aria-label="Primary">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`tab-button${activeTab === tab.key ? ' is-active' : ''}`}
              onClick={() => onTabChange?.(tab.key)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
