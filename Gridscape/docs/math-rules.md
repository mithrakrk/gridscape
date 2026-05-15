# Mathematical Rules System

## Variables and Centers
The number of unique variables (x, y, z) in the formula determines the number of impact centers created on the opposing wall:
- **1 Variable**: 1 impact center.
- **2 Variables**: 2 linked centers.
- **3 Variables**: 3 linked centers or a short cluster.

## Polynomial Degree and Splash Radius
The highest polynomial degree in the formula determines the splash radius:
- **Degree 1**: Radius 0 -> 1 painted cell.
- **Degree 2**: Radius 1 -> 3x3 painted area.
- **Degree 3**: Radius 2 -> 5x5 painted area.

## Formula Parsing
- **Engine**: math.js
- **Process**: 
  1. Parse input string into a syntax tree.
  2. Extract unique variables.
  3. Determine the maximum degree of any term.
  4. Evaluate the formula as a geometric constraint in 3D space to calculate the intersection with the target wall.

## Paint Coverage
- Overlapping paint counts only once toward total grid coverage.
- Floating obstacles inside the cube can block paths, reducing effective coverage.
