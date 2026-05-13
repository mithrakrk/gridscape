# Architectural Decision Records (ADRs)

## Active Decisions

### ADR-001: Use Markdown for Persistent Memory
- **Date**: 2026-05-12
- **Context**: Need a way for AI agents to maintain context across sessions.
- **Decision**: Store all context, progress, and rules in structured markdown files in the `docs/` and `.agents/` directories.
- **Consequences**: Agents will need to read/write these files systematically.

### ADR-002: Use Three.js for Rendering
- **Date**: 2026-05-12
- **Decision**: Use Three.js for all 3D scene management and rendering.
- **Reasoning**: It's the industry standard for WebGL, providing the necessary tools for geometry, cameras, and materials needed for the cube scene.

### ADR-003: Use math.js for Formula Parsing
- **Date**: 2026-05-12
- **Decision**: Integrate math.js for formula evaluation.
- **Reasoning**: It provides robust expression parsing, variable extraction, and algebraic manipulation necessary for the math rules.

### ADR-004: Client-side Only MVP
- **Date**: 2026-05-12
- **Decision**: The MVP will have no backend.
- **Reasoning**: Speeds up development and simplifies deployment. All level data and logic will run in the browser.

### ADR-005: Trick-Shot Physics & Ricochet Mechanics
- **Date**: 2026-05-13
- **Context**: The user decided the game should support trick shots where paintballs bounce off obstacles to reach the target wall, rather than failing upon hitting an obstacle.
- **Decision**: Update `TrajectorySolver.js` to compute ricochets step-by-step. The solver will track an axis-flip state (`flipX, flipY, flipZ`) that inverts upon boundary or obstacle collision.
- **Consequences**: This adds complexity to the solver and makes the trajectory preview dynamic and jagged, enhancing the puzzle gameplay significantly.
