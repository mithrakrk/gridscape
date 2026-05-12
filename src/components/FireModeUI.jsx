import React, { useState } from 'react';
import { FormulaEngine } from '../game/FormulaEngine';

export function FireModeUI({ onPreview, onFire, isFiring }) {
  const [formula, setFormula] = useState('x^2 + y');
  const [analysis, setAnalysis] = useState(null);

  const handleParse = () => {
    const result = FormulaEngine.analyze(formula);
    setAnalysis(result);
    if (result.valid) {
      onPreview(result);
    }
  };

  const handleFire = () => {
    if (analysis && analysis.valid) {
      onFire(analysis);
    }
  };

  return (
    <div style={{
      position: 'absolute', top: '20px', right: '20px',
      background: 'rgba(20, 20, 20, 0.95)', padding: '25px', borderRadius: '12px', 
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)', width: '320px', display: 'flex', flexDirection: 'column', gap: '15px',
      fontFamily: 'sans-serif', border: '1px solid #333', color: '#fff'
    }}>
      <h3 style={{ margin: 0, color: '#00ccff', fontSize: '18px', textTransform: 'uppercase', letterSpacing: '1px' }}>Formula Settings</h3>
      <input 
        type="text" 
        value={formula} 
        onChange={e => setFormula(e.target.value)}
        placeholder="e.g. sin(x) + y"
        style={{ padding: '12px', fontSize: '18px', borderRadius: '6px', border: '1px solid #444', outline: 'none', fontFamily: 'monospace', background: '#111', color: '#fff' }}
      />
      
      <button 
        onClick={handleParse} 
        style={{ padding: '10px', cursor: 'pointer', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '6px', fontWeight: 'bold', transition: 'all 0.2s' }}
      >
        Preview Trace
      </button>

      <button 
        onClick={handleFire} 
        disabled={!analysis?.valid || isFiring} 
        style={{ padding: '15px', background: (analysis?.valid && !isFiring) ? 'linear-gradient(45deg, #00ccff, #0066ff)' : '#333', color: (analysis?.valid && !isFiring) ? '#fff' : '#666', border: 'none', borderRadius: '6px', cursor: (analysis?.valid && !isFiring) ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '18px', textShadow: '0 2px 4px rgba(0,0,0,0.3)', boxShadow: (analysis?.valid && !isFiring) ? '0 4px 15px rgba(0, 204, 255, 0.4)' : 'none' }}
      >
        {isFiring ? 'FIRING...' : 'FIRE CANNON!'}
      </button>

      {analysis && (
        <div style={{ fontSize: '13px', color: analysis.valid ? '#00ffcc' : '#ff3366', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '6px', borderLeft: `4px solid ${analysis.valid ? '#00ffcc' : '#ff3366'}` }}>
          {analysis.valid ? 
            `✅ Vars: ${analysis.variables.join(',')} | Deg: ${analysis.degree}` : 
            `❌ ${analysis.error}`
          }
        </div>
      )}
    </div>
  );
}
