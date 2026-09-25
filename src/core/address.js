const base58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

/** Syntactic check only; does not decode or verify onchain existence.
 * @param {string} address
 */
export function looksLikeSolanaAddress(address) {
  return typeof address === "string" && base58.test(address);
}

/** @param {string} address
 * @param {number} left
 * @param {number} right
 */
export function shortenAddress(address, left = 7, right = 5) {
  if (!address) return "—";
  if (address.length <= left + right + 1) return address;
  return `${address.slice(0, left)}…${address.slice(-right)}`;
}
