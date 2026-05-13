'use client';

import { useState, useEffect } from 'react';

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [uid, setUid] = useState<string>('guest');
  
  useEffect(() => {
    const savedId = localStorage.getItem('gym-ai-user-id');
    setUid(savedId || 'guest');
  }, []);
  
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Simple placeholder for all tools
  const renderTool = () => {
    if (!activeTool) return null;
    return (
      <div style={{background:'white',borderRadius:'24px',padding:'32px',boxShadow:'0 10px 40px rgba(0,0,0,0.2)', textAlign:'center'}}>
        <button 
          onClick={()=>setActiveTool(null)} 
          style={{padding:'12px 24px',background:'#667eea',color:'white',border:'none',borderRadius:'8px',fontWeight:'bold',cursor:'pointer',marginBottom:'24px'}}
        >
          ← Back to Tools
        </button>
        <h2 style={{fontSize:'28px',fontWeight:'bold',color:'#111827',marginBottom:'16px'}}>{activeTool}</h2>
        <p style={{color:'#6b7280',fontSize:'18px'}}>Tool coming soon! This is a placeholder.</p>
      </div>
    );
  };

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',padding:'48px 16px'}}>
      {notification && (
        <div style={{position:'fixed',top:'20px',left:'50%',transform:'translateX(-50%)',background:'#10b981',color:'white',padding:'16px 32px',borderRadius:'12px',fontWeight:'bold',zIndex:1000}}>
          {notification}
        </div>
      )}
      <div style={{maxWidth:'1000px',margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <h1 style={{fontSize:'42px',fontWeight:'bold',color:'white',marginBottom:'16px'}}>🏋️ Fitness Tools</h1>
          <p style={{color:'rgba(255,255,255,0.9)',fontSize:'18px'}}>Your complete fitness ecosystem</p>
        </div>
        
        {!activeTool ? (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'20px'}}>
            {[
              ['calendar','📅','Calendar'],
              ['progress','📊','Progress'],
              ['achievements','🏆','Achievements'],
              ['social','👥','Social'],
              ['music','🎵','Music'],
              ['analytics','📈','Analytics'],
              ['bmi','📊','BMI'],
              ['calories','🔥','Calories'],
              ['onerm','💪','1RM'],
              ['rest','⏱️','Rest'],
              ['hydration','💧','Hydration'],
              ['macros','🥗','Macros']
            ].map(([id,icon,title]) => (
              <div 
                key={id} 
                onClick={()=>setActiveTool(id as string)} 
                style={{
                  padding:'32px',
                  background:'white',
                  borderRadius:'20px',
                  cursor:'pointer',
                  transition:'transform 0.2s',
                  boxShadow:'0 4px 6px rgba(0,0,0,0.1)'
                }} 
                onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-4px)')}
                onMouseLeave={e=>(e.currentTarget.style.transform='translateY(0)')}
              >
                <div style={{fontSize:'48px',marginBottom:'16px',textAlign:'center'}}>{icon}</div>
                <h3 style={{fontSize:'20px',fontWeight:'bold',marginBottom:'8px',color:'#1a1a1a',textAlign:'center'}}>{title}</h3>
              </div>
            ))}
          </div>
        ) : renderTool()}
      </div>
    </div>
  );
}