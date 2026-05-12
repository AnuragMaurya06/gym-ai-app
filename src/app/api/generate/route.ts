import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { goal, experience, daysPerWeek, weightKg } = body;

    console.log('Generating plan for:', { goal, experience, daysPerWeek, weightKg });

    // Call the generator function
    const workoutPlan = generateWorkoutPlan(goal, experience, daysPerWeek, weightKg);

    return NextResponse.json({ 
      success: true, 
      plan: workoutPlan 
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate plan' }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'API is working!' });
}

function generateWorkoutPlan(goal: string, experience: string, days: number, weight: number) {
  // UPDATED: Specific Routine
  const hypertrophyRoutine = [
    {
      day: 'Day 1',
      focus: 'Back + Biceps',
      exercises: [
        { name: 'Deadlift', sets: 4, reps: '5-8', rest: '180s', muscles: ['Back', 'Legs', 'Core'] },
        { name: 'Lat Pulldown', sets: 4, reps: '10-12', rest: '90s', muscles: ['Back'] },
        { name: 'Seated Cable Row', sets: 4, reps: '10-12', rest: '90s', muscles: ['Back'] },
        { name: 'Chest Supported Row', sets: 3, reps: '10', rest: '60s', muscles: ['Back'] },
        { name: 'One Arm Dumbbell Row', sets: 3, reps: '12', rest: '60s', muscles: ['Back'] },
        { name: 'Barbell Curl', sets: 4, reps: '8-10', rest: '60s', muscles: ['Biceps'] },
        { name: 'Incline Dumbbell Curl', sets: 3, reps: '10-12', rest: '60s', muscles: ['Biceps'] },
        { name: 'Hammer Curl', sets: 3, reps: '12', rest: '60s', muscles: ['Biceps', 'Forearms'] },
      ],
    },
    {
      day: 'Day 2',
      focus: 'Chest + Triceps',
      exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: '6-8', rest: '120s', muscles: ['Chest', 'Triceps'] },
        { name: 'Incline Dumbbell Press', sets: 4, reps: '8-10', rest: '90s', muscles: ['Chest'] },
        { name: 'Chest Press Machine', sets: 3, reps: '10-12', rest: '60s', muscles: ['Chest'] },
        { name: 'Cable Fly', sets: 3, reps: '12-15', rest: '60s', muscles: ['Chest'] },
        { name: 'Pec Deck Fly', sets: 3, reps: '12', rest: '60s', muscles: ['Chest'] },
        { name: 'Tricep Pushdown', sets: 4, reps: '10-12', rest: '60s', muscles: ['Triceps'] },
        { name: 'Overhead Dumbbell Extension', sets: 3, reps: '10', rest: '60s', muscles: ['Triceps'] },
        { name: 'Dips', sets: 3, reps: 'Failure', rest: '90s', muscles: ['Chest', 'Triceps'] },
      ],
    },
    {
      day: 'Day 3',
      focus: 'Legs + Shoulders',
      exercises: [
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
      ],
    },
  ];

  // Fallback routine for other goals (Strength/Fat Loss)
  const otherRoutine = [
    {
      day: 'Day 1',
      focus: 'Full Body Strength',
      exercises: [
        { name: 'Squat', sets: 5, reps: '5', rest: '180s', muscles: ['Legs'] },
        { name: 'Bench Press', sets: 5, reps: '5', rest: '180s', muscles: ['Chest'] },
        { name: 'Barbell Row', sets: 5, reps: '5', rest: '180s', muscles: ['Back'] },
      ],
    },
    {
      day: 'Day 2',
      focus: 'HIIT Cardio',
      exercises: [
        { name: 'Burpees', sets: 5, reps: '10', rest: '60s', muscles: ['Full Body'] },
        { name: 'Mountain Climbers', sets: 5, reps: '30s', rest: '30s', muscles: ['Core'] },
        { name: 'Kettlebell Swings', sets: 5, reps: '20', rest: '60s', muscles: ['Legs'] },
      ],
    }
  ];

  // Select routine based on goal
  let selectedRoutine;
  if (goal === 'hypertrophy' || goal === 'Build Muscle') {
    selectedRoutine = hypertrophyRoutine;
  } else {
    selectedRoutine = otherRoutine;
  }

  // Limit days if user selected fewer than 3
  if (days < 3) {
    selectedRoutine = selectedRoutine.slice(0, days);
  }

  // Map exercises to add calculations
  const finalPlan = selectedRoutine.map(day => ({
    ...day,
    exercises: day.exercises.map(ex => ({
      ...ex,
      estimatedTime: calculateTime(ex.sets, ex.reps, ex.rest),
      estimatedCalories: calculateCalories(ex, weight),
    })),
  }));

  return {
    goal,
    experience,
    weekPlan: finalPlan,
    createdAt: new Date().toISOString(),
  };
}

function calculateTime(sets: number, reps: string, rest: string): number {
  // Parse reps (e.g., "8-10" -> 9)
  const repArray = reps.split('-').map(Number);
  const avgReps = repArray.length > 1 ? (repArray[0] + repArray[1]) / 2 : repArray[0];
  
  const restSeconds = parseInt(rest) || 60;
  const repSeconds = 4; // Approx 4 seconds per rep
  
  // Time = (Sets * Reps * RepSeconds) + ((Sets-1) * RestSeconds)
  const totalTime = (sets * (avgReps || 10) * repSeconds) + ((sets - 1) * restSeconds);
  
  return Math.ceil(totalTime / 60); // Return minutes
}

function calculateCalories(exercise: any, weightKg: number): number {
  const metValues: Record<string, number> = {
    'Chest': 4.0,
    'Legs': 5.5,
    'Back': 4.5,
    'Shoulders': 4.0,
    'Biceps': 3.5,
    'Triceps': 3.5,
    'Full Body': 6.0,
    'Core': 4.0,
    'Calves': 3.0,
    'Forearms': 3.0
  };

  const muscle = exercise.muscles[0] || 'Full Body';
  const met = metValues[muscle] || 4.0;
  const durationHours = exercise.estimatedTime / 60;
  
  return Math.round(met * weightKg * durationHours);
}