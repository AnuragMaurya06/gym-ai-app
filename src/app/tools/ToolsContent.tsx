'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ToolsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTool, setActiveTool] = useState(searchParams.get('active') || 'bmi');
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Calendar States
  const [workoutSchedule, setWorkoutSchedule] = useState<any>({});
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const user = localStorage.getItem('gym_ai_current_user');
    if (!user) router.push('/');
    else setCurrentUser(user);
  }, [router]);

  // Load saved calendar schedule
  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`gym_ai_schedule_${currentUser}`);
      if (saved) {
        try {
          setWorkoutSchedule(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load workout schedule');
        }
      }
    }
  }, [currentUser]);

  // Helper variables for calendar logic
  const todayKey = new Date().toISOString().split('T')[0];
  const todaysWorkout = workoutSchedule[todayKey] || null;
  const dateKey = selectedDate.toISOString().split('T')[0];
  const dateWorkout = workoutSchedule[dateKey] || null;

  const audioRef = useRef<HTMLAudioElement>(null);

  // All states
  const [bmiHeight, setBmiHeight] = useState('');
  const [bmiWeight, setBmiWeight] = useState('');
  const [bmiResult, setBmiResult] = useState<any>(null);
  const [calAge, setCalAge] = useState('');
  const [calGender, setCalGender] = useState('male');
  const [calWeight, setCalWeight] = useState('');
  const [calHeight, setCalHeight] = useState('');
  const [calActivity, setCalActivity] = useState('sedentary');
  const [calGoal, setCalGoal] = useState('maintain');
  const [calResult, setCalResult] = useState<any>(null);
  const [oneRmWeight, setOneRmWeight] = useState('');
  const [oneRmReps, setOneRmReps] = useState('');
  const [oneRmResult, setOneRmResult] = useState<any>(null);
  const [bfGender, setBfGender] = useState('male');
  const [bfWaist, setBfWaist] = useState('');
  const [bfNeck, setBfNeck] = useState('');
  const [bfHeight, setBfHeight] = useState('');
  const [bfHip, setBfHip] = useState('');
  const [bfResult, setBfResult] = useState<any>(null);
  const [macroCalories, setMacroCalories] = useState('2000');
  const [macroProtein, setMacroProtein] = useState(30);
  const [macroCarbs, setMacroCarbs] = useState(40);
  const [macroFats, setMacroFats] = useState(30);
  const [macroResult, setMacroResult] = useState<any>(null);
  const [waterWeight, setWaterWeight] = useState('');
  const [waterActivity, setWaterActivity] = useState('30');
  const [waterResult, setWaterResult] = useState<any>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerInterval, setTimerInterval] = useState<any>(null);
  const [restSeconds, setRestSeconds] = useState(60);
  const [restInitial, setRestInitial] = useState(60);
  const [restRunning, setRestRunning] = useState(false);
  const [restInterval, setRestInterval] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [logExercise, setLogExercise] = useState('');
  const [logSets, setLogSets] = useState('');
  const [logReps, setLogReps] = useState('');
  const [logWeight, setLogWeight] = useState('');
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchInterval, setStopwatchInterval] = useState<any>(null);
  const [laps, setLaps] = useState<number[]>([]);
  
  const defaultPlaylist = [
    { name: 'Beast Mode', artist: 'Workout Mix', duration: '3:45', url: '', id: -1 },
    { name: 'Pump It Up', artist: 'Gym Beats', duration: '4:20', url: '', id: -2 },
    { name: 'No Pain No Gain', artist: 'Fitness FM', duration: '3:30', url: '', id: -3 },
    { name: 'Push Harder', artist: 'Motivation Mix', duration: '4:00', url: '', id: -4 },
    { name: 'Champion', artist: 'Power Songs', duration: '3:55', url: '', id: -5 }
  ];

  const [playlist, setPlaylist] = useState<any[]>(defaultPlaylist);

  // Load Saved Songs from IndexedDB
  useEffect(() => {
    if (currentUser) {
      getSongsFromDB(currentUser).then(savedSongs => {
        setPlaylist([...defaultPlaylist, ...savedSongs]);
      });
    }
  }, [currentUser]);

  // Audio Logic
  useEffect(() => {
    if (audioRef.current && playlist[currentTrack]?.url) {
      audioRef.current.src = playlist[currentTrack].url;
      if (isPlaying) audioRef.current.play().catch(() => {});
    }
  }, [currentTrack, playlist]);

  useEffect(() => {
    if (audioRef.current) {
      isPlaying ? audioRef.current.play().catch(() => {}) : audioRef.current.pause();
    }
  }, [isPlaying]);

  // IndexedDB Helper Functions
  const DB_NAME = 'GymAIMusicDB';
  const DB_VERSION = 1;
  const STORE_NAME = 'songs';

  const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  };

  const saveSongToDB = async (email: string, song: any) => {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.add({ email, ...song });
    return new Promise((resolve) => tx.oncomplete = resolve);
  };

  const getSongsFromDB = async (email: string): Promise<any[]> => {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    return new Promise((resolve) => {
      request.onsuccess = () => {
        const allSongs = request.result.filter((s: any) => s.email === email);
        resolve(allSongs);
      };
    });
  };

  const deleteSongFromDB = async (id: number) => {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.delete(id);
    return new Promise((resolve) => tx.oncomplete = resolve);
  };

  // Import Song Function
  const handleImportSong = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length && currentUser) {
      const file = files[0];
      
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (file.size > maxSize) {
        alert("File is too large! Please use files under 500MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Url = event.target?.result as string;
        const newSong = {
          name: file.name.replace(/\.[^/.]+$/, ""),
          artist: 'Imported',
          duration: formatDuration(file.size),
          url: base64Url,
          id: Date.now(),
          isUserSong: true,
          fileSize: file.size
        };

        try {
          await saveSongToDB(currentUser, newSong);
          setPlaylist(prev => [...prev, newSong]);
          alert("Song imported successfully!");
        } catch (error) {
          console.error("Failed to save song:", error);
          alert("Failed to save song. Storage might be full.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDuration = (size: number) => {
    const mb = (size / (1024 * 1024)).toFixed(1);
    return `${mb}MB`;
  };

  // Delete Song Function
  const deleteSong = async (index: number) => {
    const songToDelete = playlist[index];
    
    if (songToDelete.isUserSong && currentUser && songToDelete.id) {
      try {
        await deleteSongFromDB(songToDelete.id);
        const newPlaylist = playlist.filter((_, i) => i !== index);
        setPlaylist(newPlaylist);

        if (index === currentTrack) {
          setIsPlaying(false);
          setCurrentTrack(0);
        } else if (index < currentTrack) {
          setCurrentTrack(currentTrack - 1);
        }
      } catch (error) {
        console.error("Failed to delete song:", error);
        alert("Failed to delete song.");
      }
    } else {
      alert("Cannot delete default playlist songs.");
    }
  };

  const calculateBMI = () => {
    if (!bmiHeight || !bmiWeight) return;
    const h = parseFloat(bmiHeight) / 100;
    const w = parseFloat(bmiWeight);
    const val = w / (h * h);
    const bmi = val.toFixed(1);
    let cat = '', col = '';
    if (val < 18.5) { cat = 'Underweight'; col = '#3b82f6'; }
    else if (val < 25) { cat = 'Normal'; col = '#10b981'; }
    else if (val < 30) { cat = 'Overweight'; col = '#f59e0b'; }
    else { cat = 'Obese'; col = '#ef4444'; }
    setBmiResult({ bmi, category: cat, color: col });
  };

  const calculateCalories = () => {
    if (!calAge || !calWeight || !calHeight) return;
    let bmr = calGender === 'male' 
      ? 88.362 + (13.397 * parseFloat(calWeight)) + (4.799 * parseFloat(calHeight)) - (5.677 * parseFloat(calAge))
      : 447.593 + (9.247 * parseFloat(calWeight)) + (3.098 * parseFloat(calHeight)) - (4.330 * parseFloat(calAge));
    const act: any = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, veryActive: 1.9 };
    let tdee = bmr * act[calActivity];
    if (calGoal === 'lose') tdee -= 500;
    else if (calGoal === 'gain') tdee += 500;
    setCalResult({ bmr: Math.round(bmr), tdee: Math.round(tdee), calories: Math.round(tdee) });
  };

  const calculateOneRM = () => {
    if (!oneRmWeight || !oneRmReps) return;
    setOneRmResult({ oneRM: (parseFloat(oneRmWeight) * (1 + parseFloat(oneRmReps) / 30)).toFixed(1) });
  };

  const calculateBodyFat = () => {
    if (!bfWaist || !bfNeck) return;
    const w = parseFloat(bfWaist), n = parseFloat(bfNeck);
    let bf = 0;
    if (bfGender === 'male') {
      if (!bfHeight) return;
      bf = 86.010 * Math.log10(w - n) - 70.041 * Math.log10(parseFloat(bfHeight)) + 36.76;
    } else {
      if (!bfHip || !bfHeight) return;
      bf = 163.205 * Math.log10(w + parseFloat(bfHip) - n) - 97.684 * Math.log10(parseFloat(bfHeight)) - 78.387;
    }
    let cat = '', col = '';
    if (bfGender === 'male') {
      if (bf < 6) { cat = 'Essential'; col = '#3b82f6'; }
      else if (bf < 14) { cat = 'Athletic'; col = '#10b981'; }
      else if (bf < 18) { cat = 'Fitness'; col = '#84cc16'; }
      else if (bf < 25) { cat = 'Average'; col = '#f59e0b'; }
      else { cat = 'Obese'; col = '#ef4444'; }
    } else {
      if (bf < 14) { cat = 'Essential'; col = '#3b82f6'; }
      else if (bf < 21) { cat = 'Athletic'; col = '#10b981'; }
      else if (bf < 25) { cat = 'Fitness'; col = '#84cc16'; }
      else if (bf < 32) { cat = 'Average'; col = '#f59e0b'; }
      else { cat = 'Obese'; col = '#ef4444'; }
    }
    setBfResult({ bodyFat: bf.toFixed(1), category: cat, color: col });
  };

  const calculateMacros = () => {
    const c = parseFloat(macroCalories);
    setMacroResult({
      protein: { grams: Math.round((c * macroProtein/100)/4), calories: Math.round(c * macroProtein/100) },
      carbs: { grams: Math.round((c * macroCarbs/100)/4), calories: Math.round(c * macroCarbs/100) },
      fats: { grams: Math.round((c * macroFats/100)/9), calories: Math.round(c * macroFats/100) }
    });
  };

  const calculateWater = () => {
    if (!waterWeight) return;
    const w = parseFloat(waterWeight), a = parseFloat(waterActivity);
    const total = (w * 0.033 + (a/60)*0.35).toFixed(2);
    setWaterResult({ total, glasses: Math.round(parseFloat(total)/0.25) });
  };

  const formatTime = (s: number) => `${Math.floor(s/3600).toString().padStart(2,'0')}:${Math.floor((s%3600)/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  const startTimer = () => { if(!timerRunning){setTimerRunning(true); setTimerInterval(setInterval(()=>setTimerSeconds(p=>p+1),1000));}};
  const pauseTimer = () => { if(timerInterval){clearInterval(timerInterval);setTimerRunning(false);}};
  const resetTimer = () => { if(timerInterval)clearInterval(timerInterval);setTimerRunning(false);setTimerSeconds(0);};

  const startRestTimer = () => {
    if(!restRunning && restSeconds>0){
      setRestRunning(true);
      setRestInterval(setInterval(()=>{
        setRestSeconds(p=>{ if(p<=1){clearInterval(restInterval);setRestRunning(false);return 0;} return p-1; });
      },1000));
    }
  };
  const pauseRestTimer = () => { if(restInterval){clearInterval(restInterval);setRestRunning(false);}};
  const resetRestTimer = () => { if(restInterval)clearInterval(restInterval);setRestRunning(false);setRestSeconds(restInitial);};

  const togglePlayPause = () => setIsPlaying(!isPlaying);
  const nextTrack = () => { setCurrentTrack(prev => (prev + 1) % playlist.length); setIsPlaying(true); };
  const prevTrack = () => { setCurrentTrack(prev => (prev - 1 + playlist.length) % playlist.length); setIsPlaying(true); };

  const addWorkoutLog = () => {
    if(!logExercise||!logSets||!logReps) return;
    const up = [{id:Date.now(),exercise:logExercise,sets:logSets,reps:logReps,weight:logWeight||'0',date:new Date().toLocaleString()},...workoutLogs];
    setWorkoutLogs(up); localStorage.setItem('gym_ai_workout_logs',JSON.stringify(up));
    setLogExercise('');setLogSets('');setLogReps('');setLogWeight('');
  };

  const startStopwatch = () => { if(!stopwatchRunning){setStopwatchRunning(true);setStopwatchInterval(setInterval(()=>setStopwatchTime(p=>p+1),1000));}};
  const pauseStopwatch = () => { if(stopwatchInterval){clearInterval(stopwatchInterval);setStopwatchRunning(false);}};
  const resetStopwatch = () => { if(stopwatchInterval)clearInterval(stopwatchInterval);setStopwatchRunning(false);setStopwatchTime(0);setLaps([]);};
  const lapStopwatch = () => setLaps(p=>[stopwatchTime,...p]);

  useEffect(()=>{const s=localStorage.getItem('gym_ai_workout_logs');if(s)setWorkoutLogs(JSON.parse(s));},[]);

  const tools = [
    {id:'bmi',name:'BMI',icon:'📊',color:'#667eea',bg:'#EEF2FF'},
    {id:'calories',name:'Calories',icon:'🔥',color:'#f59e0b',bg:'#FFFBEB'},
    {id:'onerm',name:'1RM',icon:'💪',color:'#ef4444',bg:'#FEF2F2'},
    {id:'bodyfat',name:'Body Fat',icon:'📏',color:'#10b981',bg:'#ECFDF5'},
    {id:'macros',name:'Macros',icon:'🥗',color:'#8b5cf6',bg:'#F5F3FF'},
    {id:'water',name:'Water',icon:'💧',color:'#3b82f6',bg:'#EFF6FF'},
    {id:'timer',name:'Timer',icon:'⏱️',color:'#ec4899',bg:'#FDF2F8'},
    {id:'rest',name:'Rest',icon:'⏲️',color:'#14b8a6',bg:'#F0FDFA'},
    {id:'music',name:'Music',icon:'🎵',color:'#f97316',bg:'#FFF7ED'},
    {id:'logger',name:'Logger',icon:'📝',color:'#84cc16',bg:'#F7FEE7'},
    {id:'stopwatch',name:'Stopwatch',icon:'⏱️',color:'#6366f1',bg:'#EEF2FF'},
    {id:'calendar',name:'Calendar',icon:'📅',color:'#06b6d4',bg:'#ECFEFF'}
  ];

  const currentTool = tools.find(t=>t.id===activeTool);
  if(!currentUser) return <div style={{padding:'40px',textAlign:'center',color:'white',fontSize:'20px'}}>Loading...</div>;

  const inputStyle = {width:'100%',padding:'14px',borderRadius:'12px',border:'3px solid',fontSize:'16px',boxSizing:'border-box' as const,fontWeight:'bold',color:'#111827',backgroundColor:'#ffffff'};
  const labelStyle = {fontWeight:'bold',display:'block',marginBottom:'8px',color:'#374151',fontSize:'16px'};

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',padding:'20px'}}>
      <audio ref={audioRef} style={{display:'none'}} />
      <div style={{maxWidth:'1000px',margin:'0 auto',background:'white',borderRadius:'30px',padding:'30px 20px',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px',padding:'20px',background:'linear-gradient(135deg,#667eea,#764ba2)',borderRadius:'20px',color:'white'}}>
          <h1 style={{margin:0,fontSize:'36px',fontWeight:'bold'}}>🛠️ All Fitness Tools</h1>
          <button onClick={()=>router.back()} style={{padding:'12px 24px',background:'white',color:'#667eea',border:'none',borderRadius:'12px',fontWeight:'bold',cursor:'pointer',fontSize:'16px'}}>← Back to App</button>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(130px, 1fr))',gap:'12px',marginBottom:'32px'}}>
          {tools.map(t=>(
            <button key={t.id} onClick={()=>setActiveTool(t.id)} style={{padding:'18px 12px',background:activeTool===t.id?t.color:t.bg,color:activeTool===t.id?'white':t.color,border:`3px solid ${activeTool===t.id?t.color:'transparent'}`,borderRadius:'16px',fontWeight:'bold',cursor:'pointer',fontSize:'14px',transition:'all 0.3s',boxShadow:activeTool===t.id?'0 8px 20px rgba(0,0,0,0.2)':'0 4px 10px rgba(0,0,0,0.1)'}}>
              <div style={{fontSize:'28px',marginBottom:'6px'}}>{t.icon}</div>
              <div>{t.name}</div>
            </button>
          ))}
        </div>

        <div style={{background:currentTool?.bg,padding:'40px',borderRadius:'24px',border:`3px solid ${currentTool?.color}`}}>
          
          {/* CALENDAR TOOL WITH WORKOUT PLANNER */}
          {activeTool==='calendar' && (
            <div>
              <h2 style={{margin:'0 0 24px 0',color:'#06b6d4',fontSize:'32px',fontWeight:'bold'}}>📅 Workout Calendar</h2>
              
              {/* Today's Workout Display */}
              {todaysWorkout && (
                <div style={{padding:'24px',background:'linear-gradient(135deg,#10b981,#059669)',borderRadius:'16px',color:'white',marginBottom:'24px',boxShadow:'0 8px 20px rgba(16,185,129,0.3)'}}>
                  <div style={{fontSize:'18px',opacity:0.9,marginBottom:'8px'}}> Today's Workout</div>
                  <div style={{fontSize:'28px',fontWeight:'bold',marginBottom:'8px'}}>{todaysWorkout}</div>
                  <div style={{fontSize:'14px',opacity:0.8}}>{new Date().toLocaleDateString('en-US', {weekday:'long',month:'long',day:'numeric'})}</div>
                </div>
              )}
              
              {/* Calendar Grid */}
              <div style={{background:'linear-gradient(135deg,#06b6d4,#0891b2)',padding:'32px',borderRadius:'20px',color:'white',marginBottom:'24px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
                  <button onClick={()=>{const d=new Date(selectedDate);d.setMonth(d.getMonth()-1);setSelectedDate(new Date(d));}} style={{padding:'8px 16px',background:'rgba(255,255,255,0.2)',border:'none',borderRadius:'8px',color:'white',cursor:'pointer',fontWeight:'bold'}}>◀️</button>
                  <div style={{textAlign:'center',fontSize:'24px',fontWeight:'bold'}}>{selectedDate.toLocaleDateString('en-US', {month:'long',year:'numeric'})}</div>
                  <button onClick={()=>{const d=new Date(selectedDate);d.setMonth(d.getMonth()+1);setSelectedDate(new Date(d));}} style={{padding:'8px 16px',background:'rgba(255,255,255,0.2)',border:'none',borderRadius:'8px',color:'white',cursor:'pointer',fontWeight:'bold'}}>▶️</button>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'8px',textAlign:'center'}}>
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>(<div key={d} style={{fontWeight:'bold',padding:'8px',background:'rgba(255,255,255,0.2)',borderRadius:'8px',fontSize:'14px'}}>{d}</div>))}
                  {Array.from({length:35},(_,i)=>{
                    const d=new Date(selectedDate.getFullYear(),selectedDate.getMonth(),1);
                    d.setDate(d.getDate()+(d.getDay()===0?-6:1)-d.getDay()+i);
                    const cur=d.getMonth()===selectedDate.getMonth();
                    const today=d.toDateString()===new Date().toDateString();
                    const dateKey=d.toISOString().split('T')[0];
                    const hasWorkout=workoutSchedule[dateKey];
                    return(
                      <div key={i} onClick={()=>{if(cur){setSelectedDate(d);setShowAddWorkout(true);}}} style={{
                        padding:'12px 4px',
                        background:today?'white':hasWorkout?'rgba(255,255,255,0.4)':cur?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.03)',
                        color:today?'#06b6d4':'white',
                        borderRadius:'8px',
                        cursor:cur?'pointer':'default',
                        fontWeight:'bold',
                        fontSize:'14px',
                        position:'relative',
                        border:hasWorkout&&!today?'2px solid rgba(255,255,255,0.6)':'none'
                      }}>
                        {d.getDate()}
                        {hasWorkout && <div style={{fontSize:'8px',marginTop:'2px',opacity:0.9}}>🏋️</div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add/Edit Workout Modal */}
              {showAddWorkout && (
                <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'20px'}}>
                  <div style={{background:'white',padding:'32px',borderRadius:'20px',maxWidth:'400px',width:'100%',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
                    <h3 style={{margin:'0 0 20px 0',color:'#06b6d4',fontSize:'24px',fontWeight:'bold'}}>
                      📅 {selectedDate.toLocaleDateString('en-US', {month:'long',day:'numeric',year:'numeric'})}
                    </h3>
                    {dateWorkout && (
                      <div style={{padding:'12px',background:'#f0fdfa',borderRadius:'12px',marginBottom:'16px',borderLeft:'4px solid #06b6d4'}}>
                        <div style={{fontSize:'14px',color:'#666',marginBottom:'4px'}}>Current Workout:</div>
                        <div style={{fontSize:'18px',fontWeight:'bold',color:'#0e7490'}}>{dateWorkout}</div>
                      </div>
                    )}
                    <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                      <label style={{fontWeight:'bold',color:'#374151',fontSize:'16px'}}>Workout Name:</label>
                      <input 
                        type="text" 
                        value={newWorkoutName} 
                        onChange={e=>setNewWorkoutName(e.target.value)} 
                        placeholder="e.g., Leg Day, Chest & Triceps" 
                        style={{width:'100%',padding:'14px',borderRadius:'12px',border:'3px solid #06b6d4',fontSize:'16px',boxSizing:'border-box',fontWeight:'bold',color:'#111827',backgroundColor:'#ffffff'}}
                      />
                      <div style={{display:'flex',gap:'12px',marginTop:'8px'}}>
                        <button onClick={()=>{
                          if(newWorkoutName.trim()){
                            const dk=selectedDate.toISOString().split('T')[0];
                            const updated={...workoutSchedule,[dk]:newWorkoutName.trim()};
                            setWorkoutSchedule(updated);
                            localStorage.setItem(`gym_ai_schedule_${currentUser}`,JSON.stringify(updated));
                            setShowAddWorkout(false);
                            setNewWorkoutName('');
                          }
                        }} style={{flex:1,padding:'14px',background:'linear-gradient(135deg,#06b6d4,#0891b2)',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'bold',cursor:'pointer'}}>
                          💾 Save
                        </button>
                        {dateWorkout && (
                          <button onClick={()=>{
                            const dk=selectedDate.toISOString().split('T')[0];
                            const updated={...workoutSchedule};
                            delete updated[dk];
                            setWorkoutSchedule(updated);
                            localStorage.setItem(`gym_ai_schedule_${currentUser}`,JSON.stringify(updated));
                            setShowAddWorkout(false);
                            setNewWorkoutName('');
                          }} style={{flex:1,padding:'14px',background:'#ef4444',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'bold',cursor:'pointer'}}>
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                      <button onClick={()=>{setShowAddWorkout(false);setNewWorkoutName('');}} style={{padding:'14px',background:'#6b7280',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'bold',cursor:'pointer'}}>
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Upcoming Workouts List */}
              <div style={{background:'white',padding:'24px',borderRadius:'16px',border:'3px solid #06b6d4'}}>
                <h3 style={{margin:'0 0 16px 0',color:'#374151',fontSize:'20px',fontWeight:'bold'}}>📋 Upcoming Workouts</h3>
                {Object.keys(workoutSchedule).length===0 ? (
                  <p style={{color:'#666',fontSize:'16px'}}>No workouts scheduled. Click on a date to add one!</p>
                ) : (
                  <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                    {Object.entries(workoutSchedule)
                      .filter(([date])=>new Date(date)>=new Date(new Date().toDateString()))
                      .sort(([a],[b])=>new Date(a).getTime()-new Date(b).getTime())
                      .slice(0,5)
                      .map(([date,workout])=>(
                        <div key={date} style={{padding:'16px',background:'#f0fdfa',borderRadius:'12px',borderLeft:'4px solid #06b6d4',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <div>
                            <div style={{fontWeight:'bold',color:'#0e7490',fontSize:'16px',marginBottom:'4px'}}>{workout as string}</div>
                            <div style={{color:'#6b7280',fontSize:'14px'}}>{new Date(date).toLocaleDateString('en-US', {weekday:'short',month:'short',day:'numeric'})}</div>
                          </div>
                          <div style={{fontSize:'20px'}}>🏋️</div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BMI CALCULATOR */}
          {activeTool==='bmi' && (
            <div>
              <h2 style={{margin:'0 0 24px 0',color:'#667eea',fontSize:'32px',fontWeight:'bold'}}>📊 BMI Calculator</h2>
              <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>
                <div><label style={labelStyle}>📏 Height (cm)</label><input type="number" value={bmiHeight} onChange={e=>setBmiHeight(e.target.value)} placeholder="175" style={{...inputStyle,borderColor:'#667eea'}}/></div>
                <div><label style={labelStyle}>⚖️ Weight (kg)</label><input type="number" value={bmiWeight} onChange={e=>setBmiWeight(e.target.value)} placeholder="70" style={{...inputStyle,borderColor:'#667eea'}}/></div>
                <button onClick={calculateBMI} style={{padding:'18px',background:'linear-gradient(135deg,#667eea,#764ba2)',color:'white',border:'none',borderRadius:'12px',fontSize:'18px',fontWeight:'bold',cursor:'pointer'}}>🔍 Calculate</button>
                {bmiResult && <div style={{padding:'32px',background:`linear-gradient(135deg,${bmiResult.color},${bmiResult.color}dd)`,color:'white',borderRadius:'16px',textAlign:'center',marginTop:'16px'}}><div style={{fontSize:'64px',fontWeight:'bold'}}>{bmiResult.bmi}</div><div style={{fontSize:'24px',fontWeight:'bold'}}>{bmiResult.category}</div></div>}
              </div>
            </div>
          )}

          {activeTool==='calories' && (
            <div>
              <h2 style={{margin:'0 0 24px 0',color:'#f59e0b',fontSize:'32px',fontWeight:'bold'}}>🔥 Calorie Calculator</h2>
              <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
                  <div><label style={labelStyle}>🎂 Age</label><input type="number" value={calAge} onChange={e=>setCalAge(e.target.value)} placeholder="25" style={{...inputStyle,borderColor:'#f59e0b'}}/></div>
                  <div><label style={labelStyle}>👤 Gender</label><select value={calGender} onChange={e=>setCalGender(e.target.value)} style={{...inputStyle,borderColor:'#f59e0b',backgroundColor:'#ffffff'}}><option value="male">👨 Male</option><option value="female">👩 Female</option></select></div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
                  <div><label style={labelStyle}>⚖️ Weight (kg)</label><input type="number" value={calWeight} onChange={e=>setCalWeight(e.target.value)} placeholder="70" style={{...inputStyle,borderColor:'#f59e0b'}}/></div>
                  <div><label style={labelStyle}>📏 Height (cm)</label><input type="number" value={calHeight} onChange={e=>setCalHeight(e.target.value)} placeholder="175" style={{...inputStyle,borderColor:'#f59e0b'}}/></div>
                </div>
                <div><label style={labelStyle}>🏃 Activity Level</label><select value={calActivity} onChange={e=>setCalActivity(e.target.value)} style={{...inputStyle,borderColor:'#f59e0b',backgroundColor:'#ffffff'}}><option value="sedentary">😴 Sedentary</option><option value="light">🚶 Light</option><option value="moderate">🏃 Moderate</option><option value="active">💪 Active</option><option value="veryActive">🔥 Very Active</option></select></div>
                <div><label style={labelStyle}>🎯 Goal</label><select value={calGoal} onChange={e=>setCalGoal(e.target.value)} style={{...inputStyle,borderColor:'#f59e0b',backgroundColor:'#ffffff'}}><option value="lose">📉 Lose Weight</option><option value="maintain">➡️ Maintain</option><option value="gain">📈 Gain Weight</option></select></div>
                <button onClick={calculateCalories} style={{padding:'18px',background:'linear-gradient(135deg,#f59e0b,#d97706)',color:'white',border:'none',borderRadius:'12px',fontSize:'18px',fontWeight:'bold',cursor:'pointer'}}>🔥 Calculate</button>
                {calResult && <div style={{padding:'32px',background:'linear-gradient(135deg,#f59e0b,#d97706)',color:'white',borderRadius:'16px',textAlign:'center',marginTop:'16px'}}><div style={{fontSize:'64px',fontWeight:'bold'}}>{calResult.calories}</div><div style={{fontSize:'20px'}}>calories/day</div></div>}
              </div>
            </div>
          )}

          {activeTool==='onerm' && (
            <div>
              <h2 style={{margin:'0 0 24px 0',color:'#ef4444',fontSize:'32px',fontWeight:'bold'}}>💪 1RM Calculator</h2>
              <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>
                <div><label style={labelStyle}>🏋️ Weight (kg)</label><input type="number" value={oneRmWeight} onChange={e=>setOneRmWeight(e.target.value)} placeholder="100" style={{...inputStyle,borderColor:'#ef4444'}}/></div>
                <div><label style={labelStyle}>🔢 Reps</label><input type="number" value={oneRmReps} onChange={e=>setOneRmReps(e.target.value)} placeholder="5" max="10" style={{...inputStyle,borderColor:'#ef4444'}}/></div>
                <button onClick={calculateOneRM} style={{padding:'18px',background:'linear-gradient(135deg,#ef4444,#dc2626)',color:'white',border:'none',borderRadius:'12px',fontSize:'18px',fontWeight:'bold',cursor:'pointer'}}>💪 Calculate</button>
                {oneRmResult && <div style={{padding:'32px',background:'linear-gradient(135deg,#ef4444,#dc2626)',color:'white',borderRadius:'16px',textAlign:'center'}}><div style={{fontSize:'64px',fontWeight:'bold'}}>{oneRmResult.oneRM}</div><div style={{fontSize:'20px'}}>kg - 1 Rep Max</div></div>}
              </div>
            </div>
          )}

          {activeTool==='bodyfat' && (
            <div>
              <h2 style={{margin:'0 0 24px 0',color:'#10b981',fontSize:'32px',fontWeight:'bold'}}>📏 Body Fat</h2>
              <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                <div><label style={labelStyle}>👤 Gender</label><select value={bfGender} onChange={e=>setBfGender(e.target.value)} style={{...inputStyle,borderColor:'#10b981',backgroundColor:'#ffffff'}}><option value="male">👨 Male</option><option value="female">👩 Female</option></select></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
                  <div><label style={labelStyle}>📏 Waist (cm)</label><input type="number" value={bfWaist} onChange={e=>setBfWaist(e.target.value)} placeholder="80" style={{...inputStyle,borderColor:'#10b981'}}/></div>
                  <div><label style={labelStyle}>📏 Neck (cm)</label><input type="number" value={bfNeck} onChange={e=>setBfNeck(e.target.value)} placeholder="40" style={{...inputStyle,borderColor:'#10b981'}}/></div>
                </div>
                <div><label style={labelStyle}>📏 Height (cm)</label><input type="number" value={bfHeight} onChange={e=>setBfHeight(e.target.value)} placeholder="175" style={{...inputStyle,borderColor:'#10b981'}}/></div>
                {bfGender==='female' && <div><label style={labelStyle}>📏 Hip (cm)</label><input type="number" value={bfHip} onChange={e=>setBfHip(e.target.value)} placeholder="95" style={{...inputStyle,borderColor:'#10b981'}}/></div>}
                <button onClick={calculateBodyFat} style={{padding:'18px',background:'linear-gradient(135deg,#10b981,#059669)',color:'white',border:'none',borderRadius:'12px',fontSize:'18px',fontWeight:'bold',cursor:'pointer'}}>📏 Calculate</button>
                {bfResult && <div style={{padding:'32px',background:`linear-gradient(135deg,${bfResult.color},${bfResult.color}dd)`,color:'white',borderRadius:'16px',textAlign:'center'}}><div style={{fontSize:'64px',fontWeight:'bold'}}>{bfResult.bodyFat}%</div><div style={{fontSize:'24px',fontWeight:'bold'}}>{bfResult.category}</div></div>}
              </div>
            </div>
          )}

          {activeTool==='macros' && (
            <div>
              <h2 style={{margin:'0 0 24px 0',color:'#8b5cf6',fontSize:'32px',fontWeight:'bold'}}>🥗 Macros</h2>
              <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>
                <div><label style={labelStyle}>🔥 Daily Calories</label><input type="number" value={macroCalories} onChange={e=>setMacroCalories(e.target.value)} placeholder="2000" style={{...inputStyle,borderColor:'#8b5cf6'}}/></div>
                <div style={{background:'white',padding:'24px',borderRadius:'16px',border:'3px solid #8b5cf6'}}>
                  <div style={{marginBottom:'20px'}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:'10px'}}><span style={{fontWeight:'bold',color:'#ef4444'}}>🥩 Protein: {macroProtein}%</span></div><input type="range" min="0" max="100" value={macroProtein} onChange={e=>setMacroProtein(parseInt(e.target.value))} style={{width:'100%',height:'8px'}}/></div>
                  <div style={{marginBottom:'20px'}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:'10px'}}><span style={{fontWeight:'bold',color:'#f59e0b'}}>🍞 Carbs: {macroCarbs}%</span></div><input type="range" min="0" max="100" value={macroCarbs} onChange={e=>setMacroCarbs(parseInt(e.target.value))} style={{width:'100%',height:'8px'}}/></div>
                  <div><div style={{display:'flex',justifyContent:'space-between',marginBottom:'10px'}}><span style={{fontWeight:'bold',color:'#3b82f6'}}>🥑 Fats: {macroFats}%</span></div><input type="range" min="0" max="100" value={macroFats} onChange={e=>setMacroFats(parseInt(e.target.value))} style={{width:'100%',height:'8px'}}/></div>
                </div>
                <button onClick={calculateMacros} style={{padding:'18px',background:'linear-gradient(135deg,#8b5cf6,#7c3aed)',color:'white',border:'none',borderRadius:'12px',fontSize:'18px',fontWeight:'bold',cursor:'pointer'}}>🥗 Calculate</button>
                {macroResult && <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'16px',marginTop:'16px'}}>
                  <div style={{padding:'24px',background:'#fef2f2',borderRadius:'16px',border:'3px solid #ef4444',textAlign:'center'}}><div style={{fontSize:'16px',color:'#ef4444',fontWeight:'bold',marginBottom:'8px'}}>🥩 Protein</div><div style={{fontSize:'36px',fontWeight:'bold',color:'#ef4444'}}>{macroResult.protein.grams}g</div></div>
                  <div style={{padding:'24px',background:'#fffbeb',borderRadius:'16px',border:'3px solid #f59e0b',textAlign:'center'}}><div style={{fontSize:'16px',color:'#f59e0b',fontWeight:'bold',marginBottom:'8px'}}>🍞 Carbs</div><div style={{fontSize:'36px',fontWeight:'bold',color:'#f59e0b'}}>{macroResult.carbs.grams}g</div></div>
                  <div style={{padding:'24px',background:'#eff6ff',borderRadius:'16px',border:'3px solid #3b82f6',textAlign:'center'}}><div style={{fontSize:'16px',color:'#3b82f6',fontWeight:'bold',marginBottom:'8px'}}>🥑 Fats</div><div style={{fontSize:'36px',fontWeight:'bold',color:'#3b82f6'}}>{macroResult.fats.grams}g</div></div>
                </div>}
              </div>
            </div>
          )}

          {activeTool==='water' && (
            <div>
              <h2 style={{margin:'0 0 24px 0',color:'#3b82f6',fontSize:'32px',fontWeight:'bold'}}>💧 Water</h2>
              <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>
                <div><label style={labelStyle}>⚖️ Weight (kg)</label><input type="number" value={waterWeight} onChange={e=>setWaterWeight(e.target.value)} placeholder="70" style={{...inputStyle,borderColor:'#3b82f6'}}/></div>
                <div><label style={labelStyle}>🏃 Exercise (min/day)</label><input type="number" value={waterActivity} onChange={e=>setWaterActivity(e.target.value)} placeholder="30" style={{...inputStyle,borderColor:'#3b82f6'}}/></div>
                <button onClick={calculateWater} style={{padding:'18px',background:'linear-gradient(135deg,#3b82f6,#2563eb)',color:'white',border:'none',borderRadius:'12px',fontSize:'18px',fontWeight:'bold',cursor:'pointer'}}>💧 Calculate</button>
                {waterResult && <div style={{padding:'32px',background:'linear-gradient(135deg,#3b82f6,#2563eb)',color:'white',borderRadius:'16px',textAlign:'center'}}><div style={{fontSize:'64px',fontWeight:'bold'}}>{waterResult.total} L</div><div style={{fontSize:'20px'}}>{waterResult.glasses} glasses/day</div></div>}
              </div>
            </div>
          )}

          {activeTool==='timer' && (
            <div>
              <h2 style={{margin:'0 0 24px 0',color:'#ec4899',fontSize:'32px',fontWeight:'bold'}}>⏱️ Workout Timer</h2>
              <div style={{textAlign:'center',padding:'48px',background:'linear-gradient(135deg,#ec4899,#be185d)',borderRadius:'20px',color:'white',marginBottom:'24px'}}>
                <div style={{fontSize:'72px',fontWeight:'bold',fontFamily:'monospace',marginBottom:'32px'}}>{formatTime(timerSeconds)}</div>
                <div style={{display:'flex',gap:'16px',justifyContent:'center',flexWrap:'wrap'}}>
                  {!timerRunning?<button onClick={startTimer} style={{padding:'16px 40px',background:'#10b981',color:'white',border:'none',borderRadius:'12px',fontSize:'18px',fontWeight:'bold',cursor:'pointer'}}>▶️ Start</button>:<button onClick={pauseTimer} style={{padding:'16px 40px',background:'#f59e0b',color:'white',border:'none',borderRadius:'12px',fontSize:'18px',fontWeight:'bold',cursor:'pointer'}}>⏸️ Pause</button>}
                  <button onClick={resetTimer} style={{padding:'16px 40px',background:'#ef4444',color:'white',border:'none',borderRadius:'12px',fontSize:'18px',fontWeight:'bold',cursor:'pointer'}}>🔄 Reset</button>
                </div>
              </div>
            </div>
          )}

          {activeTool==='rest' && (
            <div>
              <h2 style={{margin:'0 0 24px 0',color:'#14b8a6',fontSize:'32px',fontWeight:'bold'}}>⏲️ Rest Timer</h2>
              <div style={{textAlign:'center',padding:'48px',background:'linear-gradient(135deg,#14b8a6,#0d9488)',borderRadius:'20px',color:'white',marginBottom:'24px'}}>
                <div style={{fontSize:'72px',fontWeight:'bold',fontFamily:'monospace',marginBottom:'32px'}}>{formatTime(restSeconds)}</div>
                <div style={{display:'flex',gap:'16px',justifyContent:'center',flexWrap:'wrap',marginBottom:'24px'}}>
                  {!restRunning?<button onClick={startRestTimer} style={{padding:'16px 40px',background:'#10b981',color:'white',border:'none',borderRadius:'12px',fontSize:'18px',fontWeight:'bold',cursor:'pointer'}}>▶️ Start</button>:<button onClick={pauseRestTimer} style={{padding:'16px 40px',background:'#f59e0b',color:'white',border:'none',borderRadius:'12px',fontSize:'18px',fontWeight:'bold',cursor:'pointer'}}>⏸️ Pause</button>}
                  <button onClick={resetRestTimer} style={{padding:'16px 40px',background:'#ef4444',color:'white',border:'none',borderRadius:'12px',fontSize:'18px',fontWeight:'bold',cursor:'pointer'}}>🔄 Reset</button>
                </div>
                <div style={{background:'rgba(255,255,255,0.2)',padding:'16px',borderRadius:'12px',display:'inline-block'}}>
                  <label style={{fontWeight:'bold',marginRight:'12px',fontSize:'16px'}}>⏱️ Set:</label>
                  <select value={restInitial} onChange={e=>{const v=parseInt(e.target.value);setRestInitial(v);setRestSeconds(v);}} style={{padding:'12px',borderRadius:'8px',border:'none',fontSize:'16px',fontWeight:'bold',backgroundColor:'white',color:'#111827'}}><option value="30">30s</option><option value="60">1m</option><option value="90">1.5m</option><option value="120">2m</option><option value="180">3m</option></select>
                </div>
              </div>
            </div>
          )}

          {activeTool==='music' && (
            <div>
              <h2 style={{margin:'0 0 24px 0',color:'#f97316',fontSize:'32px',fontWeight:'bold'}}>🎵 Music Player</h2>
              <div style={{background:'linear-gradient(135deg,#f97316,#ea580c)',padding:'40px',borderRadius:'20px',color:'white',textAlign:'center'}}>
                <div style={{fontSize:'80px',marginBottom:'20px'}}>🎧</div>
                <div style={{fontSize:'28px',fontWeight:'bold',marginBottom:'12px'}}>{playlist[currentTrack]?.name||'No Song'}</div>
                <div style={{fontSize:'18px',opacity:0.9,marginBottom:'32px'}}>{playlist[currentTrack]?.artist}</div>
                <div style={{display:'flex',gap:'16px',justifyContent:'center',marginBottom:'32px',flexWrap:'wrap'}}>
                  <button onClick={prevTrack} style={{padding:'14px 28px',background:'rgba(255,255,255,0.2)',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'bold',cursor:'pointer'}}>⏮️ Prev</button>
                  <button onClick={togglePlayPause} style={{padding:'14px 40px',background:'white',color:'#f97316',border:'none',borderRadius:'12px',fontSize:'18px',fontWeight:'bold',cursor:'pointer'}}>{isPlaying?'⏸️ Pause':'▶️ Play'}</button>
                  <button onClick={nextTrack} style={{padding:'14px 28px',background:'rgba(255,255,255,0.2)',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'bold',cursor:'pointer'}}>Next ⏭️</button>
                </div>
                <label style={{display:'inline-block',padding:'12px 24px',background:'rgba(255,255,255,0.2)',color:'white',borderRadius:'10px',fontWeight:'bold',cursor:'pointer',fontSize:'16px',marginBottom:'24px'}}>
                  📥 Import Songs (Up to 500MB)
                  <input type="file" accept="audio/*" onChange={handleImportSong} style={{display:'none'}}/>
                </label>
                <div style={{background:'rgba(255,255,255,0.2)',padding:'20px',borderRadius:'16px',maxHeight:'300px',overflow:'auto'}}>
                  <div style={{fontSize:'16px',marginBottom:'12px',fontWeight:'bold'}}>🎵 Playlist ({playlist.length})</div>
                  {playlist.map((t,i)=>(
                    <div key={t.id || i} onClick={()=>{setCurrentTrack(i);setIsPlaying(true);}} style={{padding:'12px',background:currentTrack===i?'rgba(255,255,255,0.3)':'rgba(255,255,255,0.1)',borderRadius:'10px',marginBottom:'8px',cursor:'pointer',fontWeight:'bold',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span>{i+1}. {t.name} - {t.artist}</span>
                      <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                        <span style={{opacity:0.8}}>{t.duration}</span>
                        {t.isUserSong && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteSong(i); }}
                            style={{background:'rgba(255,0,0,0.2)',border:'none',color:'white',borderRadius:'50%',width:'24px',height:'24px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px'}}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTool==='logger' && (
            <div>
              <h2 style={{margin:'0 0 24px 0',color:'#84cc16',fontSize:'32px',fontWeight:'bold'}}>📝 Logger</h2>
              <div style={{display:'flex',flexDirection:'column',gap:'16px',marginBottom:'24px'}}>
                <div><label style={labelStyle}>💪 Exercise</label><input type="text" value={logExercise} onChange={e=>setLogExercise(e.target.value)} placeholder="Bench Press" style={{...inputStyle,borderColor:'#84cc16'}}/></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'16px'}}>
                  <div><label style={labelStyle}>🔢 Sets</label><input type="number" value={logSets} onChange={e=>setLogSets(e.target.value)} placeholder="4" style={{...inputStyle,borderColor:'#84cc16'}}/></div>
                  <div><label style={labelStyle}>🔢 Reps</label><input type="number" value={logReps} onChange={e=>setLogReps(e.target.value)} placeholder="10" style={{...inputStyle,borderColor:'#84cc16'}}/></div>
                  <div><label style={labelStyle}>⚖️ Weight</label><input type="number" value={logWeight} onChange={e=>setLogWeight(e.target.value)} placeholder="100" style={{...inputStyle,borderColor:'#84cc16'}}/></div>
                </div>
                <button onClick={addWorkoutLog} style={{padding:'18px',background:'linear-gradient(135deg,#84cc16,#65a30d)',color:'white',border:'none',borderRadius:'12px',fontSize:'18px',fontWeight:'bold',cursor:'pointer'}}>➕ Add</button>
              </div>
              {workoutLogs.length>0 && <div style={{background:'white',padding:'24px',borderRadius:'16px',border:'3px solid #84cc16'}}>
                <h3 style={{margin:'0 0 16px 0',color:'#374151',fontSize:'20px',fontWeight:'bold'}}>📊 Today's Log</h3>
                {workoutLogs.map(l=>(<div key={l.id} style={{padding:'16px',background:'#f0fdf4',borderRadius:'12px',marginBottom:'12px',borderLeft:'4px solid #84cc16'}}>
                  <div style={{fontWeight:'bold',color:'#166534',fontSize:'18px',marginBottom:'6px'}}>{l.exercise}</div>
                  <div style={{color:'#374151',fontSize:'16px',fontWeight:'bold'}}>{l.sets}×{l.reps} @ {l.weight}kg</div>
                </div>))}
              </div>}
            </div>
          )}

          {activeTool==='stopwatch' && (
            <div>
              <h2 style={{margin:'0 0 24px 0',color:'#6366f1',fontSize:'32px',fontWeight:'bold'}}>⏱️ Stopwatch</h2>
              <div style={{textAlign:'center',padding:'48px',background:'linear-gradient(135deg,#6366f1,#4f46e5)',borderRadius:'20px',color:'white',marginBottom:'24px'}}>
                <div style={{fontSize:'72px',fontWeight:'bold',fontFamily:'monospace',marginBottom:'32px'}}>{formatTime(stopwatchTime)}</div>
                <div style={{display:'flex',gap:'16px',justifyContent:'center',flexWrap:'wrap'}}>
                  {!stopwatchRunning?<button onClick={startStopwatch} style={{padding:'16px 36px',background:'#10b981',color:'white',border:'none',borderRadius:'12px',fontSize:'18px',fontWeight:'bold',cursor:'pointer'}}>▶️ Start</button>:<button onClick={pauseStopwatch} style={{padding:'16px 36px',background:'#f59e0b',color:'white',border:'none',borderRadius:'12px',fontSize:'18px',fontWeight:'bold',cursor:'pointer'}}>⏸️ Pause</button>}
                  <button onClick={lapStopwatch} style={{padding:'16px 36px',background:'#8b5cf6',color:'white',border:'none',borderRadius:'12px',fontSize:'18px',fontWeight:'bold',cursor:'pointer'}}>🏁 Lap</button>
                  <button onClick={resetStopwatch} style={{padding:'16px 36px',background:'#ef4444',color:'white',border:'none',borderRadius:'12px',fontSize:'18px',fontWeight:'bold',cursor:'pointer'}}>🔄 Reset</button>
                </div>
              </div>
              {laps.length>0 && <div style={{background:'white',padding:'20px',borderRadius:'16px',border:'3px solid #6366f1',maxHeight:'200px',overflow:'auto'}}>
                <h3 style={{margin:'0 0 12px 0',color:'#374151',fontSize:'18px',fontWeight:'bold'}}>🏁 Laps</h3>
                {laps.map((l,i)=>(<div key={i} style={{padding:'12px',background:'#eef2ff',borderRadius:'10px',marginBottom:'8px',display:'flex',justifyContent:'space-between',fontWeight:'bold'}}><span style={{color:'#6366f1'}}>Lap {laps.length-i}</span><span style={{fontFamily:'monospace',color:'#374151'}}>{formatTime(l)}</span></div>))}
              </div>}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}