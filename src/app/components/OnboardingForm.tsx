'use client';

import { useState, useEffect } from 'react';

// Receive userId as a prop from the parent (Login Screen)
export default function OnboardingForm({ userId }: { userId: string }) {
  // --- STATE VARIABLES ---
  const [formData, setFormData] = useState({
    goal: 'hypertrophy',
    experience: 'beginner',
    daysPerWeek: 4,
    weightKg: 70,
  });

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [workoutData, setWorkoutData] = useState<any[]>([]);
  const [error, setError] = useState('');

  // Create a unique storage key for this user
  const storageKey = `gym_ai_plans_${userId}`;

  // --- LOAD SAVED PLANS ON STARTUP ---
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setSavedPlans(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load plans:', e);
      }
    }
  }, [userId, storageKey]);

  // --- HANDLE FORM SUBMISSION ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Ensure numbers are valid
    const submitData = {
      goal: formData.goal,
      experience: formData.experience,
      daysPerWeek: Number(formData.daysPerWeek) || 3,
      weightKg: Number(formData.weightKg) || 70,
    };

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (result.plan) {
        const newPlan = {
          id: Date.now().toString(),
          plan: result.plan,
          createdAt: new Date().toISOString(),
          workoutData: [],
        };

        const updatedPlans = [...savedPlans, newPlan];
        // Save to user-specific key
        localStorage.setItem(storageKey, JSON.stringify(updatedPlans));
        setSavedPlans(updatedPlans);

        setPlanId(newPlan.id);
        setPlan(result.plan);
        setWorkoutData([]);
      } else {
        setError('Failed to generate plan. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }

    setLoading(false);
  };

  // --- HANDLE EXERCISE CHECKBOXES ---
  const handleExerciseComplete = (dayIndex: number, exerciseIndex: number, completed: boolean) => {
    const newData = [...workoutData];
    // Initialize array if needed
    while (newData.length <= dayIndex) newData.push([]);
    newData[dayIndex][exerciseIndex] = completed;
    setWorkoutData(newData);

    // Save progress to local storage (User Specific)
    if (planId) {
      const updatedPlans = savedPlans.map((p) =>
        p.id === planId ? { ...p, workoutData: newData } : p
      );
      localStorage.setItem(storageKey, JSON.stringify(updatedPlans));
      setSavedPlans(updatedPlans);
    }
  };

  // --- EXPORT PLAN TO TEXT ---
  const handleExportPDF = () => {
    if (!plan) return;
    let content = `WORKOUT PLAN\n================\n\nGoal: ${plan.goal}\nExperience: ${plan.experience}\n\n`;
    plan.weekPlan.forEach((day: any) => {
      content += `\n${day.day} - ${day.focus}\n${'-'.repeat(40)}\n`;
      day.exercises.forEach((ex: any, i: number) => {
        content += `${i + 1}. ${ex.name}\n   Sets: ${ex.sets} × Reps: ${ex.reps}\n`;
      });
    });
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gym-plan-${Date.now()}.txt`;
    a.click();
  };

  // --- LOAD A PLAN FROM HISTORY ---
  const loadPlan = (savedPlan: any) => {
    setPlan(savedPlan.plan);
    setPlanId(savedPlan.id);
    setWorkoutData(savedPlan.workoutData || []);
    setShowHistory(false);
  };

  // --- DELETE A PLAN FROM HISTORY ---
  const deleteSavedPlan = (id: string) => {
    const updated = savedPlans.filter((p) => p.id !== id);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setSavedPlans(updated);
    if (planId === id) {
      setPlan(null);
      setPlanId(null);
    }
  };

  // --- CALCULATE STATS ---
  const totalTime = plan?.weekPlan.reduce((acc: number, day: any, di: number) =>
    acc + day.exercises.reduce((sum: number, ex: any, ei: number) =>
      workoutData[di]?.[ei] ? sum + (ex.estimatedTime || 0) : sum, 0
    ), 0
  ) || 0;

  const totalCalories = plan?.weekPlan.reduce((acc: number, day: any, di: number) =>
    acc + day.exercises.reduce((sum: number, ex: any, ei: number) =>
      workoutData[di]?.[ei] ? sum + (ex.estimatedCalories || 0) : sum, 0
    ), 0
  ) || 0;

  const completedCount = workoutData.flat().filter(Boolean).length;
  const totalCount = plan?.weekPlan.reduce((acc: number, day: any) => acc + day.exercises.length, 0) || 0;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // ================= RENDER LOGIC =================

  // 1. SHOW HISTORY VIEW
  if (showHistory) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '48px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '640px', width: '100%', background: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a', margin: 0 }}>📚 Workout History</h2>
            <button onClick={() => setShowHistory(false)} style={{ padding: '10px 20px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>← Back</button>
          </div>
          
          {savedPlans.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '18px', padding: '40px' }}>No saved plans yet. Create one!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {savedPlans.map((savedPlan) => (
                <div key={savedPlan.id} style={{ padding: '20px', background: '#f9fafb', borderRadius: '12px', border: '2px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 8px 0' }}>{savedPlan.plan.goal}</h3>
                    <p style={{ color: '#6b7280', margin: 0 }}>{savedPlan.plan.weekPlan.length} days • {savedPlan.plan.experience}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => loadPlan(savedPlan)} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Load</button>
                    <button onClick={() => deleteSavedPlan(savedPlan.id)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. SHOW PLAN RESULT VIEW
  if (plan) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '48px 16px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a', margin: 0 }}>✅ Your Workout Plan</h2>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={() => setShowHistory(true)} style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>📚 History</button>
              <button onClick={handleExportPDF} style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>📄 Export</button>
              <button onClick={() => setPlan(null)} style={{ padding: '10px 20px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>New Plan</button>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: '32px', padding: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontWeight: 'bold' }}>
              <span>Progress</span>
              <span>{completedCount}/{totalCount} Exercises</span>
            </div>
            <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.3)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: '#10b981', transition: 'width 0.5s' }}></div>
            </div>
            <div style={{ display: 'flex', gap: '24px', marginTop: '12px', fontSize: '14px' }}>
              <span>⏱️ {totalTime} min</span>
              <span>🔥 {totalCalories} cal</span>
            </div>
          </div>

          {/* Exercises List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {plan.weekPlan.map((day: any, dayIndex: number) => (
              <div key={dayIndex} style={{ padding: '24px', background: '#f9fafb', borderRadius: '16px', border: '2px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea', marginBottom: '16px' }}>{day.day} - {day.focus}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {day.exercises.map((exercise: any, exIndex: number) => {
                    const isCompleted = workoutData[dayIndex]?.[exIndex] || false;
                    return (
                      <div key={exIndex} style={{ padding: '16px', background: isCompleted ? '#d1fae5' : 'white', borderRadius: '12px', border: `2px solid ${isCompleted ? '#10b981' : '#e5e7eb'}`, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <input type="checkbox" checked={isCompleted} onChange={(e) => handleExerciseComplete(dayIndex, exIndex, e.target.checked)} style={{ width: '24px', height: '24px', cursor: 'pointer' }} />
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: isCompleted ? '#6b7280' : '#1a1a1a', margin: '0 0 4px 0', textDecoration: isCompleted ? 'line-through' : 'none' }}>{exercise.name}</h4>
                          <p style={{ color: '#6b7280', margin: '0 0 4px 0' }}>🎯 {exercise.muscles.join(', ')}</p>
                          <p style={{ color: '#6b7280', margin: '0' }}>📊 {exercise.sets} sets × {exercise.reps} reps</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Fitness Tools Button */}
          <div style={{ marginTop: '40px', textAlign: 'center', paddingTop: '24px', borderTop: '2px solid #e5e7eb' }}>
            <button 
              onClick={() => window.location.href = '/tools'} 
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', padding: '12px 32px', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              🛠️ Open Fitness Tools
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. SHOW FORM INPUT VIEW
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '48px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '640px', width: '100%', background: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '8px' }}>🏋️ Gym AI</h1>
          <p style={{ color: '#666', fontSize: '18px' }}>Build your personalized workout plan</p>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #ef4444', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Goal Select */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#1a1a1a' }}>What's your goal?</label>
            <select 
              value={formData.goal} 
              onChange={(e) => setFormData({...formData, goal: e.target.value})} 
              style={{ width: '100%', padding: '16px', border: '2px solid #e5e5e5', borderRadius: '12px', fontSize: '16px', color: '#1a1a1a', backgroundColor: 'white' }}
            >
              <option value="strength">💪 Build Strength</option>
              <option value="hypertrophy">🏋️ Build Muscle</option>
              <option value="fat_loss">🔥 Lose Fat</option>
              <option value="general_fitness">❤️ General Fitness</option>
            </select>
          </div>

          {/* Experience Select */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#1a1a1a' }}>Experience Level</label>
            <select 
              value={formData.experience} 
              onChange={(e) => setFormData({...formData, experience: e.target.value})} 
              style={{ width: '100%', padding: '16px', border: '2px solid #e5e5e5', borderRadius: '12px', fontSize: '16px', color: '#1a1a1a', backgroundColor: 'white' }}
            >
              <option value="beginner">🌱 Beginner</option>
              <option value="intermediate">🚀 Intermediate</option>
              <option value="advanced">🔥 Advanced</option>
            </select>
          </div>

          {/* Days Slider */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '12px', color: '#1a1a1a' }}>
              Days per week: <span style={{ color: '#667eea', fontSize: '20px' }}>{Number(formData.daysPerWeek)}</span>
            </label>
            <input 
              type="range" min="2" max="6" step="1" 
              value={Number(formData.daysPerWeek)} 
              onChange={(e) => setFormData({...formData, daysPerWeek: parseInt(e.target.value)})} 
              style={{ width: '100%', height: '8px', borderRadius: '4px', background: '#e5e5e5', outline: 'none' }} 
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '14px', color: '#6b7280' }}>
              <span>2 days</span>
              <span>6 days</span>
            </div>
          </div>

          {/* Weight Input */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#1a1a1a' }}>Your weight (kg)</label>
            <input 
              type="number" 
              value={Number(formData.weightKg) || 70} 
              onChange={(e) => setFormData({...formData, weightKg: parseInt(e.target.value)})} 
              placeholder="70" 
              style={{ width: '100%', padding: '16px', border: '2px solid #e5e5e5', borderRadius: '12px', fontSize: '16px', color: '#1a1a1a', backgroundColor: 'white' }} 
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading} 
            style={{ width: '100%', padding: '20px', background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '20px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Generating...' : 'Generate My Plan 🚀'}
          </button>
        </form>

        {/* Fitness Tools Button */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button 
            onClick={() => window.location.href = '/tools'} 
            style={{ background: 'none', border: 'none', color: '#667eea', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
          >
            🛠️ Fitness Tools
          </button>
        </div>
      </div>
    </div>
  );
}