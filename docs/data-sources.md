# Data Sources and Provenance

NERVEX uses three primary labels:

| Label | Meaning | In this repository |
| --- | --- | --- |
| LIVE / SOLANA | Observed RPC response from Mainnet or Devnet | Finalized slot and block sample, when available |
| EXTERNAL MARKET | Non-Solana market data from a named provider | No provider configured |
| SIMULATED RESEARCH | Deterministic example or experimental model state | Cognition, tension and fly demonstration |

Wallet names and addresses come from user-installed wallet providers after user action; they are not market observations. A source label must follow the specific field, not be inherited from an adjacent panel. In particular, a live slot does not make a simulated tension score live.

The local proxy allows only read-method JSON-RPC calls. Public endpoint availability is not guaranteed. If an RPC request fails, the UI shows UNAVAILABLE or RPC UNAVAILABLE. If any scoring factor is missing, the core returns null. There is no synthetic fallback silently substituted for a failed live request.

Future external providers must document endpoint, authentication, coverage, delay, terms, cache policy, and the exact fields they supply before the EXTERNAL MARKET label is used in a live view.
