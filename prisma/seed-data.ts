/**
 * Seed list: Circle-announced Arc launch partners (Oct 28, 2025).
 * Source: https://www.arc.network/blog/circle-launches-arc-public-testnet
 *
 * Only includes websites/twitter handles we are confident are correct.
 * Admin panel fills in the rest.
 */

import type { CategoryId } from "../lib/categories";

export interface SeedProject {
  name: string;
  category: CategoryId;
  description: string;
  website?: string;
  twitter?: string;
  verified?: boolean;
}

export const SEED_PROJECTS: SeedProject[] = [
  // ── Stablecoins & Asset Issuers ────────────────────────────────────────
  { name: "Circle", category: "stablecoin", description: "Issuer of USDC and EURC; builder of Arc.", website: "https://www.circle.com", twitter: "circle", verified: true },
  { name: "Forte (AUDF)", category: "stablecoin", description: "AUD-denominated stablecoin issuer." },
  { name: "Avenia (BRLA)", category: "stablecoin", description: "BRL-denominated stablecoin issuer for Brazil." },
  { name: "JPYC", category: "stablecoin", description: "Japanese yen stablecoin issuer.", website: "https://jpyc.jp" },
  { name: "BDACS (KRW1)", category: "stablecoin", description: "Korean won stablecoin issuer." },
  { name: "Juno / Bitso (MXNB)", category: "stablecoin", description: "Mexican peso stablecoin issuer via Bitso/Juno.", website: "https://www.bitso.com", twitter: "Bitso" },
  { name: "Coins.PH (PHPC)", category: "stablecoin", description: "Philippine peso stablecoin issuer.", website: "https://coins.ph" },
  { name: "Stablecorp (QCAD)", category: "stablecoin", description: "Canadian dollar stablecoin issuer." },
  { name: "WisdomTree", category: "stablecoin", description: "Issues WTGXX (tokenized MM fund) and CRDT on Arc.", website: "https://www.wisdomtree.com" },

  // ── DEXs ──────────────────────────────────────────────────────────────
  { name: "Uniswap", category: "dex", description: "Leading AMM and DEX protocol.", website: "https://uniswap.org", twitter: "Uniswap", verified: true },
  { name: "Curve", category: "dex", description: "Stablecoin-optimized AMM.", website: "https://curve.fi", twitter: "CurveFinance", verified: true },
  { name: "Dromos Labs", category: "dex", description: "Teams behind Aerodrome (Base) and Velodrome (OP); deploying on Arc.", website: "https://aerodrome.finance" },
  { name: "Euler Finance", category: "dex", description: "Modular lending and DEX stack.", website: "https://www.euler.finance", twitter: "eulerfinance" },
  { name: "Fluid", category: "dex", description: "Unified liquidity layer for DEX and lending." },

  // ── CEXs ──────────────────────────────────────────────────────────────
  { name: "Coinbase", category: "cex", description: "US-listed cryptocurrency exchange.", website: "https://www.coinbase.com", twitter: "coinbase", verified: true },
  { name: "Kraken", category: "cex", description: "Global cryptocurrency exchange.", website: "https://www.kraken.com", twitter: "krakenfx", verified: true },
  { name: "ByBit", category: "cex", description: "Global cryptocurrency derivatives exchange.", website: "https://www.bybit.com", twitter: "Bybit_Official" },
  { name: "Robinhood", category: "cex", description: "Consumer trading app with crypto support.", website: "https://robinhood.com", twitter: "RobinhoodApp" },
  { name: "Bitvavo", category: "cex", description: "European crypto exchange based in the Netherlands.", website: "https://bitvavo.com" },
  { name: "Coincheck", category: "cex", description: "Japanese cryptocurrency exchange.", website: "https://coincheck.com" },
  { name: "Hashkey", category: "cex", description: "Hong Kong-licensed digital asset exchange.", website: "https://www.hashkey.com" },

  // ── Lending ───────────────────────────────────────────────────────────
  { name: "Aave", category: "lending", description: "Largest DeFi money market protocol.", website: "https://aave.com", twitter: "aave", verified: true },
  { name: "Morpho", category: "lending", description: "Lending infrastructure and isolated markets.", website: "https://morpho.org", twitter: "MorphoLabs", verified: true },
  { name: "Maple", category: "lending", description: "Institutional on-chain credit marketplace.", website: "https://maple.finance", twitter: "maplefinance" },

  // ── Payments & Fintech ────────────────────────────────────────────────
  { name: "Visa", category: "payments", description: "Global payments network.", website: "https://www.visa.com", twitter: "Visa", verified: true },
  { name: "Mastercard", category: "payments", description: "Global payments network.", website: "https://www.mastercard.com", twitter: "Mastercard", verified: true },
  { name: "WorldPay", category: "payments", description: "Global merchant payments processor.", website: "https://www.worldpay.com" },
  { name: "Paysafe", category: "payments", description: "Digital commerce and payments platform.", website: "https://www.paysafe.com" },
  { name: "Nuvei", category: "payments", description: "Global payment technology provider.", website: "https://www.nuvei.com" },
  { name: "FIS", category: "payments", description: "Financial services technology provider.", website: "https://www.fisglobal.com" },
  { name: "Brex", category: "payments", description: "Corporate cards and treasury for startups.", website: "https://www.brex.com", twitter: "brexHQ" },
  { name: "Corpay", category: "payments", description: "B2B payments and cross-border FX.", website: "https://www.corpay.com" },
  { name: "dLocal", category: "payments", description: "Emerging-market payments processor.", website: "https://dlocal.com" },
  { name: "Ebanx", category: "payments", description: "Payments processor for Latin America.", website: "https://www.ebanx.com" },
  { name: "PhotonPay", category: "payments", description: "Cross-border payments and card issuing.", website: "https://www.photonpay.com" },
  { name: "LianLian Global", category: "payments", description: "China-based cross-border payments.", website: "https://www.lianlianglobal.com" },
  { name: "Yellow Card", category: "payments", description: "Stablecoin payments platform for Africa.", website: "https://yellowcard.io" },
  { name: "Noah", category: "payments", description: "Stablecoin payments infrastructure." },
  { name: "Mercoin", category: "payments", description: "Digital asset payments by Mercari." },
  { name: "Careem", category: "payments", description: "MENA super-app (rides, delivery, payments).", website: "https://www.careem.com" },
  { name: "Catena Labs", category: "payments", description: "Stablecoin-native financial services." },
  { name: "Dmall", category: "payments", description: "Retail digitalization and payments platform." },
  { name: "Hecto Financial", category: "payments", description: "Korean payments and fintech group." },
  { name: "Pairpoint by Vodafone", category: "payments", description: "Enterprise digital identity and transaction platform." },
  { name: "Ramp", category: "payments", description: "Corporate card and expense management.", website: "https://ramp.com" },
  { name: "Ramp Network", category: "payments", description: "Fiat-to-crypto on/off ramp.", website: "https://ramp.network", twitter: "RampNetwork" },
  { name: "Transak", category: "payments", description: "Global fiat-to-crypto on/off ramp.", website: "https://transak.com", twitter: "Transak" },
  { name: "Sasai Fintech", category: "payments", description: "African fintech by Cassava Technologies." },
  { name: "Sumitomo Corporation", category: "payments", description: "Japanese integrated trading and fintech group.", website: "https://www.sumitomocorp.com" },

  // ── Wallets ───────────────────────────────────────────────────────────
  { name: "MetaMask", category: "wallet", description: "Leading self-custody EVM wallet.", website: "https://metamask.io", twitter: "MetaMask", verified: true },
  { name: "Ledger", category: "wallet", description: "Hardware wallet maker.", website: "https://www.ledger.com", twitter: "Ledger", verified: true },
  { name: "Rainbow", category: "wallet", description: "Consumer-focused Ethereum wallet.", website: "https://rainbow.me", twitter: "rainbowdotme" },
  { name: "Exodus", category: "wallet", description: "Multi-asset self-custody wallet.", website: "https://www.exodus.com" },
  { name: "Privy", category: "wallet", description: "Embedded wallets for web apps.", website: "https://privy.io", twitter: "privy_io" },
  { name: "Turnkey", category: "wallet", description: "Wallet and key management infrastructure.", website: "https://turnkey.com" },
  { name: "Fireblocks", category: "wallet", description: "Institutional wallet and transfer network.", website: "https://www.fireblocks.com", twitter: "FireblocksHQ" },
  { name: "Bron", category: "wallet", description: "Institutional digital asset wallet platform." },
  { name: "Hecto Innovation", category: "wallet", description: "Korean digital asset wallet platform." },
  { name: "Vultisig", category: "wallet", description: "Multi-device threshold signature wallet.", website: "https://vultisig.com" },

  // ── Custody ───────────────────────────────────────────────────────────
  { name: "BitGo", category: "custody", description: "Institutional custody and settlement.", website: "https://www.bitgo.com", twitter: "BitGo" },
  { name: "Copper", category: "custody", description: "Institutional custody and prime brokerage.", website: "https://copper.co" },
  { name: "Taurus", category: "custody", description: "Swiss institutional digital asset custody." },
  { name: "Zodia Custody", category: "custody", description: "Standard Chartered-backed institutional custody.", website: "https://www.zodia.io" },

  // ── Market Makers & OTC ───────────────────────────────────────────────
  { name: "Wintermute", category: "market-maker", description: "Algorithmic liquidity provider.", website: "https://wintermute.com", twitter: "wintermute_t" },
  { name: "Galaxy Digital", category: "market-maker", description: "Digital asset financial services firm.", website: "https://www.galaxy.com" },
  { name: "Cumberland", category: "market-maker", description: "DRW's digital asset market-making arm.", website: "https://cumberland.io" },
  { name: "GSR", category: "market-maker", description: "Crypto market maker and OTC desk.", website: "https://www.gsr.io" },
  { name: "B2C2", category: "market-maker", description: "OTC crypto liquidity provider.", website: "https://www.b2c2.com" },
  { name: "Auros", category: "market-maker", description: "Algorithmic market maker.", website: "https://www.auros.global" },
  { name: "IMC", category: "market-maker", description: "Global proprietary trading firm.", website: "https://www.imc.com" },
  { name: "Keyrock", category: "market-maker", description: "Digital asset market maker.", website: "https://keyrock.eu" },
  { name: "Forte Securities", category: "market-maker", description: "Regulated digital asset broker-dealer." },
  { name: "NONCO", category: "market-maker", description: "Crypto-native OTC and market-making." },
  { name: "Zodia Markets", category: "market-maker", description: "Institutional OTC trading (Standard Chartered-backed).", website: "https://www.zodiamarkets.com" },

  // ── Yield & Tokenized Funds ───────────────────────────────────────────
  { name: "Centrifuge", category: "yield-funds", description: "Tokenized real-world asset platform.", website: "https://centrifuge.io", twitter: "centrifuge" },
  { name: "Superform", category: "yield-funds", description: "Cross-chain yield aggregator and vault marketplace.", website: "https://www.superform.xyz" },
  { name: "Securitize", category: "yield-funds", description: "Tokenization platform for regulated securities.", website: "https://securitize.io", twitter: "Securitize" },

  // ── Crosschain ────────────────────────────────────────────────────────
  { name: "Wormhole", category: "crosschain", description: "Cross-chain messaging and token transfer protocol.", website: "https://wormhole.com", twitter: "wormhole", verified: true },
  { name: "LayerZero", category: "crosschain", description: "Omnichain messaging protocol.", website: "https://layerzero.network", twitter: "LayerZero_Labs", verified: true },
  { name: "Stargate", category: "crosschain", description: "Omnichain native asset bridge (LayerZero-based).", website: "https://stargate.finance", twitter: "StargateFinance" },
  { name: "Across", category: "crosschain", description: "Intent-based cross-chain bridge.", website: "https://across.to", twitter: "AcrossProtocol" },

  // ── Infrastructure ────────────────────────────────────────────────────
  { name: "Alchemy", category: "infra", description: "Web3 developer platform and node provider.", website: "https://www.alchemy.com", twitter: "AlchemyPlatform", verified: true },
  { name: "QuickNode", category: "infra", description: "Multi-chain RPC and infrastructure platform.", website: "https://www.quicknode.com", twitter: "QuickNode" },
  { name: "Blockdaemon", category: "infra", description: "Institutional blockchain infrastructure.", website: "https://www.blockdaemon.com" },
  { name: "Blockscout", category: "infra", description: "Open-source block explorer (runs testnet.arcscan.app).", website: "https://www.blockscout.com" },
  { name: "Chainlink", category: "infra", description: "Decentralized oracle network.", website: "https://chain.link", twitter: "chainlink", verified: true },
  { name: "Tenderly", category: "infra", description: "Web3 observability and simulation platform.", website: "https://tenderly.co" },
  { name: "Elliptic", category: "infra", description: "Blockchain analytics and compliance.", website: "https://www.elliptic.co" },
  { name: "TRM", category: "infra", description: "TRM Labs -- blockchain intelligence and compliance.", website: "https://www.trmlabs.com" },
  { name: "Bridge", category: "infra", description: "Stablecoin orchestration API (acquired by Stripe).", website: "https://www.bridge.xyz" },
  { name: "Amazon Web Services", category: "infra", description: "Cloud infrastructure for Arc ecosystem participants.", website: "https://aws.amazon.com", twitter: "awscloud" },
  { name: "Cloudflare", category: "infra", description: "Edge network, RPC gateway and security.", website: "https://www.cloudflare.com", twitter: "Cloudflare" },

  // ── Dev Tools ─────────────────────────────────────────────────────────
  { name: "Anthropic", category: "dev-tools", description: "Claude Code powering AI builder tools on Arc.", website: "https://www.anthropic.com", twitter: "AnthropicAI", verified: true },
  { name: "thirdweb", category: "dev-tools", description: "Web3 SDKs, contracts and infrastructure.", website: "https://thirdweb.com", twitter: "thirdweb" },
  { name: "Crossmint", category: "dev-tools", description: "Enterprise stablecoin developer platform.", website: "https://www.crossmint.com", twitter: "crossmint" },
  { name: "Dynamic", category: "dev-tools", description: "Wallet SDK and auth for Web3 apps.", website: "https://www.dynamic.xyz" },
  { name: "Fun.xyz", category: "dev-tools", description: "Consumer-grade onchain primitives and SDKs.", website: "https://fun.xyz" },
  { name: "Pimlico", category: "dev-tools", description: "Account abstraction infrastructure.", website: "https://www.pimlico.io" },
  { name: "ZeroDev", category: "dev-tools", description: "Smart account SDK and paymaster.", website: "https://zerodev.app" },

  // ── Capital Markets ───────────────────────────────────────────────────
  { name: "Apollo", category: "capital-markets", description: "Global alternative asset manager.", website: "https://www.apollo.com" },
  { name: "BNY", category: "capital-markets", description: "BNY Mellon -- institutional custody and settlement.", website: "https://www.bny.com" },
  { name: "NYSE / ICE", category: "capital-markets", description: "New York Stock Exchange / Intercontinental Exchange.", website: "https://www.nyse.com", twitter: "NYSE" },
  { name: "State Street", category: "capital-markets", description: "Custody and asset servicing giant.", website: "https://www.statestreet.com" },

  // ── Banks, Asset Managers & Insurers ──────────────────────────────────
  { name: "BlackRock", category: "bank-asset-mgr", description: "World's largest asset manager.", website: "https://www.blackrock.com", twitter: "BlackRock" },
  { name: "Goldman Sachs", category: "bank-asset-mgr", description: "Global investment bank.", website: "https://www.goldmansachs.com", twitter: "GoldmanSachs" },
  { name: "HSBC", category: "bank-asset-mgr", description: "Global banking and financial services.", website: "https://www.hsbc.com", twitter: "HSBC" },
  { name: "Deutsche Bank", category: "bank-asset-mgr", description: "Germany's largest bank.", website: "https://www.db.com", twitter: "DeutscheBank" },
  { name: "Standard Chartered", category: "bank-asset-mgr", description: "International banking group.", website: "https://www.sc.com", twitter: "StanChart" },
  { name: "Societe Generale", category: "bank-asset-mgr", description: "French multinational investment bank.", website: "https://www.societegenerale.com" },
  { name: "Commerzbank", category: "bank-asset-mgr", description: "German banking and financial services.", website: "https://www.commerzbank.com" },
  { name: "Invesco", category: "bank-asset-mgr", description: "Global investment management firm.", website: "https://www.invesco.com" },
  { name: "Fiserv", category: "bank-asset-mgr", description: "Financial services technology provider.", website: "https://www.fiserv.com" },
  { name: "BTG Pactual", category: "bank-asset-mgr", description: "Latin American investment bank.", website: "https://www.btgpactual.com" },
  { name: "Emirates NBD", category: "bank-asset-mgr", description: "UAE-based banking group.", website: "https://www.emiratesnbd.com" },
  { name: "First Abu Dhabi Bank", category: "bank-asset-mgr", description: "UAE's largest bank.", website: "https://www.bankfab.com" },
  { name: "Bank Frick", category: "bank-asset-mgr", description: "Liechtenstein-based private bank with crypto services.", website: "https://www.bankfrick.li" },
  { name: "Clearbank", category: "bank-asset-mgr", description: "UK clearing bank for regulated fintechs.", website: "https://www.clear.bank" },
  { name: "FirstRand", category: "bank-asset-mgr", description: "South African banking and financial services group.", website: "https://www.firstrand.co.za" },
  { name: "Absa", category: "bank-asset-mgr", description: "Pan-African banking group.", website: "https://www.absa.africa" },
  { name: "SBI Group", category: "bank-asset-mgr", description: "Japanese financial services conglomerate.", website: "https://www.sbigroup.co.jp" },
  { name: "Kyobo Life", category: "bank-asset-mgr", description: "Korean life insurance and asset management.", website: "https://www.kyobo.co.kr" },
];
