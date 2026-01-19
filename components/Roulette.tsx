'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import './roulette.css';

// European roulette wheel sequence
const WHEEL = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const RED = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
const MALA_SERIJA = [5,8,10,11,13,16,23,24,27,30,33,36];

export default function Roulette({ onBack }: { onBack: () => void }) {
  const [credit, setCredit] = useState(1000);
  const [bets, setBets] = useState<{id:string, nums:number[], amt:number, type:string}[]>([]);
  const [chip, setChip] = useState(5);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number|null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [lastWin, setLastWin] = useState(0);
  const [showWarn, setShowWarn] = useState(false);
  const [force23, setForce23] = useState(false);
  
  // Wheel rotation
  const [wheelDeg, setWheelDeg] = useState(0);
  
  // Ball state - using refs for animation
  const [ballAngle, setBallAngle] = useState(0);
  const [ballRadius, setBallRadius] = useState(125); // distance from center
  const [ballVisible, setBallVisible] = useState(true);
  
  const animationRef = useRef<number | null>(null);
  const sndSpin = useRef<HTMLAudioElement|null>(null);
  const sndWin = useRef<HTMLAudioElement|null>(null);
  const sndBounce = useRef<HTMLAudioElement|null>(null);

  useEffect(() => {
    sndSpin.current = new Audio('/sounds/RowSpin.mp3');
    sndWin.current = new Audio('/sounds/NormalSymbolWin.mp3');
    sndBounce.current = new Audio('/sounds/NormalSymbolWin.mp3');
    if (sndBounce.current) sndBounce.current.volume = 0.3;
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const isRed = (n: number) => RED.includes(n);
  const getColor = (n: number) => n === 0 ? 'green' : isRed(n) ? 'red' : 'black';
  const getBet = (id: string) => bets.filter(b => b.id === id).reduce((s,b) => s + b.amt, 0);
  const totalBets = () => bets.reduce((s,b) => s + b.amt, 0);

  const placeBet = (type: string, nums: number[], id: string) => {
    if (spinning) return;
    
    if (force23 && type === 'straight') {
      nums = [23]; id = 's-23';
      setForce23(false);
    }
    
    if (type === 'straight' && nums[0] !== 0 && !MALA_SERIJA.includes(nums[0])) {
      setShowWarn(true);
      setTimeout(() => setShowWarn(false), 3000);
      return;
    }
    
    if (credit < chip) return;
    
    const i = bets.findIndex(b => b.id === id);
    if (i >= 0) {
      const nb = [...bets];
      nb[i].amt += chip;
      setBets(nb);
    } else {
      setBets([...bets, { id, nums, amt: chip, type }]);
    }
    setCredit(c => c - chip);
  };

  const clearBets = () => {
    if (spinning) return;
    setCredit(c => c + totalBets());
    setBets([]);
    setResult(null);
    setLastWin(0);
  };

  const spin = useCallback(() => {
    if (spinning || !bets.length) return;
    
    setSpinning(true);
    setResult(null);
    setLastWin(0);
    setBallVisible(true);
    setBallRadius(125);
    sndSpin.current?.play().catch(() => {});

    // Determine winning number
    const winNum = Math.floor(Math.random() * 37);
    const winIdx = WHEEL.indexOf(winNum);
    const segmentAngle = 360 / 37;
    
    // Wheel rotation - ends with winning number at top (marker position)
    const wheelSpins = 4 + Math.random() * 2;
    const finalWheelDeg = wheelDeg + (wheelSpins * 360) + (360 - winIdx * segmentAngle - segmentAngle / 2);
    
    // Animation timing
    const totalDuration = 8000; // 8 seconds total
    const spinPhaseEnd = 0.5; // First 50% is fast spinning
    const bouncePhaseStart = 0.5;
    const bouncePhaseEnd = 0.95;
    
    const startTime = performance.now();
    const startWheelDeg = wheelDeg;
    const startBallAngle = ballAngle;
    
    // Ball spins opposite direction
    const ballSpins = 12 + Math.random() * 4;
    const finalBallAngle = startBallAngle - (ballSpins * 360);
    
    // Bounce configuration - 10 bounces
    const bounces = [
      { time: 0.50, radius: 115, sound: true },
      { time: 0.55, radius: 105, sound: true },
      { time: 0.60, radius: 100, sound: true },
      { time: 0.65, radius: 95, sound: true },
      { time: 0.70, radius: 88, sound: true },
      { time: 0.75, radius: 82, sound: true },
      { time: 0.80, radius: 76, sound: true },
      { time: 0.85, radius: 70, sound: true },
      { time: 0.90, radius: 65, sound: true },
      { time: 0.95, radius: 58, sound: true },
    ];
    let lastBounceIdx = -1;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      
      // Easing functions
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);
      
      // Wheel rotation with easing
      const wheelProgress = easeOutCubic(progress);
      const currentWheelDeg = startWheelDeg + (finalWheelDeg - startWheelDeg) * wheelProgress;
      setWheelDeg(currentWheelDeg);
      
      // Ball rotation - faster easing, slows down more dramatically
      const ballProgress = easeOutQuint(Math.min(progress * 1.3, 1));
      let currentBallAngle = startBallAngle + (finalBallAngle - startBallAngle) * ballProgress;
      
      // Ball radius - starts outer, falls inward with bounces
      let currentRadius = 125;
      
      if (progress < bouncePhaseStart) {
        // Spinning phase - ball on outer track
        currentRadius = 125;
      } else {
        // Bouncing phase
        // Find current bounce
        let targetRadius = 58; // final
        for (let i = bounces.length - 1; i >= 0; i--) {
          if (progress >= bounces[i].time) {
            targetRadius = bounces[i].radius;
            
            // Play bounce sound
            if (i > lastBounceIdx) {
              lastBounceIdx = i;
              sndBounce.current?.play().catch(() => {});
            }
            break;
          }
        }
        
        // Find next bounce for interpolation
        let nextBounce = bounces.find(b => b.time > progress);
        if (nextBounce) {
          const prevBounce = bounces[bounces.indexOf(nextBounce) - 1] || { time: bouncePhaseStart, radius: 125 };
          const bounceProgress = (progress - prevBounce.time) / (nextBounce.time - prevBounce.time);
          
          // Bounce effect - ball goes up then down
          const bounceHeight = Math.sin(bounceProgress * Math.PI) * 8;
          currentRadius = prevBounce.radius - (prevBounce.radius - nextBounce.radius) * bounceProgress + bounceHeight;
        } else {
          currentRadius = 58;
        }
        
        // Add wobble during bouncing
        if (progress < bouncePhaseEnd) {
          const wobble = Math.sin(progress * 50) * (1 - progress) * 3;
          currentBallAngle += wobble;
        }
      }
      
      setBallAngle(currentBallAngle);
      setBallRadius(Math.max(58, Math.min(125, currentRadius)));
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete - finalize
        setWheelDeg(finalWheelDeg);
        setBallRadius(58);
        
        // Calculate winnings
        let winAmt = 0;
        bets.forEach(b => {
          if (b.nums.includes(winNum)) {
            const mult = b.type === 'straight' ? 35 : b.type === 'column' || b.type === 'dozen' ? 2 : 1;
            winAmt += b.amt * (mult + 1);
          }
        });
        
        setResult(winNum);
        setHistory(h => [winNum, ...h.slice(0, 9)]);
        setLastWin(winAmt);
        setCredit(c => c + winAmt);
        setBets([]);
        setSpinning(false);
        
        if (winAmt > 0) sndWin.current?.play().catch(() => {});
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [spinning, bets, wheelDeg, ballAngle]);

  const ChipStack = ({ amount }: { amount: number }) => {
    if (amount <= 0) return null;
    const colors: Record<number, string> = { 1: '#fff', 5: '#e53935', 10: '#1e88e5', 25: '#43a047', 100: '#7e57c2' };
    let color = '#fff';
    if (amount >= 100) color = colors[100];
    else if (amount >= 25) color = colors[25];
    else if (amount >= 10) color = colors[10];
    else if (amount >= 5) color = colors[5];
    return (
      <div className="bet-chip" style={{ background: color }}>
        <span>{amount}</span>
      </div>
    );
  };

  return (
    <div className="rl-container">
      {/* Header */}
      <div className="rl-header">
        <button className="rl-back" onClick={onBack}>◀ SLOT</button>
        <div className="rl-title">
          <span>FLEGMIN</span>
          <em>Anti-Rulet</em>
          <button className="rl-egg" onClick={() => setForce23(f => !f)}>{force23 ? '🎯' : '🎲'}</button>
        </div>
        <div className="rl-history">
          <span>Previous:</span>
          <div className="rl-history-nums">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`rl-hist-circle ${history[i] !== undefined ? getColor(history[i]) : ''}`}>
                {history[i] !== undefined ? history[i] : ''}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main game area */}
      <div className="rl-game">
        {/* Wheel section */}
        <div className="rl-wheel-section">
          <div className="rl-wheel-container">
            {/* Marker at top */}
            <div className="rl-marker">▼</div>
            
            {/* Outer wood frame */}
            <div className="rl-wheel-frame">
              {/* Metal deflectors */}
              {[0,45,90,135,180,225,270,315].map(deg => (
                <div key={deg} className="rl-deflector" style={{ transform: `rotate(${deg}deg)` }}>
                  <div className="rl-deflector-pin" />
                </div>
              ))}
            </div>
            
            {/* Ball track */}
            <div className="rl-ball-track" />
            
            {/* The Ball */}
            {ballVisible && (
              <div 
                className="rl-ball-container"
                style={{ transform: `rotate(${ballAngle}deg)` }}
              >
                <div 
                  className="rl-ball"
                  style={{ top: `${140 - ballRadius}px` }}
                />
              </div>
            )}
            
            {/* Spinning wheel with SVG */}
            <div 
              className="rl-wheel" 
              style={{ transform: `rotate(${wheelDeg}deg)` }}
            >
              <svg viewBox="0 0 200 200" className="rl-wheel-svg">
                {WHEEL.map((num, idx) => {
                  const startAngle = (idx / 37) * 360 - 90;
                  const endAngle = ((idx + 1) / 37) * 360 - 90;
                  const startRad = (startAngle * Math.PI) / 180;
                  const endRad = (endAngle * Math.PI) / 180;
                  
                  const x1 = 100 + 85 * Math.cos(startRad);
                  const y1 = 100 + 85 * Math.sin(startRad);
                  const x2 = 100 + 85 * Math.cos(endRad);
                  const y2 = 100 + 85 * Math.sin(endRad);
                  
                  const midAngle = ((startAngle + endAngle) / 2 + 90) * Math.PI / 180;
                  const textX = 100 + 68 * Math.cos(midAngle - Math.PI/2);
                  const textY = 100 + 68 * Math.sin(midAngle - Math.PI/2);
                  
                  const color = num === 0 ? '#16a34a' : isRed(num) ? '#dc2626' : '#1a1a1a';
                  
                  return (
                    <g key={num}>
                      <path
                        d={`M 100 100 L ${x1} ${y1} A 85 85 0 0 1 ${x2} ${y2} Z`}
                        fill={color}
                        stroke="#333"
                        strokeWidth="0.5"
                      />
                      <text
                        x={textX}
                        y={textY}
                        fill="white"
                        fontSize="7"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${(startAngle + endAngle) / 2 + 90}, ${textX}, ${textY})`}
                      >
                        {num}
                      </text>
                    </g>
                  );
                })}
                {/* Center circle */}
                <circle cx="100" cy="100" r="25" fill="url(#centerGradient)" stroke="#8b6914" strokeWidth="2" />
                <defs>
                  <radialGradient id="centerGradient">
                    <stop offset="0%" stopColor="#d4af37" />
                    <stop offset="100%" stopColor="#8b6914" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
          </div>
          
          {/* Result display */}
          {result !== null && (
            <div className={`rl-result-badge ${getColor(result)}`}>
              {result}
            </div>
          )}
        </div>

        {/* Table section */}
        <div className="rl-table-section">
          <div className="rl-table">
            {/* Zero */}
            <div 
              className={`rl-cell zero ${result === 0 ? 'winner' : ''}`}
              onClick={() => placeBet('straight', [0], 's-0')}
            >
              0
              <ChipStack amount={getBet('s-0')} />
            </div>

            {/* Numbers grid */}
            <div className="rl-numbers">
              {/* Row 3: 3,6,9,12,15,18,21,24,27,30,33,36 */}
              {[3,6,9,12,15,18,21,24,27,30,33,36].map(n => (
                <div 
                  key={n}
                  className={`rl-cell num ${getColor(n)} ${result === n ? 'winner' : ''}`}
                  onClick={() => placeBet('straight', [n], `s-${n}`)}
                >
                  {n}
                  <ChipStack amount={getBet(`s-${n}`)} />
                </div>
              ))}
              {/* Row 2: 2,5,8,11,14,17,20,23,26,29,32,35 */}
              {[2,5,8,11,14,17,20,23,26,29,32,35].map(n => (
                <div 
                  key={n}
                  className={`rl-cell num ${getColor(n)} ${result === n ? 'winner' : ''}`}
                  onClick={() => placeBet('straight', [n], `s-${n}`)}
                >
                  {n}
                  <ChipStack amount={getBet(`s-${n}`)} />
                </div>
              ))}
              {/* Row 1: 1,4,7,10,13,16,19,22,25,28,31,34 */}
              {[1,4,7,10,13,16,19,22,25,28,31,34].map(n => (
                <div 
                  key={n}
                  className={`rl-cell num ${getColor(n)} ${result === n ? 'winner' : ''}`}
                  onClick={() => placeBet('straight', [n], `s-${n}`)}
                >
                  {n}
                  <ChipStack amount={getBet(`s-${n}`)} />
                </div>
              ))}
            </div>

            {/* 2:1 columns */}
            <div className="rl-columns">
              <div className="rl-cell col" onClick={() => placeBet('column', [3,6,9,12,15,18,21,24,27,30,33,36], 'c-3')}>
                2-1
                <ChipStack amount={getBet('c-3')} />
              </div>
              <div className="rl-cell col" onClick={() => placeBet('column', [2,5,8,11,14,17,20,23,26,29,32,35], 'c-2')}>
                2-1
                <ChipStack amount={getBet('c-2')} />
              </div>
              <div className="rl-cell col" onClick={() => placeBet('column', [1,4,7,10,13,16,19,22,25,28,31,34], 'c-1')}>
                2-1
                <ChipStack amount={getBet('c-1')} />
              </div>
            </div>

            {/* Dozens */}
            <div className="rl-dozens">
              <div className="rl-cell dozen" onClick={() => placeBet('dozen', [1,2,3,4,5,6,7,8,9,10,11,12], 'd-1')}>
                1st 12
                <ChipStack amount={getBet('d-1')} />
              </div>
              <div className="rl-cell dozen" onClick={() => placeBet('dozen', [13,14,15,16,17,18,19,20,21,22,23,24], 'd-2')}>
                2nd 12
                <ChipStack amount={getBet('d-2')} />
              </div>
              <div className="rl-cell dozen" onClick={() => placeBet('dozen', [25,26,27,28,29,30,31,32,33,34,35,36], 'd-3')}>
                3rd 12
                <ChipStack amount={getBet('d-3')} />
              </div>
            </div>

            {/* Outside bets */}
            <div className="rl-outside">
              <div className="rl-cell out" onClick={() => placeBet('even', [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18], 'low')}>
                1~18
                <ChipStack amount={getBet('low')} />
              </div>
              <div className="rl-cell out" onClick={() => placeBet('even', [2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36], 'even')}>
                Even
                <ChipStack amount={getBet('even')} />
              </div>
              <div className="rl-cell out red-diamond" onClick={() => placeBet('even', RED, 'red')}>
                <div className="diamond red"></div>
                <ChipStack amount={getBet('red')} />
              </div>
              <div className="rl-cell out black-diamond" onClick={() => placeBet('even', [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35], 'black')}>
                <div className="diamond black"></div>
                <ChipStack amount={getBet('black')} />
              </div>
              <div className="rl-cell out" onClick={() => placeBet('even', [1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33,35], 'odd')}>
                Odd
                <ChipStack amount={getBet('odd')} />
              </div>
              <div className="rl-cell out" onClick={() => placeBet('even', [19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36], 'high')}>
                19~36
                <ChipStack amount={getBet('high')} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer controls */}
      <div className="rl-footer">
        <div className="rl-chips">
          {[1, 5, 10, 25].map(v => (
            <button
              key={v}
              className={`rl-chip-btn ${chip === v ? 'active' : ''}`}
              onClick={() => setChip(v)}
            >
              <div className={`rl-chip c${v}`}>{v}</div>
            </button>
          ))}
        </div>
        
        <div className="rl-actions">
          <button className="rl-action undo" onClick={clearBets} disabled={spinning}>↩</button>
          <button className="rl-action clear" onClick={clearBets} disabled={spinning}>✕</button>
          <button className="rl-action double" disabled={spinning}>×2</button>
        </div>
        
        <button className="rl-spin-btn" onClick={spin} disabled={spinning || !bets.length}>
          <span>↻</span>
        </button>
        
        <div className="rl-info">
          <div className="rl-cash">CASH: <strong>{credit.toFixed(0)}</strong></div>
          <div className="rl-total">TOTAL BET: <strong>{totalBets()}</strong></div>
        </div>
      </div>

      {/* Warning modal */}
      {showWarn && (
        <div className="rl-modal">
          <div className="rl-modal-box warn">
            <div className="emoji">🤬</div>
            <h2>Koji ti je kurac?</h2>
            <p>Pa sada ide mala serija definitivno.</p>
            <small>Viđali smo već ovo...</small>
          </div>
        </div>
      )}

      {/* Win popup */}
      {lastWin > 0 && (
        <div className="rl-win-popup">+{lastWin} HRK</div>
      )}
    </div>
  );
}
