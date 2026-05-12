# Manual Test Scenarios

## Summary
This document tracks manual acceptance tests and visual checks for Gridscape. Automated unit and integration tests are located in the `tests/` directory.

## Fire Mode Visuals
- [ ] Turret tracks to the center of the viewport or origin point.
- [ ] Formula input overlay is legible against the dark background.
- [ ] Progress bar accurately reflects the percentage of grid covered.
- [ ] Trajectory ghost line displays correctly before firing.

## Target Grid & Reveal
- [ ] Painted cells correctly map to the underlying artwork.
- [ ] Partially completed grids do not show bleeding from unpainted cells.
- [ ] The completed level screen cleanly presents the full artwork without the grid overlay.

## Explore Mode
- [ ] Arrow keys navigate the camera smoothly.
- [ ] Live coordinate list updates accurately and performs without lag.
- [ ] Blocked cells provide a clear visual indicator when approached.
