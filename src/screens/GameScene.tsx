import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import Board from '../components/Board';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Queen from '../components/Queen';
import { useGame } from '../hooks/useGame';
import { PauseIcon, HistoryIcon, TimerIcon } from '../assets/icons/icons';
import { GameParams, TurnState, AppScreen } from '../types/game';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { useAchievements } from '../theme/AchievementsContext';
import { useRewardedAd, useInterstitialAd, TestIds } from 'react-native-google-mobile-ads';

// Main GameScene Screen Component
type GameSceneProps = {
  gameParams: GameParams;
  onNavigate: (screen: AppScreen) => void;
};

export default function GameScene({ gameParams, onNavigate }: GameSceneProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const turnStylesThemed = useMemo(() => createTurnStyles(colors), [colors]);
  const counterStylesThemed = useMemo(() => createCounterStyles(colors), [colors]);
  const timerStylesThemed = useMemo(() => createTimerStyles(colors), [colors]);
  const { recordMatch, state: achievementState, resetAdCounter } = useAchievements();
  const [recordedGame, setRecordedGame] = useState(false);

  const [botName, setBotName] = useState('Saara');

  useEffect(() => {
    AsyncStorage.getItem('@qr_bot_name').then(name => {
      if (name) setBotName(name);
    });
  }, []);
  const {
    placedQueens,
    gameState,
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
    handleReplay: originalHandleReplay,
    handleUndo: originalHandleUndo,
    freeUndosUsed,
    setFreeUndosUsed,
  } = useGame({
    boardSize: gameParams.boardSize,
    gameMode: gameParams.gameMode,
    difficulty: gameParams.difficulty,
    timePerMove: gameParams.timePerMove,
  });

  const adUnitId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-5818429762885270/3891217509';
  const { isLoaded, isEarnedReward, isClosed, load, show } = useRewardedAd(adUnitId, {
    requestNonPersonalizedAdsOnly: true,
  });

  const interstitialAdUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-5818429762885270/8768139663';
  const { 
    isLoaded: isInterstitialLoaded, 
    isClosed: isInterstitialClosed, 
    load: loadInterstitial, 
    show: showInterstitial 
  } = useInterstitialAd(interstitialAdUnitId, {
    requestNonPersonalizedAdsOnly: true,
  });

  const [showAdConfirm, setShowAdConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<'undo' | 'revive' | null>(null);
  const [hasDeclinedRevive, setHasDeclinedRevive] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<'lobby' | 'replay' | null>(null);

  useEffect(() => {
    load();
    loadInterstitial();
  }, [load, loadInterstitial]);

  useEffect(() => {
    if (isEarnedReward && pendingAction) {
      if (pendingAction === 'undo' || pendingAction === 'revive') {
        if (pendingAction === 'undo') setShowAdConfirm(false);
        originalHandleUndo();
      }
      setPendingAction(null);
    }
  }, [isEarnedReward, pendingAction, originalHandleUndo]);

  useEffect(() => {
    if (isClosed) {
      setPendingAction(null);
      load(); // manually load next ad
    }
  }, [isClosed, load]);

  const wrappedHandleReplay = useCallback(() => {
    setRecordedGame(false);
    setHasDeclinedRevive(false);
    originalHandleReplay();
  }, [originalHandleReplay]);

  const executeNavigation = useCallback((navTarget: 'lobby' | 'replay') => {
    if (navTarget === 'lobby') {
      onNavigate('lobby');
    } else if (navTarget === 'replay') {
      wrappedHandleReplay();
    }
  }, [onNavigate, wrappedHandleReplay]);

  useEffect(() => {
    if (isInterstitialClosed && pendingNavigation) {
      resetAdCounter();
      executeNavigation(pendingNavigation);
      setPendingNavigation(null);
      loadInterstitial();
    }
  }, [isInterstitialClosed, pendingNavigation, resetAdCounter, loadInterstitial, executeNavigation]);

  const handleWatchAd = (action: 'undo' | 'revive') => {
    if (isLoaded) {
      setPendingAction(action);
      show();
    } else {
      Alert.alert('Ad not ready', 'Please wait a moment for the ad to load and try again.');
    }
  };

  const handleInterceptNavigation = (navTarget: 'lobby' | 'replay') => {
    if (achievementState.gamesPlayedSinceLastAd >= 3 && isInterstitialLoaded) {
      setPendingNavigation(navTarget);
      showInterstitial();
    } else {
      executeNavigation(navTarget);
    }
  };

  const wrappedHandleUndo = () => {
    if (gameState !== 'playing') {
      setRecordedGame(false);
    }
    
    if (gameParams.gameMode === 'vs-bot') {
      if (freeUndosUsed < 1) {
        setFreeUndosUsed((prev: number) => prev + 1);
        originalHandleUndo();
      } else {
        setShowAdConfirm(true);
      }
    } else {
      originalHandleUndo();
    }
  };

  useEffect(() => {
    if (gameState !== 'playing' && !recordedGame) {
      if (gameState === 'p2_lost' || gameState === 'p1_lost') {
        const won = (gameParams.gameMode === 'vs-bot' && gameState === 'p2_lost') ||
                    (gameParams.gameMode === 'two-player' && gameState === 'p2_lost'); 
        recordMatch(won, gameParams.gameMode, gameParams.difficulty, gameParams.timePerMove);
      }
      setRecordedGame(true);
    }
  }, [gameState, recordedGame, gameParams, recordMatch]);

  let overlayTitle = '';
  let overlaySubtitle = '';

  if (gameState === 'p1_lost') {
    overlayTitle = gameParams.gameMode === 'two-player' ? 'Player 2 Wins!' : 'You Lost!';
    overlaySubtitle = isTimeout
      ? "Time's up!"
      : gameParams.gameMode === 'two-player'
        ? 'Player 1 made an invalid placement.'
        : 'Invalid placement. Queens are attacking each other.';
  } else if (gameState === 'p2_lost') {
    overlayTitle = gameParams.gameMode === 'two-player' ? 'Player 1 Wins!' : 'You Won!';
    overlaySubtitle = isTimeout
      ? "Time's up!"
      : gameParams.gameMode === 'two-player'
        ? 'Player 2 made an invalid placement.'
        : 'The Bot made an invalid placement.';
  } else if (gameState === 'draw') {
    overlayTitle = 'Draw!';
    overlaySubtitle = 'No valid moves left on the board.';
  }

  const showReviveModal = 
    gameParams.gameMode === 'vs-bot' && 
    gameState === 'p1_lost' && 
    !hasDeclinedRevive;

  const showGameOverModal = 
    gameState !== 'playing' && 
    !showReviveModal;

  // Local UI subcomponents
  function ScreenTitle({ title }: { title: string }) {
    return <Text style={styles.screenTitle}>{title}</Text>;
  }

  function TurnIndicator({ turn }: { turn: TurnState }) {
    const TURN_CONFIG: Record<TurnState, { label: string; dotColor: string }> = {
      'your-turn': { label: "Your Turn", dotColor: colors.player1 },
      'saara-turn': { label: `${botName}'s Turn`, dotColor: colors.player2 },
      'player1-turn': { label: "Player 1's Turn", dotColor: colors.player1 },
      'player2-turn': { label: "Player 2's Turn", dotColor: colors.player2 },
    };

    const config = TURN_CONFIG[turn];

    return (
      <View style={turnStylesThemed.container}>
        <Text style={turnStylesThemed.label}>STATUS</Text>
        <View style={turnStylesThemed.row}>
          <View style={[turnStylesThemed.dot, { backgroundColor: config.dotColor }]} />
          <Text style={turnStylesThemed.turnText}>{config.label}</Text>
        </View>
      </View>
    );
  }

  function QueenCounter({ remaining }: { remaining: number }) {
    return (
      <View style={counterStylesThemed.container}>
        <Queen size={24} color={colors.text} />
        <Text style={counterStylesThemed.text}>Queens: {remaining}</Text>
      </View>
    );
  }

  function TimerDisplay({ timeLeft: tl, maxTime: mt }: { timeLeft: number | null; maxTime: number | null }) {
    const isLowTime = tl !== null && tl <= 5 && tl > 0;
    const opacity = useSharedValue(1);

    useEffect(() => {
      if (isLowTime) {
        opacity.value = withRepeat(withTiming(0.4, { duration: 500 }), -1, true);
      } else {
        opacity.value = 1;
      }
    }, [isLowTime, opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: isLowTime ? opacity.value : 1,
    }));

    if (tl == null || mt == null || mt === 0) return null;

    return (
      <Animated.View style={[timerStylesThemed.container, isLowTime ? timerStylesThemed.lowTime : timerStylesThemed.normal, animatedStyle]}>
        <TimerIcon size={16} color={isLowTime ? '#DC2626' : colors.textMuted} />
        <Text style={[timerStylesThemed.text, isLowTime && timerStylesThemed.textLow]}>
          00:{tl.toString().padStart(2, '0')}
        </Text>
      </Animated.View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Modal for Game Over */}
        <Modal
          visible={showGameOverModal}
          type="game-over"
          title={overlayTitle}
          subtitle={overlaySubtitle}
          onConfirm={() => handleInterceptNavigation('replay')}
          onCancel={() => handleInterceptNavigation('lobby')}
        />

        {/* Modal for Revive */}
        <Modal
          visible={showReviveModal}
          type="revive"
          subtitle="Watch a short video to undo your last move and keep playing!"
          onConfirm={() => handleWatchAd('revive')}
          onCancel={() => setHasDeclinedRevive(true)}
        />

        {/* Modal for Ad Confirm */}
        <Modal
          visible={showAdConfirm}
          type="ad-confirm"
          subtitle="Watch a short ad to undo your move?"
          onConfirm={() => handleWatchAd('undo')}
          onCancel={() => setShowAdConfirm(false)}
        />

        {/* Modal for Resign Confirmation */}
        <Modal
          visible={showResignConfirm}
          type="resign"
          subtitle="Are you sure you want to resign and return to the lobby? Your current progress will be lost."
          onConfirm={() => handleInterceptNavigation('lobby')}
          onCancel={() => setShowResignConfirm(false)}
        />

        <View style={styles.inner}>

          {/* Screen Title */}
          <ScreenTitle title="Gameplay" />

          {/* Status Bar */}
          <View style={styles.statusBar}>
            <TurnIndicator turn={currentTurnStr} />
            <QueenCounter remaining={remainingQueens} />
          </View>

          {/* Timer */}
          <TimerDisplay timeLeft={timeLeft} maxTime={maxTime} />

          {/* Board */}
          <Board
            size={gameParams.boardSize}
            placedQueens={placedQueens}
            onCellPress={handleCellPress}
            isPaused={isPaused}
            onResume={() => setIsPaused(false)}
          />

          {/* Controls */}
          <View style={styles.controls}>
            <Button
              onPress={() => setIsPaused(true)}
              style={styles.circleBtn}
            >
              <PauseIcon size={20} color={colors.textMuted} />
            </Button>

            <Button
              onPress={() => setShowResignConfirm(true)}
              style={styles.resignBtn}
            >
              <Text style={styles.resignText}>RESIGN</Text>
            </Button>

            <Button
              onPress={wrappedHandleUndo}
              style={styles.circleBtn}
            >
              <HistoryIcon size={20} color={colors.textMuted} />
            </Button>
          </View>

        </View>
      </View>
    </SafeAreaView>
  );
}

const createTurnStyles = (colors: any) => StyleSheet.create({
  container: {
    gap: 4,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    letterSpacing: 1.2,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  turnText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 20,
    letterSpacing: 0.2,
    color: colors.text,
  },
});

const createCounterStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 1.12,
    color: colors.text,
  },
});

const createTimerStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  normal: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lowTime: {
    backgroundColor: '#FEE2E2',
    borderWidth: 0,
  },
  text: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14,
    width: 56,
    textAlign: 'center',
    letterSpacing: 0.5,
    color: colors.textMuted,
  },
  textLow: {
    color: '#DC2626',
  },
});

const createStyles = (colors: any) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    position: 'relative',
  },
  inner: {
    alignItems: 'center',
    gap: 20,
    width: '100%',
    maxWidth: 400,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resignBtn: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: colors.accent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  resignText: {
    color: colors.background,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    letterSpacing: 3,
  },
  screenTitle: {
    textTransform: 'uppercase',
    textAlign: 'center',
    color: colors.text,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 4.8,
  },
});
