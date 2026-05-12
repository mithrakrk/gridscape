# Context Handoff

## Current Context
- **Last Action Taken**: Built the `FormulaEngine` using `math.js`, added the `FireModeUI` overlay, and connected it to `SceneManager` to draw an MVP trajectory ghost line based on evaluating the math formula.
- **Current Blockers**: None.
- **Open Questions**: How should the trajectory curve based on the variables used? Should `y` affect vertical arc, `x` affect horizontal curve, etc.?

## Next Steps
- Implement an iterative solver to trace the exact curve of the paint shot from the turret to the target wall.
- Calculate exact grid impact coordinates based on the raycast/trajectory intersection.
- Trigger paint logic based on the formula degree (splash radius).
