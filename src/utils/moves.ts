import { BoardSize } from '../types/board';
import { Difficulty } from '../types/game';
import { indexToCoords } from './board';

export function checkConflict(newIndex: number, placedIndices: number[], boardSize: BoardSize): boolean {
  const cols = boardSize === '8x8' ? 8 : 6;
  const { row: r1, col: c1 } = indexToCoords(newIndex, cols);

  for (const placed of placedIndices) {
    const { row: r2, col: c2 } = indexToCoords(placed, cols);
    if (r1 === r2 || c1 === c2 || Math.abs(r1 - r2) === Math.abs(c1 - c2)) {
      return true;
    }
  }
  return false;
}

export function hasValidMoves(placedIndices: number[], boardSize: BoardSize): boolean {
  const cols = boardSize === '8x8' ? 8 : 6;
  const cellsCount = cols * cols;
  for (let i = 0; i < cellsCount; i++) {
    if (!placedIndices.includes(i) && !checkConflict(i, placedIndices, boardSize)) {
      return true;
    }
  }
  return false;
}

export function getBotMove(placedIndices: number[], boardSize: BoardSize, difficulty: Difficulty): number {
  const cols = boardSize === '8x8' ? 8 : 6;
  const cellsCount = cols * cols;
  
  const validMoves: number[] = [];
  for (let i = 0; i < cellsCount; i++) {
    if (!placedIndices.includes(i) && !checkConflict(i, placedIndices, boardSize)) {
      validMoves.push(i);
    }
  }

  if (validMoves.length === 0) return -1;

  if (difficulty === 'Easy') {
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  } else if (difficulty === 'Medium') {
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  } else {
    // Hard: Pick a move that minimizes opponent's next valid moves
    let bestMove = validMoves[0];
    let minOpponentMoves = Infinity;

    for (const move of validMoves) {
      let opponentMoves = 0;
      for (let j = 0; j < cellsCount; j++) {
        if (!placedIndices.includes(j) && j !== move && !checkConflict(j, [...placedIndices, move], boardSize)) {
          opponentMoves++;
        }
      }
      if (opponentMoves < minOpponentMoves) {
        minOpponentMoves = opponentMoves;
        bestMove = move;
      }
    }
    return bestMove;
  }
}
