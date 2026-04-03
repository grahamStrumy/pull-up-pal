export type BaselineOption = '0' | '1-2' | '3-5' | '6-10' | '11+';

export type WorkoutDayType = 'workout' | 'rest';

export type LadderWorkout = {
  ladders: number;
  sequence: number[];
};

export type WorkoutDay = {
  id: string;
  dayNumber: number;
  weekNumber: number;
  type: WorkoutDayType;
  summary: string;
  ladder: LadderWorkout | null;
  completed: boolean;
  skipped: boolean;
};

export type GeneratedPlan = {
  totalDays: number;
  totalWeeks: number;
  estimatedDurationWeeks: number;
  goal: number;
  days: WorkoutDay[];
};

export type SetupState = {
  baseline: BaselineOption | null;
  goal: number | null;
  customGoal: string;
};

export type AppTab = 'today' | 'plan' | 'settings';
export type SetupScreen = 'baseline' | 'goal' | 'preview';

export type WorkoutSessionPhase = 'work' | 'rest-step' | 'rest-ladder';

export type WorkoutSession = {
  dayIndex: number;
  ladderIndex: number;
  stepIndex: number;
  phase: WorkoutSessionPhase;
  secondsRemaining: number;
};

export type AppState = {
  hasStartedPlan: boolean;
  activeTab: AppTab;
  setupScreen: SetupScreen;
  setup: SetupState;
  plan: GeneratedPlan | null;
  planStartDate: string | null;
  lastActiveDate: string | null;
  planDayOffset: number;
  missedSinceSuccess: number;
  supportiveMessage: string | null;
};
