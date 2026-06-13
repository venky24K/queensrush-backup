import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameMode, Difficulty, TimerOption } from '../types/game';

const ACHIEVEMENTS_KEY = '@qr_achievements_state';

export type AchievementState = {
  totalWins: number;
  winsMediumPlus: number;
  winsBotHard: number;
  winsTimer15s: number;
  currentBotWinStreak: number;
  maxBotWinStreak: number;
};

const DEFAULT_STATE: AchievementState = {
  totalWins: 0,
  winsMediumPlus: 0,
  winsBotHard: 0,
  winsTimer15s: 0,
  currentBotWinStreak: 0,
  maxBotWinStreak: 0,
};

export type ComputedAchievement = {
  id: string;
  title: string;
  description: string;
  progress: number;
  total: number;
  isUnlocked: boolean;
};

type AchievementsContextType = {
  state: AchievementState;
  achievements: ComputedAchievement[];
  unlockedCount: number;
  totalCount: number;
  recordMatch: (won: boolean, mode: GameMode, difficulty: Difficulty, timer: TimerOption) => Promise<void>;
};

const AchievementsContext = createContext<AchievementsContextType | null>(null);

export function AchievementsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AchievementState>(DEFAULT_STATE);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
        if (stored) {
          setState({ ...DEFAULT_STATE, ...JSON.parse(stored) });
        }
      } catch (err) {
        // use defaults
      }
    })();
  }, []);

  const saveState = async (newState: AchievementState) => {
    setState(newState);
    try {
      await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(newState));
    } catch (err) {
      // ignore
    }
  };

  const recordMatch = async (won: boolean, mode: GameMode, difficulty: Difficulty, timer: TimerOption) => {
    const newState = { ...state };

    if (won) {
      newState.totalWins += 1;
      
      if (difficulty === 'Medium' || difficulty === 'Hard') {
        newState.winsMediumPlus += 1;
      }
      
      if (mode === 'vs-bot') {
        if (difficulty === 'Hard') {
          newState.winsBotHard += 1;
        }
        newState.currentBotWinStreak += 1;
        if (newState.currentBotWinStreak > newState.maxBotWinStreak) {
          newState.maxBotWinStreak = newState.currentBotWinStreak;
        }
      }
      
      if (timer === '15s') {
        newState.winsTimer15s += 1;
      }
    } else {
      // Loss
      if (mode === 'vs-bot') {
        newState.currentBotWinStreak = 0;
      }
    }

    await saveState(newState);
  };

  const achievements: ComputedAchievement[] = [
    {
      id: 'first_blood',
      title: 'First Blood',
      description: 'Win your first match against any opponent.',
      progress: Math.min(state.totalWins, 1),
      total: 1,
      isUnlocked: state.totalWins >= 1,
    },
    {
      id: 'tactician',
      title: 'Tactician',
      description: 'Win 10 matches on Medium difficulty or higher.',
      progress: Math.min(state.winsMediumPlus, 10),
      total: 10,
      isUnlocked: state.winsMediumPlus >= 10,
    },
    {
      id: 'grandmaster',
      title: 'Grandmaster',
      description: 'Defeat the AI on Hard difficulty.',
      progress: Math.min(state.winsBotHard, 1),
      total: 1,
      isUnlocked: state.winsBotHard >= 1,
    },
    {
      id: 'speed_demon',
      title: 'Speed Demon',
      description: 'Win a match with the 15s timer active.',
      progress: Math.min(state.winsTimer15s, 1),
      total: 1,
      isUnlocked: state.winsTimer15s >= 1,
    },
    {
      id: 'perfect_run',
      title: 'Perfect Run',
      description: 'Win 5 games in a row against the AI without losing.',
      progress: Math.min(state.maxBotWinStreak, 5),
      total: 5,
      isUnlocked: state.maxBotWinStreak >= 5,
    },
  ];

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;

  return (
    <AchievementsContext.Provider value={{ state, achievements, unlockedCount, totalCount, recordMatch }}>
      {children}
    </AchievementsContext.Provider>
  );
}

export function useAchievements() {
  const ctx = useContext(AchievementsContext);
  if (!ctx) throw new Error('useAchievements must be used within AchievementsProvider');
  return ctx;
}
