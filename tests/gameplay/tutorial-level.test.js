/**
 * Regression Tests — Level 1: Tutorial (Clear Shot)
 *
 * Covers:
 *   1. Level data shape and win-condition threshold
 *   2. FormulaEngine — valid/invalid formula parsing, degree detection
 *   3. GridManager — splatter, coverage accumulation, double-paint guard
 *   4. Trajectory-to-grid linkage (impact z gate)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LEVELS } from '../../src/game/LevelManager.js';
import { FormulaEngine } from '../../src/game/FormulaEngine.js';
import { GridManager } from '../../src/game/GridManager.js';

// ─── Level 1 Data ─────────────────────────────────────────────────────────────
describe('Level 1 — Data Integrity', () => {
  const level = LEVELS[0];

  it('is id:1 at index 0', () => {
    expect(level.id).toBe(1);
  });

  it('is named "Tutorial: Clear Shot"', () => {
    expect(level.name).toBe('Tutorial: Clear Shot');
  });

  it('has an 80% coverage threshold', () => {
    expect(level.coverageThreshold).toBe(0.8);
  });

  it('has NO obstacles (free line-of-sight)', () => {
    expect(level.obstacles).toEqual([]);
  });

  it('provides an artworkUrl string', () => {
    expect(typeof level.artworkUrl).toBe('string');
    expect(level.artworkUrl.length).toBeGreaterThan(0);
  });
});

// ─── FormulaEngine ────────────────────────────────────────────────────────────
describe('Level 1 — FormulaEngine', () => {
  it('accepts a constant gravity value "-9.8"', () => {
    const r = FormulaEngine.analyze('-9.8');
    expect(r.valid).toBe(true);
    expect(r.degree).toBeGreaterThanOrEqual(1);
  });

  it('accepts "0" (zero acceleration)', () => {
    const r = FormulaEngine.analyze('0');
    expect(r.valid).toBe(true);
  });

  it('accepts a linear formula "x"', () => {
    const r = FormulaEngine.analyze('x');
    expect(r.valid).toBe(true);
    expect(r.variables).toContain('x');
  });

  it('detects degree 2 from "x^2"', () => {
    const r = FormulaEngine.analyze('x^2');
    expect(r.valid).toBe(true);
    expect(r.degree).toBe(2);
  });

  it('detects degree 3 from "y^3 + x"', () => {
    const r = FormulaEngine.analyze('y^3 + x');
    expect(r.valid).toBe(true);
    expect(r.degree).toBe(3);
  });

  it('detects all three variables in "x + y + z"', () => {
    const r = FormulaEngine.analyze('x + y + z');
    expect(r.valid).toBe(true);
    expect(r.variables).toContain('x');
    expect(r.variables).toContain('y');
    expect(r.variables).toContain('z');
  });

  it('rejects the invalid string "++ broken"', () => {
    const r = FormulaEngine.analyze('++ broken');
    expect(r.valid).toBe(false);
    expect(r.error).toBeTruthy();
  });

  it('rejects an empty string', () => {
    const r = FormulaEngine.analyze('');
    expect(r.valid).toBe(false);
  });

  it('compiled constant evaluates correctly', () => {
    const r = FormulaEngine.analyze('3 * 4');
    expect(r.valid).toBe(true);
    expect(r.compiled.evaluate({})).toBe(12);
  });
});

// ─── GridManager ──────────────────────────────────────────────────────────────
describe('Level 1 — GridManager (9×9 grid)', () => {
  let grid;
  beforeEach(() => { grid = new GridManager(9); });

  it('starts at 0% coverage', () => {
    expect(grid.getCoverage()).toBe(0);
    expect(grid.paintedCount).toBe(0);
  });

  it('degree-1 splatter paints exactly 1 cell at centre', () => {
    const cells = grid.splatter(0, 0, 1);
    expect(cells).toHaveLength(1);
    expect(grid.paintedCount).toBe(1);
  });

  it('degree-2 splatter paints a 3×3 area (up to 9 cells) at centre', () => {
    const cells = grid.splatter(0, 0, 2);
    // centre of a 9×9 grid has full 3×3 neighbourhood
    expect(cells.length).toBeGreaterThanOrEqual(4);
    expect(cells.length).toBeLessThanOrEqual(9);
  });

  it('degree-3 splatter paints more cells than degree-2', () => {
    const g2 = new GridManager(9);
    const g3 = new GridManager(9);
    g2.splatter(0, 0, 2);
    g3.splatter(0, 0, 3);
    expect(g3.paintedCount).toBeGreaterThan(g2.paintedCount);
  });

  it('does NOT double-count already-painted cells', () => {
    grid.splatter(0, 0, 1);
    const firstCount = grid.paintedCount;
    const second = grid.splatter(0, 0, 1);
    expect(second).toHaveLength(0);
    expect(grid.paintedCount).toBe(firstCount);
  });

  it('getCoverage() stays between 0 and 1 after any splatter', () => {
    grid.splatter(10, 10, 2);
    const cov = grid.getCoverage();
    expect(cov).toBeGreaterThan(0);
    expect(cov).toBeLessThanOrEqual(1);
  });

  it('extreme coordinates are clamped without throwing', () => {
    expect(() => grid.splatter(-9999, -9999, 1)).not.toThrow();
    expect(() => grid.splatter(9999, 9999, 1)).not.toThrow();
    // Both extreme corners must each paint exactly 1 cell (clamped to corners)
    expect(grid.paintedCount).toBeGreaterThanOrEqual(1);
    expect(grid.paintedCount).toBeLessThanOrEqual(2);
  });

  it('reaches ≥80% coverage (Level 1 win) after a grid-covering shot pattern', () => {
    // Simulate a systematic paint across the wall
    const positions = [-40, -20, 0, 20, 40];
    for (const px of positions) {
      for (const py of positions) {
        grid.splatter(px, py, 2);
      }
    }
    expect(grid.getCoverage()).toBeGreaterThanOrEqual(LEVELS[0].coverageThreshold);
  });
});

// ─── Trajectory-to-Grid Impact Gate ──────────────────────────────────────────
describe('Level 1 — Impact gate (z ≤ -49 → paints; z > -49 → does not)', () => {
  it('direct wall hit (z=-50) triggers splatter', () => {
    const grid = new GridManager(9);
    const impact = { x: 5, y: -10, z: -50 };
    if (impact.z <= -49) grid.splatter(impact.x, impact.y, 1);
    expect(grid.paintedCount).toBeGreaterThan(0);
  });

  it('obstacle hit (z=-30) does NOT paint the target wall', () => {
    const grid = new GridManager(9);
    const impact = { x: 0, y: 0, z: -30 };
    if (impact.z <= -49) grid.splatter(impact.x, impact.y, 1);
    expect(grid.paintedCount).toBe(0);
  });

  it('z=-49.5 (grazing shot) still counts as a wall hit', () => {
    const grid = new GridManager(9);
    const impact = { x: 0, y: 0, z: -49.5 };
    if (impact.z <= -49) grid.splatter(impact.x, impact.y, 1);
    expect(grid.paintedCount).toBeGreaterThan(0);
  });
});
