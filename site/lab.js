(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const projectXUrl = window.NERVEX_CONFIG?.PROJECT_X_URL || "";

  $$('a[data-project-x]').forEach((link) => {
    if (!projectXUrl) return;
    link.href = projectXUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", "NERVEX on X");
  });

  const rows = (items) => `<ul class="nervex-terminal-list">${items.map(([key, value, tone = ""]) => `<li><span>${key}</span><b class="${tone}">${value}</b></li>`).join("")}</ul>`;

  const modals = { "neural-source": { path: "> nervex://research/morphology-sources", title: "SCIENTIFIC MORPHOLOGY SOURCES", body: `<div class="nervex-article"><p><b>BIOLOGICAL REFERENCE</b><br><i>Uloborus diversus</i> 3D brain / synganglion atlas · Artiushin / Corver / Gordus et al. · eLife 2026.</p><p><a class="nervex-modal-link" href="https://doi.org/10.7554/eLife.107732.3" target="_blank" rel="noreferrer">VIEW eLIFE ARTICLE →</a><br><a class="nervex-modal-link" href="https://api.brainimagelibrary.org/web/view?bildid=ace-owl-gum" target="_blank" rel="noreferrer">VIEW BRAIN IMAGE LIBRARY →</a><br><a class="nervex-modal-link" href="https://github.com/GordusLab/Artiushin-elastix-eLife" target="_blank" rel="noreferrer">VIEW ALIGNMENT PIPELINE →</a></p><p><b>SOMA MORPHOLOGY</b><br>AGELENIDAE — FUNNEL WEAVERS by Lynnie.T (sp-id-er) · CC BY 4.0 · archived through Objaverse.</p><p><a class="nervex-modal-link" href="https://sketchfab.com/3d-models/agelenidae-funnel-weavers-1fbc223eb2df477687868565fa592249" target="_blank" rel="noreferrer">VIEW BODY SOURCE →</a><br><a class="nervex-modal-link" href="https://objaverse.allenai.org/docs/objaverse-1.0/" target="_blank" rel="noreferrer">VIEW OBJAVERSE ARCHIVE →</a></p><p><b>COMPUTATIONAL STACK</b><br>Eight-leg joint hierarchy references SpiderBot_DeepRL (Apache-2.0). Particle and constraint design references verlet-js Spiderweb (MIT).</p><p><a class="nervex-modal-link" href="https://github.com/arijit-dasgupta/SpiderBot_DeepRL" target="_blank" rel="noreferrer">VIEW RIG REFERENCE →</a><br><a class="nervex-modal-link" href="https://github.com/subprotocol/verlet-js" target="_blank" rel="noreferrer">VIEW PHYSICS REFERENCE →</a></p><p class="nervex-note">COMPARATIVE VISUALIZATION // BODY AND CNS COME FROM DIFFERENT SPIDER TAXA. SOLANA OBSERVATIONS ARE LABELED LIVE; GLOBAL RESEARCH RELATIONS ARE LABELED SIMULATED RESEARCH.</p></div>` } };

  const solanaPapers = [
    ["thesis", "THE NERVEX THESIS", "A spider's web extends perception beyond its body. NERVEX uses that architecture to organize Solana activity: accounts form nodes, relationships form threads and transactions create vibrations. The model is an interpretive layer, not a claim that a blockchain thinks or predicts markets."],
    ["cognition", "WHY A SPIDER", "A spider senses position and intensity through changes in silk tension. The central hub does not require a complete picture of every event. NERVEX borrows this principle: local signals matter through their position, propagation and relationship to the rest of the web. The biological model is inspiration; digital signal classification remains computational."],
    ["anatomy", "EXTENDED COGNITION", "The soma, central nervous system and web are distinct surfaces. Eight channels describe different kinds of input. The Spinneret creates and repairs links. The visual specimen and neural atlas are comparative references from different taxa, while market channels are NERVEX abstractions. No scientific source is presented as validation of a financial model."],
    ["solana-web", "THE SOLANA WEB", "Solana stores mutable state in accounts. Programs act on accounts through instructions grouped into transactions. NERVEX maps an account to a node, a co-occurrence or transfer to a thread and a finalized transaction to a vibration. The mapping preserves signatures, slots and program addresses so a viewer can inspect provenance."],
    ["accounts", "ACCOUNTS AS NODES", "Wallets, token accounts, mints and program accounts are different account types. A wallet connection identifies only the public address chosen by the user. A personal scan reads SOL balance, classic SPL token accounts, Token-2022 accounts and recent signatures. It does not request private keys or infer ownership of unrelated addresses."],
    ["programs", "PROGRAMS AS ACTIVE STRUCTURES", "Solana programs define execution logic. A transaction invokes one or more programs through instructions, and those program IDs become active structures in the NERVEX web. The inspector only marks a program as live after a verified transaction has been read; global schematic nodes remain SIMULATED RESEARCH."],
    ["transactions", "TRANSACTIONS AS VIBRATIONS", "A finalized signature identifies an observed transaction. NERVEX reads its slot, status, instructions, account keys and token balance changes when available. The live feed links to Solana Explorer. Missing RPC data is shown as UNAVAILABLE, never filled with an invented event."],
    ["spl-tokens", "SPL TOKEN NODES", "SPL Token mints identify fungible or non-fungible token classes; token accounts hold balances for a wallet. NERVEX reads the mint account to show its actual program owner, decimals and supply. A project's token mint remains TBA until a valid Solana mint address is provided and verified. An EVM contract address is not a Solana mint."],
    ["token-2022", "TOKEN-2022", "Token-2022 extends the SPL token model with optional mint and account extensions. NERVEX queries both token programs separately. It shows only extensions present in the returned mint account; transfer fees, metadata pointers or other capabilities are never assumed from a token symbol."],
  ];
  solanaPapers.forEach(([key, title, copy]) => { modals[key] = { path: `> nervex://research/${key}`, title, body: `<div class="nervex-article"><p>${copy}</p><p class="nervex-note">SOURCE POLICY // LIVE / SOLANA, EXTERNAL MARKET AND SIMULATED RESEARCH ARE DISTINCT.</p></div>` }; });
  [
    ["capture", "THE CAPTURE SPIRAL", "Most short-lived market signals fade. The outer capture spiral detects fast contact, then separates observations from noise. A signal can be classified by origin, recency, network context and propagation, but none of these features is proof of future price movement."],
    ["flies", "FLIES AND FAST SIGNALS", "A fly is a temporary signal, not a person, wallet or holder. Fast token launches, liquidity changes and social attention can be modeled as contacts with the outer web. External market feeds are labeled separately from Solana RPC observations; unavailable sources do not become synthetic live data."],
    ["web-pluck", "WEB PLUCK", "Plucking a thread requests a fresh Solana slot. On a personal web it can also query the connected address's most recent signature. The result is displayed with its source and measured request latency. A failed RPC request produces an explicit UNAVAILABLE state."],
    ["strike", "STRIKE PROTOCOL", "A Signed Strike is a canonical observation message containing a wallet address, target mint or TBA, observed state, confidence, horizon, timestamp and data hash. A compatible Solana wallet signs it off-chain. The browser attempts local Ed25519 verification and stores the receipt locally. It is not a trade or on-chain transaction."],
    ["memory", "DRAGLINE MEMORY", "Connect, scan, web pluck and Signed Strike events can be kept in this browser's IndexedDB archive. Transaction signatures link to Solana Explorer; off-chain message signatures have no transaction hash. Clearing site data removes this local memory. No server-side private key or seed phrase storage exists."],
    ["scopes", "GLOBAL VS PERSONAL WEB", "The global WEB–SOMA diagram begins as an explicitly simulated category map. Verified mint and program contacts can replace category labels only after Solana RPC evidence is observed. A connected wallet's personal web is derived from its own public account, token accounts, signatures, programs and counterparties."],
    ["sources", "DATA SOURCES", "LIVE / SOLANA means a response from the selected Solana cluster, including slot, signature and account provenance. EXTERNAL MARKET means a separate off-chain provider. SIMULATED RESEARCH means an illustrative model state. UNAVAILABLE means a required source did not respond. These labels are not interchangeable."],
  ].forEach(([key, title, copy]) => { modals[key] = { path: `> nervex://research/${key}`, title, body: `<div class="nervex-article"><p>${copy}</p><p class="nervex-note">NOT FINANCIAL ADVICE // NO AUTOMATED TRADE EXECUTION.</p></div>` }; });
  const manual = [
    ["sol-connect", "CONNECT A SOLANA WALLET", "Wallet Standard-compatible wallets register themselves with the browser. NERVEX lists only detected wallets and requests access to a public Solana account. The wallet keeps signing authority."],
    ["sol-scan", "SCAN YOUR PERSONAL WEB", "The scanner reads SOL balance, SPL and Token-2022 accounts, recent signatures and selected transaction details. Web tension combines observed activity (30%), token flow (25%), program interactions (25%) and recency (20%)."],
    ["sol-vibrations", "LIVE VIBRATIONS", "The feed reads finalized Solana slots and transaction signatures, then displays parsed program and token activity. Each signature links to Solana Explorer. A degraded RPC is labeled UNAVAILABLE."],
    ["sol-tokens", "SPL TOKEN NODES", "A token node is resolved from an actual mint account. Program owner, decimals, supply and mint address are read from Solana RPC. NERVEX Mint remains TBA until configured."],
    ["sol-extensions", "TOKEN-2022 EXTENSIONS", "The classic SPL Token program and Token-2022 are queried independently. Only extensions returned by the mint account are displayed."],
    ["sol-strike", "SIGNED STRIKE V1", "A wallet signs an off-chain UTF-8 message with solana:signMessage. The browser attempts Ed25519 verification and saves the receipt locally. It does not send a transaction or incur gas."],
    ["sol-dragline", "DRAGLINE MEMORY", "Local IndexedDB stores action receipts on this device. It is not a public chain history and disappears when site data is cleared."],
    ["sol-sources", "SOURCE + NETWORK POLICY", "Mainnet-beta is the default. Devnet can be selected at build time. LIVE / SOLANA, EXTERNAL MARKET, SIMULATED RESEARCH and UNAVAILABLE are kept separate."],
  ];
  manual.forEach(([key, title, copy]) => { modals[key] = { path: `> nervex://manual/${key}`, title, body: `<div class="nervex-article"><p>${copy}</p><p class="nervex-note">PRIVATE KEYS AND SEED PHRASES ARE NEVER REQUESTED.</p></div>` }; });
  Object.assign(modals, {
    topology: modals["solana-web"],
    signals: modals.transactions,
    "web-status": { path: "> nervex://archive/web-status", title: "NERVEX / WEB STATUS", body: rows([["HUB", "ONLINE", "ok"], ["NETWORK", "SOLANA"], ["GLOBAL NODES", "SIMULATED RESEARCH"], ["LIVE SIGNALS", "SEE SENSORY BUS"], ["PERSONAL WEB", "CONNECT + SCAN"]]) },
    listening: { path: "> nervex://archive/sensory-state", title: "SENSORY STATE", body: rows([["PRICE", "EXTERNAL MARKET"], ["VOLUME", "EXTERNAL MARKET"], ["LIQUIDITY", "EXTERNAL MARKET"], ["TOKEN FLOW", "LIVE / SOLANA"], ["WALLET ACTIVITY", "LIVE / SOLANA"], ["PROGRAM ACTIVITY", "LIVE / SOLANA"], ["MARKET ATTENTION", "SIMULATED RESEARCH"], ["NARRATIVE", "SIMULATED RESEARCH"]]) },
    nodes: { path: "> nervex://archive/nodes", title: "WEB NODES", body: rows([["SOL / USDC", "SOLANA CONTEXT"], ["SPL TOKEN", "MINT-VERIFIED ONLY"], ["TOKEN-2022", "EXTENSIONS VERIFIED ONLY"], ["WALLETS / PROGRAMS", "OBSERVED RPC CONTACTS"], ["GLOBAL DIAGRAM", "SIMULATED RESEARCH"]]) },
    vibrations: { path: "> nervex://archive/vibrations", title: "RECENT VIBRATIONS", body: "<p>Open the live Solana Sensory Bus for finalized slots and signature-linked transactions. No synthetic vibration is presented as live.</p>" },
    organism: { path: "> nervex://organism/status", title: "NERVEX / ORGANISM STATUS", body: rows([["STATUS", "LISTENING", "ok"], ["SPECIES", "SYNTHETIC ARACHNID"], ["ENVIRONMENT", "SOLANA + EXTERNAL MARKET"], ["MORPHOLOGY", "BIOLOGICAL REFERENCE"], ["COGNITION", "COMPUTATIONAL MODEL"]]) },
    "fly-analysis": { path: "> nervex://tracks/fly-analysis", title: "FLY CLASSIFICATION", body: rows([["NODE", "NEW MINT"], ["SOURCE", "SIMULATED RESEARCH"], ["LIQUIDITY", "UNAVAILABLE"], ["WALLET ACTIVITY", "UNAVAILABLE"], ["STATE", "UNCOMMITTED"]]) },
    "thread-map": { path: "> nervex://tracks/thread-map", title: "THREAD MAP", body: rows([["SOL ↔ USDC", "TOKEN FLOW MODEL"], ["WALLET ↔ PROGRAM", "INSTRUCTION PATH"], ["MINT ↔ TOKEN ACCOUNT", "SPL OWNERSHIP"], ["PROVENANCE", "SIMULATED RESEARCH"]]) },
    "stock-nodes": modals["spl-tokens"],
    "dividend-detail": modals["token-2022"],
    divergence: { path: "> nervex://tracks/classification", title: "SIGNAL CLASSIFICATION", body: rows([["OBSERVATION", "SIMULATED RESEARCH"], ["STATE", "UNCOMMITTED"], ["RESULT", "UNAVAILABLE"], ["CLAIM", "NO PREDICTION"]]) },
    "strike-record": modals.strike,
    dragline: modals.memory,
    damage: { path: "> nervex://tracks/web-repair", title: "WEB DAMAGE / REPAIR", body: rows([["THREAD", "SOL ↔ TOKEN ACCOUNT"], ["STATE", "SIMULATED RESEARCH"], ["REPAIR", "MODEL ONLY"]]) },
    molt: { path: "> nervex://tracks/molting-history", title: "MOLTING HISTORY", body: rows([["MOLT 001", "FIRST WEB"], ["MOLT 002", "SOLANA SENSING"], ["MOLT 003", "SPL TOKEN LAYER"], ["MOLT 004", "CAPTURE SPIRAL // RESEARCH"], ["MOLT 005", "PROGRAM SENSING"], ["MOLT 006", "PERSONAL WEB"], ["MOLT 007", "SIGNED STRIKE"], ["MOLT 008", "ONCHAIN MEMORY // FUTURE"], ["MOLT 009", "ACTIONS / BLINKS // FUTURE"]]) },
    pluck: modals["web-pluck"]
  });

  const layer = document.createElement("div");
  layer.className = "nervex-modal-layer";
  layer.setAttribute("aria-hidden", "true");
  layer.innerHTML = `<section class="nervex-modal" role="dialog" aria-modal="true" aria-labelledby="nervex-modal-title"><header class="nervex-modal-head"><span id="nervex-modal-path">&gt; nervex://status</span><button class="nervex-modal-close" type="button" aria-label="Close modal">[X]</button></header><div class="nervex-modal-body"><h2 id="nervex-modal-title"></h2><div id="nervex-modal-content"></div></div></section>`;
  document.body.appendChild(layer);

  let returnFocus = null;
  function openModal(key, trigger) {
    let modal = modals[key];
    if (!modal) return;
    if (key === "web-status") {
      const runtime = window.NervexSolana?.state;
      modal = { ...modal, body: rows([["RPC HEALTH", runtime?.error ? "DEGRADED" : runtime?.feed ? "LIVE" : "CHECKING", runtime?.error ? "warn" : "ok"], ["NETWORK", "SOLANA"], ["CLUSTER", window.NERVEX_CONFIG?.CLUSTER || "UNAVAILABLE"], ["CURRENT SLOT", runtime?.error ? "UNAVAILABLE" : runtime?.feed?.slot?.toLocaleString() || "UNAVAILABLE"], ["SIGNATURES IN SLOT", runtime?.error ? "UNAVAILABLE" : runtime?.feed?.signatureCount ?? "UNAVAILABLE"], ["SOURCE", runtime?.error ? "UNAVAILABLE" : runtime?.feed ? "LIVE / SOLANA" : "UNAVAILABLE"]]) };
    }
    if (key === "listening") {
      const live = Boolean(window.NervexSolana?.state.feed && !window.NervexSolana?.state.error);
      modal = { ...modal, body: rows([["PRICE", "UNAVAILABLE / EXTERNAL SOURCE"], ["VOLUME", "UNAVAILABLE / EXTERNAL SOURCE"], ["LIQUIDITY", "UNAVAILABLE / EXTERNAL SOURCE"], ["TOKEN FLOW", live ? "LIVE / SOLANA SOURCE" : "UNAVAILABLE"], ["WALLET ACTIVITY", live ? "LIVE / SOLANA SOURCE" : "UNAVAILABLE"], ["PROGRAM ACTIVITY", live ? "LIVE / SOLANA SOURCE" : "UNAVAILABLE"], ["MARKET ATTENTION", "SIMULATED RESEARCH"], ["NARRATIVE", "SIMULATED RESEARCH"]]) };
    }
    returnFocus = trigger || document.activeElement;
    $("#nervex-modal-path").textContent = modal.path;
    $("#nervex-modal-title").textContent = modal.title;
    $("#nervex-modal-content").innerHTML = modal.body;
    layer.classList.add("open");
    layer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    $(".nervex-modal-close").focus();
  }
  function closeModal() {
    layer.classList.remove("open");
    layer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    returnFocus?.focus?.();
  }
  window.NervexLab = Object.freeze({ openModal });
  $(".nervex-modal-close").addEventListener("click", closeModal);
  layer.addEventListener("click", (event) => { if (event.target === layer) closeModal(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && layer.classList.contains("open")) closeModal(); });

  $$('[data-lab-modal]').forEach((trigger) => trigger.addEventListener("click", () => openModal(trigger.dataset.labModal, trigger)));

  const path = location.pathname.replace(/\/+$/, "") || "/";
  if (path === "/") {
    const heroBackdrop = $(".nervex-hero-backdrop");
    const heroVideo = $(".nervex-hero-video");
    const heroStop = $('[data-framer-name="Featured Project"]');
    const syncHeroBackdrop = () => {
      if (!heroBackdrop || !heroStop) return;
      const headerHeight = $("header")?.offsetHeight || 54;
      const stopTop = heroStop.getBoundingClientRect().top + window.scrollY;
      heroBackdrop.style.top = `${headerHeight}px`;
      heroBackdrop.style.height = `${Math.max(760, stopTop - headerHeight + 18)}px`;
    };
    requestAnimationFrame(syncHeroBackdrop);
    window.addEventListener("load", syncHeroBackdrop, {once:true});
    window.addEventListener("resize", syncHeroBackdrop, {passive:true});
    if ("ResizeObserver" in window && heroStop) new ResizeObserver(syncHeroBackdrop).observe(heroStop.parentElement || heroStop);
    if (heroVideo) {
      heroVideo.muted = true;
      heroVideo.addEventListener("error", () => heroBackdrop?.classList.add("video-unavailable"), {once:true});
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) heroVideo.play().catch(() => heroBackdrop?.classList.add("video-unavailable"));
    }
    const exact = (text) => $$('p,h1,h2,h3,h4,h5,span').find((node) => node.textContent.trim() === text);
    [["RPC HEALTH","web-status"],["CHAIN NETWORK","organism"],["NETWORK ASSET","nodes"],["DATA SOURCES","listening"]].forEach(([label,key]) => {
      const card = exact(label)?.closest('[data-framer-name="Stats"]');
      if (!card) return;
      card.classList.add("nervex-trigger"); card.tabIndex = 0; card.setAttribute("role","button"); card.title = "SIMULATED RESEARCH STATE";
      card.addEventListener("click", () => openModal(key, card));
      card.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") openModal(key, card); });
    });
    const organism = $(".framer-138zbyg");
    if (organism) { organism.tabIndex = 0; organism.setAttribute("role","button"); organism.setAttribute("aria-label","Open NERVEX organism status"); organism.addEventListener("click", () => openModal("organism", organism)); organism.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") openModal("organism", organism); }); }
    const solanaTag = exact("Solana Native");
    if (solanaTag) { const extension = document.createElement("span"); extension.className = "nervex-tag-extension"; extension.textContent = "SPL TOKENS / TOKEN-2022"; solanaTag.closest("div")?.parentElement?.insertAdjacentElement("afterend", extension); }
  }

  const reviewKeys = path === "/docs" ? ["thesis","cognition","anatomy","topology","capture"] : ["thesis","anatomy","signals"];
  $$('p').filter((node) => node.textContent.trim() === "Review").forEach((label, index) => {
    const link = label.closest("a");
    if (!link || !reviewKeys[index]) return;
    link.classList.add("nervex-review-trigger");
    link.removeAttribute("target");
    link.setAttribute("href", `#${reviewKeys[index]}`);
    link.addEventListener("click", (event) => { event.preventDefault(); openModal(reviewKeys[index], link); });
  });

  $$(".nervex-pluck-line").forEach((line) => line.addEventListener("click", () => {
    line.classList.remove("plucked");
    void line.offsetWidth;
    line.classList.add("plucked");
    window.setTimeout(() => openModal("pluck", line), 520);
  }));
})();
