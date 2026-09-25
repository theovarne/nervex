import { createSolanaClient } from "../src/solana/rpc.js";
import { discoverSolanaWallets } from "../src/solana/wallet-standard.js";
import { computeTension } from "../src/core/tension.js";
import { scoreFly } from "../src/core/fly.js";
import { nextCognitionState } from "../src/core/cognition.js";
import { shortenAddress } from "../src/core/address.js";

const cluster = new URLSearchParams(location.search).get("cluster") === "devnet" ? "devnet" : "mainnet-beta";
const client = createSolanaClient({ cluster });
const walletRegistry = discoverSolanaWallets();
const text = (id, value) => { document.getElementById(id).textContent = String(value); };
text("network", cluster === "devnet" ? "Devnet" : "Mainnet Beta");

async function refresh() {
  text("provider-state", "CHECKING");
  text("slot", "CHECKING");
  text("signature", "UNAVAILABLE");
  try {
    const slot = await client.slot();
    text("slot", slot.toLocaleString());
    text("provider-state", "LIVE / SOLANA");
    try {
      const block = await client.block(slot);
      if (block?.signatures?.length) text("signature", shortenAddress(block.signatures[0], 12, 10));
    } catch {
      text("signature", "UNAVAILABLE");
    }
  } catch {
    text("slot", "UNAVAILABLE");
    text("provider-state", "RPC UNAVAILABLE");
  }
}
document.getElementById("refresh").addEventListener("click", refresh);
refresh();

document.getElementById("simulate").addEventListener("click", () => {
  let state = "IDLE";
  for (const event of ["START", "SIGNAL", "LOCATED", "CLASSIFIED"]) {
    state = nextCognitionState(state, event);
  }
  const tension = computeTension({
    activity: 0.8, flow: 0.6, diversity: 0.5, recency: 0.7
  });
  const fly = scoreFly({
    activityDelta: 0.9, walletContacts: 0.7, flow: 0.6,
    recency: 0.8, programContacts: 0.5
  });
  text("cognition", `${state} / SIMULATED`);
  text("tension", tension ? `${tension.percent}% / SIMULATED` : "UNAVAILABLE");
  text("fly", fly?.candidate ? "YES / SIMULATED" : "NO / SIMULATED");
});

function renderWallets() {
  const wallets = walletRegistry.get();
  const select = document.getElementById("wallet-select");
  const previous = select.value;
  select.replaceChildren(new Option("SELECT WALLET", ""));
  wallets.forEach((wallet, index) => select.add(new Option(wallet.name || "Solana wallet", String(index))));
  select.value = previous && Number(previous) < wallets.length ? previous : "";
  text("wallet-count", wallets.length);
}
walletRegistry.subscribe(renderWallets);
renderWallets();
document.getElementById("connect").addEventListener("click", async () => {
  const selected = document.getElementById("wallet-select").value;
  if (!selected) return text("wallet-name", "SELECT A WALLET FIRST");
  const wallet = walletRegistry.get()[Number(selected)];
  if (!wallet) return text("wallet-name", "WALLET UNAVAILABLE");
  try {
    const result = await wallet.features["standard:connect"].connect();
    const account = result.accounts?.find((item) => item.chains?.some((chain) => chain.startsWith("solana:")));
    if (!account?.address) throw new Error("No Solana address");
    text("wallet-name", wallet.name || "Solana wallet");
    text("wallet-address", shortenAddress(account.address));
  } catch {
    text("wallet-name", "CONNECTION DECLINED OR UNAVAILABLE");
    text("wallet-address", "NOT CONNECTED");
  }
});
