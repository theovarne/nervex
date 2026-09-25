export const COGNITION_STATES = Object.freeze([
  "IDLE", "LISTENING", "LOCALIZING", "CLASSIFYING",
  "WRAPPING", "COMPARING", "COMMITTING", "REMEMBERING"
]);

const transitions = Object.freeze({
  IDLE: { START: "LISTENING" },
  LISTENING: { SIGNAL: "LOCALIZING", STOP: "IDLE" },
  LOCALIZING: { LOCATED: "CLASSIFYING", DISCARD: "LISTENING" },
  CLASSIFYING: { CLASSIFIED: "WRAPPING", DISCARD: "LISTENING" },
  WRAPPING: { WRAPPED: "COMPARING", DISCARD: "LISTENING" },
  COMPARING: { REVIEWED: "COMMITTING", DISCARD: "LISTENING" },
  COMMITTING: { COMMITTED: "REMEMBERING", DISCARD: "LISTENING" },
  REMEMBERING: { RESUME: "LISTENING", STOP: "IDLE" }
});

/** Explicit research state machine. No autonomous execution or trading.
 * @param {keyof typeof transitions} state
 * @param {string} event
 */
export function nextCognitionState(state, event) {
  if (!Object.hasOwn(transitions, state)) throw new TypeError("Unknown cognition state");
  const next = transitions[state][/** @type {never} */ (event)];
  if (!next) throw new TypeError(`Invalid transition: ${state} / ${event}`);
  return next;
}
