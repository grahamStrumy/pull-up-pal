import type { AppState } from '../types/app';

export const initialAppState: AppState = {
  hasStartedPlan: false,
  activeTab: 'today',
  setupScreen: 'baseline',
  setup: {
    baseline: null,
    goal: null,
    customGoal: ''
  },
  plan: null,
  planStartDate: null,
  lastActiveDate: null,
  planDayOffset: 0,
  missedSinceSuccess: 0,
  supportiveMessage: null
};
