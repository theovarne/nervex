# NERVEX Architecture

This repository contains both the current production static snapshot in site/ and a separate testable research harness. There is no unshipped production backend being implied.

~~~text
┌───────────────────────────┐
│ Research harness UI       │
└───────┬─────────────┬─────┘
        │             │
  LIVE / SOLANA   SIMULATED RESEARCH
        │             │
┌───────▼───────┐  ┌──▼─────────────────────┐
│ RPC client    │  │ Explicit cognition     │
│ Wallet Std.   │  │ Tension and fly models │
└───────┬───────┘  └────────────────────────┘
        │
┌───────▼────────────┐
│ Local RPC allowlist│
└───────┬────────────┘
        │
   Solana RPC
~~~

The UI in demo/ requests a finalized slot and a recent block signature. src/solana/rpc.js sends JSON-RPC requests to /api/solana; scripts/dev.mjs serves a localhost-only proxy with a fixed method allowlist and Mainnet/Devnet endpoints. The proxy can optionally use a server-side RPC URL. It does not embed credentials in client JavaScript.

src/solana/wallet-standard.js listens for Wallet Standard registration. It only discovers eligible wallets; demo/app.js requests a connection after a user click. The wallet itself controls approval. The harness does not ask for a signature, transaction, seed phrase, or private key.

src/core/ implements deterministic research models. None of these modules calls an LLM or a trading venue. A fixed example in the demo is labeled SIMULATED RESEARCH. Tests cover state transitions, missing inputs, data-source labels, RPC errors, and wallet discovery.

The production site has an experimental WEB–SOMA 3D interface in site/web-soma.js and site/web-soma.css, with model assets in site/assets/models/. The HTML/CSS/JS snapshot in site/ can reproduce the UI when served from the web root; its RPC function requires Vercel or an equivalent adapter. The page shell and third-party media have distinct provenance and license boundaries documented in THIRD_PARTY_NOTICES.md.

## Failure behavior

RPC errors propagate to the UI as unavailable. No generated fallback is presented as live chain data. A missing scoring factor returns null. No external provider exists in this package. Static build/ output lacks an RPC endpoint unless deployed with a compatible proxy.

## Trust boundaries

1. Browser wallet accounts are user-controlled; a connect request is not a custody operation.
2. The proxy accepts only selected read methods and only configured Solana RPC destinations.
3. Server-side RPC credentials belong in .env.local and must not be committed.
4. Research-model output must retain its SIMULATED RESEARCH label even when a live panel sits beside it.
