# Changelog

## [Unreleased] - 2026-05-16
### Fixed
- Resolved Vercel deployment failure by adding root configuration (`vercel.json` and `package.json`) to correctly handle the `Gridscape` project subdirectory.
### Added
- Comprehensive documentation for the "Gridscape" project (`project-brief.md`, `game-design.md`, `math-rules.md`, `level-design.md`).
- Specific skill definitions for gameplay systems and level design.
- Initialized React + Vite application.
- `SceneManager.js` implementing the basic interior cube, target wall grid, and player turret using Three.js.
- `GameCanvas.jsx` React component to wrap the Three.js renderer.
- **Aesthetics Polish**: Added AI-generated museum textures (carpet floor, Louvre glass walls), GridHelpers to the ceiling and floor, bouncing gravity physics for paintballs hitting obstacles, and vibrant sine-wave floating animations for obstacle blocks.
- **Visual Polish**: Upgraded the trajectory preview to a thick TubeGeometry roadway, implemented smooth camera interpolation to eliminate flickering during bullet flight, and restyled the bullet to a sleek cylinder that dynamically colors itself based on the target artwork tile it will hit.

### Changed
- Refocused project goals to building the Gridscape 3D math puzzle game.
