import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { goal, experience, daysPerWeek, weightKg } = body;
    
    const workoutPlan = generateWorkoutPlan(goal, experience, Number(daysPerWeek), Number(weightKg));
    
    return NextResponse.json({ success: true, plan: workoutPlan });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate workout plan' }, 
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
        { name: 'Deadlift', sets: 4, reps: '5-8', rest: '180s', muscles: ['Back', 'Legs', 'Core'], estimatedTime: 25, estimatedCalories: 150 },
        { name: 'Lat Pulldown', sets: 4, reps: '10-12', rest: '90s', muscles: ['Back'], estimatedTime: 15, estimatedCalories: 80 },
        { name: 'Seated Cable Row', sets: 4, reps: '10-12', rest: '90s', muscles: ['Back'], estimatedTime: 15, estimatedCalories: 80 },
        { name: 'Barbell Curl', sets: 4, reps: '8-10', rest: '60s', muscles: ['Biceps'], estimatedTime: 12, estimatedCalories: 60 },
      ]
    },
    {
      day: 'Day 2',
      focus: 'Chest + Triceps',
      exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: '6-8', rest: '120s', muscles: ['Chest', 'Triceps'], estimatedTime: 20, estimatedCalories: 120 },
        { name: 'Incline Dumbbell Press', sets: 4, reps: '8-10', rest: '90s', muscles: ['Chest'], estimatedTime: 15, estimatedCalories: 90 },
        { name: 'Tricep Pushdown', sets: 4, reps: '10-12', rest: '60s', muscles: ['Triceps'], estimatedTime: 12, estimatedCalories: 60 },
      ]
    },
    {
      day: 'Day 3',
      focus: 'Legs + Shoulders',
      exercises: [
        { name: 'Barbell Squat', sets: 4, reps: '6-8', rest: '180s', muscles: ['Legs'], estimatedTime: 25, estimatedCalories: 180 },
        { name: 'Leg Press', sets: 4, reps: '10-12', rest: '90s', muscles: ['Legs'], estimatedTime: 15, estimatedCalories: 100 },
        { name: 'Dumbbell Shoulder Press', sets: 4, reps: '8-10', rest: '90s', muscles: ['Shoulders'], estimatedTime: 15, estimatedCalories: 90 },
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

  return { 
    goal, 
    experience, 
    weekPlan: finalRoutine, 
    createdAt: new Date().toISOString() 
  };
}