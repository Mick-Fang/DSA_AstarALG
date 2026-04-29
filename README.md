# A* Pathfinding Visualizer

A visually interactive web application that demonstrates how the A* (A-Star) pathfinding algorithm works in real-time. Built with pure HTML, CSS, and Vanilla JavaScript.

## 🚀 Features

- **Algorithm Visualization**: Watch the algorithm explore the grid step-by-step, showing enqueued nodes, visited nodes, and the final shortest path.
- **Interactive Grid**: 
  - Drag and drop the **Start** (Green) and **Target** (Red) nodes to dynamically set new starting and ending points.
- **Random Map Generation**: Instantly generate new grid layouts with randomly scattered obstacles.
- **Clear Controls**: Easily start the search, clear the path, or generate entirely new grids.
- **Custom Data Structures**: Implements a custom `PriorityQueue` and standard A* logic using the Manhattan distance heuristic.

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3
- **Logic**: Vanilla JavaScript (`ES6+`)
- **Fonts**: [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts)

## 📂 Project Structure

- `index.html`: The main entry point containing the UI layout, legend, and grid container.
- `index.css`: Styling for the interface, colors, node states, and animations.
- `AStarLogic.js`: Core algorithmic implementations, including the `PriorityQueue`, `MapGenerator`, and `AStarSolver`.
- `index.js`: DOM manipulation, event listeners (drag-and-drop), and grid animation logic.
- `test.js`: Contains basic tests for validating the underlying pathfinding logic.

## 🎮 How to Use

1. **Open the App**: Simply open `index.html` in your modern web browser (no server required).
2. **Setup Map**: Click "**Generate Random Map**" to create a fresh grid with new obstacles.
3. **Move Nodes**: Drag and drop the start node (green) or target node (red) to your desired positions.
4. **Start Search**: Click "**Start Search**" to visualize the A* algorithm finding the optimal path.
5. **Clear**: Click "**Clear Map**" to remove the visual search history and reset the map.

## 🧠 Algorithm Details

The visualizer uses the **A* Search Algorithm**, which is widely used in pathfinding and graph traversal. It uses a **Heuristic function** to calculate the estimated cost from the current node to the target.

*   `f(n) = g(n) + h(n)`
*   `g(n)`: The actual cost from the start node to the current node `n`.
*   `h(n)`: The estimated cost from the current node `n` to the target node. In this project, we use the **Manhattan Distance**.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to open an issue or submit a pull request if you want to improve the algorithm's performance or add more features (such as diagonal movement, weight nodes, or other pathfinding algorithms like Dijkstra's or BFS).
