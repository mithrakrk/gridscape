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
    this.setupControls();

    this.mode = 'fire'; // 'fire' or 'explore'
    this.currentLevel = null;
    this.obstaclesGroup = new THREE.Group();
    this.scene.add(this.obstaclesGroup);

    this.particlesGroup = new THREE.Group();
    this.scene.add(this.particlesGroup);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.turretPitch = 0;
    this.turretYaw = 0;
    this.turretX = 0;
    this.turretY = -5;
    this.turretConfig = { power: 50, ax: '0', ay: '-9.8', az: '0' };
    this.currentAnalysis = null;
    this.lastPreviewTime = 0;

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
    
    const textureLoader = new THREE.TextureLoader();
    const carpetTex = textureLoader.load('/carpet.png');
    carpetTex.wrapS = THREE.RepeatWrapping;
    carpetTex.wrapT = THREE.RepeatWrapping;
    carpetTex.repeat.set(4, 4);

    const louvreTex = textureLoader.load('/louvre.png');
    louvreTex.colorSpace = THREE.SRGBColorSpace;

    // Museum materials
    const glassMaterial = new THREE.MeshPhysicalMaterial({ 
      color: 0xffffff, 
      transmission: 0.9, 
      opacity: 1, 
      transparent: true, 
      roughness: 0.05, 
      ior: 1.5,
      side: THREE.BackSide
    });
    
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xeaeaea, side: THREE.BackSide, roughness: 0.9 });
    const floorMaterial = new THREE.MeshStandardMaterial({ map: carpetTex, side: THREE.BackSide, roughness: 0.8 }); // museum carpet
    const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.BackSide, roughness: 1.0 });
    const targetWallMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.BackSide, roughness: 0.5 }); // pristine white for art

    const materials = [
      glassMaterial, // Right
      glassMaterial, // Left
      ceilingMaterial, // Top
      floorMaterial, // Bottom
      targetWallMaterial, // Front (Target Wall)
      wallMaterial, // Back (Player Wall)
    ];

    this.cube = new THREE.Mesh(geometry, materials);
    this.scene.add(this.cube);

    // Add Louvre backdrops outside the glass walls
    const backdropGeo = new THREE.PlaneGeometry(200, 100);
    const backdropMat = new THREE.MeshBasicMaterial({ map: louvreTex, side: THREE.DoubleSide });
    
    const leftBackdrop = new THREE.Mesh(backdropGeo, backdropMat);
    leftBackdrop.position.set(-80, 0, 0); // Outside left wall
    leftBackdrop.rotation.y = Math.PI / 2;
    this.scene.add(leftBackdrop);

    const rightBackdrop = new THREE.Mesh(backdropGeo, backdropMat);
    rightBackdrop.position.set(80, 0, 0); // Outside right wall
    rightBackdrop.rotation.y = -Math.PI / 2;
    this.scene.add(rightBackdrop);

    // Target wall grid helper (matches 9x9 size)
    const gridHelper = new THREE.GridHelper(100, 9, 0x444444, 0x222222);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.z = -49.9;
    this.scene.add(gridHelper);

    // Add grids to ceiling and floor
    const floorGrid = new THREE.GridHelper(100, 10, 0xffffff, 0x888888);
    floorGrid.position.y = -49.9;
    this.scene.add(floorGrid);

    const ceilingGrid = new THREE.GridHelper(100, 10, 0x444444, 0xdddddd);
    ceilingGrid.position.y = 49.9;
    this.scene.add(ceilingGrid);

    // Grand Gold Frame around target wall
    const frameGeo = new THREE.BoxGeometry(104, 104, 2);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3, metalness: 0.8 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.z = -51; 
    this.scene.add(frame);

    // Add Direction Labels to the walls to help users
    this.addWallLabel("+X (Right)", 49.8, 0, 0, 0, -Math.PI/2, 0);
    this.addWallLabel("-X (Left)", -49.8, 0, 0, 0, Math.PI/2, 0);
    this.addWallLabel("+Y (Up)", 0, 49.8, 0, Math.PI/2, 0, 0);
    this.addWallLabel("-Y (Down)", 0, -49.8, 0, -Math.PI/2, 0, 0);

    // Setup the artwork texture mapping but hide it initially
    this.artworkTexture = textureLoader.load('/artwork.png');
    this.artworkTexture.colorSpace = THREE.SRGBColorSpace;
    this.loadArtworkData();
    
    // Group to hold all painted tiles
    this.paintGroup = new THREE.Group();
    this.paintGroup.position.z = -49.8; // slightly in front of back wall and grid
    this.scene.add(this.paintGroup);
  }

  loadArtworkData() {
    const img = new Image();
    img.src = '/artwork.png';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      this.artworkPixels = ctx.getImageData(0, 0, img.width, img.height);
    };
  }

  getArtworkColor(x, y) {
    if (!this.artworkPixels) return new THREE.Color(0x00ccff); // default
    const u = (x + 50) / 100;
    const v = (y + 50) / 100;
    // Y is inverted in canvas vs 3D UV
    const px = Math.floor(u * this.artworkPixels.width);
    const py = Math.floor((1 - v) * this.artworkPixels.height);
    
    // clamp
    const safeX = Math.max(0, Math.min(this.artworkPixels.width - 1, px));
    const safeY = Math.max(0, Math.min(this.artworkPixels.height - 1, py));
    
    const idx = (safeY * this.artworkPixels.width + safeX) * 4;
    const r = this.artworkPixels.data[idx];
    const g = this.artworkPixels.data[idx+1];
    const b = this.artworkPixels.data[idx+2];
    
    return new THREE.Color(r/255, g/255, b/255);
  }

  addWallLabel(text, x, y, z, rotX, rotY, rotZ) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 60px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width/2, canvas.height/2);

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
    const geo = new THREE.PlaneGeometry(40, 10);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rotX, rotY, rotZ);
    this.scene.add(mesh);
  }

  setupTurret() {
    this.turret = new THREE.Group();
    
    // Stand/Mount to wall
    const mountGeo = new THREE.CylinderGeometry(1.5, 2, 2, 16);
    mountGeo.rotateX(Math.PI / 2);
    const darkMetal = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.2 });
    const mount = new THREE.Mesh(mountGeo, darkMetal);
    mount.position.set(0, 0, 1);
    this.turret.add(mount);

    // Gun Body (Receiver)
    const bodyGeo = new THREE.BoxGeometry(2, 4, 6);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.5, roughness: 0.5 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, 0, -2);
    this.turret.add(body);

    // Barrel
    const barrelGeo = new THREE.CylinderGeometry(0.4, 0.4, 8, 16);
    barrelGeo.rotateX(Math.PI / 2);
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.9, roughness: 0.1 });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.position.set(0, 0.5, -9);
    this.turret.add(barrel);

    // Air Tank (back)
    const tankGeo = new THREE.CylinderGeometry(1.5, 1.5, 6, 16);
    tankGeo.rotateX(Math.PI / 2);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.7, roughness: 0.3 });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(0, -1, 4);
    this.turret.add(tank);
    
    // Tank dome
    const tankDomeGeo = new THREE.SphereGeometry(1.5, 16, 16);
    const tankDome = new THREE.Mesh(tankDomeGeo, tankMat);
    tankDome.position.set(0, -1, 7);
    this.turret.add(tankDome);

    // Hopper (Paintball loader)
    const hopperGeo = new THREE.CylinderGeometry(1.5, 0.5, 3, 16);
    const hopperMat = new THREE.MeshStandardMaterial({ color: 0x00ccff, transparent: true, opacity: 0.8, roughness: 0.1 });
    const hopper = new THREE.Mesh(hopperGeo, hopperMat);
    hopper.position.set(0, 3.5, -1);
    this.turret.add(hopper);
    
    // Hopper lid
    const lidGeo = new THREE.SphereGeometry(1.5, 16, 16, 0, Math.PI*2, 0, Math.PI/2);
    const lidMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const lid = new THREE.Mesh(lidGeo, lidMat);
    lid.position.set(0, 5, -1);
    this.turret.add(lid);

    // Scale it down!
    this.turret.scale.set(0.5, 0.5, 0.5);

    // FPS View: Attach turret to the camera so it acts like a weapon in your hands!
    this.turret.position.set(1.5, -2.5, -5); // Place it down, forward, and slightly to the RIGHT so you can see it!
    this.turret.rotation.set(0, 0, 0); // Straight ahead relative to camera
    
    this.camera.add(this.turret);
    this.scene.add(this.camera);
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

  setupControls() {
    this.keys = { w:false, a:false, s:false, d:false, q:false, e:false, arrowup:false, arrowdown:false, arrowleft:false, arrowright:false, shift:false, " ":false };
    
    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if(this.keys.hasOwnProperty(k)) this.keys[k] = true;
      if (e.key === " ") this.keys[" "] = true;
    });
    
    window.addEventListener('keyup', (e) => {
      const k = e.key.toLowerCase();
      if(this.keys.hasOwnProperty(k)) this.keys[k] = false;
      if (e.key === " ") this.keys[" "] = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.mode !== 'fire') return;
      const ndcX = (e.clientX / window.innerWidth) * 2 - 1;
      const ndcY = -(e.clientY / window.innerHeight) * 2 + 1;
      
      this.turretYaw = -ndcX * 60; 
      this.turretPitch = ndcY * 60; 
      
      // Update camera rotation directly
      this.camera.rotation.set(
        THREE.MathUtils.degToRad(this.turretPitch),
        THREE.MathUtils.degToRad(-this.turretYaw),
        0,
        'YXZ'
      );
      
      if (this.currentAnalysis) {
        const now = Date.now();
        if (now - this.lastPreviewTime > 150) {
          this.lastPreviewTime = now;
          this.drawTrajectory(this.currentAnalysis);
        }
      }
    });
  }

  setMode(mode) {
    this.mode = mode;
    // Camera is automatically synced to the gun in animate() for fire mode!
  }

  updateTurretConfig(config) {
    this.turretConfig = { ...this.turretConfig, ...config };
    // We no longer update pitch/yaw/gunX/gunY from config because they are controlled by mouse/wasd!
    // But we still save it for power and ax/ay/az formulas.
    if (this.currentAnalysis) {
      this.currentAnalysis.config = {
        ...this.currentAnalysis.config,
        ...config,
        gunX: this.turretX,
        gunY: this.turretY,
        pitch: this.turretPitch,
        yaw: this.turretYaw
      };
      this.drawTrajectory(this.currentAnalysis);
    }
  }

  loadLevel(levelData) {
    this.currentLevel = levelData;
    
    // Clear old obstacles
    this.obstaclesGroup.clear();
    
    // Clear old paint tiles
    if (this.paintGroup) {
      this.paintGroup.children.forEach(child => {
        child.geometry.dispose();
      });
      this.paintGroup.clear();
    }
    
    if (this.trajectoryLine) {
      this.scene.remove(this.trajectoryLine);
      this.trajectoryLine = null;
    }

    const palette = [0xff0055, 0x00ccff, 0xffaa00, 0xaa00ff, 0x00ffaa];

    levelData.obstacles.forEach((obs, index) => {
      const color = palette[index % palette.length];
      const geo = new THREE.BoxGeometry(obs.w, obs.h, obs.d);
      const obsMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.4, metalness: 0.1 });
      const mesh = new THREE.Mesh(geo, obsMat);
      mesh.position.set(obs.x, obs.y, obs.z);
      
      mesh.userData = {
        baseY: obs.y,
        phase: Math.random() * Math.PI * 2,
        speed: 0.002 + Math.random() * 0.001
      };
      
      this.obstaclesGroup.add(mesh);
    });
  }

  animateBullet(points, onUpdate, onComplete) {
    if (this.bullet) {
      this.scene.remove(this.bullet);
      this.bullet.geometry.dispose();
      this.bullet.material.dispose();
    }
    
    const lastPoint = points[points.length - 1];
    let hitColor = new THREE.Color(0x00ccff);
    if (lastPoint.z <= -49) {
      hitColor = this.getArtworkColor(lastPoint.x, lastPoint.y);
    }

    const geo = new THREE.CylinderGeometry(0.5, 0.5, 3, 16);
    geo.rotateX(Math.PI / 2); // point forward
    const mat = new THREE.MeshStandardMaterial({ 
      color: hitColor, 
      emissive: hitColor, 
      emissiveIntensity: 0.8,
      roughness: 0.2, 
      metalness: 0.8 
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
      progress: 0,           
      velocity: 0.005,       // constant speed along the path since path handles the physics arc!
      acceleration: 0,
      cameraTarget: this.camera.position.clone(),
      onUpdate: onUpdate,
      onComplete: onComplete
    };
  }

  drawTrajectory(analysis) {
    this.currentAnalysis = analysis;
    if (this.trajectoryLine) {
      this.scene.remove(this.trajectoryLine);
      this.trajectoryLine.geometry.dispose();
      this.trajectoryLine.material.dispose();
    }

    // Merge UI config with physical turret state
    const config = {
      ...(analysis.config || this.turretConfig || { power: 50 }),
      gunX: this.turretX,
      gunY: this.turretY,
      pitch: this.turretPitch,
      yaw: this.turretYaw
    };
    analysis.config = config;

    // Calculate exact muzzle position in world space for physics
    this.camera.updateMatrixWorld(true);
    const startPoint = new THREE.Vector3(0, -1.75, -9.5); // exact barrel tip relative to camera
    startPoint.applyMatrix4(this.camera.matrixWorld);

    const obstacles = this.currentLevel ? this.currentLevel.obstacles : [];
    const points = TrajectorySolver.calculate(analysis, startPoint, -50, obstacles);

    const pathCurve = new THREE.CatmullRomCurve3(points);
    // Reduced tube width to 0.25
    const geometry = new THREE.TubeGeometry(pathCurve, Math.max(20, points.length * 2), 0.25, 8, false);
    
    const lastPoint = points[points.length - 1];
    let hitColor = new THREE.Color(0x00ccff);
    if (lastPoint.z <= -49) {
      hitColor = this.getArtworkColor(lastPoint.x, lastPoint.y);
    }

    const material = new THREE.MeshStandardMaterial({
      color: hitColor, 
      emissive: hitColor,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.6,
      roughness: 0.1
    });

    this.trajectoryLine = new THREE.Mesh(geometry, material);
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
    // Float obstacles
    const now = Date.now();
    this.obstaclesGroup.children.forEach(mesh => {
      if (mesh.userData.baseY !== undefined) {
        mesh.position.y = mesh.userData.baseY + Math.sin(now * mesh.userData.speed + mesh.userData.phase) * 2;
      }
    });

    if (this.mode === 'explore') {
      this.updateExploreCamera();
    } else if (this.mode === 'fire' && !this.bulletAnim) {
      if (!document.activeElement || document.activeElement.tagName !== 'INPUT') {
        const speed = 1.0;
        if (this.keys.w || this.keys.arrowup) this.turretY = Math.min(45, this.turretY + speed);
        if (this.keys.s || this.keys.arrowdown) this.turretY = Math.max(-45, this.turretY - speed);
        if (this.keys.a || this.keys.arrowleft) this.turretX = Math.max(-45, this.turretX - speed);
        if (this.keys.d || this.keys.arrowright) this.turretX = Math.min(45, this.turretX + speed);
      }

      // FPS POV: Camera is the player's head, placed at the turret position
      this.camera.position.set(this.turretX, this.turretY, 48);

      // Update preview if moved
      if (this.currentAnalysis && (this.keys.w || this.keys.s || this.keys.a || this.keys.d || this.keys.arrowup || this.keys.arrowdown || this.keys.arrowleft || this.keys.arrowright)) {
        const now = Date.now();
        if (now - this.lastPreviewTime > 150) {
          this.lastPreviewTime = now;
          this.drawTrajectory(this.currentAnalysis);
        }
      }
    }

    if (this.bulletAnim && this.mode === 'fire') {
      const { curve, onUpdate, onComplete } = this.bulletAnim;
      
      if (this.bulletAnim.falling) {
        // Bounce and fall physics
        this.bulletAnim.fallVelocity.y -= 0.03; // Gravity
        this.bullet.position.add(this.bulletAnim.fallVelocity);
        
        // Bounce on floor
        if (this.bullet.position.y <= -48) {
          this.bullet.position.y = -48;
          this.bulletAnim.fallVelocity.y *= -0.5; // lose energy
          this.bulletAnim.fallVelocity.x *= 0.8;
          this.bulletAnim.fallVelocity.z *= 0.8;
          
          if (Math.abs(this.bulletAnim.fallVelocity.y) < 0.1 && Math.abs(this.bulletAnim.fallVelocity.x) < 0.1) {
            // Stop completely
            if (onComplete) onComplete(this.bullet.position);
            
            this.scene.remove(this.bullet);
            this.bulletAnim = null;
          }
        }
        
        if (this.bulletAnim) {
          // Camera follow fall smoothly
          const camPos = this.bullet.position.clone().add(new THREE.Vector3(0, 10, 20));
          this.camera.position.lerp(camPos, 0.05);
          this.bulletAnim.cameraTarget.lerp(this.bullet.position, 0.1);
          this.camera.lookAt(this.bulletAnim.cameraTarget);
          if (onUpdate) onUpdate(this.bullet.position);
        }
      } else if (this.bulletAnim.progress < 1.0) {
        // Apply physics: v = v0 + at
        // Fast forward if spacebar is held!
        const accelMultiplier = this.keys[" "] ? 5.0 : 1.0;
        this.bulletAnim.velocity += (this.bulletAnim.acceleration * accelMultiplier);
        this.bulletAnim.progress += this.bulletAnim.velocity;
        
        // Clamp to end
        if (this.bulletAnim.progress >= 1.0) {
          this.bulletAnim.progress = 1.0;
        }

        const pt = curve.getPointAt(this.bulletAnim.progress);
        const nextPt = curve.getPointAt(Math.min(1.0, this.bulletAnim.progress + 0.01));
        this.bullet.position.copy(pt);
        this.bullet.lookAt(nextPt); // physically point forward
        
        // Camera smooth follow
        const camPos = pt.clone().add(new THREE.Vector3(0, 8, 20));
        this.camera.position.lerp(camPos, 0.05);
        this.bulletAnim.cameraTarget.lerp(pt, 0.1);
        this.camera.lookAt(this.bulletAnim.cameraTarget);

        if (onUpdate) onUpdate(pt);
        
        if (this.bulletAnim.progress >= 1.0) {
          const finalPt = curve.getPointAt(1.0);
          
          if (finalPt.z > -49) {
            // Hit an obstacle!
            if (this.createExplosion) this.createExplosion(finalPt);
            
            // Transition to falling
            this.bulletAnim.falling = true;
            const prevPt = curve.getPointAt(0.99);
            const dir = finalPt.clone().sub(prevPt).normalize();
            
            this.bulletAnim.fallVelocity = new THREE.Vector3(
              dir.x * 0.5 + (Math.random() - 0.5) * 0.5,
              Math.abs(dir.y * 0.2) + 0.5, // bounce up
              -dir.z * 0.5 // reflect back
            );
          } else {
            // Hit target wall
            if (onComplete) onComplete(finalPt);
            
            this.scene.remove(this.bullet);
            this.bulletAnim = null;
          }
        }
      }
    }

    // Update particles
    this.particlesGroup.children.forEach(p => {
      const positions = p.geometry.attributes.position.array;
      const vels = p.userData.velocities;
      for(let i=0; i<vels.length; i++) {
        positions[i*3] += vels[i].x;
        positions[i*3+1] += vels[i].y;
        positions[i*3+2] += vels[i].z;
      }
      p.geometry.attributes.position.needsUpdate = true;
      p.userData.life -= 0.02;
      p.material.opacity = p.userData.life;
      if (p.userData.life <= 0) {
        this.particlesGroup.remove(p);
        p.geometry.dispose();
        p.material.dispose();
      }
    });

    this.renderer.render(this.scene, this.camera);
  }

  updateExploreCamera() {
    const speed = this.keys.shift ? 4.0 : 1.0;
    if (this.keys.w || this.keys.arrowup) this.camera.position.z -= speed;
    if (this.keys.s || this.keys.arrowdown) this.camera.position.z += speed;
    if (this.keys.a || this.keys.arrowleft) this.camera.position.x -= speed;
    if (this.keys.d || this.keys.arrowright) this.camera.position.x += speed;
    if (this.keys.e) this.camera.position.y += speed; // up
    if (this.keys.q) this.camera.position.y -= speed; // down

    // Keep camera inside the room
    this.camera.position.x = Math.max(-49, Math.min(49, this.camera.position.x));
    this.camera.position.y = Math.max(-49, Math.min(49, this.camera.position.y));
    this.camera.position.z = Math.max(-49, Math.min(49, this.camera.position.z));
  }

  getRaycastCell() {
    if (this.mode !== 'explore') return null;
    this.raycaster.setFromCamera(this.centerCoord, this.camera);
    // Find intersection with the back wall (z = -50)
    const wallPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 50);
    const target = new THREE.Vector3();
    if (this.raycaster.ray.intersectPlane(wallPlane, target)) {
      if (target.x >= -50 && target.x <= 50 && target.y >= -50 && target.y <= 50) {
        return target;
      }
    }
    return null;
  }

  destroy() {
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
