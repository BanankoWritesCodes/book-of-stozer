'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// ==================== TYPES ====================
type Rarity = 'grey' | 'blue' | 'purple' | 'gold' | 'red';
type View = 'menu' | 'opening' | 'battle';

interface Item {
  id: string;
  name: string;
  emoji: string;
  value: number;
  rarity: Rarity;
  ticketMin: number;
  ticketMax: number;
}

interface Box {
  id: string;
  name: string;
  emoji: string;
  price: number;
  risk: string;
  items: Item[];
}

interface InventoryItem extends Item {
  uniqueId: string;
  wonTicket: number;
}

// ==================== TICKET SYSTEM CONFIG ====================
// Total tickets: 100,000
// Grey (Common): 1 - 45,000 (45%)
// Blue (Uncommon): 45,001 - 75,000 (30%)
// Purple (Rare): 75,001 - 92,000 (17%)
// Gold (Epic): 92,001 - 99,000 (7%)
// Red (Legendary): 99,001 - 100,000 (1%)

const RARITY_COLORS: Record<Rarity, { bg: string; border: string; glow: string }> = {
  grey: { bg: '#4a4a5a', border: '#6a6a7a', glow: 'rgba(100,100,120,0.5)' },
  blue: { bg: '#1e4a7a', border: '#3a8fd9', glow: 'rgba(58,143,217,0.5)' },
  purple: { bg: '#5a2a7a', border: '#a855f7', glow: 'rgba(168,85,247,0.5)' },
  gold: { bg: '#6a5a1a', border: '#fbbf24', glow: 'rgba(251,191,36,0.6)' },
  red: { bg: '#7a1a1a', border: '#ef4444', glow: 'rgba(239,68,68,0.7)' },
};

// ==================== BOX DEFINITIONS WITH TICKET RANGES ====================
const BOXES: Box[] = [
  {
    id: 'grossadmiral',
    name: "Grossadmiral's Box of Admirals",
    emoji: '⚓',
    price: 5,
    risk: 'LOW RISK',
    items: [
      // Grey (1 - 45000)
      { id: 'g1', name: 'Stari konop', emoji: '🪢', value: 0.5, rarity: 'grey', ticketMin: 1, ticketMax: 15000 },
      { id: 'g2', name: 'Morska sol', emoji: '🧂', value: 1, rarity: 'grey', ticketMin: 15001, ticketMax: 28000 },
      { id: 'g3', name: 'Riblja kost', emoji: '🦴', value: 1.5, rarity: 'grey', ticketMin: 28001, ticketMax: 38000 },
      { id: 'g4', name: 'Školjka', emoji: '🐚', value: 2, rarity: 'grey', ticketMin: 38001, ticketMax: 45000 },
      // Blue (45001 - 75000)
      { id: 'g5', name: 'Brodski kompas', emoji: '🧭', value: 4, rarity: 'blue', ticketMin: 45001, ticketMax: 55000 },
      { id: 'g6', name: 'Dalekozor', emoji: '🔭', value: 6, rarity: 'blue', ticketMin: 55001, ticketMax: 65000 },
      { id: 'g7', name: 'Sidro privjesak', emoji: '⚓', value: 8, rarity: 'blue', ticketMin: 65001, ticketMax: 75000 },
      // Purple (75001 - 92000)
      { id: 'g8', name: 'Kapetanska kapa', emoji: '🎖️', value: 12, rarity: 'purple', ticketMin: 75001, ticketMax: 83000 },
      { id: 'g9', name: 'Brodski zvon', emoji: '🔔', value: 18, rarity: 'purple', ticketMin: 83001, ticketMax: 92000 },
      // Gold (92001 - 99000)
      { id: 'g10', name: 'Zlatna medalja', emoji: '🏅', value: 30, rarity: 'gold', ticketMin: 92001, ticketMax: 96000 },
      { id: 'g11', name: 'Neptunov trozubac', emoji: '🔱', value: 45, rarity: 'gold', ticketMin: 96001, ticketMax: 99000 },
      // Red (99001 - 100000)
      { id: 'g12', name: 'Admiralski mač', emoji: '⚔️', value: 100, rarity: 'red', ticketMin: 99001, ticketMax: 100000 },
    ],
  },
  {
    id: 'kezro',
    name: 'Kezro Palettes & Forklifts',
    emoji: '🏗️',
    price: 15,
    risk: 'MEDIUM RISK',
    items: [
      // Grey
      { id: 'k1', name: 'Kartonska kutija', emoji: '📦', value: 1, rarity: 'grey', ticketMin: 1, ticketMax: 14000 },
      { id: 'k2', name: 'Ljepljiva traka', emoji: '🎗️', value: 2, rarity: 'grey', ticketMin: 14001, ticketMax: 26000 },
      { id: 'k3', name: 'Radne rukavice', emoji: '🧤', value: 3, rarity: 'grey', ticketMin: 26001, ticketMax: 36000 },
      { id: 'k4', name: 'Kaciga', emoji: '⛑️', value: 5, rarity: 'grey', ticketMin: 36001, ticketMax: 45000 },
      // Blue
      { id: 'k5', name: 'Paleta drva', emoji: '🪵', value: 10, rarity: 'blue', ticketMin: 45001, ticketMax: 55000 },
      { id: 'k6', name: 'Alat set', emoji: '🧰', value: 15, rarity: 'blue', ticketMin: 55001, ticketMax: 65000 },
      { id: 'k7', name: 'Viličar ključ', emoji: '🔑', value: 22, rarity: 'blue', ticketMin: 65001, ticketMax: 75000 },
      // Purple
      { id: 'k8', name: 'Električni alat', emoji: '🔧', value: 40, rarity: 'purple', ticketMin: 75001, ticketMax: 84000 },
      { id: 'k9', name: 'Zlatna paleta', emoji: '🥇', value: 65, rarity: 'purple', ticketMin: 84001, ticketMax: 92000 },
      // Gold
      { id: 'k10', name: 'Mini viličar', emoji: '🚜', value: 120, rarity: 'gold', ticketMin: 92001, ticketMax: 96500 },
      { id: 'k11', name: 'Skladište ključ', emoji: '🏭', value: 200, rarity: 'gold', ticketMin: 96501, ticketMax: 99000 },
      // Red
      { id: 'k12', name: 'Dijamantni viličar', emoji: '💎', value: 500, rarity: 'red', ticketMin: 99001, ticketMax: 100000 },
    ],
  },
  {
    id: 'flegma',
    name: "Flegma's Gym The Win",
    emoji: '💪',
    price: 30,
    risk: 'HIGH RISK',
    items: [
      // Grey
      { id: 'f1', name: 'Protein bar', emoji: '🍫', value: 2, rarity: 'grey', ticketMin: 1, ticketMax: 13000 },
      { id: 'f2', name: 'Shaker', emoji: '🥤', value: 4, rarity: 'grey', ticketMin: 13001, ticketMax: 25000 },
      { id: 'f3', name: 'Gym ručnik', emoji: '🧺', value: 6, rarity: 'grey', ticketMin: 25001, ticketMax: 35000 },
      { id: 'f4', name: 'Rukavice', emoji: '🥊', value: 10, rarity: 'grey', ticketMin: 35001, ticketMax: 45000 },
      // Blue
      { id: 'f5', name: 'Kettlebell 8kg', emoji: '🏋️', value: 20, rarity: 'blue', ticketMin: 45001, ticketMax: 55000 },
      { id: 'f6', name: 'Yoga mat', emoji: '🧘', value: 30, rarity: 'blue', ticketMin: 55001, ticketMax: 65000 },
      { id: 'f7', name: 'Traka za trčanje', emoji: '👟', value: 45, rarity: 'blue', ticketMin: 65001, ticketMax: 75000 },
      // Purple
      { id: 'f8', name: 'Zlatne bučice', emoji: '🏆', value: 80, rarity: 'purple', ticketMin: 75001, ticketMax: 85000 },
      { id: 'f9', name: 'Premium članarina', emoji: '💳', value: 130, rarity: 'purple', ticketMin: 85001, ticketMax: 92000 },
      // Gold
      { id: 'f10', name: 'Home gym set', emoji: '🎯', value: 250, rarity: 'gold', ticketMin: 92001, ticketMax: 96000 },
      { id: 'f11', name: 'Lifetime VIP', emoji: '👑', value: 400, rarity: 'gold', ticketMin: 96001, ticketMax: 99000 },
      // Red
      { id: 'f12', name: 'Gym imperija', emoji: '🏛️', value: 1000, rarity: 'red', ticketMin: 99001, ticketMax: 100000 },
    ],
  },
  {
    id: 'koba',
    name: "Koba's Ride or Fry",
    emoji: '🍟',
    price: 50,
    risk: 'EXTREME RISK',
    items: [
      // Grey
      { id: 'ko1', name: 'Prženi krumpirić', emoji: '🍟', value: 1, rarity: 'grey', ticketMin: 1, ticketMax: 12000 },
      { id: 'ko2', name: 'Ketchup', emoji: '🍅', value: 2, rarity: 'grey', ticketMin: 12001, ticketMax: 23000 },
      { id: 'ko3', name: 'Majoneza', emoji: '🥚', value: 4, rarity: 'grey', ticketMin: 23001, ticketMax: 33000 },
      { id: 'ko4', name: 'Burger', emoji: '🍔', value: 8, rarity: 'grey', ticketMin: 33001, ticketMax: 45000 },
      // Blue
      { id: 'ko5', name: 'Pizza slice', emoji: '🍕', value: 20, rarity: 'blue', ticketMin: 45001, ticketMax: 54000 },
      { id: 'ko6', name: 'Hot dog deluxe', emoji: '🌭', value: 35, rarity: 'blue', ticketMin: 54001, ticketMax: 64000 },
      { id: 'ko7', name: 'Taco fiesta', emoji: '🌮', value: 55, rarity: 'blue', ticketMin: 64001, ticketMax: 75000 },
      // Purple
      { id: 'ko8', name: 'Food truck ključ', emoji: '🚚', value: 100, rarity: 'purple', ticketMin: 75001, ticketMax: 84000 },
      { id: 'ko9', name: 'Zlatna friteza', emoji: '🥘', value: 180, rarity: 'purple', ticketMin: 84001, ticketMax: 92000 },
      // Gold
      { id: 'ko10', name: 'Michelin zvijezda', emoji: '⭐', value: 350, rarity: 'gold', ticketMin: 92001, ticketMax: 96000 },
      { id: 'ko11', name: 'Restoran franšiza', emoji: '🏪', value: 600, rarity: 'gold', ticketMin: 96001, ticketMax: 99000 },
      // Red
      { id: 'ko12', name: 'Fast food carstvo', emoji: '👑', value: 2000, rarity: 'red', ticketMin: 99001, ticketMax: 100000 },
    ],
  },
];

// ==================== MAIN COMPONENT ====================
export default function CaseOpening({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<View>('menu');
  const [balance, setBalance] = useState(1000);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);
  const [showInventory, setShowInventory] = useState(false);
  const [bgOffset, setBgOffset] = useState(0);
  
  // Opening state
  const [isSpinning, setIsSpinning] = useState(false);
  const [openCount, setOpenCount] = useState(1);
  const [reels, setReels] = useState<{ items: Item[]; offset: number; winner: Item | null; ticket: number }[]>([]);
  const [showResult, setShowResult] = useState(false);
  
  // Battle state
  const [battleBox, setBattleBox] = useState<Box | null>(null);
  const [battleSpinning, setBattleSpinning] = useState(false);
  const [playerReels, setPlayerReels] = useState<{ items: Item[]; offset: number; winner: Item | null }[]>([]);
  const [botReels, setBotReels] = useState<{ items: Item[]; offset: number; winner: Item | null }[]>([]);
  const [battleResult, setBattleResult] = useState<'win' | 'lose' | 'tie' | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Animated background
  useEffect(() => {
    const interval = setInterval(() => {
      setBgOffset(prev => (prev + 0.5) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    audioRef.current = new Audio('/sounds/RowSpin.mp3');
    winAudioRef.current = new Audio('/sounds/NormalSymbolWin.mp3');
  }, []);

  // TICKET SYSTEM: Get item by random ticket
  const getItemByTicket = useCallback((box: Box): { item: Item; ticket: number } => {
    const ticket = Math.floor(Math.random() * 100000) + 1;
    const item = box.items.find(i => ticket >= i.ticketMin && ticket <= i.ticketMax) || box.items[0];
    return { item, ticket };
  }, []);

  // Generate vertical reel strip (40 items, winner at position 32)
  const generateReel = useCallback((box: Box, winnerItem: Item): Item[] => {
    const items: Item[] = [];
    const winPos = 32;
    for (let i = 0; i < 40; i++) {
      if (i === winPos) {
        items.push(winnerItem);
      } else {
        items.push(getItemByTicket(box).item);
      }
    }
    return items;
  }, [getItemByTicket]);

  // Select box
  const selectBox = (box: Box) => {
    setSelectedBox(box);
    setView('opening');
    setOpenCount(1);
    setReels([]);
    setShowResult(false);
  };

  // Open cases
  const openCases = () => {
    if (!selectedBox || isSpinning || balance < selectedBox.price * openCount) return;
    
    setBalance(b => b - selectedBox.price * openCount);
    setIsSpinning(true);
    setShowResult(false);
    audioRef.current?.play().catch(() => {});
    
    const newReels: typeof reels = [];
    
    for (let i = 0; i < openCount; i++) {
      const { item: winner, ticket } = getItemByTicket(selectedBox);
      const items = generateReel(selectedBox, winner);
      // Item height = 70px, win position = 32, visible area center = ~105px
      const finalOffset = (32 * 70) - 105 + Math.floor(Math.random() * 30);
      newReels.push({ items, offset: 0, winner, ticket });
      
      // Stagger the reveal
      setTimeout(() => {
        setReels(prev => {
          const updated = [...prev];
          if (updated[i]) updated[i] = { ...updated[i], offset: finalOffset };
          return updated;
        });
      }, 100 + i * 200);
    }
    
    setReels(newReels);
    
    // Finish
    setTimeout(() => {
      setIsSpinning(false);
      setShowResult(true);
      const winners = newReels.map(r => ({ ...r.winner!, uniqueId: `${Date.now()}-${Math.random()}`, wonTicket: r.ticket }));
      setInventory(prev => [...prev, ...winners]);
      winAudioRef.current?.play().catch(() => {});
    }, 4000 + openCount * 200);
  };

  // Start battle
  const startBattle = (box: Box) => {
    if (balance < box.price * 3) return;
    
    setBattleBox(box);
    setView('battle');
    setBalance(b => b - box.price * 3);
    setBattleSpinning(true);
    setBattleResult(null);
    audioRef.current?.play().catch(() => {});
    
    const pReels: typeof playerReels = [];
    const bReels: typeof botReels = [];
    
    for (let i = 0; i < 3; i++) {
      const pWin = getItemByTicket(box).item;
      const bWin = getItemByTicket(box).item;
      const pItems = generateReel(box, pWin);
      const bItems = generateReel(box, bWin);
      const pOffset = (32 * 70) - 105 + Math.floor(Math.random() * 30);
      const bOffset = (32 * 70) - 105 + Math.floor(Math.random() * 30);
      
      pReels.push({ items: pItems, offset: 0, winner: pWin });
      bReels.push({ items: bItems, offset: 0, winner: bWin });
      
      setTimeout(() => {
        setPlayerReels(prev => {
          const u = [...prev];
          if (u[i]) u[i] = { ...u[i], offset: pOffset };
          return u;
        });
        setBotReels(prev => {
          const u = [...prev];
          if (u[i]) u[i] = { ...u[i], offset: bOffset };
          return u;
        });
      }, 100 + i * 300);
    }
    
    setPlayerReels(pReels);
    setBotReels(bReels);
    
    setTimeout(() => {
      setBattleSpinning(false);
      const pTotal = pReels.reduce((s, r) => s + (r.winner?.value || 0), 0);
      const bTotal = bReels.reduce((s, r) => s + (r.winner?.value || 0), 0);
      
      if (pTotal > bTotal) {
        setBattleResult('win');
        const allWinners = [...pReels, ...bReels].map(r => ({ 
          ...r.winner!, 
          uniqueId: `${Date.now()}-${Math.random()}`,
          wonTicket: 0 
        }));
        setInventory(prev => [...prev, ...allWinners]);
        winAudioRef.current?.play().catch(() => {});
      } else if (pTotal < bTotal) {
        setBattleResult('lose');
      } else {
        setBattleResult('tie');
        const pWinners = pReels.map(r => ({ ...r.winner!, uniqueId: `${Date.now()}-${Math.random()}`, wonTicket: 0 }));
        setInventory(prev => [...prev, ...pWinners]);
      }
    }, 4500);
  };

  // Sell functions
  const sellItem = (uniqueId: string) => {
    const item = inventory.find(i => i.uniqueId === uniqueId);
    if (item) {
      setBalance(b => b + item.value);
      setInventory(prev => prev.filter(i => i.uniqueId !== uniqueId));
    }
  };

  const sellAll = () => {
    const total = inventory.reduce((s, i) => s + i.value, 0);
    setBalance(b => b + total);
    setInventory([]);
  };

  const sellWinners = () => {
    if (!showResult || reels.length === 0) return;
    const total = reels.reduce((s, r) => s + (r.winner?.value || 0), 0);
    const winnerIds = new Set(inventory.slice(-reels.length).map(i => i.uniqueId));
    setInventory(prev => prev.filter(i => !winnerIds.has(i.uniqueId)));
    setBalance(b => b + total);
    setShowResult(false);
  };

  const winnersTotal = reels.reduce((s, r) => s + (r.winner?.value || 0), 0);
  const inventoryValue = inventory.reduce((s, i) => s + i.value, 0);

  // ==================== STYLES ====================
  const getRarityStyle = (rarity: Rarity) => RARITY_COLORS[rarity];

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, #1a0f05 0%, #2d1810 25%, #1a0a00 50%, #0d0805 100%)`,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'system-ui, sans-serif',
      color: '#fff',
    }}>
      {/* Animated Egyptian background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 50px,
            rgba(212,175,55,0.03) 50px,
            rgba(212,175,55,0.03) 100px
          ),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 50px,
            rgba(212,175,55,0.03) 50px,
            rgba(212,175,55,0.03) 100px
          )
        `,
        backgroundPosition: `${bgOffset}px ${bgOffset}px`,
        pointerEvents: 'none',
      }} />
      
      {/* Hieroglyph decorations */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: 'linear-gradient(180deg, rgba(212,175,55,0.15), transparent)',
        borderBottom: '2px solid rgba(212,175,55,0.3)',
      }} />
      
      {/* Header */}
      <header style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        background: 'rgba(0,0,0,0.5)',
        borderBottom: '2px solid #d4af37',
        zIndex: 10,
      }}>
        <button onClick={view === 'menu' ? onBack : () => setView('menu')} style={{
          background: 'linear-gradient(180deg, #8b6914, #5c4a0f)',
          border: '2px solid #d4af37',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: '8px',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}>
          ← {view === 'menu' ? 'MENU' : 'KUTIJE'}
        </button>
        
        <h1 style={{
          fontSize: '1.4rem',
          color: '#d4af37',
          margin: 0,
          textShadow: '0 0 20px rgba(212,175,55,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <span style={{ fontSize: '1.8rem' }}>📦</span>
          KUTIJOTVOR
        </h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setShowInventory(true)} style={{
            background: 'rgba(212,175,55,0.2)',
            border: '2px solid #d4af37',
            color: '#d4af37',
            padding: '8px 14px',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}>
            🎒 {inventory.length}
          </button>
          <div style={{
            background: 'rgba(0,0,0,0.5)',
            border: '2px solid #4caf50',
            borderRadius: '8px',
            padding: '8px 16px',
          }}>
            <span style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '1.1rem' }}>
              {balance.toFixed(0)} HRK
            </span>
          </div>
        </div>
      </header>

      <main style={{ position: 'relative', padding: '20px', maxWidth: '1100px', margin: '0 auto', zIndex: 5 }}>
        
        {/* ==================== MENU VIEW ==================== */}
        {view === 'menu' && (
          <div>
            <h2 style={{ textAlign: 'center', color: '#d4af37', marginBottom: '24px', fontSize: '1.6rem' }}>
              ⚱️ Odaberi kutiju ⚱️
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '20px',
            }}>
              {BOXES.map(box => (
                <div key={box.id} onClick={() => selectBox(box)} style={{
                  background: 'linear-gradient(180deg, rgba(45,24,16,0.9), rgba(26,15,5,0.95))',
                  border: '2px solid #8b6914',
                  borderRadius: '16px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '4rem', marginBottom: '10px' }}>{box.emoji}</div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '1rem', color: '#fff' }}>{box.name}</h3>
                  <div style={{
                    color: box.risk.includes('EXTREME') ? '#f44336' : 
                           box.risk.includes('HIGH') ? '#ff9800' : 
                           box.risk.includes('MEDIUM') ? '#ffc107' : '#4caf50',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    marginBottom: '10px',
                  }}>{box.risk}</div>
                  <div style={{ color: '#4caf50', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '12px' }}>
                    {box.price} HRK
                  </div>
                  
                  {/* Item preview */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    {box.items.slice(0, 6).map(item => (
                      <div key={item.id} style={{
                        width: '32px',
                        height: '32px',
                        background: getRarityStyle(item.rarity).bg,
                        border: `2px solid ${getRarityStyle(item.rarity).border}`,
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.9rem',
                      }}>{item.emoji}</div>
                    ))}
                  </div>
                  
                  <button style={{
                    width: '100%',
                    background: 'linear-gradient(180deg, #d4af37, #8b6914)',
                    border: 'none',
                    color: '#000',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginBottom: '8px',
                  }}>OTVORI</button>
                  
                  <button onClick={(e) => { e.stopPropagation(); startBattle(box); }} 
                    disabled={balance < box.price * 3}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: '2px solid #f44336',
                      color: '#f44336',
                      padding: '10px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: balance < box.price * 3 ? 'not-allowed' : 'pointer',
                      opacity: balance < box.price * 3 ? 0.5 : 1,
                      fontSize: '0.85rem',
                    }}>
                    ⚔️ BATTLE ({box.price * 3} HRK)
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== OPENING VIEW ==================== */}
        {view === 'opening' && selectedBox && (
          <div>
            {/* Box info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '20px',
              padding: '16px',
              background: 'rgba(0,0,0,0.4)',
              borderRadius: '12px',
              border: '1px solid #8b6914',
            }}>
              <span style={{ fontSize: '3rem' }}>{selectedBox.emoji}</span>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{selectedBox.name}</h2>
                <span style={{ color: '#d4af37' }}>{selectedBox.price} HRK per box</span>
              </div>
            </div>

            {/* Spinner area */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              marginBottom: '24px',
              flexWrap: 'wrap',
            }}>
              {Array.from({ length: openCount }).map((_, idx) => (
                <div key={idx} style={{
                  position: 'relative',
                  width: openCount === 1 ? '200px' : '140px',
                  height: '280px',
                  background: 'linear-gradient(180deg, #1a0f05, #0d0805)',
                  border: '3px solid #8b6914',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}>
                  {/* Marker */}
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    height: '70px',
                    border: '3px solid #d4af37',
                    borderLeft: 'none',
                    borderRight: 'none',
                    background: 'rgba(212,175,55,0.1)',
                    zIndex: 10,
                    pointerEvents: 'none',
                  }}>
                    <div style={{
                      position: 'absolute',
                      left: '-12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 0,
                      height: 0,
                      borderTop: '10px solid transparent',
                      borderBottom: '10px solid transparent',
                      borderLeft: '12px solid #d4af37',
                    }} />
                    <div style={{
                      position: 'absolute',
                      right: '-12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 0,
                      height: 0,
                      borderTop: '10px solid transparent',
                      borderBottom: '10px solid transparent',
                      borderRight: '12px solid #d4af37',
                    }} />
                  </div>
                  
                  {/* Fade top/bottom */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '60px',
                    background: 'linear-gradient(180deg, #1a0f05, transparent)',
                    zIndex: 5,
                    pointerEvents: 'none',
                  }} />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '60px',
                    background: 'linear-gradient(0deg, #0d0805, transparent)',
                    zIndex: 5,
                    pointerEvents: 'none',
                  }} />
                  
                  {/* Reel strip */}
                  <div style={{
                    transform: `translateY(-${reels[idx]?.offset || 0}px)`,
                    transition: isSpinning ? `transform ${3.5 + idx * 0.3}s cubic-bezier(0.15, 0.85, 0.25, 1)` : 'none',
                  }}>
                    {(reels[idx]?.items || []).map((item, i) => (
                      <div key={i} style={{
                        width: '100%',
                        height: '70px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: getRarityStyle(item.rarity).bg,
                        borderBottom: `2px solid ${getRarityStyle(item.rarity).border}`,
                      }}>
                        <span style={{ fontSize: openCount === 1 ? '2rem' : '1.5rem' }}>{item.emoji}</span>
                        {openCount === 1 && (
                          <span style={{ color: '#4caf50', fontWeight: 'bold' }}>{item.value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              marginBottom: '24px',
              flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 3, 5].map(n => (
                  <button key={n} onClick={() => !isSpinning && setOpenCount(n)} disabled={isSpinning} style={{
                    width: '50px',
                    height: '50px',
                    background: openCount === n ? 'linear-gradient(180deg, #d4af37, #8b6914)' : 'rgba(0,0,0,0.4)',
                    border: `2px solid ${openCount === n ? '#d4af37' : '#555'}`,
                    borderRadius: '10px',
                    color: openCount === n ? '#000' : '#aaa',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    cursor: isSpinning ? 'not-allowed' : 'pointer',
                  }}>{n}x</button>
                ))}
              </div>
              
              <button onClick={openCases} disabled={isSpinning || balance < selectedBox.price * openCount} style={{
                background: isSpinning ? '#555' : 'linear-gradient(180deg, #4caf50, #2e7d32)',
                border: '2px solid #66bb6a',
                color: '#fff',
                padding: '16px 40px',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                cursor: isSpinning ? 'not-allowed' : 'pointer',
              }}>
                {isSpinning ? 'OTVARANJE...' : `OTVORI ${openCount}x - ${selectedBox.price * openCount} HRK`}
              </button>
            </div>

            {/* Items in box */}
            <div style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid #8b6914',
              borderRadius: '12px',
              padding: '16px',
            }}>
              <h3 style={{ color: '#d4af37', marginBottom: '12px', fontSize: '0.9rem' }}>
                MOGUĆI DOBICI (Ticket: 1 - 100,000)
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: '8px',
              }}>
                {selectedBox.items.map(item => (
                  <div key={item.id} style={{
                    background: getRarityStyle(item.rarity).bg,
                    border: `2px solid ${getRarityStyle(item.rarity).border}`,
                    borderRadius: '8px',
                    padding: '10px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{item.emoji}</div>
                    <div style={{ fontSize: '0.65rem', color: '#ccc', marginBottom: '2px' }}>{item.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#4caf50', fontWeight: 'bold' }}>{item.value} HRK</div>
                    <div style={{ fontSize: '0.6rem', color: getRarityStyle(item.rarity).border }}>
                      {item.ticketMin.toLocaleString()}-{item.ticketMax.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== BATTLE VIEW ==================== */}
        {view === 'battle' && battleBox && (
          <div>
            <h2 style={{ textAlign: 'center', color: '#f44336', marginBottom: '20px' }}>
              ⚔️ CASE BATTLE ⚔️
            </h2>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              gap: '20px',
              marginBottom: '20px',
            }}>
              {/* Player */}
              <div style={{ flex: 1, maxWidth: '400px' }}>
                <div style={{
                  textAlign: 'center',
                  marginBottom: '12px',
                  padding: '10px',
                  background: 'rgba(76,175,80,0.2)',
                  border: '2px solid #4caf50',
                  borderRadius: '8px',
                }}>
                  <span style={{ fontSize: '2rem' }}>👤</span>
                  <div style={{ fontWeight: 'bold' }}>TI</div>
                  {!battleSpinning && playerReels.length > 0 && (
                    <div style={{ color: '#4caf50', fontWeight: 'bold' }}>
                      {playerReels.reduce((s, r) => s + (r.winner?.value || 0), 0)} HRK
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} style={{
                      position: 'relative',
                      height: '70px',
                      background: '#1a0f05',
                      border: '2px solid #4caf50',
                      borderRadius: '8px',
                      overflow: 'hidden',
                    }}>
                      {/* Center marker */}
                      <div style={{
                        position: 'absolute',
                        right: '-8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 0,
                        height: 0,
                        borderTop: '8px solid transparent',
                        borderBottom: '8px solid transparent',
                        borderRight: '8px solid #4caf50',
                        zIndex: 10,
                      }} />
                      
                      <div style={{
                        display: 'flex',
                        transform: `translateX(-${playerReels[idx]?.offset || 0}px)`,
                        transition: battleSpinning ? `transform ${3.5 + idx * 0.3}s cubic-bezier(0.15, 0.85, 0.25, 1)` : 'none',
                      }}>
                        {(playerReels[idx]?.items || []).map((item, i) => (
                          <div key={i} style={{
                            flex: '0 0 70px',
                            height: '70px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: getRarityStyle(item.rarity).bg,
                            borderRight: `2px solid ${getRarityStyle(item.rarity).border}`,
                          }}>
                            <span style={{ fontSize: '1.5rem' }}>{item.emoji}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* VS */}
              <div style={{
                alignSelf: 'center',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#f44336',
                textShadow: '0 0 20px rgba(244,67,54,0.5)',
              }}>VS</div>

              {/* Bot */}
              <div style={{ flex: 1, maxWidth: '400px' }}>
                <div style={{
                  textAlign: 'center',
                  marginBottom: '12px',
                  padding: '10px',
                  background: 'rgba(244,67,54,0.2)',
                  border: '2px solid #f44336',
                  borderRadius: '8px',
                }}>
                  <span style={{ fontSize: '2rem' }}>🤖</span>
                  <div style={{ fontWeight: 'bold' }}>BOT</div>
                  {!battleSpinning && botReels.length > 0 && (
                    <div style={{ color: '#f44336', fontWeight: 'bold' }}>
                      {botReels.reduce((s, r) => s + (r.winner?.value || 0), 0)} HRK
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} style={{
                      position: 'relative',
                      height: '70px',
                      background: '#1a0f05',
                      border: '2px solid #f44336',
                      borderRadius: '8px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        position: 'absolute',
                        left: '-8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 0,
                        height: 0,
                        borderTop: '8px solid transparent',
                        borderBottom: '8px solid transparent',
                        borderLeft: '8px solid #f44336',
                        zIndex: 10,
                      }} />
                      
                      <div style={{
                        display: 'flex',
                        transform: `translateX(-${botReels[idx]?.offset || 0}px)`,
                        transition: battleSpinning ? `transform ${3.5 + idx * 0.3}s cubic-bezier(0.15, 0.85, 0.25, 1)` : 'none',
                      }}>
                        {(botReels[idx]?.items || []).map((item, i) => (
                          <div key={i} style={{
                            flex: '0 0 70px',
                            height: '70px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: getRarityStyle(item.rarity).bg,
                            borderRight: `2px solid ${getRarityStyle(item.rarity).border}`,
                          }}>
                            <span style={{ fontSize: '1.5rem' }}>{item.emoji}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Battle result */}
            {battleResult && (
              <div style={{
                textAlign: 'center',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '20px',
                background: battleResult === 'win' ? 'rgba(76,175,80,0.3)' : 
                            battleResult === 'lose' ? 'rgba(244,67,54,0.3)' : 'rgba(255,193,7,0.3)',
                border: `2px solid ${battleResult === 'win' ? '#4caf50' : battleResult === 'lose' ? '#f44336' : '#ffc107'}`,
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>
                  {battleResult === 'win' ? '🎉' : battleResult === 'lose' ? '😢' : '🤝'}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {battleResult === 'win' ? 'POBJEDA! Osvojio si SVE!' : 
                   battleResult === 'lose' ? 'PORAZ! Bot odnosi sve...' : 'IZJEDNAČENO! Zadržavaš svoje.'}
                </div>
              </div>
            )}

            <button onClick={() => setView('menu')} disabled={battleSpinning} style={{
              display: 'block',
              margin: '0 auto',
              background: '#333',
              border: '2px solid #555',
              color: '#fff',
              padding: '12px 30px',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: battleSpinning ? 'not-allowed' : 'pointer',
            }}>
              ← Natrag na kutije
            </button>
          </div>
        )}
      </main>

      {/* ==================== RESULT MODAL ==================== */}
      {showResult && reels.length > 0 && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            background: 'linear-gradient(180deg, #2d1810, #1a0f05)',
            border: '3px solid #d4af37',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '450px',
            width: '100%',
            textAlign: 'center',
          }}>
            <h2 style={{ color: '#d4af37', marginBottom: '20px' }}>🎉 Dobio si!</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
              {reels.map((reel, idx) => reel.winner && (
                <div key={idx} style={{
                  background: getRarityStyle(reel.winner.rarity).bg,
                  border: `2px solid ${getRarityStyle(reel.winner.rarity).border}`,
                  borderRadius: '10px',
                  padding: '12px',
                  minWidth: '90px',
                }}>
                  <div style={{ fontSize: '2rem' }}>{reel.winner.emoji}</div>
                  <div style={{ fontSize: '0.7rem', color: '#ccc' }}>{reel.winner.name}</div>
                  <div style={{ color: '#4caf50', fontWeight: 'bold' }}>{reel.winner.value} HRK</div>
                  <div style={{ fontSize: '0.6rem', color: '#888' }}>Ticket: {reel.ticket}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '1.5rem', color: '#4caf50', fontWeight: 'bold', marginBottom: '20px' }}>
              Ukupno: {winnersTotal} HRK
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={sellWinners} style={{
                background: 'linear-gradient(180deg, #4caf50, #2e7d32)',
                border: 'none',
                color: '#fff',
                padding: '14px 28px',
                borderRadius: '10px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}>PRODAJ SVE</button>
              <button onClick={() => setShowResult(false)} style={{
                background: 'transparent',
                border: '2px solid #666',
                color: '#aaa',
                padding: '14px 28px',
                borderRadius: '10px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}>ZADRŽI</button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== INVENTORY MODAL ==================== */}
      {showInventory && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            background: 'linear-gradient(180deg, #2d1810, #1a0f05)',
            border: '3px solid #d4af37',
            borderRadius: '20px',
            padding: '24px',
            maxWidth: '550px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, color: '#d4af37' }}>🎒 Inventory ({inventory.length})</h2>
              <button onClick={() => setShowInventory(false)} style={{
                background: '#333',
                border: 'none',
                color: '#fff',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                fontSize: '1.3rem',
                cursor: 'pointer',
              }}>✕</button>
            </div>
            
            {inventory.length > 0 && (
              <button onClick={sellAll} style={{
                width: '100%',
                background: 'linear-gradient(180deg, #4caf50, #2e7d32)',
                border: 'none',
                color: '#fff',
                padding: '14px',
                borderRadius: '10px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '16px',
              }}>
                PRODAJ SVE ({inventoryValue.toFixed(0)} HRK)
              </button>
            )}
            
            {inventory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <div style={{ fontSize: '4rem', marginBottom: '10px' }}>📦</div>
                <p>Inventory je prazan</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                gap: '10px',
              }}>
                {inventory.map(item => (
                  <div key={item.uniqueId} style={{
                    background: getRarityStyle(item.rarity).bg,
                    border: `2px solid ${getRarityStyle(item.rarity).border}`,
                    borderRadius: '10px',
                    padding: '10px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>{item.emoji}</div>
                    <div style={{ fontSize: '0.65rem', color: '#ccc' }}>{item.name}</div>
                    <div style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '0.9rem' }}>{item.value} HRK</div>
                    <button onClick={() => sellItem(item.uniqueId)} style={{
                      marginTop: '8px',
                      width: '100%',
                      background: '#d4af37',
                      border: 'none',
                      color: '#000',
                      padding: '6px',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                    }}>PRODAJ</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
