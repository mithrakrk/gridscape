# System Architecture

## Overview
Gridscape is a browser-based Single Page Application (SPA) without a backend for the MVP. It uses Three.js for 3D rendering and math.js for formula parsing.

## Core Systems
1. **Rendering Engine (Three.js)**: 
   - Cube scene rendering.
   - Turret origin and aim visualization.
   - Target wall grid rendering and artwork reveal system.
   - Obstacle rendering.
2. **Formula Engine (math.js)**:
   - Parser and validator.
   - Expression analyzer (variable extraction, degree calculation).
3. **Trajectory & Impact Solver**:
   - Calculates intersections of the formula constraints with the 3D space and target wall.
4. **Paint Coverage Engine**:
   - Tracks grid state (painted vs unpainted).
   - Handles splash radius application.
   - Maps grid cells to the artwork reveal mask.
5. **Collision System**:
   - Detects intersections between the trajectory and floating obstacles.
6. **Game State & Progression Manager**:
   - Manages UI state (Fire vs Explore mode).
   - Tracks level progression and win conditions.
7. **UI / HUD**:
   - DOM-based overlay for formula input, progress bars, and coordinate logging.

## Modularity
Each system above should be separated into its own module/class (e.g., `Renderer.js`, `FormulaEngine.js`, `GameState.js`) to ensure maintainability.
