import { BoardSize } from '../types/board';
import { Difficulty, TimerOption } from '../types/game';

export const QUOTAS: Record<BoardSize, number> = {
  '6x6': 6,
  '8x8': 8,
};

export const TIMERS: Record<TimerOption, number> = {
  '15s': 15,
  '30s': 30,
  '60s': 60,
  'None': 0,
};

export const BOT_DELAYS: Record<Difficulty, number> = {
  Easy: 800,
  Medium: 1200,
  Hard: 1800,
};
