import { useSettings } from '../theme/SettingsContext';
import * as ExpoHaptics from 'expo-haptics';
import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  Text,
  UIManager,
  useWindowDimensions,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BotIcon, CheckIcon, ChevronLeftIcon, UsersIcon } from '../assets/icons/icons';
import { BoardSize } from '../types/board';
import { Difficulty, GameMode, GameParams, TimerOption, AppScreen } from '../types/game';
import { useTheme } from '../theme/ThemeContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Responsive hook ──────────────────────────────────────────────────────────

function useResponsive() {
  const { width } = useWindowDimensions(); // re-renders on rotation/resize
  return useMemo(() => {
    const isTablet = width >= 600;
    const isSmall = width < 370;

    return {
      isTablet,
      isSmall,
      width,
      // page layout
      px: isTablet ? 32 : isSmall ? 16 : 20,
      maxWidth: isTablet ? 680 : 440,
      sectionGap: isTablet ? 36 : isSmall ? 24 : 28,
      cardGap: isTablet ? 16 : 12,
      // typography
      titleSize: isTablet ? 28 : isSmall ? 20 : 24,
      sectionSize: isTablet ? 20 : isSmall ? 16 : 18,
      bodySize: isTablet ? 14 : isSmall ? 11 : 13,
      segmentSize: isTablet ? 15 : isSmall ? 12 : 14,
      btnTextSize: isTablet ? 20 : isSmall ? 15 : 18,
      badgeSize: isTablet ? 13 : 11,
      // card
      cardPad: isTablet ? 28 : isSmall ? 14 : 20,
      cardRadius: isTablet ? 36 : isSmall ? 22 : 28,
      // icon circle
      circleSize: isTablet ? 72 : isSmall ? 48 : 60,
      iconSize: isTablet ? 36 : isSmall ? 24 : 30,
      // segmented control
      segPy: isTablet ? 16 : isSmall ? 10 : 13,
      segRadius: isTablet ? 22 : 18,
      segInner: isTablet ? 18 : 14,
      // start button
      btnPy: isTablet ? 22 : isSmall ? 14 : 18,
      btnRadius: isTablet ? 28 : isSmall ? 18 : 22,
      // checkmark badge
      checkSize: isTablet ? 26 : isSmall ? 20 : 24,
      checkIcon: isTablet ? 16 : 13,
    };
  }, [width]);
}

// ─── ModeCard ─────────────────────────────────────────────────────────────────

type ModeCardProps = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  isSelected: boolean;
  onPress: () => void;
  r: ReturnType<typeof useResponsive>;
  colors: any;
  playHaptic: (style?: ExpoHaptics.ImpactFeedbackStyle) => void;
};

function ModeCard({ title, subtitle, icon, isSelected, onPress, r, colors, playHaptic }: ModeCardProps) {
  const handlePress = useCallback(() => {
    playHaptic(ExpoHaptics.ImpactFeedbackStyle.Medium);
    onPress();
  }, [onPress]);

  const cardStyle = useMemo(() => ({
    position: 'relative' as const,
    flex: r.isTablet ? 1 : undefined,
    width: r.isTablet ? undefined : ('100%' as const),
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: r.cardPad,
    backgroundColor: colors.card,
    borderRadius: r.cardRadius,
    borderWidth: 2.5,
    borderColor: isSelected ? colors.text : 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: isSelected ? 12 : 4 },
        shadowOpacity: isSelected ? 0.08 : 0.04,
        shadowRadius: isSelected ? 40 : 20,
      },
      android: { elevation: isSelected ? 6 : 2 },
    }),
  }), [isSelected, r, colors]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [cardStyle, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={`${title}. ${subtitle}`}
    >
      {isSelected && (
        <View style={{
          position: 'absolute',
          top: 14,
          right: 14,
          width: r.checkSize,
          height: r.checkSize,
          backgroundColor: colors.text,
          borderRadius: r.checkSize / 2,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <CheckIcon size={r.checkIcon} color={colors.background} />
        </View>
      )}

      <View style={{
        width: r.circleSize,
        height: r.circleSize,
        borderRadius: r.circleSize / 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: r.isSmall ? 10 : 14,
        backgroundColor: isSelected ? colors.text : colors.secondary,
      }}>
        {icon}
      </View>

      <Text style={{
        fontFamily: 'Montserrat_700Bold',
        fontSize: r.isTablet ? 14 : r.isSmall ? 11 : 13,
        letterSpacing: 1.8,
        textTransform: 'uppercase',
        color: colors.text,
        marginBottom: 5,
        textAlign: 'center',
      }}>
        {title}
      </Text>
      <Text style={{
        fontFamily: 'Inter_500Medium',
        fontSize: r.bodySize,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: r.bodySize * 1.5,
      }}>
        {subtitle}
      </Text>
    </Pressable>
  );
}

// ─── SegmentedControl ─────────────────────────────────────────────────────────

type SegmentedOption = string | { label: string; value: string };

type SegmentedControlProps = {
  options: SegmentedOption[];
  value: string;
  onChange: (val: string) => void;
  r: ReturnType<typeof useResponsive>;
  colors: any;
  playHaptic: (style?: ExpoHaptics.ImpactFeedbackStyle) => void;
};

function SegmentedControl({ options, value, onChange, r, colors, playHaptic }: SegmentedControlProps) {
  // Normalize once — avoids repeated typeof checks per render
  const normalized = useMemo(() =>
    options.map(opt =>
      typeof opt === 'string' ? { label: opt, value: opt } : opt
    ), [options]);

  const handleChange = useCallback((val: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    playHaptic(ExpoHaptics.ImpactFeedbackStyle.Light);
    onChange(val);
  }, [onChange]);

  return (
    <View style={{
      flexDirection: 'row',
      width: '100%',
      backgroundColor: colors.secondary,
      borderRadius: r.segRadius,
      padding: 5,
      borderWidth: 1,
      borderColor: colors.border,
    }}>
      {normalized.map(({ label, value: optValue }) => {
        const isActive = optValue === value;
        return (
          <Pressable
            key={optValue}
            onPress={() => handleChange(optValue)}
            style={[{
              flex: 1,
              paddingVertical: r.segPy,
              borderRadius: r.segInner,
              alignItems: 'center',
              justifyContent: 'center',
            }, isActive && {
              backgroundColor: colors.card,
            }]}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={label}
          >
            <Text style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: r.segmentSize,
              color: isActive ? colors.text : colors.textMuted,
            }}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Board label map ──────────────────────────────────────────────────────────

const BOARD_LABELS: Record<BoardSize, string> = {
  '6x6': 'Quick',
  '8x8': 'Standard',
};

// ─── GameModeScreen ───────────────────────────────────────────────────────────

type GameModeScreenProps = {
  onNavigate: (screen: AppScreen) => void;
  onStartGame: (params: GameParams) => void;
};

export default function GameModeScreen({ onStartGame, onNavigate }: GameModeScreenProps) {
  const { colors } = useTheme();
  const { playHaptic } = useSettings();
  const r = useResponsive();

  const [boardSize, setBoardSize] = useState<BoardSize>('8x8');
  const [gameMode, setGameMode] = useState<GameMode>('vs-bot');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [timePerMove, setTimePerMove] = useState<TimerOption>('15s');

  const handleSetMode = useCallback((mode: GameMode) => {
    setGameMode(mode);
    if (mode === 'two-player') setDifficulty('Medium'); // reset stale difficulty
  }, []);

  const handleStartMatch = useCallback(() => {
    playHaptic(ExpoHaptics.ImpactFeedbackStyle.Heavy);
    onStartGame({ boardSize, gameMode, difficulty, timePerMove });
  }, [boardSize, gameMode, difficulty, timePerMove, onStartGame]);

  const startLabel = `Start match — ${gameMode === 'vs-bot' ? `bot, ${difficulty}` : 'two player'}, ${boardSize}, ${timePerMove}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          alignItems: 'center',
          paddingHorizontal: r.px,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: '100%', maxWidth: r.maxWidth, marginTop: r.isTablet ? 24 : 16 }}>

          {/* Header with Back Button */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: r.isTablet ? 28 : 20,
            width: '100%',
            position: 'relative',
          }}>
            <View style={{ position: 'absolute', left: 0, zIndex: 10 }}>
              <Pressable
                onPress={() => {
                  playHaptic(ExpoHaptics.ImpactFeedbackStyle.Light);
                  onNavigate('lobby');
                }}
                style={({ pressed }) => [{
                  width: r.isTablet ? 48 : 40,
                  height: r.isTablet ? 48 : 40,
                  borderRadius: r.isTablet ? 24 : 20,
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }, pressed && {
                  backgroundColor: colors.border,
                  opacity: 0.9,
                }]}
                accessibilityRole="button"
                accessibilityLabel="Go back to lobby"
              >
                <ChevronLeftIcon size={r.isTablet ? 22 : 18} color={colors.icon} />
              </Pressable>
            </View>
            <Text style={{
              fontFamily: 'Montserrat_700Bold',
              fontSize: r.titleSize,
              color: colors.text,
              textAlign: 'center',
            }}>
              Select Game Mode
            </Text>
          </View>

          {/* Mode Cards — row on tablet, column on phone */}
          <View style={{
            flexDirection: r.isTablet ? 'row' : 'column',
            gap: r.cardGap,
            marginBottom: r.sectionGap,
          }}>
            <ModeCard
              title="Player vs Player"
              subtitle="Challenge a friend locally or online."
              icon={<UsersIcon size={r.iconSize} color={gameMode === 'two-player' ? colors.background : colors.text} />}
              isSelected={gameMode === 'two-player'}
              onPress={() => handleSetMode('two-player')}
              r={r}
              colors={colors}
              playHaptic={playHaptic}
            />
            <ModeCard
              title="Player vs Bot"
              subtitle="Practice against our advanced AI."
              icon={<BotIcon size={r.iconSize} color={gameMode === 'vs-bot' ? colors.background : colors.text} />}
              isSelected={gameMode === 'vs-bot'}
              onPress={() => handleSetMode('vs-bot')}
              r={r}
              colors={colors}
              playHaptic={playHaptic}
            />
          </View>

          {/* Board Size */}
          <View style={{ marginBottom: r.sectionGap }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: r.sectionSize, color: colors.text }}>
                Board Size
              </Text>
              <View style={{ backgroundColor: colors.secondary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: r.badgeSize, color: colors.text }}>
                  {BOARD_LABELS[boardSize]}
                </Text>
              </View>
            </View>
            <SegmentedControl
              options={[
                { label: '6 × 6', value: '6x6' },
                { label: '8 × 8', value: '8x8' },
              ]}
              value={boardSize}
              onChange={(val) => setBoardSize(val as BoardSize)}
              r={r}
              colors={colors}
              playHaptic={playHaptic}
            />
          </View>

          {/* Bot Difficulty — only visible in vs-bot mode */}
          {gameMode === 'vs-bot' && (
            <View style={{ marginBottom: r.sectionGap }}>
              <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: r.sectionSize, color: colors.text, marginBottom: 14 }}>
                Bot Difficulty
              </Text>
              <SegmentedControl
                options={['Easy', 'Medium', 'Hard']}
                value={difficulty}
                onChange={(val) => setDifficulty(val as Difficulty)}
                r={r}
                colors={colors}
                playHaptic={playHaptic}
              />
            </View>
          )}

          {/* Timer */}
          <View style={{ marginBottom: r.sectionGap }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: r.sectionSize, color: colors.text, marginBottom: 14 }}>
              Time per Move
            </Text>
            <SegmentedControl
              options={['15s', '30s', 'Off']}
              value={timePerMove}
              onChange={(val) => setTimePerMove(val as TimerOption)}
              r={r}
              colors={colors}
              playHaptic={playHaptic}
            />
          </View>

          {/* Start Button */}
          <Pressable
            onPress={handleStartMatch}
            style={({ pressed }) => ({
              width: '100%',
              marginTop: 8,
              backgroundColor: pressed ? colors.primaryPressed : colors.primary,
              paddingVertical: r.btnPy,
              borderRadius: r.btnRadius,
              alignItems: 'center' as const,
              justifyContent: 'center' as const,
              transform: pressed ? [{ scale: 0.98 }] : [],
              ...Platform.select({
                ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20 },
                android: { elevation: 6 },
              }),
            })}
            accessibilityRole="button"
            accessibilityLabel={startLabel}
          >
            <Text style={{
              fontFamily: 'Montserrat_700Bold',
              fontSize: r.btnTextSize,
              color: colors.background,
              letterSpacing: 4,
            }}>
              START MATCH
            </Text>
          </Pressable>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}