'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// IndexedDB helper for permanent music storage
const DB_NAME = 'gym-ai-music';
const DB_VERSION = 1;
const STORE_NAME = 'songs';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => { req.result.createObjectStore(STORE_NAME, { keyPath: 'id' }); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

const saveSongToDB = async (id: string, title: string, blob: Blob) => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).put({ id, title, blob, addedAt: Date.now() });
  return tx.complete;
};

const loadSongsFromDB = async () => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const req = tx.objectStore(STORE_NAME).getAll();
  return new Promise<any[]>((resolve) => { req.onsuccess = () => resolve(req.result.map(s => ({ ...s, url: URL.createObjectURL(s.blob) }))); });
};

const deleteSongFromDB = async (id: string) => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).delete(id);
  return tx.complete;
};

export default function ToolsPage() {
  const [active, setActive] = useState<string | null>(null);
  const [notify, setNotify] = useState<string | null>(null);
  const [uid, setUid] = useState('guest');

  useEffect(() => { const s = localStorage.getItem('gym-ai-user-id'); if (s) setUid(s); }, []);
  const msg = (m: string) => { setNotify(m); setTimeout(() => setNotify(null), 2500); };

  // CALENDAR
  const [cal, setCal] = useState<any[]>([]);
  const [selDate, setSelDate] = useState(new Date().toISOString().split('T')[0]);
  const [cMonth, setCMonth] = useState(new Date());
  const [wName, setWName] = useState('');
  const [wDur, setWDur] = useState('');

  useEffect(() => { const s = localStorage.getItem(`wc_${uid}`); if (s) try { setCal(JSON.parse(s)); } catch {} }, [uid]);
  const saveW = () => {
    if (!wName.trim() || !wDur) return msg('❌ Fill all fields');
    const d = parseInt(wDur); if (isNaN(d)) return msg('❌ Invalid duration');
    const n = [...cal, { id: Date.now(), date: selDate, name: wName.trim(), dur: d }];
    setCal(n); localStorage.setItem(`wc_${uid}`, JSON.stringify(n)); setWName(''); setWDur(''); msg('✅ Workout saved!');
  };
  const delW = (id: number) => { const n = cal.filter(w => w.id !== id); setCal(n); localStorage.setItem(`wc_${uid}`, JSON.stringify(n)); msg('🗑️ Deleted'); };
  const getDays = () => {
    const y = cMonth.getFullYear(), m = cMonth.getMonth(), f = new Date(y, m, 1).getDay(), len = new Date(y, m + 1, 0).getDate();
    const arr: any[] = [];
    for (let i = 0; i < f; i++) arr.push({ d: '', cur: false });
    for (let i = 1; i <= len; i++) {
      const ds = `${y}-${String(m+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
      arr.push({ d: i, ds, cur: true, has: cal.some(w => w.date === ds) });
    }
    return arr;
  };

  // PROGRESS
  const [prog, setProg] = useState<any[]>([]);
  const [pMet, setPMet] = useState('');
  const [pVal, setPVal] = useState('');
  useEffect(() => { const s = localStorage.getItem(`pr_${uid}`); if (s) try { setProg(JSON.parse(s)); } catch {} }, [uid]);
  const addProg = () => {
    if (!pMet.trim() || !pVal) return msg('❌ Fill fields');
    const n = [...prog, { id: Date.now(), date: new Date().toISOString(), met: pMet.trim(), val: parseFloat(pVal) }];
    setProg(n); localStorage.setItem(`pr_${uid}`, JSON.stringify(n)); setPMet(''); setPVal(''); msg('✅ Progress saved!');
  };

  // MUSIC (with IndexedDB permanent storage + full controls)
  const [list, setList] = useState<any[]>([]);
  const [song, setSong] = useState<any>(null);
  const [play, setPlay] = useState(false);
  const [progM, setProgM] = useState(0);
  const [durM, setDurM] = useState(0);
  const [loop, setLoop] = useState<'off'|'all'|'one'>('off');
  const aRef = useRef<HTMLAudioElement | null>(null);
  const fRef = useRef<HTMLInputElement | null>(null);

  // Load songs from IndexedDB on mount
  useEffect(() => {
    loadSongsFromDB().then(songs => {
      if (songs.length > 0) {
        setList(songs.map(s => ({ ...s, def: false })));
        setSong(songs[0]);
      }
    }).catch(() => {});
  }, []);

  const importM = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newSongs: any[] = [];
    for (const f of files) {
      const id = Date.now() + Math.random().toString(36).slice(2, 9);
      await saveSongToDB(id, f.name.replace(/\.[^/.]+$/, ''), f);
      const url = URL.createObjectURL(f);
      newSongs.push({ id, title: f.name.replace(/\.[^/.]+$/, ''), url, def: false });
    }
    setList(prev => [...prev, ...newSongs]);
    if (!song) setSong(newSongs[0]);
    msg(`🎵 Imported ${files.length} song(s)! Saved permanently.`);
    e.target.value = '';
  };

  const deleteSong = async (id: string) => {
    if (!confirm('Delete this song permanently?')) return;
    await deleteSongFromDB(id);
    const newList = list.filter(s => s.id !== id);
    setList(newList);
    if (song?.id === id) setSong(newList.length > 0 ? newList[0] : null);
    msg('🗑️ Song deleted');
  };

  const toggle = () => { if (!aRef.current || !song) return; play ? aRef.current.pause() : aRef.current.play(); setPlay(!play); };
  const stop = () => { if (!aRef.current) return; aRef.current.pause(); aRef.current.currentTime = 0; setPlay(false); setProgM(0); };
  
  const playS = (s: any) => { setSong(s); setPlay(true); setProgM(0); };
  
  const nextTrack = useCallback(() => {
    if (list.length === 0) return;
    const idx = list.findIndex(s => s.id === song?.id);
    const nextIdx = (idx + 1) % list.length;
    setSong(list[nextIdx]);
    setPlay(true);
    setProgM(0);
  }, [list, song]);

  const prevTrack = useCallback(() => {
    if (list.length === 0) return;
    const idx = list.findIndex(s => s.id === song?.id);
    const prevIdx = idx <= 0 ? list.length - 1 : idx - 1;
    setSong(list[prevIdx]);
    setPlay(true);
    setProgM(0);
  }, [list, song]);

  useEffect(() => {
    if (aRef.current && song) {
      aRef.current.src = song.url;
      if (play) aRef.current.play();
    }
  }, [song]);

  const handleEnd = () => {
    if (loop === 'one') {
      aRef.current!.currentTime = 0;
      aRef.current!.play();
    } else if (loop === 'all') {
      nextTrack();
    } else {
      nextTrack();
    }
  };

  // CALCULATORS
  const [bH, setBH] = useState(170), [bW, setBW] = useState(70);
  const bmi = (bW / ((bH / 100) ** 2)).toFixed(1);
  const [rW, setRW] = useState(100), [rR, setRR] = useState(5);
  const oneRm = Math.round(rW * (1 + rR / 30));
  const [restT, setRestT] = useState(90), [restRun, setRestRun] = useState(false), [restL, setRestL] = useState(90);
  useEffect(() => { let i: any; if (restRun && restL > 0) i = setInterval(() => setRestL(t => t - 1), 1000); else if (restL === 0 && restRun) { setRestRun(false); msg('⏱️ Time\'s up!'); } return () => clearInterval(i); }, [restRun, restL]);
  const [gls, setGls] = useState(0), [gGoal, setGGoal] = useState(8);
  useEffect(() => { const s = localStorage.getItem(`hg_${uid}`), d = localStorage.getItem(`hd_${uid}`); if (d === new Date().toDateString() && s) setGls(parseInt(s)); else { setGls(0); localStorage.setItem(`hd_${uid}`, new Date().toDateString()); } }, [uid]);
  const [swT, setSwT] = useState(0), [swRun, setSwRun] = useState(false), [laps, setLaps] = useState<number[]>([]);
  useEffect(() => { let i: any; if (swRun) i = setInterval(() => setSwT(t => t + 1), 1000); return () => clearInterval(i); }, [swRun]);

  // CALORIES (TDEE)
  const [cAge, setCAge] = useState(25), [cHt, setCHt] = useState(170), [cWt, setCWt] = useState(70), [cGen, setCGen] = useState<'male'|'female'>('male'), [cAct, setCAct] = useState(1.55);
  const bmr = Math.round(cGen === 'male' ? 10 * cWt + 6.25 * cHt - 5 * cAge + 5 : 10 * cWt + 6.25 * cHt - 5 * cAge - 161);
  const tdee = Math.round(bmr * cAct);

  // MACROS
  const [mCal, setMCal] = useState(2000), [mRat, setMRat] = useState<'balanced'|'lowcarb'|'highprotein'|'keto'>('balanced');
  const mSplit: Record<string, {p:number,c:number,f:number}> = {
    balanced: {p:0.3,c:0.4,f:0.3}, highprotein: {p:0.4,c:0.3,f:0.3}, lowcarb: {p:0.35,c:0.25,f:0.4}, keto: {p:0.25,c:0.05,f:0.7}
  };

  // BODY FAT (Navy Method)
  const [bfW, setBfW] = useState(85), [bfN, setBfN] = useState(38), [bfH, setBfH] = useState(175), [bfGen, setBfGen] = useState<'male'|'female'>('male');
  const bfPct = bfGen === 'male' ? Math.max(0, 86.010 * Math.log10(bfW - bfN) - 70.041 * Math.log10(bfH) + 36.76).toFixed(1) : Math.max(0, 163.205 * Math.log10(bfW - bfN) - 97.684 * Math.log10(bfH) - 78.387).toFixed(1);

  // ACHIEVEMENTS
  const [achUnlocked, setAchUnlocked] = useState<string[]>([]);
  useEffect(() => {
    const saved = localStorage.getItem(`ach_${uid}`);
    if (saved) try { setAchUnlocked(JSON.parse(saved)); } catch {}
    // Auto-check achievements
    const checks: Record<string, () => boolean> = {
      'first_login': () => !!uid && uid !== 'guest',
      'first_workout': () => cal.length >= 1,
      'week_warrior': () => cal.length >= 7,
      'progress_tracker': () => prog.length >= 10,
      'hydration_hero': () => gls >= 8,
      'music_lover': () => list.length >= 5,
    };
    const newAch = [...achUnlocked];
    for (const [id, fn] of Object.entries(checks)) {
      if (!newAch.includes(id) && fn()) { newAch.push(id); }
    }
    if (newAch.length !== achUnlocked.length) {
      setAchUnlocked(newAch);
      localStorage.setItem(`ach_${uid}`, JSON.stringify(newAch));
    }
  }, [uid, cal, prog, gls, list]);

  const achievements = [
    { id: 'first_login', name: 'First Steps', icon: '🎯', desc: 'Log in to your account' },
    { id: 'first_workout', name: 'Getting Started', icon: '💪', desc: 'Log your first workout' },
    { id: 'week_warrior', name: 'Week Warrior', icon: '🔥', desc: 'Log 7 workouts' },
    { id: 'progress_tracker', name: 'Data Nerd', icon: '📊', desc: 'Log 10 progress entries' },
    { id: 'hydration_hero', name: 'Hydration Hero', icon: '💧', desc: 'Drink 8 glasses in a day' },
    { id: 'music_lover', name: 'Music Lover', icon: '🎵', desc: 'Import 5 songs' },
  ];

  // SOCIAL
  const [posts, setPosts] = useState<any[]>([]);
  const [postText, setPostText] = useState('');
  const [postMood, setPostMood] = useState('💪');
  useEffect(() => { const s = localStorage.getItem(`soc_${uid}`); if (s) try { setPosts(JSON.parse(s)); } catch {} }, [uid]);
  const addPost = () => {
    if (!postText.trim()) return msg('❌ Write something!');
    const newPost = { id: Date.now(), text: postText.trim(), mood: postMood, author: uid, date: new Date().toISOString(), likes: 0, comments: [] };
    const updated = [newPost, ...posts];
    setPosts(updated);
    localStorage.setItem(`soc_${uid}`, JSON.stringify(updated));
    setPostText('');
    msg('✅ Posted!');
  };
  const likePost = (id: number) => {
    const updated = posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p);
    setPosts(updated);
    localStorage.setItem(`soc_${uid}`, JSON.stringify(updated));
  };
  const deletePost = (id: number) => {
    const updated = posts.filter(p => p.id !== id);
    setPosts(updated);
    localStorage.setItem(`soc_${uid}`, JSON.stringify(updated));
    msg('🗑️ Post deleted');
  };

  // ANALYTICS
  const totalWorkouts = cal.length;
  const totalMinutes = cal.reduce((a, w) => a + (w.dur || 0), 0);
  const weekWorkouts = cal.filter(w => new Date(w.date) >= new Date(Date.now() - 7 * 86400000)).length;
  const avgDuration = totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0;
  const mostActiveDay = (() => {
    const dayCounts: Record<string, number> = {};
    cal.forEach(w => { const d = new Date(w.date).getDay(); dayCounts[d] = (dayCounts[d] || 0) + 1; });
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const max = Object.entries(dayCounts).sort((a,b) => b[1] - a[1])[0];
    return max ? days[parseInt(max[0])] : 'N/A';
  })();

  const render = () => {
    if (!active) return null;
    return (
      <div style={{ background: 'white', borderRadius: '30px', padding: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <button onClick={() => setActive(null)} style={{ padding: '14px 28px', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '28px', boxShadow: '0 4px 15px rgba(102,126,234,0.3)', fontSize: '16px' }}>← Back to Tools</button>
        
        {active === 'Calendar' && (
          <div>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '32px', color: '#667eea', display: 'flex', alignItems: 'center', gap: '12px' }}>📅 Workout Calendar</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <button onClick={() => setCMonth(new Date(cMonth.getFullYear(), cMonth.getMonth() - 1))} style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>← Prev</button>
              <span style={{ fontWeight: 'bold', fontSize: '20px', color: '#667eea' }}>{cMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              <button onClick={() => setCMonth(new Date(cMonth.getFullYear(), cMonth.getMonth() + 1))} style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Next →</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '10px', textAlign: 'center', marginBottom: '24px' }}>
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d,i)=> <b key={i} style={{padding:'12px',background:'#667eea',color:'white',borderRadius:'8px'}}>{d}</b>)}
              {getDays().map((d,i) => <button key={i} disabled={!d.cur} onClick={() => d.cur && setSelDate(d.ds)} style={{ padding: '14px', background: d.has ? 'linear-gradient(135deg,#667eea,#764ba2)' : d.cur ? '#f3f4f6' : 'transparent', color: d.has ? 'white' : '#111', border: '2px solid #e5e7eb', borderRadius: '10px', cursor: d.cur ? 'pointer' : 'default', opacity: d.cur ? 1 : 0.3, fontWeight: d.has ? 'bold' : 'normal' }}>{d.d}</button>)}
            </div>
            <div style={{ padding: '24px', background: 'linear-gradient(135deg,#ecfdf5,#d1fae5)', borderRadius: '16px', border: '2px solid #10b981' }}>
              <h3 style={{margin:'0 0 16px 0',color:'#059669',fontSize:'20px'}}>Log Workout for {new Date(selDate).toLocaleDateString()}</h3>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <input value={wName} onChange={e => setWName(e.target.value)} placeholder="Workout name" style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '2px solid #10b981', fontSize: '16px', color: '#111827', backgroundColor: 'white' }} />
                <input value={wDur} onChange={e => setWDur(e.target.value)} placeholder="Minutes" style={{ width: '120px', padding: '14px', borderRadius: '12px', border: '2px solid #10b981', fontSize: '16px', color: '#111827', backgroundColor: 'white' }} />
                <button onClick={saveW} style={{ padding: '14px 24px', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>💾 Save</button>
              </div>
              {cal.filter(w => w.date === selDate).length > 0 && cal.filter(w => w.date === selDate).map(w => (
                <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px', background: 'white', borderRadius: '10px', marginBottom: '10px', border: '2px solid #10b981' }}>
                  <span><b style={{color:'#059669'}}>{w.name}</b> <span style={{color:'#666'}}>({w.dur} min)</span></span>
                  <button onClick={() => delW(w.id)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold' }}>🗑️</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {active === 'Progress' && (
          <div>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '32px', color: '#667eea', display: 'flex', alignItems: 'center', gap: '12px' }}>📊 Progress Tracker</h2>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <input value={pMet} onChange={e => setPMet(e.target.value)} placeholder="Metric (e.g., Weight, Bench Press)" style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '2px solid #667eea', fontSize: '16px', color: '#111827', backgroundColor: 'white' }} />
              <input value={pVal} onChange={e => setPVal(e.target.value)} placeholder="Value" style={{ width: '150px', padding: '14px', borderRadius: '12px', border: '2px solid #667eea', fontSize: '16px', color: '#111827', backgroundColor: 'white' }} />
              <button onClick={addProg} style={{ padding: '14px 24px', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>➕ Add</button>
            </div>
            {prog.length > 0 && <div style={{ maxHeight: '400px', overflowY: 'auto', background: 'linear-gradient(135deg,#f9fafb,#f3f4f6)', borderRadius: '16px', padding: '20px', border: '2px solid #e5e7eb' }}>
              {prog.slice().reverse().map(e => <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px', background: 'white', borderRadius: '10px', marginBottom: '10px', border: '2px solid #667eea' }}><b style={{color:'#667eea'}}>{e.met}</b><span style={{fontSize:'18px',fontWeight:'bold',color:'#10b981'}}>{e.val}</span><span style={{ color: '#666', fontSize: '14px' }}>{new Date(e.date).toLocaleDateString()}</span></div>)}
            </div>}
          </div>
        )}

        {active === 'Music' && (
          <div>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '32px', color: '#667eea', display: 'flex', alignItems: 'center', gap: '12px' }}>🎵 Music Player</h2>
            <audio ref={aRef} src={song?.url || ''} onTimeUpdate={() => setProgM(aRef.current?.currentTime || 0)} onLoadedMetadata={() => setDurM(aRef.current?.duration || 0)} onEnded={handleEnd} onPlay={() => setPlay(true)} onPause={() => setPlay(false)} />
            <input type="file" accept="audio/*" multiple ref={fRef} onChange={importM} style={{ display: 'none' }} />
            <button onClick={() => fRef.current?.click()} style={{ padding: '14px 24px', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '24px', fontSize: '16px', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}>📥 Import Music</button>
            
            {/* Now Playing Card */}
            {song && (
              <div style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', padding: '30px', borderRadius: '20px', textAlign: 'center', marginBottom: '24px', boxShadow: '0 10px 30px rgba(102,126,234,0.3)' }}>
                <div style={{fontSize:'64px',marginBottom:'16px'}}>🎵</div>
                <b style={{ fontSize: '24px', display: 'block', marginBottom: '16px' }}>{song.title}</b>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.3)', borderRadius: '4px', margin: '20px 0', overflow: 'hidden', cursor: 'pointer' }} onClick={(e) => { if (!aRef.current || !durM) return; const rect = e.currentTarget.getBoundingClientRect(); aRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * durM; }}>
                  <div style={{ width: `${durM ? (progM / durM) * 100 : 0}%`, height: '100%', background: 'white', borderRadius: '4px', transition: 'width 0.1s' }}></div>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',opacity:0.8,marginBottom:'20px'}}>
                  <span>{Math.floor(progM/60)}:{String(Math.floor(progM%60)).padStart(2,'0')}</span>
                  <span>{Math.floor(durM/60)}:{String(Math.floor(durM%60)).padStart(2,'0')}</span>
                </div>
                {/* Controls */}
                <div style={{display:'flex',justifyContent:'center',gap:'16px',alignItems:'center',marginBottom:'16px'}}>
                  <button onClick={prevTrack} style={{padding:'12px 20px',background:'rgba(255,255,255,0.2)',color:'white',border:'none',borderRadius:'50%',cursor:'pointer',fontSize:'18px'}}>⏮️</button>
                  <button onClick={toggle} style={{padding:'16px 40px',background:'white',color:'#667eea',border:'none',borderRadius:'50%',fontSize:'24px',fontWeight:'bold',cursor:'pointer',boxShadow:'0 4px 15px rgba(0,0,0,0.2)'}}>{play ? '⏸️' : '▶️'}</button>
                  <button onClick={stop} style={{padding:'12px 20px',background:'rgba(255,255,255,0.2)',color:'white',border:'none',borderRadius:'50%',cursor:'pointer',fontSize:'18px'}}>⏹️</button>
                  <button onClick={nextTrack} style={{padding:'12px 20px',background:'rgba(255,255,255,0.2)',color:'white',border:'none',borderRadius:'50%',cursor:'pointer',fontSize:'18px'}}>⏭️</button>
                </div>
                {/* Loop Toggle */}
                <div style={{display:'flex',gap:'8px',justifyContent:'center'}}>
                  <button onClick={()=>setLoop('off')} style={{padding:'6px 12px',background:loop==='off'?'white':'rgba(255,255,255,0.2)',color:loop==='off'?'#667eea':'white',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:'bold',fontSize:'12px'}}>Off</button>
                  <button onClick={()=>setLoop('all')} style={{padding:'6px 12px',background:loop==='all'?'white':'rgba(255,255,255,0.2)',color:loop==='all'?'#667eea':'white',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:'bold',fontSize:'12px'}}>🔁 All</button>
                  <button onClick={()=>setLoop('one')} style={{padding:'6px 12px',background:loop==='one'?'white':'rgba(255,255,255,0.2)',color:loop==='one'?'#667eea':'white',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:'bold',fontSize:'12px'}}>🔂 One</button>
                </div>
              </div>
            )}
            
            {/* Playlist */}
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {list.length === 0 && <p style={{textAlign:'center',color:'#666',padding:'40px'}}>No songs yet. Import some!</p>}
              {list.map(s => (
                <div key={s.id} style={{ padding: '16px', background: song?.id === s.id ? 'linear-gradient(135deg,#f3f4f6,#e5e7eb)' : 'white', borderRadius: '12px', marginBottom: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: song?.id === s.id ? '2px solid #667eea' : '2px solid #e5e7eb', transition: 'all 0.3s' }}>
                  <div style={{flex:1,display:'flex',alignItems:'center',gap:'12px'}} onClick={() => playS(s)}>
                    <span style={{fontSize:'24px'}}>🎵</span>
                    <div>
                      <span style={{fontSize:'16px',fontWeight: song?.id === s.id ? 'bold' : 'normal', color: '#111'}}>{s.title}</span>
                      <div style={{fontSize:'12px',color:'#666'}}>Saved permanently in browser</div>
                    </div>
                  </div>
                  {song?.id === s.id && play && <span style={{color:'#10b981',fontSize:'20px',marginRight:'12px'}}>▶️</span>}
                  <button onClick={(e) => { e.stopPropagation(); deleteSong(s.id); }} style={{background:'#ef4444',color:'white',border:'none',borderRadius:'8px',padding:'6px 12px',cursor:'pointer',fontWeight:'bold',fontSize:'12px'}}>🗑️</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {active === 'Achievements' && (
          <div>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '32px', color: '#667eea', display: 'flex', alignItems: 'center', gap: '12px' }}>🏆 Achievements</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:'16px'}}>
              {achievements.map(ach => {
                const unlocked = achUnlocked.includes(ach.id);
                return (
                  <div key={ach.id} style={{padding:'24px',background:unlocked?'linear-gradient(135deg,#ecfdf5,#d1fae5)':'linear-gradient(135deg,#f9fafb,#f3f4f6)',borderRadius:'16px',border:`3px solid ${unlocked?'#10b981':'#e5e7eb'}`,textAlign:'center',transition:'all 0.3s'}}>
                    <div style={{fontSize:'56px',marginBottom:'12px',filter:unlocked?'none':'grayscale(100%) opacity(0.5)'}}>{ach.icon}</div>
                    <h3 style={{margin:'0 0 8px 0',fontSize:'18px',color:unlocked?'#059669':'#9ca3af'}}>{ach.name}</h3>
                    <p style={{margin:0,color:'#6b7280',fontSize:'14px'}}>{ach.desc}</p>
                    {unlocked && <div style={{marginTop:'12px',padding:'6px 16px',background:'#10b981',color:'white',borderRadius:'20px',display:'inline-block',fontSize:'12px',fontWeight:'bold'}}>✅ UNLOCKED</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {active === 'Social' && (
          <div>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '32px', color: '#667eea', display: 'flex', alignItems: 'center', gap: '12px' }}>👥 Social Feed</h2>
            <div style={{padding:'24px',background:'linear-gradient(135deg,#f9fafb,#f3f4f6)',borderRadius:'16px',marginBottom:'24px',border:'2px solid #e5e7eb'}}>
              <div style={{display:'flex',gap:'12px',marginBottom:'12px'}}>
                {['💪','','😎','🏆','❤️','💯'].map(m => (
                  <button key={m} onClick={()=>setPostMood(m)} style={{padding:'8px 16px',background:postMood===m?'#667eea':'white',color:postMood===m?'white':'#111',border:'2px solid #e5e7eb',borderRadius:'8px',cursor:'pointer',fontSize:'18px'}}>{m}</button>
                ))}
              </div>
              <textarea value={postText} onChange={e=>setPostText(e.target.value)} placeholder="Share your fitness progress..." style={{width:'100%',padding:'14px',borderRadius:'12px',border:'2px solid #667eea',fontSize:'16px',resize:'vertical',minHeight:'80px',color:'#111827',backgroundColor:'white',boxSizing:'border-box'}} />
              <button onClick={addPost} style={{marginTop:'12px',padding:'12px 24px',background:'linear-gradient(135deg,#667eea,#764ba2)',color:'white',border:'none',borderRadius:'12px',fontWeight:'bold',cursor:'pointer',fontSize:'16px'}}>📤 Post</button>
            </div>
            {posts.length === 0 ? <p style={{textAlign:'center',color:'#666',padding:'40px'}}>No posts yet. Be the first!</p> : posts.map(p => (
              <div key={p.id} style={{padding:'20px',background:'white',borderRadius:'16px',marginBottom:'16px',border:'2px solid #e5e7eb'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'12px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                    <div style={{width:'40px',height:'40px',background:'linear-gradient(135deg,#667eea,#764ba2)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>{p.mood}</div>
                    <div><b style={{color:'#667eea'}}>{p.author}</b><br/><span style={{color:'#666',fontSize:'12px'}}>{new Date(p.date).toLocaleDateString()}</span></div>
                  </div>
                  <button onClick={()=>deletePost(p.id)} style={{background:'#ef4444',color:'white',border:'none',borderRadius:'8px',padding:'6px 12px',cursor:'pointer',fontWeight:'bold',fontSize:'12px'}}>🗑️</button>
                </div>
                <p style={{margin:'0 0 16px 0',color:'#111',fontSize:'16px'}}>{p.text}</p>
                <button onClick={()=>likePost(p.id)} style={{padding:'8px 16px',background:'#fee2e2',color:'#ef4444',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:'bold'}}>❤️ {p.likes}</button>
              </div>
            ))}
          </div>
        )}

        {active === 'Analytics' && (
          <div>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '32px', color: '#667eea', display: 'flex', alignItems: 'center', gap: '12px' }}>📈 Analytics</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'16px',marginBottom:'24px'}}>
              <div style={{padding:'24px',background:'linear-gradient(135deg,#667eea,#764ba2)',borderRadius:'16px',color:'white',textAlign:'center'}}>
                <p style={{fontSize:'48px',fontWeight:'bold',margin:'0 0 8px 0'}}>{totalWorkouts}</p><p style={{margin:0,opacity:0.9}}>Total Workouts</p>
              </div>
              <div style={{padding:'24px',background:'linear-gradient(135deg,#10b981,#059669)',borderRadius:'16px',color:'white',textAlign:'center'}}>
                <p style={{fontSize:'48px',fontWeight:'bold',margin:'0 0 8px 0'}}>{totalMinutes}</p><p style={{margin:0,opacity:0.9}}>Total Minutes</p>
              </div>
              <div style={{padding:'24px',background:'linear-gradient(135deg,#f59e0b,#d97706)',borderRadius:'16px',color:'white',textAlign:'center'}}>
                <p style={{fontSize:'48px',fontWeight:'bold',margin:'0 0 8px 0'}}>{weekWorkouts}</p><p style={{margin:0,opacity:0.9}}>This Week</p>
              </div>
              <div style={{padding:'24px',background:'linear-gradient(135deg,#8b5cf6,#7c3aed)',borderRadius:'16px',color:'white',textAlign:'center'}}>
                <p style={{fontSize:'48px',fontWeight:'bold',margin:'0 0 8px 0'}}>{avgDuration}</p><p style={{margin:0,opacity:0.9}}>Avg Minutes</p>
              </div>
            </div>
            <div style={{padding:'24px',background:'linear-gradient(135deg,#f9fafb,#f3f4f6)',borderRadius:'16px',border:'2px solid #e5e7eb'}}>
              <h3 style={{margin:'0 0 16px 0',color:'#667eea'}}>📅 Most Active Day: <span style={{fontSize:'24px'}}>{mostActiveDay}</span></h3>
              {prog.length > 0 && (
                <div style={{marginTop:'16px'}}>
                  <h3 style={{margin:'0 0 12px 0',color:'#667eea'}}>📊 Progress Entries: {prog.length}</h3>
                  <div style={{maxHeight:'200px',overflowY:'auto',background:'white',borderRadius:'12px',padding:'12px'}}>
                    {prog.slice(-5).reverse().map(e => <div key={e.id} style={{padding:'8px',borderBottom:'1px solid #e5e7eb',display:'flex',justifyContent:'space-between'}}><span>{e.met}</span><b>{e.val}</b></div>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {active === 'Calories' && (
          <div>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '32px', color: '#667eea', display: 'flex', alignItems: 'center', gap: '12px' }}>🔥 Calorie Calculator</h2>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'16px'}}>
              <div>
                <label style={{fontWeight:'bold',display:'block',marginBottom:'8px',color:'#667eea'}}>Gender</label>
                <select value={cGen} onChange={e=>setCGen(e.target.value as any)} style={{width:'100%',padding:'14px',borderRadius:'12px',border:'2px solid #e5e7eb',fontSize:'16px',color:'#111827',backgroundColor:'white'}}>
                  <option value="male">Male</option><option value="female">Female</option>
                </select>
              </div>
              <div>
                <label style={{fontWeight:'bold',display:'block',marginBottom:'8px',color:'#667eea'}}>Age: <span style={{color:'#f59e0b'}}>{cAge}</span></label>
                <input type="range" min="15" max="80" value={cAge} onChange={e=>setCAge(parseInt(e.target.value))} style={{width:'100%',marginTop:'8px'}} />
              </div>
            </div>
            <label style={{fontWeight:'bold',display:'block',marginBottom:'8px',color:'#667eea'}}>Height: {cHt} cm</label>
            <input type="range" min="140" max="220" value={cHt} onChange={e=>setCHt(parseInt(e.target.value))} style={{width:'100%',marginBottom:'16px'}} />
            <label style={{fontWeight:'bold',display:'block',marginBottom:'8px',color:'#667eea'}}>Weight: {cWt} kg</label>
            <input type="range" min="40" max="150" value={cWt} onChange={e=>setCWt(parseInt(e.target.value))} style={{width:'100%',marginBottom:'16px'}} />
            <label style={{fontWeight:'bold',display:'block',marginBottom:'8px',color:'#667eea'}}>Activity Level</label>
            <select value={cAct} onChange={e=>setCAct(parseFloat(e.target.value))} style={{width:'100%',padding:'14px',borderRadius:'12px',border:'2px solid #e5e7eb',fontSize:'16px',marginBottom:'24px',color:'#111827',backgroundColor:'white'}}>
              <option value={1.2}>Sedentary (office job)</option>
              <option value={1.375}>Light (1-3 days/week)</option>
              <option value={1.55}>Moderate (3-5 days/week)</option>
              <option value={1.725}>Active (6-7 days/week)</option>
              <option value={1.9}>Very Active (2x/day)</option>
            </select>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'16px'}}>
              <div style={{padding:'24px',background:'linear-gradient(135deg,#10b981,#059669)',borderRadius:'16px',color:'white',textAlign:'center'}}>
                <p style={{fontSize:'14px',margin:'0 0 8px 0'}}>BMR</p>
                <p style={{fontSize:'36px',fontWeight:'bold',margin:0}}>{bmr}</p>
                <p style={{margin:0,opacity:0.8}}>cal/day</p>
              </div>
              <div style={{padding:'24px',background:'linear-gradient(135deg,#667eea,#764ba2)',borderRadius:'16px',color:'white',textAlign:'center'}}>
                <p style={{fontSize:'14px',margin:'0 0 8px 0'}}>Maintenance (TDEE)</p>
                <p style={{fontSize:'36px',fontWeight:'bold',margin:0}}>{tdee}</p>
                <p style={{margin:0,opacity:0.8}}>cal/day</p>
              </div>
              <div style={{padding:'24px',background:'linear-gradient(135deg,#ef4444,#dc2626)',borderRadius:'16px',color:'white',textAlign:'center'}}>
                <p style={{fontSize:'14px',margin:'0 0 8px 0'}}>Weight Loss</p>
                <p style={{fontSize:'36px',fontWeight:'bold',margin:0}}>{tdee - 500}</p>
                <p style={{margin:0,opacity:0.8}}>cal/day (-500)</p>
              </div>
            </div>
          </div>
        )}

        {active === 'Macros' && (
          <div>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '32px', color: '#667eea', display: 'flex', alignItems: 'center', gap: '12px' }}>🥗 Macro Calculator</h2>
            <label style={{fontWeight:'bold',display:'block',marginBottom:'8px',color:'#667eea'}}>Daily Calories: {mCal}</label>
            <input type="range" min="1000" max="4000" step="50" value={mCal} onChange={e=>setMCal(parseInt(e.target.value))} style={{width:'100%',marginBottom:'16px'}} />
            <label style={{fontWeight:'bold',display:'block',marginBottom:'12px',color:'#667eea'}}>Diet Type</label>
            <div style={{display:'flex',gap:'8px',marginBottom:'24px',flexWrap:'wrap'}}>
              {(['balanced','highprotein','lowcarb','keto'] as const).map(r=>(
                <button key={r} onClick={()=>setMRat(r)} style={{padding:'10px 20px',background:mRat===r?'#667eea':'#e5e7eb',color:mRat===r?'white':'#111',border:'none',borderRadius:'10px',cursor:'pointer',fontWeight:'bold',fontSize:'14px',textTransform:'capitalize'}}>{r}</button>
              ))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'16px'}}>
              <div style={{padding:'24px',background:'linear-gradient(135deg,#ef4444,#dc2626)',borderRadius:'16px',color:'white',textAlign:'center'}}>
                <p style={{fontSize:'48px',fontWeight:'bold',margin:'0 0 8px 0'}}>{Math.round((mCal*mSplit[mRat].p)/4)}g</p>
                <p style={{fontSize:'18px',margin:0}}>Protein ({Math.round(mSplit[mRat].p*100)}%)</p>
              </div>
              <div style={{padding:'24px',background:'linear-gradient(135deg,#3b82f6,#2563eb)',borderRadius:'16px',color:'white',textAlign:'center'}}>
                <p style={{fontSize:'48px',fontWeight:'bold',margin:'0 0 8px 0'}}>{Math.round((mCal*mSplit[mRat].c)/4)}g</p>
                <p style={{fontSize:'18px',margin:0}}>Carbs ({Math.round(mSplit[mRat].c*100)}%)</p>
              </div>
              <div style={{padding:'24px',background:'linear-gradient(135deg,#f59e0b,#d97706)',borderRadius:'16px',color:'white',textAlign:'center'}}>
                <p style={{fontSize:'48px',fontWeight:'bold',margin:'0 0 8px 0'}}>{Math.round((mCal*mSplit[mRat].f)/9)}g</p>
                <p style={{fontSize:'18px',margin:0}}>Fats ({Math.round(mSplit[mRat].f*100)}%)</p>
              </div>
            </div>
          </div>
        )}

        {active === 'Body Fat' && (
          <div>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '32px', color: '#667eea', display: 'flex', alignItems: 'center', gap: '12px' }}>📏 Body Fat Calculator</h2>
            <div style={{marginBottom:'16px'}}>
              <label style={{fontWeight:'bold',display:'block',marginBottom:'8px',color:'#667eea'}}>Gender</label>
              <select value={bfGen} onChange={e=>setBfGen(e.target.value as any)} style={{width:'100%',padding:'14px',borderRadius:'12px',border:'2px solid #e5e7eb',fontSize:'16px',color:'#111827',backgroundColor:'white'}}>
                <option value="male">Male</option><option value="female">Female</option>
              </select>
            </div>
            <label style={{fontWeight:'bold',display:'block',marginBottom:'8px',color:'#667eea'}}>Waist: {bfW} cm</label>
            <input type="range" min="60" max="120" value={bfW} onChange={e=>setBfW(parseInt(e.target.value))} style={{width:'100%',marginBottom:'16px'}} />
            <label style={{fontWeight:'bold',display:'block',marginBottom:'8px',color:'#667eea'}}>Neck: {bfN} cm</label>
            <input type="range" min="30" max="50" value={bfN} onChange={e=>setBfN(parseInt(e.target.value))} style={{width:'100%',marginBottom:'16px'}} />
            <label style={{fontWeight:'bold',display:'block',marginBottom:'8px',color:'#667eea'}}>Height: {bfH} cm</label>
            <input type="range" min="140" max="200" value={bfH} onChange={e=>setBfH(parseInt(e.target.value))} style={{width:'100%',marginBottom:'24px'}} />
            <div style={{padding:'30px',background:'linear-gradient(135deg,#a855f7,#9333ea)',borderRadius:'20px',color:'white',textAlign:'center',boxShadow:'0 10px 30px rgba(168,85,247,0.3)'}}>
              <p style={{fontSize:'20px',marginBottom:'12px',opacity:0.9}}>Body Fat Percentage</p>
              <p style={{fontSize:'72px',fontWeight:'bold',margin:0}}>{bfPct}%</p>
            </div>
          </div>
        )}

        {active === 'BMI' && (
          <div>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '32px', color: '#667eea', display: 'flex', alignItems: 'center', gap: '12px' }}>📊 BMI Calculator</h2>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px', color: '#667eea', fontSize: '16px' }}>Height: <span style={{color:'#667eea',fontSize:'20px'}}>{bH} cm</span></label>
            <input type="range" min="140" max="220" value={bH} onChange={e => setBH(parseInt(e.target.value))} style={{ width: '100%', marginBottom: '24px', height: '8px', borderRadius: '4px', background: '#e5e7eb' }} />
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px', color: '#667eea', fontSize: '16px' }}>Weight: <span style={{color:'#667eea',fontSize:'20px'}}>{bW} kg</span></label>
            <input type="range" min="40" max="150" value={bW} onChange={e => setBW(parseInt(e.target.value))} style={{ width: '100%', marginBottom: '24px', height: '8px', borderRadius: '4px', background: '#e5e7eb' }} />
            <div style={{ padding: '30px', background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: '20px', color: 'white', textAlign: 'center', boxShadow: '0 10px 30px rgba(102,126,234,0.3)' }}>
              <p style={{ fontSize: '20px', marginBottom: '12px', opacity: 0.9 }}>Your BMI</p>
              <p style={{ fontSize: '72px', fontWeight: 'bold', margin: '0 0 16px 0' }}>{bmi}</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', padding: '12px 24px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'inline-block' }}>
                {parseFloat(bmi) < 18.5 ? '🔸 Underweight' : parseFloat(bmi) < 25 ? '✅ Normal Weight' : parseFloat(bmi) < 30 ? '⚠️ Overweight' : '🚨 Obese'}
              </p>
            </div>
          </div>
        )}

        {active === '1RM' && (
          <div>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '32px', color: '#667eea', display: 'flex', alignItems: 'center', gap: '12px' }}>💪 One Rep Max</h2>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px', color: '#667eea', fontSize: '16px' }}>Weight Lifted: <span style={{color:'#f59e0b',fontSize:'20px'}}>{rW} kg</span></label>
            <input type="range" min="10" max="300" value={rW} onChange={e => setRW(parseInt(e.target.value))} style={{ width: '100%', marginBottom: '24px', height: '8px', borderRadius: '4px', background: '#e5e7eb' }} />
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px', color: '#667eea', fontSize: '16px' }}>Reps Performed: <span style={{color:'#f59e0b',fontSize:'20px'}}>{rR}</span></label>
            <input type="range" min="1" max="15" value={rR} onChange={e => setRR(parseInt(e.target.value))} style={{ width: '100%', marginBottom: '24px', height: '8px', borderRadius: '4px', background: '#e5e7eb' }} />
            <div style={{ padding: '30px', background: 'linear-gradient(135deg,#f59e0b,#d97706)', borderRadius: '20px', color: 'white', textAlign: 'center', boxShadow: '0 10px 30px rgba(245,158,11,0.3)' }}>
              <p style={{ fontSize: '20px', marginBottom: '12px' }}>Your 1 Rep Max</p>
              <p style={{ fontSize: '72px', fontWeight: 'bold', margin: 0 }}>{oneRm} kg</p>
            </div>
            <div style={{ marginTop: '24px', padding: '20px', background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', borderRadius: '16px', border: '2px solid #f59e0b' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#d97706' }}>Training Zones:</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ padding: '12px', background: 'white', borderRadius: '10px', border: '2px solid #f59e0b' }}><b>90% (Strength):</b> {Math.round(oneRm*0.9)} kg</div>
                <div style={{ padding: '12px', background: 'white', borderRadius: '10px', border: '2px solid #f59e0b' }}><b>75% (Hypertrophy):</b> {Math.round(oneRm*0.75)} kg</div>
                <div style={{ padding: '12px', background: 'white', borderRadius: '10px', border: '2px solid #f59e0b' }}><b>60% (Endurance):</b> {Math.round(oneRm*0.6)} kg</div>
              </div>
            </div>
          </div>
        )}

        {active === 'Rest Timer' && (
          <div>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '32px', color: '#667eea', display: 'flex', alignItems: 'center', gap: '12px' }}>⏱️ Rest Timer</h2>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
              {[30, 60, 90, 120, 180].map(s => (
                <button key={s} onClick={() => { setRestT(s); setRestL(s); setRestRun(false); }} style={{ padding: '14px 24px', background: restT === s ? 'linear-gradient(135deg,#667eea,#764ba2)' : '#e5e7eb', color: restT === s ? 'white' : '#111', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>{s}s</button>
              ))}
            </div>
            <div style={{ padding: '40px', background: restRun ? 'linear-gradient(135deg,#fee2e2,#fecaca)' : 'linear-gradient(135deg,#ecfdf5,#d1fae5)', borderRadius: '24px', textAlign: 'center', border: `3px solid ${restRun ? '#ef4444' : '#10b981'}`, marginBottom: '24px' }}>
              <p style={{ fontSize: '96px', fontWeight: 'bold', margin: 0, color: restRun ? '#dc2626' : '#059669', fontFamily: 'monospace' }}>{Math.floor(restL / 60)}:{String(restL % 60).padStart(2, '0')}</p>
              {restL === 0 && <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '24px', marginTop: '16px' }}>⏰ TIME'S UP!</p>}
            </div>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              {!restRun ? (
                <button onClick={() => setRestRun(true)} style={{ padding: '18px 48px', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}>▶️ Start</button>
              ) : (
                <button onClick={() => setRestRun(false)} style={{ padding: '18px 48px', background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}>⏸️ Pause</button>
              )}
              <button onClick={() => { setRestRun(false); setRestL(restT); }} style={{ padding: '18px 48px', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}>🔄 Reset</button>
            </div>
          </div>
        )}

        {active === 'Hydration' && (
          <div>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '32px', color: '#667eea', display: 'flex', alignItems: 'center', gap: '12px' }}>💧 Hydration Tracker</h2>
            <div style={{ textAlign: 'center', padding: '30px', background: 'linear-gradient(135deg,#dbeafe,#bfdbfe)', borderRadius: '24px', marginBottom: '24px', border: '3px solid #3b82f6' }}>
              <p style={{ fontSize: '80px', margin: '0 0 16px 0' }}>💧</p>
              <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#2563eb', margin: '0 0 12px 0' }}>{gls} / {gGoal}</p>
              <p style={{ color: '#1e40af', fontSize: '18px' }}>glasses today</p>
              <div style={{ height: '16px', background: 'white', borderRadius: '10px', overflow: 'hidden', marginTop: '20px', border: '2px solid #3b82f6' }}>
                <div style={{ width: `${Math.min((gls / gGoal) * 100, 100)}%`, height: '100%', background: 'linear-gradient(90deg,#3b82f6,#2563eb)', transition: 'width 0.3s', borderRadius: '10px' }}></div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '24px' }}>
              <button onClick={() => { const n = gls + 1; setGls(n); localStorage.setItem(`hg_${uid}`, n.toString()); msg('💧 +1 Glass!'); }} style={{ padding: '18px 36px', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}>+1 Glass</button>
              <button onClick={() => { setGls(0); localStorage.setItem(`hg_${uid}`, '0'); msg('🔄 Reset!'); }} style={{ padding: '18px 36px', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}>Reset</button>
            </div>
            <div style={{ padding: '20px', background: 'linear-gradient(135deg,#f9fafb,#f3f4f6)', borderRadius: '16px', border: '2px solid #e5e7eb' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '12px', color: '#667eea' }}>Daily Goal: <span style={{color:'#3b82f6',fontSize:'20px'}}>{gGoal}</span> glasses</label>
              <input type="range" min="4" max="16" value={gGoal} onChange={e => { setGGoal(parseInt(e.target.value)); localStorage.setItem(`hg_goal_${uid}`, e.target.value); }} style={{ width: '100%', height: '8px', borderRadius: '4px', background: '#e5e7eb' }} />
            </div>
          </div>
        )}

        {active === 'Stopwatch' && (
          <div>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '32px', color: '#667eea', display: 'flex', alignItems: 'center', gap: '12px' }}>⏲️ Stopwatch</h2>
            <div style={{ fontSize: '72px', textAlign: 'center', marginBottom: '24px', padding: '30px', background: 'linear-gradient(135deg,#f9fafb,#f3f4f6)', borderRadius: '20px', fontWeight: 'bold', fontFamily: 'monospace', color: '#667eea', border: '3px solid #667eea' }}>
              {Math.floor(swT / 60)}:{String(swT % 60).padStart(2, '0')}
            </div>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '24px' }}>
              <button onClick={() => setSwRun(!swRun)} style={{ padding: '18px 48px', background: swRun ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'linear-gradient(135deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}>{swRun ? '⏸️ Pause' : '▶️ Start'}</button>
              <button onClick={() => { setSwRun(false); setSwT(0); setLaps([]); }} style={{ padding: '18px 48px', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}>🔄 Reset</button>
            </div>
            {swRun && <button onClick={() => setLaps([...laps, swT])} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '24px' }}>🏁 Lap</button>}
            {laps.length > 0 && (
              <div style={{ background: 'linear-gradient(135deg,#f9fafb,#f3f4f6)', borderRadius: '16px', padding: '20px', border: '2px solid #e5e7eb', maxHeight: '300px', overflowY: 'auto' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#667eea' }}>Lap Times:</h3>
                {laps.map((l, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'white', borderRadius: '10px', marginBottom: '10px', border: '2px solid #667eea' }}><span style={{fontWeight:'bold',color:'#667eea'}}>Lap {i + 1}</span><span style={{fontWeight:'bold',fontFamily:'monospace',fontSize:'18px'}}>{Math.floor(l / 60)}:{String(l % 60).padStart(2, '0')}</span></div>)}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)', padding: '40px' }}>
      {notify && <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', padding: '16px 32px', borderRadius: '12px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 6px 20px rgba(16,185,129,0.4)', fontSize: '16px' }}>{notify}</div>}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
          <h1 style={{ color: 'white', fontSize: '48px', fontWeight: 'bold', margin: 0, textShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>🏋️ Fitness Tools</h1>
          <button onClick={() => window.location.href = '/'} style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', backdropFilter: 'blur(10px)', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>← Back to Home</button>
        </div>
        {!active ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '20px' }}>
            {[
              ['Calendar', '📅'], ['Progress', '📊'], ['Music', '🎵'], ['BMI', '📊'], ['1RM', '💪'],
              ['Rest Timer', '⏱️'], ['Hydration', '💧'], ['Stopwatch', '⏲️'],
              ['Achievements', '🏆'], ['Social', '👥'], ['Analytics', '📈'],
              ['Calories', '🔥'], ['Macros', '🥗'], ['Body Fat', '📏']
            ].map(([t, icon]) => (
              <button key={t} onClick={() => setActive(t)} style={{ padding: '32px', background: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', transition: 'all 0.3s', textAlign: 'center' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.2)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)'; }}>
                <div style={{ fontSize: '56px', marginBottom: '16px' }}>{icon}</div>
                <b style={{ fontSize: '20px', color: '#111', display: 'block' }}>{t}</b>
              </button>
            ))}
          </div>
        ) : render()}
      </div>
    </div>
  );
}