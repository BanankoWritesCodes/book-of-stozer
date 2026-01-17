'use client';

import Image from 'next/image';
import { useEffect, useCallback, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { SYMBOL_IMAGES, SYMBOL_NAMES, PAYOUTS, SYMBOLS, CONFIG, SymbolType } from '@/lib/gameConfig';

export default function SlotMachine() {
  const { 
    state, 
    updateState, 
    adjustLines, 
    adjustBet, 
    spin, 
    startFreeSpins,
    startGamble,
    gamble,
    collectGamble 
  } = useGameState();
  
  const [gambleCard, setGambleCard] = useState<'red' | 'black' | null>(null);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !state.showGamble && !state.showBonus && !state.showPaytable) {
        e.preventDefault();
        spin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.showGamble, state.showBonus, state.showPaytable, spin]);

  // Generate spinning symbols for animation
  const getSpinningSymbols = useCallback(() => {
    const symbols: SymbolType[] = [];
    for (let i = 0; i < 20; i++) {
      symbols.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
    }
    return symbols;
  }, []);

  const renderReel = useCallback((reelIdx: number) => {
    const isSpinning = state.spinningReels[reelIdx];
    const symbols = state.reelSymbols[reelIdx];
    
    return (
      <div key={reelIdx} className="reel">
        <div className={`reel-inner ${isSpinning ? 'spinning' : ''}`}>
          {isSpinning ? (
            getSpinningSymbols().map((symbol, idx) => (
              <div key={idx} className="symbol">
                <div className="symbol-inner">
                  <Image
                    src={SYMBOL_IMAGES[symbol]}
                    alt={symbol}
                    width={150}
                    height={150}
                    priority
                    unoptimized
                  />
                </div>
              </div>
            ))
          ) : (
            symbols.map((symbol, rowIdx) => {
              const isWinning = state.winningPositions.has(`${reelIdx}-${rowIdx}`);
              return (
                <div key={rowIdx} className={`symbol ${isWinning ? 'winning' : ''}`}>
                  <div className="symbol-inner">
                    <Image
                      src={SYMBOL_IMAGES[symbol]}
                      alt={symbol}
                      width={150}
                      height={150}
                      priority
                      unoptimized
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }, [state.spinningReels, state.reelSymbols, state.winningPositions, getSpinningSymbols]);

  const handleGamble = (choice: 'red' | 'black') => {
    setGambleCard(choice);
    setTimeout(() => {
      gamble(choice);
      setGambleCard(null);
    }, 1000);
  };

  const formatBet = (bet: number) => {
    return bet < 1 ? bet.toFixed(1) : bet.toString();
  };

  return (
    <div className="game-container">
      <div className="game-wrapper">
        {/* Top Bar */}
        <div className="top-bar">
          <div className="top-left">
            <span className="game-title-small">BOOK OF STOŽER</span>
          </div>
          <div className="top-right">
            <button className="top-btn" onClick={() => updateState({ showPaytable: true })}>
              Paytable
            </button>
            <button 
              className="top-btn" 
              onClick={() => updateState({ soundEnabled: !state.soundEnabled })}
            >
              {state.soundEnabled ? '🔊' : '🔇'}
            </button>
          </div>
        </div>

        {/* Logo */}
        <div className="logo-area">
          <div className="pyramids">
            <div className="pyramid pyramid-1" />
            <div className="pyramid pyramid-2" />
            <div className="pyramid pyramid-3" />
            <div className="pyramid pyramid-4" />
          </div>
          <div className="logo-container">
            <div className="logo-frame">
              <div className="logo-text">BOOK OF STOŽER</div>
              <div className="logo-sub">DELUXE 6</div>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="game-area">
          {/* Left Payline Numbers */}
          <div className="payline-numbers">
            {[1, 4, 6, 9, 8].map(num => (
              <div
                key={num}
                className={`payline-num c${num} ${num > state.lines ? 'inactive' : ''}`}
                onClick={() => updateState({ lines: num })}
              >
                {num}
              </div>
            ))}
          </div>

          {/* Reels */}
          <div className="reels-frame">
            <div className="reels-container">
              {Array.from({ length: CONFIG.REELS }, (_, i) => renderReel(i))}
            </div>

            {state.freeSpins > 0 && !state.spinning && (
              <div className="free-spins-banner active">
                <div className="free-spins-text">BESPLATNE IGRE: {state.freeSpins}</div>
              </div>
            )}
          </div>

          {/* Right Payline Numbers */}
          <div className="payline-numbers right">
            {[2, 3, 7, 5, 10].map(num => (
              <div
                key={num}
                className={`payline-num c${num} ${num > state.lines ? 'inactive' : ''}`}
                onClick={() => updateState({ lines: num })}
              >
                {num}
              </div>
            ))}
          </div>
        </div>

        {/* Message Bar */}
        <div className="message-bar">
          <div className="message-text">{state.message}</div>
        </div>

        {/* Controls */}
        <div className="bottom-controls">
          <div className="controls-row">
            <div className="control-box">
              <span className="control-label">Kune (HRK)</span>
              <span className="control-value green">
                {state.credit.toLocaleString('hr-HR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="adjuster-group">
              <span className="adjuster-label">Linije</span>
              <div className="adjuster">
                <button className="adj-btn" onClick={() => adjustLines(-1)}>−</button>
                <span className="adj-value">{state.lines}</span>
                <button className="adj-btn" onClick={() => adjustLines(1)}>+</button>
              </div>
            </div>

            <div className="adjuster-group">
              <span className="adjuster-label">Ulog/Linija</span>
              <div className="adjuster">
                <button className="adj-btn" onClick={() => adjustBet(-1)}>−</button>
                <span className="adj-value">{formatBet(state.bet)}</span>
                <button className="adj-btn" onClick={() => adjustBet(1)}>+</button>
              </div>
            </div>

            <div className="control-box">
              <span className="control-label">Ukupni Ulog</span>
              <span className="control-value">{(state.bet * state.lines).toLocaleString('hr-HR', { minimumFractionDigits: 2 })}</span>
            </div>

            <button 
              className="silver-btn" 
              onClick={startGamble}
              disabled={state.lastWin === 0 || state.spinning}
            >
              Gamble
            </button>
            <button 
              className="silver-btn start" 
              onClick={spin}
            >
              {state.spinning ? 'STOP' : 'START'}
            </button>
          </div>
        </div>

        <div className="disclaimer">
          ⚠️ PARODIJA - Ovo nije prava igra na sreću. Ne koristi se pravi novac. RTP: 90%
        </div>
      </div>

      {/* Bonus Overlay */}
      {state.showBonus && (
        <div className="overlay active">
          <div className="bonus-content">
            <h2 className="bonus-title">BESPLATNE IGRE!</h2>
            <div className="bonus-books">
              {[1, 2, 3].map(i => (
                <div key={i} className="bonus-book">
                  <Image src={SYMBOL_IMAGES['BOOK']} alt="Book" width={100} height={100} unoptimized />
                </div>
              ))}
            </div>
            <p className="bonus-info">10 BESPLATNIH IGARA!</p>
            <p className="bonus-symbol-display">Expanding simbol:</p>
            {state.expandingSymbol && (
              <>
                <Image 
                  src={SYMBOL_IMAGES[state.expandingSymbol]} 
                  alt="Expanding" 
                  width={120} 
                  height={120}
                  className="bonus-symbol-img"
                  unoptimized
                />
                <p className="bonus-symbol-name">{SYMBOL_NAMES[state.expandingSymbol]}</p>
              </>
            )}
            <button className="bonus-btn" onClick={startFreeSpins}>ZAPOČNI</button>
          </div>
        </div>
      )}

      {/* Gamble Overlay */}
      {state.showGamble && (
        <div className="overlay active">
          <div className="gamble-content">
            <h2 className="gamble-title">GAMBLE</h2>
            <p className="gamble-amount">Dobitak: {state.gambleAmount.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} HRK</p>
            <p className="gamble-potential">Potencijalni dobitak: {(state.gambleAmount * 2).toLocaleString('hr-HR', { minimumFractionDigits: 2 })} HRK</p>
            
            <div className="gamble-cards">
              <div 
                className={`gamble-card red ${gambleCard === 'red' ? 'selected' : ''}`}
                onClick={() => !gambleCard && handleGamble('red')}
              >
                <div className="card-inner">
                  <span className="card-suit">♥</span>
                  <span className="card-suit">♦</span>
                </div>
                <span className="card-label">CRVENA</span>
              </div>
              
              <div className="gamble-card-back">
                <span>?</span>
              </div>
              
              <div 
                className={`gamble-card black ${gambleCard === 'black' ? 'selected' : ''}`}
                onClick={() => !gambleCard && handleGamble('black')}
              >
                <div className="card-inner">
                  <span className="card-suit">♠</span>
                  <span className="card-suit">♣</span>
                </div>
                <span className="card-label">CRNA</span>
              </div>
            </div>
            
            <button className="collect-btn" onClick={collectGamble}>
              POKUPI {state.gambleAmount.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} HRK
            </button>
          </div>
        </div>
      )}

      {/* Paytable Overlay */}
      {state.showPaytable && (
        <div className="overlay active" onClick={() => updateState({ showPaytable: false })}>
          <div className="paytable-content" onClick={e => e.stopPropagation()}>
            <h2 className="paytable-title">TABLICA ISPLATA</h2>
            <p className="paytable-subtitle">Množitelj × Ulog po liniji</p>
            <div className="paytable-grid">
              {SYMBOLS.map(symbol => (
                <div key={symbol} className="paytable-item">
                  <div className="paytable-sym">
                    <Image src={SYMBOL_IMAGES[symbol]} alt={symbol} width={80} height={80} unoptimized />
                  </div>
                  <div className="paytable-vals">
                    <strong>{SYMBOL_NAMES[symbol]}</strong>
                    {symbol === 'BOOK' ? (
                      <>3+ = 10 Besplatnih igara<br />Wild simbol<br />6×50000 | 5×18000 | 4×1800 | 3×180</>
                    ) : (
                      Object.entries(PAYOUTS[symbol])
                        .filter(([_, v]) => v > 0)
                        .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
                        .map(([k, v]) => `${k}×${v}`)
                        .join(' | ')
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button className="paytable-close" onClick={() => updateState({ showPaytable: false })}>
              ZATVORI
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
