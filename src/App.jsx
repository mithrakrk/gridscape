import React, { useRef, useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { FireModeUI } from './components/FireModeUI';
import { GridManager } from './game/GridManager';

function App() {
  const canvasRef = useRef(null);
  const gridRef = useRef(new GridManager(20));
  const [coverage, setCoverage] = useState(0);

  const handlePreview = (analysis) => {
    if (canvasRef.current) {
      canvasRef.current.previewTrajectory(analysis);
    }
  };

  const handleFire = (analysis) => {
    if (canvasRef.current) {
      const points = canvasRef.current.previewTrajectory(analysis);
      if (points && points.length > 0) {
        const impact = points[points.length - 1];
        if (impact.z <= -49) { // Hit the target wall
          const newCells = gridRef.current.splatter(impact.x, impact.y, analysis.degree);
          if (newCells.length > 0) {
            canvasRef.current.paintCells(newCells, gridRef.current.size);
            setCoverage(gridRef.current.getCoverage());
          }
        }
      }
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
        <p style={{ margin: '0 0 5px 0', color: '#666' }}>Milestone 3: Grid & Splatter</p>
        <div style={{ background: '#eee', borderRadius: '4px', height: '10px', overflow: 'hidden' }}>
          <div style={{ width: `${coverage * 100}%`, background: '#00ccff', height: '100%', transition: 'width 0.3s' }} />
        </div>
        <div style={{ fontSize: '12px', marginTop: '4px', textAlign: 'right', fontWeight: 'bold' }}>
          {Math.round(coverage * 100)}% Revealed
        </div>
      </div>
      
      <FireModeUI onPreview={handlePreview} onFire={handleFire} />
    </div>
  );
}

export default App;
