# Tension Model

Tension is a normalized **attention heuristic**, not a price forecast or probability of profit.

Version 0.1 in src/core/tension.js requires four measured inputs in [0, 1]:

| Input | Weight | Intended interpretation |
| --- | ---: | --- |
| Activity | 0.30 | Relative event activity |
| Flow | 0.25 | Relative token/value-flow activity |
| Diversity | 0.25 | Distinct interaction breadth |
| Recency | 0.20 | Temporal freshness |

Formula: T = 0.30 A + 0.25 F + 0.25 D + 0.20 R.

The function returns a score in [0, 1], a rounded percentage, and the input factors. A missing, non-finite, or out-of-range input returns null. The demo feeds a fixed test vector and labels its output SIMULATED RESEARCH; no live calibration, benchmark, predictive validation, or investment inference is claimed.

Future work must specify how raw observations are normalized, time windows, deduplication, provider reliability, and uncertainty before displaying live tension for a wallet or token.
