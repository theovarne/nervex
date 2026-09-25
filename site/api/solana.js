"use strict";

const allowedMethods = new Set([
  "getSlot", "getBlock", "getTransaction", "getBalance", "getTokenAccountsByOwner",
  "getSignaturesForAddress", "getAccountInfo", "getTokenSupply", "getMultipleAccounts"
]);
const publicEndpoints = Object.freeze({
  "mainnet-beta": "https://api.mainnet-beta.solana.com",
  devnet: "https://api.devnet.solana.com"
});

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "POST required" });
  let request;
  try { request = typeof req.body === "string" ? JSON.parse(req.body) : req.body; }
  catch { return res.status(400).json({ error: "Invalid JSON body" }); }
  const cluster = req.headers["x-solana-cluster"] || "mainnet-beta";
  if (!Object.hasOwn(publicEndpoints, cluster) || !request || Array.isArray(request) || !allowedMethods.has(request.method) || !Array.isArray(request.params) || request.params.length > 4 || JSON.stringify(request).length > 16384) {
    return res.status(400).json({ error: "Unsupported Solana RPC request" });
  }
  const upstream = cluster === "mainnet-beta" ? process.env.SOLANA_MAINNET_RPC_URL || publicEndpoints[cluster] : process.env.SOLANA_DEVNET_RPC_URL || publicEndpoints[cluster];
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(upstream, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: request.id || 1, method: request.method, params: request.params }),
      signal: controller.signal
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(502).json({ error: `Solana RPC unavailable: ${error.message}` });
  } finally {
    clearTimeout(timeout);
  }
};
