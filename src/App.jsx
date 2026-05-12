import React, { useRef, useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { FireModeUI } from './components/FireModeUI';
import { GridManager } from './game/GridManager';

function App() {
  const canvasRef = useRef(null);
  const gridRef = useRef(new GridManager(9));
  const [coverage, setCoverage] = useState(0);
  const [liveCoords, setLiveCoords] = useState(null);
  const [isFiring, setIsFiring] = useState(false);
  const [mode, setMode] = useState('fire'); // 'fire' or 'explore'

  const handlePreview = (analysis) => {
    if (canvasRef.current) {
      canvasRef.current.previewTrajectory(analysis);
    }
  };

  const handleFire = (analysis) => {
    if (canvasRef.current && !isFiring) {
      const points = canvasRef.current.previewTrajectory(analysis);
      if (points && points.length > 0) {
        setIsFiring(true);
        canvasRef.current.fireBullet(
          points, 
          (pt) => {
            setLiveCoords({ x: pt.x.toFixed(1), y: pt.y.toFixed(1), z: pt.z.toFixed(1) });
          },
          (impact) => {
            setLiveCoords(null);
            setIsFiring(false);
            if (impact.z <= -49) { // Hit the target wall
              const newCells = gridRef.current.splatter(impact.x, impact.y, analysis.degree);
              if (newCells.length > 0) {
                canvasRef.current.paintCells(newCells, gridRef.current.size);
                setCoverage(gridRef.current.getCoverage());
              }
            }
          }
        );
      }
    }
  };

  const handleToggleMode = () => {
    const newMode = mode === 'fire' ? 'explore' : 'fire';
    setMode(newMode);
    if (canvasRef.current) {
      canvasRef.current.setMode(newMode);
    }
  };

  // Live track camera coordinates in explore mode
  React.useEffect(() => {
    let animFrame;
    const trackCamera = () => {
      if (mode === 'explore' && canvasRef.current) {
        const pos = canvasRef.current.getCameraPos();
        if (pos) {
          setLiveCoords({ x: pos.x.toFixed(1), y: pos.y.toFixed(1), z: pos.z.toFixed(1) });
        }
      } else if (mode === 'fire' && !isFiring) {
        setLiveCoords(null);
      }
      animFrame = requestAnimationFrame(trackCamera);
    };
    animFrame = requestAnimationFrame(trackCamera);
    return () => cancelAnimationFrame(animFrame);
  }, [mode, isFiring]);

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
      
      {/* Mode Toggle UI */}
      <div style={{
        position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(255,255,255,0.9)', padding: '5px', borderRadius: '8px', 
        display: 'flex', gap: '5px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <button 
          onClick={() => mode !== 'fire' && handleToggleMode()}
          style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: mode === 'fire' ? '#00ccff' : 'transparent', color: mode === 'fire' ? '#000' : '#666' }}
        >
          FIRE MODE
        </button>
        <button 
          onClick={() => mode !== 'explore' && handleToggleMode()}
          style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: mode === 'explore' ? '#00ccff' : 'transparent', color: mode === 'explore' ? '#000' : '#666' }}
        >
          EXPLORE MODE
        </button>
      </div>
      
      {liveCoords && (
        <div style={{
          position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)', color: '#00ccff', padding: '15px 30px',
          borderRadius: '8px', fontFamily: 'monospace', fontSize: '24px',
          boxShadow: '0 0 20px rgba(0, 204, 255, 0.5)', zIndex: 10
        }}>
          X:{liveCoords.x} Y:{liveCoords.y} Z:{liveCoords.z}
        </div>
      )}

      {mode === 'explore' && (
        <div style={{
          position: 'absolute', top: '100px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '10px 20px',
          borderRadius: '8px', fontSize: '14px', textAlign: 'center'
        }}>
          <b>Controls:</b> WASD or Arrows to Move | Q/E to Fly Up/Down
        </div>
      )}

      {mode === 'fire' && <FireModeUI onPreview={handlePreview} onFire={handleFire} isFiring={isFiring} />}
    </div>
  );
}

export default App;
