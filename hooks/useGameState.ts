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
  PREMIUM_SYMBOLS,
  SymbolType 
} from '@/lib/gameConfig';

export interface WinLine {
  lineIndex: number;
  color: string;
  positions: { reel: number; row: number }[];
  symbol: SymbolType;
  count: number;
  payout: number;
}

export interface GameState {
  credit: number;
  bet: number;
  lines: number;
  spinning: boolean;
  freeSpins: number;
  freeSpinsTotal: number;
  freeSpinsWin: number;
  expandingSymbol: SymbolType | null;
  reelSymbols: SymbolType[][];
  winAmount: number;
  message: string;
  winningPositions: Set<string>;
  winningLines: WinLine[];
  showBonus: boolean;
  showBonusEnd: boolean;
  showPaytable: boolean;
  showGamble: boolean;
  gambleAmount: number;
  soundEnabled: boolean;
  spinningReels: boolean[];
  lastWin: number;
  fastSpin: boolean;
  forceBooks: boolean;
  expandingAnimation: boolean;
  expandingReels: number[];
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

// Calculate minimum match count based on symbol type
const getMinMatch = (symbol: SymbolType): number => {
  if (PREMIUM_SYMBOLS.includes(symbol)) {
    return 2; // HAT, PHARAOH pay for 2+
  }
  return 3; // All other symbols need 3+
};

export function useGameState() {
  const [state, setState] = useState<GameState>({
    credit: CONFIG.INITIAL_CREDIT,
    bet: 0.1,
    lines: 10,
    spinning: false,
    freeSpins: 0,
    freeSpinsTotal: 0,
    freeSpinsWin: 0,
    expandingSymbol: null,
    reelSymbols: generateReels(),
    winAmount: 0,
    message: 'Sretno! Ako sjebeš pare, posudi od frenda!',
    winningPositions: new Set(),
    winningLines: [],
    showBonus: false,
    showBonusEnd: false,
    showPaytable: false,
    showGamble: false,
    gambleAmount: 0,
    soundEnabled: true,
    spinningReels: Array(CONFIG.REELS).fill(false),
    lastWin: 0,
    fastSpin: false,
    forceBooks: false,
    expandingAnimation: false,
    expandingReels: []
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

  const toggleForceBooks = useCallback(() => {
    setState(prev => ({ ...prev, forceBooks: !prev.forceBooks }));
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

  // Calculate wins from final symbols
  const calculateWins = useCallback((symbols: SymbolType[][], lines: number, bet: number): { 
    winningLines: WinLine[]; 
    winningPositions: Set<string>; 
    totalWin: number 
  } => {
    const winningLines: WinLine[] = [];
    const winningPositions = new Set<string>();

    for (let l = 0; l < lines; l++) {
      const line = PAYLINES[l];
      const syms = line.pattern.map((row, col) => symbols[col][row]);
      
      // Find the first non-BOOK symbol (BOOK is wild)
      let first = syms[0];
      if (first === 'BOOK') {
        for (let i = 1; i < syms.length; i++) {
          if (syms[i] !== 'BOOK') {
            first = syms[i];
            break;
          }
        }
      }

      // Count consecutive matches from left
      let count = 0;
      const positions: { reel: number; row: number }[] = [];
      
      for (let i = 0; i < syms.length; i++) {
        if (syms[i] === first || syms[i] === 'BOOK') {
          count++;
          positions.push({ reel: i, row: line.pattern[i] });
        } else {
          break;
        }
      }

      // Check if win qualifies
      const payout = PAYOUTS[first];
      const minMatch = getMinMatch(first);
      
      if (count >= minMatch && payout && payout[count]) {
        winningLines.push({
          lineIndex: l,
          color: line.color,
          positions,
          symbol: first,
          count,
          payout: payout[count]
        });
        positions.forEach(p => winningPositions.add(`${p.reel}-${p.row}`));
      }
    }

    // Calculate total win: sum of (payout * bet) for each winning line
    const totalWin = winningLines.reduce((t, w) => t + (w.payout * bet), 0);

    return { winningLines, winningPositions, totalWin };
  }, []);

  const spin = useCallback(async () => {
    if (state.spinning || state.expandingAnimation) {
      if (state.spinning) triggerFastSpin();
      return;
    }

    const totalBet = state.bet * state.lines;
    let newCredit = state.credit;
    let newFreeSpins = state.freeSpins;
    let message = 'Sretno! Ako sjebeš pare, posudi od frenda!';
    const isInFreeSpins = state.freeSpinsTotal > 0;

    // Free spins mode - no bet deduction
    if (state.freeSpins > 0) {
      newFreeSpins--;
      const currentGame = state.freeSpinsTotal - newFreeSpins;
      message = `BESPLATNA IGRA ${currentGame} / ${state.freeSpinsTotal}`;
    } else if (!isInFreeSpins) {
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
      winningLines: [],
      spinningReels: Array(CONFIG.REELS).fill(true),
      fastSpin: false,
      expandingAnimation: false,
      expandingReels: []
    });

    let newSymbols = generateReels();
    
    // Force 3 books if enabled (test mode)
    if (state.forceBooks) {
      const bookPositions = [
        { reel: 0, row: Math.floor(Math.random() * 3) },
        { reel: 2, row: Math.floor(Math.random() * 3) },
        { reel: 4, row: Math.floor(Math.random() * 3) }
      ];
      bookPositions.forEach(pos => {
        newSymbols[pos.reel][pos.row] = 'BOOK';
      });
      setState(prev => ({ ...prev, forceBooks: false }));
    }
    
    currentSpinSymbolsRef.current = newSymbols;

    // Check for book count
    let bookCount = 0;
    newSymbols.forEach(col => col.forEach(s => { if (s === 'BOOK') bookCount++; }));
    
    // Only trigger free spins if NOT already in free spins mode
    const shouldTriggerFreeSpins = !isInFreeSpins &&
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

    // Stop reels one by one
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

    let finalSymbols = [...currentSpinSymbolsRef.current!.map(col => [...col])];
    
    // During free spins - check for expanding symbol and animate
    if (state.expandingSymbol && isInFreeSpins) {
      const reelsWithExpandingSymbol: number[] = [];
      
      finalSymbols.forEach((col, reelIdx) => {
        if (col.some(s => s === state.expandingSymbol || s === 'BOOK')) {
          reelsWithExpandingSymbol.push(reelIdx);
        }
      });
      
      if (reelsWithExpandingSymbol.length > 0) {
        // Start expanding animation
        setState(prev => ({ 
          ...prev, 
          spinning: false,
          expandingAnimation: true,
          expandingReels: []
        }));
        
        // Animate each reel expanding one by one
        for (const reelIdx of reelsWithExpandingSymbol) {
          await delay(300);
          
          // Expand this reel - fill all 3 rows with expanding symbol
          finalSymbols[reelIdx] = [state.expandingSymbol!, state.expandingSymbol!, state.expandingSymbol!];
          
          setState(prev => {
            const newReelSymbols = [...prev.reelSymbols.map(col => [...col])];
            newReelSymbols[reelIdx] = [state.expandingSymbol!, state.expandingSymbol!, state.expandingSymbol!];
            
            return {
              ...prev,
              reelSymbols: newReelSymbols,
              expandingReels: [...prev.expandingReels, reelIdx]
            };
          });
          
          playSound('lineWin');
        }
        
        await delay(400);
      }
    }

    // Calculate wins from final symbol configuration
    const { winningLines, winningPositions, totalWin } = calculateWins(finalSymbols, state.lines, state.bet);
    
    let finalMessage = message;
    let finalCredit = newCredit;
    let newFreeSpinsWin = state.freeSpinsWin;

    if (totalWin > 0) {
      finalCredit += totalWin;
      finalMessage = `DOBITAK: ${totalWin.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} HRK`;
      playSound('win');
      
      // Track free spins winnings
      if (isInFreeSpins) {
        newFreeSpinsWin += totalWin;
      }
    }

    // Check for bonus trigger (3+ books)
    bookCount = 0;
    finalSymbols.forEach(col => col.forEach(s => { if (s === 'BOOK') bookCount++; }));

    let showBonus = false;
    let expandingSymbol = state.expandingSymbol;
    let finalFreeSpins = newFreeSpins;
    let freeSpinsTotal = state.freeSpinsTotal;

    if (bookCount >= 3 && !isInFreeSpins) {
      // New free spins triggered
      const expandSyms = SYMBOLS.filter(s => s !== 'BOOK');
      expandingSymbol = expandSyms[Math.floor(Math.random() * expandSyms.length)];
      finalFreeSpins = 10;
      freeSpinsTotal = 10;
      showBonus = true;
      newFreeSpinsWin = 0; // Reset bonus win counter
      playSound('freeGames');
    } else if (bookCount >= 3 && isInFreeSpins) {
      // Retrigger - add 10 more free spins
      finalFreeSpins += 10;
      freeSpinsTotal = state.freeSpinsTotal + 10;
      finalMessage = `+10 BESPLATNIH IGARA! Ukupno: ${freeSpinsTotal}`;
      playSound('freeGames');
    }

    // Check if free spins ended
    let showBonusEnd = false;
    if (isInFreeSpins && finalFreeSpins === 0 && !showBonus) {
      showBonusEnd = true;
    }

    updateState({
      spinning: false,
      expandingAnimation: false,
      reelSymbols: finalSymbols,
      winAmount: totalWin,
      message: finalMessage,
      credit: finalCredit,
      winningPositions,
      winningLines,
      freeSpins: finalFreeSpins,
      freeSpinsTotal: showBonusEnd ? 0 : freeSpinsTotal,
      freeSpinsWin: showBonusEnd ? newFreeSpinsWin : newFreeSpinsWin, // Keep for end screen
      expandingSymbol: showBonus ? expandingSymbol : state.expandingSymbol,
      showBonus,
      showBonusEnd,
      lastWin: totalWin,
      spinningReels: Array(CONFIG.REELS).fill(false),
      fastSpin: false,
      expandingReels: []
    });

  }, [state, updateState, playSound, playReelStopSound, triggerFastSpin, calculateWins]);

  const startFreeSpins = useCallback(() => {
    updateState({ showBonus: false });
  }, [updateState]);

  const closeBonusEnd = useCallback(() => {
    setState(prev => ({
      ...prev,
      showBonusEnd: false,
      expandingSymbol: null,
      freeSpinsTotal: 0,
      freeSpinsWin: 0
    }));
  }, []);

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
    closeBonusEnd,
    startGamble,
    gamble,
    collectGamble,
    toggleForceBooks,
    playSound
  };
}
