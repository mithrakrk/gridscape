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

      // Calculate final world position
      // We scale the offset down slightly so math results like x^2 (100) don't immediately fly out of bounds
      const scaleFactor = 0.5;
      
      const finalX = start.x + (offsetX * scaleFactor);
      const finalY = start.y + (offsetY * scaleFactor);

      points.push(new THREE.Vector3(finalX, finalY, currentZ));

      // Stop tracing if the trajectory hits a side wall, floor, or ceiling (bounds are -50 to +50)
      if (finalX <= -50 || finalX >= 50 || finalY <= -50 || finalY >= 50) {
        // Clamp the final point exactly to the wall for a clean visual impact
        const clampedX = Math.max(-50, Math.min(50, finalX));
        const clampedY = Math.max(-50, Math.min(50, finalY));
        points[points.length - 1].set(clampedX, clampedY, currentZ);
        break; 
      }
    }
    
    return points;
  }
}
