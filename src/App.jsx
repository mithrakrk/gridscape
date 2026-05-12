import React, { useRef } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { FireModeUI } from './components/FireModeUI';

function App() {
  const canvasRef = useRef(null);

  const handlePreview = (analysis) => {
    if (canvasRef.current) {
      canvasRef.current.previewTrajectory(analysis);
    }
  };

  const handleFire = (analysis) => {
    if (canvasRef.current) {
      canvasRef.current.previewTrajectory(analysis);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <GameCanvas ref={canvasRef} />
      <div style={{
        position: 'absolute', 
        top: '20px', 
        left: '20px', 
        color: '#222',
        fontFamily: 'sans-serif',
        background: 'rgba(255,255,255,0.9)',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #ccc',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#00ccff' }}>Gridscape</h1>
        <p style={{ margin: 0, color: '#666' }}>Milestone 2: Formula Engine</p>
      </div>
      
      <FireModeUI onPreview={handlePreview} onFire={handleFire} />
    </div>
  );
}

export default App;
