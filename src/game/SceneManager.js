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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(0, 0, 40);
    this.scene.add(pointLight);
  }

  setupCube() {
    // The interior of the cube
    // We make a large cube and set material side to BackSide so we see it from inside
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    
    // Different materials for different faces so it's easier to see
    const materials = [
      new THREE.MeshStandardMaterial({ color: 0x333333, side: THREE.BackSide }), // Right
      new THREE.MeshStandardMaterial({ color: 0x333333, side: THREE.BackSide }), // Left
      new THREE.MeshStandardMaterial({ color: 0x333333, side: THREE.BackSide }), // Top
      new THREE.MeshStandardMaterial({ color: 0x333333, side: THREE.BackSide }), // Bottom
      new THREE.MeshStandardMaterial({ color: 0x222222, side: THREE.BackSide }), // Front (Target Wall)
      new THREE.MeshStandardMaterial({ color: 0x111111, side: THREE.BackSide }), // Back (Player Wall)
    ];

    this.cube = new THREE.Mesh(geometry, materials);
    this.scene.add(this.cube);

    // Target wall grid helper
    const gridHelper = new THREE.GridHelper(100, 20, 0x444444, 0x222222);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.z = -49.9; // Just slightly in front of the back wall
    this.scene.add(gridHelper);
  }

  setupTurret() {
    // A visible turret mounted on the player's wall (z = 50)
    // We position it slightly below the camera
    const geometry = new THREE.CylinderGeometry(1, 2, 5, 16);
    geometry.rotateX(Math.PI / 2); // Point it forward
    const material = new THREE.MeshStandardMaterial({ color: 0x00ffcc });
    
    this.turret = new THREE.Mesh(geometry, material);
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
