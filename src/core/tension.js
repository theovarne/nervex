export const TENSION_WEIGHTS = Object.freeze({
  activity: 0.30,
  flow: 0.25,
  diversity: 0.25,
  recency: 0.20
});

/**
 * Every input must be an observed, normalized number in [0, 1].
 * Missing input returns null rather than a fabricated zero.
 * Tension is an attention heuristic, not a forecast.
 * @param {{activity:number,flow:number,diversity:number,recency:number}} factors
 * @returns {{score:number, percent:number, factors:typeof factors}|null}
 */
export function computeTension(factors) {
  if (!factors || Object.keys(TENSION_WEIGHTS).some((key) => {
    const value = factors[/** @type {keyof typeof TENSION_WEIGHTS} */ (key)];
    return !Number.isFinite(value) || value < 0 || value > 1;
  })) return null;
  const score = Object.entries(TENSION_WEIGHTS).reduce((sum, [key, weight]) =>
    sum + factors[/** @type {keyof typeof TENSION_WEIGHTS} */ (key)] * weight, 0);
  return { score, percent: Math.round(score * 100), factors: { ...factors } };
}
