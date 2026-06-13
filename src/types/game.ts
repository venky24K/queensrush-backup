import { BoardSize } from './board';

export type AppScreen = 'lobby' | 'game-mode' | 'rules' | 'game' | 'settings' | 'achievements';

export type GameMode = 'vs-bot' | 'two-player';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type TimerOption = '15s' | '30s' | '60s' | 'Off';

export type GameState = 'playing' | 'draw' | 'p1_lost' | 'p2_lost';

export type TurnState = 'your-turn' | 'player1-turn' | 'player2-turn' | 'saara-turn';

export interface GameParams {
  boardSize: BoardSize;
  gameMode: GameMode;
  difficulty: Difficulty;
  timePerMove: TimerOption;
}
