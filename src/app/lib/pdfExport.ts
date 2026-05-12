export async function exportToPDF(plan: any) {
  // Simple text-based PDF export
  let content = `WORKOUT PLAN\n`;
  content += `================\n\n`;
  content += `Goal: ${plan.goal}\n`;
  content += `Experience: ${plan.experience}\n`;
  content += `Generated: ${new Date(plan.createdAt).toLocaleDateString()}\n\n`;
  
  plan.weekPlan.forEach((day: any, index: number) => {
    content += `${day.day} - ${day.focus}\n`;
    content += `-`.repeat(40) + `\n`;
    
    day.exercises.forEach((ex: any, exIndex: number) => {
      content += `${exIndex + 1}. ${ex.name}\n`;
      content += `   Muscles: ${ex.muscles.join(', ')}\n`;
      content += `   Sets: ${ex.sets} × Reps: ${ex.reps}\n`;
      content += `   Rest: ${ex.rest}\n`;
      content += `   Time: ${ex.estimatedTime} min | Calories: ${ex.estimatedCalories}\n\n`;
    });
    
    content += `\n`;
  });
  
  // Create download
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `workout-plan-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}