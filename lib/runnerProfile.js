export const RUNNER_PROFILE_STORAGE_KEY = "stride_runner_profile_v1";
export const PLAN_INPUT_STORAGE_KEY = "stride_plan_input_v1";

export const defaultRunnerProfile = {
  name: "Xavier",
  age: "25",
  gender: "Male",
  height: "1.70",
  weight: "65",
  fitness: "Beginner",
  runningExperience: "Runs 5km once a week",
  marathonExperience: "No prior marathon experience",
  injuryHistory: "No recent injuries",
  targetTiming: "5 hours",
  trainingPreference: "3 runs per week, preferably in the evenings",
};

function mergeRunnerProfile(data) {
  return {
    ...defaultRunnerProfile,
    ...(data || {}),
  };
}

export function loadRunnerProfile() {
  if (typeof window === "undefined") {
    return defaultRunnerProfile;
  }

  try {
    const stored = window.localStorage.getItem(RUNNER_PROFILE_STORAGE_KEY);
    if (!stored) {
      return defaultRunnerProfile;
    }

    return mergeRunnerProfile(JSON.parse(stored));
  } catch {
    return defaultRunnerProfile;
  }
}

export function saveRunnerProfile(profile) {
  if (typeof window === "undefined") {
    return;
  }

  const merged = mergeRunnerProfile(profile);
  window.localStorage.setItem(RUNNER_PROFILE_STORAGE_KEY, JSON.stringify(merged));
}

export function loadPlanInputSnapshot() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(PLAN_INPUT_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function savePlanInputSnapshot(snapshot) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PLAN_INPUT_STORAGE_KEY, JSON.stringify(snapshot));
}
