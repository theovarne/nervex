# Strike: Committed Observation

STRIKE is a proposed observation recorded **before** an outcome is known. It is not an automated trade, execution instruction, recommendation, or guaranteed prediction.

Proposed record fields:

| Field | Meaning |
| --- | --- |
| target | Address or market identifier |
| state | Explicit model state at observation time |
| confidence | A calibrated value only if calibration exists; otherwise unavailable |
| timestamp | Observation time |
| horizon | Evaluation interval |
| dataHash | Hash of source observations and normalization settings |
| source | LIVE / SOLANA, EXTERNAL MARKET, or SIMULATED RESEARCH as applicable |

Potential V1: user-approved offchain wallet-signed message. Potential V2: optional onchain commitment registry. **Neither is implemented in this repository.** No deployed registry address or contract should be inferred from this design note. Any future signing flow must present the exact message in the wallet and avoid private-key handling.
