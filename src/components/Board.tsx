import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import Cell from './Cell';
import Queen from './Queen';
import Modal from './Modal';
import { BoardSize, PlacedQueen } from '../types/board';
import { useTheme } from '../theme/ThemeContext';

type BoardProps = {
  size?: BoardSize;
  placedQueens?: PlacedQueen[];
  onCellPress?: (index: number) => void;
  isPaused?: boolean;
  onResume?: () => void;
};

const BOARD_PADDING = 12;
const SCREEN_WIDTH = Dimensions.get('window').width;
const MAX_BOARD_WIDTH = Math.min(SCREEN_WIDTH - 32, 400);

export default function Board({ size = '8x8', placedQueens = [], onCellPress, isPaused = false, onResume }: BoardProps) {
  const { colors, isDark } = useTheme();
  const cols = size === '8x8' ? 8 : 6;
  const cellsCount = cols * cols;
  const boardInnerWidth = MAX_BOARD_WIDTH - BOARD_PADDING * 2;
  const cellSize = Math.floor(boardInnerWidth / cols);
  const actualBoardWidth = cellSize * cols + BOARD_PADDING * 2;

  return (
    <View style={[styles.boardContainer, { width: actualBoardWidth, backgroundColor: isDark ? colors.border : '#F5F5F5' }]}>
      <Modal visible={isPaused} type="pause" onCancel={onResume} />
      
      <View style={[styles.grid, { width: cellSize * cols }]}>
        {Array.from({ length: cellsCount }).map((_, index) => {
          const row = Math.floor(index / cols);
          const col = index % cols;
          const isDarkCell = (row + col) % 2 === 0;
          const queen = placedQueens.find((q) => q.index === index);
          const queenSize = Math.floor(cellSize * 0.65);

          return (
            <Cell
              key={index}
              isDark={isDarkCell}
              size={cellSize}
              onPress={() => onCellPress?.(index)}
            >
              {queen && (
                <Queen
                  size={queenSize}
                  color={queen.player === 2 ? colors.player2 : colors.player1}
                />
              )}
            </Cell>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boardContainer: {
    padding: BOARD_PADDING,
    borderRadius: 24,
    aspectRatio: 1,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 16,
    overflow: 'hidden',
    flex: 1,
  },
});
