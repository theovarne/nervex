const VALID_CLUSTERS = new Set(["mainnet-beta", "devnet"]);

/**
 * Small JSON-RPC client for the local allowlisted proxy.
 * No fabricated fallback events are returned on RPC failure.
 * @param {{cluster?:"mainnet-beta"|"devnet",endpoint?:string,timeoutMs?:number}} options
 */
export function createSolanaClient(options = {}) {
  const { cluster = "mainnet-beta", endpoint = "/api/solana", timeoutMs = 15000 } = options;
  if (!VALID_CLUSTERS.has(cluster)) throw new TypeError("Unsupported Solana cluster");
  let id = 0;

  /** @param {string} method
   * @param {unknown[]} params
   */
  async function call(method, params = []) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Solana-Cluster": cluster },
        body: JSON.stringify({ jsonrpc: "2.0", id: ++id, method, params }),
        signal: controller.signal
      });
      const payload = await response.json();
      if (!response.ok || payload.error) {
        throw new Error(payload.error?.message || `RPC HTTP ${response.status}`);
      }
      return payload.result;
    } finally {
      clearTimeout(timer);
    }
  }

  const commitment = { commitment: "finalized" };
  return Object.freeze({
    call,
    /** @returns {Promise<number>} */
    async slot() { return call("getSlot", [commitment]); },
    /** @param {number} slot */
    async block(slot) {
      return call("getBlock", [slot, {
        transactionDetails: "signatures", rewards: false,
        maxSupportedTransactionVersion: 1, commitment: "finalized"
      }]);
    },
    /** @param {string} address */
    async balance(address) { return call("getBalance", [address, commitment]); },
    /** @param {string} address */
    async signatures(address) {
      return call("getSignaturesForAddress", [address, { limit: 12, commitment: "finalized" }]);
    },
    /** @param {string} signature */
    async transaction(signature) {
      return call("getTransaction", [signature, {
        encoding: "jsonParsed", commitment: "finalized",
        maxSupportedTransactionVersion: 1
      }]);
    }
  });
}
