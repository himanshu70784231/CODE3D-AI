# CODE3D-AI

> *"Don't just read the code. See the code execute."*

[![Live Demo](https://img.shields.io/badge/Demo-GitHub%20Pages-cyan?style=for-the-badge&logo=github)](https://himanshu70784231.github.io/CODE3D-AI/)
[![Java 21](https://img.shields.io/badge/Java-21%20LTS-orange?style=for-the-badge&logo=openjdk)](https://openjdk.org/)
[![Spring Boot 3.2](https://img.shields.io/badge/Spring%20Boot-3.2.4-brightgreen?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![React 18](https://img.shields.io/badge/React-18.3-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-purple?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-yellow?style=for-the-badge&logo=vite)](https://vitejs.dev/)

**CODE3D-AI** is an advanced interactive computer science educational platform that compiles and interprets source code into understandable, physical, 3D WebGL data structure visualizations in real time. Designed for computer science students, educators, and software engineers preparing for technical interviews.

🌐 **Production GitHub Pages:** [https://himanshu70784231.github.io/CODE3D-AI/](https://himanshu70784231.github.io/CODE3D-AI/)

---

## 📸 Key Capabilities

- **Interactive 3D WebGL Visualization**: 12 dedicated 3D visualizers powered by Three.js and React Three Fiber.
- **Monaco Code Editor & Integrated Debugger**: Set breakpoints on the glyph margin, step through code, auto-pause at breakpoints, and inspect live memory state.
- **Dual Execution Engine**:
  - **Sandboxed Server-Side Java AST Engine**: Built with Spring Boot 3.2.4, Java 21, and JavaParser for complete AST code interpretation without insecure JVM `eval`.
  - **Dynamic Client-Side Simulator**: Pure client-side AST simulator ensuring 100% of features work smoothly on static hosts like GitHub Pages.
- **Real Trace Execution**: Never uses hardcoded or pre-rendered mock steps. Variables, outputs, memory indices, and line numbers correspond directly to source code statements.
- **Variables & Memory Inspector**: Real-time stack frames, type inference badges (`int`, `int[]`, `double`, `boolean`, `String`), variable diff highlighting, and expandable array index breakdowns (`arr[i] = value`).
- **Algorithm Benchmark Compare Mode**: Side-by-side comparative benchmarking for algorithms (e.g. Bubble Sort vs Quick Sort).
- **Curated Educational Hubs**:
  - **Striver SDE Sheet**: 182 curated problems across Arrays, Two-Pointer, Matrix, Linked Lists, Trees, Graphs, DP, and Backtracking.
  - **DSA Hub**: Categorized lessons and interactive challenges with difficulty filters.
  - **Interactive Playground (`/playground`)**: Multi-language sandbox supporting Java, Python, C++, and JavaScript with template selection and custom input testing.
  - **AI Algorithm Tutor (`/ai`)**: Big-O time and space complexity proofs, edge-case vulnerability detection, and interactive algorithmic chat.
  - **Quiz Arena (`/quiz`)**: Test algorithmic knowledge with timed quizzes and score tracking.
  - **Execution History (`/history`)**: Persistent record of previous simulation sessions with one-click replay.

---

## 🧊 The 12 Supported 3D Visualizers

Every visualizer is implemented as a specialized React Three Fiber canvas component:

| # | Visualizer | Supported Archetypes & Problems | 3D Physical Representation |
|---|---|---|---|
| **1** | **Array Visualizer** | Standard arrays, Kadane's algorithm, Search | Elevated neon bars with glowing pointer rings and index labels |
| **2** | **Two-Pointer Visualizer** | Array reverse, Palindrome, 2Sum II, Container With Most Water | Dual converging pointer rings with dynamic distance indicators |
| **3** | **2D Matrix Grid** | Matrix traversal, Set Matrix Zeroes, Spiral Matrix, Pathfinding | 3D coordinate grid with active cell glowing beams |
| **4** | **Linked List Visualizer** | Singly linked list, Floyd Cycle Detection, Reverse List | Connected 3D spherical nodes with dynamic directional vector arrows |
| **5** | **Stack Visualizer** | Parentheses matching, Monotonic stack, Next Greater Element | Transparent vertical cylinder with gravity-drop LIFO disc animations |
| **6** | **Queue / Deque Visualizer** | Sliding Window Maximum, BFS traversal buffer | Horizontal conduit track with FIFO entry and exit animations |
| **7** | **Binary Search Tree & Heap** | BST search/insert, Min/Max Heap, Level-order | Hierarchical branch node lattice with dynamic left/right parent links |
| **8** | **Graph Visualizer** | BFS, DFS, Dijkstra's algorithm, Topological sort | Force-directed 3D node network with illuminated traversal frontiers |
| **9** | **Sorting Visualizer** | Bubble, Selection, Insertion, Merge, Quick Sort | Dual comparison pillars with elevated 3D swap arcs |
| **10** | **Recursion Tree Visualizer** | Factorial, Fibonacci, Divide-and-Conquer | 3D stacking execution frames tracking call parameters and returns |
| **11** | **ALU & Control Flow** | Scanner inputs, variables, arithmetic calculations, if/else | Glowing computational reactor with memory register cells and logic gates |
| **12** | **N-Queens Backtracking** | N-Queens (LeetCode #51), Permutations, Backtracking | 3D reflective chessboard with queen models and conflict threat vectors |

---

## ⌨️ Integrated Debugger & Keyboard Shortcuts

The platform includes Monaco Editor with an interactive execution debugger:

| Shortcut | Action | Description |
|---|---|---|
| `Ctrl + Enter` / `Cmd + Enter` | **Run / Execute** | Execute code, synthesize 3D trace, and begin animation |
| `F5` | **Play / Pause** | Toggle execution playback loop |
| `F10` | **Step Forward** | Step one instruction ahead in the execution trace |
| `Shift + F10` | **Step Backward** | Step one instruction backward (Time Machine) |
| `Esc` | **Reset** | Stop execution and rewind timeline to step 1 |
| **Left Click Glyph Margin** | **Toggle Breakpoint** | Toggle red breakpoint dot on any line; auto-pauses when reached |

---

## 🏛 System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CODE3D-AI ARCHITECTURE                         │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   BROWSER / CLIENT-SIDE (Vite 5 + React 18 + Three.js + Monaco Editor) │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ HashRouter (SPA navigation: /, /visualizer, /playground, /ai)  │   │
│   ├────────────────────────────────────────────────────────────────┤   │
│   │ Monaco Code Editor with Glyph Margin Breakpoints               │   │
│   ├────────────────────────────────────────────────────────────────┤   │
│   │ 3D R3F Canvas (12 Specialized Procedural Shaders & Meshes)     │   │
│   ├────────────────────────────────────────────────────────────────┤   │
│   │ Time Machine Scrubber (0.25x - 4x speed throttling)            │   │
│   ├────────────────────────────────────────────────────────────────┤   │
│   │ Variables Inspector (Type badges, diffs, array breakdowns)     │   │
│   ├────────────────────────────────────────────────────────────────┤   │
│   │ Client AST Simulation Engine (Guaranteed zero-backend fallback)│   │
│   └────────────────────────────────┬───────────────────────────────┘   │
│                                    │ HTTP / REST                       │
│                                    ▼                                   │
│   BACKEND ENGINE (Java 21 + Spring Boot 3.2.4 + JavaParser 3.26)       │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ JavaAstExecutionEngine (AST Interpreter & Step Trace Generator)│   │
│   ├────────────────────────────────────────────────────────────────┤   │
│   │ Sandboxing Gate (Loop limits: 1000 steps, Timeout: 3000ms)     │   │
│   ├────────────────────────────────────────────────────────────────┤   │
│   │ Exception Handler (ArrayIndexOutOfBounds, ArithmeticException) │   │
│   ├────────────────────────────────────────────────────────────────┤   │
│   │ Spring Security & CORS Configuration                           │   │
│   ├────────────────────────────────────────────────────────────────┤   │
│   │ H2 / Neon PostgreSQL Database Layer                            │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 Installation & Local Development

### Prerequisites

- **Node.js**: v18.x or v20.x LTS
- **Java JDK**: 21 LTS
- **Maven**: 3.8+ (or use included `mvnw.cmd` / `./mvnw`)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/himanshu70784231/CODE3D-AI.git
cd CODE3D-AI
```

### 2. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be live at `http://localhost:5173/`.

### 3. Run Backend (Optional — Client fallback is active by default)

```bash
cd backend
./mvnw clean spring-boot:run
```
*(On Windows: `mvnw.cmd clean spring-boot:run`)*

The backend server will start on `http://localhost:8080/`.

---

## 🚀 Building & Deploying to GitHub Pages

The repository contains an automated GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and publishes the client to GitHub Pages upon pushing to `main`.

To build locally:

```bash
cd frontend
npm run build
```

This compiles optimized bundles into `frontend/dist/` with:
- `base: '/CODE3D-AI/'` for proper asset resolution.
- `frontend/dist/404.html` SPA redirection trick ensuring direct routing without 404 HTTP errors.

---

## 🔒 Security & Sandboxing Model

- **No Dangerous Runtime Eval**: Neither frontend nor backend uses `eval()`, `new Function()`, or unconstrained bytecode loaders.
- **AST Interpretation**: Code is transformed into an Abstract Syntax Tree (AST) using JavaParser and validated before execution.
- **Timeout Protection**: Server executions are strictly limited to `3000ms`.
- **Step Limit Safeguards**: Maximum of `1000` execution steps to prevent infinite loop memory saturation.
- **Memory Boundaries**: Array indexing bounds checks emit `ArrayIndexOutOfBoundsException` safely and halt execution before memory corruption.
- **Input Sanitization**: User inputs are strictly parsed through tokenized scanners without shell or command injection exposure.

---

## 📄 License

This project is licensed under the MIT License — feel free to explore, learn, and build upon it!
