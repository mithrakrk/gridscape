import React, { useState } from 'react';
import { FormulaEngine } from '../game/FormulaEngine';

export function FireModeUI({ onPreview, onFire }) {
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
      position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(255,255,255,0.95)', padding: '20px', borderRadius: '12px', 
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)', width: '450px', display: 'flex', flexDirection: 'column', gap: '15px',
      fontFamily: 'sans-serif'
    }}>
      <h3 style={{ margin: 0, color: '#222', fontSize: '18px' }}>Fire Mode</h3>
      <input 
        type="text" 
        value={formula} 
        onChange={e => setFormula(e.target.value)}
        placeholder="Enter formula (e.g. x^2 + y)"
        style={{ padding: '10px', fontSize: '16px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none' }}
      />
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={handleParse} 
          style={{ flex: 1, padding: '10px', cursor: 'pointer', background: '#eee', border: '1px solid #ddd', borderRadius: '6px', fontWeight: 'bold' }}
        >
          Parse & Preview
        </button>
        <button 
          onClick={handleFire} 
          disabled={!analysis?.valid} 
          style={{ flex: 1, padding: '10px', background: analysis?.valid ? '#00ccff' : '#ccc', color: analysis?.valid ? '#000' : '#666', border: 'none', borderRadius: '6px', cursor: analysis?.valid ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}
        >
          FIRE!
        </button>
      </div>
      {analysis && (
        <div style={{ fontSize: '13px', color: analysis.valid ? '#008800' : '#cc0000', marginTop: '5px', background: analysis.valid ? '#e6ffe6' : '#ffe6e6', padding: '10px', borderRadius: '6px' }}>
          {analysis.valid ? 
            `✅ Valid! | Vars: ${analysis.variables.join(', ')} | Degree: ${analysis.degree} | Centers: ${analysis.variables.length}` : 
            `❌ Error: ${analysis.error}`
          }
        </div>
      )}
    </div>
  );
}
