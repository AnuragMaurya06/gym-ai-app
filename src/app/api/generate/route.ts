import { NextResponse } from 'next/server';

// GIF Dictionary - Map exercise names to GIF URLs
const exerciseGifs: Record<string, string> = {
  'Deadlift': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
  'Pull-Ups / Assisted Pull-Ups': 'https://media.giphy.com/media/4FqBMm3j1VJiE/giphy.gif',
  'Wide Grip Lat Pulldown': 'https://media.giphy.com/media/l41Yv28V0MqJqj5I4/giphy.gif',
  'Seated Cable Row': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
  'ChestSupported Row Machine': 'https://media.giphy.com/media/l41Yv28V0MqJqj5I4/giphy.gif',
  'Straight Arm Pulldown': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
  'Barbell Curl': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
  'Incline Dumbbell Curl': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
  'Hammer Curl': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
  'Cable Curl': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
  'Barbell Bench Press': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
  'Incline Dumbbell Press': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
  'Chest Press Machine': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
  'Incline Smith Machine Press': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
  'Cable Fly': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
  'Pec Deck Fly': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
  'Rope Pushdown': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
  'Overhead Rope Extension': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
  'Skull Crushers': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
  'Dips': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
  'Barbell Squat': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
  'Leg Press': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
  'Romanian Deadlift (RDL)': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
  'Walking Lunges': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
  'Leg Extension': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
  'Leg Curl': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
  'Standing Calf Raise': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
  'Dumbbell Shoulder Press': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
  'Lateral Raise': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
  'Rear Delt Fly Machine': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
  'Face Pull': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
  'Shrugs': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif'
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { goal, experience, daysPerWeek, weightKg } = body;

    const safeDays = Math.min(Math.max(Number(daysPerWeek) || 3, 1), 6);
    const safeWeight = Number(weightKg) || 70;

    const workoutPlan = generateSpecificPlan(safeDays, safeWeight, goal, experience);

    return NextResponse.json({ success: true, plan: workoutPlan });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate workout plan' },
      { status: 500 }
    );
  }
}

function generateSpecificPlan(days: number, weight: number, goal: string, experience: string) {
  const coreRoutine = [
    {
      day: 'Monday / Thursday',
      focus: 'Back + Biceps',
      exercises: [
        { name: 'Deadlift', sets: 4, reps: '5-6', rest: '180s', muscles: ['Back', 'Legs'], estimatedTime: 15, estimatedCalories: 100, gifUrl: exerciseGifs['Deadlift'] },
        { name: 'Pull-Ups / Assisted Pull-Ups', sets: 4, reps: 'Failure', rest: '90s', muscles: ['Back'], estimatedTime: 10, estimatedCalories: 60, gifUrl: exerciseGifs['Pull-Ups / Assisted Pull-Ups'] },
        { name: 'Wide Grip Lat Pulldown', sets: 4, reps: '10-12', rest: '90s', muscles: ['Back'], estimatedTime: 10, estimatedCalories: 60, gifUrl: exerciseGifs['Wide Grip Lat Pulldown'] },
        { name: 'Seated Cable Row', sets: 4, reps: '10', rest: '90s', muscles: ['Back'], estimatedTime: 10, estimatedCalories: 60, gifUrl: exerciseGifs['Seated Cable Row'] },
        { name: 'ChestSupported Row Machine', sets: 3, reps: '10-12', rest: '90s', muscles: ['Back'], estimatedTime: 8, estimatedCalories: 50, gifUrl: exerciseGifs['ChestSupported Row Machine'] },
        { name: 'Straight Arm Pulldown', sets: 3, reps: '12', rest: '60s', muscles: ['Back', 'Triceps'], estimatedTime: 8, estimatedCalories: 50, gifUrl: exerciseGifs['Straight Arm Pulldown'] },
        { name: 'Barbell Curl', sets: 4, reps: '8-10', rest: '60s', muscles: ['Biceps'], estimatedTime: 10, estimatedCalories: 50, gifUrl: exerciseGifs['Barbell Curl'] },
        { name: 'Incline Dumbbell Curl', sets: 3, reps: '10', rest: '60s', muscles: ['Biceps'], estimatedTime: 8, estimatedCalories: 40, gifUrl: exerciseGifs['Incline Dumbbell Curl'] },
        { name: 'Hammer Curl', sets: 3, reps: '12', rest: '60s', muscles: ['Biceps', 'Forearms'], estimatedTime: 8, estimatedCalories: 40, gifUrl: exerciseGifs['Hammer Curl'] },
        { name: 'Cable Curl', sets: 3, reps: '12', rest: '60s', muscles: ['Biceps'], estimatedTime: 8, estimatedCalories: 40, gifUrl: exerciseGifs['Cable Curl'] }
      ]
    },
    // ... Add other days with gifUrl for each exercise
  ];

  // ... Rest of your code

  return {
    goal,
    experience,
    notes: "1. Progressive Overload: Increase Weight, Reps, or Control every 1-2 weeks.\n2. Duration: 60-90 minutes. Don't train too long.",
    weekPlan: finalRoutine,
    createdAt: new Date().toISOString()
  };
}