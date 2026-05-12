import React from 'react';
import { GameCanvas } from './components/GameCanvas';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <GameCanvas />
      <div style={{
        position: 'absolute', 
        top: '20px', 
        left: '20px', 
        color: 'white',
        fontFamily: 'sans-serif',
        background: 'rgba(0,0,0,0.5)',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #333'
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#00ffcc' }}>Gridscape</h1>
        <p style={{ margin: 0, color: '#aaa' }}>Milestone 1: Basic 3D Scene</p>
      </div>
    </div>
  );
}

export default App;
