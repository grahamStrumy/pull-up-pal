import { describe, expect, it } from 'vitest'
import {
  buildWorkoutQueue,
  createProgramState,
  createWorkoutSession,
  generateProgramPlan,
  getOverdueTrainingDays,
  getProgressStats,
  getTodaySnapshot,
  markDayStatus,
  moveProgramForward,
} from './program'

describe('generateProgramPlan', () => {
  it('creates an 8 week plan with 56 days and 5 training days per week', () => {
    const plan = generateProgramPlan({
      startDate: '2026-03-14',
      currentMax: 4,
      targetMax: 10,
      useRandomRestDays: true,
    })

    expect(plan).toHaveLength(56)

    for (let week = 1; week <= 8; week += 1) {
      const weekDays = plan.filter((day) => day.week === week)
      const trainingDays = weekDays.filter((day) => day.type === 'training')
      const restDays = weekDays.filter((day) => day.type === 'rest')

      expect(weekDays).toHaveLength(7)
      expect(trainingDays).toHaveLength(5)
      expect(restDays).toHaveLength(2)
    }
  })

  it('applies the ladder templates for week one and week eight', () => {
    const plan = generateProgramPlan({
      startDate: '2026-03-14',
      currentMax: 4,
      targetMax: 10,
      useRandomRestDays: false,
    })

    const weekOneTraining = plan.find((day) => day.week === 1 && day.type === 'training')
    const weekEightTraining = plan.find((day) => day.week === 8 && day.type === 'training')

    expect(weekOneTraining?.workout).toMatchObject({
      ladders: 3,
      steps: [1, 2, 3],
      totalReps: 18,
    })

    expect(weekEightTraining?.workout).toMatchObject({
      ladders: 3,
      steps: [1, 2, 3, 4, 5, 6, 7],
      totalReps: 84,
    })
  })
})

describe('workout helpers', () => {
  it('builds the full workout queue in order', () => {
    const queue = buildWorkoutQueue({
      ladders: 3,
      steps: [1, 2, 3],
      totalReps: 18,
    })

    expect(queue).toHaveLength(9)
    expect(queue[0]).toMatchObject({ ladderIndex: 0, stepIndex: 0, reps: 1 })
    expect(queue[3]).toMatchObject({ ladderIndex: 1, stepIndex: 0, reps: 1 })
    expect(queue[8]).toMatchObject({
      ladderIndex: 2,
      stepIndex: 2,
      reps: 3,
      isLastOverall: true,
    })
  })

  it('creates a workout session only for training days', () => {
    const state = createProgramState({
      startDate: '2026-03-14',
      currentMax: 4,
      targetMax: 10,
      useRandomRestDays: false,
    })

    const trainingDay = state.plan.find((day) => day.type === 'training')
    const restDay = state.plan.find((day) => day.type === 'rest')

    expect(trainingDay && createWorkoutSession(trainingDay)?.queue.length).toBeGreaterThan(0)
    expect(restDay && createWorkoutSession(restDay)).toBeNull()
  })
})

describe('recovery and progress helpers', () => {
  it('detects overdue pending training days and exposes the oldest recovery day', () => {
    const state = createProgramState({
      startDate: '2026-03-10',
      currentMax: 4,
      targetMax: 10,
      useRandomRestDays: false,
    })

    const referenceDate = new Date('2026-03-14T12:00:00')
    const overdue = getOverdueTrainingDays(state.plan, referenceDate)
    const snapshot = getTodaySnapshot(state, referenceDate)

    expect(overdue.length).toBeGreaterThan(0)
    expect(snapshot.recoveryDay?.id).toBe(overdue[0].id)
  })

  it('moves pending dates forward so the missed workout lands on today', () => {
    const state = createProgramState({
      startDate: '2026-03-10',
      currentMax: 4,
      targetMax: 10,
      useRandomRestDays: false,
    })

    const referenceDate = new Date('2026-03-14T12:00:00')
    const overdueDay = getOverdueTrainingDays(state.plan, referenceDate)[0]
    const shiftedPlan = moveProgramForward(state.plan, overdueDay.id, referenceDate)
    const shiftedDay = shiftedPlan.find((day) => day.id === overdueDay.id)

    expect(shiftedDay?.date).toBe('2026-03-14')
  })

  it('summarizes progress from completed and skipped training days', () => {
    const state = createProgramState({
      startDate: '2026-03-14',
      currentMax: 4,
      targetMax: 10,
      useRandomRestDays: false,
    })

    const trainingDays = state.plan.filter((day) => day.type === 'training')
    const updatedPlan = markDayStatus(
      markDayStatus(state.plan, trainingDays[0].id, 'complete'),
      trainingDays[1].id,
      'skipped',
    )
    const stats = getProgressStats(updatedPlan)

    expect(stats.completedDays).toBe(1)
    expect(stats.skippedDays).toBe(1)
    expect(stats.totalRepsCompleted).toBe(trainingDays[0].workout?.totalReps ?? 0)
  })
})
