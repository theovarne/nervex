import test from "node:test";
import assert from "node:assert/strict";
import { createSolanaClient } from "../src/solana/rpc.js";

test("RPC client forwards cluster and returns a real-shaped result", async () => {
  const original = globalThis.fetch;
  /** @type {any[]} */
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push([url, options]);
    return { ok: true, json: async () => ({ jsonrpc: "2.0", id: 1, result: 450450754 }) };
  };
  try {
    const client = createSolanaClient({ cluster: "devnet", endpoint: "/api/solana" });
    assert.equal(await client.slot(), 450450754);
    assert.equal(calls[0][1].headers["X-Solana-Cluster"], "devnet");
    assert.equal(JSON.parse(calls[0][1].body).method, "getSlot");
  } finally {
    globalThis.fetch = original;
  }
});

test("RPC failures never become fabricated events", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true, json: async () => ({ error: { message: "rate limited" } })
  });
  try {
    await assert.rejects(createSolanaClient().slot(), /rate limited/);
    assert.throws(() => createSolanaClient({ cluster: "testnet" }), /Unsupported/);
  } finally {
    globalThis.fetch = original;
  }
});
