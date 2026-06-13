import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from '../utils/haptics';
import {
  ChevronLeftIcon,
  TrophyIcon,
  MedalIcon,
  StarIcon,
  TimerIcon,
  BotIcon
} from '../assets/icons/icons';
import { AppScreen } from '../types/game';
import { useTheme } from '../theme/ThemeContext';

type AchievementProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  progress: number;
  total: number;
  isUnlocked: boolean;
  colors: any;
  styles: any;
};

function AchievementCard({ icon, title, description, progress, total, isUnlocked, colors, styles }: AchievementProps) {
  const percentage = Math.min((progress / total) * 100, 100);
  
  return (
    <View style={[styles.card, !isUnlocked && styles.cardLocked]}>
      <View style={[styles.iconBox, isUnlocked ? styles.iconUnlocked : styles.iconLockedBox]}>
        {icon}
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.title, !isUnlocked && styles.titleLocked]}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.progressRow}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${percentage}%` }, isUnlocked && styles.progressUnlocked]} />
          </View>
          <Text style={styles.progressText}>{progress}/{total}</Text>
        </View>
      </View>
    </View>
  );
}

type AchievementsScreenProps = {
  onNavigate: (screen: AppScreen) => void;
};

export default function AchievementsScreen({ onNavigate }: AchievementsScreenProps) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>

          {/* Header */}
          <View style={styles.header}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onNavigate('lobby');
              }}
              style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            >
              <ChevronLeftIcon size={18} color={colors.icon} />
            </Pressable>
            <Text style={styles.headerTitle}>Achievements</Text>
          </View>

          {/* Stats Summary */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>1</Text>
              <Text style={styles.statLabel}>UNLOCKED</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>TOTAL</Text>
            </View>
          </View>

          <Text style={styles.sectionHeader}>MASTERY MILESTONES</Text>
          
          <View style={styles.list}>
            <AchievementCard
              icon={<StarIcon size={24} color={colors.text} />}
              title="First Blood"
              description="Win your first match against any opponent."
              progress={1}
              total={1}
              isUnlocked={true}
              colors={colors}
              styles={styles}
            />
            
            <AchievementCard
              icon={<MedalIcon size={24} color={colors.textMuted} />}
              title="Tactician"
              description="Win 10 matches on Medium difficulty or higher."
              progress={3}
              total={10}
              isUnlocked={false}
              colors={colors}
              styles={styles}
            />

            <AchievementCard
              icon={<BotIcon size={24} color={colors.textMuted} />}
              title="Grandmaster"
              description="Defeat the AI on Hard difficulty."
              progress={0}
              total={1}
              isUnlocked={false}
              colors={colors}
              styles={styles}
            />
            
            <AchievementCard
              icon={<TimerIcon size={24} color={colors.textMuted} />}
              title="Speed Demon"
              description="Win a match with the 15s timer active."
              progress={0}
              total={1}
              isUnlocked={false}
              colors={colors}
              styles={styles}
            />
            
            <AchievementCard
              icon={<TrophyIcon size={24} color={colors.textMuted} />}
              title="Perfect Run"
              description="Win 5 games in a row against the AI without losing."
              progress={1}
              total={5}
              isUnlocked={false}
              colors={colors}
              styles={styles}
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
  statsCard: {
    flexDirection: 'row',
    backgroundColor: isDark ? colors.card : colors.accent,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  statValue: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 28,
    color: isDark ? colors.text : '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  sectionHeader: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  list: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 16,
  },
  cardLocked: {
    backgroundColor: isDark ? colors.background : '#FAFAFA',
    opacity: isDark ? 0.7 : 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconUnlocked: {
    backgroundColor: colors.secondary,
  },
  iconLockedBox: {
    backgroundColor: colors.secondary,
    opacity: 0.5,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 15,
    color: colors.text,
    marginBottom: 4,
  },
  titleLocked: {
    color: colors.textMuted,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.textMuted,
    borderRadius: 3,
  },
  progressUnlocked: {
    backgroundColor: colors.text,
  },
  progressText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: colors.textMuted,
    minWidth: 28,
  },
});
