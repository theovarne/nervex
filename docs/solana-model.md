# Solana Data Model

NERVEX retains Solana's native vocabulary in provider and data code. Spider terminology is a presentation/analysis mapping, not a replacement for protocol definitions.

| Protocol concept | Role | NERVEX view |
| --- | --- | --- |
| Account | Stored state at an address | Node |
| Program | Executable logic | Active structure |
| Instruction | Program invocation in a transaction | Micro-vibration |
| Transaction | Signed, ordered instructions | Vibration |
| Signature | Transaction identifier/proof | Trace identifier |
| Slot | Ledger progression unit | Time coordinate |
| Mint | Token definition account | Asset node |
| Token account | Token holding account | Holding node |
| Program ID | Address of executable program | Active-structure identifier |

The local RPC client currently reads finalized slots, blocks, signatures, balances, and parsed transactions. It does **not** decode every SPL Token or Token-2022 extension. A token account or mint may use different token programs; implementation should retain program IDs rather than assume one token standard. For authoritative semantics see the [Solana core documentation](https://solana.com/docs/core) and [Token-2022 documentation](https://www.solana-program.com/docs/token-2022).

The harness does not write chain state. Its sample signature is a read-only block field. The sample cognition panel is unrelated to the signature unless a future explicit mapping is implemented.
