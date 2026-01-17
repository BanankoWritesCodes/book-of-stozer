'use client';

import Image from 'next/image';
import { useEffect, useCallback, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { SYMBOL_IMAGES, SYMBOL_NAMES, PAYOUTS, SYMBOLS, CONFIG, PAYLINES, SymbolType } from '@/lib/gameConfig';

export default function SlotMachine() {
  const { 
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
    toggleForceBooks
  } = useGameState();
  
  const [gambleCard, setGambleCard] = useState<'red' | 'black' | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !state.showGamble && !state.showBonus && !state.showPaytable && !state.showBonusEnd) {
        e.preventDefault();
        spin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.showGamble, state.showBonus, state.showPaytable, state.showBonusEnd, spin]);

  const getSpinningSymbols = useCallback(() => {
    const symbols: SymbolType[] = [];
    for (let i = 0; i < 20; i++) {
      symbols.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
    }
    return symbols;
  }, []);

  const renderReel = useCallback((reelIdx: number) => {
    const isSpinning = state.spinningReels[reelIdx];
    const isExpanding = state.expandingReels.includes(reelIdx);
    const symbols = state.reelSymbols[reelIdx];
    
    return (
      <div key={reelIdx} className={`reel ${isExpanding ? 'expanding' : ''}`}>
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
                <div key={rowIdx} className={`symbol ${isWinning ? 'winning' : ''} ${isExpanding ? 'expanded' : ''}`}>
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
  }, [state.spinningReels, state.reelSymbols, state.winningPositions, state.expandingReels, getSpinningSymbols]);

  const renderWinLines = () => {
    if (state.winningLines.length === 0 || state.spinning) return null;

    return (
      <svg className="win-lines-svg">
        {state.winningLines.map((winLine, idx) => {
          const points = winLine.positions.map((pos) => {
            const x = (pos.reel + 0.5) * (100 / CONFIG.REELS);
            const y = (pos.row + 0.5) * (100 / CONFIG.ROWS);
            return `${x}%,${y}%`;
          }).join(' ');

          return (
            <g key={idx}>
              <polyline
                points={points}
                fill="none"
                stroke={winLine.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.4"
                className="win-line-glow"
              />
              <polyline
                points={points}
                fill="none"
                stroke={winLine.color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="win-line"
              />
              <circle
                cx={`${(winLine.positions[0].reel + 0.5) * (100 / CONFIG.REELS)}%`}
                cy={`${(winLine.positions[0].row + 0.5) * (100 / CONFIG.ROWS)}%`}
                r="12"
                fill={winLine.color}
                stroke="#000"
                strokeWidth="2"
              />
              <text
                x={`${(winLine.positions[0].reel + 0.5) * (100 / CONFIG.REELS)}%`}
                y={`${(winLine.positions[0].row + 0.5) * (100 / CONFIG.ROWS)}%`}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#000"
                fontSize="10"
                fontWeight="bold"
              >
                {winLine.lineIndex + 1}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

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

  // Check if in free spins mode
  const inFreeSpins = state.freeSpinsTotal > 0;

  return (
    <div className={`game-container ${inFreeSpins ? 'free-spins-mode' : ''}`}>
      <div className="game-wrapper">
        {/* Top Bar */}
        <div className="top-bar">
          <div className="top-left">
            <span className="game-title-small">BOOK OF STOŽER</span>
            <button 
              className="hidden-test-btn"
              onClick={toggleForceBooks}
              title="Test: Force 3 Books"
            >
              {state.forceBooks ? '📗' : '📕'}
            </button>
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

        {/* Free Spins Info Bar */}
        {inFreeSpins && (
          <div className="free-spins-info-bar">
            <div className="fs-info-item">
              <span className="fs-label">BESPLATNA IGRA</span>
              <span className="fs-value">{state.freeSpinsTotal - state.freeSpins} / {state.freeSpinsTotal}</span>
            </div>
            <div className="fs-info-item">
              <span className="fs-label">EXPANDING</span>
              <div className="fs-symbol">
                {state.expandingSymbol && (
                  <Image 
                    src={SYMBOL_IMAGES[state.expandingSymbol]} 
                    alt="Expanding" 
                    width={30} 
                    height={30}
                    unoptimized
                  />
                )}
              </div>
            </div>
            <div className="fs-info-item">
              <span className="fs-label">BONUS DOBITAK</span>
              <span className="fs-value bonus-win">{state.freeSpinsWin.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} HRK</span>
            </div>
          </div>
        )}

        {/* Game Area */}
        <div className="game-area">
          {/* Left Payline Numbers */}
          <div className="payline-numbers">
            {[1, 4, 6, 9, 8].map(num => (
              <div
                key={num}
                className={`payline-num c${num} ${num > state.lines ? 'inactive' : ''}`}
                onClick={() => !inFreeSpins && updateState({ lines: num })}
              >
                {num}
              </div>
            ))}
          </div>

          {/* Reels */}
          <div className="reels-frame">
            <div className="reels-container">
              {Array.from({ length: CONFIG.REELS }, (_, i) => renderReel(i))}
              {renderWinLines()}
            </div>

            {state.freeSpins > 0 && !state.spinning && !state.expandingAnimation && (
              <div className="free-spins-banner active">
                <div className="free-spins-text">PREOSTALO: {state.freeSpins} IGARA</div>
              </div>
            )}
          </div>

          {/* Right Payline Numbers */}
          <div className="payline-numbers right">
            {[2, 3, 7, 5, 10].map(num => (
              <div
                key={num}
                className={`payline-num c${num} ${num > state.lines ? 'inactive' : ''}`}
                onClick={() => !inFreeSpins && updateState({ lines: num })}
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
                <button className="adj-btn" onClick={() => adjustLines(-1)} disabled={inFreeSpins}>−</button>
                <span className="adj-value">{state.lines}</span>
                <button className="adj-btn" onClick={() => adjustLines(1)} disabled={inFreeSpins}>+</button>
              </div>
            </div>

            <div className="adjuster-group">
              <span className="adjuster-label">Ulog/Linija</span>
              <div className="adjuster">
                <button className="adj-btn" onClick={() => adjustBet(-1)} disabled={inFreeSpins}>−</button>
                <span className="adj-value">{formatBet(state.bet)}</span>
                <button className="adj-btn" onClick={() => adjustBet(1)} disabled={inFreeSpins}>+</button>
              </div>
            </div>

            <div className="control-box">
              <span className="control-label">Ukupni Ulog</span>
              <span className="control-value">{(state.bet * state.lines).toLocaleString('hr-HR', { minimumFractionDigits: 2 })}</span>
            </div>

            <button 
              className="silver-btn" 
              onClick={startGamble}
              disabled={state.lastWin === 0 || state.spinning || inFreeSpins}
            >
              Gamble
            </button>
            <button 
              className="silver-btn start" 
              onClick={spin}
              disabled={state.expandingAnimation}
            >
              {state.spinning ? 'STOP' : inFreeSpins ? 'SPIN' : 'START'}
            </button>
          </div>
        </div>

        <div className="disclaimer">
          ⚠️ PARODIJA - Ovo nije prava igra na sreću. Ne koristi se pravi novac. RTP: 90%
        </div>
      </div>

      {/* Bonus Start Overlay - Custom Design */}
      {state.showBonus && (
        <div className="overlay active">
          <div className="bonus-screen">
            <div className="bonus-screen-inner">
              <div className="bonus-header">
                <span className="bonus-games-text">10 Free Games</span>
              </div>
              
              <div className="bonus-book-display">
                <div className="bonus-book-frame">
                  <div className="bonus-book-left">
                    <Image 
                      src={SYMBOL_IMAGES[state.expandingSymbol || 'BOOK']} 
                      alt="Symbol" 
                      width={100} 
                      height={100}
                      unoptimized
                    />
                  </div>
                  <div className="bonus-book-right">
                    <div className="eye-of-ra">👁</div>
                  </div>
                </div>
              </div>
              
              <div className="bonus-expanding-text">
                <span>Special Expanding Symbol</span>
              </div>
              
              <div className="bonus-symbol-name">
                {state.expandingSymbol && SYMBOL_NAMES[state.expandingSymbol]}
              </div>
              
              <button className="bonus-start-btn" onClick={startFreeSpins}>
                ZAPOČNI BESPLATNE IGRE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bonus End Overlay */}
      {state.showBonusEnd && (
        <div className="overlay active">
          <div className="bonus-end-screen">
            <h2 className="bonus-end-title">BESPLATNE IGRE ZAVRŠENE!</h2>
            <div className="bonus-end-stats">
              <div className="bonus-stat">
                <span className="stat-label">Odigrano igara:</span>
                <span className="stat-value">{state.freeSpinsTotal}</span>
              </div>
              <div className="bonus-stat total">
                <span className="stat-label">Ukupni dobitak:</span>
                <span className="stat-value">{state.freeSpinsWin.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} HRK</span>
              </div>
            </div>
            <button className="bonus-end-btn" onClick={closeBonusEnd}>
              NASTAVI
            </button>
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
