import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { goal, experience, daysPerWeek, weightKg } = body;
    const workoutPlan = generateWorkoutPlan(goal, experience, daysPerWeek, weightKg);
    return NextResponse.json({ success: true, plan: workoutPlan });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate plan' }, { status: 500 });
  }
}

function generateWorkoutPlan(goal: string, experience: string, days: number, weight: number) {
  const baseRoutine = [
    {
      day: 'Day 1', focus: 'Back + Biceps', exercises: [
        { name: 'Deadlift', sets: 4, reps: '5-8', rest: '180s', muscles: ['Back', 'Legs', 'Core'] },
        { name: 'Lat Pulldown', sets: 4, reps: '10-12', rest: '90s', muscles: ['Back'] },
        { name: 'Seated Cable Row', sets: 4, reps: '10-12', rest: '90s', muscles: ['Back'] },
        { name: 'Chest Supported Row', sets: 3, reps: '10', rest: '60s', muscles: ['Back'] },
        { name: 'One Arm Dumbbell Row', sets: 3, reps: '12', rest: '60s', muscles: ['Back'] },
        { name: 'Barbell Curl', sets: 4, reps: '8-10', rest: '60s', muscles: ['Biceps'] },
        { name: 'Incline Dumbbell Curl', sets: 3, reps: '10-12', rest: '60s', muscles: ['Biceps'] },
        { name: 'Hammer Curl', sets: 3, reps: '12', rest: '60s', muscles: ['Biceps', 'Forearms'] },
      ]
    },
    {
      day: 'Day 2', focus: 'Chest + Triceps', exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: '6-8', rest: '120s', muscles: ['Chest', 'Triceps'] },
        { name: 'Incline Dumbbell Press', sets: 4, reps: '8-10', rest: '90s', muscles: ['Chest'] },
        { name: 'Chest Press Machine', sets: 3, reps: '10-12', rest: '60s', muscles: ['Chest'] },
        { name: 'Cable Fly', sets: 3, reps: '12-15', rest: '60s', muscles: ['Chest'] },
        { name: 'Pec Deck Fly', sets: 3, reps: '12', rest: '60s', muscles: ['Chest'] },
        { name: 'Tricep Pushdown', sets: 4, reps: '10-12', rest: '60s', muscles: ['Triceps'] },
        { name: 'Overhead Dumbbell Extension', sets: 3, reps: '10', rest: '60s', muscles: ['Triceps'] },
        { name: 'Dips', sets: 3, reps: 'Failure', rest: '90s', muscles: ['Chest', 'Triceps'] },
      ]
    },
    {
      day: 'Day 3', focus: 'Legs + Shoulders', exercises: [
        { name: 'Barbell Squat', sets: 4, reps: '6-8', rest: '180s', muscles: ['Legs'] },
        { name: 'Leg Press', sets: 4, reps: '10', rest: '120s', muscles: ['Legs'] },
        { name: 'Romanian Deadlift', sets: 4, reps: '8-10', rest: '90s', muscles: ['Legs', 'Back'] },
        { name: 'Leg Extension', sets: 3, reps: '12', rest: '60s', muscles: ['Legs'] },
        { name: 'Leg Curl', sets: 3, reps: '12', rest: '60s', muscles: ['Legs'] },
        { name: 'Standing Calf Raise', sets: 4, reps: '15', rest: '60s', muscles: ['Calves'] },
        { name: 'Dumbbell Shoulder Press', sets: 4, reps: '8-10', rest: '90s', muscles: ['Shoulders'] },
        { name: 'Lateral Raise', sets: 4, reps: '12-15', rest: '60s', muscles: ['Shoulders'] },
        { name: 'Rear Delt Fly', sets: 3, reps: '12', rest: '60s', muscles: ['Shoulders'] },
        { name: 'Face Pull', sets: 3, reps: '15', rest: '60s', muscles: ['Shoulders', 'Back'] },
      ]
    }
  ];

  // FIX: Properly handle 4, 5, or 6 days by duplicating the split
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

  const plan = finalRoutine.map(day => ({
    ...day,
    exercises: day.exercises.map(ex => ({
      ...ex,
      estimatedTime: Math.ceil((ex.sets * (parseInt(ex.reps) || 10) * 4 + (ex.sets - 1) * parseInt(ex.rest)) / 60),
      estimatedCalories: Math.round(4.5 * weight * (Math.ceil((ex.sets * (parseInt(ex.reps) || 10) * 4 + (ex.sets - 1) * parseInt(ex.rest)) / 60) / 60))
    }))
  }));

  return { goal, experience, weekPlan: plan, createdAt: new Date().toISOString() };
}