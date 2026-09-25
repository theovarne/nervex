# Cognition State Machine

The word cognition names an **explicit computational state machine**. It does not imply life, subjective experience, an LLM, or autonomous trading.

~~~text
IDLE --START--> LISTENING --SIGNAL--> LOCALIZING
LOCALIZING --LOCATED--> CLASSIFYING --CLASSIFIED--> WRAPPING
WRAPPING --WRAPPED--> COMPARING --REVIEWED--> COMMITTING
COMMITTING --COMMITTED--> REMEMBERING --RESUME--> LISTENING
~~~

Several states can DISCARD back to LISTENING; LISTENING and REMEMBERING can STOP to IDLE. The implementation is src/core/cognition.js. Invalid transitions throw instead of silently advancing.

In the demo, a button runs a fixed sequence through WRAPPING. This is a simulated test vector and is labeled accordingly. It is **not** triggered by the live Solana slot panel. Actual event-driven transition rules, deduplication, persistence, and review semantics remain research work.
