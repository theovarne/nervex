import test from "node:test";
import assert from "node:assert/strict";
import { discoverSolanaWallets } from "../src/solana/wallet-standard.js";

test("Wallet Standard discovery accepts Solana wallets only", () => {
  const host = new EventTarget();
  const discovery = discoverSolanaWallets(host);
  const wallet = { name: "Test Wallet", chains: ["solana:mainnet"], features: { "standard:connect": { connect() {} } } };
  let updates = 0;
  discovery.subscribe(() => updates++);
  let unregister;
  host.dispatchEvent(new CustomEvent("wallet-standard:register-wallet", {
    detail: (api) => {
      unregister = api.register(wallet, { name: "Wrong Chain", chains: ["eip155:1"], features: { "standard:connect": {} } });
    }
  }));
  assert.deepEqual(discovery.get(), [wallet]);
  assert.equal(updates, 1);
  unregister();
  assert.deepEqual(discovery.get(), []);
});
