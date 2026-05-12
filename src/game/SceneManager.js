import * as THREE from 'three';

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.width = container.clientWidth;
    this.height = container.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#111111');

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

    this.animate = this.animate.bind(this);
    this.renderer.setAnimationLoop(this.animate);

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.5, 200);
    pointLight.position.set(0, 20, 30);
    this.scene.add(pointLight);
    
    // Add a light near the target wall to brighten it up
    const targetLight = new THREE.PointLight(0xffffff, 1.0, 150);
    targetLight.position.set(0, 0, -30);
    this.scene.add(targetLight);
  }

  setupCube() {
    // The interior of the cube
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    
    const forceFieldMaterial = new THREE.MeshPhysicalMaterial({ 
      color: 0x1144ff, 
      emissive: 0x002288,
      emissiveIntensity: 0.8,
      transparent: true, 
      opacity: 0.15,
      side: THREE.BackSide,
      roughness: 0.2
    });

    // Different materials for different faces
    const materials = [
      forceFieldMaterial, // Right
      forceFieldMaterial, // Left
      forceFieldMaterial, // Top
      forceFieldMaterial, // Bottom
      new THREE.MeshStandardMaterial({ color: 0x222222, side: THREE.BackSide }), // Front (Target Wall)
      new THREE.MeshStandardMaterial({ color: 0x111111, side: THREE.BackSide }), // Back (Player Wall)
    ];

    this.cube = new THREE.Mesh(geometry, materials);
    this.scene.add(this.cube);

    // Target wall grid helper
    const gridHelper = new THREE.GridHelper(100, 20, 0x444444, 0x222222);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.z = -49.9;
    this.scene.add(gridHelper);

    // Force field grids for side walls to enhance the glowing effect
    const createWallGrid = () => {
      const grid = new THREE.GridHelper(100, 20, 0x4488ff, 0x113388);
      grid.material.opacity = 0.3;
      grid.material.transparent = true;
      return grid;
    };

    const bottomGrid = createWallGrid();
    bottomGrid.position.y = -49.9;
    this.scene.add(bottomGrid);

    const topGrid = createWallGrid();
    topGrid.position.y = 49.9;
    this.scene.add(topGrid);

    const leftGrid = createWallGrid();
    leftGrid.position.x = -49.9;
    leftGrid.rotation.z = Math.PI / 2;
    this.scene.add(leftGrid);

    const rightGrid = createWallGrid();
    rightGrid.position.x = 49.9;
    rightGrid.rotation.z = Math.PI / 2;
    this.scene.add(rightGrid);
  }

  setupTurret() {
    this.turret = new THREE.Group();
    
    // Base
    const baseGeo = new THREE.SphereGeometry(2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    baseGeo.rotateX(Math.PI / 2); // Mount to back wall
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.3 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    this.turret.add(base);

    // Barrel
    const barrelGeo = new THREE.CylinderGeometry(0.8, 1.2, 6, 16);
    barrelGeo.rotateX(Math.PI / 2); // point forward (along Z axis)
    barrelGeo.translate(0, 0, -3); // move it so base is at origin
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.2 });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    this.turret.add(barrel);

    // Paint edge on muzzle
    const muzzleGeo = new THREE.TorusGeometry(0.8, 0.2, 16, 32);
    const paintColor = 0xff0055; // neon pink paint
    const muzzleMat = new THREE.MeshStandardMaterial({ 
      color: paintColor, 
      emissive: paintColor,
      emissiveIntensity: 0.6,
      roughness: 0.1
    });
    const muzzle = new THREE.Mesh(muzzleGeo, muzzleMat);
    muzzle.position.set(0, 0, -6); // at the tip of the barrel
    this.turret.add(muzzle);

    // Position the whole cannon assembly
    this.turret.position.set(0, -5, 48);
    this.scene.add(this.turret);
  }

  onWindowResize() {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  animate() {
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
