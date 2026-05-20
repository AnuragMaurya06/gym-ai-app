'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [goal, setGoal] = useState('hypertrophy');
  const [experience, setExperience] = useState('beginner');
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [weightKg, setWeightKg] = useState(70);
  const [plan, setPlan] = useState<any>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [workoutData, setWorkoutData] = useState<any[]>([]);

  // Load user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('gym_ai_current_user');
    if (savedUser) {
      setCurrentUser(savedUser);
      setTimeout(() => {
        loadUserData(savedUser);
      }, 50);
    }
  }, []);

  const loadUserData = (userEmail: string) => {
    const usersDB = JSON.parse(localStorage.getItem('gym_ai_users') || '{}');
    const user = usersDB[userEmail];
    if (user) {
      if (user.profile) {
        setGoal(user.profile.goal || 'hypertrophy');
        setExperience(user.profile.experience || 'beginner');
        setDaysPerWeek(user.profile.daysPerWeek || 4);
        setWeightKg(user.profile.weightKg || 70);
        setShowOnboarding(false);
      } else {
        setShowOnboarding(true);
      }
      if (user.workoutPlans) setSavedPlans(user.workoutPlans);
    }
  };

  const saveUserData = (userEmail: string, updates: any) => {
    const usersDB = JSON.parse(localStorage.getItem('gym_ai_users') || '{}');
    if (!usersDB[userEmail]) usersDB[userEmail] = { email: userEmail };
    usersDB[userEmail] = { ...usersDB[userEmail], ...updates };
    localStorage.setItem('gym_ai_users', JSON.stringify(usersDB));
  };

  // ✅ FIXED: Complete handleAuth function with login persistence
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    
    const usersDB = JSON.parse(localStorage.getItem('gym_ai_users') || '{}');
    const cleanEmail = email.toLowerCase().trim();
    
    if (isLogin) {
      const user = usersDB[cleanEmail];
      if (!user) { 
        setError('User not found. Please register.'); 
        setLoading(false); 
        return; 
      }
      if (user.password !== password) { 
        setError('Incorrect password'); 
        setLoading(false); 
        return; 
      }
      
      localStorage.setItem('gym_ai_current_user', cleanEmail);
      setCurrentUser(cleanEmail);
      loadUserData(cleanEmail);
      
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
    } else {
      if (usersDB[cleanEmail]) { 
        setError('Email already registered. Please login.'); 
        setLoading(false); 
        return; 
      }
      
      usersDB[cleanEmail] = { 
        email: cleanEmail, 
        password: password, 
        createdAt: new Date().toISOString() 
      };
      
      localStorage.setItem('gym_ai_users', JSON.stringify(usersDB));
      localStorage.setItem('gym_ai_current_user', cleanEmail);
      setCurrentUser(cleanEmail);
      setShowOnboarding(true);
    }
    
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('gym_ai_current_user');
    setCurrentUser(null);
    setPlan(null); 
    setPlanId(null); 
    setShowHistory(false); 
    setShowSettings(false);
    setEmail(''); 
    setPassword('');
  };

  const completeOnboarding = () => {
    if (!currentUser) return;
    setLoading(true);
    const profile = { goal, experience, daysPerWeek, weightKg };
    saveUserData(currentUser, { profile });
    setShowOnboarding(false);
    setLoading(false);
  };

  const generatePlan = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, experience, daysPerWeek, weightKg }),
      });
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      const newPlan = {
        id: Date.now().toString(),
        plan: data.plan,
        createdAt: new Date().toISOString(),
        workoutData: [],
        settings: { goal, experience, daysPerWeek, weightKg }
      };
      const updated = [...savedPlans, newPlan];
      setSavedPlans(updated);
      saveUserData(currentUser, { workoutPlans: updated });
      setPlanId(newPlan.id);
      setPlan(data.plan);
      setWorkoutData([]);
    } catch (err) {
      setError('Failed to generate plan.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = (di: number, ei: number, checked: boolean) => {
    const nd = [...workoutData];
    while (nd.length <= di) nd.push([]);
    nd[di][ei] = checked;
    setWorkoutData(nd);
    if (planId && currentUser) {
      const up = savedPlans.map(p => p.id === planId ? { ...p, workoutData: nd } : p);
      setSavedPlans(up);
      saveUserData(currentUser, { workoutPlans: up });
    }
  };

  // ✅ NEW: Check if all exercises in a day are complete
  const isDayComplete = (dayIndex: number) => {
    if (!plan || !workoutData[dayIndex]) return false;
    const totalExercises = plan.weekPlan[dayIndex].exercises.length;
    const completedCount = workoutData[dayIndex].filter(Boolean).length;
    return completedCount === totalExercises && totalExercises > 0;
  };

  // ✅ NEW: Mark all exercises in a day as complete with one click
  const completeDay = (dayIndex: number) => {
    if (!plan) return;
    const nd = [...workoutData];
    const dayExercises = plan.weekPlan[dayIndex].exercises.length;
    
    if (!nd[dayIndex]) nd[dayIndex] = [];
    for (let i = 0; i < dayExercises; i++) {
      nd[dayIndex][i] = true;
    }
    
    setWorkoutData(nd);
    
    if (planId && currentUser) {
      const up = savedPlans.map(p => p.id === planId ? { ...p, workoutData: nd } : p);
      setSavedPlans(up);
      saveUserData(currentUser, { workoutPlans: up });
    }
  };

  const loadPlan = (p: any) => { setPlan(p.plan); setPlanId(p.id); setWorkoutData(p.workoutData || []); setShowHistory(false); };
  const deletePlan = (id: string) => { if (!currentUser) return; const up = savedPlans.filter(p => p.id !== id); setSavedPlans(up); saveUserData(currentUser, { workoutPlans: up }); };
  const updateSettings = () => { if (!currentUser) return; const profile = { goal, experience, daysPerWeek, weightKg }; saveUserData(currentUser, { profile }); setShowSettings(false); };

  const completed = workoutData.flat().filter(Boolean).length;
  const total = plan?.weekPlan.reduce((a: number, d: any) => a + d.exercises.length, 0) || 0;
  const pct = total > 0 ? (completed / total) * 100 : 0;

  // Onboarding
  if (showOnboarding && currentUser) {
    return (
      <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
        <div style={{background:'white',padding:'40px 30px',borderRadius:'30px',width:'100%',maxWidth:'500px',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
          <h2 style={{fontSize:'28px',marginBottom:'24px',color:'#667eea',textAlign:'center'}}>🎯 Complete Your Profile</h2>
          {error && <div style={{background:'#fee2e2',color:'#dc2626',padding:'12px',borderRadius:'12px',marginBottom:'16px'}}>{error}</div>}
          <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
            <div><label style={{fontWeight:'bold',display:'block',marginBottom:'8px',color:'#667eea'}}>🎯 Goal</label>
              <select value={goal} onChange={(e) => setGoal(e.target.value)} style={{width:'100%',padding:'14px',borderRadius:'12px',border:'2px solid #e5e7eb',fontSize:'16px',backgroundColor:'white'}}>
                <option value="strength">💪 Build Strength</option><option value="hypertrophy">🏋️ Build Muscle</option><option value="fat_loss">🔥 Lose Fat</option><option value="general_fitness">❤️ General Fitness</option>
              </select></div>
            <div><label style={{fontWeight:'bold',display:'block',marginBottom:'8px',color:'#667eea'}}>📊 Experience</label>
              <select value={experience} onChange={(e) => setExperience(e.target.value)} style={{width:'100%',padding:'14px',borderRadius:'12px',border:'2px solid #e5e7eb',fontSize:'16px',backgroundColor:'white'}}>
                <option value="beginner">🌱 Beginner</option><option value="intermediate">🚀 Intermediate</option><option value="advanced">🔥 Advanced</option>
              </select></div>
            <div><label style={{fontWeight:'bold',display:'block',marginBottom:'8px',color:'#667eea'}}>📅 Days/Week: {daysPerWeek}</label>
              <input type="range" min="2" max="6" value={daysPerWeek} onChange={(e) => setDaysPerWeek(parseInt(e.target.value))} style={{width:'100%',height:'6px',background:'#e5e7eb',borderRadius:'4px'}}/></div>
            <div><label style={{fontWeight:'bold',display:'block',marginBottom:'8px',color:'#667eea'}}>⚖️ Weight (kg)</label>
              <input type="number" value={weightKg} onChange={(e) => setWeightKg(parseInt(e.target.value))} style={{width:'100%',padding:'14px',borderRadius:'12px',border:'2px solid #e5e7eb',fontSize:'16px'}}/></div>
            <button onClick={completeOnboarding} disabled={loading} style={{padding:'16px',background:loading?'#9ca3af':'linear-gradient(135deg,#667eea,#764ba2)',color:'white',border:'none',borderRadius:'14px',fontSize:'18px',fontWeight:'bold',cursor:loading?'not-allowed':'pointer',width:'100%'}}>
              {loading ? '⏳ Saving...' : '✅ Complete & Start'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Login/Register
  if (!currentUser) {
    return (
      <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
        <div style={{background:'white',padding:'40px 30px',borderRadius:'30px',width:'100%',maxWidth:'400px',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
          <div style={{textAlign:'center',marginBottom:'32px'}}>
            <div style={{fontSize:'64px',marginBottom:'16px'}}>🏋️</div>
            <h1 style={{fontSize:'32px',fontWeight:'bold',background:'linear-gradient(135deg,#667eea,#764ba2)',WebkitBackgroundClip:'text',backgroundClip:'text',color:'transparent'}}>Gym AI</h1>
            <p style={{color:'#666',marginTop:'8px'}}>{isLogin ? 'Welcome back!' : 'Create account'}</p>
          </div>
          {error && <div style={{background:'#fee2e2',color:'#dc2626',padding:'12px',borderRadius:'12px',marginBottom:'16px',fontSize:'14px'}}>{error}</div>}
          <form onSubmit={handleAuth} style={{display:'flex',flexDirection:'column',gap:'16px'}}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{width:'100%',padding:'14px',borderRadius:'12px',border:'2px solid #e5e7eb',fontSize:'16px',boxSizing:'border-box'}} required/>
            <input type="password" placeholder="Password (min 6)" value={password} onChange={(e) => setPassword(e.target.value)} style={{width:'100%',padding:'14px',borderRadius:'12px',border:'2px solid #e5e7eb',fontSize:'16px',boxSizing:'border-box'}} required/>
            <button type="submit" disabled={loading} style={{padding:'16px',background:loading?'#9ca3af':'linear-gradient(135deg,#667eea,#764ba2)',color:'white',border:'none',borderRadius:'14px',fontSize:'16px',fontWeight:'bold',cursor:loading?'not-allowed':'pointer'}}>
              {loading ? '⏳ Processing...' : isLogin ? '🔓 Login' : '📝 Register'}
            </button>
          </form>
          <button onClick={() => {setIsLogin(!isLogin); setError('');}} style={{width:'100%',padding:'12px',background:'transparent',color:'#667eea',border:'none',fontSize:'14px',cursor:'pointer',marginTop:'16px',fontWeight:'bold'}}>
            {isLogin ? 'Need account? Register' : 'Have account? Login'}
          </button>
        </div>
      </div>
    );
  }

  // Settings
  if (showSettings) {
    return (
      <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',padding:'20px'}}>
        <div style={{maxWidth:'600px',margin:'0 auto',background:'white',borderRadius:'30px',padding:'30px 20px',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
            <h2 style={{margin:0,fontSize:'24px',color:'#667eea'}}>⚙️ Settings</h2>
            <button onClick={() => setShowSettings(false)} style={{padding:'10px 20px',background:'#6b7280',color:'white',border:'none',borderRadius:'12px',fontWeight:'bold',cursor:'pointer'}}>← Back</button>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
            <div><label style={{fontWeight:'bold',display:'block',marginBottom:'8px',color:'#667eea'}}>🎯 Goal</label>
              <select value={goal} onChange={(e) => setGoal(e.target.value)} style={{width:'100%',padding:'14px',borderRadius:'12px',border:'2px solid #e5e7eb',fontSize:'16px',backgroundColor:'white'}}>
                <option value="strength">💪 Build Strength</option><option value="hypertrophy">🏋️ Build Muscle</option><option value="fat_loss">🔥 Lose Fat</option><option value="general_fitness">❤️ General Fitness</option>
              </select></div>
            <div><label style={{fontWeight:'bold',display:'block',marginBottom:'8px',color:'#667eea'}}>📅 Days/Week: {daysPerWeek}</label>
              <input type="range" min="2" max="6" value={daysPerWeek} onChange={(e) => setDaysPerWeek(parseInt(e.target.value))} style={{width:'100%',height:'6px',background:'#e5e7eb',borderRadius:'4px'}}/></div>
            <button onClick={updateSettings} style={{padding:'16px',background:'linear-gradient(135deg,#667eea,#764ba2)',color:'white',border:'none',borderRadius:'14px',fontSize:'16px',fontWeight:'bold',cursor:'pointer'}}>
              💾 Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // History
  if (showHistory) {
    return (
      <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',padding:'20px'}}>
        <div style={{maxWidth:'600px',margin:'0 auto',background:'white',borderRadius:'30px',padding:'30px 20px',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
            <h2 style={{margin:0,fontSize:'24px',color:'#667eea'}}>📚 My Plans</h2>
            <button onClick={() => setShowHistory(false)} style={{padding:'10px 20px',background:'#6b7280',color:'white',border:'none',borderRadius:'12px',fontWeight:'bold',cursor:'pointer'}}>← Back</button>
          </div>
          {savedPlans.length === 0 ? (
            <p style={{textAlign:'center',color:'#999',padding:'40px'}}>No plans yet</p>
          ) : (
            savedPlans.map(p => (
              <div key={p.id} style={{padding:'20px',background:'#f9fafb',borderRadius:'16px',marginBottom:'12px',border:'2px solid #e5e7eb'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <h3 style={{margin:'0 0 8px 0',fontSize:'18px',color:'#667eea'}}>{p.plan.goal}</h3>
                    <p style={{margin:0,color:'#666',fontSize:'14px'}}>{p.plan.weekPlan.length} days</p>
                  </div>
                  <div style={{display:'flex',gap:'8px'}}>
                    <button onClick={() => loadPlan(p)} style={{padding:'8px 16px',background:'#3b82f6',color:'white',border:'none',borderRadius:'10px',fontWeight:'bold',cursor:'pointer'}}>Load</button>
                    <button onClick={() => deletePlan(p.id)} style={{padding:'8px 16px',background:'#ef4444',color:'white',border:'none',borderRadius:'10px',fontWeight:'bold',cursor:'pointer'}}>Delete</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Workout Plan View
  if (plan) {
    return (
      <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',padding:'20px'}}>
        <div style={{maxWidth:'600px',margin:'0 auto',background:'white',borderRadius:'30px',padding:'30px 20px',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px',flexWrap:'wrap',gap:'12px'}}>
            <h2 style={{margin:0,fontSize:'24px',color:'#667eea'}}>✅ Your Plan</h2>
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
              <button onClick={() => router.push('/tools')} style={{padding:'10px 16px',background:'#8b5cf6',color:'white',border:'none',borderRadius:'10px',fontWeight:'bold',cursor:'pointer',fontSize:'14px'}}>🛠️ Tools</button>
              <button onClick={() => router.push('/tools?active=music')} style={{padding:'10px 16px',background:'#ec4899',color:'white',border:'none',borderRadius:'10px',fontWeight:'bold',cursor:'pointer',fontSize:'14px'}}>🎵 Music</button>
              <button onClick={() => setShowHistory(true)} style={{padding:'10px 16px',background:'#667eea',color:'white',border:'none',borderRadius:'10px',fontWeight:'bold',cursor:'pointer',fontSize:'14px'}}>📚 History</button>
              <button onClick={() => setPlan(null)} style={{padding:'10px 16px',background:'#6b7280',color:'white',border:'none',borderRadius:'10px',fontWeight:'bold',cursor:'pointer',fontSize:'14px'}}>New Plan</button>
              <button onClick={() => setShowSettings(true)} style={{padding:'10px 16px',background:'#10b981',color:'white',border:'none',borderRadius:'10px',fontWeight:'bold',cursor:'pointer',fontSize:'14px'}}>⚙️</button>
              <button onClick={handleLogout} style={{padding:'10px 16px',background:'#ef4444',color:'white',border:'none',borderRadius:'10px',fontWeight:'bold',cursor:'pointer',fontSize:'14px'}}>🚪</button>
            </div>
          </div>
          <div style={{padding:'20px',background:'linear-gradient(135deg,#667eea,#764ba2)',borderRadius:'20px',color:'white',marginBottom:'24px'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'10px'}}>
              <span style={{fontWeight:'bold'}}>Progress</span>
              <span style={{fontWeight:'bold'}}>{completed}/{total}</span>
            </div>
            <div style={{height:'14px',background:'rgba(255,255,255,0.3)',borderRadius:'10px',overflow:'hidden'}}>
              <div style={{width:`${pct}%`,height:'100%',background:'linear-gradient(90deg,#10b981,#059669)',borderRadius:'10px'}}></div>
            </div>
            <div style={{marginTop:'8px',fontSize:'13px'}}>🔥 {Math.round(pct)}% Complete</div>
          </div>
          {plan.weekPlan.map((day:any, di:number) => (
            <div key={di} style={{padding:'24px 20px',background:'#f9fafb',borderRadius:'20px',marginBottom:'16px',border:'2px solid #e5e7eb'}}>
              {/* ✅ NEW: Day Header with Complete Button */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px',flexWrap:'wrap',gap:'8px'}}>
                <h3 style={{color:'#667eea',margin:0,fontSize:'20px',fontWeight:'bold'}}>📅 {day.day} - {day.focus}</h3>
                <button 
                  onClick={() => completeDay(di)}
                  style={{
                    padding:'8px 16px',
                    background: isDayComplete(di) ? '#10b981' : '#667eea',
                    color:'white',
                    border:'none',
                    borderRadius:'8px',
                    fontWeight:'bold',
                    cursor:'pointer',
                    fontSize:'13px',
                    whiteSpace:'nowrap',
                    transition:'all 0.3s'
                  }}
                >
                  {isDayComplete(di) ? '✅ Day Complete' : '✓ Mark Day Done'}
                </button>
              </div>
              
              {day.exercises.map((ex:any, ei:number) => {
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
                    gap:'12px',
                    opacity:done?0.7:1,
                    transition:'all 0.3s'
                  }}>
                    <input type="checkbox" checked={done} onChange={(e) => handleCheck(di, ei, e.target.checked)} style={{width:'22px',height:'22px',cursor:'pointer',accentColor:'#10b981',flexShrink:0}}/>
                    {ex.gifUrl && <img src={ex.gifUrl} alt={ex.name} style={{width:'70px',height:'70px',borderRadius:'10px',objectFit:'cover',border:'2px solid #e5e7eb',flexShrink:0}} onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}/>}
                    <div style={{flex:1,minWidth:0}}>
                      <b style={{
                        fontSize:'16px',
                        textDecoration:done?'line-through':'none',
                        color:done?'#6b7280':'#111',
                        display:'block',
                        marginBottom:'4px',
                        fontWeight:'bold'
                      }}>{ex.name}</b>
                      <div style={{color:'#374151',fontSize:'14px',fontWeight:'500'}}>
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

  // Main Dashboard (No Plan Active)
  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',padding:'20px'}}>
      <div style={{maxWidth:'600px',margin:'0 auto',background:'white',borderRadius:'30px',padding:'30px 20px',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <span style={{fontSize:'36px'}}>🏋️</span>
            <div>
              <h1 style={{margin:0,fontSize:'24px',color:'#667eea'}}>Gym AI</h1>
              <p style={{margin:0,fontSize:'12px',color:'#666'}}>{currentUser}</p>
            </div>
          </div>
          <div style={{display:'flex',gap:'8px'}}>
            <button onClick={() => setShowSettings(true)} style={{padding:'10px 16px',background:'#667eea',color:'white',border:'none',borderRadius:'10px',fontWeight:'bold',cursor:'pointer',fontSize:'14px'}}>⚙️</button>
            <button onClick={handleLogout} style={{padding:'10px 16px',background:'#ef4444',color:'white',border:'none',borderRadius:'10px',fontWeight:'bold',cursor:'pointer',fontSize:'14px'}}>🚪</button>
          </div>
        </div>
        {error && <div style={{background:'#fee2e2',color:'#dc2626',padding:'14px',borderRadius:'12px',marginBottom:'20px',textAlign:'center',fontSize:'14px'}}>{error}</div>}
        
        <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          <button onClick={() => router.push('/tools')} style={{width:'100%',padding:'18px',background:'#8b5cf6',color:'white',border:'none',borderRadius:'14px',fontSize:'18px',fontWeight:'bold',cursor:'pointer',boxShadow:'0 6px 20px rgba(139,92,246,0.4)'}}>
            🛠️ Fitness Tools
          </button>
          <button onClick={() => router.push('/tools?active=music')} style={{width:'100%',padding:'18px',background:'#ec4899',color:'white',border:'none',borderRadius:'14px',fontSize:'18px',fontWeight:'bold',cursor:'pointer',boxShadow:'0 6px 20px rgba(236,72,153,0.4)'}}>
            🎵 Music Player & Timers
          </button>
          <button onClick={generatePlan} disabled={loading} style={{width:'100%',padding:'18px',background:loading?'#9ca3af':'linear-gradient(135deg,#667eea,#764ba2)',color:'white',border:'none',borderRadius:'14px',fontSize:'18px',fontWeight:'bold',cursor:loading?'not-allowed':'pointer',boxShadow:'0 6px 20px rgba(102,126,234,0.4)'}}>
            {loading ? '⏳ Generating...' : '🚀 Generate My Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}