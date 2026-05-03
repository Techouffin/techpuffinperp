# PuffinPerpDex

**Privacy-first perpetual DEX on Solana, powered by Arcium confidential computation.**

> Hyperliquid × dYdX × Privacy-first MPC trading

---

## ✨ Features

| Feature | Status |
|---|---|
| Wallet connection (Phantom / Solflare) | ✅ |
| Devnet network guard + modal | ✅ |
| Real-time SOL + USDC balance display | ✅ |
| Live price chart (5 pairs) | ✅ |
| Real-time order book simulation | ✅ |
| Market & Limit orders | ✅ |
| Stop Loss / Take Profit inputs | ✅ |
| Leverage slider (1×–20×) | ✅ |
| Arcium MPC 5-step pipeline UI | ✅ |
| ZK-proof verification indicator | ✅ |
| Open positions panel + close button | ✅ |
| Trade history panel | ✅ |
| Leaderboard (mock data) | ✅ |
| Toast notifications | ✅ |
| Privacy mode toggle + score | ✅ |
| Privacy Architecture docs page | ✅ |
| Loading skeletons | ✅ |
| Framer Motion animations | ✅ |
| Mobile responsive | ✅ |

---

## 🚀 Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/elemperp-dex.git
cd elemperp-dex
npm install
npm run dev        # → http://localhost:3000
```

### Get Devnet SOL
Visit [faucet.solana.com](https://faucet.solana.com/) and airdrop to your wallet.

---

## 🏗️ Project Structure

```
src/
├── main.jsx                   # Entry — provider tree
├── App.jsx                    # Routes
├── index.css                  # Global styles + glass-panel utilities
├── lib/utils.js               # cn() helper
├── providers/
│   ├── solana-wallet.jsx      # Phantom + Solflare adapters
│   ├── arcium-privacy.jsx     # Privacy mode context
│   └── app-shell.jsx          # Global toasts + network guard
├── hooks/
│   ├── useArciumPipeline.js   # 5-stage MPC execution pipeline
│   ├── useMockTrades.js       # Position state (replaces tRPC)
│   ├── useNetworkGuard.js     # Devnet detection
│   ├── useSolanaBalance.js    # SOL + USDC balance fetcher
│   └── useToast.js            # Lightweight toast state
├── components/
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── ArciumPipelineTracker.jsx   # Animated MPC pipeline UI
│   ├── NetworkGuardModal.jsx        # Wrong-network blocker
│   ├── ToastContainer.jsx           # Global toast renderer
│   ├── WalletBalanceDisplay.jsx     # SOL + USDC pill
│   ├── Skeleton.jsx                 # Loading skeletons
│   └── ui/                          # Radix-based primitives
└── pages/
    ├── Home.jsx
    ├── Trade.jsx               # Full trading terminal
    ├── Leaderboard.jsx
    ├── PrivacyArchitecture.jsx
    ├── Docs.jsx
    └── NotFound.jsx
```

---

## 🔒 Arcium MPC Pipeline

When Private Mode is active, every trade goes through a 5-stage pipeline:

```
01 Encrypting trade parameters…       (client-side FHE)
02 Submitting to Arcium MPC network…  (encrypted payload → cluster)
03 Confidential computation…          (margin, liq price, PnL on ciphertext)
04 Generating zero-knowledge proof…   (Groth16 validity proof)
05 Settlement on Solana Devnet…       (on-chain write + tx signature)
```

---

## 🌐 Deploy to Vercel

```bash
# 1. Push to GitHub
git add . && git commit -m "PuffinPerpDex" && git push

# 2. Import repo in Vercel
# Framework: Vite  |  Build: npm run build  |  Output: dist
# vercel.json handles SPA routing automatically
```

---

## 🛠️ Tech Stack

- **React 18** + Vite 6
- **Solana wallet-adapter** (Phantom, Solflare)
- **@solana/web3.js** — balance fetching, genesis hash network check
- **Arcium** — confidential computation (simulated pipeline)
- **Recharts** — price chart
- **Radix UI** — accessible primitives
- **Framer Motion** — animations
- **Tailwind CSS** — styling

---

## ⚠️ Disclaimer

This is a **hackathon demo** running on **Solana Devnet**.
No real funds are at risk. The Arcium integration uses a simulated MPC pipeline.

---

MIT License · Built for the Solana × Arcium Hackathon
