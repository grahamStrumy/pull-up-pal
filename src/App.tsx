import { useEffect, useState } from 'react'
import './App.css'
import {
  createProgramState,
  createWorkoutSession,
  getCurrentStreak,
  getOverdueTrainingDays,
  getProgressStats,
  getTodaySnapshot,
  getWeekPreview,
  getWeeks,
  markDayStatus,
  moveProgramForward,
  resetProgramProgress,
} from './lib/program'
import { loadAppState, saveAppState } from './lib/storage'
import { notifyRestFinished } from './app/formatters'
import type { Screen } from './app/types'
import { BottomNav } from './components/BottomNav'
import { ProgramScreen } from './components/ProgramScreen'
import { ProgressScreen } from './components/ProgressScreen'
import { SettingsScreen } from './components/SettingsScreen'
import { TodayScreen } from './components/TodayScreen'
import { WorkoutScreen } from './components/WorkoutScreen'
import type {
  MaxTestEntry,
  ProgramDay,
  ProgramSettings,
  ProgramState,
  WorkoutSessionState,
} from './types/program'

const STEP_REST_MS = 90_000
const LADDER_REST_MS = 120_000

function App() {
  const [initialAppState] = useState(loadAppState)
  const [screen, setScreen] = useState<Screen>(initialAppState.screen)
  const [draftSettings, setDraftSettings] = useState<ProgramSettings>(
    initialAppState.programState.settings,
  )
  const [programState, setProgramState] = useState<ProgramState>(initialAppState.programState)
  const [workoutSession, setWorkoutSession] = useState<WorkoutSessionState | null>(
    initialAppState.workoutSession,
  )
  const [clockNow, setClockNow] = useState(() => Date.now())
  const [maxTestDraft, setMaxTestDraft] = useState({
    date: new Date().toISOString().slice(0, 10),
    reps: `${initialAppState.programState.settings.currentMax}`,
  })

  const snapshot = getTodaySnapshot(programState)
  const today = snapshot.today
  const recoveryDay = snapshot.recoveryDay
  const weekPreview = getWeekPreview(programState.plan, today.week)
  const currentStreak = getCurrentStreak(programState.plan)
  const progressStats = getProgressStats(programState.plan)
  const programWeeks = getWeeks(programState.plan)
  const activeSet = workoutSession?.queue[workoutSession.currentSetIndex] ?? null
  const nextSet =
    workoutSession && activeSet
      ? workoutSession.queue[workoutSession.currentSetIndex + 1] ?? null
      : null
  const restRemainingMs =
    workoutSession?.status === 'resting' && workoutSession.restEndsAt
      ? Math.max(workoutSession.restEndsAt - clockNow, 0)
      : 0

  useEffect(() => {
    if (workoutSession?.status !== 'resting') {
      return
    }

    const intervalId = window.setInterval(() => {
      setClockNow(Date.now())
    }, 250)

    return () => window.clearInterval(intervalId)
  }, [workoutSession?.status])

  useEffect(() => {
    if (
      workoutSession?.status !== 'resting' ||
      !workoutSession.restEndsAt ||
      Date.now() < workoutSession.restEndsAt
    ) {
      return
    }

    notifyRestFinished()
    setWorkoutSession((current) =>
      current
        ? {
            ...current,
            status: 'active',
            restType: null,
            restEndsAt: null,
          }
        : current,
    )
  }, [clockNow, workoutSession])

  useEffect(() => {
    saveAppState({
      programState,
      workoutSession,
      screen,
    })
  }, [programState, screen, workoutSession])

  function updateSettings<K extends keyof ProgramSettings>(
    key: K,
    value: ProgramSettings[K],
  ) {
    setDraftSettings((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function applySettings() {
    setProgramState(createProgramState(draftSettings))
    setWorkoutSession(null)
    setScreen('today')
    setMaxTestDraft((current) => ({
      ...current,
      reps: `${draftSettings.currentMax}`,
    }))
  }

  function resetProgress() {
    setProgramState((current) => resetProgramProgress(current))
    setWorkoutSession(null)
    setScreen('today')
  }

  function startWorkoutFlow(targetDay: ProgramDay = today) {
    const session = createWorkoutSession(targetDay)

    if (!session) {
      return
    }

    setWorkoutSession(session)
    setScreen('workout')
  }

  function beginWorkout() {
    setWorkoutSession((current) =>
      current
        ? {
            ...current,
            status: 'active',
          }
        : current,
    )
  }

  function completeSet() {
    setWorkoutSession((current) => {
      if (!current) {
        return current
      }

      const currentSet = current.queue[current.currentSetIndex]
      const repsCompleted = current.repsCompleted + currentSet.reps

      if (currentSet.isLastOverall) {
        setProgramState((existing) => ({
          ...existing,
          plan: markDayStatus(existing.plan, current.dayId, 'complete'),
        }))

        return {
          ...current,
          status: 'complete',
          repsCompleted,
          restType: null,
          restEndsAt: null,
        }
      }

      const restType = currentSet.isLastInLadder ? 'ladder' : 'step'
      const duration = restType === 'ladder' ? LADDER_REST_MS : STEP_REST_MS

      return {
        ...current,
        status: 'resting',
        currentSetIndex: current.currentSetIndex + 1,
        repsCompleted,
        restType,
        restEndsAt: Date.now() + duration,
      }
    })
  }

  function skipRest() {
    setWorkoutSession((current) =>
      current
        ? {
            ...current,
            status: 'active',
            restType: null,
            restEndsAt: null,
          }
        : current,
    )
  }

  function restartRest() {
    setWorkoutSession((current) => {
      if (!current || current.status !== 'resting' || !current.restType) {
        return current
      }

      return {
        ...current,
        restEndsAt:
          Date.now() + (current.restType === 'ladder' ? LADDER_REST_MS : STEP_REST_MS),
      }
    })
    setClockNow(Date.now())
  }

  function addMaxTest() {
    const reps = Number(maxTestDraft.reps)

    if (!maxTestDraft.date || Number.isNaN(reps) || reps < 1) {
      return
    }

    const entry: MaxTestEntry = {
      id: `${maxTestDraft.date}-${Date.now()}`,
      date: maxTestDraft.date,
      reps,
    }

    setProgramState((current) => ({
      ...current,
      maxTests: [entry, ...current.maxTests].sort((left, right) =>
        right.date.localeCompare(left.date),
      ),
    }))
    setMaxTestDraft((current) => ({
      ...current,
      reps: '',
    }))
  }

  function returnToToday() {
    setScreen('today')
    setWorkoutSession(null)
  }

  function doMissedWorkoutToday() {
    if (!recoveryDay) {
      return
    }

    startWorkoutFlow(recoveryDay)
  }

  function skipMissedWorkout() {
    if (!recoveryDay) {
      return
    }

    setProgramState((current) => ({
      ...current,
      plan: markDayStatus(current.plan, recoveryDay.id, 'skipped'),
    }))
  }

  function shiftProgramForward() {
    if (!recoveryDay) {
      return
    }

    setProgramState((current) => ({
      ...current,
      plan: moveProgramForward(current.plan, recoveryDay.id, new Date()),
    }))
    setScreen('today')
  }

  function handleNavigate(nextScreen: Screen) {
    if (nextScreen === 'workout') {
      if (workoutSession) {
        setScreen('workout')
        return
      }

      if (recoveryDay) {
        doMissedWorkoutToday()
        return
      }

      if (today.type === 'training') {
        startWorkoutFlow(today)
        return
      }

      setScreen('today')
      return
    }

    setScreen(nextScreen)
  }

  if (screen === 'workout' && workoutSession) {
    return (
      <WorkoutScreen
        screen={screen}
        todayDate={today.date}
        todayWorkoutLabel={today.workout ? `${today.workout.ladders} ladders: ${today.workout.steps.join('-')}` : 'Rest day'}
        workoutSession={workoutSession}
        activeSet={activeSet}
        nextSet={nextSet}
        restRemainingMs={restRemainingMs}
        programState={programState}
        onBeginWorkout={beginWorkout}
        onCompleteSet={completeSet}
        onSkipRest={skipRest}
        onRestartRest={restartRest}
        onReturnToToday={returnToToday}
        onNavigate={handleNavigate}
      />
    )
  }

  return (
    <main className="app-shell">
      {screen === 'today' ? (
        <TodayScreen
          settings={programState.settings}
          today={today}
          weekPreview={weekPreview}
          snapshot={{
            daysRemaining: snapshot.daysRemaining,
            completedSessions: snapshot.completedSessions,
            nextTrainingDay: snapshot.nextTrainingDay,
            overdueTrainingDays: snapshot.overdueTrainingDays,
          }}
          currentStreak={currentStreak}
          recoveryDay={recoveryDay}
          onStartWorkout={today.type === 'training' ? () => startWorkoutFlow(today) : () => {}}
          onDoMissedWorkoutToday={doMissedWorkoutToday}
          onSkipMissedWorkout={skipMissedWorkout}
          onShiftProgramForward={shiftProgramForward}
        />
      ) : null}

      {screen === 'program' ? (
        <ProgramScreen
          programWeeks={programWeeks}
          completedDays={progressStats.completedDays}
          totalTrainingDays={progressStats.totalTrainingDays}
        />
      ) : null}

      {screen === 'progress' ? (
        <ProgressScreen
          completedDays={progressStats.completedDays}
          skippedDays={progressStats.skippedDays}
          currentStreak={currentStreak}
          completionPercentage={progressStats.completionPercentage}
          totalRepsCompleted={progressStats.totalRepsCompleted}
          overdueCount={getOverdueTrainingDays(programState.plan).length}
          maxTests={programState.maxTests}
          maxTestDraft={maxTestDraft}
          onMaxTestDraftChange={setMaxTestDraft}
          onAddMaxTest={addMaxTest}
        />
      ) : null}

      {screen === 'settings' ? (
        <SettingsScreen
          draftSettings={draftSettings}
          activeSettings={programState.settings}
          onUpdateSettings={updateSettings}
          onApplySettings={applySettings}
          onResetProgress={resetProgress}
        />
      ) : null}

      <BottomNav screen={screen} onNavigate={handleNavigate} />
    </main>
  )
}

export default App
