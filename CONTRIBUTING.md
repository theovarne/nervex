# Contributing to NERVEX

This repository is an early research core. Small, testable changes with explicit provenance are preferred.

1. Fork the repository and branch from main using feature/*, fix/*, or research/*.
2. Use Node.js 22+ and npm. Run npm ci, then npm run dev for the local harness.
3. Before a PR run npm run lint, npm run typecheck, npm test, and npm run build.
4. Add or update tests for changed behavior and describe data-source implications.
5. Open a pull request with a concise rationale, limitations, and screenshots when the UI changes.

Use plain JavaScript with ES modules and keep functions small. New Solana fields should retain native protocol names in provider code. Research metaphors belong at the presentation layer. Do not silently turn simulated values into live-looking readouts.

Never submit secrets, seed phrases, wallet keys, production RPC credentials, third-party datasets, or licensed assets without redistribution rights. Do not add a dependency or vendor file without checking its license and updating THIRD_PARTY_NOTICES.md.

For a biological claim, cite a primary source. For an experimental market claim, explain the test design and uncertainty; do not invent benchmarks or accuracy figures.
