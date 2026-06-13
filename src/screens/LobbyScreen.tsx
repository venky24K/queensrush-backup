import React, { ReactNode, useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { BookIcon, ChevronRightIcon, GearIcon, MedalIcon, PlayIcon } from '../assets/icons/icons';
import { AppScreen } from '../types/game';
import { useTheme } from '../theme/ThemeContext';
import { useSettings } from '../theme/SettingsContext';

type MenuCardProps = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  primary?: boolean;
  onPress?: () => void;
  colors: any;
  styles: any;
  playHaptic: () => void;
};

function MenuCard({ title, subtitle, icon, primary = false, onPress, colors, styles, playHaptic }: MenuCardProps) {
  const handlePress = () => {
    playHaptic();
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      {primary && <View style={styles.accent} />}

      <View style={[styles.iconContainer, primary ? styles.iconPrimary : styles.iconDefault]}>
        {icon}
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>

      <View style={styles.chevron}>
        <ChevronRightIcon size={24} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

type LobbyScreenProps = {
  onNavigate: (screen: AppScreen) => void;
};

export default function LobbyScreen({ onNavigate }: LobbyScreenProps) {
  const { colors } = useTheme();
  const { playHaptic } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.inner}>

          {/* Header Section */}
          <View style={styles.header}>
            <Image
              source={require('../../assets/svgs/queensrush-logo.svg')}
              style={styles.logo}
              contentFit="contain"
            />
            <Text style={styles.title}>
              {"Grandmaster's\nLobby"}
            </Text>
            <Text style={styles.subtitle}>
              Elevate your strategy, one move at a time.
            </Text>
          </View>

          {/* Menu Options */}
          <View style={styles.menu}>
            <MenuCard
              title="Play Now"
              subtitle="Ranked Matchmaking"
              icon={<PlayIcon size={24} color={colors.text} />}
              onPress={() => onNavigate('game-mode')}
              colors={colors}
              styles={styles}
              playHaptic={playHaptic}
            />

            <MenuCard
              title="Rules"
              subtitle="Learn the Queens Rush"
              icon={<BookIcon size={24} color={colors.text} />}
              onPress={() => onNavigate('rules')}
              colors={colors}
              styles={styles}
              playHaptic={playHaptic}
            />

            <MenuCard
              title="Achievements"
              subtitle="Mastery Milestones"
              icon={<MedalIcon size={24} color={colors.text} />}
              onPress={() => onNavigate('achievements')}
              colors={colors}
              styles={styles}
              playHaptic={playHaptic}
            />

            <MenuCard
              title="Settings"
              subtitle="Preferences & Privacy"
              icon={<GearIcon size={24} color={colors.text} />}
              onPress={() => onNavigate('settings')}
              colors={colors}
              styles={styles}
              playHaptic={playHaptic}
            />
          </View>

        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  inner: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    marginTop: 48,
  },
  logo: {
    width: 110,
    height: 110,
    marginBottom: 16,
    borderRadius: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  title: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 36,
    lineHeight: 43,
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    fontSize: 18,
    textAlign: 'center',
  },
  menu: {
    width: '100%',
    gap: 20,
  },
  card: {
    position: 'relative',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 28,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.04,
        shadowRadius: 30,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardPressed: {
    backgroundColor: colors.border,
    transform: [{ scale: 0.96 }],
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: colors.accent,
    borderTopLeftRadius: 28,
    borderBottomLeftRadius: 28,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconPrimary: {
    backgroundColor: colors.accent,
  },
  iconDefault: {
    backgroundColor: colors.secondary,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.text,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.textMuted,
  },
  chevron: {
    marginLeft: 8,
  },
});
