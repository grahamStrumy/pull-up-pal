import type {
  DayStatus,
  ProgramDay,
  ProgramSettings,
  ProgramState,
  WorkoutSessionState,
  WorkoutSet,
  WorkoutPrescription,
} from '../types/program'

const DAYS_PER_WEEK = 7
const TOTAL_WEEKS = 8
const TOTAL_DAYS = DAYS_PER_WEEK * TOTAL_WEEKS
const DEFAULT_REST_PATTERN = [2, 5]
const REST_PATTERNS = [
  [1, 4],
  [1, 5],
  [2, 4],
  [2, 5],
  [2, 6],
  [3, 5],
  [3, 6],
]

const weekTemplates: Array<{ ladders: number; steps: number[] }> = [
  { ladders: 3, steps: [1, 2, 3] },
  { ladders: 4, steps: [1, 2, 3] },
  { ladders: 3, steps: [1, 2, 3, 4] },
  { ladders: 4, steps: [1, 2, 3, 4] },
  { ladders: 3, steps: [1, 2, 3, 4, 5] },
  { ladders: 4, steps: [1, 2, 3, 4, 5] },
  { ladders: 3, steps: [1, 2, 3, 4, 5, 6] },
  { ladders: 3, steps: [1, 2, 3, 4, 5, 6, 7] },
]

export const defaultSettings: ProgramSettings = {
  startDate: toIsoDate(new Date()),
  currentMax: 3,
  targetMax: 10,
  useRandomRestDays: true,
}

export function getWeekTemplate(weekIndex: number): WorkoutPrescription {
  const template = weekTemplates[weekIndex]

  return {
    ladders: template.ladders,
    steps: template.steps,
    totalReps: template.steps.reduce((sum, step) => sum + step, 0) * template.ladders,
  }
}

export function createProgramState(
  settings: ProgramSettings = defaultSettings,
): ProgramState {
  return {
    settings,
    plan: generateProgramPlan(settings),
    maxTests: [],
    activeWorkoutDayId: null,
  }
}

export function generateProgramPlan(settings: ProgramSettings): ProgramDay[] {
  const startDate = parseDate(settings.startDate)
  const restPatterns = buildRestPatterns(settings)

  return Array.from({ length: TOTAL_DAYS }, (_, dayIndex) => {
    const weekIndex = Math.floor(dayIndex / DAYS_PER_WEEK)
    const dayOfWeek = dayIndex % DAYS_PER_WEEK
    const date = addDays(startDate, dayIndex)
    const isRestDay = restPatterns[weekIndex].includes(dayOfWeek)

    return {
      id: `week-${weekIndex + 1}-day-${dayOfWeek + 1}`,
      date: toIsoDate(date),
      week: weekIndex + 1,
      weekday: date.getDay(),
      type: isRestDay ? 'rest' : 'training',
      status: 'pending',
      workout: isRestDay ? undefined : getWeekTemplate(weekIndex),
    }
  })
}

export function getTodaySnapshot(state: ProgramState, referenceDate = new Date()) {
  const todayIso = toIsoDate(referenceDate)
  const today = state.plan.find((day) => day.date === todayIso) ?? state.plan[0]
  const currentIndex = state.plan.findIndex((day) => day.id === today.id)
  const completedSessions = state.plan.filter((day) => day.status === 'complete').length
  const overdueTrainingDays = getOverdueTrainingDays(state.plan, referenceDate)
  const nextTrainingDay =
    state.plan.find(
      (day, index) =>
        index > currentIndex && day.type === 'training' && day.status !== 'complete',
    ) ?? null

  return {
    today,
    completedSessions,
    daysRemaining: Math.max(state.plan.length - currentIndex - 1, 0),
    nextTrainingDay,
    overdueTrainingDays,
    recoveryDay: overdueTrainingDays[0] ?? null,
  }
}

export function getWeekPreview(plan: ProgramDay[], week: number) {
  return plan.filter((day) => day.week === week)
}

export function getWeeks(plan: ProgramDay[]) {
  const weeks = new Map<number, ProgramDay[]>()

  for (const day of plan) {
    const existing = weeks.get(day.week) ?? []
    existing.push(day)
    weeks.set(day.week, existing)
  }

  return Array.from(weeks.entries()).map(([week, days]) => ({
    week,
    days,
  }))
}

export function getCurrentStreak(plan: ProgramDay[]) {
  let streak = 0

  for (let index = plan.length - 1; index >= 0; index -= 1) {
    const day = plan[index]

    if (day.type !== 'training') {
      continue
    }

    if (day.status === 'complete') {
      streak += 1
      continue
    }

    break
  }

  return streak
}

export function getProgressStats(plan: ProgramDay[]) {
  const trainingDays = plan.filter((day) => day.type === 'training')
  const completedDays = trainingDays.filter((day) => day.status === 'complete')
  const skippedDays = trainingDays.filter(
    (day) => day.status === 'skipped' || day.status === 'missed',
  )
  const totalRepsCompleted = completedDays.reduce(
    (sum, day) => sum + (day.workout?.totalReps ?? 0),
    0,
  )

  return {
    completedDays: completedDays.length,
    skippedDays: skippedDays.length,
    totalTrainingDays: trainingDays.length,
    totalRepsCompleted,
    completionPercentage:
      trainingDays.length === 0
        ? 0
        : Math.round((completedDays.length / trainingDays.length) * 100),
  }
}

export function getOverdueTrainingDays(plan: ProgramDay[], referenceDate = new Date()) {
  const todayIso = toIsoDate(referenceDate)

  return plan.filter(
    (day) =>
      day.type === 'training' &&
      day.status === 'pending' &&
      day.date < todayIso,
  )
}

export function buildWorkoutQueue(workout: WorkoutPrescription): WorkoutSet[] {
  return Array.from({ length: workout.ladders }, (_, ladderIndex) =>
    workout.steps.map((reps, stepIndex) => ({
      ladderIndex,
      stepIndex,
      reps,
      isLastInLadder: stepIndex === workout.steps.length - 1,
      isLastOverall:
        ladderIndex === workout.ladders - 1 && stepIndex === workout.steps.length - 1,
    })),
  ).flat()
}

export function createWorkoutSession(day: ProgramDay): WorkoutSessionState | null {
  if (day.type !== 'training' || !day.workout) {
    return null
  }

  return {
    dayId: day.id,
    status: 'ready',
    queue: buildWorkoutQueue(day.workout),
    currentSetIndex: 0,
    repsCompleted: 0,
    restType: null,
    restEndsAt: null,
  }
}

export function getNextTrainingDay(plan: ProgramDay[], dayId: string) {
  const currentIndex = plan.findIndex((day) => day.id === dayId)

  return (
    plan.find(
      (day, index) =>
        index > currentIndex && day.type === 'training' && day.status !== 'complete',
    ) ?? null
  )
}

export function formatDateLabel(dateIso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(parseDate(dateIso))
}

export function formatShortWeekday(dateIso: string) {
  return new Intl.DateTimeFormat('en-GB', { weekday: 'short' }).format(parseDate(dateIso))
}

export function formatWorkoutLabel(workout?: WorkoutPrescription) {
  if (!workout) {
    return 'Rest day'
  }

  return `${workout.ladders} ladders: ${workout.steps.join('-')}`
}

export function getCompletionLabel(status: DayStatus) {
  if (status === 'complete') {
    return 'Completed'
  }

  if (status === 'missed') {
    return 'Missed'
  }

  if (status === 'skipped') {
    return 'Skipped'
  }

  return 'Scheduled'
}

export function markDayStatus(plan: ProgramDay[], dayId: string, status: DayStatus) {
  return plan.map((day) => (day.id === dayId ? { ...day, status } : day))
}

export function moveProgramForward(plan: ProgramDay[], dayId: string, referenceDate = new Date()) {
  const targetIndex = plan.findIndex((day) => day.id === dayId)

  if (targetIndex === -1) {
    return plan
  }

  const targetDate = parseDate(plan[targetIndex].date)
  const today = parseDate(toIsoDate(referenceDate))
  const offsetDays = differenceInCalendarDays(today, targetDate)

  if (offsetDays <= 0) {
    return plan
  }

  return plan.map((day, index) => {
    if (index < targetIndex || day.status === 'complete') {
      return day
    }

    return {
      ...day,
      date: toIsoDate(addDays(parseDate(day.date), offsetDays)),
    }
  })
}

export function resetProgramProgress(state: ProgramState): ProgramState {
  return {
    ...state,
    plan: state.plan.map((day) => ({
      ...day,
      status: 'pending',
    })),
    activeWorkoutDayId: null,
    maxTests: [],
  }
}

function buildRestPatterns(settings: ProgramSettings) {
  if (!settings.useRandomRestDays) {
    return Array.from({ length: TOTAL_WEEKS }, () => DEFAULT_REST_PATTERN)
  }

  let previousPattern = ''
  const seed = hashSeed(
    `${settings.startDate}-${settings.currentMax}-${settings.targetMax}-${settings.useRandomRestDays}`,
  )

  return Array.from({ length: TOTAL_WEEKS }, (_, weekIndex) => {
    const rankedPatterns = REST_PATTERNS.map((pattern, patternIndex) => {
      const patternKey = pattern.join('-')
      const spacingScore = pattern[1] - pattern[0]
      const repeatedPenalty = patternKey === previousPattern ? 100 : 0
      const consecutivePenalty = createsThreeDayRestBlock(previousPattern, pattern) ? 100 : 0
      const randomScore = seededValue(seed, weekIndex, patternIndex)

      return {
        pattern,
        score: repeatedPenalty + consecutivePenalty - spacingScore * 10 + randomScore,
      }
    }).sort((left, right) => left.score - right.score)

    const chosenPattern = rankedPatterns[0].pattern
    previousPattern = chosenPattern.join('-')
    return chosenPattern
  })
}

function createsThreeDayRestBlock(previousPattern: string, nextPattern: number[]) {
  if (!previousPattern) {
    return false
  }

  const [, previousEnd] = previousPattern.split('-').map(Number)
  return previousEnd === 6 && nextPattern[0] === 0
}

function seededValue(seed: number, weekIndex: number, patternIndex: number) {
  const value = Math.sin(seed * 0.001 + weekIndex * 12.9898 + patternIndex * 78.233) * 43758.5453
  return value - Math.floor(value)
}

function hashSeed(value: string) {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash)
}

function parseDate(value: string) {
  return new Date(`${value}T12:00:00`)
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function differenceInCalendarDays(laterDate: Date, earlierDate: Date) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000
  return Math.round((laterDate.getTime() - earlierDate.getTime()) / millisecondsPerDay)
}

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}
