'use client';

import { useState, useEffect } from 'react';
import OnboardingForm from '@/components/OnboardingForm';

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [inputId, setInputId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedId = localStorage.getItem('gym-ai-user-id');
    if (savedId) {
      setUserId(savedId);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    if (!inputId.trim()) {
      alert('Please enter a username');
      return;
    }
    const cleanId = inputId.trim().toLowerCase();
    setUserId(cleanId);
    localStorage.setItem('gym-ai-user-id', cleanId);
  };

  const handleLogout = () => {
    localStorage.removeItem('gym-ai-user-id');
    setUserId(null);
    setInputId('');
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>🏋️ Gym AI</h1>
          <p style={{ color: '#666', marginBottom: '32px' }}>Enter your unique ID</p>
          <input 
            type="text" 
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            placeholder="e.g., anurag007"
            style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '18px', marginBottom: '16px', textAlign: 'center' }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            autoFocus
          />
          <button 
            onClick={handleLogin}
            style={{ width: '100%', padding: '16px', background: '#667eea', color: 'white', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Start Training 🚀
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100 }}>
        <button 
          onClick={handleLogout}
          style={{ background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer' }}
        >
          🚪 Logout
        </button>
      </div>
      <OnboardingForm userId={userId} />
    </div>
  );
}