import { NextResponse } from 'next/server';

// GIF Dictionary - Map exercise names to GIF URLs
const exerciseGifs: Record<string, string> = {
  'Deadlift': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
  'Pull-Ups / Assisted Pull-Ups': 'https://media.giphy.com/media/4FqBMm3j1VJiE/giphy.gif',
  'Wide Grip Lat Pulldown': 'https://media.giphy.com/media/l41Yv28V0MqJqj5I4/giphy.gif',
  'Seated Cable Row': 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
  'Chest Supported Row Machine': 'https://media.giphy.com/media/l41Yv28V0MqJqj5I4/giphy.gif',
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
        { name: 'Chest Supported Row Machine', sets: 3, reps: '10-12', rest: '90s', muscles: ['Back'], estimatedTime: 8, estimatedCalories: 50, gifUrl: exerciseGifs['Chest Supported Row Machine'] },
        { name: 'Straight Arm Pulldown', sets: 3, reps: '12', rest: '60s', muscles: ['Back', 'Triceps'], estimatedTime: 8, estimatedCalories: 50, gifUrl: exerciseGifs['Straight Arm Pulldown'] },
        { name: 'Barbell Curl', sets: 4, reps: '8-10', rest: '60s', muscles: ['Biceps'], estimatedTime: 10, estimatedCalories: 50, gifUrl: exerciseGifs['Barbell Curl'] },
        { name: 'Incline Dumbbell Curl', sets: 3, reps: '10', rest: '60s', muscles: ['Biceps'], estimatedTime: 8, estimatedCalories: 40, gifUrl: exerciseGifs['Incline Dumbbell Curl'] },
        { name: 'Hammer Curl', sets: 3, reps: '12', rest: '60s', muscles: ['Biceps', 'Forearms'], estimatedTime: 8, estimatedCalories: 40, gifUrl: exerciseGifs['Hammer Curl'] },
        { name: 'Cable Curl', sets: 3, reps: '12', rest: '60s', muscles: ['Biceps'], estimatedTime: 8, estimatedCalories: 40, gifUrl: exerciseGifs['Cable Curl'] }
      ]
    },
    {
      day: 'Tuesday / Friday',
      focus: 'Chest + Triceps',
      exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: '6-8', rest: '180s', muscles: ['Chest', 'Triceps'], estimatedTime: 15, estimatedCalories: 100, gifUrl: exerciseGifs['Barbell Bench Press'] },
        { name: 'Incline Dumbbell Press', sets: 4, reps: '8-10', rest: '90s', muscles: ['Chest'], estimatedTime: 12, estimatedCalories: 80, gifUrl: exerciseGifs['Incline Dumbbell Press'] },
        { name: 'Chest Press Machine', sets: 3, reps: '10', rest: '90s', muscles: ['Chest'], estimatedTime: 10, estimatedCalories: 60, gifUrl: exerciseGifs['Chest Press Machine'] },
        { name: 'Incline Smith Machine Press', sets: 3, reps: '10', rest: '90s', muscles: ['Chest'], estimatedTime: 10, estimatedCalories: 60, gifUrl: exerciseGifs['Incline Smith Machine Press'] },
        { name: 'Cable Fly', sets: 3, reps: '12-15', rest: '60s', muscles: ['Chest'], estimatedTime: 8, estimatedCalories: 50, gifUrl: exerciseGifs['Cable Fly'] },
        { name: 'Pec Deck Fly', sets: 3, reps: '12', rest: '60s', muscles: ['Chest'], estimatedTime: 8, estimatedCalories: 50, gifUrl: exerciseGifs['Pec Deck Fly'] },
        { name: 'Rope Pushdown', sets: 4, reps: '10-12', rest: '60s', muscles: ['Triceps'], estimatedTime: 10, estimatedCalories: 50, gifUrl: exerciseGifs['Rope Pushdown'] },
        { name: 'Overhead Rope Extension', sets: 3, reps: '10-12', rest: '60s', muscles: ['Triceps'], estimatedTime: 8, estimatedCalories: 40, gifUrl: exerciseGifs['Overhead Rope Extension'] },
        { name: 'Skull Crushers', sets: 3, reps: '10', rest: '60s', muscles: ['Triceps'], estimatedTime: 8, estimatedCalories: 40, gifUrl: exerciseGifs['Skull Crushers'] },
        { name: 'Dips', sets: 3, reps: 'Failure', rest: '90s', muscles: ['Triceps', 'Chest'], estimatedTime: 8, estimatedCalories: 50, gifUrl: exerciseGifs['Dips'] }
      ]
    },
    {
      day: 'Wednesday / Saturday',
      focus: 'Legs + Shoulders',
      exercises: [
        { name: 'Barbell Squat', sets: 4, reps: '6-8', rest: '180s', muscles: ['Legs'], estimatedTime: 15, estimatedCalories: 120, gifUrl: exerciseGifs['Barbell Squat'] },
        { name: 'Leg Press', sets: 4, reps: '10', rest: '120s', muscles: ['Legs'], estimatedTime: 12, estimatedCalories: 80, gifUrl: exerciseGifs['Leg Press'] },
        { name: 'Romanian Deadlift (RDL)', sets: 4, reps: '8-10', rest: '120s', muscles: ['Legs', 'Back'], estimatedTime: 12, estimatedCalories: 80, gifUrl: exerciseGifs['Romanian Deadlift (RDL)'] },
        { name: 'Walking Lunges', sets: 3, reps: '12 steps/leg', rest: '90s', muscles: ['Legs', 'Glutes'], estimatedTime: 10, estimatedCalories: 70, gifUrl: exerciseGifs['Walking Lunges'] },
        { name: 'Leg Extension', sets: 3, reps: '12', rest: '60s', muscles: ['Legs'], estimatedTime: 8, estimatedCalories: 50, gifUrl: exerciseGifs['Leg Extension'] },
        { name: 'Leg Curl', sets: 3, reps: '12', rest: '60s', muscles: ['Legs'], estimatedTime: 8, estimatedCalories: 50, gifUrl: exerciseGifs['Leg Curl'] },
        { name: 'Standing Calf Raise', sets: 4, reps: '15', rest: '60s', muscles: ['Calves'], estimatedTime: 8, estimatedCalories: 40, gifUrl: exerciseGifs['Standing Calf Raise'] },
        { name: 'Dumbbell Shoulder Press', sets: 4, reps: '8-10', rest: '90s', muscles: ['Shoulders'], estimatedTime: 10, estimatedCalories: 60, gifUrl: exerciseGifs['Dumbbell Shoulder Press'] },
        { name: 'Lateral Raise', sets: 4, reps: '12-15', rest: '60s', muscles: ['Shoulders'], estimatedTime: 8, estimatedCalories: 40, gifUrl: exerciseGifs['Lateral Raise'] },
        { name: 'Rear Delt Fly Machine', sets: 3, reps: '12', rest: '60s', muscles: ['Shoulders'], estimatedTime: 8, estimatedCalories: 40, gifUrl: exerciseGifs['Rear Delt Fly Machine'] },
        { name: 'Face Pull', sets: 3, reps: '15', rest: '60s', muscles: ['Shoulders', 'Back'], estimatedTime: 8, estimatedCalories: 40, gifUrl: exerciseGifs['Face Pull'] },
        { name: 'Shrugs', sets: 3, reps: '12', rest: '60s', muscles: ['Traps'], estimatedTime: 6, estimatedCalories: 30, gifUrl: exerciseGifs['Shrugs'] }
      ]
    }
  ];

  let finalRoutine = coreRoutine.slice(0, days);
  
  if (days === 6) {
    finalRoutine = [
      { ...coreRoutine[0], day: 'Monday' },
      { ...coreRoutine[1], day: 'Tuesday' },
      { ...coreRoutine[2], day: 'Wednesday' },
      { ...coreRoutine[0], day: 'Thursday' },
      { ...coreRoutine[1], day: 'Friday' },
      { ...coreRoutine[2], day: 'Saturday' }
    ];
  }

  return {
    goal,
    experience,
    notes: "1. Progressive Overload: Increase Weight, Reps, or Control every 1-2 weeks.\n2. Duration: 60-90 minutes. Don't train too long.",
    weekPlan: finalRoutine,
    createdAt: new Date().toISOString()
  };
}