# Game Design: Gridscape

## Core Gameplay Loop
1. The player observes the target grid on the opposing wall of the cube.
2. The player inputs a mathematical formula using `x`, `y`, and `z`.
3. The game parses the formula, extracting variable count and polynomial degree.
4. The player previews the shot's trajectory.
5. The player fires the shot from the turret.
6. The impact hits the target wall grid, painting an area and revealing artwork.
7. The level is completed when the entire grid is painted.

## Game Modes

### Fire Mode
- **Input**: Formula text box for x, y, z.
- **Actions**: Parse/Preview button, Fire button.
- **HUD**: Target wall coverage progress, feedback for variables used, degree, impact centers, and splash radius.

### Explore Mode
- **Input**: Arrow-key navigation.
- **Action**: Trace a path from the turret toward the opposite wall.
- **HUD**: Live coordinate list shown in a right-side panel, blocked cells, and wall intersections indicated.

## UX & Aesthetics
- **Theme**: Dark theme with high-contrast paint colors.
- **UI**: Smooth, modern, minimal.
- **Camera**: Polished transitions, no twitchy movements. Turret and target grid must always be visible/legible.
- **Controls**: Keyboard shortcuts for switching modes and firing.
