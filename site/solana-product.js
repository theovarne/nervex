import { createSolanaProvider } from "./providers/solana-rpc.js";
import { discoverSolanaWallets } from "./providers/solana-wallet-standard.js";

const config = window.NERVEX_CONFIG || {};
const provider = createSolanaProvider(config.SOLANA_CONFIG);
const discovery = discoverSolanaWallets();
const state = { wallet: null, account: null, scan: null, feed: null, error: null };
let walletEventsUnsubscribe = null;
const $all = (selector) => [...document.querySelectorAll(selector)];
const set = (selector, value) => $all(selector).forEach((node) => { node.textContent = String(value ?? "UNAVAILABLE"); });
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const shorten = (value) => provider.short(value || "");
const dispatch = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));
const mintPattern = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
function archiveRpcHealth(value) {
  const label = $all("[data-framer-name='Stats'] p").find((node) => node.textContent.trim() === "RPC HEALTH");
  const status = label?.closest("[data-framer-name='Stats']")?.querySelector("p");
  if (status) status.textContent = value;
}
archiveRpcHealth("CHECKING");

function modal(title, body) {
  document.querySelector(".nervex-arc-modal-layer")?.remove();
  const layer = document.createElement("div");
  layer.className = "nervex-arc-modal-layer open";
  layer.innerHTML = `<section class="nervex-arc-modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}"><header><strong>${escapeHtml(title)}</strong><button type="button" data-close aria-label="Close">×</button></header><div class="nervex-arc-modal-body">${body}</div></section>`;
  layer.addEventListener("click", (event) => { if (event.target === layer || event.target.closest("[data-close]")) layer.remove(); });
  document.body.appendChild(layer);
  layer.querySelector("[data-close]")?.focus();
  return layer;
}

function walletChoices() {
  if (state.account) return walletStatus();
  const wallets = discovery.get();
  const body = wallets.length ? `<div class="nervex-wallet-options">${wallets.map((wallet, index) => `<button type="button" class="nervex-wallet-option" data-wallet-index="${index}">${wallet.icon ? `<img src="${escapeHtml(wallet.icon)}" alt="" width="28" height="28">` : ""}<b>${escapeHtml(wallet.name || "Solana wallet")}</b><span>DETECTED</span></button>`).join("")}</div>` : `<p>NO SOLANA WALLET DETECTED.</p><p>Install a Wallet Standard-compatible Solana wallet, then reload this page.</p>`;
  const layer = modal("CONNECT SOLANA WALLET", body);
  layer.querySelectorAll("[data-wallet-index]").forEach((button) => button.addEventListener("click", async () => {
    const wallet = wallets[Number(button.dataset.walletIndex)];
    try {
      const result = await wallet.features["standard:connect"].connect();
      const account = result.accounts?.find((item) => item.chains?.some((chain) => chain.startsWith("solana:"))) || result.accounts?.[0];
      if (!account?.address) throw new Error("WALLET DID NOT RETURN A SOLANA ACCOUNT");
      const expectedChain = config.CLUSTER === "devnet" ? "solana:devnet" : "solana:mainnet";
      if (account.chains?.length && !account.chains.includes(expectedChain)) throw new Error(`WALLET ACCOUNT DOES NOT SUPPORT ${config.CLUSTER}`);
      state.wallet = wallet; state.account = account;
      if (typeof walletEventsUnsubscribe === "function") walletEventsUnsubscribe();
      walletEventsUnsubscribe = wallet.features["standard:events"]?.on?.("change", ({ accounts }) => {
        const next = accounts?.find((item) => item.chains?.includes(expectedChain));
        state.account = next || null;
        state.scan = null;
        renderWallet();
        dispatch("nervex:wallet-state", { connected: Boolean(next), address: next?.address || null });
      }) || null;
      layer.remove(); renderWallet();
      dispatch("nervex:wallet-state", { connected: true, address: account.address, cluster: config.CLUSTER });
      record("CONNECT", { address: account.address, wallet: wallet.name });
    } catch (error) { modal("WALLET CONNECTION", `<p>${escapeHtml(error.message)}</p>`); }
  }));
}

function walletStatus() {
  if (!state.account) return walletChoices();
  const address = state.account.address;
  const layer = modal("NERVEX // SOLANA WALLET", `<p>ADDRESS<br>${escapeHtml(address)}</p><p>NETWORK: ${escapeHtml(config.CLUSTER || "mainnet-beta")}</p><p>SOL BALANCE: ${escapeHtml(state.scan?.balance ?? "UNAVAILABLE")}</p><p>TOKEN ACCOUNTS: ${escapeHtml(state.scan?.tokenAccounts?.length ?? "UNAVAILABLE")}</p><p>WEB IDENTITY: YOU NODE</p><p>LAST ACTIVITY: ${escapeHtml(state.scan?.signatures?.[0]?.blockTime ? provider.timeLabel(state.scan.signatures[0].blockTime) : "UNAVAILABLE")}</p><div class="nervex-arc-actions"><button type="button" data-copy>COPY ADDRESS</button><button type="button" data-explorer>VIEW EXPLORER</button><button type="button" data-scan>SCAN MY WEB</button><button type="button" data-disconnect>DISCONNECT</button></div>`);
  layer.querySelector("[data-copy]").addEventListener("click", async () => { await navigator.clipboard.writeText(address); layer.querySelector("[data-copy]").textContent = "COPIED"; });
  layer.querySelector("[data-explorer]").addEventListener("click", () => window.open(provider.explorer("account", address), "_blank", "noopener,noreferrer"));
  layer.querySelector("[data-scan]").addEventListener("click", () => { layer.remove(); scan(); });
  layer.querySelector("[data-disconnect]").addEventListener("click", async () => {
    try { await state.wallet?.features?.["standard:disconnect"]?.disconnect(); } catch { /* Local disconnect remains available. */ }
    state.wallet = null; state.account = null; state.scan = null;
    if (typeof walletEventsUnsubscribe === "function") walletEventsUnsubscribe();
    walletEventsUnsubscribe = null;
    layer.remove(); renderWallet();
    dispatch("nervex:wallet-state", { connected: false });
    record("DISCONNECT", { address });
  });
}

function renderWallet() {
  const address = state.account?.address;
  set("[data-wallet-address]", address ? shorten(address) : "NOT CONNECTED");
  set("[data-wallet-network]", address ? config.CLUSTER || "mainnet-beta" : "—");
  set("[data-wallet-source]", state.wallet?.name || "LOCAL WALLET");
  set("[data-arc-connect]", address ? "WALLET STATUS" : "CONNECT WALLET");
  set("[data-wallet-balance]", state.scan?.balance != null ? `${state.scan.balance} SOL` : "—");
  set("[data-wallet-token-accounts]", state.scan ? state.scan.tokenAccounts.length : "UNAVAILABLE");
  set("[data-wallet-tension]", state.scan?.tension?.label || "UNAVAILABLE");
  set("[data-wallet-activity]", state.scan?.signatures?.[0]?.blockTime ? provider.timeLabel(state.scan.signatures[0].blockTime) : "UNAVAILABLE");
  (window.nervexConnectButtons || []).forEach((node) => { node.textContent = address ? `● ${shorten(address)}` : "● CONNECT"; });
  $all("[data-arc-scan]").forEach((node) => { node.disabled = !address; });
  $all("[data-arc-strike]").forEach((node) => { node.disabled = !address || !state.scan || !state.wallet?.features?.["solana:signMessage"]; });
}

async function scan() {
  if (!state.account) return walletChoices();
  const address = state.account.address;
  set("[data-wallet-tension]", "SCANNING…");
  try {
    const [balance, tokenAccounts, signatures] = await Promise.all([provider.balance(address), provider.tokenAccounts(address), provider.signatures(address, 12)]);
    const transactions = (await Promise.allSettled(signatures.slice(0, 4).map((item) => provider.transaction(item.signature)))).filter((item) => item.status === "fulfilled" && item.value).map((item) => item.value);
    const mints = [...new Set(tokenAccounts.map((item) => item.mint).filter(Boolean))];
    const programIds = [...new Set(transactions.flatMap((item) => item.programIds || []))];
    const counterparties = [...new Set(transactions.flatMap((item) => item.accountKeys || []).filter((item) => item !== address && !programIds.includes(item)))].slice(0, 12);
    const activity = Math.min(signatures.length / 12, 1);
    const flow = Math.min(transactions.filter((item) => item.mint).length / 4, 1);
    const interactions = Math.min(programIds.length / 8, 1);
    const recent = signatures[0]?.blockTime ? Math.max(0, 1 - (Date.now() / 1000 - signatures[0].blockTime) / 604800) : 0;
    const value = Math.round((.3 * activity + .25 * flow + .25 * interactions + .2 * recent) * 100);
    const tension = { value, label: `${value}%` };
    state.scan = { address, balance, tokenAccounts, signatures, transactions, mints, programIds, counterparties, tension, cluster: config.CLUSTER, source: "LIVE / SOLANA" };
    renderWallet();
    dispatch("nervex:web-data", state.scan);
    dispatch("nervex:global-nodes", { nodes: [...mints.map((mint) => ({ name: provider.tokenLabel(mint), address: mint, kind: "MINT" })), ...programIds.map((id) => ({ name: shorten(id), address: id, kind: "PROGRAM" }))] });
    record("SCAN", { address, balance, tokenAccounts: tokenAccounts.length, signatures: signatures.length, tension: value });
    modal("PERSONAL WEB // LIVE / SOLANA", `<p>${escapeHtml(shorten(address))} · ${escapeHtml(balance)} SOL</p><p>${tokenAccounts.length} TOKEN ACCOUNTS · ${signatures.length} RECENT SIGNATURES · ${programIds.length} PROGRAMS</p><p>WEB TENSION ${value}% · DERIVED FROM OBSERVED RPC DATA</p>`);
  } catch (error) { state.scan = null; state.error = error.message; renderWallet(); modal("SCAN UNAVAILABLE", `<p>${escapeHtml(error.message)}</p><p>NO CHAIN DATA HAS BEEN FABRICATED.</p>`); }
}

const dbName = "nervex-solana-v1";
function archive() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore("records", { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function record(type, detail) {
  try {
    const db = await archive();
    const entry = { id: crypto.randomUUID(), type, detail, timestamp: new Date().toISOString(), cluster: config.CLUSTER };
    await new Promise((resolve, reject) => {
      const transaction = db.transaction("records", "readwrite");
      transaction.objectStore("records").put(entry);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
    db.close();
    await renderDragline();
  } catch { /* The product remains usable when local storage is denied. */ }
}
async function records() {
  try {
    const db = await archive();
    const values = await new Promise((resolve, reject) => { const request = db.transaction("records", "readonly").objectStore("records").getAll(); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    db.close();
    return values.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  } catch { return []; }
}
async function renderDragline() {
  const values = await records();
  const html = values.length ? values.slice(0, 12).map((item) => `<p><b>${escapeHtml(item.type)}</b> ${escapeHtml(item.timestamp)} · ${escapeHtml(item.cluster)}</p>`).join("") : "<p>NO LOCAL ACTIONS YET.</p>";
  $all("[data-dragline-preview]").forEach((node) => { node.innerHTML = html; });
}
async function dragline() {
  const values = await records();
  modal("DRAGLINE // LOCAL MEMORY", values.length ? values.slice(0, 50).map((item) => `<article><b>${escapeHtml(item.type)}</b> <small>${escapeHtml(item.timestamp)}</small><pre>${escapeHtml(JSON.stringify(item.detail, null, 2))}</pre></article>`).join("") : "<p>NO LOCAL ACTIONS YET.</p>");
}

const bytesToHex = (bytes) => [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
async function strike() {
  if (!state.account || !state.scan) return;
  const signer = state.wallet?.features?.["solana:signMessage"];
  if (!signer) return modal("SIGNED STRIKE UNAVAILABLE", "<p>THIS WALLET DOES NOT SUPPORT SOLANA MESSAGE SIGNING.</p>");
  const latest = state.scan.signatures[0]?.signature || "NONE";
  const dataHash = bytesToHex(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify({ address: state.account.address, signature: latest, tension: state.scan.tension.value })))));
  const payload = { protocol: "NERVEX SIGNED STRIKE V1", cluster: config.CLUSTER, wallet: state.account.address, targetMint: config.TOKEN_MINT || "TBA", state: "OBSERVED", confidence: state.scan.tension.value, horizon: "LOCAL RESEARCH", timestamp: new Date().toISOString(), dataHash };
  const message = new TextEncoder().encode(JSON.stringify(payload));
  try {
    const signed = await signer.signMessage({ account: state.account, message });
    const signature = signed?.[0]?.signature;
    if (!signature) throw new Error("WALLET RETURNED NO SIGNATURE");
    let verified = false;
    try { const key = await crypto.subtle.importKey("raw", state.account.publicKey, "Ed25519", false, ["verify"]); verified = await crypto.subtle.verify("Ed25519", key, signature, message); }
    catch { verified = false; }
    const receipt = { payload, signature: bytesToHex(signature), verified, type: "OFFCHAIN MESSAGE SIGNATURE", transaction: null };
    await record("SIGNED STRIKE", receipt);
    modal("SIGNED STRIKE // RECEIPT", `<p>${verified ? "SIGNATURE VERIFIED LOCALLY" : "SIGNATURE NOT VERIFIED IN THIS BROWSER"}</p><p>OFFCHAIN MESSAGE · NO TRANSACTION · NO GAS</p><pre>${escapeHtml(JSON.stringify(receipt, null, 2))}</pre>`);
  } catch (error) { modal("SIGNED STRIKE UNAVAILABLE", `<p>${escapeHtml(error.message)}</p><p>NO SIGNATURE WAS SAVED.</p>`); }
}

async function inspectMint(mint = config.TOKEN_MINT) {
  if (!mint || !mintPattern.test(mint)) return modal("NERVEX TOKEN MINT", "<p>MINT: TBA</p><p>NO SOLANA MINT ADDRESS HAS BEEN CONFIGURED OR VERIFIED.</p>");
  const layer = modal("SPL TOKEN NODE", "<p>READING MINT ACCOUNT FROM SOLANA RPC…</p>");
  try {
    const info = await provider.mintInfo(mint);
    if (!info) throw new Error("NO VERIFIED SPL TOKEN MINT FOUND AT THIS ADDRESS");
    layer.querySelector(".nervex-arc-modal-body").innerHTML = `<p>LIVE / SOLANA · ${escapeHtml(config.CLUSTER)}</p><p>MINT: ${escapeHtml(mint)}</p><p>STANDARD: ${escapeHtml(info.tokenStandard)}</p><p>DECIMALS: ${escapeHtml(info.decimals)}</p><p>SUPPLY: ${escapeHtml(info.supply)}</p><p>EXTENSIONS: ${escapeHtml(info.extensions.join(", ") || "NONE OBSERVED")}</p><p><a href="${escapeHtml(provider.explorer("mint", mint))}" target="_blank" rel="noopener noreferrer">OPEN SOLANA EXPLORER ↗</a></p><button type="button" data-copy-mint>COPY MINT</button>`;
    layer.querySelector("[data-copy-mint]")?.addEventListener("click", () => navigator.clipboard.writeText(mint));
  } catch (error) { layer.querySelector(".nervex-arc-modal-body").innerHTML = `<p>UNAVAILABLE: ${escapeHtml(error.message)}</p>`; }
}

function feedItem(event) {
  const href = provider.explorer("signature", event.signature);
  const transfer = event.mint ? ` · MINT ${shorten(event.mint)} · ${escapeHtml(event.amount)} ${escapeHtml(event.symbol)} · ${shorten(event.from)} → ${shorten(event.to)}` : "";
  return `<article class="nervex-arc-feed-row"><time>${escapeHtml(event.timestamp)}</time><b>[${escapeHtml(event.kind)}]</b><span><a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(shorten(event.signature))} ↗</a></span><small>SLOT ${escapeHtml(event.slot)} · PROGRAM ${escapeHtml(shorten(event.program))} · ${escapeHtml(event.instructionCount)} INSTRUCTIONS · ${escapeHtml(event.accountKeys?.length || 0)} ACCOUNTS${transfer} · ${escapeHtml(event.status)} · LIVE / SOLANA</small></article>`;
}
async function refreshFeed() {
  const began = performance.now();
  try {
    const result = await provider.recentEvents();
    state.feed = result;
    state.error = null;
    archiveRpcHealth("LIVE");
    set("[data-arc-health]", "LIVE");
    set("[data-arc-network]", `${config.CLUSTER || "mainnet-beta"} / SOLANA`);
    set("[data-arc-block]", `SLOT ${result.slot.toLocaleString()}`);
    set("[data-arc-latency]", `RPC ${Math.round(performance.now() - began)} MS`);
    const body = result.events.length ? result.events.map(feedItem).join("") : "<p>FINALIZED SLOT AVAILABLE; TRANSACTION DETAILS TEMPORARILY UNAVAILABLE.</p>";
    $all("[data-arc-feed]").forEach((node) => { node.innerHTML = body; });
    result.events.forEach((event) => dispatch("nervex:solana-signal", event));
    dispatch("nervex:global-nodes", { nodes: result.events.flatMap((event) => [event.mint ? { name: provider.tokenLabel(event.mint), address: event.mint, kind: "MINT" } : null, event.program ? { name: shorten(event.program), address: event.program, kind: "PROGRAM" } : null]).filter(Boolean) });
    dispatch("nervex:solana-slot", { slot: result.slot, source: "LIVE / SOLANA" });
  } catch (error) {
    state.error = error.message;
    archiveRpcHealth("DEGRADED");
    set("[data-arc-health]", "DEGRADED");
    set("[data-arc-latency]", "RPC UNAVAILABLE");
    $all("[data-arc-feed]").forEach((node) => { node.innerHTML = `<p>LIVE / SOLANA UNAVAILABLE: ${escapeHtml(error.message)}</p>`; });
  }
}

async function pluck(detail) {
  const began = performance.now();
  try {
    const slot = await provider.latestSlot();
    let signature = state.feed?.events?.[0]?.signature || "";
    let balance = null;
    let transaction = null;
    if (detail?.scope === "personal" && state.account) {
      const [recent, solBalance] = await Promise.all([provider.signatures(state.account.address, 1), provider.balance(state.account.address)]);
      signature = recent[0]?.signature || "";
      balance = solBalance;
      if (signature) transaction = await provider.transaction(signature).catch(() => null);
    }
    const response = { ok: true, source: "LIVE / SOLANA", slot, signature, balance, activity: transaction?.kind || (signature ? "SIGNATURE OBSERVED" : "UNAVAILABLE"), program: transaction?.program || "", latency: Math.round(performance.now() - began), timestamp: new Date().toISOString() };
    dispatch("nervex:pluck-result", response);
    record("WEB PLUCK", { ...response, thread: detail?.thread || "" });
  } catch (error) { dispatch("nervex:pluck-result", { ok: false, source: "LIVE / SOLANA", error: error.message }); }
}

$all("[data-arc-connect]").forEach((node) => node.addEventListener("click", walletChoices));
$all("[data-arc-scan]").forEach((node) => node.addEventListener("click", scan));
$all("[data-arc-strike]").forEach((node) => node.addEventListener("click", strike));
$all("[data-arc-dragline]").forEach((node) => node.addEventListener("click", dragline));
const navLabels = $all("p,span").filter((node) => /^(●\s*)?Available$/i.test(node.textContent.trim()));
const navButtons = [];
navLabels.forEach((label) => { const button = document.createElement("button"); button.type = "button"; button.className = "nervex-nav-connect"; button.textContent = "● CONNECT"; button.addEventListener("click", walletChoices); label.replaceWith(button); navButtons.push(button); });
if (!navButtons.length) { const button = document.createElement("button"); button.type = "button"; button.className = "nervex-nav-connect floating"; button.textContent = "● CONNECT"; button.addEventListener("click", walletChoices); document.body.appendChild(button); navButtons.push(button); }
window.nervexConnectButtons = navButtons;
$all("[data-token-mint]").forEach((node) => node.addEventListener("click", () => inspectMint()));
const mintHeading = $all("h5").find((node) => /^Mint:\s/i.test(node.textContent.trim()));
if (mintHeading) {
  mintHeading.tabIndex = 0;
  mintHeading.setAttribute("role", "button");
  mintHeading.setAttribute("aria-label", "Inspect NERVEX Solana Mint");
  mintHeading.addEventListener("click", () => inspectMint());
  mintHeading.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); inspectMint(); } });
}
window.addEventListener("nervex:request-connect", walletChoices);
window.addEventListener("nervex:request-scan", scan);
window.addEventListener("nervex:pluck-request", (event) => pluck(event.detail));
discovery.subscribe(() => { if (document.querySelector(".nervex-arc-modal-layer")) walletChoices(); });
renderWallet(); renderDragline(); refreshFeed();
window.setInterval(refreshFeed, 15000);
window.NervexSolana = Object.freeze({ connect: walletChoices, scan, strike, dragline, inspectMint, provider, state, network: config.SOLANA_CONFIG });
