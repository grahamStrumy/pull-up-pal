import { createProgramState, defaultSettings } from './program'
import type { ProgramState, WorkoutSessionState } from '../types/program'

const STORAGE_KEY = 'pullup-ladder-state-v1'

interface PersistedAppState {
  programState: ProgramState
  workoutSession: WorkoutSessionState | null
  screen: 'today' | 'workout' | 'program' | 'progress' | 'settings'
}

export function loadAppState(): PersistedAppState {
  if (typeof window === 'undefined') {
    return createDefaultAppState()
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return createDefaultAppState()
    }

    const parsed = JSON.parse(raw) as Partial<PersistedAppState>
    const programState = parsed.programState ?? createProgramState(defaultSettings)
    const workoutSession = parsed.workoutSession ?? null
    const screen =
      parsed.screen === 'workout' && !workoutSession ? 'today' : parsed.screen ?? 'today'

    return {
      programState,
      workoutSession,
      screen,
    }
  } catch {
    return createDefaultAppState()
  }
}

export function saveAppState(state: PersistedAppState) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function createDefaultAppState(): PersistedAppState {
  return {
    programState: createProgramState(defaultSettings),
    workoutSession: null,
    screen: 'today',
  }
}
