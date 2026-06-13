import { BoardSize } from '../types/board';

export function getBoardDimensions(boardSize: BoardSize) {
  const cols = boardSize === '8x8' ? 8 : 6;
  return { cols, cellsCount: cols * cols };
}

export function indexToCoords(index: number, cols: number) {
  return {
    row: Math.floor(index / cols),
    col: index % cols,
  };
}

export function coordsToIndex(row: number, col: number, cols: number) {
  return row * cols + col;
}
