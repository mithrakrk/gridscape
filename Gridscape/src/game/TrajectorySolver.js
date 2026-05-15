import * as THREE from 'three';

export class TrajectorySolver {
  /**
   * Calculates the flight path of the paint shot based on Newtonian physics.
   * @param {Object} analysis - The compiled math.js result with config
   * @param {THREE.Vector3} start - The origin point (turret)
   * @param {number} targetZ - The z-coordinate of the target wall
   * @param {Array} obstacles - Array of obstacle bounding boxes
   * @returns {THREE.Vector3[]} Array of points defining the trajectory curve
   */
  static calculate(analysis, start, targetZ, obstacles = []) {
    const config = analysis.config || { pitch: 0, yaw: 0, power: 50 };
    const points = [start.clone()];
    const dt = 0.05; // simulation time step
    
    // Convert pitch and yaw to radians
    const pitchRad = THREE.MathUtils.degToRad(config.pitch || 0);
    const yawRad = THREE.MathUtils.degToRad(config.yaw || 0);
    const power = config.power || 50;
    
    // Initial velocity vector
    // Z is forward (towards -50), so negative Z
    // Yaw rotates around Y axis (Left/Right)
    // Pitch rotates around X axis (Up/Down)
    const v = new THREE.Vector3(
      Math.sin(yawRad) * Math.cos(pitchRad),
      Math.sin(pitchRad),
      -Math.cos(yawRad) * Math.cos(pitchRad)
    ).normalize().multiplyScalar(power);
    
    let p = start.clone();
    let t = 0;
    const maxSteps = 1000;
    
    let flipX = 1;
    let flipY = 1;
    let flipZ = 1;

    for (let i = 0; i < maxSteps; i++) {
      const scope = { t: t, x: p.x, y: p.y, z: p.z, vx: v.x, vy: v.y, vz: v.z };
      
      let ax = 0, ay = 0, az = 0;
      try {
        if (analysis.xCompiled) ax = analysis.xCompiled.evaluate(scope) || 0;
        if (analysis.yCompiled) ay = analysis.yCompiled.evaluate(scope) || 0;
        if (analysis.zCompiled) az = analysis.zCompiled.evaluate(scope) || 0;
      } catch (e) {}

      // Apply acceleration to velocity
      v.x += ax * dt * flipX;
      v.y += ay * dt * flipY;
      v.z += az * dt * flipZ;
      
      // Apply velocity to position
      let nextX = p.x + v.x * dt;
      let nextY = p.y + v.y * dt;
      let nextZ = p.z + v.z * dt;
      
      // Wall collisions (bounce)
      if (nextX > 50 || nextX < -50) { 
        flipX *= -1; 
        v.x *= -0.8; // Lose energy
        nextX = p.x + v.x * dt; 
      }
      if (nextY > 50 || nextY < -50) { 
        flipY *= -1; 
        v.y *= -0.8; 
        nextY = p.y + v.y * dt; 
      }
      if (nextZ > 50) { 
        flipZ *= -1; 
        v.z *= -0.8; 
        nextZ = p.z + v.z * dt; 
      } 
      
      // Target wall
      if (nextZ <= -49.5) {
        points.push(new THREE.Vector3(nextX, nextY, -50));
        break;
      }

      // Obstacle collisions
      let hitObs = null;
      for (const obs of obstacles) {
        if (Math.abs(nextX - obs.x) <= obs.w / 2 &&
            Math.abs(nextY - obs.y) <= obs.h / 2 &&
            Math.abs(nextZ - obs.z) <= obs.d / 2) {
          hitObs = obs;
          break;
        }
      }

      if (hitObs) {
        const dx = (p.x - hitObs.x) / (hitObs.w / 2);
        const dy = (p.y - hitObs.y) / (hitObs.h / 2);
        const dz = (p.z - hitObs.z) / (hitObs.d / 2);
        
        const adx = Math.abs(dx);
        const ady = Math.abs(dy);
        const adz = Math.abs(dz);

        if (adx >= ady && adx >= adz) {
          flipX *= -1;
          v.x *= -0.8;
          nextX = p.x; 
        } else if (ady >= adx && ady >= adz) {
          flipY *= -1;
          v.y *= -0.8;
          nextY = p.y;
        } else {
          flipZ *= -1;
          v.z *= -0.8;
          nextZ = p.z;
        }
      }

      p.set(nextX, nextY, nextZ);
      points.push(p.clone());
      t += dt;

      // Stop if it runs out of energy (too slow)
      if (v.length() < 0.5) {
        break;
      }
    }
    
    return points;
  }
}
