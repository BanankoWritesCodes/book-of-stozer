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

// Adjusted weights for ~90% RTP - lower value symbols more common
export const SYMBOL_WEIGHTS: number[] = [2, 3, 4, 6, 6, 20, 20, 25, 25, 28];

// Payouts based on original Book of Ra paytable - now with 6 of a kind
export const PAYOUTS: Record<SymbolType, Record<number, number>> = {
  'BOOK': { 6: 50000, 5: 18000, 4: 1800, 3: 180, 2: 0 },
  'HAT': { 6: 15000, 5: 5000, 4: 1000, 3: 100, 2: 10 },
  'PHARAOH': { 6: 6000, 5: 2000, 4: 400, 3: 30, 2: 5 },
  'EXPLORER1': { 6: 2500, 5: 750, 4: 100, 3: 30, 2: 0 },  // Kezro
  'EXPLORER2': { 6: 2500, 5: 750, 4: 100, 3: 30, 2: 0 },  // Grossadmiral
  'A': { 6: 500, 5: 150, 4: 40, 3: 10, 2: 0 },
  'K': { 6: 500, 5: 150, 4: 40, 3: 10, 2: 0 },
  'Q': { 6: 300, 5: 100, 4: 25, 3: 5, 2: 0 },
  'J': { 6: 300, 5: 100, 4: 25, 3: 5, 2: 0 },
  '10': { 6: 300, 5: 100, 4: 25, 3: 5, 2: 0 }
};

// Symbol names - EXPLORER1 = Kezro (plavokosi), EXPLORER2 = Grossadmiral (tamnokosi)
export const SYMBOL_NAMES: Record<SymbolType, string> = {
  'BOOK': 'BOOK OF STOŽER',
  'HAT': 'Koba the Explorer',
  'PHARAOH': 'Flegma',
  'EXPLORER1': 'Kezro',        // Plavokosi istraživač
  'EXPLORER2': 'Grossadmiral', // Tamnokosi vodič
  'A': 'Kec',
  'K': 'Kralj',
  'Q': 'Renata',
  'J': 'Dečko',
  '10': 'Ceki'
};

// Paylines adjusted for 6 reels
export const PAYLINES: number[][] = [
  [1, 1, 1, 1, 1, 1], // Line 1 - Middle
  [0, 0, 0, 0, 0, 0], // Line 2 - Top
  [2, 2, 2, 2, 2, 2], // Line 3 - Bottom
  [0, 1, 2, 2, 1, 0], // Line 4 - V shape extended
  [2, 1, 0, 0, 1, 2], // Line 5 - Inverted V extended
  [0, 0, 1, 1, 2, 2], // Line 6 - Diagonal down
  [2, 2, 1, 1, 0, 0], // Line 7 - Diagonal up
  [1, 0, 0, 0, 0, 1], // Line 8 - Top valley extended
  [1, 2, 2, 2, 2, 1], // Line 9 - Bottom valley extended
  [0, 1, 1, 1, 1, 0]  // Line 10 - Middle bump extended
];

// Updated bet values - starting from 0.1 per line (1 HRK total with 10 lines)
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
