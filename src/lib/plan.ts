import type { BaselineOption, GeneratedPlan, LadderWorkout, WorkoutDay } from '../types/app';

const baselineToMax: Record<BaselineOption, number> = {
  '0': 0,
  '1-2': 2,
  '3-5': 5,
  '6-10': 10,
  '11+': 12
};

const ladderTemplates: LadderWorkout[] = [
  { ladders: 3, sequence: [1, 2] },
  { ladders: 4, sequence: [1, 2] },
  { ladders: 3, sequence: [1, 2, 3] },
  { ladders: 4, sequence: [1, 2, 3] },
  { ladders: 3, sequence: [1, 2, 3, 4] },
  { ladders: 4, sequence: [1, 2, 3, 4] },
  { ladders: 3, sequence: [2, 3, 4] },
  { ladders: 4, sequence: [2, 3, 4] },
  { ladders: 3, sequence: [2, 3, 4, 5] }
];

function getLadderVolume(ladder: LadderWorkout) {
  return ladder.ladders * ladder.sequence.reduce((total, step) => total + step, 0);
}

function getStartingTemplateIndex(currentMax: number) {
  if (currentMax <= 2) {
    return 0;
  }

  if (currentMax <= 5) {
    return 2;
  }

  if (currentMax <= 10) {
    return 4;
  }

  return 5;
}

function getTargetTemplateIndex(goal: number) {
  if (goal <= 5) {
    return 3;
  }

  if (goal <= 8) {
    return 4;
  }

  if (goal <= 12) {
    return 5;
  }

  if (goal <= 15) {
    return 7;
  }

  return 8;
}

export function formatLadderSummary(ladder: LadderWorkout) {
  return `${ladder.ladders} ladders of ${ladder.sequence.join('-')}`;
}

function createWorkoutDay(
  dayNumber: number,
  weekNumber: number,
  type: WorkoutDay['type'],
  ladder: LadderWorkout | null
): WorkoutDay {
  return {
    id: `day-${dayNumber}`,
    dayNumber,
    weekNumber,
    type,
    summary: ladder ? formatLadderSummary(ladder) : 'Recovery day',
    ladder,
    completed: false,
    skipped: false
  };
}

function getTrainingDaysForWeek(weekNumber: number, currentLadder: LadderWorkout) {
  const heavierWeek = getLadderVolume(currentLadder) >= 24 || weekNumber > 2;
  return heavierWeek ? [1, 2, 4, 6] : [1, 2, 4, 5, 7];
}

export function generatePlan(baseline: BaselineOption, goal: number): GeneratedPlan {
  const currentMax = baselineToMax[baseline];
  const startTemplateIndex = getStartingTemplateIndex(currentMax);
  const targetTemplateIndex = getTargetTemplateIndex(goal);
  const totalWeeks = Math.max(4, targetTemplateIndex - startTemplateIndex + 5);
  const totalDays = totalWeeks * 7;
  const days: WorkoutDay[] = [];
  let workoutCount = 0;

  for (let dayNumber = 1; dayNumber <= totalDays; dayNumber += 1) {
    const weekNumber = Math.ceil(dayNumber / 7);
    const dayOfWeek = ((dayNumber - 1) % 7) + 1;
    const progressionIndex = Math.min(
      targetTemplateIndex,
      startTemplateIndex + Math.floor(workoutCount / 2)
    );
    const ladder = ladderTemplates[progressionIndex];
    const trainingDays = getTrainingDaysForWeek(weekNumber, ladder);
    const isWorkoutDay = trainingDays.includes(dayOfWeek);

    if (!isWorkoutDay) {
      days.push(createWorkoutDay(dayNumber, weekNumber, 'rest', null));
      continue;
    }

    workoutCount += 1;
    days.push(createWorkoutDay(dayNumber, weekNumber, 'workout', ladder));
  }

  return {
    totalDays,
    totalWeeks,
    estimatedDurationWeeks: totalWeeks,
    goal,
    days
  };
}

export function getPreviewDays(plan: GeneratedPlan) {
  return plan.days.filter((day) => day.type === 'workout').slice(0, 3);
}

export function getCurrentPlanDay(plan: GeneratedPlan, currentDayIndex: number) {
  return plan.days[Math.min(currentDayIndex, plan.days.length - 1)];
}

export function getBoundedDayIndex(plan: GeneratedPlan, currentDayIndex: number) {
  return Math.max(0, Math.min(currentDayIndex, plan.days.length - 1));
}

export function getLastSuccessfulWorkoutIndex(plan: GeneratedPlan) {
  let result = 0;

  plan.days.forEach((day, index) => {
    if (day.type === 'workout' && day.completed) {
      result = index;
    }
  });

  return result;
}

export function getNextIncompleteWorkoutIndex(plan: GeneratedPlan, fromIndex: number) {
  for (let index = fromIndex; index < plan.days.length; index += 1) {
    const day = plan.days[index];
    if (day.type === 'workout' && !day.completed) {
      return index;
    }
  }

  return plan.days.length - 1;
}
