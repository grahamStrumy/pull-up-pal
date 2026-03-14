# PullUp Ladder

PullUp Ladder is a lightweight installable PWA for tracking an 8 week pull-up ladder progression plan.

It is built to be:

- mobile first
- offline capable
- local-first only
- simple to install on a phone home screen

There is no backend, no account system, and no cloud sync.

## Features

- 8 week ladder plan generation
- 5 training days and 2 rest days per week
- semi-random rest day placement with simple spacing rules
- Today view with training or rest-day context
- guided workout flow with one set at a time
- timestamp-based rest timer with skip and restart controls
- missed day recovery flow
- full program planner view
- progress summary and max test log
- local persistence for settings, plan state, and in-progress workouts
- installable PWA with offline support

## Tech Stack

- React
- TypeScript
- Vite
- `vite-plugin-pwa`
- `localStorage` for persistence
- Vitest for unit tests

## Project Structure

```text
src/
  app/          app-level types and format helpers
  components/   screen and shared UI components
  lib/          pure program logic, storage, and tests
  types/        shared TypeScript models
```

## Getting Started

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Run the unit tests:

```bash
npm test
```

## Installing On A Phone

1. Run a production build and serve it, or deploy the `dist/` output to static hosting.
2. Open the app in a mobile browser that supports installable PWAs.
3. Use the browser's `Add to Home Screen` or `Install App` action.
4. Launch it from the home screen for the standalone app experience.

The manifest and icon set are already wired for installability.

## Local Data

The app stores its state locally in the browser.

Saved data includes:

- program settings
- generated plan
- completion and skipped state
- in-progress workout session state
- selected screen state
- max test entries

Clearing browser storage for the site will remove saved progress.

## PWA Assets

PWA icons are generated from `src/assets/icon-master.png`.

Generated outputs live in:

- `public/icons/icon-192x192.png`
- `public/icons/icon-256x256.png`
- `public/icons/icon-384x384.png`
- `public/icons/icon-512x512.png`
- `public/icons/icon-1024x1024.png`

To regenerate them:

```bash
node ./scripts/generate-pwa-icons.mjs
```

## Tests

Current test coverage focuses on the highest-risk logic in `src/lib/program.ts`:

- 56 day plan generation
- weekly training and rest-day counts
- ladder template progression
- workout queue generation
- overdue training day detection
- move-forward recovery behavior
- progress summary calculations

## Notes

- Persistence is intentionally local-first and lightweight.
- The current app favors simplicity over a large state-management setup.
- The main app flow has been refactored into smaller screen components to keep future changes manageable.
