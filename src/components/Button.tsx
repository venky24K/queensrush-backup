import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useSettings } from '../theme/SettingsContext';

type ButtonProps = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  haptic?: boolean;
};

export default function Button({ children, onPress, style, haptic = true }: ButtonProps) {
  const { playHaptic } = useSettings();

  const handlePress = () => {
    if (haptic) {
      playHaptic();
    }
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        style,
        pressed && styles.pressed,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
});

