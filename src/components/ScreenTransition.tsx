import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeInDown, Easing } from 'react-native-reanimated';

type ScreenTransitionProps = {
  children: React.ReactNode;
};

/**
 * Wraps a screen and plays a smooth fade + slide-up entrance animation.
 * Uses Reanimated's built-in `entering` prop so the animation fires before
 * the very first frame paints — eliminating any flash of unstyled content.
 *
 * Usage: wrap each screen with <ScreenTransition key={screenName}>...</ScreenTransition>
 * The `key` prop remounts this component on every navigation, re-triggering the animation.
 */
export default function ScreenTransition({ children }: ScreenTransitionProps) {
  return (
    <Animated.View
      style={styles.fill}
      entering={FadeInDown.duration(300).easing(Easing.out(Easing.cubic))}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
