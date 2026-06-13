import { useState, useEffect, useRef } from 'react';
import { BoardSize, PlacedQueen } from '../types/board';
import { GameMode, Difficulty, TimerOption, GameState, TurnState } from '../types/game';
import * as ExpoHaptics from 'expo-haptics';
import { useSettings } from '../theme/SettingsContext';
import { useBoard } from './useBoard';
import { QUOTAS, TIMERS, BOT_DELAYS } from '../utils/constants';

interface UseGameProps {
  boardSize: BoardSize;
  gameMode: GameMode;
  difficulty: Difficulty;
  timePerMove: TimerOption;
}

export function useGame({ boardSize, gameMode, difficulty, timePerMove }: UseGameProps) {
  const { checkConflict: checkBoardConflict, hasValidMoves: hasBoardValidMoves, getBotMove } = useBoard(boardSize);
  const { playHaptic, playNotificationHaptic } = useSettings();

  const [placedQueens, setPlacedQueens] = useState<PlacedQueen[]>([]);
  const placedQueensRef = useRef(placedQueens);
  placedQueensRef.current = placedQueens;
  const [gameState, setGameState] = useState<GameState>('playing');
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [isPaused, setIsPaused] = useState(false);
  const [showResignConfirm, setShowResignConfirm] = useState(false);

  const maxTime = TIMERS[timePerMove];
  const [timeLeft, setTimeLeft] = useState<number | null>(maxTime);

  const quota = QUOTAS[boardSize];
  const currentPlacedCount = placedQueens.filter((q) => q.player === currentPlayer).length;
  const remainingQueens = quota - currentPlacedCount;

  const handleCellPress = (index: number) => {
    if (gameState !== 'playing' || isPaused || showResignConfirm) return;
    if (gameMode === 'vs-bot' && currentPlayer === 2) return;

    const isOccupied = placedQueens.find((q) => q.index === index);
    if (isOccupied) return;

    if (currentPlacedCount >= quota) return;

    const placedIndices = placedQueens.map((q) => q.index);
    const isConflict = checkBoardConflict(index, placedIndices);

    if (isConflict) {
      playNotificationHaptic(ExpoHaptics.NotificationFeedbackType.Error);
      setGameState(currentPlayer === 1 ? 'p1_lost' : 'p2_lost');
      setPlacedQueens((prev) => [...prev, { index, player: currentPlayer }]);
      return;
    }

    playHaptic(ExpoHaptics.ImpactFeedbackStyle.Medium);
    const newPlacedQueens = [...placedQueens, { index, player: currentPlayer }];
    setPlacedQueens(newPlacedQueens);

    const newIndices = newPlacedQueens.map((q) => q.index);
    const p1Count = newPlacedQueens.filter((q) => q.player === 1).length;
    const p2Count = newPlacedQueens.filter((q) => q.player === 2).length;

    if (p1Count === quota && p2Count === quota) {
      setGameState('draw');
    } else if (!hasBoardValidMoves(newIndices)) {
      setGameState('draw');
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }
  };

  // Timer Reset on turn change
  useEffect(() => {
    if (gameState === 'playing') {
      setTimeLeft(maxTime);
    }
  }, [currentPlayer, gameState, maxTime]);

  // Timer Countdown
  useEffect(() => {
    if (gameState !== 'playing' || isPaused || showResignConfirm || maxTime === null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timer);
          setGameState(currentPlayer === 1 ? 'p1_lost' : 'p2_lost');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, currentPlayer, maxTime, isPaused, showResignConfirm]);

  // Bot Logic
  useEffect(() => {
    if (gameState !== 'playing' || isPaused || showResignConfirm || gameMode !== 'vs-bot' || currentPlayer !== 2) {
      return;
    }

    const delay = BOT_DELAYS[difficulty];

    const botTimer = setTimeout(() => {
      const currentPlacedQueens = placedQueensRef.current;
      const placedIndices = currentPlacedQueens.map((q) => q.index);
      const botMove = getBotMove(placedIndices, difficulty);

      if (botMove !== -1 && checkBoardConflict(botMove, placedIndices)) {
        setGameState('p2_lost');
        setPlacedQueens((prev) => [...prev, { index: botMove, player: 2 }]);
        return;
      }

      if (botMove === -1) {
        setGameState('draw');
      } else {
        const botQueen: PlacedQueen = { index: botMove, player: 2 };
        const newPlacedQueens: PlacedQueen[] = [...currentPlacedQueens, botQueen];
        setPlacedQueens(newPlacedQueens);

        const newIndices = newPlacedQueens.map((q) => q.index);
        const p1Count = newPlacedQueens.filter((q) => q.player === 1).length;
        const p2Count = newPlacedQueens.filter((q) => q.player === 2).length;

        if (p1Count === quota && p2Count === quota) {
          setGameState('draw');
        } else if (!hasBoardValidMoves(newIndices)) {
          setGameState('draw');
        } else {
          setCurrentPlayer(1);
        }
      }
    }, delay);

    return () => clearTimeout(botTimer);
  }, [currentPlayer, gameState, gameMode, boardSize, placedQueens, difficulty, isPaused, showResignConfirm, quota, checkBoardConflict, getBotMove, hasBoardValidMoves]);

  const handleReplay = () => {
    playHaptic(ExpoHaptics.ImpactFeedbackStyle.Heavy);
    setPlacedQueens([]);
    setGameState('playing');
    setCurrentPlayer(1);
    setIsPaused(false);
    setShowResignConfirm(false);
  };

  const handleUndo = () => {
    if (isPaused || showResignConfirm || placedQueens.length === 0) return;

    playHaptic(ExpoHaptics.ImpactFeedbackStyle.Light);

    if (gameMode === 'vs-bot') {
      if (placedQueens.length >= 2) {
        setPlacedQueens((prev) => prev.slice(0, -2));
      } else {
        setPlacedQueens([]);
      }
      setCurrentPlayer(1);
    } else {
      const lastMove = placedQueens[placedQueens.length - 1];
      setPlacedQueens((prev) => prev.slice(0, -1));
      setCurrentPlayer(lastMove.player);
    }
    
    setGameState('playing');
    setTimeLeft(maxTime);
  };

  const isTimeout = timeLeft === 0;

  const currentTurnStr: TurnState = gameMode === 'two-player'
    ? (currentPlayer === 1 ? 'player1-turn' : 'player2-turn')
    : (currentPlayer === 1 ? 'your-turn' : 'saara-turn');

  return {
    placedQueens,
    gameState,
    currentPlayer,
    isPaused,
    setIsPaused,
    showResignConfirm,
    setShowResignConfirm,
    timeLeft,
    maxTime,
    remainingQueens,
    isTimeout,
    currentTurnStr,
    handleCellPress,
    handleReplay,
    handleUndo,
  };
}
export default useGame;
