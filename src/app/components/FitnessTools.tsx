'use client';

import { useState, useEffect } from 'react';

export default function FitnessTools() {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  // BMI State
  const [bmiHeight, setBmiHeight] = useState(170);
  const [bmiWeight, setBmiWeight] = useState(70);
  const bmi = (bmiWeight / ((bmiHeight / 100) ** 2)).toFixed(1);
  
  // Calorie State
  const [calWeight, setCalWeight] = useState(70);
  const [calAge, setCalAge] = useState(25);
  const [calHeight, setCalHeight] = useState(170);
  const [calGender, setCalGender] = useState<'male' | 'female'>('male');
  const [calActivity, setCalActivity] = useState(1.55);
  const tdee = calculateTDEE(calWeight, calHeight, calAge, calGender, calActivity);
  
  // 1RM State
  const [oneRmWeight, setOneRmWeight] = useState(100);
  const [oneRmReps, setOneRmReps] = useState(5);
  const oneRm = Math.round(oneRmWeight * (1 + oneRmReps / 30));
  
  // Rest Timer State
  const [restSeconds, setRestSeconds] = useState(90);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);
  
  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  // Hydration State
  const [glasses, setGlasses] = useState(0);
  const [goal, setGoal] = useState(8);

  useEffect(() => {
    const saved = localStorage.getItem('hydration_glasses');
    const savedGoal = localStorage.getItem('hydration_goal');
    if (saved) setGlasses(parseInt(saved));
    if (savedGoal) setGoal(parseInt(savedGoal));
  }, []);

  const addGlass = () => {
    const newCount = glasses + 1;
    setGlasses(newCount);
    localStorage.setItem('hydration_glasses', newCount.toString());
  };

  const resetGlasses = () => {
    setGlasses(0);
    localStorage.setItem('hydration_glasses', '0');
  };

  // Macros State
  const [calories, setCalories] = useState(2000);
  const macroSplit = calculateMacros(calories);

  // Measurements State
  const [measurements, setMeasurements] = useState({
    chest: '',
    waist: '',
    arms: '',
    thighs: '',
  });

  // Stopwatch State
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isStopwatchRunning) {
      interval = setInterval(() => setStopwatchTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isStopwatchRunning]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const renderTool = () => {
    switch(activeTool) {
      case 'bmi':
        return (
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#1a1a1a' }}>Height (cm)</label>
              <input type="range" min="100" max="250" value={bmiHeight} onChange={(e) => setBmiHeight(parseInt(e.target.value))} style={{ width: '100%' }} />
              <p style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>{bmiHeight} cm</p>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#1a1a1a' }}>Weight (kg)</label>
              <input type="range" min="30" max="200" value={bmiWeight} onChange={(e) => setBmiWeight(parseInt(e.target.value))} style={{ width: '100%' }} />
              <p style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>{bmiWeight} kg</p>
            </div>
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px', color: 'white', textAlign: 'center' }}>
              <p style={{ fontSize: '18px', marginBottom: '8px' }}>Your BMI</p>
              <p style={{ fontSize: '64px', fontWeight: 'bold', margin: '16px 0' }}>{bmi}</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{getBMICategory(parseFloat(bmi))}</p>
            </div>
          </div>
        );
      
      case 'calories':
        return (
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Gender</label>
              <select value={calGender} onChange={(e) => setCalGender(e.target.value as any)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e5e7eb' }}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Age: {calAge} years</label>
              <input type="range" min="15" max="80" value={calAge} onChange={(e) => setCalAge(parseInt(e.target.value))} style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Weight: {calWeight} kg</label>
              <input type="range" min="30" max="200" value={calWeight} onChange={(e) => setCalWeight(parseInt(e.target.value))} style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Activity Level</label>
              <select value={calActivity} onChange={(e) => setCalActivity(parseFloat(e.target.value))} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e5e7eb' }}>
                <option value={1.2}>Sedentary</option>
                <option value={1.375}>Light</option>
                <option value={1.55}>Moderate</option>
                <option value={1.725}>Active</option>
                <option value={1.9}>Very Active</option>
              </select>
            </div>
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '16px', color: 'white', textAlign: 'center' }}>
              <p style={{ fontSize: '18px', marginBottom: '8px' }}>Daily Calorie Needs</p>
              <p style={{ fontSize: '64px', fontWeight: 'bold', margin: '16px 0' }}>{Math.round(tdee)}</p>
              <p style={{ fontSize: '16px' }}>calories/day</p>
            </div>
          </div>
        );
      
      case 'onerm':
        return (
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Weight: {oneRmWeight} kg</label>
              <input type="range" min="10" max="300" value={oneRmWeight} onChange={(e) => setOneRmWeight(parseInt(e.target.value))} style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Reps: {oneRmReps}</label>
              <input type="range" min="1" max="15" value={oneRmReps} onChange={(e) => setOneRmReps(parseInt(e.target.value))} style={{ width: '100%' }} />
            </div>
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: '16px', color: 'white', textAlign: 'center' }}>
              <p style={{ fontSize: '18px', marginBottom: '8px' }}>1 Rep Max</p>
              <p style={{ fontSize: '64px', fontWeight: 'bold', margin: '16px 0' }}>{oneRm} kg</p>
            </div>
          </div>
        );
      
      case 'rest':
        return (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '16px' }}>Rest Time: {restSeconds}s</label>
              <input type="range" min="30" max="300" step="30" value={restSeconds} onChange={(e) => {
                const val = parseInt(e.target.value);
                setRestSeconds(val);
                if (!isTimerRunning) setTimeLeft(val);
              }} style={{ width: '100%' }} />
            </div>
            <div style={{ padding: '40px', background: isTimerRunning ? '#fee2e2' : '#d1fae5', borderRadius: '24px', marginBottom: '24px' }}>
              <p style={{ fontSize: '96px', fontWeight: 'bold', color: isTimerRunning ? '#dc2626' : '#059669', margin: 0, fontFamily: 'monospace' }}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {!isTimerRunning ? (
                <button onClick={() => { setTimeLeft(restSeconds); setIsTimerRunning(true); }} style={{ padding: '16px 48px', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}>▶️ Start</button>
              ) : (
                <button onClick={() => setIsTimerRunning(false)} style={{ padding: '16px 48px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '12px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}>⏸️ Pause</button>
              )}
              <button onClick={() => { setIsTimerRunning(false); setTimeLeft(restSeconds); }} style={{ padding: '16px 48px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '12px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}>🔄 Reset</button>
            </div>
          </div>
        );
      
      case 'hydration':
        return (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ padding: '32px', background: '#dbeafe', borderRadius: '24px', marginBottom: '24px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>💧</div>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#2563eb' }}>{glasses} / {goal} Glasses</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={addGlass} style={{ padding: '16px 32px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}>+ Add Glass</button>
              <button onClick={resetGlasses} style={{ padding: '16px 32px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}>Reset</button>
            </div>
          </div>
        );
      
      case 'macros':
        return (
          <div style={{ padding: '24px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Daily Calories: {calories}</label>
            <input type="range" min="1000" max="4000" step="100" value={calories} onChange={(e) => setCalories(parseInt(e.target.value))} style={{ width: '100%', marginBottom: '24px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div style={{ padding: '16px', background: '#fee2e2', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc2626' }}>{macroSplit.protein}g</p>
                <p style={{ color: '#991b1b' }}>Protein</p>
              </div>
              <div style={{ padding: '16px', background: '#dbeafe', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#2563eb' }}>{macroSplit.carbs}g</p>
                <p style={{ color: '#1e40af' }}>Carbs</p>
              </div>
              <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#d97706' }}>{macroSplit.fats}g</p>
                <p style={{ color: '#92400e' }}>Fats</p>
              </div>
            </div>
          </div>
        );
      
      case 'measurements':
        return (
          <div style={{ padding: '24px' }}>
            {['chest', 'waist', 'arms', 'thighs'].map(part => (
              <div key={part} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', textTransform: 'capitalize', color: '#1a1a1a' }}>{part} (cm)</label>
                <input 
                  type="number" 
                  value={(measurements as any)[part]} 
                  onChange={(e) => setMeasurements({...measurements, [part]: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e5e7eb', fontSize: '16px' }}
                />
              </div>
            ))}
          </div>
        );
      
      case 'stopwatch':
        return (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '72px', fontWeight: 'bold', color: '#1a1a1a', fontFamily: 'monospace', margin: '32px 0' }}>{formatTime(stopwatchTime)}</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setIsStopwatchRunning(!isStopwatchRunning)} style={{ padding: '16px 48px', background: isStopwatchRunning ? '#f59e0b' : '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}>{isStopwatchRunning ? '⏸️ Pause' : '▶️ Start'}</button>
              <button onClick={() => { setIsStopwatchRunning(false); setStopwatchTime(0); }} style={{ padding: '16px 48px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}>🔄 Reset</button>
            </div>
          </div>
        );
      
      default:
        return <div style={{ padding: 24 }}>Select a tool</div>;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '48px 16px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>🏋️ Fitness Tools</h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px' }}>Your complete fitness dashboard</p>
        </div>

        {!activeTool ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <ToolCard title="BMI Calculator" icon="📊" onClick={() => setActiveTool('bmi')} />
            <ToolCard title="Calories" icon="🔥" onClick={() => setActiveTool('calories')} />
            <ToolCard title="1RM Calculator" icon="💪" onClick={() => setActiveTool('onerm')} />
            <ToolCard title="Rest Timer" icon="⏱️" onClick={() => setActiveTool('rest')} />
            <ToolCard title="Hydration" icon="💧" onClick={() => setActiveTool('hydration')} />
            <ToolCard title="Macro Split" icon="🥗" onClick={() => setActiveTool('macros')} />
            <ToolCard title="Measurements" icon="📏" onClick={() => setActiveTool('measurements')} />
            <ToolCard title="Stopwatch" icon="⏲️" onClick={() => setActiveTool('stopwatch')} />
          </div>
        ) : (
          <ToolView title={activeTool.toUpperCase()} onBack={() => setActiveTool(null)}>
            {renderTool()}
          </ToolView>
        )}
      </div>
    </div>
  );
}

// Helper Components
function ToolCard({ title, icon, onClick }: { title: string; icon: string; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ padding: '32px', background: 'white', borderRadius: '20px', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
      <div style={{ fontSize: '48px', marginBottom: '16px', textAlign: 'center' }}>{icon}</div>
      <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#1a1a1a', textAlign: 'center' }}>{title}</h3>
    </div>
  );
}

function ToolView({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={onBack} style={{ padding: '8px 16px', background: '#e5e7eb', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginRight: '16px' }}>← Back</button>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a', margin: 0 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

// Helper Functions
function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal Weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

function calculateTDEE(weight: number, height: number, age: number, gender: string, activity: number): number {
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  bmr += gender === 'male' ? 5 : -161;
  return bmr * activity;
}

function calculateMacros(cal: number) {
  return {
    protein: Math.round((cal * 0.30) / 4),
    carbs: Math.round((cal * 0.40) / 4),
    fats: Math.round((cal * 0.30) / 9)
  };
}