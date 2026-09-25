import test from "node:test";
import assert from "node:assert/strict";
import { computeTension } from "../src/core/tension.js";
import { nextCognitionState } from "../src/core/cognition.js";
import { scoreFly } from "../src/core/fly.js";
import { shortenAddress, looksLikeSolanaAddress } from "../src/core/address.js";
import { DATA_SOURCE, requireSource } from "../src/core/source.js";

test("tension weights observed normalized inputs", () => {
  assert.equal(computeTension({ activity: 1, flow: 0, diversity: 0, recency: 0 })?.percent, 30);
  assert.equal(computeTension({ activity: 1, flow: 1, diversity: 1, recency: 1 })?.percent, 100);
  assert.equal(computeTension({ activity: 0, flow: 0, diversity: 0, recency: 0 })?.percent, 0);
});

test("tension stays unavailable when an input is missing or invalid", () => {
  assert.equal(computeTension({ activity: 1, flow: 1, diversity: 1 }) , null);
  assert.equal(computeTension({ activity: 2, flow: 0, diversity: 0, recency: 0 }), null);
});

test("cognition is an explicit transition table", () => {
  assert.equal(nextCognitionState("IDLE", "START"), "LISTENING");
  assert.equal(nextCognitionState("LISTENING", "SIGNAL"), "LOCALIZING");
  assert.throws(() => nextCognitionState("IDLE", "COMMITTED"), /Invalid transition/);
});

test("fly score never claims a live source", () => {
  const fly = scoreFly({
    activityDelta: 1, walletContacts: 1, flow: 1, recency: 1, programContacts: 1
  });
  assert.equal(fly?.candidate, true);
  assert.equal(fly?.source, DATA_SOURCE.SIMULATED);
  assert.equal(scoreFly({ activityDelta: 1 }), null);
});

test("Solana address helpers have explicit limits", () => {
  const address = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
  assert.equal(looksLikeSolanaAddress(address), true);
  assert.equal(looksLikeSolanaAddress("not-an-address"), false);
  assert.equal(shortenAddress(address), "EPjFWdd…TDt1v");
  assert.equal(shortenAddress("short"), "short");
});

test("unknown source labels are rejected", () => {
  assert.equal(requireSource(DATA_SOURCE.SOLANA), "LIVE / SOLANA");
  assert.throws(() => requireSource("LIVE / AI PREDICTION"), /Unknown data source/);
});
