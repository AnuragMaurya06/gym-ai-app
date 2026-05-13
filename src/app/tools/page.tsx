'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [uid, setUid] = useState<string>('guest');
  
  useEffect(() => {
    const savedId = localStorage.getItem('gym-ai-user-id');
    setUid(savedId || 'guest');
  }, []);
  
  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // 1. CALENDAR
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDuration, setWorkoutDuration] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(`workout_calendar_${uid}`);
    if (saved) try { setWorkouts(JSON.parse(saved)); } catch {}
  }, [uid]);

  const saveWorkout = useCallback(() => {
    if (!workoutName.trim() || !workoutDuration) return showNotification('❌ Enter name & duration');
    const durationNum = parseInt(workoutDuration);
    if (isNaN(durationNum) || durationNum <= 0) return showNotification('❌ Invalid duration');
    const workout = { id: Date.now(), date: selectedDate, name: workoutName.trim(), duration: durationNum, exercises: 5, calories: Math.round(durationNum * 8) };
    const updated = [...workouts, workout];
    setWorkouts(updated);
    localStorage.setItem(`workout_calendar_${uid}`, JSON.stringify(updated));
    setWorkoutName(''); setWorkoutDuration('');
    showNotification('✅ Workout saved!');
  }, [workoutName, workoutDuration, selectedDate, workouts, uid, showNotification]);

  const deleteWorkout = useCallback((id: number) => {
    const updated = workouts.filter(w => w.id !== id);
    setWorkouts(updated);
    localStorage.setItem(`workout_calendar_${uid}`, JSON.stringify(updated));
    showNotification('🗑️ Workout deleted');
  }, [workouts, uid, showNotification]);

  const getCalendarDays = useCallback(() => {
    const year = calendarMonth.getFullYear(), month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1), lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate(), startingDay = firstDay.getDay();
    const days: any[] = [];
    for (let i = 0; i < startingDay; i++) {
      const d = new Date(year, month, -startingDay + i + 1);
      days.push({ date: d.toISOString().split('T')[0], day: d.getDate(), isCurrentMonth: false, hasWorkout: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push({ date: d.toISOString().split('T')[0], day: i, isCurrentMonth: true, hasWorkout: workouts.some(w => w.date.startsWith(d.toISOString().split('T')[0])) });
    }
    while (days.length < 42) days.push({ date: '', day: days.length - 35 - daysInMonth + 1, isCurrentMonth: false, hasWorkout: false });
    return days;
  }, [calendarMonth, workouts]);

  // 2. PROGRESS
  const [progressData, setProgressData] = useState<any[]>([]);
  const [progressMetric, setProgressMetric] = useState('');
  const [progressValue, setProgressValue] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(`progress_data_${uid}`);
    if (saved) try { setProgressData(JSON.parse(saved)); } catch {}
  }, [uid]);

  const addProgressEntry = useCallback(() => {
    if (!progressMetric.trim() || !progressValue) return showNotification('❌ Enter metric & value');
    const val = parseFloat(progressValue);
    if (isNaN(val)) return showNotification('❌ Invalid value');
    const entry = { id: Date.now(), date: new Date().toISOString(), metric: progressMetric.trim(), value: val };
    const updated = [...progressData, entry];
    setProgressData(updated);
    localStorage.setItem(`progress_data_${uid}`, JSON.stringify(updated));
    setProgressMetric(''); setProgressValue('');
    showNotification('✅ Progress saved!');
  }, [progressMetric, progressValue, progressData, uid, showNotification]);

  const deleteProgressEntry = useCallback((id: number) => {
    const updated = progressData.filter(e => e.id !== id);
    setProgressData(updated);
    localStorage.setItem(`progress_data_${uid}`, JSON.stringify(updated));
    showNotification('🗑️ Entry deleted');
  }, [progressData, uid, showNotification]);

  // 3. ACHIEVEMENTS
  const [achievements, setAchievements] = useState<string[]>([]);
  const [newAchievement, setNewAchievement] = useState<string | null>(null);
  const achievementList = [
    { id: 'first_workout', name: 'First Steps', icon: '🎯', desc: 'Complete your first workout' },
    { id: 'week_warrior', name: 'Week Warrior', icon: '🔥', desc: 'Complete 7 workouts' },
    { id: 'month_master', name: 'Month Master', icon: '💎', desc: 'Complete 30 workouts' },
    { id: 'century_club', name: 'Century Club', icon: '👑', desc: 'Complete 100 workouts' },
    { id: 'hydration_hero', name: 'Hydration Hero', icon: '💧', desc: 'Track hydration for 1 day' },
    { id: 'progress_tracker', name: 'Data Nerd', icon: '📊', desc: 'Log 10 progress entries' },
  ];

  useEffect(() => {
    const saved = localStorage.getItem(`achievements_${uid}`);
    if (saved) try { setAchievements(JSON.parse(saved)); } catch {}
  }, [uid]);

  // 4. SOCIAL
  const [sharedWorkouts, setSharedWorkouts] = useState<any[]>([]);
  const [shareName, setShareName] = useState('');
  const [shareDuration, setShareDuration] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(`shared_workouts_${uid}`);
    if (saved) try { setSharedWorkouts(JSON.parse(saved)); } catch {}
  }, [uid]);

  const shareWorkout = useCallback(() => {
    if (!shareName.trim() || !shareDuration) return showNotification('❌ Enter name & duration');
    const d = parseInt(shareDuration);
    if (isNaN(d) || d <= 0) return showNotification('❌ Invalid duration');
    const updated = [{ id: Date.now(), name: shareName.trim(), duration: d, exercises: 5, calories: d*8, sharedAt: new Date().toISOString(), likes: 0 }, ...sharedWorkouts];
    setSharedWorkouts(updated); 
    localStorage.setItem(`shared_workouts_${uid}`, JSON.stringify(updated));
    setShareName(''); setShareDuration('');
    showNotification('📤 Shared!');
  }, [shareName, shareDuration, sharedWorkouts, uid, showNotification]);

  const likeWorkout = useCallback((id: number) => {
    const u = sharedWorkouts.map(w => w.id === id ? {...w, likes: (w.likes||0)+1} : w);
    setSharedWorkouts(u); 
    localStorage.setItem(`shared_workouts_${uid}`, JSON.stringify(u));
  }, [sharedWorkouts, uid]);

  // 5. MUSIC PLAYER
  const [playlist, setPlaylist] = useState<any[]>([
    { id: 1, title: 'Beast Mode (Default)', url: '', isDefault: true },
    { id: 2, title: 'Pump It Up (Default)', url: '', isDefault: true },
  ]);
  const [currentSong, setCurrentSong] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newSongs = files.map(f => ({ id: Date.now() + Math.random(), title: f.name.replace(/\.[^/.]+$/, ''), url: URL.createObjectURL(f), isDefault: false }));
    setPlaylist(prev => [...prev, ...newSongs]);
    if (!currentSong) setCurrentSong(newSongs[0]);
    showNotification(`🎵 Imported ${files.length} song${files.length > 1 ? 's' : ''}!`);
    e.target.value = '';
  };

  const togglePlay = useCallback(() => {
    if (!currentSong || !audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play(); setIsPlaying(true); }
  }, [currentSong, isPlaying]);

  const playSong = useCallback((song: any) => { setCurrentSong(song); setIsPlaying(true); setProgress(0); }, []);
  const nextSong = useCallback(() => {
    if (!currentSong) return;
    const idx = playlist.findIndex(s => s.id === currentSong.id);
    setCurrentSong(playlist[(idx + 1) % playlist.length]); setProgress(0); setIsPlaying(true);
  }, [currentSong, playlist]);
  const prevSong = useCallback(() => {
    if (!currentSong) return;
    const idx = playlist.findIndex(s => s.id === currentSong.id);
    setCurrentSong(playlist[(idx - 1 + playlist.length) % playlist.length]); setProgress(0); setIsPlaying(true);
  }, [currentSong, playlist]);

  const formatTime = (s: number) => { const m = Math.floor(s / 60); return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`; };
  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  // 6. ANALYTICS
  const getAnalytics = useCallback(() => {
    const total = workouts.length;
    const week = workouts.filter(w => new Date(w.date) >= new Date(Date.now() - 604800000)).length;
    const mins = workouts.reduce((a, w) => a + (w.duration||0), 0);
    let streak = 0;
    if (total > 0) {
      const dates = [...new Set(workouts.map(w => w.date.split('T')[0]))].sort((a,b) => new Date(b).getTime()-new Date(a).getTime());
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now()-86400000).toISOString().split('T')[0];
      if (dates[0]===today||dates[0]===yesterday) {
        streak = 1;
        for (let i=1;i<dates.length;i++) {
          const diff = Math.round((new Date(dates[i-1]).getTime()-new Date(dates[i]).getTime())/86400000);
          if(diff===1) streak++; else break;
        }
      }
    }
    return { total, week, mins, streak, unlocked: achievements.length, totalAch: achievementList.length };
  }, [workouts, achievements]);

  // 7-14. CALCULATORS
  const [bmiH, setBmiH] = useState(170), [bmiW, setBmiW] = useState(70);
  const bmiVal = (bmiW / ((bmiH/100)**2)).toFixed(1);
  
  const [cW, setCW] = useState(70), [cA, setCA] = useState(25), [cH, setCH] = useState(170), [cG, setCG] = useState<'male'|'female'>('male'), [cAct, setCAct] = useState(1.55);
  const tdee = Math.round((()=>{ let b=10*cW+6.25*cH-5*cA; b+=cG==='male'?5:-161; return b*cAct; })());
  
  const [rmW, setRmW] = useState(100), [rmR, setRmR] = useState(5);
  const oneRm = Math.round(rmW*(1+rmR/30));
  
  const [restS, setRestS] = useState(90), [restRun, setRestRun] = useState(false), [timeL, setTimeL] = useState(90);
  useEffect(()=>{ let i:any; if(restRun&&timeL>0) i=setInterval(()=>setTimeL(t=>t-1),1000); else if(timeL===0&&restRun){setRestRun(false);showNotification('⏱️ Time\'s up!');} return()=>clearInterval(i); },[restRun,timeL,showNotification]);
  
  const [glasses, setGlasses] = useState(0), [gGoal, setGGoal] = useState(8);
  useEffect(()=>{ 
    const s=localStorage.getItem(`hydration_glasses_${uid}`),g=localStorage.getItem(`hydration_goal_${uid}`),d=localStorage.getItem(`hydration_date_${uid}`); 
    if(d===new Date().toDateString()&&s) setGlasses(parseInt(s)); 
    else {setGlasses(0);localStorage.setItem(`hydration_date_${uid}`,new Date().toDateString());} 
    if(g) setGGoal(parseInt(g)); 
  },[uid]);
  
  const [mCal, setMCal] = useState(2000), [mRat, setMRat] = useState<'balanced'|'lowcarb'|'highprotein'>('balanced');
  const mSplit = mRat==='lowcarb'?{p:0.4,c:0.2,f:0.4}:mRat==='highprotein'?{p:0.4,c:0.3,f:0.3}:{p:0.3,c:0.4,f:0.3};
  
  const [swT, setSwT] = useState(0), [swRun, setSwRun] = useState(false), [laps, setLaps] = useState<number[]>([]);
  useEffect(()=>{ let i:any; if(swRun) i=setInterval(()=>setSwT(t=>t+1),1000); return()=>clearInterval(i); },[swRun]);
  
  const [bfW, setBfW] = useState(85), [bfN, setBfN] = useState(38), [bfH, setBfH] = useState(175);
  const bfPct = Math.max(0, 86.010*Math.log10(bfW-bfN)-70.041*Math.log10(bfH)+36.76).toFixed(1);

  // RENDER
  const renderTool = () => {
    if (!activeTool) return null;
    return (
      <div style={{background:'white',borderRadius:'24px',padding:'32px',boxShadow:'0 10px 40px rgba(0,0,0,0.2)'}}>
        <div style={{display:'flex',alignItems:'center',marginBottom:'24px',justifyContent:'space-between'}}>
          <button onClick={()=>setActiveTool(null)} style={{padding:'12px 24px',background:'#667eea',color:'white',border:'none',borderRadius:'8px',fontWeight:'bold',cursor:'pointer',marginRight:'16px',boxShadow:'0 4px 12px rgba(102,126,234,0.3)'}}>← Back</button>
          <h2 style={{fontSize:'28px',fontWeight:'bold',color:'#111827',margin:0,textTransform:'uppercase'}}>{activeTool}</h2>
        </div>

        {activeTool==='calendar' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
              <button onClick={()=>setCalendarMonth(new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()-1))} style={{padding:'12px 24px',background:'#667eea',color:'white',border:'none',borderRadius:'8px',fontWeight:'bold',cursor:'pointer',boxShadow:'0 4px 12px rgba(102,126,234,0.3)'}}>← Prev</button>
              <h3 style={{margin:0,fontSize:'20px'}}>{calendarMonth.toLocaleDateString('en-US',{month:'long',year:'numeric'})}</h3>
              <button onClick={()=>setCalendarMonth(new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+1))} style={{padding:'12px 24px',background:'#667eea',color:'white',border:'none',borderRadius:'8px',fontWeight:'bold',cursor:'pointer',boxShadow:'0 4px 12px rgba(102,126,234,0.3)'}}>Next →</button>
            </div>
            <div style={{marginBottom:'24px',padding:'16px',background:'#f9fafb',borderRadius:'12px'}}>
              <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'8px',textAlign:'center'}}>
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=><div key={d} style={{fontWeight:'bold',color:'#6b7280',padding:'8px'}}>{d}</div>)}
                {getCalendarDays().map((d,i)=>{
                  const isToday=d.date===new Date().toISOString().split('T')[0], sel=d.date===selectedDate;
                  return <button key={i} onClick={()=>d.isCurrentMonth&&d.date&&setSelectedDate(d.date)} disabled={!d.isCurrentMonth} style={{padding:'12px',borderRadius:'8px',border:sel?'3px solid #667eea':'2px solid #e5e7eb',background:d.hasWorkout?'#667eea':isToday?'#f3f4f6':d.isCurrentMonth?'white':'transparent',color:d.hasWorkout?'white':d.isCurrentMonth?'#111827':'#9ca3af',fontWeight:d.hasWorkout||sel?'bold':'normal',cursor:d.isCurrentMonth?'pointer':'default',opacity:d.isCurrentMonth?1:0.3}}>{d.day}</button>;
                })}
              </div>
            </div>
            <div style={{padding:'20px',background:'#ecfdf5',borderRadius:'12px',border:'2px solid #10b981'}}>
              <h3 style={{margin:'0 0 12px 0'}}>Workouts on {new Date(selectedDate).toLocaleDateString()}</h3>
              {workouts.filter(w=>w.date.startsWith(selectedDate)).length===0?<p style={{color:'#6b7280',margin:0}}>None logged.</p>:workouts.filter(w=>w.date.startsWith(selectedDate)).map(w=>(
                <div key={w.id} style={{padding:'12px',background:'white',borderRadius:'8px',marginBottom:'8px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div><p style={{margin:0,fontWeight:'bold'}}>{w.name}</p><p style={{margin:'4px 0 0',fontSize:'14px',color:'#6b7280'}}>{w.duration} min</p></div>
                  <button onClick={()=>deleteWorkout(w.id)} style={{padding:'8px 16px',background:'#ef4444',color:'white',border:'none',borderRadius:'6px',cursor:'pointer',fontWeight:'bold',boxShadow:'0 2px 8px rgba(239,68,68,0.3)'}}>🗑️</button>
                </div>
              ))}
            </div>
            <div style={{marginTop:'24px',padding:'20px',background:'#f9fafb',borderRadius:'12px'}}>
              <h3 style={{marginBottom:'12px'}}>Log Workout</h3>
              <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
                <input type="text" value={workoutName} onChange={e=>setWorkoutName(e.target.value)} placeholder="Name" style={{padding:'12px',borderRadius:'8px',border:'2px solid #e5e7eb',flex:1,minWidth:'150px'}}/>
                <input type="number" value={workoutDuration} onChange={e=>setWorkoutDuration(e.target.value)} placeholder="Min" style={{padding:'12px',borderRadius:'8px',border:'2px solid #e5e7eb',width:'120px'}}/>
                <button onClick={saveWorkout} style={{padding:'12px 24px',background:'#10b981',color:'white',border:'none',borderRadius:'8px',fontWeight:'bold',cursor:'pointer',boxShadow:'0 4px 12px rgba(16,185,129,0.3)'}}>+ Save</button>
              </div>
            </div>
          </div>
        )}

        {activeTool==='progress' && (
          <div>
            <h3 style={{marginBottom:'16px'}}>📊 Progress</h3>
            <div style={{display:'flex',gap:'12px',marginBottom:'24px',flexWrap:'wrap'}}>
              <input type="text" value={progressMetric} onChange={e=>setProgressMetric(e.target.value)} placeholder="Metric" style={{padding:'12px',borderRadius:'8px',border:'2px solid #e5e7eb',flex:1,minWidth:'200px'}}/>
              <input type="number" value={progressValue} onChange={e=>setProgressValue(e.target.value)} placeholder="Value" style={{padding:'12px',borderRadius:'8px',border:'2px solid #e5e7eb',width:'120px'}}/>
              <button onClick={addProgressEntry} style={{padding:'12px 24px',background:'#667eea',color:'white',border:'none',borderRadius:'8px',fontWeight:'bold',cursor:'pointer',boxShadow:'0 4px 12px rgba(102,126,234,0.3)'}}>+ Add</button>
            </div>
            {progressData.length>0 && <div style={{padding:'20px',background:'#f9fafb',borderRadius:'12px',maxHeight:'300px',overflowY:'auto'}}>
              <h4 style={{margin:'0 0 12px 0'}}>Entries</h4>
              {progressData.slice().reverse().map(e=><div key={e.id} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #e5e7eb'}}>
                <span style={{fontWeight:'bold'}}>{e.metric}</span><span>{e.value}</span><span style={{color:'#6b7280',fontSize:'12px'}}>{new Date(e.date).toLocaleDateString()}</span>
              </div>)}
            </div>}
          </div>
        )}

        {activeTool==='achievements' && (
          <div>
            {newAchievement && <div style={{padding:'20px',background:'linear-gradient(135deg,#fbbf24,#f59e0b)',borderRadius:'16px',marginBottom:'24px',textAlign:'center'}}><p style={{fontSize:'24px',fontWeight:'bold',margin:0}}>🏆 {newAchievement}</p></div>}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:'16px'}}>
              {achievementList.map(ach=>{
                const u=achievements.includes(ach.id);
                return <div key={ach.id} style={{padding:'20px',background:u?'#ecfdf5':'#f9fafb',borderRadius:'16px',border:`2px solid ${u?'#10b981':'#e5e7eb'}`,opacity:u?1:0.6}}>
                  <div style={{fontSize:'48px',textAlign:'center',marginBottom:'12px'}}>{ach.icon}</div>
                  <h3 style={{margin:'0 0 8px 0',textAlign:'center'}}>{ach.name}</h3>
                  <p style={{margin:0,textAlign:'center',color:'#6b7280',fontSize:'14px'}}>{ach.desc}</p>
                  {u && <p style={{textAlign:'center',color:'#10b981',fontWeight:'bold',marginTop:'8px'}}>✓</p>}
                </div>;
              })}
            </div>
          </div>
        )}

        {activeTool==='social' && (
          <div>
            <h3 style={{marginBottom:'16px'}}>👥 Feed</h3>
            {sharedWorkouts.length===0?<p style={{textAlign:'center',color:'#6b7280',padding:'40px'}}>No posts yet.</p>:<div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
              {sharedWorkouts.map(w=><div key={w.id} style={{padding:'20px',background:'white',borderRadius:'12px',border:'2px solid #e5e7eb'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'12px'}}>
                  <div><p style={{fontWeight:'bold',margin:0}}>{w.name}</p><p style={{color:'#6b7280',fontSize:'14px',margin:'4px 0 0'}}>{w.duration} min • {w.calories} cal</p></div>
                  <button onClick={()=>{const u=sharedWorkouts.filter(x=>x.id!==w.id);setSharedWorkouts(u);localStorage.setItem(`shared_workouts_${uid}`,JSON.stringify(u));showNotification('🗑️ Deleted');}} style={{background:'#ef4444',color:'white',border:'none',borderRadius:'6px',padding:'8px 16px',fontWeight:'bold',cursor:'pointer',boxShadow:'0 2px 8px rgba(239,68,68,0.3)'}}>🗑️</button>
                </div>
                <button onClick={()=>likeWorkout(w.id)} style={{padding:'10px 20px',background:'#667eea',color:'white',border:'none',borderRadius:'8px',cursor:'pointer',boxShadow:'0 4px 12px rgba(102,126,234,0.3)'}}>❤️ {w.likes||0}</button>
              </div>)}
            </div>}
            <div style={{marginTop:'24px',padding:'20px',background:'#ecfdf5',borderRadius:'12px'}}>
              <h4 style={{margin:'0 0 12px 0'}}>Share</h4>
              <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
                <input type="text" value={shareName} onChange={e=>setShareName(e.target.value)} placeholder="Name" style={{padding:'12px',borderRadius:'8px',border:'2px solid #e5e7eb',flex:1}}/>
                <input type="number" value={shareDuration} onChange={e=>setShareDuration(e.target.value)} placeholder="Min" style={{padding:'12px',borderRadius:'8px',border:'2px solid #e5e7eb',width:'120px'}}/>
                <button onClick={shareWorkout} style={{padding:'12px 24px',background:'#10b981',color:'white',border:'none',borderRadius:'8px',fontWeight:'bold',cursor:'pointer',boxShadow:'0 4px 12px rgba(16,185,129,0.3)'}}>📤 Share</button>
              </div>
            </div>
          </div>
        )}
{activeTool==='music' && (
  <div>
    {/* Hidden Audio Element */}
    <audio 
      ref={audioRef} 
      src={currentSong?.url || ''} 
      onTimeUpdate={() => setProgress(audioRef.current?.currentTime || 0)} 
      onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)} 
      onEnded={nextSong} 
      onPlay={() => setIsPlaying(true)} 
      onPause={() => setIsPlaying(false)} 
    />
    
    {/* Hidden File Input */}
    <input 
      type="file" 
      accept="audio/*" 
      multiple 
      ref={fileInputRef} 
      onChange={handleFileImport} 
      style={{display:'none'}} 
    />
    
    <div style={{padding:'32px',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',borderRadius:'16px',color:'white',marginBottom:'24px',textAlign:'center'}}>
      {currentSong ? (
        <>
          <div style={{width:'120px',height:'120px',background:'rgba(255,255,255,0.2)',borderRadius:'50%',margin:'0 auto 16px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'48px'}}>🎵</div>
          <h3 style={{margin:'0 0 8px 0',fontSize:'24px'}}>{currentSong.title}</h3>
          <p style={{margin:'0 0 24px 0',opacity:0.8}}>{currentSong.isDefault ? 'Default Track' : 'Imported'}</p>
          
          {/* Progress Bar */}
          <div style={{marginBottom:'24px',cursor:'pointer'}} onClick={seekTo}>
            <div style={{height:'8px',background:'rgba(255,255,255,0.3)',borderRadius:'4px',overflow:'hidden'}}>
              <div style={{width:`${duration ? (progress/duration)*100 : 0}%`,height:'100%',background:'white',transition:'width 0.1s linear'}}></div>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:'8px',fontSize:'12px',opacity:0.9}}>
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div style={{display:'flex',justifyContent:'center',gap:'20px',alignItems:'center'}}>
            <button onClick={prevSong} style={{padding:'12px 24px',background:'white',color:'#667eea',border:'none',borderRadius:'50px',fontWeight:'bold',cursor:'pointer',boxShadow:'0 4px 12px rgba(0,0,0,0.2)'}}>⏮️</button>
            <button onClick={togglePlay} style={{padding:'16px 48px',background:'white',color:'#667eea',border:'none',borderRadius:'50px',fontSize:'20px',fontWeight:'bold',cursor:'pointer',boxShadow:'0 4px 12px rgba(0,0,0,0.2)'}}>{isPlaying ? '⏸️' : '▶️'}</button>
            <button onClick={nextSong} style={{padding:'12px 24px',background:'white',color:'#667eea',border:'none',borderRadius:'50px',fontWeight:'bold',cursor:'pointer',boxShadow:'0 4px 12px rgba(0,0,0,0.2)'}}>⏭️</button>
          </div>
        </>
      ) : (
        <div style={{padding:'40px'}}>
          <p style={{fontSize:'48px',marginBottom:'16px'}}>🎵</p>
          <p>Select or import a song to start!</p>
        </div>
      )}
    </div>

    {/* Import Button & Playlist */}
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px',flexWrap:'wrap',gap:'12px'}}>
      <h3 style={{margin:0}}>Playlist</h3>
      <button onClick={()=>fileInputRef.current?.click()} style={{padding:'12px 24px',background:'#10b981',color:'white',border:'none',borderRadius:'8px',fontWeight:'bold',cursor:'pointer',boxShadow:'0 4px 12px rgba(16,185,129,0.3)'}}>📥 Import Music</button>
    </div>

    <div style={{display:'flex',flexDirection:'column',gap:'12px',maxHeight:'400px',overflowY:'auto'}}>
      {playlist.map(song=>(
        <div key={song.id} onClick={()=>playSong(song)} style={{padding:'16px',background:currentSong?.id===song.id?'#f3f4f6':'white',borderRadius:'12px',border:`2px solid ${currentSong?.id===song.id?'#667eea':'#e5e7eb'}`,cursor:'pointer',display:'flex',alignItems:'center',gap:'16px'}}>
          <div style={{width:'40px',height:'40px',background:'#e5e7eb',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>🎵</div>
          <div style={{flex:1}}>
            <p style={{fontWeight:'bold',margin:0}}>{song.title}</p>
            <p style={{margin:'4px 0 0',color:'#6b7280',fontSize:'12px'}}>{song.isDefault ? 'Built-in' : 'Imported'}</p>
          </div>
          {currentSong?.id===song.id && isPlaying && <span style={{color:'#10b981'}}>▶️</span>}
        </div>
      ))}
      {playlist.length===0 && <p style={{textAlign:'center',color:'#6b7280',padding:'40px'}}>Playlist empty. Import songs!</p>}
    </div>
  </div>
)}

        {activeTool==='analytics' && (
          <div>
            <h3 style={{marginBottom:'24px'}}>📊 Analytics</h3>
            {(()=>{
              const s=getAnalytics();
              return <>
                <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'16px',marginBottom:'24px'}}>
                  <div style={{padding:'24px',background:'linear-gradient(135deg,#667eea,#764ba2)',borderRadius:'16px',color:'white'}}><p style={{fontSize:'48px',fontWeight:'bold',margin:'0 0 8px 0'}}>{s.total}</p><p style={{margin:0,opacity:0.9}}>Total</p></div>
                  <div style={{padding:'24px',background:'linear-gradient(135deg,#10b981,#059669)',borderRadius:'16px',color:'white'}}><p style={{fontSize:'48px',fontWeight:'bold',margin:'0 0 8px 0'}}>{s.week}</p><p style={{margin:0,opacity:0.9}}>This Week</p></div>
                  <div style={{padding:'24px',background:'linear-gradient(135deg,#f59e0b,#d97706)',borderRadius:'16px',color:'white'}}><p style={{fontSize:'48px',fontWeight:'bold',margin:'0 0 8px 0'}}>{s.mins}</p><p style={{margin:0,opacity:0.9}}>Minutes</p></div>
                  <div style={{padding:'24px',background:'linear-gradient(135deg,#ef4444,#dc2626)',borderRadius:'16px',color:'white'}}><p style={{fontSize:'48px',fontWeight:'bold',margin:'0 0 8px 0'}}>{s.streak}</p><p style={{margin:0,opacity:0.9}}>Streak 🔥</p></div>
                </div>
                {workouts.length>0 && <div style={{padding:'20px',background:'#ecfdf5',borderRadius:'12px'}}>
                  <h4 style={{margin:'0 0 16px 0'}}>Last 7</h4>
                  {workouts.slice(-7).reverse().map(w=><div key={w.id} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #d1fae5'}}><span style={{fontWeight:'bold'}}>{w.name}</span><span style={{color:'#6b7280'}}>{new Date(w.date).toLocaleDateString()}</span><span>{w.duration} min</span></div>)}
                </div>}
              </>;
            })()}
          </div>
        )}

        {activeTool==='bmi' && <div><label style={{display:'block',fontWeight:'bold',marginBottom:'8px'}}>Height: {bmiH} cm</label><input type="range" min="140" max="220" value={bmiH} onChange={e=>setBmiH(parseInt(e.target.value))} style={{width:'100%',marginBottom:'24px'}}/><label style={{display:'block',fontWeight:'bold',marginBottom:'8px'}}>Weight: {bmiW} kg</label><input type="range" min="40" max="150" value={bmiW} onChange={e=>setBmiW(parseInt(e.target.value))} style={{width:'100%',marginBottom:'24px'}}/><div style={{padding:'32px',background:'linear-gradient(135deg,#667eea,#764ba2)',borderRadius:'16px',color:'white',textAlign:'center'}}><p style={{fontSize:'72px',fontWeight:'bold',margin:0}}>{bmiVal}</p><p style={{fontSize:'24px',fontWeight:'bold',marginTop:'8px'}}>{parseFloat(bmiVal)<18.5?'Underweight':parseFloat(bmiVal)<25?'Normal':parseFloat(bmiVal)<30?'Overweight':'Obese'}</p></div></div>}

        {activeTool==='calories' && <div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'16px'}}><div><label style={{fontWeight:'bold',marginBottom:'4px',display:'block'}}>Gender</label><select value={cG} onChange={e=>setCG(e.target.value as any)} style={{width:'100%',padding:'12px',borderRadius:'8px',border:'2px solid #e5e7eb'}}><option value="male">Male</option><option value="female">Female</option></select></div><div><label style={{fontWeight:'bold',marginBottom:'4px',display:'block'}}>Age: {cA}</label><input type="range" min="15" max="80" value={cA} onChange={e=>setCA(parseInt(e.target.value))} style={{width:'100%'}}/></div></div><label style={{fontWeight:'bold',marginBottom:'4px',display:'block'}}>Height: {cH} cm</label><input type="range" min="140" max="220" value={cH} onChange={e=>setCH(parseInt(e.target.value))} style={{width:'100%',marginBottom:'16px'}}/><label style={{fontWeight:'bold',marginBottom:'4px',display:'block'}}>Weight: {cW} kg</label><input type="range" min="40" max="150" value={cW} onChange={e=>setCW(parseInt(e.target.value))} style={{width:'100%',marginBottom:'16px'}}/><label style={{fontWeight:'bold',marginBottom:'8px',display:'block'}}>Activity</label><select value={cAct} onChange={e=>setCAct(parseFloat(e.target.value))} style={{width:'100%',padding:'12px',borderRadius:'8px',border:'2px solid #e5e7eb',marginBottom:'24px'}}><option value={1.2}>Sedentary</option><option value={1.375}>Light</option><option value={1.55}>Moderate</option><option value={1.725}>Active</option><option value={1.9}>Very Active</option></select><div style={{padding:'24px',background:'#ecfdf5',borderRadius:'16px',border:'2px solid #10b981',textAlign:'center'}}><p style={{fontSize:'16px',fontWeight:'bold',margin:'0 0 8px 0'}}>Maintenance</p><p style={{fontSize:'48px',fontWeight:'bold',color:'#059669',margin:0}}>{tdee}</p><p style={{color:'#047857'}}>cal/day</p></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginTop:'24px'}}><div style={{padding:'16px',background:'#fef2f2',borderRadius:'12px',textAlign:'center'}}><p style={{fontWeight:'bold',color:'#dc2626'}}>Loss</p><p style={{fontSize:'28px',fontWeight:'bold',color:'#b91c1c'}}>{tdee-500}</p></div><div style={{padding:'16px',background:'#eff6ff',borderRadius:'12px',textAlign:'center'}}><p style={{fontWeight:'bold',color:'#2563eb'}}>Gain</p><p style={{fontSize:'28px',fontWeight:'bold',color:'#1d4ed8'}}>{tdee+300}</p></div></div></div>}

        {activeTool==='onerm' && <div><label style={{fontWeight:'bold',marginBottom:'8px',display:'block'}}>Weight: {rmW} kg</label><input type="range" min="10" max="300" value={rmW} onChange={e=>setRmW(parseInt(e.target.value))} style={{width:'100%',marginBottom:'24px'}}/><label style={{fontWeight:'bold',marginBottom:'8px',display:'block'}}>Reps: {rmR}</label><input type="range" min="1" max="15" value={rmR} onChange={e=>setRmR(parseInt(e.target.value))} style={{width:'100%',marginBottom:'24px'}}/><div style={{padding:'24px',background:'linear-gradient(135deg,#f59e0b,#d97706)',borderRadius:'16px',color:'white',textAlign:'center'}}><p style={{fontSize:'18px',margin:'0 0 8px 0',opacity:0.9}}>1 Rep Max</p><p style={{fontSize:'72px',fontWeight:'bold',margin:0}}>{oneRm} kg</p></div><div style={{marginTop:'24px',padding:'16px',background:'#fffbeb',borderRadius:'12px',border:'2px solid #f59e0b'}}><h3 style={{margin:'0 0 12px 0',fontSize:'16px'}}>Zones</h3><p>90%: {Math.round(oneRm*0.9)} kg</p><p>75%: {Math.round(oneRm*0.75)} kg</p><p>60%: {Math.round(oneRm*0.6)} kg</p></div></div>}

        {activeTool==='rest' && <div><div style={{display:'flex',gap:'8px',justifyContent:'center',marginBottom:'24px',flexWrap:'wrap'}}>{[30,60,90,120,180].map(s=><button key={s} onClick={()=>{setRestS(s);setTimeL(s);setRestRun(false);}} style={{padding:'10px 20px',borderRadius:'20px',border:'none',background:restS===s?'#667eea':'#e5e7eb',color:restS===s?'white':'#374151',fontWeight:'bold',cursor:'pointer',boxShadow:restS===s?'0 4px 12px rgba(102,126,234,0.3)':'none'}}>{s}s</button>)}</div><div style={{padding:'40px',background:restRun?'#fee2e2':'#ecfdf5',borderRadius:'24px',textAlign:'center',border:restRun?'2px solid #ef4444':'2px solid #10b981'}}><p style={{fontSize:'96px',fontWeight:'bold',margin:0,color:restRun?'#dc2626':'#059669',fontFamily:'monospace'}}>{Math.floor(timeL/60)}:{(timeL%60).toString().padStart(2,'0')}</p>{timeL===0 && <p style={{color:'#dc2626',fontWeight:'bold',marginTop:'16px'}}>TIME'S UP!</p>}</div><div style={{display:'flex',gap:'12px',justifyContent:'center',marginTop:'24px'}}>{!restRun?<button onClick={()=>setRestRun(true)} style={{padding:'16px 48px',background:'#10b981',color:'white',border:'none',borderRadius:'12px',fontSize:'20px',fontWeight:'bold',cursor:'pointer',boxShadow:'0 4px 12px rgba(16,185,129,0.3)'}}>▶️ Start</button>:<button onClick={()=>setRestRun(false)} style={{padding:'16px 48px',background:'#f59e0b',color:'white',border:'none',borderRadius:'12px',fontSize:'20px',fontWeight:'bold',cursor:'pointer',boxShadow:'0 4px 12px rgba(245,158,11,0.3)'}}>⏸️ Pause</button>}<button onClick={()=>{setRestRun(false);setTimeL(restS);}} style={{padding:'16px 48px',background:'#6b7280',color:'white',border:'none',borderRadius:'12px',fontSize:'20px',fontWeight:'bold',cursor:'pointer',boxShadow:'0 4px 12px rgba(107,114,128,0.3)'}}>🔄 Reset</button></div></div>}

        {activeTool==='hydration' && <div style={{textAlign:'center'}}><div style={{padding:'32px',background:'#dbeafe',borderRadius:'24px',marginBottom:'24px'}}><p style={{fontSize:'64px',marginBottom:'16px'}}>💧</p><p style={{fontSize:'32px',fontWeight:'bold',color:'#2563eb'}}>{glasses} / {gGoal}</p><div style={{marginTop:'16px',height:'12px',background:'white',borderRadius:'10px',overflow:'hidden'}}><div style={{width:`${Math.min((glasses/gGoal)*100,100)}%`,height:'100%',background:'#3b82f6',transition:'width 0.3s'}}></div></div></div><div style={{display:'flex',gap:'12px',justifyContent:'center',marginBottom:'24px'}}><button onClick={()=>{const n=glasses+1;setGlasses(n);localStorage.setItem(`hydration_glasses_${uid}`,n.toString());}} style={{padding:'16px 32px',background:'#3b82f6',color:'white',border:'none',borderRadius:'12px',fontSize:'20px',fontWeight:'bold',cursor:'pointer',boxShadow:'0 4px 12px rgba(59,130,246,0.3)'}}>+ Add</button><button onClick={()=>{setGlasses(0);localStorage.setItem(`hydration_glasses_${uid}`,'0');}} style={{padding:'16px 32px',background:'#ef4444',color:'white',border:'none',borderRadius:'12px',fontSize:'20px',fontWeight:'bold',cursor:'pointer',boxShadow:'0 4px 12px rgba(239,68,68,0.3)'}}>Reset</button></div><label style={{fontWeight:'bold',display:'block',marginBottom:'8px'}}>Goal</label><input type="range" min="4" max="16" value={gGoal} onChange={e=>{setGGoal(parseInt(e.target.value));localStorage.setItem(`hydration_goal_${uid}`,e.target.value);}} style={{width:'100%'}}/></div>}

        {activeTool==='macros' && <div><label style={{fontWeight:'bold',marginBottom:'8px',display:'block'}}>Calories: {mCal}</label><input type="range" min="1000" max="4000" step="100" value={mCal} onChange={e=>setMCal(parseInt(e.target.value))} style={{width:'100%',marginBottom:'24px'}}/><div style={{display:'flex',gap:'8px',justifyContent:'center',marginBottom:'24px'}}>{['balanced','highprotein','lowcarb'].map(r=><button key={r} onClick={()=>setMRat(r as any)} style={{padding:'10px 20px',borderRadius:'20px',border:'none',background:mRat===r?'#8b5cf6':'#e5e7eb',color:mRat===r?'white':'#374151',fontWeight:'bold',cursor:'pointer',boxShadow:mRat===r?'0 4px 12px rgba(139,92,246,0.3)':'none',textTransform:'capitalize'}}>{r}</button>)}</div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'16px'}}><div style={{padding:'16px',background:'#fee2e2',borderRadius:'12px',textAlign:'center'}}><p style={{fontSize:'32px',fontWeight:'bold',color:'#dc2626'}}>{Math.round((mCal*mSplit.p)/4)}g</p><p style={{fontWeight:'bold'}}>Protein</p></div><div style={{padding:'16px',background:'#dbeafe',borderRadius:'12px',textAlign:'center'}}><p style={{fontSize:'32px',fontWeight:'bold',color:'#2563eb'}}>{Math.round((mCal*mSplit.c)/4)}g</p><p style={{fontWeight:'bold'}}>Carbs</p></div><div style={{padding:'16px',background:'#fef3c7',borderRadius:'12px',textAlign:'center'}}><p style={{fontSize:'32px',fontWeight:'bold',color:'#d97706'}}>{Math.round((mCal*mSplit.f)/9)}g</p><p style={{fontWeight:'bold'}}>Fats</p></div></div></div>}

        {activeTool==='stopwatch' && <div style={{textAlign:'center'}}><p style={{fontSize:'72px',fontWeight:'bold',margin:'32px 0',fontFamily:'monospace'}}>{Math.floor(swT/60)}:{(swT%60).toString().padStart(2,'0')}</p><div style={{display:'flex',gap:'12px',justifyContent:'center',marginBottom:'32px'}}><button onClick={()=>setSwRun(!swRun)} style={{padding:'16px 48px',background:swRun?'#f59e0b':'#10b981',color:'white',border:'none',borderRadius:'12px',fontSize:'20px',fontWeight:'bold',cursor:'pointer',boxShadow:'0 4px 12px rgba(0,0,0,0.2)'}}>{swRun?'⏸️ Pause':'▶️ Start'}</button><button onClick={()=>{setSwRun(false);setSwT(0);setLaps([]);}} style={{padding:'16px 48px',background:'#ef4444',color:'white',border:'none',borderRadius:'12px',fontSize:'20px',fontWeight:'bold',cursor:'pointer',boxShadow:'0 4px 12px rgba(239,68,68,0.3)'}}>🔄 Reset</button></div>{swRun && <button onClick={()=>setLaps([...laps,swT])} style={{padding:'12px 32px',background:'#6366f1',color:'white',border:'none',borderRadius:'12px',fontWeight:'bold',cursor:'pointer',marginBottom:'24px',boxShadow:'0 4px 12px rgba(99,102,241,0.3)'}}>🏁 Lap</button>}{laps.length>0 && <div style={{background:'#f9fafb',borderRadius:'12px',padding:'16px',maxHeight:'200px',overflowY:'auto'}}><h3 style={{margin:'0 0 12px 0',fontSize:'16px',color:'#374151'}}>Laps</h3>{laps.map((l,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #e5e7eb'}}><span>Lap {i+1}</span><span style={{fontWeight:'bold'}}>{Math.floor(l/60)}:{(l%60).toString().padStart(2,'0')}</span></div>)}</div>}</div>}

        {activeTool==='bodyfat' && <div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'16px'}}><div><label style={{fontWeight:'bold',marginBottom:'4px',display:'block'}}>Waist (cm)</label><input type="number" value={bfW} onChange={e=>setBfW(parseInt(e.target.value))} style={{width:'100%',padding:'12px',borderRadius:'8px',border:'2px solid #e5e7eb'}}/></div><div><label style={{fontWeight:'bold',marginBottom:'4px',display:'block'}}>Neck (cm)</label><input type="number" value={bfN} onChange={e=>setBfN(parseInt(e.target.value))} style={{width:'100%',padding:'12px',borderRadius:'8px',border:'2px solid #e5e7eb'}}/></div></div><label style={{fontWeight:'bold',marginBottom:'4px',display:'block'}}>Height (cm)</label><input type="number" value={bfH} onChange={e=>setBfH(parseInt(e.target.value))} style={{width:'100%',padding:'12px',borderRadius:'8px',border:'2px solid #e5e7eb',marginBottom:'24px'}}/><div style={{padding:'24px',background:'#f3e8ff',borderRadius:'16px',border:'2px solid #a855f7',textAlign:'center'}}><p style={{fontSize:'16px',fontWeight:'bold',margin:'0 0 8px 0'}}>Body Fat</p><p style={{fontSize:'64px',fontWeight:'bold',color:'#9333ea',margin:0}}>{bfPct}%</p></div></div>}
      </div>
    );
  };

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',padding:'48px 16px'}}>
      {notification && <div style={{position:'fixed',top:'20px',left:'50%',transform:'translateX(-50%)',background:'#10b981',color:'white',padding:'16px 32px',borderRadius:'12px',fontWeight:'bold',zIndex:1000,boxShadow:'0 4px 12px rgba(0,0,0,0.2)',animation:'slideIn 0.3s ease'}}>{notification}</div>}
      <div style={{maxWidth:'1000px',margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}><h1 style={{fontSize:'42px',fontWeight:'bold',color:'white',marginBottom:'16px'}}>🏋️ Fitness Tools</h1></div>
        {!activeTool ? (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'20px'}}>
            {[['calendar','📅','Calendar'],['progress','📊','Progress'],['achievements','🏆','Achievements'],['social','👥','Social'],['music','🎵','Music'],['analytics','📈','Analytics'],['bmi','📊','BMI'],['calories','🔥','Calories'],['onerm','💪','1RM'],['rest','⏱️','Rest'],['hydration','💧','Hydration'],['macros','🥗','Macros'],['stopwatch','⏲️','Stopwatch'],['bodyfat','📏','Body Fat']].map(([id,icon,title])=>(
              <div key={id} onClick={()=>setActiveTool(id as string)} style={{padding:'32px',background:'white',borderRadius:'20px',cursor:'pointer',transition:'transform 0.2s',boxShadow:'0 4px 6px rgba(0,0,0,0.1)'}} onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-4px)')} onMouseLeave={e=>(e.currentTarget.style.transform='translateY(0)')}>
                <div style={{fontSize:'48px',marginBottom:'16px',textAlign:'center'}}>{icon}</div>
                <h3 style={{fontSize:'20px',fontWeight:'bold',marginBottom:'8px',color:'#1a1a1a',textAlign:'center'}}>{title}</h3>
              </div>
            ))}
          </div>
        ) : renderTool()}
      </div>
      <style>{`@keyframes slideIn{from{transform:translate(-50%,-100%);opacity:0}to{transform:translate(-50%,0);opacity:1}} button { transition: all 0.2s ease; } button:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important; }`}</style>
    </div>
  );
}