export const SYMBOLS = ['BOOK', 'HAT', 'PHARAOH', 'EXPLORER1', 'EXPLORER2', 'A', 'K', 'Q', 'J', '10'] as const;

export type SymbolType = typeof SYMBOLS[number];

export const SYMBOL_IMAGES: Record<SymbolType, string> = {
  'BOOK': '/symbols/book.jpg',
  'HAT': '/symbols/hat.jpg',
  'PHARAOH': '/symbols/pharaoh.jpg',
  'EXPLORER1': '/symbols/explorer1.jpg',
  'EXPLORER2': '/symbols/explorer2.jpg',
  'A': '/symbols/a.jpg',
  'K': '/symbols/k.jpg',
  'Q': '/symbols/q.jpg',
  'J': '/symbols/j.jpg',
  '10': '/symbols/ten.jpg'
};

export const SYMBOL_WEIGHTS: number[] = [2, 3, 4, 6, 6, 20, 20, 25, 25, 28];

// Premium symbols (HAT, PHARAOH) pay for 2+ matches
export const PREMIUM_SYMBOLS: SymbolType[] = ['HAT', 'PHARAOH'];

// Payouts - premium symbols have 2-match payouts
export const PAYOUTS: Record<SymbolType, Record<number, number>> = {
  'BOOK': { 6: 50000, 5: 18000, 4: 1800, 3: 180, 2: 0 },
  'HAT': { 6: 15000, 5: 5000, 4: 1000, 3: 100, 2: 10 },      // Premium - pays for 2
  'PHARAOH': { 6: 6000, 5: 2000, 4: 400, 3: 30, 2: 5 },      // Premium - pays for 2
  'EXPLORER1': { 6: 2500, 5: 750, 4: 100, 3: 30, 2: 0 },
  'EXPLORER2': { 6: 2500, 5: 750, 4: 100, 3: 30, 2: 0 },
  'A': { 6: 500, 5: 150, 4: 40, 3: 10, 2: 0 },
  'K': { 6: 500, 5: 150, 4: 40, 3: 10, 2: 0 },
  'Q': { 6: 300, 5: 100, 4: 25, 3: 5, 2: 0 },
  'J': { 6: 300, 5: 100, 4: 25, 3: 5, 2: 0 },
  '10': { 6: 300, 5: 100, 4: 25, 3: 5, 2: 0 }
};

export const SYMBOL_NAMES: Record<SymbolType, string> = {
  'BOOK': 'BOOK OF STOŽER',
  'HAT': 'Koba the Explorer',
  'PHARAOH': 'Flegma',
  'EXPLORER1': 'Kezro',
  'EXPLORER2': 'Grossadmiral',
  'A': 'Kec',
  'K': 'Kralj',
  'Q': 'Renata',
  'J': 'Dečko',
  '10': 'Ceki'
};

// Paylines for 6 reels with colors
export const PAYLINES: { pattern: number[]; color: string }[] = [
  { pattern: [1, 1, 1, 1, 1, 1], color: '#ffeb3b' },  // Line 1 - Yellow - Middle
  { pattern: [0, 0, 0, 0, 0, 0], color: '#f44336' },  // Line 2 - Red - Top
  { pattern: [2, 2, 2, 2, 2, 2], color: '#2196f3' },  // Line 3 - Blue - Bottom
  { pattern: [0, 1, 2, 2, 1, 0], color: '#4caf50' },  // Line 4 - Green - V shape
  { pattern: [2, 1, 0, 0, 1, 2], color: '#9c27b0' },  // Line 5 - Purple - Inverted V
  { pattern: [0, 0, 1, 1, 2, 2], color: '#ff9800' },  // Line 6 - Orange - Diagonal down
  { pattern: [2, 2, 1, 1, 0, 0], color: '#e91e63' },  // Line 7 - Pink - Diagonal up
  { pattern: [1, 0, 0, 0, 0, 1], color: '#00bcd4' },  // Line 8 - Cyan - Top valley
  { pattern: [1, 2, 2, 2, 2, 1], color: '#8bc34a' },  // Line 9 - Light green - Bottom valley
  { pattern: [0, 1, 1, 1, 1, 0], color: '#795548' }   // Line 10 - Brown - Middle bump
];

export const BET_VALUES: number[] = [0.1, 0.2, 0.4, 0.5, 1, 2, 4, 5, 10, 20, 40, 100];

export const CONFIG = {
  REELS: 6,
  ROWS: 3,
  MAX_LINES: 10,
  SPIN_DURATION: 2000,
  REEL_STOP_DELAY: 350,
  FAST_SPIN_DELAY: 50,
  INITIAL_CREDIT: 1000,
  FREE_SPINS_CHANCE: 0.10,
  TARGET_RTP: 0.90
};

export const SOUNDS = {
  SPIN: '/sounds/RowSpin.mp3',
  WIN: '/sounds/NormalSymbolWin.mp3',
  FREE_GAMES: '/sounds/10FreeGamesSound.mp3',
  LINE_WIN: '/sounds/LineConnectingFreeGames.mp3'
};
