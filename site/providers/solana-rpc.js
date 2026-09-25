const TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const TOKEN_2022_PROGRAM = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
const SYSTEM_PROGRAM = "11111111111111111111111111111111";
const VOTE_PROGRAM = "Vote111111111111111111111111111111111111111";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

const short = (value, left = 7, right = 5) => value ? `${value.slice(0, left)}…${value.slice(-right)}` : "—";
const timeLabel = (seconds) => seconds ? new Date(seconds * 1000).toISOString().replace("T", " ").slice(0, 19) + " UTC" : "UNAVAILABLE";
const tokenLabel = (mint) => mint === USDC_MINT ? "USDC" : short(mint, 5, 4);
const amountLabel = (raw, decimals = 0) => {
  if (raw == null) return "UNAVAILABLE";
  const result = Number(raw) / 10 ** Number(decimals || 0);
  return Number.isFinite(result) ? result.toLocaleString(undefined, { maximumFractionDigits: 6 }) : "UNAVAILABLE";
};

export function createSolanaProvider(config) {
  const cfg = config || {};
  const cluster = cfg.cluster || "mainnet-beta";
  const endpoint = cfg.rpcUrl || "/api/solana";
  const commitment = cfg.commitment || "finalized";
  let sequence = 0;

  async function rpc(method, params = []) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18000);
    try {
      const headers = { "Content-Type": "application/json" };
      if (endpoint.startsWith("/")) headers["X-Solana-Cluster"] = cluster;
      const response = await fetch(endpoint, {
        method: "POST", headers, signal: controller.signal,
        body: JSON.stringify({ jsonrpc: "2.0", id: ++sequence, method, params })
      });
      const payload = await response.json();
      if (!response.ok || payload.error) throw new Error(payload.error?.message || `RPC HTTP ${response.status}`);
      return payload.result;
    } finally {
      clearTimeout(timeout);
    }
  }

  function explorer(kind, id) {
    const path = kind === "slot" ? "block" : kind === "signature" ? "tx" : kind === "mint" || kind === "program" ? "address" : kind;
    return `${cfg.explorerUrl || "https://explorer.solana.com"}/${path}/${encodeURIComponent(id)}${cfg.explorerQuery || ""}`;
  }

  function parseTransaction(result, signature) {
    if (!result?.transaction) return null;
    const message = result.transaction.message || {};
    const instructions = message.instructions || [];
    const inner = (result.meta?.innerInstructions || []).flatMap((group) => group.instructions || []);
    const allInstructions = [...instructions, ...inner];
    const mintCreation = allInstructions.find((item) => /^initializeMint/i.test(item.parsed?.type || "") && [TOKEN_PROGRAM, TOKEN_2022_PROGRAM].includes(item.programId));
    const transfer = allInstructions.find((item) => /transfer|mintTo|burn/i.test(item.parsed?.type || "") && [TOKEN_PROGRAM, TOKEN_2022_PROGRAM].includes(item.programId));
    const accountKeys = (message.accountKeys || []).map((key) => typeof key === "string" ? key : key.pubkey).filter(Boolean);
    const programIds = [...new Set(instructions.map((item) => item.programId).filter(Boolean))];
    const mint = mintCreation?.parsed?.info?.mint || transfer?.parsed?.info?.mint || result.meta?.postTokenBalances?.[0]?.mint || result.meta?.preTokenBalances?.[0]?.mint || "";
    const tokenBalance = [...(result.meta?.postTokenBalances || []), ...(result.meta?.preTokenBalances || [])].find((item) => item.mint === mint);
    const amount = transfer?.parsed?.info?.tokenAmount?.uiAmountString
      || amountLabel(transfer?.parsed?.info?.amount, tokenBalance?.uiTokenAmount?.decimals);
    const mainProgram = programIds.find((program) => ![SYSTEM_PROGRAM, VOTE_PROGRAM, "ComputeBudget111111111111111111111111111111"].includes(program)) || programIds[0] || "";
    return {
      signature: signature || result.transaction.signatures?.[0] || "", slot: result.slot,
      timestamp: timeLabel(result.blockTime), blockTime: result.blockTime,
      status: result.meta?.err ? "FAILED" : "FINALIZED",
      kind: mintCreation ? "FLY CONTACT" : transfer ? "TOKEN VIBRATION" : mainProgram && mainProgram !== VOTE_PROGRAM ? "PROGRAM RESPONSE" : "TRANSACTION",
      type: mintCreation ? "NEW TOKEN MINT" : transfer ? "TOKEN TRANSFER" : "PROGRAM INTERACTION",
      mint, symbol: mint ? tokenLabel(mint) : short(mainProgram),
      amount, from: transfer?.parsed?.info?.source || accountKeys[0] || "",
      to: transfer?.parsed?.info?.destination || "",
      program: mainProgram, programIds, accountKeys, instructionCount: instructions.length,
      tokenProgram: mintCreation?.programId || transfer?.programId || "", source: "LIVE / SOLANA"
    };
  }

  async function latestSlot() { return rpc("getSlot", [{ commitment }]); }

  async function blockSignatures(slot) {
    for (let offset = 0; offset < 5; offset += 1) {
      const target = slot - offset;
      const block = await rpc("getBlock", [target, { transactionDetails: "signatures", rewards: false, maxSupportedTransactionVersion: 1, commitment }]).catch(() => null);
      if (block?.signatures?.length) return { slot: target, signatures: block.signatures, blockTime: block.blockTime };
    }
    throw new Error("RECENT FINALIZED SLOT UNAVAILABLE");
  }

  async function transaction(signature) {
    const result = await rpc("getTransaction", [signature, { encoding: "jsonParsed", commitment, maxSupportedTransactionVersion: 1 }]);
    return parseTransaction(result, signature);
  }

  async function recentEvents() {
    const currentSlot = await latestSlot();
    const block = await blockSignatures(currentSlot);
    const signatures = block.signatures;
    const offsets = [0, 7, 19, 37, 59].map((offset) => signatures[Math.max(0, signatures.length - 1 - offset)]).filter(Boolean);
    const results = await Promise.allSettled(offsets.map(transaction));
    const events = results.filter((item) => item.status === "fulfilled" && item.value).map((item) => item.value);
    return { slot: block.slot, signatureCount: signatures.length, blockTime: block.blockTime, events };
  }

  async function balance(address) {
    const response = await rpc("getBalance", [address, { commitment }]);
    return amountLabel(response?.value, 9);
  }

  async function tokenAccounts(address) {
    const results = await Promise.all([
      rpc("getTokenAccountsByOwner", [address, { programId: TOKEN_PROGRAM }, { encoding: "jsonParsed", commitment }]),
      rpc("getTokenAccountsByOwner", [address, { programId: TOKEN_2022_PROGRAM }, { encoding: "jsonParsed", commitment }])
    ]);
    return results.flatMap((result, group) => (result?.value || []).map((entry) => {
      const info = entry.account?.data?.parsed?.info || {};
      return {
        address: entry.pubkey, mint: info.mint || "", owner: info.owner || address,
        amount: info.tokenAmount?.uiAmountString || "0", decimals: info.tokenAmount?.decimals ?? null,
        programId: group ? TOKEN_2022_PROGRAM : TOKEN_PROGRAM,
        tokenStandard: group ? "TOKEN-2022" : "SPL TOKEN"
      };
    }));
  }

  async function signatures(address, limit = 12) {
    return rpc("getSignaturesForAddress", [address, { limit, commitment }]);
  }

  async function mintInfo(mint) {
    const [account, supply] = await Promise.all([
      rpc("getAccountInfo", [mint, { encoding: "jsonParsed", commitment }]),
      rpc("getTokenSupply", [mint, { commitment }]).catch(() => null)
    ]);
    const value = account?.value;
    if (!value || ![TOKEN_PROGRAM, TOKEN_2022_PROGRAM].includes(value.owner)) return null;
    const info = value.data?.parsed?.info || {};
    return {
      mint, tokenStandard: value.owner === TOKEN_2022_PROGRAM ? "TOKEN-2022" : "SPL TOKEN",
      programId: value.owner, decimals: info.decimals ?? supply?.value?.decimals ?? null,
      supply: supply?.value?.uiAmountString ?? null,
      extensions: Array.isArray(info.extensions) ? info.extensions.map((item) => item.extension || item.type).filter(Boolean) : [],
      source: "LIVE / SOLANA"
    };
  }

  return Object.freeze({ rpc, explorer, latestSlot, blockSignatures, transaction, recentEvents, balance, tokenAccounts, signatures, mintInfo, tokenLabel, short, timeLabel, tokenProgram: TOKEN_PROGRAM, token2022Program: TOKEN_2022_PROGRAM, usdcMint: USDC_MINT });
}
