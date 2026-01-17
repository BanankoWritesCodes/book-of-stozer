'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  SYMBOLS, 
  SYMBOL_WEIGHTS, 
  PAYOUTS, 
  PAYLINES, 
  BET_VALUES, 
  CONFIG,
  SOUNDS,
  SymbolType 
} from '@/lib/gameConfig';

export interface GameState {
  credit: number;
  bet: number;
  lines: number;
  spinning: boolean;
  freeSpins: number;
  expandingSymbol: SymbolType | null;
  reelSymbols: SymbolType[][];
  winAmount: number;
  message: string;
  winningPositions: Set<string>;
  showBonus: boolean;
  showPaytable: boolean;
  showGamble: boolean;
  gambleAmount: number;
  soundEnabled: boolean;
  spinningReels: boolean[];
  lastWin: number;
  fastSpin: boolean;
}

const getRandomSymbol = (excludeSymbols: SymbolType[] = []): SymbolType => {
  const availableSymbols = SYMBOLS.filter(s => !excludeSymbols.includes(s));
  const availableWeights = SYMBOLS.map((s, i) => excludeSymbols.includes(s) ? 0 : SYMBOL_WEIGHTS[i]);
  const total = availableWeights.reduce((a, b) => a + b, 0);
  
  let rand = Math.random() * total;
  for (let i = 0; i < SYMBOLS.length; i++) {
    rand -= availableWeights[i];
    if (rand <= 0) return SYMBOLS[i];
  }
  return availableSymbols[availableSymbols.length - 1];
};

const generateReelColumn = (): SymbolType[] => {
  const column: SymbolType[] = [];
  for (let i = 0; i < CONFIG.ROWS; i++) {
    const symbol = getRandomSymbol(column);
    column.push(symbol);
  }
  return column;
};

const generateReels = (): SymbolType[][] => {
  return Array.from({ length: CONFIG.REELS }, () => generateReelColumn());
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useGameState() {
  const [state, setState] = useState<GameState>({
    credit: CONFIG.INITIAL_CREDIT,
    bet: 0.1,
    lines: 10,
    spinning: false,
    freeSpins: 0,
    expandingSymbol: null,
    reelSymbols: generateReels(),
    winAmount: 0,
    message: 'Sretno! Ako sjebeš pare, posudi od frenda!',
    winningPositions: new Set(),
    showBonus: false,
    showPaytable: false,
    showGamble: false,
    gambleAmount: 0,
    soundEnabled: true,
    spinningReels: Array(CONFIG.REELS).fill(false),
    lastWin: 0,
    fastSpin: false
  });

  const audioRef = useRef<{ [key: string]: HTMLAudioElement }>({});
  const spinSoundsRef = useRef<HTMLAudioElement[]>([]);
  const fastSpinRequestedRef = useRef(false);
  const currentSpinSymbolsRef = useRef<SymbolType[][] | null>(null);
  const soundEnabledRef = useRef(true);

  useEffect(() => {
    soundEnabledRef.current = state.soundEnabled;
  }, [state.soundEnabled]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = {
        win: new Audio(SOUNDS.WIN),
        freeGames: new Audio(SOUNDS.FREE_GAMES),
        lineWin: new Audio(SOUNDS.LINE_WIN)
      };
      spinSoundsRef.current = Array.from({ length: CONFIG.REELS }, () => {
        const audio = new Audio(SOUNDS.SPIN);
        audio.volume = 0.7;
        return audio;
      });
    }
  }, []);

  const playSound = useCallback((sound: 'win' | 'freeGames' | 'lineWin') => {
    if (soundEnabledRef.current && audioRef.current[sound]) {
      audioRef.current[sound].currentTime = 0;
      audioRef.current[sound].play().catch(() => {});
    }
  }, []);

  const playReelStopSound = useCallback((reelIndex: number) => {
    if (soundEnabledRef.current && spinSoundsRef.current[reelIndex]) {
      spinSoundsRef.current[reelIndex].currentTime = 0;
      spinSoundsRef.current[reelIndex].play().catch(() => {});
    }
  }, []);

  const updateState = useCallback((updates: Partial<GameState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const adjustLines = useCallback((delta: number) => {
    setState(prev => {
      const newLines = prev.lines + delta;
      if (newLines >= 1 && newLines <= CONFIG.MAX_LINES) {
        return { ...prev, lines: newLines };
      }
      return prev;
    });
  }, []);

  const adjustBet = useCallback((delta: number) => {
    setState(prev => {
      const currentIdx = BET_VALUES.indexOf(prev.bet);
      const newIdx = currentIdx + delta;
      if (newIdx >= 0 && newIdx < BET_VALUES.length) {
        return { ...prev, bet: BET_VALUES[newIdx] };
      }
      return prev;
    });
  }, []);

  const triggerFastSpin = useCallback(() => {
    if (state.spinning && !fastSpinRequestedRef.current) {
      fastSpinRequestedRef.current = true;
      setState(prev => ({ ...prev, fastSpin: true }));
    }
  }, [state.spinning]);

  const spin = useCallback(async () => {
    if (state.spinning) {
      triggerFastSpin();
      return;
    }

    const totalBet = state.bet * state.lines;
    let newCredit = state.credit;
    let newFreeSpins = state.freeSpins;
    let message = 'Sretno! Ako sjebeš pare, posudi od frenda!';

    if (state.freeSpins > 0) {
      newFreeSpins--;
      message = `Besplatna igra ${10 - newFreeSpins} od 10`;
    } else {
      if (state.credit < totalBet) {
        updateState({ message: 'Nemaš dovoljno kuna!' });
        return;
      }
      newCredit -= totalBet;
    }

    fastSpinRequestedRef.current = false;

    updateState({
      spinning: true,
      winAmount: 0,
      message,
      credit: newCredit,
      freeSpins: newFreeSpins,
      winningPositions: new Set(),
      spinningReels: Array(CONFIG.REELS).fill(true),
      fastSpin: false
    });

    let newSymbols = generateReels();
    currentSpinSymbolsRef.current = newSymbols;

    let bookCount = 0;
    newSymbols.forEach(col => col.forEach(s => { if (s === 'BOOK') bookCount++; }));
    
    const shouldTriggerFreeSpins = state.freeSpins === 0 && 
      (bookCount >= 3 || (Math.random() < CONFIG.FREE_SPINS_CHANCE && bookCount >= 2));
    
    if (shouldTriggerFreeSpins && bookCount < 3) {
      let added = 0;
      for (let i = 0; i < CONFIG.REELS && added < (3 - bookCount); i++) {
        const row = Math.floor(Math.random() * CONFIG.ROWS);
        if (newSymbols[i][row] !== 'BOOK') {
          newSymbols[i][row] = 'BOOK';
          added++;
        }
      }
      currentSpinSymbolsRef.current = newSymbols;
    }

    for (let i = 0; i < CONFIG.REELS; i++) {
      const delayTime = fastSpinRequestedRef.current ? CONFIG.FAST_SPIN_DELAY : CONFIG.REEL_STOP_DELAY;
      await delay(delayTime);
      
      playReelStopSound(i);
      
      setState(prev => {
        const newSpinningReels = [...prev.spinningReels];
        newSpinningReels[i] = false;
        
        const newReelSymbols = [...prev.reelSymbols];
        newReelSymbols[i] = currentSpinSymbolsRef.current![i];
        
        return {
          ...prev,
          spinningReels: newSpinningReels,
          reelSymbols: newReelSymbols
        };
      });
    }

    await delay(100);

    let finalSymbols = currentSpinSymbolsRef.current!;
    if (state.expandingSymbol) {
      finalSymbols = finalSymbols.map(col => {
        if (col.some(s => s === state.expandingSymbol || s === 'BOOK')) {
          return col.map(() => state.expandingSymbol!);
        }
        return col;
      });
      
      setState(prev => ({ ...prev, reelSymbols: finalSymbols }));
    }

    const wins: { symbol: SymbolType; count: number; positions: { reel: number; row: number }[]; payout: number }[] = [];
    const winningPositions = new Set<string>();

    for (let l = 0; l < state.lines; l++) {
      const line = PAYLINES[l];
      const syms = line.map((row, col) => finalSymbols[col][row]);
      
      let first = syms[0];
      if (first === 'BOOK') {
        for (let i = 1; i < syms.length; i++) {
          if (syms[i] !== 'BOOK') {
            first = syms[i];
            break;
          }
        }
      }

      let count = 0;
      const positions: { reel: number; row: number }[] = [];
      
      for (let i = 0; i < syms.length; i++) {
        if (syms[i] === first || syms[i] === 'BOOK') {
          count++;
          positions.push({ reel: i, row: line[i] });
        } else {
          break;
        }
      }

      const payout = PAYOUTS[first];
      if (count >= 3 && payout && payout[count]) {
        wins.push({ symbol: first, count, positions, payout: payout[count] });
        positions.forEach(p => winningPositions.add(`${p.reel}-${p.row}`));
      } else if (count >= 2 && (first === 'HAT' || first === 'PHARAOH') && payout && payout[count]) {
        wins.push({ symbol: first, count, positions, payout: payout[count] });
        positions.forEach(p => winningPositions.add(`${p.reel}-${p.row}`));
      }
    }

    const winAmount = wins.reduce((t, w) => t + w.payout * state.bet, 0);
    let finalMessage = message;
    let finalCredit = newCredit;

    if (winAmount > 0) {
      finalCredit += winAmount;
      finalMessage = `DOBITAK: ${winAmount.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} HRK`;
      playSound('win');
    }

    bookCount = 0;
    finalSymbols.forEach(col => col.forEach(s => { if (s === 'BOOK') bookCount++; }));

    let showBonus = false;
    let expandingSymbol = state.expandingSymbol;
    let finalFreeSpins = newFreeSpins;

    if (bookCount >= 3 && state.freeSpins === 0) {
      const expandSyms = SYMBOLS.filter(s => s !== 'BOOK');
      expandingSymbol = expandSyms[Math.floor(Math.random() * expandSyms.length)];
      finalFreeSpins = 10;
      showBonus = true;
      playSound('freeGames');
    }

    updateState({
      spinning: false,
      reelSymbols: finalSymbols,
      winAmount,
      message: finalMessage,
      credit: finalCredit,
      winningPositions,
      freeSpins: finalFreeSpins,
      expandingSymbol: showBonus ? expandingSymbol : state.expandingSymbol,
      showBonus,
      lastWin: winAmount,
      spinningReels: Array(CONFIG.REELS).fill(false),
      fastSpin: false
    });

    if (finalFreeSpins > 0 && !showBonus) {
      await delay(1000);
      spin();
    }
  }, [state, updateState, playSound, playReelStopSound, triggerFastSpin]);

  const startFreeSpins = useCallback(() => {
    updateState({ showBonus: false });
    setTimeout(() => spin(), 500);
  }, [updateState, spin]);

  const startGamble = useCallback(() => {
    if (state.lastWin > 0) {
      updateState({ 
        showGamble: true, 
        gambleAmount: state.lastWin 
      });
    }
  }, [state.lastWin, updateState]);

  const gamble = useCallback((choice: 'red' | 'black') => {
    const isRed = Math.random() < 0.5;
    const won = (choice === 'red' && isRed) || (choice === 'black' && !isRed);
    
    if (won) {
      const newAmount = state.gambleAmount * 2;
      playSound('win');
      updateState({
        gambleAmount: newAmount,
        message: `DOBITAK: ${newAmount.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} HRK`
      });
    } else {
      updateState({
        showGamble: false,
        gambleAmount: 0,
        message: 'Izgubio si gamble!',
        lastWin: 0
      });
    }
  }, [state.gambleAmount, updateState, playSound]);

  const collectGamble = useCallback(() => {
    updateState({
      showGamble: false,
      credit: state.credit + state.gambleAmount,
      gambleAmount: 0,
      lastWin: 0,
      message: `Pokupio si ${state.gambleAmount.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} HRK`
    });
  }, [state.credit, state.gambleAmount, updateState]);

  return {
    state,
    updateState,
    adjustLines,
    adjustBet,
    spin,
    startFreeSpins,
    startGamble,
    gamble,
    collectGamble,
    playSound
  };
}
