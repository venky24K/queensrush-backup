import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors as themeColors } from './colors';

export type ThemeSetting = 'light' | 'dark' | 'system';

type ThemeContextType = {
  themeSetting: ThemeSetting;
  isDark: boolean;
  colors: typeof themeColors.light;
  setThemeSetting: (setting: ThemeSetting) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeSetting, setThemeSettingState] = useState<ThemeSetting>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('@qr_theme').then((savedTheme) => {
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
        setThemeSettingState(savedTheme as ThemeSetting);
      }
      setIsLoaded(true);
    });
  }, []);

  const setThemeSetting = (setting: ThemeSetting) => {
    setThemeSettingState(setting);
    AsyncStorage.setItem('@qr_theme', setting);
  };

  const isDark = themeSetting === 'system' ? systemColorScheme === 'dark' : themeSetting === 'dark';
  const currentColors = isDark ? themeColors.dark : themeColors.light;

  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider value={{ themeSetting, isDark, colors: currentColors, setThemeSetting }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
