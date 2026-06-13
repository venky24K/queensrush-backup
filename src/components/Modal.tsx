import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import Button from './Button';
import { PlayFilledIcon, CloseIcon, FlagIcon } from '../assets/icons/icons';
import * as Haptics from '../utils/haptics';
import { useTheme } from '../theme/ThemeContext';

type ModalProps = {
  visible: boolean;
  type: 'pause' | 'resign' | 'game-over';
  title?: string;
  subtitle?: string;
  onConfirm?: () => void; // Used for resign confirm or game over replay
  onCancel?: () => void;  // Used for resign cancel or game over lobby or pause resume
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Modal({ visible, type, title, subtitle, onConfirm, onCancel }: ModalProps) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  if (!visible) return null;

  const handlePauseResume = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCancel?.();
  };

  if (type === 'pause') {
    return (
      <Pressable onPress={handlePauseResume} style={styles.overlay}>
        <Pressable
          onPress={handlePauseResume}
          style={({ pressed }) => [styles.playButton, pressed && styles.playButtonPressed]}
        >
          <View style={{ marginLeft: 6 }}>
            <PlayFilledIcon size={40} color={colors.background} />
          </View>
        </Pressable>
      </Pressable>
    );
  }

  return (
    <View style={styles.fullscreenOverlay}>
      <BlurView intensity={60} tint={isDark ? 'light' : 'dark'} style={StyleSheet.absoluteFill} />
      <View style={styles.content}>
        {type === 'game-over' && (
          <View style={styles.iconCircle}>
            <CloseIcon size={32} color={colors.text} />
          </View>
        )}

        {type === 'resign' && (
          <View style={[styles.iconCircle, { backgroundColor: '#FEF2F2' }]}>
            <FlagIcon size={32} color="#EF4444" />
          </View>
        )}

        <Text style={styles.title}>{title || (type === 'resign' ? 'RESIGN MATCH?' : '')}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.buttons}>
          {type === 'game-over' && (
            <>
              <Button onPress={onConfirm} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>REPLAY</Text>
              </Button>
              <Button onPress={onCancel} style={styles.secondaryBtn}>
                <Text style={styles.secondaryBtnText}>LOBBY</Text>
              </Button>
            </>
          )}

          {type === 'resign' && (
            <>
              <Button onPress={onConfirm} style={[styles.primaryBtn, { backgroundColor: '#DC2626' }]}>
                <Text style={styles.primaryBtnText}>RESIGN</Text>
              </Button>
              <Button onPress={onCancel} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>CANCEL</Text>
              </Button>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 24,
  },
  fullscreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  playButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  playButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  content: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 32,
    width: Math.min(SCREEN_WIDTH - 32, 400),
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    backgroundColor: colors.secondary,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 24,
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: 32,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: colors.text,
    borderRadius: 16,
  },
  primaryBtnText: {
    fontFamily: 'Montserrat_700Bold',
    letterSpacing: 3,
    color: colors.background,
    fontSize: 14,
  },
  secondaryBtn: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: colors.secondary,
    borderRadius: 16,
  },
  secondaryBtnText: {
    fontFamily: 'Montserrat_700Bold',
    letterSpacing: 3,
    color: colors.textMuted,
    fontSize: 14,
  },
  cancelBtn: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelBtnText: {
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 2,
    color: colors.textMuted,
    fontSize: 14,
  },
});
