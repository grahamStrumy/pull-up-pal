# PROJECT_CONTEXT.md

## Project Overview

This project is a minimal PWA app called **PullUp Pal**.

The goal is to help a user improve their pull-ups through a simple generated plan and a clean daily workout flow.

This is a **v1 build** and should stay intentionally minimal.

Tech stack:
- React
- Vite
- PWA setup
- local-first persistence only
- no backend
- no accounts
- no cloud sync

---

## Core Product Direction

The app should feel:
- simple
- focused
- clean
- mobile-first
- easy to use daily
- slightly premium

It should NOT feel like a broad fitness platform.

Avoid feature bloat.

---

## Locked v1 Feature Set

### 1. Initial Setup / Onboarding
On first opening the app, the user completes a short setup flow.

Questions:
1. **How many pull-ups can you do?**
2. **How many pull-ups do you want to do?**

After setup, the app generates:
- a workout plan
- estimated duration

Then it shows a plan preview screen before the user starts.

### 2. Main Daily Screen
After setup, opening the app should take the user directly to the daily workout screen.

This screen should show:
- minimal progress indicator such as **Week X of Y** or **Day X of Y**
- today’s workout
- whether today has already been completed
- if not completed, a **Start Today’s Pull-Ups** button

### 3. Completed State
If the workout for today has already been completed, the daily screen should clearly show that it is done.

Example:
- check mark
- “Completed today”
- short supportive message

### 4. Rest Day Handling
If today is a rest day, the daily screen should show:
- rest day message
- no start workout button
- optional preview of next workout

### 5. Missed Workout Handling
Keep this simple.

If the user misses a lot of workouts, do NOT force a full restart.

Instead:
- step the user back to their last successful workout level
- show a supportive message
- continue from there

This should feel helpful, not punishing.

### 6. Plan Screen
A separate **Plan** screen should show the planned workouts.

Keep it simple and readable.
Do not make it a complex calendar.

### 7. Settings Screen
A **Settings** screen should include:
- reset plan

Keep settings minimal for v1.

---

## UX Rules

### Keep v1 Minimal
Do NOT add:
- social features
- backend
- accounts
- cloud sync
- achievements
- graphs
- notifications
- subscriptions
- complex stats dashboards

### Daily Use Should Be Very Simple
The ideal daily flow is:
- open app
- see today’s workout
- press button
- complete workout
- see completed state

### Missed Session Logic
If a workout has been missed and the current progression is too difficult:
- fall back to the last successfully completed workout level
- do not punish the user
- do not force a total restart

---

## Visual Direction

The app should use a dark, bold, minimal appearance.

Suggested style:
- dark charcoal / near-black background
- maroon accent
- orange glow / highlight
- large readable text
- large tap-friendly buttons
- simple card-based layout
- minimal clutter
- strong central focus on the main question or workout

Suggested palette:
- Background: `#0F0F12`
- Card: `#17171C`
- Border: `#26262E`
- Primary text: `#F3F3F5`
- Secondary text: `#A7A7B3`
- Maroon accent: `#7A0F1E`
- Orange accent: `#FF6A00`

Style tone:
- focused
- strong
- clean
- slightly premium
- not playful
- not overly clinical

---

## Layout Principles

### General Layout
- mobile-first
- single-column layout
- generous spacing
- one main card or focal section per screen
- side padding around 20px
- clean screen hierarchy
- avoid cluttered layouts

### Buttons
Buttons should be:
- wide
- large
- thumb-friendly
- rounded
- obvious

Primary button style:
- full width
- strong maroon to orange gradient or strong branded fill
- white text
- subtle glow or lift

Secondary button style:
- dark fill
- subtle border
- muted but readable

### Typography
Use:
- bold main headings
- large workout numbers
- clear readable labels
- muted supporting text

The app should visually communicate:
**“Here is today’s task.”**

---

## Visual Polish Rules

These are part of the intended appearance and should be included if practical without adding unnecessary complexity.

### Onboarding Option Tap Polish
When the user taps a selectable option during onboarding:
- slight scale animation, around `0.97 -> 1`
- subtle glow appears on selected option
- selection state should feel responsive and polished

### Plan Preview Screen Entrance
When the plan preview screen loads:
- slight fade-in
- main preview card appears with subtle upward motion

### General Motion Guidance
Keep animations minimal and tasteful:
- soft fades
- subtle lifts
- small scale feedback on taps
- no flashy or excessive motion

### Card Feel
Cards should feel slightly elevated through:
- subtle shadow and/or glow
- strong contrast from background
- rounded corners

---

## Locked Screen Structure

### Onboarding Screen 1
Question:
**How many pull-ups can you do?**

Answer as selectable options.

Suggested options:
- 0
- 1–2
- 3–5
- 6–10
- 11+

Screen structure:
- small app title at top
- large centered question
- vertically stacked option buttons
- continue button at bottom
- small step indicator such as **Step 1 of 2**

### Onboarding Screen 2
Question:
**How many pull-ups do you want to do?**

Use preset options plus optional custom input if needed.

Suggested presets:
- 5
- 8
- 10
- 12
- 15
- 20
- Custom

Screen structure:
- same style as screen 1
- small step indicator such as **Step 2 of 2**
- guidance text like:
  **Most people train toward 8–20 pull-ups.**

If custom input is included, keep it simple and visually consistent.

### Plan Preview Screen
After onboarding, show:
- generated goal
- estimated duration
- preview of early workouts
- button to start the plan

Important:
- this is a preview, not a full calendar
- do not overload the screen
- make it feel personalised

### Daily Workout Screen
Main app screen after setup.

Shows:
- progress indicator
- today’s workout
- completed state OR start button
- rest day state when appropriate

This should be the most important daily-use screen.

### Plan Screen
Simple planned workout list.

### Settings Screen
Only essential settings for v1.

---

## Recommended Visual Details By Screen

### Onboarding Screens
- centered question
- stacked selection cards
- selected card uses maroon accent and subtle orange glow
- continue button disabled until valid selection is made
- slight tap animation on selection

### Plan Preview Screen
- top heading such as **Your Plan**
- goal and duration summary
- one main workout preview card
- strong start button
- subtle entrance motion on load

### Daily Workout Screen
- clear progress label at top such as **Week 2 of 8**
- one main workout card
- large central workout display
- one bold CTA button
- completed state should feel satisfying but still minimal
- rest day view should be clear and calm

---

## Development Approach

Build in this order:
1. App shell and routing/navigation
2. Onboarding flow
3. Plan preview screen
4. Daily workout screen
5. Plan screen
6. Settings screen
7. Local persistence
8. Program generation logic
9. Missed-workout fallback logic
10. UI polish and motion polish

---

## Important Build Rules

- Keep code clean and readable
- Prefer simple solutions
- Do not overengineer
- Do not expand scope
- Use small controlled changes
- Preserve the minimal v1 vision
- Follow this file when making product or architecture decisions