import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { goal, experience, daysPerWeek, weightKg } = body;
    
    if (!goal || !experience || !daysPerWeek || !weightKg) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }
    
    const workoutPlan = generateWorkoutPlan(goal, experience, daysPerWeek, weightKg);
    return NextResponse.json({ success: true, plan: workoutPlan });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate plan' }, 
      { status: 500 }
    );
  }
}

function generateWorkoutPlan(goal: string, experience: string, days: number, weight: number) {
  const baseRoutine = [
    {
      day: 'Day 1',
      focus: 'Back + Biceps',
      exercises: [
        { name: 'Deadlift', sets: 4, reps: '5-8', rest: '180s', muscles: ['Back', 'Legs', 'Core'] },
        { name: 'Lat Pulldown', sets: 4, reps: '10-12', rest: '90s', muscles: ['Back'] },
        { name: 'Seated Cable Row', sets: 4, reps: '10-12', rest: '90s', muscles: ['Back'] },
        { name: 'Barbell Curl', sets: 4, reps: '8-10', rest: '60s', muscles: ['Biceps'] },
      ]
    },
    {
      day: 'Day 2',
      focus: 'Chest + Triceps',
      exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: '6-8', rest: '120s', muscles: ['Chest', 'Triceps'] },
        { name: 'Incline Dumbbell Press', sets: 4, reps: '8-10', rest: '90s', muscles: ['Chest'] },
        { name: 'Tricep Pushdown', sets: 4, reps: '10-12', rest: '60s', muscles: ['Triceps'] },
      ]
    },
    {
      day: 'Day 3',
      focus: 'Legs + Shoulders',
      exercises: [
        { name: 'Barbell Squat', sets: 4, reps: '6-8', rest: '180s', muscles: ['Legs'] },
        { name: 'Leg Press', sets: 4, reps: '10-12', rest: '90s', muscles: ['Legs'] },
        { name: 'Dumbbell Shoulder Press', sets: 4, reps: '8-10', rest: '90s', muscles: ['Shoulders'] },
      ]
    }
  ];

  let finalRoutine = [...baseRoutine];
  if (days > 3) {
    const extraDays = baseRoutine.map((day, idx) => ({
      ...day,
      day: `Day ${idx + 4}`,
      focus: day.focus + ' (Vol)'
    }));
    finalRoutine = [...baseRoutine, ...extraDays].slice(0, days);
  } else {
    finalRoutine = baseRoutine.slice(0, days);
  }

  // SAFER PARSING - Fix the error
  const plan = finalRoutine.map(day => ({
    ...day,
    exercises: day.exercises.map(ex => {
      // Safely parse reps (take first number from range like "5-8")
      const repsMatch = ex.reps.match(/\d+/);
      const repsNum = repsMatch ? parseInt(repsMatch[0]) : 10;
      
      // Safely parse rest (remove 's' and parse number)
      const restMatch = ex.rest.match(/\d+/);
      const restSec = restMatch ? parseInt(restMatch[0]) : 60;
      
      const estimatedTime = Math.ceil((ex.sets * repsNum * 4 + (ex.sets - 1) * restSec) / 60);
      const estimatedCalories = Math.round(4.5 * weight * (estimatedTime / 60));
      
      return {
        ...ex,
        estimatedTime,
        estimatedCalories
      };
    })
  }));

  return { goal, experience, weekPlan: plan, createdAt: new Date().toISOString() };
}