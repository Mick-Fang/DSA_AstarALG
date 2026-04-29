document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');
    const btnGenerate = document.getElementById('btn-generate');
    const btnStart = document.getElementById('btn-start');
    const btnClear = document.getElementById('btn-clear');

    let currentGrid = null;
    let startNode = null;
    let endNode = null;
    let rows = 20;
    let cols = 40;
    
    let isDragging = null; // 紀錄目前正在拖曳的節點類型 ('start', 'end', 或 null)
    
    // Access logic from AStarLogic.js via window object
    const { MapGenerator, AStarSolver } = window.AStarLogic;

    // Initialize Grid UI
    function initGrid(r, c) {
        rows = r;
        cols = c;
        gridContainer.style.gridTemplateColumns = `repeat(${cols}, 25px)`;
        gridContainer.innerHTML = '';

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const node = document.createElement('div');
                node.classList.add('node');
                node.id = `node-${i}-${j}`;
                
                // 加入滑鼠拖曳事件
                node.addEventListener('mousedown', (e) => { e.preventDefault(); handleMouseDown(i, j); });
                node.addEventListener('mouseenter', () => handleMouseEnter(i, j));
                
                gridContainer.appendChild(node);
            }
        }
        document.addEventListener('mouseup', handleMouseUp);
    }

    function handleMouseDown(r, c) {
        if (btnStart.disabled) return; // 執行動畫時不允許拖曳
        if (r === startNode.r && c === startNode.c) {
            isDragging = 'start';
        } else if (r === endNode.r && c === endNode.c) {
            isDragging = 'end';
        }
    }

    function handleMouseEnter(r, c) {
        if (!isDragging) return;
        if (currentGrid[r][c] === 1) return; // 不可放置於障礙物上
        
        if (isDragging === 'start' && !(r === endNode.r && c === endNode.c)) {
            startNode = {r, c};
            renderMap();
        } else if (isDragging === 'end' && !(r === startNode.r && c === startNode.c)) {
            endNode = {r, c};
            renderMap();
        }
    }

    function handleMouseUp() {
        isDragging = null;
    }

    function renderMap() {
        if (!currentGrid) return;
        
        // Reset all nodes
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const nodeEl = document.getElementById(`node-${r}-${c}`);
                nodeEl.className = 'node'; // reset classes
                
                if (r === startNode.r && c === startNode.c) {
                    nodeEl.classList.add('start');
                } else if (r === endNode.r && c === endNode.c) {
                    nodeEl.classList.add('end');
                } else if (currentGrid[r][c] === 1) {
                    nodeEl.classList.add('obstacle');
                }
            }
        }
    }

    function generateNewMap() {
        const result = MapGenerator.generateRandomMap(rows, cols, 0.25);
        currentGrid = result.grid;
        startNode = result.start;
        endNode = result.end;
        
        // Reset buttons
        btnStart.disabled = false;
        renderMap();
    }

    // Animation runner
    async function animateAlgorithm(history, path) {
        btnStart.disabled = true;
        btnGenerate.disabled = true;
        btnClear.disabled = true;

        const delay = (ms) => new Promise(res => setTimeout(res, ms));

        // Animate history
        for (let i = 0; i < history.length; i++) {
            const step = history[i];
            const nodeEl = document.getElementById(`node-${step.node.r}-${step.node.c}`);
            
            // Skip start/end nodes coloring for history so they stay visible
            if ((step.node.r === startNode.r && step.node.c === startNode.c) ||
                (step.node.r === endNode.r && step.node.c === endNode.c)) {
                continue;
            }

            if (step.type === 'ENQUEUE') {
                nodeEl.classList.add('enqueue');
            } else if (step.type === 'VISIT') {
                nodeEl.classList.remove('enqueue');
                nodeEl.classList.add('visited');
            }

            // Adjust speed here (Slower by 2x)
            await delay(40); // 每一格都停頓 10ms (原本是每兩格停頓 10ms)
        }

        // Animate path
        if (path && path.length > 0) {
            await delay(1200); // 300ms 變成 600ms
            for (let i = 0; i < path.length; i++) {
                const p = path[i];
                if ((p.r === startNode.r && p.c === startNode.c) ||
                    (p.r === endNode.r && p.c === endNode.c)) {
                    continue;
                }
                const nodeEl = document.getElementById(`node-${p.r}-${p.c}`);
                nodeEl.className = 'node path'; // Clear others, add path
                await delay(40); // 20ms 變成 40ms
            }
        }

        btnGenerate.disabled = false;
        btnClear.disabled = false;
    }

    // Event Listeners
    btnGenerate.addEventListener('click', generateNewMap);

    btnClear.addEventListener('click', () => {
        if (!currentGrid) return;
        renderMap(); // Restores original state without history/path
        btnStart.disabled = false;
    });

    btnStart.addEventListener('click', () => {
        if (!currentGrid || !startNode || !endNode) return;
        
        // Clear previous animations first
        renderMap();
        
        const solver = new AStarSolver(currentGrid, startNode, endNode);
        const result = solver.solve();
        
        animateAlgorithm(result.history, result.path);
    });

    // Initialize on load
    initGrid(20, 40);
    generateNewMap();
});
