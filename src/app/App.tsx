import { useEffect, useState } from 'react';
import { initialAppState } from './state';
import { getDaysBetween, getTodayIsoDate } from '../lib/date';
import {
  generatePlan,
  getBoundedDayIndex,
  getCurrentPlanDay,
  getLastSuccessfulWorkoutIndex,
  getNextIncompleteWorkoutIndex
} from '../lib/plan';
import { loadState, saveState } from '../lib/storage';
import { DailyWorkoutScreen } from '../screens/DailyWorkoutScreen';
import { GuidedWorkoutScreen } from '../screens/GuidedWorkoutScreen';
import { OnboardingBaselineScreen } from '../screens/OnboardingBaselineScreen';
import { OnboardingGoalScreen } from '../screens/OnboardingGoalScreen';
import { PlanPreviewScreen } from '../screens/PlanPreviewScreen';
import { PlanScreen } from '../screens/PlanScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import type { AppState, BaselineOption, SetupScreen, WorkoutSession } from '../types/app';

function advanceWorkoutSession(session: WorkoutSession, sequenceLength: number): WorkoutSession | null {
  if (session.phase === 'rest-step') {
    return {
      ...session,
      phase: 'work',
      stepIndex: session.stepIndex + 1,
      secondsRemaining: 0
    };
  }

  return {
    ...session,
    phase: 'work',
    ladderIndex: session.ladderIndex + 1,
    stepIndex: 0,
    secondsRemaining: 0
  };
}

export function App() {
  const [appState, setAppState] = useState<AppState>(() => loadState() ?? initialAppState);
  const [workoutSession, setWorkoutSession] = useState<WorkoutSession | null>(null);
  const todayIsoDate = getTodayIsoDate();

  useEffect(() => {
    saveState(appState);
  }, [appState]);

  useEffect(() => {
    setAppState((current) => {
      if (!current.hasStartedPlan || !current.plan || !current.planStartDate) {
        return current;
      }

      const lastActiveDate = current.lastActiveDate ?? current.planStartDate;
      if (lastActiveDate === todayIsoDate) {
        return current;
      }

      const lastKnownIndex = getBoundedDayIndex(
        current.plan,
        getDaysBetween(current.planStartDate, lastActiveDate) + current.planDayOffset
      );
      let missedCount = current.missedSinceSuccess;
      let planDayOffset = current.planDayOffset;
      let plan = current.plan;
      let supportiveMessage = current.supportiveMessage;

      const daysSinceLastActive = getDaysBetween(lastActiveDate, todayIsoDate);

      for (let step = 1; step <= daysSinceLastActive; step += 1) {
        const dayIndex = Math.min(lastKnownIndex + step - 1, plan.days.length - 1);
        const day = plan.days[dayIndex];

        if (day.type !== 'workout' || day.completed || day.skipped) {
          continue;
        }

        const updatedDays = plan.days.map((entry, index) =>
          index === dayIndex ? { ...entry, skipped: true } : entry
        );
        plan = { ...plan, days: updatedDays };
        missedCount += 1;
      }

      if (missedCount >= 2) {
        const fallbackIndex = getLastSuccessfulWorkoutIndex(plan);
        const todayDistance = getDaysBetween(current.planStartDate, todayIsoDate);
        const nextWorkoutIndex = getNextIncompleteWorkoutIndex(plan, fallbackIndex);
        planDayOffset = nextWorkoutIndex - todayDistance;
        supportiveMessage =
          'We stepped you back to your last successful workout level so the next ladder stays realistic.';
        missedCount = 0;
      }

      return {
        ...current,
        plan,
        planDayOffset,
        missedSinceSuccess: missedCount,
        lastActiveDate: todayIsoDate,
        supportiveMessage
      };
    });
  }, [todayIsoDate]);

  useEffect(() => {
    if (!workoutSession || workoutSession.phase === 'work') {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setWorkoutSession((current) => {
        if (!current || current.phase === 'work') {
          return current;
        }

        if (current.secondsRemaining > 1) {
          return { ...current, secondsRemaining: current.secondsRemaining - 1 };
        }

        const todayWorkout = appState.plan?.days[current.dayIndex];
        if (!todayWorkout || !todayWorkout.ladder) {
          return null;
        }

        return advanceWorkoutSession(current, todayWorkout.ladder.sequence.length);
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [appState.plan, workoutSession]);

  const setupStage: SetupScreen | 'ready' = appState.hasStartedPlan ? 'ready' : appState.setupScreen;
  const currentDayIndex =
    appState.plan && appState.planStartDate
      ? getBoundedDayIndex(
          appState.plan,
          getDaysBetween(appState.planStartDate, todayIsoDate) + appState.planDayOffset
        )
      : 0;

  const updateBaseline = (baseline: BaselineOption) => {
    setAppState((current) => ({
      ...current,
      setup: {
        ...current.setup,
        baseline
      }
    }));
  };

  const updateGoal = (goal: number, customGoal?: string) => {
    setAppState((current) => ({
      ...current,
      setup: {
        ...current.setup,
        goal,
        customGoal: customGoal ?? current.setup.customGoal
      }
    }));
  };

  const advanceFromBaseline = () => {
    setAppState((current) => ({
      ...current,
      setupScreen: 'goal'
    }));
  };

  const buildPreviewPlan = () => {
    setAppState((current) => {
      if (!current.setup.baseline || !current.setup.goal) {
        return current;
      }

      return {
        ...current,
        setupScreen: 'preview',
        plan: generatePlan(current.setup.baseline, current.setup.goal),
        supportiveMessage: null
      };
    });
  };

  const startPlan = () => {
    setAppState((current) => ({
      ...current,
      hasStartedPlan: true,
      activeTab: 'today',
      planStartDate: todayIsoDate,
      lastActiveDate: todayIsoDate,
      planDayOffset: 0,
      supportiveMessage: null
    }));
  };

  const completeToday = () => {
    setAppState((current) => {
      if (!current.plan) {
        return current;
      }

      const days = current.plan.days.map((day, index) =>
        index === currentDayIndex ? { ...day, completed: true } : day
      );

      return {
        ...current,
        plan: { ...current.plan, days },
        missedSinceSuccess: 0,
        lastActiveDate: todayIsoDate,
        supportiveMessage: 'Workout complete. Come back tomorrow for the next ladder session.'
      };
    });
  };

  const startWorkout = () => {
    const todayWorkout = appState.plan ? getCurrentPlanDay(appState.plan, currentDayIndex) : null;

    if (!todayWorkout || todayWorkout.type !== 'workout' || !todayWorkout.ladder || todayWorkout.completed) {
      return;
    }

    setWorkoutSession({
      dayIndex: currentDayIndex,
      ladderIndex: 0,
      stepIndex: 0,
      phase: 'work',
      secondsRemaining: 0
    });
  };

  const completeSet = () => {
    const todayWorkout = appState.plan ? getCurrentPlanDay(appState.plan, currentDayIndex) : null;

    if (!todayWorkout || todayWorkout.type !== 'workout' || !todayWorkout.ladder) {
      return;
    }

    const ladder = todayWorkout.ladder;

    setWorkoutSession((current) => {
      if (!current) {
        return current;
      }

      const onLastStep = current.stepIndex === ladder.sequence.length - 1;
      const onLastLadder = current.ladderIndex === ladder.ladders - 1;

      if (onLastStep && onLastLadder) {
        window.setTimeout(() => {
          completeToday();
          setWorkoutSession(null);
        }, 0);
        return current;
      }

      if (onLastStep) {
        return {
          ...current,
          phase: 'rest-ladder',
          secondsRemaining: 120
        };
      }

      return {
        ...current,
        phase: 'rest-step',
        secondsRemaining: 90
      };
    });
  };

  const skipRest = () => {
    const todayWorkout = appState.plan ? getCurrentPlanDay(appState.plan, currentDayIndex) : null;

    if (!todayWorkout || todayWorkout.type !== 'workout' || !todayWorkout.ladder) {
      return;
    }

    const ladder = todayWorkout.ladder;

    setWorkoutSession((current) => {
      if (!current || current.phase === 'work') {
        return current;
      }

      return advanceWorkoutSession(current, ladder.sequence.length);
    });
  };

  const skipToday = () => {
    setWorkoutSession(null);
    setAppState((current) => {
      if (!current.plan || !current.planStartDate) {
        return current;
      }

      const days = current.plan.days.map((day, index) =>
        index === currentDayIndex ? { ...day, skipped: true } : day
      );
      const nextMissedCount = current.missedSinceSuccess + 1;
      let planDayOffset = current.planDayOffset;
      let supportiveMessage = 'No restart. We will keep the next ladder manageable and rebuild from there.';
      let missedSinceSuccess = nextMissedCount;

      if (nextMissedCount >= 2) {
        const fallbackIndex = getLastSuccessfulWorkoutIndex({ ...current.plan, days });
        const nextWorkoutIndex = getNextIncompleteWorkoutIndex({ ...current.plan, days }, fallbackIndex);
        const todayDistance = getDaysBetween(current.planStartDate, todayIsoDate);
        planDayOffset = nextWorkoutIndex - todayDistance;
        supportiveMessage =
          'We stepped you back to your last successful workout level so the next ladder stays realistic.';
        missedSinceSuccess = 0;
      }

      return {
        ...current,
        plan: { ...current.plan, days },
        planDayOffset,
        missedSinceSuccess,
        lastActiveDate: todayIsoDate,
        supportiveMessage
      };
    });
  };

  const changeTab = (activeTab: AppState['activeTab']) => {
    setWorkoutSession(null);
    setAppState((current) => ({
      ...current,
      activeTab,
      supportiveMessage: current.activeTab === activeTab ? current.supportiveMessage : null
    }));
  };

  const resetPlan = () => {
    setWorkoutSession(null);
    setAppState(initialAppState);
  };

  if (setupStage === 'baseline') {
    return (
      <OnboardingBaselineScreen
        value={appState.setup.baseline}
        onChange={updateBaseline}
        onContinue={advanceFromBaseline}
      />
    );
  }

  if (setupStage === 'goal') {
    return (
      <OnboardingGoalScreen
        goal={appState.setup.goal}
        customGoal={appState.setup.customGoal}
        onSelectGoal={(goal) => updateGoal(goal)}
        onCustomGoalChange={(value) => {
          const parsed = Number.parseInt(value, 10);
          setAppState((current) => ({
            ...current,
            setup: {
              ...current.setup,
              customGoal: value,
              goal: Number.isFinite(parsed) && parsed > 0 ? parsed : null
            }
          }));
        }}
        onContinue={buildPreviewPlan}
        onBack={() =>
          setAppState((current) => ({
            ...current,
            setupScreen: 'baseline',
            setup: { ...current.setup, baseline: null }
          }))
        }
      />
    );
  }

  if (setupStage === 'preview' && appState.plan) {
    return (
      <PlanPreviewScreen
        plan={appState.plan}
        onStart={startPlan}
        onBack={() =>
          setAppState((current) => ({
            ...current,
            setupScreen: 'goal',
            plan: null,
            setup: { ...current.setup, goal: null }
          }))
        }
      />
    );
  }

  if (!appState.plan) {
    return null;
  }

  const todayWorkout = getCurrentPlanDay(appState.plan, currentDayIndex);

  if (workoutSession && todayWorkout.type === 'workout' && todayWorkout.ladder) {
    return (
      <GuidedWorkoutScreen
        workout={todayWorkout.ladder}
        session={workoutSession}
        onDoneSet={completeSet}
        onSkipRest={skipRest}
      />
    );
  }

  if (appState.activeTab === 'plan') {
    return <PlanScreen plan={appState.plan} activeTab={appState.activeTab} onTabChange={changeTab} />;
  }

  if (appState.activeTab === 'settings') {
    return (
      <SettingsScreen activeTab={appState.activeTab} onTabChange={changeTab} onReset={resetPlan} />
    );
  }

  return (
    <DailyWorkoutScreen
      plan={appState.plan}
      currentDayIndex={currentDayIndex}
      supportiveMessage={appState.supportiveMessage}
      activeTab={appState.activeTab}
      onTabChange={changeTab}
      onStartWorkout={startWorkout}
      onSkipDay={skipToday}
    />
  );
}
