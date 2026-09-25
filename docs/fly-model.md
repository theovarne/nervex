# Fly Model

A fly is a **short-lived anomalous signal candidate** in the NERVEX metaphor. It is not a scam detector, profit signal, or buy recommendation.

The research score in src/core/fly.js combines normalized activity delta (0.25), wallet contacts (0.20), flow (0.20), recency (0.20), and program contacts (0.15). A score of 0.70 or more marks a candidate in the test model. Missing or invalid inputs return null.

The current demo uses one fixed synthetic vector. It has no calibrated baseline, false-positive estimate, venue coverage, or outcome study. Every output is labeled SIMULATED RESEARCH. A live system would need a reference population, explicit observation window, source lineage, and review before any meaningful alert claim.
