# ⚡ KRAUZER // ARCADE

> **GAME PLATFORM INTERFACE // SYSTEM ONLINE**

A cyberpunk browser-gaming hub built with React for original arcade, action, strategy, RPG, and experimental games.

The project currently ships with **Sky Crystal Run** as Game `KG-001`, while the interface and data layer are structured to support a much larger game library later.

---

## // SYSTEM STATUS

| Module | Status |
| --- | --- |
| React gaming portal | 🟢 ONLINE |
| Sky Crystal Run | 🟢 PLAYABLE |
| Global leaderboard | 🟢 LIVE |
| Supabase score sync | 🟢 ONLINE |
| Desktop controls | 🟢 READY |
| Mobile controls | 🟢 READY |
| Additional games | 🟣 IN DEVELOPMENT |

---

## // TECH STACK

```text
UI ............ React 19
Build ......... Vite
Styling ....... Emotion
Icons ......... Lucide React
Game Engine ... Canvas 2D / JavaScript
Database ...... Supabase
Hosting ....... Vercel
Repository .... GitHub
```

The application shell is React-based. The game renderer remains a dedicated Canvas module so gameplay rendering is kept separate from the portal UI.

---

## // CURRENT GAME

### KG-001 // SKY CRYSTAL RUN

Fast aerial arcade survival.

**Core systems**

- Crystal combo scoring
- Escalating waves
- Boss encounters
- Shields and power-ups
- Health system
- Local personal best
- Global Supabase ranking
- Synthesized game audio
- Desktop and mobile input

### Controls

| Input | Action |
| --- | --- |
| `WASD` | Move |
| Arrow keys | Move |
| Touch / drag | Mobile movement |
| On-screen D-pad | Mobile movement |
| `P` | Pause / resume |

---

## // LOCAL BOOT SEQUENCE

Requires a current Node.js installation.

```bash
git clone https://github.com/Jack123Krauzer/zoody-game.git
cd zoody-game
npm install
npm run dev
```

Vite will start the local development server and print the local URL in the terminal.

### Production build

```bash
npm run build
npm run preview
```

---

## // PROJECT MAP

```text
src/
├── App.jsx            # React application state / screen switching
├── HomeScreen.jsx     # Krauzer Arcade dashboard
├── GameScreen.jsx     # React game shell + HUD
└── main.jsx           # React entry point

game.js                # Gameplay systems and input
renderer.js            # Canvas rendering engine
leaderboard.js         # Supabase ranking client
index.html             # Minimal Vite bootstrap
vite.config.js         # React/Vite build configuration
vercel.json            # Vercel configuration
```

---

## // DATA NETWORK

Global scores are stored in Supabase.

The leaderboard records:

- Pilot name
- Score
- Distance
- Wave reached
- Submission timestamp

Row Level Security is enabled, with public gameplay clients limited to the operations required for reading and submitting leaderboard scores.

The Supabase browser key used by the game is a **publishable key**, not a service-role secret.

---

## // DEPLOYMENT

Production is deployed through Vercel from the GitHub repository.

```text
staging / feature branch
        ↓
Vercel Preview
        ↓
verification
        ↓
Pull Request
        ↓
main
        ↓
Production
```

This is the intended workflow so experimental UI changes do not use production as a testing arena. Humanity has invented staging environments; we may as well exploit the breakthrough.

---

## // DESIGN SYSTEM

The Krauzer Arcade interface follows a compact cyberpunk gaming-dashboard language:

- Near-black grid backgrounds
- Neon cyan primary interface color
- Purple and magenta game/category accents
- Green network/status indicators
- Yellow competitive/ranking indicators
- Monospace telemetry labels
- Sharp HUD cards and glowing outlines
- Dense game-launcher layout rather than a marketing landing page
- Responsive mobile dashboard behavior

The **platform identity remains game-agnostic**. Individual titles can have their own branding only after the player enters that game.

---

## // ROADMAP

```text
[ONLINE]   Game library foundation
[ONLINE]   Global rankings
[ONLINE]   Mobile-aware UI
[ONLINE]   React portal
[NEXT]     Additional games
[NEXT]     Player accounts
[NEXT]     Profiles / achievements
[NEXT]     Multiplayer lobby layer
[FUTURE]   Seasons and platform-wide challenges
```

---

## // LIVE

**KRAUZER // ARCADE**

`https://zoody.krauzer.in`

Built to become a game platform, not remain a one-game website.
