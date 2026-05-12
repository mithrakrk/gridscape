export class GridManager {
  constructor(size = 9) {
    this.size = size;
    // 2D array: grid[row][col]
    this.grid = Array.from({ length: size }, () => Array(size).fill(false));
    this.paintedCount = 0;
  }

  splatter(impactX, impactY, degree) {
    // Map -50..50 to 0..size
    // impactX: -50 -> col 0, 50 -> col 19
    // impactY: -50 -> row 0, 50 -> row 19
    
    const cx = Math.max(-50, Math.min(49.99, impactX));
    const cy = Math.max(-50, Math.min(49.99, impactY));

    const col = Math.floor(((cx + 50) / 100) * this.size);
    const row = Math.floor(((cy + 50) / 100) * this.size);

    let radius = 0; // degree 1 is 1x1
    if (degree === 2) radius = 1; // 3x3
    if (degree >= 3) radius = 2; // 5x5

    const newPaints = [];

    for (let r = row - radius; r <= row + radius; r++) {
      for (let c = col - radius; c <= col + radius; c++) {
        if (r >= 0 && r < this.size && c >= 0 && c < this.size) {
          if (!this.grid[r][c]) {
            this.grid[r][c] = true;
            this.paintedCount++;
            newPaints.push({ r, c });
          }
        }
      }
    }

    return newPaints;
  }

  getCoverage() {
    return this.paintedCount / (this.size * this.size);
  }
}
