const { MapGenerator, AStarSolver } = require('./AStarLogic');

function runTest() {
    console.log("=== A* Logic Test ===");

    // 1. Generate a small map
    const rows = 10;
    const cols = 10;
    const { grid, start, end } = MapGenerator.generateRandomMap(rows, cols, 0.2);

    console.log("Generated Grid (0: empty, 1: obstacle):");
    for (let r = 0; r < rows; r++) {
        let rowStr = "";
        for (let c = 0; c < cols; c++) {
            if (r === start.r && c === start.c) rowStr += "S ";
            else if (r === end.r && c === end.c) rowStr += "E ";
            else rowStr += grid[r][c] === 1 ? "X " : ". ";
        }
        console.log(rowStr);
    }
    console.log(`Start: (${start.r}, ${start.c})`);
    console.log(`End:   (${end.r}, ${end.c})`);

    // 2. Solve using AStarSolver
    const solver = new AStarSolver(grid, start, end);
    const result = solver.solve();

    console.log("\n=== Solver Result ===");
    console.log(`Path Found: ${result.found}`);
    
    if (result.found) {
        console.log(`Path Length: ${result.path.length}`);
        console.log("Path:");
        result.path.forEach(p => console.log(`  (${p.r}, ${p.c})`));
    } else {
        console.log("No path could be found (likely blocked by obstacles).");
    }

    console.log(`History Steps Recorded: ${result.history.length}`);
    console.log("First 3 History Steps:");
    console.log(result.history.slice(0, 3));
}

runTest();
