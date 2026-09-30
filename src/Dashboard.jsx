import React from 'react';
import { supabase } from './supabaseClient';

function Dashboard() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dashboard</h1>
        <button 
          onClick={handleLogout} 
          style={{ padding: '8px 16px', cursor: 'pointer', background: '#f44336', color: '#fff', border: 'none', borderRadius: '4px' }}
        >
          Logout
        </button>
      </header>

      <main style={{ marginTop: '20px' }}>
        <h2>Welcome back!</h2>
        <p>You are successfully logged in to your application.</p>
      </main>
    </div>
  );
}

export default Dashboard;