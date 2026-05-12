export const LEVELS = [
  {
    id: 1,
    name: "Tutorial: Clear Shot",
    artworkUrl: "/artwork.png",
    coverageThreshold: 0.8, // 80% to win
    obstacles: []
  },
  {
    id: 2,
    name: "Level 2: The Center Block",
    artworkUrl: "/artwork.png",
    coverageThreshold: 0.7,
    obstacles: [
      // x, y, z, width, height, depth
      { x: 0, y: 0, z: 0, w: 20, h: 20, d: 5 } // Floating barrier in the center
    ]
  },
  {
    id: 3,
    name: "Level 3: Twin Pillars",
    artworkUrl: "/artwork.png",
    coverageThreshold: 0.6,
    obstacles: [
      { x: -20, y: 0, z: -20, w: 10, h: 100, d: 10 }, // Floor to ceiling pillar
      { x: 20, y: 0, z: -20, w: 10, h: 100, d: 10 }
    ]
  },
  {
    id: 4,
    name: "Level 4: The Funnel",
    artworkUrl: "/artwork.png",
    coverageThreshold: 0.5,
    obstacles: [
      { x: 0, y: 30, z: -30, w: 100, h: 40, d: 5 }, // Top blocker
      { x: 0, y: -30, z: -30, w: 100, h: 40, d: 5 }  // Bottom blocker
    ]
  }
];
