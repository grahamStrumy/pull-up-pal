export type LadderStep = number

export type DayType = 'training' | 'rest'

export type DayStatus = 'pending' | 'complete' | 'skipped' | 'missed'

export interface ProgramSettings {
  startDate: string
  currentMax: number
  targetMax: number
  useRandomRestDays: boolean
}

export interface WorkoutPrescription {
  ladders: number
  steps: LadderStep[]
  totalReps: number
}

export interface ProgramDay {
  id: string
  date: string
  week: number
  weekday: number
  type: DayType
  status: DayStatus
  workout?: WorkoutPrescription
}

export interface MaxTestEntry {
  id: string
  date: string
  reps: number
}

export interface ProgramState {
  settings: ProgramSettings
  plan: ProgramDay[]
  maxTests: MaxTestEntry[]
  activeWorkoutDayId: string | null
}

export interface WorkoutSet {
  ladderIndex: number
  stepIndex: number
  reps: number
  isLastInLadder: boolean
  isLastOverall: boolean
}

export type RestType = 'step' | 'ladder'

export interface WorkoutSessionState {
  dayId: string
  status: 'ready' | 'active' | 'resting' | 'complete'
  queue: WorkoutSet[]
  currentSetIndex: number
  repsCompleted: number
  restType: RestType | null
  restEndsAt: number | null
}
