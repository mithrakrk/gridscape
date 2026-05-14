import React, { useState, useEffect } from 'react';
import { FormulaEngine } from '../game/FormulaEngine';

export function FireModeUI({ onPreview, onFire, isFiring, onConfigChange }) {
  const [config, setConfig] = useState({
    power: 50,
    ax: '0',
    ay: '-9.8',
    az: '0'
  });

  const [analysis, setAnalysis] = useState(null);

  // Notify parent of live config changes
  useEffect(() => {
    if (onConfigChange) {
      onConfigChange(config);
    }
  }, [config, onConfigChange]);

  const handleParse = () => {
    // Analyze the three acceleration formulas
    const resX = FormulaEngine.analyze(config.ax);
    const resY = FormulaEngine.analyze(config.ay);
    const resZ = FormulaEngine.analyze(config.az);
    
    if (resX.valid && resY.valid && resZ.valid) {
      const combinedAnalysis = {
        valid: true,
        xCompiled: resX.compiled,
        yCompiled: resY.compiled,
        zCompiled: resZ.compiled,
        degree: Math.max(resX.degree, resY.degree, resZ.degree),
        variables: [...new Set([...resX.variables, ...resY.variables, ...resZ.variables])],
        config: config
      };
      setAnalysis(combinedAnalysis);
      onPreview(combinedAnalysis);
    } else {
      setAnalysis({ valid: false, error: 'Invalid formula syntax' });
    }
  };

  const handleChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{
      position: 'absolute', top: '20px', right: '20px',
      background: 'rgba(20, 20, 20, 0.95)', padding: '20px', borderRadius: '12px', 
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)', width: '320px', display: 'flex', flexDirection: 'column', gap: '10px',
      fontFamily: 'sans-serif', border: '1px solid #333', color: '#fff',
      maxHeight: '90vh', overflowY: 'auto'
    }}>
      <h3 style={{ margin: 0, color: '#00ccff', fontSize: '18px', textTransform: 'uppercase' }}>Physics Engine</h3>
      
      <div style={{ fontSize: '12px', color: '#00ccff', marginBottom: '-5px' }}>
        <i>Aim: Mouse | Move: WASD</i>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label style={{ fontSize: '12px', color: '#aaa' }}>Launch Power: {config.power}</label>
        <input type="range" min="10" max="200" value={config.power} onChange={e => handleChange('power', parseFloat(e.target.value))} />
      </div>

      <h4 style={{ margin: '10px 0 0 0', color: '#00ccff', fontSize: '14px' }}>Acceleration Vector</h4>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: '#ff3366', fontWeight: 'bold' }}>Ax:</span>
        <input type="text" value={config.ax} onChange={e => handleChange('ax', e.target.value)} style={{ flex: 1, padding: '8px', background: '#111', color: '#fff', border: '1px solid #444', borderRadius: '4px', fontFamily: 'monospace' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: '#33ff66', fontWeight: 'bold' }}>Ay:</span>
        <input type="text" value={config.ay} onChange={e => handleChange('ay', e.target.value)} style={{ flex: 1, padding: '8px', background: '#111', color: '#fff', border: '1px solid #444', borderRadius: '4px', fontFamily: 'monospace' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: '#3366ff', fontWeight: 'bold' }}>Az:</span>
        <input type="text" value={config.az} onChange={e => handleChange('az', e.target.value)} style={{ flex: 1, padding: '8px', background: '#111', color: '#fff', border: '1px solid #444', borderRadius: '4px', fontFamily: 'monospace' }} />
      </div>

      <button onClick={handleParse} style={{ marginTop: '10px', padding: '10px', cursor: 'pointer', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '6px', fontWeight: 'bold' }}>
        Preview Trajectory
      </button>

      <button 
        onClick={() => analysis?.valid && onFire(analysis)} 
        disabled={!analysis?.valid || isFiring} 
        style={{ padding: '15px', background: (analysis?.valid && !isFiring) ? 'linear-gradient(45deg, #00ccff, #0066ff)' : '#333', color: (analysis?.valid && !isFiring) ? '#fff' : '#666', border: 'none', borderRadius: '6px', cursor: (analysis?.valid && !isFiring) ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '18px' }}
      >
        {isFiring ? 'FIRING...' : 'FIRE CANNON!'}
      </button>

      {analysis && !analysis.valid && (
        <div style={{ fontSize: '13px', color: '#ff3366', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '6px', borderLeft: '4px solid #ff3366' }}>
          ❌ {analysis.error}
        </div>
      )}
    </div>
  );
}
