import * as THREE from 'three';
import { TrajectorySolver } from './TrajectorySolver';

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.width = container.clientWidth;
    this.height = container.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#f4f4f4');

    // Camera setup (Player is on the inside face of a cube looking inward)
    // Cube size is 100x100x100
    // So camera is at z = 50, looking towards z = -50
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
    this.camera.position.set(0, 0, 50);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    this.setupLighting();
    this.setupCube();
    this.setupTurret();
    this.setupCompass();

    this.animate = this.animate.bind(this);
    this.renderer.setAnimationLoop(this.animate);

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    this.scene.add(ambientLight);

    // Warm gallery overhead light
    const overheadLight = new THREE.PointLight(0xfff5e6, 1.2, 200);
    overheadLight.position.set(0, 40, 0);
    this.scene.add(overheadLight);
    
    // Spotlights pointing at the target wall (artwork)
    const leftSpot = new THREE.SpotLight(0xffffff, 1.5);
    leftSpot.position.set(-30, 30, 20);
    leftSpot.target.position.set(0, 0, -50);
    this.scene.add(leftSpot);
    this.scene.add(leftSpot.target);

    const rightSpot = new THREE.SpotLight(0xffffff, 1.5);
    rightSpot.position.set(30, 30, 20);
    rightSpot.target.position.set(0, 0, -50);
    this.scene.add(rightSpot);
    this.scene.add(rightSpot.target);
  }

  setupCube() {
    // The interior of the cube
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    
    // Museum materials
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xeaeaea, side: THREE.BackSide, roughness: 0.9 });
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x3d2314, side: THREE.BackSide, roughness: 0.1 }); // dark glossy wood
    const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.BackSide, roughness: 1.0 });
    const targetWallMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.BackSide, roughness: 0.5 }); // pristine white for art

    const materials = [
      wallMaterial, // Right
      wallMaterial, // Left
      ceilingMaterial, // Top
      floorMaterial, // Bottom
      targetWallMaterial, // Front (Target Wall)
      wallMaterial, // Back (Player Wall)
    ];

    this.cube = new THREE.Mesh(geometry, materials);
    this.scene.add(this.cube);

    // Target wall grid helper (matches 9x9 size)
    const gridHelper = new THREE.GridHelper(100, 9, 0x999999, 0xbbbbbb);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.z = -49.9;
    this.scene.add(gridHelper);

    // Grand Gold Frame around target wall
    const frameGeo = new THREE.BoxGeometry(104, 104, 2);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3, metalness: 0.8 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.z = -51; 
    this.scene.add(frame);

    // Setup the artwork texture mapping but hide it initially
    const textureLoader = new THREE.TextureLoader();
    this.artworkTexture = textureLoader.load('/artwork.png');
    this.artworkTexture.colorSpace = THREE.SRGBColorSpace;
    
    // Group to hold all painted tiles
    this.paintGroup = new THREE.Group();
    this.paintGroup.position.z = -49.8; // slightly in front of back wall and grid
    this.scene.add(this.paintGroup);
  }

  setupTurret() {
    this.turret = new THREE.Group();
    
    // Base
    const baseGeo = new THREE.SphereGeometry(2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    baseGeo.rotateX(Math.PI / 2); // Mount to back wall
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, metalness: 0.3, roughness: 0.5 }); // light museum stand
    const base = new THREE.Mesh(baseGeo, baseMat);
    this.turret.add(base);

    // Barrel
    const barrelGeo = new THREE.CylinderGeometry(0.8, 1.2, 6, 16);
    barrelGeo.rotateX(Math.PI / 2); // point forward (along Z axis)
    barrelGeo.translate(0, 0, -3); // move it so base is at origin
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.6, roughness: 0.4 }); // lighter metal
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    this.turret.add(barrel);

    // Paint edge on muzzle
    const muzzleGeo = new THREE.TorusGeometry(0.8, 0.2, 16, 32);
    const paintColor = 0x00ccff; // bright cyan paint for contrast
    const muzzleMat = new THREE.MeshStandardMaterial({ 
      color: paintColor, 
      emissive: paintColor,
      emissiveIntensity: 0.4,
      roughness: 0.2
    });
    const muzzle = new THREE.Mesh(muzzleGeo, muzzleMat);
    muzzle.position.set(0, 0, -6); // at the tip of the barrel
    this.turret.add(muzzle);

    // Position the whole cannon assembly
    this.turret.position.set(0, -5, 48);
    this.scene.add(this.turret);
  }

  setupCompass() {
    this.compassGroup = new THREE.Group();
    // Red=X(Right), Green=Y(Up), Blue=Z(Forward/Backward)
    const axesHelper = new THREE.AxesHelper(15);
    this.compassGroup.add(axesHelper);
    // Place it prominently in the bottom left, slightly forward so it doesn't clip
    this.compassGroup.position.set(-35, -40, 20); 
    this.scene.add(this.compassGroup);
  }

  animateBullet(points, onUpdate, onComplete) {
    if (this.bullet) {
      this.scene.remove(this.bullet);
      this.bullet.geometry.dispose();
      this.bullet.material.dispose();
    }
    
    // Multi-colored Shader Paintball
    const geo = new THREE.SphereGeometry(2, 32, 32); 
    const mat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          vec3 color1 = vec3(1.0, 0.0, 0.5); // pink
          vec3 color2 = vec3(0.0, 0.8, 1.0); // cyan
          vec3 color3 = vec3(1.0, 0.8, 0.0); // yellow
          float mix1 = (vNormal.x + 1.0) * 0.5;
          float mix2 = (vNormal.y + 1.0) * 0.5;
          vec3 finalColor = mix(color1, color2, mix1);
          finalColor = mix(finalColor, color3, mix2);
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    });
    this.bullet = new THREE.Mesh(geo, mat);
    this.scene.add(this.bullet);

    if (!this.originalCameraPos) {
      this.originalCameraPos = this.camera.position.clone();
    }

    // Create a 3D curve from the raw math points.
    // This normalizes the physical distance so the bullet doesn't suddenly "jump" when math spikes.
    const curve = new THREE.CatmullRomCurve3(points);

    this.bulletAnim = {
      curve: curve,
      progress: 0,           // normalized distance (0.0 to 1.0)
      velocity: 0,           // starts at 0 speed
      acceleration: 0.00004, // constant physical acceleration (takes ~3 seconds to cross)
      onUpdate: onUpdate,
      onComplete: onComplete
    };
  }

  drawTrajectory(analysis) {
    if (this.trajectoryLine) {
      this.scene.remove(this.trajectoryLine);
      this.trajectoryLine.geometry.dispose();
      this.trajectoryLine.material.dispose();
    }

    const material = new THREE.LineBasicMaterial({
      color: 0xf5f5dc, // translucent beige
      linewidth: 1,    // thin line
      transparent: true,
      opacity: 0.3
    });

    const startPoint = new THREE.Vector3(0, -5, 48); // Turret muzzle
    
    // Use the iterative physics solver to trace the exact curve
    const points = TrajectorySolver.calculate(analysis, startPoint, -50);

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    this.trajectoryLine = new THREE.Line(geometry, material);
    this.scene.add(this.trajectoryLine);
    
    return points;
  }

  addPaintCells(cells, gridSize) {
    const cellSize = 100 / gridSize;
    
    // Use a single basic material that ignores lights for the artwork to pop perfectly
    if (!this.paintMaterial) {
      this.paintMaterial = new THREE.MeshBasicMaterial({ 
        map: this.artworkTexture,
        side: THREE.DoubleSide
      });
    }

    cells.forEach(cell => {
      const geo = new THREE.PlaneGeometry(cellSize, cellSize);
      
      const u = cell.c / gridSize;
      const v = cell.r / gridSize;
      const uSize = 1 / gridSize;
      const vSize = 1 / gridSize;
      
      // Top-left, top-right, bottom-left, bottom-right UVs
      geo.attributes.uv.setXY(0, u, v + vSize);
      geo.attributes.uv.setXY(1, u + uSize, v + vSize);
      geo.attributes.uv.setXY(2, u, v);
      geo.attributes.uv.setXY(3, u + uSize, v);
      geo.attributes.uv.needsUpdate = true;

      const tile = new THREE.Mesh(geo, this.paintMaterial);
      tile.position.x = -50 + (cell.c * cellSize) + (cellSize / 2);
      tile.position.y = -50 + (cell.r * cellSize) + (cellSize / 2);
      
      this.paintGroup.add(tile);
    });
  }

  onWindowResize() {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  animate() {
    if (this.bulletAnim) {
      const { curve, onUpdate, onComplete } = this.bulletAnim;
      
      if (this.bulletAnim.progress < 1.0) {
        // Apply physics: v = v0 + at
        this.bulletAnim.velocity += this.bulletAnim.acceleration;
        this.bulletAnim.progress += this.bulletAnim.velocity;
        
        // Clamp to end
        if (this.bulletAnim.progress > 1.0) {
          this.bulletAnim.progress = 1.0;
        }

        // getPointAt perfectly normalizes physical distance along the arc
        const pt = curve.getPointAt(this.bulletAnim.progress);
        this.bullet.position.copy(pt);
        
        // Camera follows the bullet slightly behind and above
        const camPos = pt.clone().add(new THREE.Vector3(0, 5, 15));
        this.camera.position.lerp(camPos, 0.2);
        this.camera.lookAt(pt);

        if (onUpdate) onUpdate(pt);
      } else {
        const finalPt = curve.getPointAt(1.0);
        if (onComplete) onComplete(finalPt);
        
        // Reset camera
        this.camera.position.copy(this.originalCameraPos);
        this.camera.lookAt(0, 0, -50);
        
        this.scene.remove(this.bullet);
        this.bulletAnim = null;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
