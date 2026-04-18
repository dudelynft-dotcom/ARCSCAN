# ArcRadar

A discovery + analytics site for projects building on **Arc** (Circle's stablecoin-native L1 blockchain).
Built for Crypto Twitter to find Arc projects early, with admin-curated ratings, verification badges, and risk tags.

## What's in the box

```
app/              Next.js 15 App Router
  page.tsx          Home (verified + recent + browse-by-category)
  explorer/         Full list with filters, search, sort
  project/[slug]/   Project detail: metrics, socials, risk, contract
  admin/            Password-gated admin panel (edit, verify, flag, rate)
lib/              db, auth, scoring, categories, slug, formatting
components/       shared UI (nav, cards, badges, filters)
prisma/           schema + seed with 150+ Arc launch partners
scanner/          Phase-2 onchain scanner (disabled by default)
```

## Phase plan

| Phase | When | What |
|-------|------|------|
| **1 — Testnet** | Now | Curated directory of the 150+ Circle-announced Arc partners. Admin panel for rate/verify/flag/edit. Public explorer with filters + search. Auto-discovery OFF (free gas → spam). |
| **2 — Mainnet flip** | When Arc mainnet ships | Flip `SCANNER_ENABLED=true`. Block watcher + DEX factory watcher auto-populate `DiscoveryCandidate` table. Admin promotes good ones to `Project`. |

## Setup

```bash
# 1. Install
npm install

# 2. Copy env
cp .env.example .env
#   → edit ADMIN_PASSWORD and ADMIN_SESSION_SECRET (long random string)

# 3. Initialize DB + seed 150+ partners
npm run db:push
npm run db:seed

# 4. Start dev server
npm run dev
# → http://localhost:3000
```

Admin lives at `/admin/login`. Default URL: `http://localhost:3000/admin/login`.

## Commands

```bash
npm run dev        # Next dev server
npm run build      # production build
npm run start      # production server
npm run db:push    # apply schema to DB
npm run db:seed    # seed Arc launch partners
npm run db:reset   # wipe + re-seed
npm run db:studio  # open Prisma Studio UI
npm run scanner    # run Phase-2 onchain scanner (requires SCANNER_ENABLED=true)
```

## Architecture highlights

**Categories** (`lib/categories.ts`) — 14 Arc-specific buckets:
Stablecoin · DEX · CEX · Lending · Payments · Wallet · Custody · Market Maker · Yield & Funds · Crosschain · Infrastructure · Dev Tools · Capital Markets · Bank/AssetMgr.

These reflect Arc's real ecosystem (fintech/enterprise/RWA). Not the generic "DeFi/NFT/Meme/Infra" from degen chains.

**Scoring** (`lib/scoring.ts`) — Arc-tuned weights: Volume 35 · Users 20 · Liquidity 15 · Growth 15 · Social 5 · Risk −30. Admin can override any project's score.

**Risk** — flags: owner can mint, liquidity not locked, top wallet >50%, no verified links. Levels: SAFE / MEDIUM / HIGH / UNKNOWN.

**Admin auth** — HMAC-signed session cookie, password in env. No auth library dependency.

## Deploying

### Frontend (Vercel)
1. Push to GitHub.
2. Import to Vercel.
3. Swap `DATABASE_URL` to a Postgres connection string (Neon free tier works).
4. In `prisma/schema.prisma`, change `provider = "sqlite"` → `provider = "postgresql"` and `db push` again.
5. Set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` in Vercel env.

### Scanner (Phase 2)
- Run on any persistent host (Railway, Fly.io, Hetzner).
- Set `SCANNER_ENABLED=true`, `ARC_RPC_URL`, `DATABASE_URL`.
- Run with `npm run scanner` (or containerize).
- Fill in `scanner/dex-factory-watcher.ts` FACTORIES array with real Arc DEX factory addresses.

## Arc network reference

- **Testnet chain ID:** `5042002`
- **Testnet RPC:** `https://rpc.testnet.arc.network`
- **Testnet explorer:** `https://testnet.arcscan.app` (Blockscout)
- **Mainnet chain ID (ChainList):** `1243` — verify before using
- **Docs:** https://docs.arc.network

## License

MIT — use it, fork it, rebrand it. Not affiliated with Circle or Arc.
