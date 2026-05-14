import React, { useRef, useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { FireModeUI } from './components/FireModeUI';
import { GridManager } from './game/GridManager';
import { LEVELS } from './game/LevelManager';

function App() {
  const canvasRef = useRef(null);
  const gridRef = useRef(new GridManager(9));
  const [coverage, setCoverage] = useState(0);
  const [liveCoords, setLiveCoords] = useState(null);
  const [targetCell, setTargetCell] = useState(null);
  const [isFiring, setIsFiring] = useState(false);
  const [mode, setMode] = useState('fire'); // 'fire' or 'explore'
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const currentLevel = LEVELS[currentLevelIdx];
  const [showLevelComplete, setShowLevelComplete] = useState(false);

  React.useEffect(() => {
    // When the canvas is ready, load the level
    // Wait a tick to ensure SceneManager is instantiated
    setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.loadLevel(currentLevel);
      }
    }, 100);
    gridRef.current = new GridManager(9);
    setCoverage(0);
    setShowLevelComplete(false);
  }, [currentLevelIdx]);

  const handlePreview = (analysis) => {
    if (canvasRef.current) {
      canvasRef.current.previewTrajectory(analysis);
    }
  };

  const handleConfigChange = (config) => {
    if (canvasRef.current) {
      canvasRef.current.updateTurretConfig(config);
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
                const newCov = gridRef.current.getCoverage();
                setCoverage(newCov);
                if (newCov >= currentLevel.coverageThreshold) {
                  setTimeout(() => {
                    setShowLevelComplete(true);
                  }, 1500); // Wait 1.5 seconds before showing celebration!
                }
              }
            } else {
              // Obstacle hit is handled by particles in SceneManager automatically!
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
        const cell = canvasRef.current.getRaycastCell();
        if (cell) {
          setTargetCell({ x: cell.x.toFixed(1), y: cell.y.toFixed(1) });
        } else {
          setTargetCell(null);
        }
      } else if (mode === 'fire' && !isFiring) {
        setLiveCoords(null);
        setTargetCell(null);
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
        <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', color: '#00ccff' }}>Gridscape</h1>
        <p style={{ margin: '0 0 10px 0', color: '#444', fontWeight: 'bold' }}>{currentLevel.name}</p>
        <div style={{ background: '#eee', borderRadius: '4px', height: '10px', overflow: 'hidden' }}>
          <div style={{ width: `${coverage * 100}%`, background: '#00ccff', height: '100%', transition: 'width 0.3s' }} />
        </div>
        <div style={{ fontSize: '12px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <span>{Math.round(coverage * 100)}% Revealed</span>
          <span style={{ color: '#cc0000' }}>Target: {Math.round(currentLevel.coverageThreshold * 100)}%</span>
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
          background: 'rgba(20,20,20,0.9)', color: '#aaa', padding: '15px 30px',
          borderRadius: '8px', fontFamily: 'monospace', fontSize: '18px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)', zIndex: 10, display: 'flex', gap: '20px', border: '1px solid #333'
        }}>
          <div>CAM: <span style={{ color: '#fff' }}>X:{liveCoords.x} Y:{liveCoords.y} Z:{liveCoords.z}</span></div>
          {targetCell && (
            <div style={{ borderLeft: '1px solid #555', paddingLeft: '20px', color: '#00ccff' }}>
              TARGET: <span style={{ color: '#fff' }}>X:{targetCell.x} Y:{targetCell.y}</span>
            </div>
          )}
        </div>
      )}

      {mode === 'explore' && (
        <>
          {/* Controls Hint */}
          <div style={{
            position: 'absolute', top: '100px', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(20,20,20,0.8)', color: '#fff', padding: '10px 20px',
            borderRadius: '8px', fontSize: '14px', textAlign: 'center', border: '1px solid #333'
          }}>
            <b>Controls:</b> WASD or Arrows to Move | Q/E to Fly | Hold SHIFT to Sprint
          </div>
          {/* Crosshair */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            color: 'rgba(0, 204, 255, 0.8)', fontSize: '24px', pointerEvents: 'none', fontWeight: 'bold'
          }}>+</div>
        </>
      )}

      {mode === 'fire' && (
        <>
          <FireModeUI onPreview={handlePreview} onFire={handleFire} isFiring={isFiring} onConfigChange={handleConfigChange} />
          {isFiring && (
            <div style={{ position: 'absolute', bottom: '100px', left: '50%', transform: 'translateX(-50%)', color: '#fff', background: 'rgba(0,0,0,0.8)', padding: '10px 20px', borderRadius: '8px' }}>
              Hold <b>SPACEBAR</b> to fast-forward!
            </div>
          )}
          
          <button 
            onClick={() => setShowCheatSheet(true)}
            style={{ position: 'absolute', bottom: '20px', right: '20px', background: 'rgba(20,20,20,0.9)', color: '#00ccff', border: '1px solid #333', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ? Math Cheat Sheet
          </button>
        </>
      )}

      {showCheatSheet && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'rgba(20,20,20,0.95)', border: '1px solid #444', color: '#fff', padding: '30px',
          borderRadius: '12px', zIndex: 200, width: '400px', boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
        }}>
          <h2 style={{ color: '#00ccff', marginTop: 0 }}>Math Cheat Sheet</h2>
          <p>You can use any standard math functions!</p>
          <ul style={{ lineHeight: '1.8' }}>
            <li><code>sin(x)</code> / <code>cos(x)</code> - Trigonometry</li>
            <li><code>abs(x)</code> - Absolute value</li>
            <li><code>sqrt(x)</code> - Square root</li>
            <li><code>x^2</code>, <code>y^3</code> - Exponents</li>
            <li><code>(x + y) * 2</code> - Grouping</li>
          </ul>
          <button onClick={() => setShowCheatSheet(false)} style={{ marginTop: '20px', padding: '10px', width: '100%', background: '#00ccff', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Close</button>
        </div>
      )}

      {/* Level Complete Overlay */}
      {showLevelComplete && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <h1 style={{ color: '#00ccff', fontSize: '56px', marginBottom: '20px', textShadow: '0 0 20px #00ccff' }}>Masterpiece Revealed!</h1>
          <p style={{ color: '#fff', fontSize: '24px', marginBottom: '40px' }}>You successfully cleared {currentLevel.name}</p>
          {currentLevelIdx < LEVELS.length - 1 ? (
            <button 
              onClick={() => setCurrentLevelIdx(prev => prev + 1)}
              style={{ padding: '20px 40px', fontSize: '28px', background: '#00ccff', color: '#000', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 0 15px #00ccff' }}
            >
              Start Next Level
            </button>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ color: '#00ffcc', fontSize: '32px' }}>Congratulations!</h2>
              <p style={{ color: '#aaa', fontSize: '18px' }}>You have completed all levels and the MVP!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
