import { useMemo } from 'react';
import { BoardSize } from '../types/board';
import { getBoardDimensions, indexToCoords, coordsToIndex } from '../utils/board';
import { checkConflict, hasValidMoves, getBotMove } from '../utils/moves';
import { Difficulty } from '../types/game';

export function useBoard(boardSize: BoardSize) {
  const { cols, cellsCount } = useMemo(() => getBoardDimensions(boardSize), [boardSize]);

  const helpers = useMemo(() => {
    return {
      indexToCoords: (index: number) => indexToCoords(index, cols),
      coordsToIndex: (row: number, col: number) => coordsToIndex(row, col, cols),
      checkConflict: (newIndex: number, placedIndices: number[]) => checkConflict(newIndex, placedIndices, boardSize),
      hasValidMoves: (placedIndices: number[]) => hasValidMoves(placedIndices, boardSize),
      getBotMove: (placedIndices: number[], difficulty: Difficulty) => getBotMove(placedIndices, boardSize, difficulty),
    };
  }, [boardSize, cols]);

  return {
    cols,
    cellsCount,
    ...helpers,
  };
}
export default useBoard;
