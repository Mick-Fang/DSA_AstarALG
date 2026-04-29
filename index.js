document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');
    const btnGenerate = document.getElementById('btn-generate');
    const btnStart = document.getElementById('btn-start');
    const btnClear = document.getElementById('btn-clear');

    const overlayCanvas = document.getElementById('overlay-canvas');
    const ctx = overlayCanvas ? overlayCanvas.getContext('2d') : null;

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
        setTimeout(resizeCanvas, 50); // Ensure grid layout is complete before sizing canvas
    }

    function resizeCanvas() {
        if (!overlayCanvas || !gridContainer) return;
        overlayCanvas.width = gridContainer.offsetWidth;
        overlayCanvas.height = gridContainer.offsetHeight;
    }

    function getCenterCoords(r, c) {
        const nodeEl = document.getElementById(`node-${r}-${c}`);
        if (!nodeEl) return null;
        // canvas is inside grid-wrapper, nodeEl is inside grid-container
        // so offsetLeft/Top of nodeEl is relative to grid-container
        return {
            x: nodeEl.offsetLeft + nodeEl.offsetWidth / 2,
            y: nodeEl.offsetTop + nodeEl.offsetHeight / 2
        };
    }

    function drawForces(currentNode, cameFromMap) {
        if (!ctx) return;
        ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

        const currentPos = getCenterCoords(currentNode.r, currentNode.c);
        const endPos = getCenterCoords(endNode.r, endNode.c);

        if (!currentPos || !endPos) return;

        // Calculate dynamic tension based on Manhattan distance
        const dist = Math.abs(currentNode.r - endNode.r) + Math.abs(currentNode.c - endNode.c);
        const maxDist = rows + cols;
        const tension = Math.max(0, 1 - (dist / (maxDist * 0.7))); // 0.0 to 1.0, reaches max tension earlier

        // Draw blue path (g cost) first so it's under the red rubber band
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.9)'; // Bright Cyan path instead of blue

        let curr = currentNode;
        let pos = getCenterCoords(curr.r, curr.c);
        ctx.moveTo(pos.x, pos.y);

        while (curr) {
            const key = `${curr.r},${curr.c}`;
            curr = cameFromMap.get(key);
            if (curr) {
                pos = getCenterCoords(curr.r, curr.c);
                ctx.lineTo(pos.x, pos.y);
            }
        }
        ctx.stroke();

        // --- Draw Rubber Band (h cost) with Tension Effects ---
        
        ctx.beginPath();
        ctx.moveTo(currentPos.x, currentPos.y);
        
        if (currentPos.x !== endPos.x && currentPos.y !== endPos.y) {
            // L-shape corner for Manhattan Distance
            const cornerX = endPos.x;
            const cornerY = currentPos.y;
            // Ensure radius isn't larger than the segment lengths
            const radius = Math.min(20, Math.abs(endPos.x - currentPos.x) / 2, Math.abs(endPos.y - currentPos.y) / 2);
            
            ctx.arcTo(cornerX, cornerY, endPos.x, endPos.y, radius);
            ctx.lineTo(endPos.x, endPos.y);
        } else {
            ctx.lineTo(endPos.x, endPos.y);
        }
        
        // Tension styling
        const lightness = 50 + tension * 40; // 50% to 90% (brighter when closer)
        ctx.strokeStyle = `hsla(348, 100%, ${lightness}%, ${0.7 + tension * 0.3})`;
        
        // Stretch dashes: tighter string = longer dashes
        const dashLength = 5 + tension * 15;
        ctx.setLineDash([dashLength, 5]);
        
        // Thicker and glowing when taut
        ctx.lineWidth = 2 + tension * 3;
        ctx.shadowBlur = tension * 15;
        ctx.shadowColor = `hsla(348, 100%, 70%, ${tension})`;
        
        ctx.stroke();

        // --- Visual "Snap/Focus" Effect on the current node ---
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.arc(currentPos.x, currentPos.y, 8 + tension * 6, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(348, 100%, ${lightness}%, ${0.5 + tension * 0.5})`;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
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
        if (ctx) ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    }

    // Animation runner
    async function animateAlgorithm(history, path) {
        btnStart.disabled = true;
        btnGenerate.disabled = true;
        btnClear.disabled = true;

        resizeCanvas();
        if (ctx) ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        
        const cameFromMap = new Map();

        const delay = (ms) => new Promise(res => setTimeout(res, ms));

        // Animate history
        for (let i = 0; i < history.length; i++) {
            const step = history[i];
            const nodeEl = document.getElementById(`node-${step.node.r}-${step.node.c}`);
            
            if (step.type === 'ENQUEUE') {
                if (step.parent) {
                    cameFromMap.set(`${step.node.r},${step.node.c}`, step.parent);
                }
            }

            // Skip start/end nodes coloring for history so they stay visible
            if ((step.node.r === startNode.r && step.node.c === startNode.c) ||
                (step.node.r === endNode.r && step.node.c === endNode.c)) {
                
                if (step.type === 'VISIT') {
                    drawForces(step.node, cameFromMap);
                    await delay(80);
                }
                continue;
            }

            if (step.type === 'ENQUEUE') {
                nodeEl.classList.add('enqueue');
            } else if (step.type === 'VISIT') {
                nodeEl.classList.remove('enqueue');
                nodeEl.classList.add('visited');
                drawForces(step.node, cameFromMap);
            }

            // Adjust speed here (Slower by 2x)
            await delay(80); // 每一格都停頓 80ms (原本是 40ms)
        }

        // Animate path
        if (path && path.length > 0) {
            await delay(1200);
            
            // Re-draw the final full path on canvas for dramatic effect
            if (ctx) {
                ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
                ctx.beginPath();
                ctx.lineWidth = 4;
                ctx.strokeStyle = 'rgba(250, 204, 21, 1)'; // Solid Yellow
                const startPos = getCenterCoords(startNode.r, startNode.c);
                ctx.moveTo(startPos.x, startPos.y);
                
                for (const p of path) {
                    const pos = getCenterCoords(p.r, p.c);
                    ctx.lineTo(pos.x, pos.y);
                }
                ctx.stroke();
            }

            for (let i = 0; i < path.length; i++) {
                const p = path[i];
                if ((p.r === startNode.r && p.c === startNode.c) ||
                    (p.r === endNode.r && p.c === endNode.c)) {
                    continue;
                }
                const nodeEl = document.getElementById(`node-${p.r}-${p.c}`);
                nodeEl.className = 'node path'; // Clear others, add path
                await delay(80); // 40ms 變成 80ms
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
        if (ctx) ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
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
