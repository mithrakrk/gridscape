import * as THREE from 'three';

export class TrajectorySolver {
  /**
   * Calculates the flight path of the paint shot based on the math formula.
   * @param {Object} analysis - The compiled math.js result from FormulaEngine
   * @param {THREE.Vector3} start - The origin point (turret)
   * @param {number} targetZ - The z-coordinate of the target wall
   * @returns {THREE.Vector3[]} Array of points defining the trajectory curve
   */
  static calculate(analysis, start, targetZ) {
    const points = [];
    const steps = 100; // Resolution of the curve
    const zDistance = start.z - targetZ;
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps; // Normalized progress from 0.0 to 1.0
      const currentZ = start.z - (zDistance * t);
      
      // Map 't' to the formula's variables to create interesting curves.
      // x acts as a symmetric sweep: -10 to +10
      // y acts as a linear sweep: 0 to 10
      // z acts as the actual depth: 48 to -50
      const scope = { 
        x: (t - 0.5) * 20, 
        y: t * 10,         
        z: currentZ / 10 
      };
      
      let offsetX = 0;
      let offsetY = 0;
      
      try {
        const val = analysis.compiled.evaluate(scope);
        
        if (typeof val === 'number' && !isNaN(val)) {
          // Determine how the value affects the path based on which variables were used.
          // If they used 'x', we apply the result to the horizontal axis.
          // If they used 'y', we apply it to the vertical axis.
          // If they used both or neither, we mix it.
          
          if (analysis.variables.includes('x')) {
            offsetX = val;
          }
          if (analysis.variables.includes('y')) {
            offsetY = val;
          }
          if (analysis.variables.includes('z') || analysis.variables.length === 0) {
            // Apply to both to create spirals or diagonal shifts
            if (!analysis.variables.includes('x')) offsetX = val;
            if (!analysis.variables.includes('y')) offsetY = val;
          }
        }
      } catch (e) {
        // Silently ignore evaluation errors per step (e.g., divide by zero)
      }

      // We scale the offset down slightly, AND we multiply by `t` (progress)
      // This ensures that at t=0, the offset is exactly 0 and it perfectly anchors to the cannon!
      const scaleFactor = 0.5 * Math.pow(t, 1.5);
      
      const rawX = start.x + (offsetX * scaleFactor);
      const rawY = start.y + (offsetY * scaleFactor);

      // Bounce mechanics: Reflect values back into the -50 to 50 bounds
      const pingPong = (val, min, max) => {
        const range = max - min;
        let normalized = val - min;
        const numBounces = Math.floor(Math.abs(normalized) / range);
        normalized = Math.abs(normalized) % (2 * range);
        if (normalized > range) {
          normalized = 2 * range - normalized;
        }
        return normalized + min;
      };

      const finalX = pingPong(rawX, -50, 50);
      const finalY = pingPong(rawY, -50, 50);

      points.push(new THREE.Vector3(finalX, finalY, currentZ));
    }
    
    return points;
  }
}
