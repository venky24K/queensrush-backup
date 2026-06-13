import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useSettings } from '../theme/SettingsContext';
import { useTheme } from '../theme/ThemeContext';

type CellProps = {
  isDark: boolean;
  onPress?: () => void;
  children?: React.ReactNode;
  size: number;
};

export default function Cell({ isDark, onPress, children, size }: CellProps) {
  const { isDark: isDarkTheme } = useTheme();
  const { playHaptic } = useSettings();

  const handlePress = () => {
    playHaptic();
    onPress?.();
  };

  const darkCellColor = isDarkTheme ? '#374151' : '#D1D5DB';
  const lightCellColor = isDarkTheme ? '#4B5563' : '#E5E7EB';

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.cell,
        { width: size, height: size },
        { backgroundColor: isDark ? darkCellColor : lightCellColor },
        pressed && styles.pressed,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
});
