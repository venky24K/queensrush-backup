import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { BackHandler } from 'react-native';

// Screens
import LobbyScreen from './screens/LobbyScreen';
import GameModeScreen from './screens/GameModeScreen';
import RulesScreen from './screens/RulesScreen';
import GameScene from './screens/GameScene';
import SettingsScreen from './screens/SettingsScreen';
import AchievementsScreen from './screens/AchievementsScreen';
import SplashScreenComponent from './screens/SplashScreen';
import ScreenTransition from './components/ScreenTransition';
import { GameParams, AppScreen } from './types/game';
import { ThemeProvider } from './theme/ThemeContext';
import { SettingsProvider } from './theme/SettingsContext';
import { AchievementsProvider } from './theme/AchievementsContext';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [currentScreen, setCurrentScreen] = useState<AppScreen>('splash');
  const [gameParams, setGameParams] = useState<GameParams>({
    boardSize: '8x8',
    gameMode: 'vs-bot',
    difficulty: 'Medium',
    timePerMove: '15s',
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    const backAction = () => {
      if (currentScreen !== 'lobby') {
        setCurrentScreen('lobby');
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [currentScreen]);

  if (!fontsLoaded) {
    return null;
  }

  const handleStartGame = (params: GameParams) => {
    setGameParams(params);
    setCurrentScreen('game');
  };

  const handleNavigate = (screen: AppScreen) => {
    setCurrentScreen(screen);
  };

  return (
    <SettingsProvider>
      <ThemeProvider>
        <AchievementsProvider>
        {currentScreen === 'splash' && (
          <ScreenTransition key="splash">
            <SplashScreenComponent onNavigate={handleNavigate} />
          </ScreenTransition>
        )}
        {currentScreen === 'lobby' && (
          <ScreenTransition key="lobby">
            <LobbyScreen onNavigate={handleNavigate} />
          </ScreenTransition>
        )}
        {currentScreen === 'game-mode' && (
          <ScreenTransition key="game-mode">
            <GameModeScreen onNavigate={handleNavigate} onStartGame={handleStartGame} />
          </ScreenTransition>
        )}
        {currentScreen === 'rules' && (
          <ScreenTransition key="rules">
            <RulesScreen onNavigate={handleNavigate} />
          </ScreenTransition>
        )}
        {currentScreen === 'game' && (
          <ScreenTransition key="game">
            <GameScene gameParams={gameParams} onNavigate={handleNavigate} />
          </ScreenTransition>
        )}
        {currentScreen === 'settings' && (
          <ScreenTransition key="settings">
            <SettingsScreen onNavigate={handleNavigate} />
          </ScreenTransition>
        )}
        {currentScreen === 'achievements' && (
          <ScreenTransition key="achievements">
            <AchievementsScreen onNavigate={handleNavigate} />
          </ScreenTransition>
        )}
        <StatusBar style="auto" />
        </AchievementsProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
}
