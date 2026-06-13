# Queen's Rush — Codebase Review & Improvement Suggestions

After reading through every file in the project, here's a prioritized list of improvements grouped by severity.

---

## 🔴 Critical — Bugs & Correctness Issues

### 1. Settings (Sound/Haptics) are saved but never read by the game

The `SettingsScreen` persists `@qr_sound` and `@qr_haptics` to AsyncStorage, but **nothing in the app reads them**. Every component (`Cell.tsx`, `Button.tsx`, `GameScene.tsx`, `LobbyScreen.tsx`, etc.) calls `Haptics.impactAsync()` unconditionally. Similarly, there is no sound system at all — the toggle exists for a feature that doesn't exist.

> [!WARNING]
> The user can toggle Sound/Haptics off and the app will behave identically. This is a broken contract with the user.

**Fix:** Create a `SettingsContext` (React Context) that loads all settings at app startup and exposes them via `useSettings()`. Then gate every `Haptics.*` call behind `settings.haptics`, and future sound calls behind `settings.sound`.

---

### 2. `Dimensions.get('window')` used at module level in `Board.tsx`

```typescript
// Board.tsx line 17
const SCREEN_WIDTH = Dimensions.get('window').width;
```

This captures the screen width **once** at module evaluation time. If the device rotates, or the app is used in split-screen mode, the board width will be stale and wrong.

**Fix:** Use `useWindowDimensions()` inside the component body, like `GameModeScreen` already does correctly.

---

### 3. Undo allows cheating in vs-bot mode

[handleUndo](file:///Users/venky/Desktop/game/mobile/src/hooks/useGame.ts#L144-L156) pops the last move regardless of who made it. In `vs-bot` mode, the player can:
1. Make a move → bot responds
2. Press Undo → bot's move is removed
3. The player now sees where the bot played and can exploit that information

Worse, pressing Undo again removes the player's own move — giving them full knowledge of the bot's strategy for free. This is essentially an "infinite rewind" exploit.

**Fix:** Either disable Undo in vs-bot mode entirely, or undo **both** the bot's and the player's last moves together (pop 2), and limit undo uses per game (e.g., 1–2).

---

### 4. Bot move uses stale closure over `placedQueens`

In [useGame.ts line 102](file:///Users/venky/Desktop/game/mobile/src/hooks/useGame.ts#L94-L133), the bot `useEffect` captures `placedQueens` from the render when the effect was scheduled. Since `setTimeout` fires later, if the player somehow triggers a state change during the bot's delay, the bot will compute its move based on **outdated** board state. The `placedQueens` is also included in the effect's dependency array, which is correct for re-triggering, but the closure problem remains subtle.

**Fix:** Use a ref (`useRef`) to always read the latest `placedQueens` inside the timeout callback:
```typescript
const placedQueensRef = useRef(placedQueens);
placedQueensRef.current = placedQueens;
// then inside setTimeout: const placedIndices = placedQueensRef.current.map(...)
```

---

## 🟡 High — Architecture & Performance

### 5. Theme tokens exist but are completely unused

You have [colors.ts](file:///Users/venky/Desktop/game/mobile/src/theme/colors.ts) and [spacing.ts](file:///Users/venky/Desktop/game/mobile/src/theme/spacing.ts) with carefully defined design tokens, but **every screen hardcodes hex values and magic numbers** (`'#111827'`, `'#F3F4F6'`, `16`, `24`, etc.).

This means:
- Changing a brand color requires find-and-replace across 20+ files
- The dark mode palette (`colors.dark`) is defined but can never be activated
- The spacing/borderRadius tokens are dead code

**Fix:** Import and use `colors.light.*` and `spacing.*` throughout, and consider a `ThemeContext` for dark mode support.

---

### 6. Duplicated board logic between `handleCellPress` and the bot effect

Both the player move handler ([lines 31-65](file:///Users/venky/Desktop/game/mobile/src/hooks/useGame.ts#L31-L65)) and the bot logic ([lines 94-133](file:///Users/venky/Desktop/game/mobile/src/hooks/useGame.ts#L94-L133)) contain nearly identical post-move logic:
- Check if quotas are met → draw
- Check if valid moves remain → draw
- Switch player

**Fix:** Extract a `processMove(player, index)` function that handles placement, conflict detection, quota checks, draw detection, and turn switching in one place.

---

### 7. `Array.includes()` in hot loop for conflict checking

In [moves.ts](file:///Users/venky/Desktop/game/mobile/src/utils/moves.ts), `hasValidMoves` and `getBotMove` (Hard mode) call `placedIndices.includes(i)` inside a loop over all cells. On an 8×8 board that's 64 iterations × up to 10 placed queens = 640 comparisons per call. For Hard mode, this is nested: for each valid move, simulate → check all cells → includes check = O(N² × k × N²).

While acceptable for 8×8, this becomes a problem if you ever add larger boards.

**Fix:** Convert `placedIndices` to a `Set<number>` before the loop. `Set.has()` is O(1) vs `Array.includes()` O(k):
```typescript
const placedSet = new Set(placedIndices);
// then: !placedSet.has(i) instead of !placedIndices.includes(i)
```

---

### 8. No navigation history / back handling

The app uses a simple `useState<AppScreen>` for navigation. This means:
- Android hardware back button does nothing (or exits the app)
- No concept of navigation stack (user can't "go back" to the previous screen without explicit back buttons)
- Deep linking is impossible

**Fix (short term):** Add a `BackHandler` listener in `App.tsx` that maps to logical "back" behavior for each screen.

**Fix (long term):** Since you already have `@react-navigation` installed in `package.json`, consider actually using it for proper stack navigation.

---

## 🟠 Medium — Code Quality & Maintainability

### 9. Achievements are fully hardcoded / static

[AchievementsScreen.tsx](file:///Users/venky/Desktop/game/mobile/src/screens/AchievementsScreen.tsx) renders static JSX with hardcoded `progress` values. There is no tracking of actual game wins, losses, or streaks — the screen is purely decorative.

**Fix:** Track game stats in AsyncStorage (wins, losses, streaks, difficulty played, timer mode, etc.) and derive achievement progress from real data.

---

### 10. Duplicate `SectionHeader` components across screens

`SectionHeader` is defined identically in:
- [RulesScreen.tsx](file:///Users/venky/Desktop/game/mobile/src/screens/RulesScreen.tsx#L38-L40)
- [SettingsScreen.tsx](file:///Users/venky/Desktop/game/mobile/src/screens/SettingsScreen.tsx#L33-L35)

Similarly, header/back-button layouts are copy-pasted across Rules, Settings, and Achievements screens.

**Fix:** Extract a shared `ScreenHeader` component and a shared `SectionHeader` component into `src/components/`.

---

### 11. Inline styles in `GameModeScreen.tsx`

This screen is 433 lines but contains **zero** `StyleSheet.create()` calls. Every single style is an inline object literal, meaning:
- New style objects are created on every render
- No static analysis or IDE autocomplete for styles
- Harder to maintain at scale

Compare to `LobbyScreen.tsx` or `RulesScreen.tsx` which use `StyleSheet.create()` properly.

**Fix:** Extract styles to a `StyleSheet.create()` block at the bottom of the file.

---

### 12. `SettingsScreen` imports SVG primitives after the component

```typescript
// Line 219, AFTER the component and AFTER the StyleSheet
import Svg, { Circle, Line, Path } from 'react-native-svg';
```

While this works in practice (due to hoisting), it's unconventional and confusing. All imports should be at the top of the file.

---

### 13. Dual exports in hooks

Both [useGame.ts](file:///Users/venky/Desktop/game/mobile/src/hooks/useGame.ts#L182) and [useBoard.ts](file:///Users/venky/Desktop/game/mobile/src/hooks/useBoard.ts#L26) have both a named export (`export function useGame`) AND a default export (`export default useGame`). Pick one pattern and stick with it.

---

### 14. `TurnState` type is hardcoded to "saara"

```typescript
// types/game.ts line 11
export type TurnState = 'your-turn' | 'saara-turn' | 'player1-turn' | 'player2-turn';
```

The bot name is configurable via Settings, but the type system hardcodes "saara." This is just a naming smell — rename to `'bot-turn'`.

---

## 🟢 Nice-to-Have — Feature & UX Improvements

### 15. No placement animation

When a queen is placed, it simply appears. A scale-in or drop animation using Reanimated would make the game feel much more alive. The `ScreenTransition` component shows you already know how to use `entering` animations.

### 16. No visual feedback for threatened squares

Players have no visual hint about which squares are under attack. A subtle highlight (light red tint or faint diagonal lines) on threatened rows/columns/diagonals would dramatically improve learnability for new players.

### 17. No game history / stats screen

There's no record of past games. A simple "Last 10 games" list showing mode, result, number of moves, and duration would add retention value and feed into the Achievements system.

### 18. Board doesn't show row/column labels

Chess-style labels (A–H, 1–8) around the board would help players discuss strategies and make the app feel more polished.

### 19. No exit animation on screen transitions

`ScreenTransition` only animates entry (`entering`). Adding an `exiting` animation (e.g., `FadeOutDown`) would make navigation feel smoother. This requires slight refactoring to delay unmounting.

### 20. Timer doesn't pause during bot's turn

In vs-bot mode, the timer keeps running during the bot's "thinking" delay. This is unfair because the bot's delay (300ms–1500ms) eats into the player's perceived time. Consider pausing the timer while it's the bot's turn.

---

## Summary Table

| # | Issue | Severity | Effort |
|---|-------|----------|--------|
| 1 | Sound/Haptics settings not wired | 🔴 Critical | Medium |
| 2 | Stale `Dimensions.get()` in Board | 🔴 Critical | Low |
| 3 | Undo exploit in vs-bot mode | 🔴 Critical | Low |
| 4 | Bot stale closure on placedQueens | 🔴 Critical | Low |
| 5 | Theme tokens unused | 🟡 High | High |
| 6 | Duplicated post-move logic | 🟡 High | Medium |
| 7 | Array.includes in hot loop | 🟡 High | Low |
| 8 | No back button / navigation stack | 🟡 High | Medium |
| 9 | Achievements are static | 🟠 Medium | High |
| 10 | Duplicated SectionHeader/Header | 🟠 Medium | Low |
| 11 | Inline styles in GameModeScreen | 🟠 Medium | Medium |
| 12 | Misplaced import in Settings | 🟠 Medium | Low |
| 13 | Dual export pattern in hooks | 🟠 Medium | Low |
| 14 | TurnState hardcodes "saara" | 🟠 Medium | Low |
| 15 | No queen placement animation | 🟢 Nice | Medium |
| 16 | No threatened-square highlighting | 🟢 Nice | Medium |
| 17 | No game history / stats | 🟢 Nice | High |
| 18 | No board row/column labels | 🟢 Nice | Low |
| 19 | No exit screen animation | 🟢 Nice | Medium |
| 20 | Timer runs during bot turn | 🟢 Nice | Low |
