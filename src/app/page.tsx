'use client';

import { useState, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [workoutData, setWorkoutData] = useState<any[]>([]);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    goal: 'hypertrophy',
    experience: 'beginner',
    daysPerWeek: 4,
    weightKg: 70
  });

  // Load saved plans when user logs in
  useEffect(() => {
    if (session?.user?.email) {
      const stored = localStorage.getItem(`gym_ai_plans_${session.user.email}`);
      if (stored) {
        try {
          setSavedPlans(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to load plans:', e);
        }
      }
    }
  }, [session]);

  const handleLogin = async (provider: string) => {
    setLoading(true);
    try {
      await signIn(provider, { callbackUrl: '/' });
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to generate plan');

      const data = await response.json();
      
      const newPlan = {
        id: Date.now().toString(),
        plan: data.plan,
        createdAt: new Date().toISOString(),
        workoutData: []
      };

      const updated = [...savedPlans, newPlan];
      setSavedPlans(updated);
      
      if (session?.user?.email) {
        localStorage.setItem(`gym_ai_plans_${session.user.email}`, JSON.stringify(updated));
      }
      
      setPlanId(newPlan.id);
      setPlan(data.plan);
      setWorkoutData([]);

    } catch (err) {
      setError('Failed to generate plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = (di: number, ei: number, checked: boolean) => {
    const nd = [...workoutData];
    while (nd.length <= di) nd.push([]);
    nd[di][ei] = checked;
    setWorkoutData(nd);
    
    if (planId && session?.user?.email) {
      const up = savedPlans.map(p => 
        p.id === planId ? { ...p, workoutData: nd } : p
      );
      setSavedPlans(up);
      localStorage.setItem(`gym_ai_plans_${session.user.email}`, JSON.stringify(up));
    }
  };

  const completed = workoutData.flat().filter(Boolean).length;
  const total = plan?.weekPlan.reduce((a: number, d: any) => a + d.exercises.length, 0) || 0;
  const pct = total > 0 ? (completed / total) * 100 : 0;

  // Loading state
  if (status === 'loading') {
    return (
      <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{color:'white',fontSize:'20px'}}>Loading...</div>
      </div>
    );
  }

  // Login Screen - Mobile First
  if (!session) {
    return (
      <div style={{
        minHeight:'100vh',
        background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        padding:'20px'
      }}>
        <div style={{
          background:'white',
          padding:'40px 30px',
          borderRadius:'30px',
          width:'100%',
          maxWidth:'400px',
          textAlign:'center',
          boxShadow:'0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <div style={{fontSize:'64px',marginBottom:'16px'}}>️</div>
          <h1 style={{fontSize:'32px',fontWeight:'bold',marginBottom:'12px',background:'linear-gradient(135deg,#667eea,#764ba2)',WebkitBackgroundClip:'text',backgroundClip:'text',color:'transparent'}}>
            Gym AI
          </h1>
          <p style={{color:'#666',marginBottom:'32px',fontSize:'16px'}}>
            Your Personal AI Fitness Coach
          </p>
          
          {error && (
            <div style={{background:'#fee2e2',color:'#dc2626',padding:'12px',borderRadius:'12px',marginBottom:'20px',fontSize:'14px'}}>
              {error}
            </div>
          )}
          
          <button 
            onClick={() => handleLogin('google')}
            disabled={loading}
            style={{
              width:'100%',
              padding:'16px',
              background:loading?'#9ca3af':'white',
              color:'#111',
              border:'2px solid #e5e7eb',
              borderRadius:'15px',
              fontSize:'16px',
              fontWeight:'bold',
              cursor:loading?'not-allowed':'pointer',
              marginBottom:'12px',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              gap:'12px'
            }}
          >
            <span>🔍</span> Continue with Google
          </button>
          
          <button 
            onClick={() => handleLogin('credentials')}
            disabled={loading}
            style={{
              width:'100%',
              padding:'16px',
              background:loading?'#9ca3af':'white',
              color:'#111',
              border:'2px solid #e5e7eb',
              borderRadius:'15px',
              fontSize:'16px',
              fontWeight:'bold',
              cursor:loading?'not-allowed':'pointer',
              marginBottom:'12px'
            }}
          >
            📧 Continue with Email
          </button>
        </div>
      </div>
    );
  }

  // Show History
  if (showHistory) {
    return (
      <div style={{
        minHeight:'100vh',
        background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
        padding:'20px'
      }}>
        <div style={{
          maxWidth:'600px',
          margin:'0 auto',
          background:'white',
          borderRadius:'30px',
          padding:'30px 20px',
          boxShadow:'0 20px 60px rgba(0,0,0,0.2)'
        }}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
            <h2 style={{margin:0,fontSize:'24px',color:'#667eea'}}>📚 My Plans</h2>
            <button 
              onClick={()=>setShowHistory(false)}
              style={{padding:'10px 20px',background:'#6b7280',color:'white',border:'none',borderRadius:'12px',fontWeight:'bold',cursor:'pointer'}}
            >
              ← Back
            </button>
          </div>
          
          {savedPlans.length===0 ? (
            <p style={{textAlign:'center',color:'#999',fontSize:'16px',padding:'40px'}}>No saved plans yet.</p>
          ) : (
            savedPlans.map(p => (
              <div key={p.id} style={{
                padding:'20px',
                background:'#f9fafb',
                borderRadius:'16px',
                marginBottom:'12px',
                border:'2px solid #e5e7eb'
              }}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'12px'}}>
                  <div>
                    <h3 style={{margin:'0 0 8px 0',fontSize:'18px',color:'#667eea',fontWeight:'bold'}}>
                      {p.plan.goal}
                    </h3>
                    <p style={{margin:0,color:'#666',fontSize:'14px'}}>
                      {p.plan.weekPlan.length} days • {p.plan.experience}
                    </p>
                  </div>
                  <div style={{display:'flex',gap:'8px'}}>
                    <button 
                      onClick={()=>{setPlan(p.plan);setPlanId(p.id);setWorkoutData(p.workoutData||[]);setShowHistory(false);}}
                      style={{padding:'8px 16px',background:'#3b82f6',color:'white',border:'none',borderRadius:'10px',fontWeight:'bold',cursor:'pointer'}}
                    >
                      Load
                    </button>
                    <button 
                      onClick={()=>{
                        const up=savedPlans.filter(x=>x.id!==p.id);
                        setSavedPlans(up);
                        if(session?.user?.email) {
                          localStorage.setItem(`gym_ai_plans_${session.user.email}`, JSON.stringify(up));
                        }
                      }}
                      style={{padding:'8px 16px',background:'#ef4444',color:'white',border:'none',borderRadius:'10px',fontWeight:'bold',cursor:'pointer'}}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Show Workout Plan
  if (plan) {
    return (
      <div style={{
        minHeight:'100vh',
        background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
        padding:'20px'
      }}>
        <div style={{
          maxWidth:'600px',
          margin:'0 auto',
          background:'white',
          borderRadius:'30px',
          padding:'30px 20px',
          boxShadow:'0 20px 60px rgba(0,0,0,0.2)'
        }}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px',flexWrap:'wrap',gap:'12px'}}>
            <h2 style={{margin:0,fontSize:'24px',color:'#667eea'}}>✅ Your Plan</h2>
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
              <button 
                onClick={()=>setShowHistory(true)}
                style={{padding:'10px 16px',background:'#667eea',color:'white',border:'none',borderRadius:'10px',fontWeight:'bold',cursor:'pointer',fontSize:'14px'}}
              >
                📚 History
              </button>
              <button 
                onClick={()=>{setPlan(null);setPlanId(null);}}
                style={{padding:'10px 16px',background:'#6b7280',color:'white',border:'none',borderRadius:'10px',fontWeight:'bold',cursor:'pointer',fontSize:'14px'}}
              >
                New Plan
              </button>
              <button 
                onClick={()=>window.location.href='/tools'}
                style={{padding:'10px 16px',background:'#10b981',color:'white',border:'none',borderRadius:'10px',fontWeight:'bold',cursor:'pointer',fontSize:'14px'}}
              >
                🛠️ Tools
              </button>
              <button 
                onClick={()=>signOut()}
                style={{padding:'10px 16px',background:'#ef4444',color:'white',border:'none',borderRadius:'10px',fontWeight:'bold',cursor:'pointer',fontSize:'14px'}}
              >
                🚪 Logout
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{
            padding:'20px',
            background:'linear-gradient(135deg,#667eea,#764ba2)',
            borderRadius:'20px',
            color:'white',
            marginBottom:'24px'
          }}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
              <span style={{fontSize:'16px',fontWeight:'bold'}}>Progress</span>
              <span style={{fontSize:'16px',fontWeight:'bold'}}>{completed}/{total}</span>
            </div>
            <div style={{height:'14px',background:'rgba(255,255,255,0.3)',borderRadius:'10px',overflow:'hidden'}}>
              <div style={{
                width:`${pct}%`,
                height:'100%',
                background:'linear-gradient(90deg,#10b981,#059669)',
                transition:'width 0.5s',
                borderRadius:'10px'
              }}></div>
            </div>
            <div style={{marginTop:'8px',fontSize:'13px',opacity:0.9}}> {Math.round(pct)}% Complete</div>
          </div>

          {/* Workout Days */}
          {plan.weekPlan.map((day:any,di:number)=>(
            <div key={di} style={{
              padding:'24px 20px',
              background:'#f9fafb',
              borderRadius:'20px',
              marginBottom:'16px',
              border:'2px solid #e5e7eb'
            }}>
              <h3 style={{color:'#667eea',margin:'0 0 16px 0',fontSize:'20px',fontWeight:'bold'}}>
                 {day.day} - {day.focus}
              </h3>
              {day.exercises.map((ex:any,ei:number)=>{
                const done = workoutData[di]?.[ei] || false;
                return (
                  <div key={ei} style={{
                    padding:'14px',
                    background:done?'linear-gradient(135deg,#d1fae5,#a7f3d0)':'white',
                    borderRadius:'14px',
                    border:`2px solid ${done?'#10b981':'#e5e7eb'}`,
                    marginBottom:'10px',
                    display:'flex',
                    alignItems:'center',
                    gap:'12px'
                  }}>
                    <input 
                      type="checkbox" 
                      checked={done} 
                      onChange={e=>handleCheck(di,ei,e.target.checked)}
                      style={{width:'22px',height:'22px',cursor:'pointer',accentColor:'#10b981',flexShrink:0}}
                    />
                    
                    {ex.gifUrl && (
                      <img 
                        src={ex.gifUrl} 
                        alt={ex.name}
                        style={{
                          width:'70px',
                          height:'70px',
                          borderRadius:'10px',
                          objectFit:'cover',
                          border:'2px solid #e5e7eb',
                          flexShrink:0
                        }}
                        onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                      />
                    )}
                    
                    <div style={{flex:1,minWidth:0}}>
                      <b style={{fontSize:'16px',textDecoration:done?'line-through':'none',color:done?'#6b7280':'#111',display:'block',marginBottom:'4px'}}>
                        {ex.name}
                      </b>
                      <div style={{color:'#666',fontSize:'13px'}}>
                        🎯 {ex.muscles.join(', ')} • 📊 {ex.sets} × {ex.reps}
                      </div>
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

  // Main Form - Mobile Optimized
  return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
      padding:'20px'
    }}>
      <div style={{
        maxWidth:'600px',
        margin:'0 auto',
        background:'white',
        borderRadius:'30px',
        padding:'30px 20px',
        boxShadow:'0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <span style={{fontSize:'36px'}}>🏋️</span>
            <h1 style={{margin:0,fontSize:'28px',background:'linear-gradient(135deg,#667eea,#764ba2)',WebkitBackgroundClip:'text',backgroundClip:'text',color:'transparent',fontWeight:'bold'}}>
              Gym AI
            </h1>
          </div>
          <button 
            onClick={()=>signOut()}
            style={{padding:'10px 16px',background:'#ef4444',color:'white',border:'none',borderRadius:'12px',fontWeight:'bold',cursor:'pointer',fontSize:'14px'}}
          >
            🚪 Logout
          </button>
        </div>

        {error && (
          <div style={{background:'#fee2e2',color:'#dc2626',padding:'14px',borderRadius:'12px',marginBottom:'20px',textAlign:'center',fontWeight:'bold',fontSize:'14px'}}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'20px'}}>
          <div>
            <label style={{fontWeight:'bold',display:'block',marginBottom:'8px',color:'#667eea',fontSize:'15px'}}>
               What's your goal?
            </label>
            <select 
              value={formData.goal} 
              onChange={e=>setFormData({...formData,goal:e.target.value})}
              style={{width:'100%',padding:'14px',borderRadius:'12px',border:'2px solid #e5e7eb',fontSize:'16px',backgroundColor:'white',color:'#111'}}
            >
              <option value="strength">💪 Build Strength</option>
              <option value="hypertrophy">️ Build Muscle</option>
              <option value="fat_loss">🔥 Lose Fat</option>
              <option value="general_fitness">❤️ General Fitness</option>
            </select>
          </div>

          <div>
            <label style={{fontWeight:'bold',display:'block',marginBottom:'8px',color:'#667eea',fontSize:'15px'}}>
              📊 Experience Level
            </label>
            <select 
              value={formData.experience} 
              onChange={e=>setFormData({...formData,experience:e.target.value})}
              style={{width:'100%',padding:'14px',borderRadius:'12px',border:'2px solid #e5e7eb',fontSize:'16px',backgroundColor:'white',color:'#111'}}
            >
              <option value="beginner">🌱 Beginner</option>
              <option value="intermediate">🚀 Intermediate</option>
              <option value="advanced">🔥 Advanced</option>
            </select>
          </div>

          <div>
            <label style={{fontWeight:'bold',display:'block',marginBottom:'8px',color:'#667eea',fontSize:'15px'}}>
              📅 Days per Week: <span style={{color:'#667eea',fontSize:'18px',fontWeight:'bold'}}>{formData.daysPerWeek}</span>
            </label>
            <input 
              type="range" 
              min="2" 
              max="6" 
              value={formData.daysPerWeek} 
              onChange={e=>setFormData({...formData,daysPerWeek:parseInt(e.target.value)})}
              style={{width:'100%',height:'6px',borderRadius:'4px',background:'#e5e7eb',outline:'none',cursor:'pointer'}}
            />
            <div style={{display:'flex',justifyContent:'space-between',marginTop:'6px',fontSize:'12px',color:'#6b7280'}}>
              <span>2 days</span>
              <span>6 days</span>
            </div>
          </div>

          <div>
            <label style={{fontWeight:'bold',display:'block',marginBottom:'8px',color:'#667eea',fontSize:'15px'}}>
              ⚖️ Your Weight (kg)
            </label>
            <input 
              type="number" 
              value={formData.weightKg} 
              onChange={e=>setFormData({...formData,weightKg:parseInt(e.target.value)})}
              style={{width:'100%',padding:'14px',borderRadius:'12px',border:'2px solid #e5e7eb',fontSize:'16px',backgroundColor:'white',color:'#111'}}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              padding:'18px',
              background:loading?'#9ca3af':'linear-gradient(135deg,#667eea,#764ba2)',
              color:'white',
              border:'none',
              borderRadius:'14px',
              fontSize:'18px',
              fontWeight:'bold',
              cursor:loading?'not-allowed':'pointer',
              boxShadow:'0 6px 20px rgba(102,126,234,0.4)'
            }}
          >
            {loading?' Generating...':'🚀 Generate My Plan'}
          </button>
        </form>
      </div>
    </div>
  );
}