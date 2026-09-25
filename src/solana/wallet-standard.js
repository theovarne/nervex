/**
 * Discovers wallets through the Wallet Standard registration handshake.
 * This adapter does not request a connection or signature by itself.
 * @param {Window} host
 */
export function discoverSolanaWallets(host = window) {
  /** @type {Set<any>} */
  const wallets = new Set();
  /** @type {Set<() => void>} */
  const listeners = new Set();
  const notify = () => listeners.forEach((listener) => listener());
  const api = Object.freeze({
    /** @param {...any} entries */
    register(...entries) {
      for (const wallet of entries) {
        if (wallet?.features?.["standard:connect"] &&
            Array.isArray(wallet.chains) &&
            wallet.chains.some((/** @type {string} */ chain) => chain.startsWith("solana:"))) {
          wallets.add(wallet);
        }
      }
      notify();
      return () => {
        entries.forEach((wallet) => wallets.delete(wallet));
        notify();
      };
    }
  });
  host.addEventListener("wallet-standard:register-wallet", (event) => {
    const registration = /** @type {CustomEvent} */ (event).detail;
    if (typeof registration === "function") registration(api);
  });
  host.dispatchEvent(new CustomEvent("wallet-standard:app-ready", { detail: api }));
  return Object.freeze({
    get: () => [...wallets],
    /** @param {() => void} listener */
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  });
}
