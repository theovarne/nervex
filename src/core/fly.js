const weights = Object.freeze({
  activityDelta: 0.25,
  walletContacts: 0.20,
  flow: 0.20,
  recency: 0.20,
  programContacts: 0.15
});

/**
 * Prototype anomaly rank only. Not a scam detector or trading signal.
 * Inputs are normalized [0, 1] observations; missing data stays unavailable.
 * @param {{activityDelta:number,walletContacts:number,flow:number,recency:number,programContacts:number}} inputs
 */
export function scoreFly(inputs) {
  if (!inputs || Object.keys(weights).some((key) => {
    const value = inputs[/** @type {keyof typeof weights} */ (key)];
    return !Number.isFinite(value) || value < 0 || value > 1;
  })) return null;
  const score = Object.entries(weights).reduce((sum, [key, weight]) =>
    sum + inputs[/** @type {keyof typeof weights} */ (key)] * weight, 0);
  return { score, candidate: score >= 0.70, source: "SIMULATED RESEARCH" };
}
