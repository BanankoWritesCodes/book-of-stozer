'use client';

import { useRouter } from 'next/navigation';
import './home.css';

const GAMES = [
  {
    id: 'slot',
    title: 'Book of Stožer',
    subtitle: 'SLOT MACHINE',
    path: '/slot',
    icon: (
      <svg viewBox="0 0 64 64" className="game-svg-icon">
        <rect x="8" y="12" width="48" height="40" rx="4" fill="#1a1a2e" stroke="#d4af37" strokeWidth="2"/>
        <rect x="14" y="20" width="12" height="16" rx="2" fill="#2d2d4a" stroke="#d4af37" strokeWidth="1"/>
        <rect x="26" y="20" width="12" height="16" rx="2" fill="#2d2d4a" stroke="#d4af37" strokeWidth="1"/>
        <rect x="38" y="20" width="12" height="16" rx="2" fill="#2d2d4a" stroke="#d4af37" strokeWidth="1"/>
        <text x="20" y="32" fill="#d4af37" fontSize="10" fontWeight="bold">7</text>
        <text x="32" y="32" fill="#d4af37" fontSize="10" fontWeight="bold">7</text>
        <text x="44" y="32" fill="#d4af37" fontSize="10" fontWeight="bold">7</text>
        <circle cx="54" cy="44" r="4" fill="#c62828"/>
        <rect x="18" y="44" width="24" height="4" rx="2" fill="#333"/>
      </svg>
    ),
  },
  {
    id: 'roulette',
    title: 'Flegmin Anti-Rulet',
    subtitle: 'EUROPEAN ROULETTE',
    path: '/roulette',
    icon: (
      <svg viewBox="0 0 64 64" className="game-svg-icon">
        <circle cx="32" cy="32" r="28" fill="#1a1a2e" stroke="#8b6914" strokeWidth="3"/>
        <circle cx="32" cy="32" r="22" fill="none" stroke="#333" strokeWidth="1"/>
        {[0,1,2,3,4,5,6,7].map(i => (
          <rect key={i} x="31" y="6" width="2" height="8" fill={i % 2 === 0 ? '#c62828' : '#1a1a1a'} transform={`rotate(${i * 45} 32 32)`}/>
        ))}
        <circle cx="32" cy="32" r="8" fill="#d4af37"/>
        <circle cx="32" cy="12" r="3" fill="#e0e0e0"/>
      </svg>
    ),
  },
  {
    id: 'cases',
    title: 'Kutijotvor',
    subtitle: 'CASE OPENING',
    path: '/cases',
    icon: (
      <svg viewBox="0 0 64 64" className="game-svg-icon">
        <path d="M12 24 L32 12 L52 24 L52 44 L32 56 L12 44 Z" fill="#1a1a2e" stroke="#7c4dff" strokeWidth="2"/>
        <path d="M32 12 L32 32 L12 24" fill="#252545" stroke="#7c4dff" strokeWidth="1"/>
        <path d="M32 32 L52 24" stroke="#7c4dff" strokeWidth="1"/>
        <path d="M32 32 L32 56" stroke="#7c4dff" strokeWidth="1"/>
        <text x="32" y="38" fill="#7c4dff" fontSize="14" fontWeight="bold" textAnchor="middle">?</text>
        <circle cx="32" cy="20" r="3" fill="#ffd700"/>
      </svg>
    ),
  },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="home-container">
      {/* Background image */}
      <div className="home-bg" />
      <div className="home-overlay" />

      {/* Game cards */}
      <main className="home-main">
        <div className="games-row">
          {GAMES.map((game) => (
            <button
              key={game.id}
              className="game-card"
              onClick={() => router.push(game.path)}
            >
              <div className="game-icon-wrap">
                {game.icon}
              </div>
              <div className="game-text">
                <h3>{game.title}</h3>
                <span>{game.subtitle}</span>
              </div>
              <div className="game-play-arrow">▶</div>
            </button>
          ))}
        </div>
      </main>

      {/* Footer disclaimer */}
      <footer className="home-footer">
        <p>⚠️ PARODIJA - Nije pravi casino. Samo za zabavu!</p>
      </footer>
    </div>
  );
}
