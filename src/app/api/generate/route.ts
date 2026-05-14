import { NextResponse } from 'next/server';

// GIF Dictionary - Map exercise names to REAL working GIF URLs
const exerciseGifs: Record<string, string> = {
  'Deadlift': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Deadlift.gif',
  'Pull-Ups / Assisted Pull-Ups': 'https://fitliferegime.com/wp-content/uploads/2024/03/Pull-Ups.gif',
  'Wide Grip Lat Pulldown': 'https://media.tenor.com/PVR9ra9tAwcAAAAM/pulley-pegada-aberta.gif', 
  'Seated Cable Row': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Cable-Row.gif', 
  'Chest Supported Row Machine': 'https://fitnessprogramer.com/wp-content/uploads/2021/08/Lever-Reverse-T-Bar-Row.gif',
  'Straight Arm Pulldown': 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Rope-Straight-Arm-Pulldown.gif',
  'Barbell Curl': 'https://gymvisual.com/img/p/5/0/2/7/5027.gif',
  'Incline Dumbbell Curl': 'https://i.pinimg.com/originals/b4/30/64/b43064d9ad9f42493dbcf37e653ab87c.gif',
  'Hammer Curl': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Hammer-Curl.gif',
  'Cable Curl': 'https://cdn.shopify.com/s/files/1/0618/9462/3460/files/cable-curls.gif?v=1741771141',
  'Barbell Bench Press': 'https://www.meridian-fitness.co.uk/wp-content/uploads/2025/01/BenchPress.gif',
  'Incline Dumbbell Press': 'https://www.meridian-fitness.co.uk/wp-content/uploads/2025/02/Dumbbell-Incline-Bench-Press.gif',
  'Chest Press Machine': 'https://app.aspira-fitness.com/api/media/e2ee769b-0419-41b8-85ba-759d53e6aaa7',
  'Incline Smith Machine Press': 'https://i.pinimg.com/originals/ea/b0/14/eab014a84188d4782a43be1ba9a8a0f9.gif',
  'Cable Fly': 'https://i.pinimg.com/originals/06/bc/08/06bc08f20343ec7179604d52c4e0e054.gif',
  'Pec Deck Fly': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pec-Deck-Fly.gif',
  'Rope Pushdown': 'https://fitnessvolt.com/wp-content/plugins/fv-app-core/exercises/360/0201.gif',
  'Overhead Rope Extension': 'https://media.tenor.com/V3J-mg9gH0kAAAAM/seated-dumbbell-triceps-extension.gif',
  'Skull Crushers': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Triceps-Extension.gif',
  'Dips': 'https://fitnessprogramer.com/wp-content/uploads/2021/04/Triceps-Dips-on-Floor.gif',
  'Barbell Squat': 'https://fitnessprogramer.com/wp-content/uploads/2023/01/Barbell-Jump-Squat.gif',
  'Leg Press': 'https://burnfit.io/wp-content/uploads/LEG_PRESS-1.gif',
  'Romanian Deadlift (RDL)': 'https://cdn.shopify.com/s/files/1/0449/8453/3153/files/barbell-deadlift_600x600.gif?v=1690860568',
  'Walking Lunges': 'https://fitnessprogramer.com/wp-content/uploads/2023/09/dumbbell-lunges.gif',
  'Leg Extension': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/LEG-EXTENSION.gif',
  'Leg Curl': 'https://burnfit.io/wp-content/uploads/LEG_CURL.gif',
  'Standing Calf Raise': 'https://fitnessprogramer.com/wp-content/uploads/2022/04/Standing-Barbell-Calf-Raise.gif',
  'Dumbbell Shoulder Press': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shoulder-Press.gif',
  'Lateral Raise': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lateral-Raise.gif',
  'Rear Delt Fly Machine': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/cable-rear-delt-fly.gif',
  'Face Pull': 'https://i.pinimg.com/originals/bb/ad/ae/bbadae1b92108a8024ab8a709e711e14.gif',
  'Shrugs': 'https://fitnessprogramer.com/wp-content/uploads/2021/04/Dumbbell-Shrug.gif'
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