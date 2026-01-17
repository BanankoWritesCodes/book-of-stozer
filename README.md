# 🎰 Book of Stožer - Deluxe 6

Parodijska slot igra inspirirana Book of Ra serijom. **Ovo NIJE prava igra na sreću** - napravljena je isključivo za zabavu i ne koristi se pravi novac.

![Book of Stožer](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ Značajke

- 🎲 **6 stupaca** - Proširena verzija klasične 5-reel igre
- 🎵 **Zvučni efekti** - Autentični casino zvukovi
- 🎁 **10 Free Spins** - Besplatne igre s expanding simbolom
- 🃏 **Gamble feature** - Dupliraj dobitak birajući crnu ili crvenu
- 📱 **Responzivan dizajn** - Radi na desktop i mobilnim uređajima
- ⚡ **Fast Spin** - Pritisni ponovno SPACE za brzo zaustavljanje

## 🎭 Simboli

| Simbol | Ime | Opis |
|--------|-----|------|
| 📖 | Book of Stožer | Wild + Scatter - 3+ triggeraju Free Spins |
| 🤠 | Koba the Explorer | Najviša isplata |
| 👑 | Flegma | Faraon |
| 🧔 | Kezro | Plavokosi istraživač |
| 👨 | Grossadmiral | Tamnokosi vodič |
| 🅰️ | Kec | A |
| 👑 | Kralj | K |
| 👸 | Renata | Q |
| 🧑 | Dečko | J |
| 🔟 | Ceki | 10 |

## 🚀 Instalacija

```bash
# Kloniraj repozitorij
git clone https://github.com/TVOJ_USERNAME/book-of-stozer.git

# Uđi u folder
cd book-of-stozer

# Instaliraj dependencije
npm install

# Pokreni development server
npm run dev
```

Otvori [http://localhost:3000](http://localhost:3000) u browseru.

## 🎮 Kontrole

| Tipka | Akcija |
|-------|--------|
| `SPACE` | Spin / Fast Spin |
| Klik na broj | Odaberi broj linija |

## 💰 Paytable (množitelj × ulog po liniji)

| Simbol | 6× | 5× | 4× | 3× |
|--------|-----|-----|-----|-----|
| Book | 50000 | 18000 | 1800 | 180 |
| Koba | 15000 | 5000 | 1000 | 100 |
| Flegma | 6000 | 2000 | 400 | 30 |
| Kezro/Grossadmiral | 2500 | 750 | 100 | 30 |
| Kec/Kralj | 500 | 150 | 40 | 10 |
| Renata/Dečko/Ceki | 300 | 100 | 25 | 5 |

## 🛠️ Tehnologije

- [Next.js 14](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [React Hooks](https://reactjs.org/docs/hooks-intro.html) - State management

## 📁 Struktura projekta

```
book-of-stozer/
├── app/
│   ├── globals.css      # Svi stilovi
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Glavna stranica
├── components/
│   └── SlotMachine.tsx  # Glavna komponenta igre
├── hooks/
│   └── useGameState.ts  # Game state i logika
├── lib/
│   └── gameConfig.ts    # Konfiguracija (simboli, isplate, linije)
└── public/
    ├── symbols/         # Slike simbola
    └── sounds/          # Zvučni efekti
```

## ⚠️ Disclaimer

**Ovo je PARODIJA i nije prava igra na sreću.**

- Ne koristi se pravi novac
- RTP (Return to Player): ~90%
- Napravljeno isključivo za zabavu
- Svi likovi i reference su fiktivni

## 📄 Licenca

MIT License - slobodno koristi, modificiraj i distribuiraj.

---

Napravljeno s ❤️ u Hrvatskoj 🇭🇷
