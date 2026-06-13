import { useSettings } from '../theme/SettingsContext';
import React, { useCallback, useMemo } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { BotIcon, ChevronLeftIcon, GearIcon } from '../assets/icons/icons';
import { AppScreen } from '../types/game';
import { useTheme, ThemeSetting } from '../theme/ThemeContext';

// ─── SettingsScreen ────────────────────────────────────────────────────────────

type SettingsScreenProps = {
  onNavigate: (screen: AppScreen) => void;
};

export default function SettingsScreen({ onNavigate }: SettingsScreenProps) {
  const { colors, themeSetting, setThemeSetting } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { sound, setSound, haptics, setHaptics, botName, setBotName, playHaptic } = useSettings();

  const handleBotNameChange = useCallback((text: string) => {
    const trimmed = text.slice(0, 16);
    setBotName(trimmed);
  }, [setBotName]);

  const handleBotNameBlur = useCallback(() => {
    const name = botName.trim() || 'Saara';
    setBotName(name);
  }, [botName, setBotName]);


  // Sub-components utilizing dynamic styles
  function SectionHeader({ label }: { label: string }) {
    return <Text style={styles.sectionHeader}>{label}</Text>;
  }

  type ToggleRowProps = {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    value: boolean;
    onValueChange: (v: boolean) => void;
  };

  function ToggleRow({ icon, title, subtitle, value, onValueChange }: ToggleRowProps) {
    return (
      <View style={styles.card}>
        <View style={styles.cardIconBox}>{icon}</View>
        <View style={styles.cardTextBox}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: colors.text }}
          thumbColor={colors.card}
          ios_backgroundColor={colors.border}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
            <Text style={styles.headerTitle}>Settings</Text>
          </View>

          {/* ── Appearance ──────────────────────────────────────────────────── */}
          <SectionHeader label="APPEARANCE" />
          <View style={styles.section}>
            <View style={styles.card}>
              <View style={styles.cardTextBox}>
                <Text style={styles.cardTitle}>Theme</Text>
                <Text style={styles.cardSubtitle}>Select your preferred app theme</Text>
                <View style={styles.themeRow}>
                  {(['light', 'dark'] as ThemeSetting[]).map((t) => (
                    <Pressable
                      key={t}
                      onPress={() => {
                        playHaptic();
                        setThemeSetting(t);
                      }}
                      style={[styles.themeBtn, themeSetting === t && styles.themeBtnActive]}
                    >
                      <Text style={[styles.themeBtnText, themeSetting === t && styles.themeBtnTextActive]}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* ── Preferences ─────────────────────────────────────────────────── */}
          <SectionHeader label="PREFERENCES" />
          <View style={styles.section}>
            <ToggleRow
              icon={<SoundIcon color={colors.text} />}
              title="Sound Effects"
              subtitle="Toggle in-game audio feedback"
              value={sound}
              onValueChange={(v) => setSound(v)}
            />
            <ToggleRow
              icon={<HapticsIcon color={colors.text} />}
              title="Haptic Feedback"
              subtitle="Vibrations on tap and game events"
              value={haptics}
              onValueChange={(v) => setHaptics(v)}
            />
          </View>

          {/* ── Personalisation ──────────────────────────────────────────────── */}
          <SectionHeader label="PERSONALISATION" />
          <View style={styles.section}>
            <View style={styles.card}>
              <View style={styles.cardIconBox}>
                <BotIcon size={20} color={colors.text} />
              </View>
              <View style={styles.cardTextBox}>
                <Text style={styles.cardTitle}>Bot Name</Text>
                <Text style={styles.cardSubtitle}>Give the AI opponent a custom name</Text>
              </View>
            </View>
            <View style={styles.inputCard}>
              <TextInput
                style={styles.textInput}
                value={botName}
                onChangeText={handleBotNameChange}
                onBlur={handleBotNameBlur}
                placeholder="e.g. Saara"
                placeholderTextColor={colors.textMuted}
                maxLength={16}
                returnKeyType="done"
                autoCorrect={false}
              />
              <Text style={styles.charCount}>{botName.length}/16</Text>
            </View>
          </View>

          {/* ── About ────────────────────────────────────────────────────────── */}
          <SectionHeader label="ABOUT" />
          <View style={styles.section}>
            <View style={styles.card}>
              <View style={styles.cardIconBox}>
                <GearIcon size={20} color={colors.text} />
              </View>
              <View style={styles.cardTextBox}>
                <Text style={styles.cardTitle}>{"Queen's Rush"}</Text>
                <Text style={styles.cardSubtitle}>Version 1.0.0</Text>
              </View>
            </View>
            <View style={styles.aboutCard}>
              <Text style={styles.aboutText}>
                A strategic two-player battle of wit and territory, inspired by the classical N-Queens mathematical problem.
              </Text>
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Inline SVG icons (small, settings-specific) ──────────────────────────────

function SoundIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M11 5L6 9H2v6h4l5 4V5z" />
      <Path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <Path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </Svg>
  );
}

function HapticsIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5.5 12H2" />
      <Path d="M22 12h-3.5" />
      <Circle cx="12" cy="12" r="4" />
      <Line x1="12" y1="2" x2="12" y2="6" />
      <Line x1="12" y1="18" x2="12" y2="22" />
    </Svg>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const createStyles = (colors: any) => StyleSheet.create({
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
  section: {
    gap: 12,
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextBox: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
  },
  themeRow: {
    flexDirection: 'row',
    marginTop: 16,
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 4,
  },
  themeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  themeBtnActive: {
    backgroundColor: colors.card,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  themeBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.textMuted,
  },
  themeBtnTextActive: {
    color: colors.text,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: colors.text,
    paddingVertical: 14,
  },
  charCount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.textMuted,
  },
  aboutCard: {
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  aboutText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
  },
});
