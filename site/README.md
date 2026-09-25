# Production static snapshot

This directory contains the files deployed for nervex.app: static Home, Docs, and Tracks pages, NERVEX JavaScript/CSS, a Vercel Solana RPC function, local vendor modules, fonts, video, and attributed 3D models. It is **not a Next.js or React source project**.

Serve this directory at the web root. A plain static server renders the interface but cannot execute api/solana.js; Solana live data may show UNAVAILABLE. Vercel uses vercel.json for route handling and the api/ function for the read-only RPC proxy.

The page shell has a Framer-derived reference history. Other assets and vendor modules have separate terms described in ../THIRD_PARTY_NOTICES.md and assets/models/ATTRIBUTION.md. Do not assume the repository's MIT license covers every file in this directory.
