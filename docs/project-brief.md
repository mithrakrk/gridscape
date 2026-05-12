# Project Brief: Gridscape

## Summary
Gridscape is a browser-based 3D math puzzle game where the player is positioned inside a cube. Using a visible turret, the player fires paint shots at the opposite wall by entering mathematical formulas (using x, y, z). The goal is to completely cover the opposing wall's grid with paint to reveal a hidden artwork.

## Core Objectives
- Create a playable 3D cube scene using Three.js.
- Implement a formula parsing and trajectory solving system using math.js.
- Develop a grid-based paint coverage system that progressively reveals hidden artwork.
- Implement an Explore Mode to trace paths from the turret to the wall.
- Provide a smooth, modern, minimal dark-themed UI.

## Scope (MVP)
- One playable cube scene with a visible turret.
- Formula parsing and validation (1-3 variables, degree 1-3).
- Single shot firing with trajectory ghost preview.
- Paint coverage tracking with win condition.
- Arrow-key trace navigation in Explore Mode with coordinate log.
- First 5 solvable levels featuring famous-art-inspired reveal targets.
- Obstacle-free early levels and simple blockers in later levels.
- Desktop-first support with keyboard shortcuts.

## Success Metrics
- Formula parsing correctly interprets mathematical constraints and translates them into 3D impacts.
- Paint splash radius and impact centers accurately reflect the variable count and polynomial degree.
- The player can fully reveal the underlying artwork to complete a level.
- Smooth performance with Three.js rendering.
