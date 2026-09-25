export const DATA_SOURCE = Object.freeze({
  SOLANA: "LIVE / SOLANA",
  EXTERNAL: "EXTERNAL MARKET",
  SIMULATED: "SIMULATED RESEARCH"
});

/** @param {string} source */
export function isKnownSource(source) {
  return /** @type {string[]} */ (Object.values(DATA_SOURCE)).includes(source);
}

/** @param {string} source */
export function requireSource(source) {
  if (!isKnownSource(source)) throw new TypeError("Unknown data source");
  return source;
}
