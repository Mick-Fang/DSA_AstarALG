// AStarLogic.js

class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    enqueue(item, priority) {
        this.elements.push({ item, priority });
        // Simple sort for Min-Heap simulation (O(N log N) per insert, could be optimized with real heap but okay for small grids)
        this.elements.sort((a, b) => a.priority - b.priority);
    }

    dequeue() {
        return this.elements.shift().item;
    }

    isEmpty() {
        return this.elements.length === 0;
    }
}

class MapGenerator {
    /**
     * @param {number} rows 
     * @param {number} cols 
     * @param {number} obstacleDensity - 0.0 to 1.0 (e.g. 0.2 for 20% obstacles)
     * @returns {Object} { grid, start, end }
     */
    static generateRandomMap(rows, cols, obstacleDensity = 0.2) {
        const grid = [];
        for (let r = 0; r < rows; r++) {
            const row = [];
            for (let c = 0; c < cols; c++) {
                // 0: empty, 1: obstacle
                row.push(Math.random() < obstacleDensity ? 1 : 0);
            }
            grid.push(row);
        }

        // Randomly pick start and end ensuring they are empty and not the same
        let start = { r: Math.floor(Math.random() * rows), c: Math.floor(Math.random() * cols) };
        let end = { r: Math.floor(Math.random() * rows), c: Math.floor(Math.random() * cols) };

        while (start.r === end.r && start.c === end.c) {
            end = { r: Math.floor(Math.random() * rows), c: Math.floor(Math.random() * cols) };
        }

        grid[start.r][start.c] = 0;
        grid[end.r][end.c] = 0;

        return { grid, start, end };
    }
}

class AStarSolver {
    /**
     * @param {Array<Array<number>>} grid - 2D array where 0 is empty, 1 is obstacle
     * @param {Object} start - {r, c}
     * @param {Object} end - {r, c}
     */
    constructor(grid, start, end) {
        this.grid = grid;
        this.start = start;
        this.end = end;
        this.rows = grid.length;
        this.cols = grid[0].length;
    }

    heuristic(a, b) {
        // Manhattan distance on a square grid (only 4 directions allowed)
        return Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
    }

    getNeighbors(node) {
        const neighbors = [];
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Up, Down, Left, Right
        
        for (const dir of dirs) {
            const nr = node.r + dir[0];
            const nc = node.c + dir[1];

            // Check boundaries and obstacle
            if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && this.grid[nr][nc] === 0) {
                neighbors.push({ r: nr, c: nc });
            }
        }
        return neighbors;
    }

    solve() {
        const frontier = new PriorityQueue();
        const startKey = `${this.start.r},${this.start.c}`;
        const endKey = `${this.end.r},${this.end.c}`;

        frontier.enqueue(this.start, 0);

        const cameFrom = new Map();
        const costSoFar = new Map();

        cameFrom.set(startKey, null);
        costSoFar.set(startKey, 0);

        const history = []; // To track the algorithm's execution for visualization

        let found = false;

        // Record initial state
        history.push({
            type: 'ENQUEUE',
            node: this.start,
            parent: null,
            f: this.heuristic(this.start, this.end),
            g: 0,
            h: this.heuristic(this.start, this.end)
        });

        while (!frontier.isEmpty()) {
            const current = frontier.dequeue();
            const currentKey = `${current.r},${current.c}`;

            // Record visit step (node moved to closed set / evaluated)
            history.push({
                type: 'VISIT',
                node: current,
                cost: costSoFar.get(currentKey)
            });

            if (currentKey === endKey) {
                found = true;
                break;
            }

            for (const next of this.getNeighbors(current)) {
                const nextKey = `${next.r},${next.c}`;
                // Uniform cost 1 for moving to any valid neighbor
                const newCost = costSoFar.get(currentKey) + 1;

                if (!costSoFar.has(nextKey) || newCost < costSoFar.get(nextKey)) {
                    costSoFar.set(nextKey, newCost);
                    const priority = newCost + this.heuristic(next, this.end);
                    frontier.enqueue(next, priority);
                    cameFrom.set(nextKey, current);
                    
                    history.push({
                        type: 'ENQUEUE',
                        node: next,
                        parent: current,
                        f: priority,
                        g: newCost,
                        h: this.heuristic(next, this.end)
                    });
                }
            }
        }

        // Backtrack to find the optimal path
        const path = [];
        if (found) {
            let curr = this.end;
            while (curr != null) {
                path.push(curr);
                const currKey = `${curr.r},${curr.c}`;
                curr = cameFrom.get(currKey);
            }
            path.reverse();
        }

        return {
            found,
            path,
            history
        };
    }
}

// Export for ES modules or Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PriorityQueue, MapGenerator, AStarSolver };
} else if (typeof window !== 'undefined') {
    window.AStarLogic = { PriorityQueue, MapGenerator, AStarSolver };
}
