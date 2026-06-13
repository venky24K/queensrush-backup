import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet, Text, View, Animated, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppScreen } from '../types/game';
import Queen from '../components/Queen';

const TIPS = [
  "Think offensively — restrict your opponent's safe squares to force an error.",
  "Diagonals are deadly. A single Queen can threaten the entire board.",
  "Control the center to dominate more rows, columns, and diagonals.",
  "If the board is exhausted, the player with the most Queens wins.",
  "The Trapping Tie-Breaker: equal queens? The last valid move wins!",
  "Watch the timer — a brilliant move made too late is still a loss.",
  "Each player gets 5 queens on 8×8, and 4 queens on 6×6.",
];

// ─── Theme colors (matching dark theme from colors.ts) ────────────────────────
const C = {
  bg:         '#111827',
  card:       '#1F2937',
  border:     '#374151',
  text:       '#F9FAFB',
  textMuted:  '#9CA3AF',
  accent:     '#F9FAFB',
};

type Props = { onNavigate: (screen: AppScreen) => void };

// ─── Pulsing Dot ──────────────────────────────────────────────────────────────
function PulsingDot({ delay }: { delay: number }) {
  const scale = useMemo(() => new Animated.Value(1), []);
  const opacity = useMemo(() => new Animated.Value(0.2), []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.6, duration: 500,
            easing: Easing.inOut(Easing.ease), useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1, duration: 500,
            easing: Easing.inOut(Easing.ease), useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1, duration: 500,
            easing: Easing.inOut(Easing.ease), useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.2, duration: 500,
            easing: Easing.inOut(Easing.ease), useNativeDriver: true,
          }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scale, opacity, delay]);

  return (
    <Animated.View style={[styles.dot, { opacity, transform: [{ scale }] }]} />
  );
}

// ─── Queen Emblem ─────────────────────────────────────────────────────────────
function QueenEmblem() {
  const pulse = useMemo(() => new Animated.Value(0.3), []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.6, duration: 2000,
          easing: Easing.inOut(Easing.ease), useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.3, duration: 2000,
          easing: Easing.inOut(Easing.ease), useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulse]);

  return (
    <View style={styles.emblemOuter}>
      {/* Subtle glow ring */}
      <Animated.View style={[styles.emblemGlow, { opacity: pulse }]} />
      {/* Inner ring */}
      <View style={styles.emblemRing}>
        <Queen size={36} color={C.accent} />
      </View>
    </View>
  );
}

// ─── Mini Board Skeleton ──────────────────────────────────────────────────────
function MiniBoard() {
  const cells = Array.from({ length: 64 }).map((_, i) => {
    const row = Math.floor(i / 8);
    const col = i % 8;
    const isDark = (row + col) % 2 === 1;
    return (
      <View
        key={i}
        style={[
          styles.boardCell,
          { backgroundColor: isDark ? C.border : C.card },
        ]}
      />
    );
  });

  return <View style={styles.miniBoard}>{cells}</View>;
}

// ─── Main Splash ──────────────────────────────────────────────────────────────
export default function SplashScreen({ onNavigate }: Props) {
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);

  const logoOpacity = useMemo(() => new Animated.Value(0), []);
  const logoY = useMemo(() => new Animated.Value(18), []);
  const boardOpacity = useMemo(() => new Animated.Value(0), []);
  const footerOpacity = useMemo(() => new Animated.Value(0), []);
  const progress = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    // Staggered entrance
    Animated.stagger(300, [
      // 1. Logo fades in and floats up
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1, duration: 600,
          easing: Easing.out(Easing.cubic), useNativeDriver: true,
        }),
        Animated.timing(logoY, {
          toValue: 0, duration: 600,
          easing: Easing.out(Easing.cubic), useNativeDriver: true,
        }),
      ]),
      // 2. Board fades in
      Animated.timing(boardOpacity, {
        toValue: 1, duration: 500,
        easing: Easing.out(Easing.ease), useNativeDriver: true,
      }),
      // 3. Footer fades in
      Animated.timing(footerOpacity, {
        toValue: 1, duration: 400,
        easing: Easing.out(Easing.ease), useNativeDriver: false,
      }),
    ]).start();

    // Progress bar fills over 3 seconds
    Animated.timing(progress, {
      toValue: 1,
      duration: 3000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) onNavigate('lobby');
    });
  }, []);

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Hero: Queen Emblem + Title */}
        <Animated.View
          style={[
            styles.hero,
            { opacity: logoOpacity, transform: [{ translateY: logoY }] },
          ]}
        >
          <QueenEmblem />
          <View style={styles.titleGroup}>
            <Text style={styles.title}>Queens Rush</Text>
            <Text style={styles.subtitle}>Board · Strategy</Text>
          </View>
        </Animated.View>

        {/* Mini board skeleton */}
        <Animated.View style={[styles.boardWrapper, { opacity: boardOpacity }]}>
          <MiniBoard />
        </Animated.View>

        {/* Footer: Tip + Loading */}
        <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
          <View style={styles.tipCard}>
            <Text style={styles.tipLabel}>💡 DID YOU KNOW?</Text>
            <Text style={styles.tipText}>{tip}</Text>
          </View>

          <View style={styles.dotsRow}>
            <PulsingDot delay={0} />
            <PulsingDot delay={200} />
            <PulsingDot delay={400} />
          </View>

          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: barWidth }]} />
          </View>
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingBottom: 40,
    paddingTop: 40,
  },

  // ── Hero ──
  hero: {
    alignItems: 'center',
    gap: 20,
  },
  emblemOuter: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblemGlow: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: C.accent,
  },
  emblemRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleGroup: {
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 32,
    letterSpacing: -0.5,
    color: C.text,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    letterSpacing: 5,
    textTransform: 'uppercase',
    color: C.textMuted,
  },

  // ── Board Skeleton ──
  boardWrapper: {
    width: '65%',
    maxWidth: 260,
    aspectRatio: 1,
  },
  miniBoard: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
    opacity: 0.4,
  },
  boardCell: {
    width: '12.5%',
    aspectRatio: 1,
  },

  // ── Footer ──
  footer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  tipCard: {
    width: '100%',
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 6,
  },
  tipLabel: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 10,
    letterSpacing: 2,
    color: C.textMuted,
    textTransform: 'uppercase',
  },
  tipText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: C.textMuted,
    lineHeight: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.accent,
  },
  progressTrack: {
    width: '100%',
    height: 2,
    backgroundColor: C.border,
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: C.accent,
    borderRadius: 1,
  },
});