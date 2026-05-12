export const STORAGE_KEY = 'gym_ai_workout_plans';

export interface SavedPlan {
  id: string;
  plan: any;
  createdAt: string;
  completed: boolean;
  workoutData: any[];
}

export function savePlan(plan: any): string {
  const plans = getPlans();
  const newPlan: SavedPlan = {
    id: Date.now().toString(),
    plan,
    createdAt: new Date().toISOString(),
    completed: false,
    workoutData: [],
  };
  
  plans.push(newPlan);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  return newPlan.id;
}

export function getPlans(): SavedPlan[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function updatePlan(id: string, updates: Partial<SavedPlan>) {
  const plans = getPlans();
  const index = plans.findIndex(p => p.id === id);
  if (index !== -1) {
    plans[index] = { ...plans[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  }
}

export function deletePlan(id: string) {
  const plans = getPlans();
  const filtered = plans.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}