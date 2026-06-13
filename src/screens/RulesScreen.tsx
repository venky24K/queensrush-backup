import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BoardRuleIcon,
  BotIcon,
  ChevronLeftIcon,
  DoubleCheckIcon,
  NoEntryIcon,
  StarIcon,
  TimerIcon,
  TrophyIcon,
  UsersIcon,
  WarningIcon,
  XIcon
} from '../assets/icons/icons';
import { AppScreen } from '../types/game';
import { useTheme } from '../theme/ThemeContext';
import { useSettings } from '../theme/SettingsContext';

type RulesScreenProps = {
  onNavigate: (screen: AppScreen) => void;
};

export default function RulesScreen({ onNavigate }: RulesScreenProps) {
  const { colors, isDark } = useTheme();
  const { playHaptic } = useSettings();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [botName, setBotName] = useState('Saara');

  useEffect(() => {
    AsyncStorage.getItem('@qr_bot_name').then(name => {
      if (name) setBotName(name);
    });
  }, []);

  function RuleCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
      <View style={styles.ruleCard}>
        <View style={styles.ruleIconBox}>{icon}</View>
        <View style={styles.ruleTextBox}>
          <Text style={styles.ruleTitle}>{title}</Text>
          <Text style={styles.ruleDescription}>{description}</Text>
        </View>
      </View>
    );
  }

  function SectionHeader({ label }: { label: string }) {
    return <Text style={styles.sectionHeader}>{label}</Text>;
  }

  function TipCard({ text, bold }: { text: string; bold: string }) {
    return (
      <View style={styles.tipCard}>
        <Text style={styles.tipText}>
          💡 <Text style={styles.tipBold}>{bold}</Text> {text}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>

          {/* Header */}
          <View style={styles.header}>
            <Pressable
              onPress={() => {
                playHaptic();
                onNavigate('lobby');
              }}
              style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            >
              <ChevronLeftIcon size={18} color={colors.icon} />
            </Pressable>
            <Text style={styles.headerTitle}>Rules</Text>
          </View>

          {/* Intro */}
          <View style={styles.introCard}>
            <Text style={styles.introTitle}>Welcome to Queens Rush</Text>
            <Text style={styles.introText}>
              Queens Rush is a strategic two-player battle of wit and territory. Players take alternating turns placing Queens on a shared board, and the goal is simple — never let your Queen attack another. One wrong move and the game is over.
            </Text>
          </View>

          {/* Core Rules */}
          <SectionHeader label="THE CORE RULES" />
          <View style={styles.ruleSection}>
            <RuleCard
              icon={<BoardRuleIcon size={20} color={colors.text} />}
              title="The Board"
              description="The game is played on either a 6×6 (Quick) or 8×8 (Standard) grid — a chessboard-style arena where every square counts."
            />
            <RuleCard
              icon={<StarIcon size={20} color={colors.text} />}
              title="Placing a Queen"
              description="On your turn, tap any empty square to place your Queen on it. That's all it takes — but choose wisely. A careless placement ends the game immediately."
            />
            <RuleCard
              icon={<XIcon size={20} color={colors.text} />}
              title="The No-Conflict Rule"
              description="No two Queens on the board — regardless of which player placed them — may share the same row, column, or diagonal. This is the golden rule of Queens Rush, and breaking it is an immediate forfeit."
            />
            <RuleCard
              icon={<WarningIcon size={20} color={colors.text} />}
              title="Invalid Move = Instant Loss"
              description="If you place a Queen that conflicts with any existing Queen on the board, you lose — instantly. There are no take-backs or warnings. Think before you place."
            />
          </View>

          {/* How to Win */}
          <SectionHeader label="HOW TO WIN & LOSE" />
          <View style={styles.ruleSection}>
            <RuleCard
              icon={<TrophyIcon size={20} color={colors.text} />}
              title="Winning the Match"
              description="You win if your opponent makes an invalid move, or if they run out of time. You can also win by exhausting the board of all safe squares — if this happens, the player with the most Queens on the board wins!"
            />
            <RuleCard
              icon={<NoEntryIcon size={20} color={colors.text} />}
              title="Losing the Match"
              description="You lose instantly if you place a Queen in a conflicting position — sharing the same row, column, or diagonal as any other Queen. You also forfeit the match if your move timer hits zero."
            />
            <RuleCard
              icon={<DoubleCheckIcon size={20} color={colors.text} />}
              title="The Trapping Tie-Breaker"
              description="If the board runs out of safe squares and both players have placed the exact same number of Queens, the victory goes to the player who made the final valid move to trap their opponent."
            />
          </View>

          {/* Game Modes & Settings */}
          <SectionHeader label="GAME MODES & SETTINGS" />
          <View style={styles.ruleSection}>
            <RuleCard
              icon={<TimerIcon size={20} color={colors.text} />}
              title="The Move Timer"
              description="Each player has a set amount of time (15s or 30s) to make their move. If the clock runs out before you place a Queen, you automatically forfeit the turn — and the match. Play fast, play smart."
            />
            <RuleCard
              icon={<UsersIcon size={20} color={colors.text} />}
              title="Player vs Player"
              description="Challenge a friend on the same device. You'll take turns passing the phone and placing Queens, racing to outwit each other on the same shared board. The ultimate local duel."
            />
            <RuleCard
              icon={<BotIcon size={20} color={colors.text} />}
              title={`Player vs Bot (${botName})`}
              description={`Face off against ${botName}, the AI opponent. Her behaviour adapts to your chosen difficulty — Easy ${botName} makes occasional mistakes you can exploit, Medium ${botName} plays safe and randomly, and Hard ${botName} actively tries to corner you by minimizing your available squares.`}
            />
          </View>

          {/* Strategy Tips */}
          <SectionHeader label="STRATEGY TIPS" />
          <View style={styles.ruleSection}>
            <TipCard
              bold="Think offensively."
              text="The best Queens Rush players don't just pick safe squares — they pick squares that eliminate their opponent's safest options next turn."
            />
            <TipCard
              bold="Diagonals are deadly."
              text="New players often overlook diagonals. A Queen on one corner can threaten squares all the way across the board."
            />
            <TipCard
              bold="Control the center."
              text="Queens placed in the center dominate more rows, columns, and diagonals, restricting both players more aggressively."
            />
            <TipCard
              bold="Watch the timer."
              text="A great move made 1 second too late is still a loss. If you're unsure, place a safe move first and think deeper next round."
            />
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  inner: {
    width: '100%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
    marginTop: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnPressed: {
    backgroundColor: colors.border,
  },
  headerTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 24,
    color: colors.text,
  },
  introCard: {
    backgroundColor: isDark ? colors.card : colors.accent,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border,
  },
  introTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 18,
    color: isDark ? colors.text : '#fff',
    marginBottom: 8,
  },
  introText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: isDark ? colors.textMuted : '#D1D5DB',
    lineHeight: 22,
  },
  sectionHeader: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  ruleSection: {
    gap: 12,
    marginBottom: 20,
  },
  ruleCard: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ruleIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleTextBox: {
    flex: 1,
  },
  ruleTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  ruleDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
  },
  tipCard: {
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
  },
  tipBold: {
    fontFamily: 'Inter_600SemiBold',
    color: colors.text,
  },
});
