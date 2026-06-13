export type BoardSize = '6x6' | '8x8';

export interface PlacedQueen {
  index: number;
  player: 1 | 2;
}
