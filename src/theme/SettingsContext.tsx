import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoHaptics from 'expo-haptics';

const KEYS = {
  SOUND: '@qr_sound',
  HAPTICS: '@qr_haptics',
  BOT_NAME: '@qr_bot_name',
} as const;

export const DEFAULTS = {
  sound: true,
  haptics: true,
  botName: 'Saara',
};

type SettingsContextType = {
  sound: boolean;
  haptics: boolean;
  botName: string;
  setSound: (v: boolean) => Promise<void>;
  setHaptics: (v: boolean) => Promise<void>;
  setBotName: (v: string) => Promise<void>;
  playHaptic: (style?: ExpoHaptics.ImpactFeedbackStyle) => void;
  playNotificationHaptic: (type?: ExpoHaptics.NotificationFeedbackType) => void;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [sound, setSoundState] = useState(DEFAULTS.sound);
  const [haptics, setHapticsState] = useState(DEFAULTS.haptics);
  const [botName, setBotNameState] = useState(DEFAULTS.botName);

  useEffect(() => {
    (async () => {
      try {
        const [s, h, b] = await Promise.all([
          AsyncStorage.getItem(KEYS.SOUND),
          AsyncStorage.getItem(KEYS.HAPTICS),
          AsyncStorage.getItem(KEYS.BOT_NAME),
        ]);
        if (s !== null) setSoundState(JSON.parse(s));
        if (h !== null) setHapticsState(JSON.parse(h));
        if (b !== null) setBotNameState(b);
      } catch {
        // use defaults
      }
    })();
  }, []);

  const setSound = async (v: boolean) => {
    setSoundState(v);
    await AsyncStorage.setItem(KEYS.SOUND, JSON.stringify(v));
  };

  const setHaptics = async (v: boolean) => {
    setHapticsState(v);
    await AsyncStorage.setItem(KEYS.HAPTICS, JSON.stringify(v));
    if (v) {
      ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light);
    }
  };

  const setBotName = async (v: string) => {
    setBotNameState(v);
    await AsyncStorage.setItem(KEYS.BOT_NAME, v);
  };

  const playHaptic = (style = ExpoHaptics.ImpactFeedbackStyle.Light) => {
    if (haptics) {
      ExpoHaptics.impactAsync(style);
    }
  };

  const playNotificationHaptic = (type = ExpoHaptics.NotificationFeedbackType.Success) => {
    if (haptics) {
      ExpoHaptics.notificationAsync(type);
    }
  };

  return (
    <SettingsContext.Provider value={{ sound, haptics, botName, setSound, setHaptics, setBotName, playHaptic, playNotificationHaptic }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
