# Security Policy

NERVEX is experimental software. It has not been audited. Do not use it to custody funds or make financial decisions.

The research harness never requests private keys, seed phrases, mnemonics, or wallet secrets. A wallet connection is initiated only after a user click; wallet approval is controlled by the wallet. This repository does not request transaction signing or message signing.

If you find a security issue, use this repository's **Security → Advisories → Report a vulnerability** flow if it is available. Do not post exploit details or secrets in a public issue. If private reporting is unavailable, open a minimal issue asking maintainers for a private contact route without describing the vulnerability. No unconfigured security email address is advertised.

Please include affected version or commit, reproduction steps, impact, and a safe proof of concept. Do not test against accounts or systems you do not own or control. We cannot promise a fixed response time while the project is in early development.

The localhost RPC proxy allowlists read methods and clusters, but it is not a hardened public API gateway. Do not expose scripts/dev.mjs on a public interface.
