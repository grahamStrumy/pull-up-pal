import type { Screen } from '../app/types'

export function BottomNav({
  screen,
  onNavigate,
}: {
  screen: Screen
  onNavigate: (screen: Screen) => void
}) {
  const sections: Array<{ label: string; screen: Screen }> = [
    { label: 'Today', screen: 'today' },
    { label: 'Workout', screen: 'workout' },
    { label: 'Program', screen: 'program' },
    { label: 'Progress', screen: 'progress' },
    { label: 'Settings', screen: 'settings' },
  ]

  return (
    <nav aria-label="Primary" className="bottom-nav">
      {sections.map((section) => (
        <button
          key={section.label}
          className={screen === section.screen ? 'nav-link nav-link-active' : 'nav-link'}
          type="button"
          onClick={() => onNavigate(section.screen)}
        >
          {section.label}
        </button>
      ))}
    </nav>
  )
}
