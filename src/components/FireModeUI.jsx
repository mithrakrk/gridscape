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
      background: 'rgba(255,255,255,0.95)', padding: '20px', borderRadius: '12px', 
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)', width: '300px', display: 'flex', flexDirection: 'column', gap: '15px',
      fontFamily: 'sans-serif'
    }}>
      <h3 style={{ margin: 0, color: '#222', fontSize: '16px' }}>Formula Settings</h3>
      <input 
        type="text" 
        value={formula} 
        onChange={e => setFormula(e.target.value)}
        placeholder="e.g. x^2 + y"
        style={{ padding: '10px', fontSize: '18px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none', fontFamily: 'monospace' }}
      />
      
      <button 
        onClick={handleParse} 
        style={{ padding: '8px', cursor: 'pointer', background: '#eee', border: '1px solid #ddd', borderRadius: '6px', fontWeight: 'bold' }}
      >
        Preview Trace
      </button>

      <button 
        onClick={handleFire} 
        disabled={!analysis?.valid || isFiring} 
        style={{ padding: '12px', background: (analysis?.valid && !isFiring) ? '#00ccff' : '#ccc', color: (analysis?.valid && !isFiring) ? '#000' : '#666', border: 'none', borderRadius: '6px', cursor: (analysis?.valid && !isFiring) ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '16px' }}
      >
        {isFiring ? 'FIRING...' : 'FIRE CANNON!'}
      </button>

      {analysis && (
        <div style={{ fontSize: '12px', color: analysis.valid ? '#008800' : '#cc0000', background: analysis.valid ? '#e6ffe6' : '#ffe6e6', padding: '8px', borderRadius: '6px' }}>
          {analysis.valid ? 
            `✅ Vars: ${analysis.variables.join(',')} | Deg: ${analysis.degree}` : 
            `❌ ${analysis.error}`
          }
        </div>
      )}
    </div>
  );
}
