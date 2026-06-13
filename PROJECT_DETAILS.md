# Queen's Rush — Technical Project Profile & Resume Guide

This document provides a comprehensive technical overview of **Queen's Rush**, a mobile puzzle game inspired by the classical mathematical **N-Queens Problem**. Use the structured content below to add this project to your resume, build a portfolio entry, or prepare for technical interview questions.

---

## 🚀 Resume Bullet Points (Copy & Paste ready)

### Option 1: Focused on Algorithm & Mobile Development (General SWE)
* **Mobile Software Engineer | Queen's Rush (React Native, TypeScript, Expo)**
  * Engineered a turn-based strategy mobile game inspired by the classical **N-Queens backtracking puzzle**, implementing real-time constraint checks and grid coordinate calculations.
  * Designed and implemented an **AI Opponent** using a **Greedy State-Space Minimization heuristic** that simulates future board states to minimize the player’s branching factor (valid moves) at runtime.
  * Developed a modular architecture using custom React Hooks (`useGame`, `useBoard`) to separate core board logic, game state machines, and asynchronous bot calculations from the visual UI components.
  * Achieved fluid animations and physical interactivity by integrating **React Native Reanimated** for timer/alert systems and **Expo Haptics** for multi-sensory error and success states.

### Option 2: Focused on Frontend & Responsive UI
* **React Native Developer | Queen's Rush (TypeScript, React Native Reanimated, Expo)**
  * Created a responsive layout engine using a custom React window-dimension hook, supporting pixel-perfect dynamic grid sizing (6×6 and 8×8) across diverse iOS and Android form factors (phones and tablets).
  * Built custom, lightweight interactive board components, avoiding heavy third-party dependencies, and rendering chess pieces using vector-based SVG graphics to optimize load times and memory footprint.
  * Optimized single-threaded JavaScript performance by scheduling AI bot moves asynchronously on the event loop, ensuring compute-heavy calculations do not block UI rendering or drop 60 FPS frame rates.
  * Developed an interactive move timer with visual warnings (pulsing animation using shared values) and tactile feedback when a user is running out of time.

---

## 🛠️ Tech Stack & Architecture

| Technology | Purpose | Key Benefit |
| :--- | :--- | :--- |
| **React Native & Expo** | Core Framework | Native compiling for iOS/Android from a single TypeScript codebase. |
| **TypeScript** | Language | Static typing, interface definitions for game parameters, and crash reduction. |
| **React Native Reanimated** | Animations | Runs smooth visual micro-animations (e.g., ticking timer warning) on the native thread. |
| **Expo Haptics** | Tactile Feedback | Enhances user experience by triggering precise physical vibrations on user actions. |
| **Expo Fonts** | Typography | Pre-loads custom aesthetic typography (Montserrat & Inter) before displaying the UI. |
| **SVG Icons** | Visual Assets | Renders responsive, resolution-independent vector illustrations and game icons. |

---

## 🧠 Algorithmic Core: N-Queens & Game Rules

**Queen's Rush** gamifies the classical **N-Queens problem** (placing $N$ chess queens on an $N \times N$ chessboard such that no two queens threaten each other) into a competitive turn-based local or bot match.

### 1. The Mathematical Constraint Check
Every time a player taps a tile to place a Queen, the engine performs a constraint check in **$O(k)$** time, where $k$ is the number of already placed queens on the board. The mathematical coordinates $(r_1, c_1)$ of the new move are compared against each existing queen $(r_2, c_2)$ to check for:
* **Row conflict:** $r_1 = r_2$
* **Column conflict:** $c_1 = c_2$
* **Diagonal conflict:** $|r_1 - r_2| = |c_1 - c_2|$

If a conflict is detected, the placing player forfeits and **loses the game instantly**.
```typescript
// Located in src/utils/moves.ts
export function checkConflict(newIndex: number, placedIndices: number[], boardSize: BoardSize): boolean {
  const { cols } = getBoardDimensions(boardSize);
  const { row: r1, col: c1 } = indexToCoords(newIndex, cols);

  for (const q of placedIndices) {
    const { row: r2, col: c2 } = indexToCoords(q, cols);

    // N-Queens attack logic
    if (r1 === r2 || c1 === c2 || Math.abs(r1 - r2) === Math.abs(c1 - c2)) {
      return true;
    }
  }
  return false;
}
```

### 2. Backtracking Check for Valid Moves
To prevent infinite games and determine **Draw** states, the engine must verify if the board contains any possible safe move. It runs a backtracking validation function that evaluates all un-placed squares on the board:
$$\text{hasValidMoves} = \exists \, i \in [0, N^2) \text{ s.t. } i \notin \text{placed} \land \neg \text{checkConflict}(i, \text{placed})$$
If no safe squares remain and both players haven't completed their queen quota (4 on 6×6, 5 on 8×8), the match is declared a **Draw**.

---

## 🤖 AI Opponent Heuristics

The bot (**Saara**) features three distinct strategic behaviors implemented inside `src/utils/moves.ts`:

1. **Easy Mode (Stochastic Model with Error Emulation):**
   * Simulated human mistake rate: The bot has a **30% chance** to pick a completely random move from all empty cells, which may include conflicting squares (resulting in an instant loss).
   * 70% chance to select a random valid move.
2. **Medium Mode (Random Safe Play):**
   * Filters the board for all valid, non-conflicting cells and selects one uniformly at random. It represents standard casual gameplay.
3. **Hard Mode (Greedy State-Space Minimization):**
   * Evaluates all potential valid moves. For each simulated move, it calculates how many valid moves would remain for the player.
   * Selects the move(s) that **minimize the player's remaining valid moves** (restricting player options).
   * This is a depth-1 minimax strategy that successfully "corners" players by cutting off their board territory.

```typescript
// Hard AI greedy heuristic in src/utils/moves.ts
let bestMoves: number[] = [];
let minPlayerMoves = Infinity;

for (const move of validMoves) {
  const simulatedPlaced = [...placedIndices, move];
  let playerValidCount = 0;
  
  // Calculate remaining player branching factor
  for (let i = 0; i < cellsCount; i++) {
    if (!simulatedPlaced.includes(i) && !checkConflict(i, simulatedPlaced, boardSize)) {
      playerValidCount++;
    }
  }
  
  if (playerValidCount < minPlayerMoves) {
    minPlayerMoves = playerValidCount;
    bestMoves = [move];
  } else if (playerValidCount === minPlayerMoves) {
    bestMoves.push(move);
  }
}
```

---

## 🛠️ Key Technical Challenges & Solutions

### 1. Maintaining 60 FPS during AI calculations on a Single JS Thread
* **Challenge:** Heavy algorithmic computations (such as the hard bot iterating and simulating board states for all cells) in React Native run on the single-threaded JS engine, which can block layout animations and freeze the UI.
* **Solution:** Used asynchronous delays (`setTimeout`) matched to bot difficulties (300ms–1500ms) to ensure AI calculations occur outside of user transition frames. The calculations are fast enough on standard hardware for $8 \times 8$ grids, and the delay mimics human thinking while avoiding micro-stuttering.

### 2. Device-agnostic Grid Layout & Sizing
* **Challenge:** In mobile chess games, chessboards must be perfectly square and scaled to fit the phone's width while leaving vertical space for headers, timers, and game controls. Hardcoded paddings cause clipping on smaller screens (iPhone SE) or look tiny on tablets.
* **Solution:** Created a dynamic layout system using `useWindowDimensions` to compute the cell sizes dynamically at runtime:
  $$\text{Cell Size} = \frac{\min(\text{ScreenWidth} - 32, 400) - 24}{\text{Grid Columns}}$$
  This dynamic calculation allows the same component to render smoothly on an iPhone 13 Mini, iPad Pro, or an Android emulator.

### 3. Decoupling Game State for Reusability
* **Challenge:** Monolithic component files that contain gameplay timers, turn switching, win/loss triggers, and board renderings quickly become unmaintainable and untestable.
* **Solution:** Built a pure React Hook `useGame` that acts as the controller state-machine. It takes parameters like difficulty, timer length, and board size, and returns simple state variables and methods (`placedQueens`, `handleCellPress`, `timeLeft`, `gameState`). This enables potential refactoring where the board representation could be swapped with other visual components without modifying the rules engine.
