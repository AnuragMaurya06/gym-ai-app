'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [inputId, setInputId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Form & Plan State
  const [formData, setFormData] = useState({ goal: 'hypertrophy', experience: 'beginner', daysPerWeek: 4, weightKg: 70 });
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [workoutData, setWorkoutData] = useState<any[]>([]);
  const [error, setError] = useState('');

  const storageKey = `gym_ai_plans_${userId || 'guest'}`;

  useEffect(() => {
    const savedId = localStorage.getItem('gym-ai-user-id');
    if (savedId) setUserId(savedId);
    if (savedId) {
      const stored = localStorage.getItem(`gym_ai_plans_${savedId}`);
      if (stored) try { setSavedPlans(JSON.parse(stored)); } catch {}
    }
    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    if (!inputId.trim()) return alert('Please enter a username');
    const cleanId = inputId.trim().toLowerCase();
    setUserId(cleanId);
    localStorage.setItem('gym-ai-user-id', cleanId);
    const stored = localStorage.getItem(`gym_ai_plans_${cleanId}`);
    if (stored) try { setSavedPlans(JSON.parse(stored)); } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem('gym-ai-user-id');
    setUserId(null);
    setInputId('');
    setPlan(null);
    setShowHistory(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        goal: String(formData.goal),
        experience: String(formData.experience),
        daysPerWeek: Number(formData.daysPerWeek),
        weightKg: Number(formData.weightKg)
      };

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.plan) {
        throw new Error('No workout plan received');
      }

      const newPlan = {
        id: Date.now().toString(),
        plan: data.plan,
        createdAt: new Date().toISOString(),
        workoutData: []
      };

      const updated = [...savedPlans, newPlan];
      setSavedPlans(updated);
      
      if (userId) {
        localStorage.setItem(`gym_ai_plans_${userId}`, JSON.stringify(updated));
      }
      
      setPlanId(newPlan.id);
      setPlan(data.plan);
      setWorkoutData([]);

    } catch (err) {
      console.error('Full error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = (di: number, ei: number, checked: boolean) => {
    const nd = [...workoutData];
    while (nd.length <= di) nd.push([]);
    nd[di][ei] = checked;
    setWorkoutData(nd);
    if (planId) {
      const up = savedPlans.map(p => p.id === planId ? { ...p, workoutData: nd } : p);
      setSavedPlans(up);
      if (userId) {
        localStorage.setItem(`gym_ai_plans_${userId}`, JSON.stringify(up));
      }
    }
  };

  const completed = workoutData.flat().filter(Boolean).length;
  const total = plan?.weekPlan.reduce((a: number, d: any) => a + d.exercises.length, 0) || 0;
  const pct = total > 0 ? (completed / total) * 100 : 0;

  if (isLoading) return <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px'}}>Loading...</div>;
  
  if (!userId) {
    return (
      <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
        <div style={{background:'white',padding:'50px',borderRadius:'30px',width:'100%',maxWidth:'450px',textAlign:'center',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
          <div style={{fontSize:'64px',marginBottom:'16px'}}>🏋️</div>
          <h1 style={{fontSize:'36px',fontWeight:'bold',marginBottom:'12px',background:'linear-gradient(135deg,#667eea,#764ba2)',WebkitBackgroundClip:'text',backgroundClip:'text',color:'transparent'}}>Gym AI</h1>
          <p style={{color:'#666',marginBottom:'32px',fontSize:'16px'}}>Enter your unique ID to access your fitness journey</p>
          <input type="text" value={inputId} onChange={e=>setInputId(e.target.value)} placeholder="Enter username (e.g., anurag007)" style={{width:'100%',padding:'18px',borderRadius:'15px',border:'3px solid #e5e7eb',fontSize:'16px',marginBottom:'20px',textAlign:'center',boxSizing:'border-box',color:'#111827',backgroundColor:'white'}} onKeyDown={e=>e.key==='Enter'&&handleLogin()} autoFocus/>
          <button onClick={handleLogin} style={{width:'100%',padding:'18px',background:'linear-gradient(135deg,#667eea,#764ba2)',color:'white',border:'none',borderRadius:'15px',fontSize:'18px',fontWeight:'bold',cursor:'pointer',boxShadow:'0 4px 15px rgba(102,126,234,0.4)'}}>Start Training 🚀</button>
        </div>
      </div>
    );
  }

  if (showHistory) {
    return (
      <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',padding:'40px'}}>
        <div style={{maxWidth:'700px',margin:'0 auto',background:'white',borderRadius:'30px',padding:'40px',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
            <h2 style={{margin:0,fontSize:'32px',color:'#667eea'}}>📚 Workout History</h2>
            <button onClick={()=>setShowHistory(false)} style={{padding:'12px 24px',background:'#6b7280',color:'white',border:'none',borderRadius:'12px',fontWeight:'bold',cursor:'pointer'}}>← Back</button>
          </div>
          {savedPlans.length===0 ? <p style={{textAlign:'center',color:'#999',fontSize:'18px',padding:'40px'}}>No saved plans yet.</p> : savedPlans.map(p=>(
            <div key={p.id} style={{padding:'24px',background:'linear-gradient(135deg,#f9fafb,#f3f4f6)',borderRadius:'16px',marginBottom:'16px',border:'2px solid #e5e7eb'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'12px'}}>
                <div>
                  <h3 style={{margin:'0 0 8px 0',fontSize:'20px',color:'#667eea',fontWeight:'bold'}}>{p.plan.goal}</h3>
                  <p style={{margin:0,color:'#666',fontSize:'14px'}}>{p.plan.weekPlan.length} days • {p.plan.experience}</p>
                </div>
                <div style={{display:'flex',gap:'10px'}}>
                  <button onClick={()=>{setPlan(p.plan);setPlanId(p.id);setWorkoutData(p.workoutData||[]);setShowHistory(false);}} style={{padding:'10px 20px',background:'linear-gradient(135deg,#3b82f6,#2563eb)',color:'white',border:'none',borderRadius:'10px',fontWeight:'bold',cursor:'pointer'}}>Load</button>
                  <button onClick={()=>{const up=savedPlans.filter(x=>x.id!==p.id);setSavedPlans(up);if(userId)localStorage.setItem(`gym_ai_plans_${userId}`,JSON.stringify(up));}} style={{padding:'10px 20px',background:'#ef4444',color:'white',border:'none',borderRadius:'10px',fontWeight:'bold',cursor:'pointer'}}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (plan) {
    return (
      <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',padding:'40px'}}>
        <div style={{maxWidth:'900px',margin:'0 auto',background:'white',borderRadius:'30px',padding:'40px',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px',flexWrap:'wrap',gap:'16px'}}>
            <h2 style={{margin:0,fontSize:'32px',color:'#667eea'}}>✅ Your Workout Plan</h2>
            <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
              <button onClick={()=>setShowHistory(true)} style={{padding:'12px 20px',background:'linear-gradient(135deg,#667eea,#764ba2)',color:'white',border:'none',borderRadius:'10px',fontWeight:'bold',cursor:'pointer'}}>📚 History</button>
              <button onClick={()=>{setPlan(null);setPlanId(null);}} style={{padding:'12px 20px',background:'#6b7280',color:'white',border:'none',borderRadius:'10px',fontWeight:'bold',cursor:'pointer'}}>New Plan</button>
              <button onClick={()=>window.location.href='/tools'} style={{padding:'12px 20px',background:'linear-gradient(135deg,#10b981,#059669)',color:'white',border:'none',borderRadius:'10px',fontWeight:'bold',cursor:'pointer'}}>🛠️ Tools</button>
            </div>
          </div>
          <div style={{padding:'24px',background:'linear-gradient(135deg,#667eea,#764ba2)',borderRadius:'20px',color:'white',marginBottom:'32px',boxShadow:'0 4px 15px rgba(102,126,234,0.3)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
              <span style={{fontSize:'18px',fontWeight:'bold'}}>Progress</span>
              <span style={{fontSize:'18px',fontWeight:'bold'}}>{completed}/{total}</span>
            </div>
            <div style={{height:'16px',background:'rgba(255,255,255,0.3)',borderRadius:'10px',overflow:'hidden'}}>
              <div style={{width:`${pct}%`,height:'100%',background:'linear-gradient(90deg,#10b981,#059669)',transition:'width 0.5s',borderRadius:'10px'}}></div>
            </div>
            <div style={{marginTop:'12px',fontSize:'14px',opacity:0.9}}>🔥 {Math.round(pct)}% Complete</div>
          </div>
          {plan.weekPlan.map((day:any,di:number)=>(
            <div key={di} style={{padding:'28px',background:'linear-gradient(135deg,#f9fafb,#f3f4f6)',borderRadius:'20px',marginBottom:'20px',border:'2px solid #e5e7eb'}}>
              <h3 style={{color:'#667eea',margin:'0 0 20px 0',fontSize:'24px',fontWeight:'bold'}}>📅 {day.day} - {day.focus}</h3>
              {day.exercises.map((ex:any,ei:number)=>{
                const done = workoutData[di]?.[ei] || false;
                return (
                  <div key={ei} style={{padding:'16px',background:done?'linear-gradient(135deg,#d1fae5,#a7f3d0)':'white',borderRadius:'14px',border:`2px solid ${done?'#10b981':'#e5e7eb'}`,marginBottom:'12px',display:'flex',alignItems:'center',gap:'16px',transition:'all 0.3s',boxShadow:done?'0 2px 8px rgba(16,185,129,0.2)':'none'}}>
                    <input type="checkbox" checked={done} onChange={e=>handleCheck(di,ei,e.target.checked)} style={{width:'24px',height:'24px',cursor:'pointer',accentColor:'#10b981'}}/>
                    
                    {/* GIF Image */}
                    {ex.gifUrl && (
                      <div style={{flexShrink:0}}>
                        <img 
                          src={ex.gifUrl} 
                          alt={`${ex.name} demo`}
                          style={{
                            width:'80px',
                            height:'80px',
                            borderRadius:'12px',
                            objectFit:'cover',
                            border:'2px solid #e5e7eb',
                            backgroundColor:'#f9fafb'
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div style={{flex:1}}>
                      <b style={{fontSize:'18px',textDecoration:done?'line-through':'none',color:done?'#6b7280':'#111',display:'block',marginBottom:'6px'}}>{ex.name}</b>
                      <div style={{color:'#666',fontSize:'14px'}}>🎯 {ex.muscles.join(', ')} • 📊 {ex.sets} sets × {ex.reps} reps</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',padding:'40px'}}>
      <div style={{maxWidth:'700px',margin:'0 auto',background:'white',borderRadius:'30px',padding:'50px',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <span style={{fontSize:'40px'}}>🏋️</span>
            <h1 style={{margin:0,fontSize:'32px',background:'linear-gradient(135deg,#667eea,#764ba2)',WebkitBackgroundClip:'text',backgroundClip:'text',color:'transparent',fontWeight:'bold'}}>Gym AI</h1>
          </div>
          <button onClick={handleLogout} style={{padding:'12px 24px',background:'linear-gradient(135deg,#ef4444,#dc2626)',color:'white',border:'none',borderRadius:'12px',fontWeight:'bold',cursor:'pointer',boxShadow:'0 4px 12px rgba(239,68,68,0.3)'}}>🚪 Logout</button>
        </div>
        {error && <div style={{background:'linear-gradient(135deg,#fee2e2,#fecaca)',color:'#dc2626',padding:'16px',borderRadius:'12px',marginBottom:'24px',textAlign:'center',fontWeight:'bold',border:'2px solid #ef4444'}}>{error}</div>}
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'24px'}}>
          <div>
            <label style={{fontWeight:'bold',display:'block',marginBottom:'10px',color:'#667eea',fontSize:'16px'}}>🎯 What's your goal?</label>
            <select value={formData.goal} onChange={e=>setFormData({...formData,goal:e.target.value})} style={{width:'100%',padding:'16px',borderRadius:'14px',border:'3px solid #e5e7eb',fontSize:'16px',backgroundColor:'white',color:'#111827',cursor:'pointer'}}>
              <option value="strength">💪 Build Strength</option>
              <option value="hypertrophy">🏋️ Build Muscle</option>
              <option value="fat_loss">🔥 Lose Fat</option>
              <option value="general_fitness">❤️ General Fitness</option>
            </select>
          </div>
          <div>
            <label style={{fontWeight:'bold',display:'block',marginBottom:'10px',color:'#667eea',fontSize:'16px'}}>📊 Experience Level</label>
            <select value={formData.experience} onChange={e=>setFormData({...formData,experience:e.target.value})} style={{width:'100%',padding:'16px',borderRadius:'14px',border:'3px solid #e5e7eb',fontSize:'16px',backgroundColor:'white',color:'#111827',cursor:'pointer'}}>
              <option value="beginner">🌱 Beginner</option>
              <option value="intermediate">🚀 Intermediate</option>
              <option value="advanced">🔥 Advanced</option>
            </select>
          </div>
          <div>
            <label style={{fontWeight:'bold',display:'block',marginBottom:'10px',color:'#667eea',fontSize:'16px'}}>📅 Days per Week: <span style={{color:'#667eea',fontSize:'20px',fontWeight:'bold'}}>{formData.daysPerWeek}</span></label>
            <input type="range" min="2" max="6" value={formData.daysPerWeek} onChange={e=>setFormData({...formData,daysPerWeek:parseInt(e.target.value)})} style={{width:'100%',height:'8px',borderRadius:'4px',background:'#e5e7eb',outline:'none',cursor:'pointer'}}/>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:'8px',fontSize:'14px',color:'#6b7280'}}><span>2 days</span><span>6 days</span></div>
          </div>
          <div>
            <label style={{fontWeight:'bold',display:'block',marginBottom:'10px',color:'#667eea',fontSize:'16px'}}>⚖️ Your Weight (kg)</label>
            <input type="number" value={formData.weightKg} onChange={e=>setFormData({...formData,weightKg:parseInt(e.target.value)})} style={{width:'100%',padding:'16px',borderRadius:'14px',border:'3px solid #e5e7eb',fontSize:'16px',backgroundColor:'white',color:'#111827'}}/>
          </div>
          <button type="submit" disabled={loading} style={{padding:'20px',background:loading?'#9ca3af':'linear-gradient(135deg,#667eea,#764ba2)',color:'white',border:'none',borderRadius:'14px',fontSize:'20px',fontWeight:'bold',cursor:'pointer',boxShadow:'0 6px 20px rgba(102,126,234,0.4)'}}>{loading?'⏳ Generating...':'🚀 Generate My Plan'}</button>
        </form>
      </div>
    </div>
  );
}
