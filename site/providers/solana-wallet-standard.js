// Wallet Standard registration protocol. Wallets provide their own name, icon,
// account and supported features; the website never guesses a wallet provider.
const registered = new Set();
const listeners = new Set();
let initialized = false;

const notify = () => listeners.forEach((listener) => listener());
const register = (...wallets) => {
  wallets.forEach((wallet) => {
    if (!wallet?.features?.["standard:connect"] || !Array.isArray(wallet.chains) || !wallet.chains.some((chain) => chain.startsWith("solana:"))) return;
    registered.add(wallet);
  });
  notify();
  return () => { wallets.forEach((wallet) => registered.delete(wallet)); notify(); };
};

export function discoverSolanaWallets() {
  if (!initialized) {
    initialized = true;
    const api = Object.freeze({ register });
    window.addEventListener("wallet-standard:register-wallet", (event) => {
      if (typeof event.detail === "function") event.detail(api);
    });
    window.dispatchEvent(new CustomEvent("wallet-standard:app-ready", { detail: api }));
  }
  return Object.freeze({
    get: () => [...registered],
    subscribe: (listener) => { listeners.add(listener); return () => listeners.delete(listener); }
  });
}
