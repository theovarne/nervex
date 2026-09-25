import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/meshopt_decoder.mjs";

const canvas = document.getElementById("nervex-soma-canvas");
if (canvas) {
  const section = canvas.closest(".nervex-soma-section");
  const wrap = canvas.closest(".nervex-soma-canvas-wrap");
  const rowsHost = section.querySelector(".nervex-soma-inspector-rows");
  const inspectorTitle = section.querySelector(".nervex-soma-inspector-id strong");
  const inspectorSubtitle = section.querySelector(".nervex-soma-inspector-id span");
  const selection = section.querySelector(".nervex-soma-selection");
  const nodeLayer = section.querySelector(".nervex-soma-node-layer");
  const tooltip = section.querySelector(".nervex-soma-tooltip");
  const loaderNode = section.querySelector(".nervex-soma-loader");
  const loaderLabel = loaderNode.querySelector("b");
  const inspector = section.querySelector(".nervex-soma-inspector");
  const inspectorLive = inspector.querySelector("header span:last-child");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const channels = [
    "PRICE",
    "VOLUME",
    "LIQUIDITY",
    "TOKEN FLOW",
    "WALLET ACTIVITY",
    "PROGRAM ACTIVITY",
    "MARKET ATTENTION",
    "NARRATIVE"
  ];
  const globalMarketNames = ["SOL", "USDC", "SPL TOKEN", "TOKEN-2022", "WALLET", "PROGRAM", "DEX", "NEW MINT"];
  const marketNames = [...globalMarketNames];
  const layerOpacity = {
    all: { body: 0.28, cns: 0.86, pathway: 0.42, spinneret: 0.5, web: 0.34, node: 0.84, rig: 0 },
    soma: { body: 0.72, cns: 0.03, pathway: 0.02, spinneret: 0.12, web: 0.03, node: 0.08, rig: 0 },
    cns: { body: 0.16, cns: 1, pathway: 0.74, spinneret: 0.3, web: 0.06, node: 0.12, rig: 0 },
    web: { body: 0.12, cns: 0.12, pathway: 0.08, spinneret: 0.45, web: 0.8, node: 1, rig: 0 },
    signal: { body: 0.2, cns: 0.64, pathway: 0.42, spinneret: 0.5, web: 0.58, node: 0.94, rig: 0 },
    rig: { body: 0.13, cns: 0.04, pathway: 0.08, spinneret: 0.08, web: 0.04, node: 0.08, rig: 0.94 }
  };

  const inspectorPresets = {
    all: {
      title: "CENTRAL HUB",
      subtitle: "EXTENDED COGNITION CORE",
      rows: [["STATE", "LISTENING", "ok"], ["COGNITION", "EXTENDED"], ["NETWORK", "SOLANA"], ["CURRENT SLOT", "UNAVAILABLE"], ["WEB LOAD", "71.4% // SIMULATED", "hot"], ["ACTIVE CHANNELS", "8 / 8"], ["CURRENT MODE", "SIGNAL DISCRIMINATION"]]
    },
    cns: {
      title: "CENTRAL SYNGANGLION",
      subtitle: "BIOLOGICAL REFERENCE",
      rows: [["TYPE", "BIOLOGICAL REFERENCE"], ["STATE", "PROCESSING", "hot"], ["NETWORK", "SOLANA"], ["CURRENT INPUT", "TOKEN FLOW"], ["CURRENT SLOT", "UNAVAILABLE"], ["WEB LOAD", "71.4% // SIMULATED", "hot"], ["REFERENCE", "ULOBORUS DIVERSUS"]]
    },
    abdomen: {
      title: "SPINNERET ENGINE",
      subtitle: "POSTERIOR SOMATIC REGION",
      rows: [["STATE", "ACTIVE", "ok"], ["SILK OUTPUT", "0.82", "hot"], ["NEW THREADS", "03"], ["BROKEN THREADS", "01"], ["REPAIR QUEUE", "01"], ["LAST THREAD", "SPL TOKEN → NODE_018"]]
    },
    soma: {
      title: "NERVEX SOMA",
      subtitle: "AGELENIDAE ARCHIVED MORPHOLOGY",
      rows: [["BODY STATE", "STABLE", "ok"], ["SPECIMEN CLASS", "SOURCE-DERIVED ARACHNID"], ["LEG COUNT", "08"], ["SPINNERETS", "ACTIVE", "hot"], ["SURFACE STATE", "SEMI-TRANSLUCENT"]]
    },
    web: {
      title: "WEB TOPOLOGY",
      subtitle: "EXTERNAL SENSORY SURFACE",
      rows: [["RADIAL THREADS", "16"], ["CAPTURE THREADS", "09"], ["ACTIVE NODES", "08 / 08", "ok"], ["ANCHOR THREADS", "STABLE"], ["CURRENT TENSION", "0.83", "hot"]]
    },
    signal: {
      title: "SIGNAL PROPAGATION",
      subtitle: "SOL → WEB → LEG 07 → SYNGANGLION",
      rows: [["STATE", "LISTENING", "hot"], ["ORIGIN", "SOL"], ["THREAD", "T-017"], ["LEG CHANNEL", "MARKET ATTENTION"], ["LATENCY", "SIMULATED"], ["CONFIDENCE", "SIMULATED"]]
    },
    rig: {
      title: "8-LEG JOINT HIERARCHY",
      subtitle: "COMPUTATIONAL RIG REFERENCE",
      rows: [["SOURCE LOGIC", "SPIDERBOT_DEEPRL / APACHE-2.0"], ["CHAINS", "08", "ok"], ["JOINTS / LEG", "COXA / FEMUR / TIBIA"], ["VISUAL BODY", "BIOLOGICAL GLB"], ["ROBOT SURFACE", "NOT USED"], ["MODE", "RESEARCH ONLY", "hot"]]
    }
  };

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  } catch (error) {
    const fallback = document.createElement("div");
    fallback.className = "nervex-soma-fallback";
    fallback.textContent = "WEBGL CONTEXT UNAVAILABLE // STATE INSPECTOR REMAINS ACTIVE";
    wrap.appendChild(fallback);
  }

  if (renderer) {
    renderer.setClearColor(0x070a0c, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.98;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070a0c, 0.034);
    const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 40);
    camera.position.set(0, 0, 12);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.enablePan = true;
    controls.minDistance = 6;
    controls.maxDistance = 16;
    controls.rotateSpeed = 0.62;
    controls.zoomSpeed = 0.72;
    controls.panSpeed = 0.48;
    let autoRotateEnabled = !reduceMotion;
    controls.autoRotate = autoRotateEnabled;
    controls.autoRotateSpeed = 0.34;
    controls.minPolarAngle = 0.28;
    controls.maxPolarAngle = Math.PI - 0.28;
    controls.maxTargetRadius = 1.7;
    controls.target.set(0, 0.03, 0);
    controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
    controls.mouseButtons.MIDDLE = THREE.MOUSE.DOLLY;
    controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;

    scene.add(new THREE.AmbientLight(0x66808a, 1.35));
    const keyLight = new THREE.DirectionalLight(0xb4d0d7, 1.4);
    keyLight.position.set(-2.5, 3.5, 7);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xc65d35, 0.42);
    rimLight.position.set(4, -3, 2);
    scene.add(rimLight);

    const specimenGroup = new THREE.Group();
    const cnsGroup = new THREE.Group();
    const pathwayGroup = new THREE.Group();
    const spinneretGroup = new THREE.Group();
    const rigGroup = new THREE.Group();
    const webGroup = new THREE.Group();
    const nodeGroup = new THREE.Group();
    const signalGroup = new THREE.Group();
    scene.add(webGroup, nodeGroup, specimenGroup, cnsGroup, pathwayGroup, spinneretGroup, rigGroup, signalGroup);

    const trackedMaterials = new Set();
    function trackMaterial(material, layer, opacity) {
      material.transparent = true;
      material.opacity = opacity;
      material.userData.layer = layer;
      material.userData.currentOpacity = opacity;
      material.userData.targetOpacity = opacity;
      trackedMaterials.add(material);
      return material;
    }

    const bodyMaterial = trackMaterial(new THREE.MeshPhysicalMaterial({
      color: 0x8398a0,
      emissive: 0x203038,
      emissiveIntensity: 0.18,
      roughness: 0.72,
      metalness: 0.02,
      clearcoat: 0.08,
      clearcoatRoughness: 0.82,
      side: THREE.DoubleSide,
      depthWrite: false
    }), "body", layerOpacity.all.body);
    const cnsMaterial = trackMaterial(new THREE.MeshStandardMaterial({
      color: 0xd06035,
      emissive: 0x74260f,
      emissiveIntensity: 0.74,
      roughness: 0.82,
      metalness: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: false
    }), "cns", layerOpacity.all.cns);

    const clickTargets = [];
    const hoverTargets = [];
    const bodyMeshes = [];
    const cnsMeshes = [];
    const pathwayRecords = [];
    const threadRecords = [];
    const marketNodes = [];
    const nodeLabels = [];

    const legEndpoints = [
      new THREE.Vector3(-2.08, 1.45, 0.02),
      new THREE.Vector3(-2.22, 0.56, 0.0),
      new THREE.Vector3(-2.24, -0.35, 0.01),
      new THREE.Vector3(-2.02, -1.28, 0.03),
      new THREE.Vector3(2.08, 1.45, 0.02),
      new THREE.Vector3(2.22, 0.56, 0.0),
      new THREE.Vector3(2.24, -0.35, 0.01),
      new THREE.Vector3(2.02, -1.28, 0.03)
    ];

    function makeTube(points, radius, material, segments = 52, radial = 5) {
      const curve = new THREE.CatmullRomCurve3(points, false, "centripetal", 0.35);
      const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, segments, radius, radial, false), material);
      mesh.userData.curve = curve;
      return mesh;
    }

    function buildPathways() {
      legEndpoints.forEach((tip, index) => {
        const side = index < 4 ? -1 : 1;
        const row = index % 4;
        const origin = new THREE.Vector3(side * (0.18 + row * 0.035), 0.53 - row * 0.22, 0.14);
        const knee = new THREE.Vector3(side * (0.78 + row * 0.08), THREE.MathUtils.lerp(origin.y, tip.y, 0.44), 0.1 + (row % 2) * 0.025);
        const material = trackMaterial(new THREE.MeshBasicMaterial({ color: 0xa84825, depthWrite: false, depthTest: false }), "pathway", layerOpacity.all.pathway);
        const path = makeTube([new THREE.Vector3(0, 0.5, 0.12), origin, knee, tip], 0.018, material, 46, 5);
        path.renderOrder = 7;
        path.userData = { kind: "leg", index, channel: channels[index], priority: 8, material, curve: path.userData.curve };
        pathwayGroup.add(path);
        pathwayRecords.push(path);
        clickTargets.push(path);
        hoverTargets.push(path);
      });

      const spinneretMaterial = trackMaterial(new THREE.MeshBasicMaterial({ color: 0xb84e28, depthWrite: false, depthTest: false }), "spinneret", layerOpacity.all.spinneret);
      const spinneretPath = makeTube([
        new THREE.Vector3(0, 0.32, 0.1),
        new THREE.Vector3(0, -0.32, 0.08),
        new THREE.Vector3(0, -1.2, -0.04),
        new THREE.Vector3(0, -2.05, -0.42)
      ], 0.022, spinneretMaterial, 64, 6);
      spinneretPath.renderOrder = 7;
      spinneretPath.userData = { kind: "spinneret", priority: 8, material: spinneretMaterial, curve: spinneretPath.userData.curve };
      spinneretGroup.add(spinneretPath);
      clickTargets.push(spinneretPath);
      hoverTargets.push(spinneretPath);

      const spinneretNode = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), spinneretMaterial);
      spinneretNode.position.set(0, -1.18, -0.03);
      spinneretNode.renderOrder = 8;
      spinneretNode.userData = { kind: "spinneret", priority: 9, material: spinneretMaterial };
      spinneretGroup.add(spinneretNode);
      clickTargets.push(spinneretNode);
    }

    function buildRig() {
      const lineMaterial = trackMaterial(new THREE.LineBasicMaterial({ color: 0xd8a27e, depthWrite: false, depthTest: false }), "rig", 0);
      const jointMaterial = trackMaterial(new THREE.MeshBasicMaterial({ color: 0xf08a5d, depthWrite: false, depthTest: false }), "rig", 0);
      legEndpoints.forEach((tip, index) => {
        const side = index < 4 ? -1 : 1;
        const row = index % 4;
        const origin = new THREE.Vector3(side * 0.24, 0.74 - row * 0.34, 0.16);
        const coxa = new THREE.Vector3(side * (0.58 + row * 0.025), origin.y + (1.5 - row) * 0.08, 0.11);
        const femur = new THREE.Vector3(side * (1.18 + row * 0.09), THREE.MathUtils.lerp(origin.y, tip.y, 0.3), 0.03 + (row % 2) * 0.08);
        const tibia = new THREE.Vector3(side * (1.72 + row * 0.11), THREE.MathUtils.lerp(origin.y, tip.y, 0.66), -0.05 + (row % 2) * 0.1);
        const points = [origin, coxa, femur, tibia, tip];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial);
        line.renderOrder = 10;
        line.userData = { kind: "leg", index, channel: channels[index], priority: 9, material: lineMaterial, rig: true };
        rigGroup.add(line);
        clickTargets.push(line);
        hoverTargets.push(line);
        points.slice(0, -1).forEach((point, jointIndex) => {
          const joint = new THREE.Mesh(new THREE.SphereGeometry(0.034 + jointIndex * 0.005, 8, 6), jointMaterial);
          joint.position.copy(point);
          joint.renderOrder = 11;
          joint.userData = { kind: "leg", index, channel: channels[index], priority: 10, material: jointMaterial, rig: true };
          rigGroup.add(joint);
          clickTargets.push(joint);
          hoverTargets.push(joint);
        });
      });
    }

    const WEB_RADIALS = 16;
    const WEB_RINGS = 10;
    const WEB_INNER_RADIUS = 1.56;
    const WEB_OUTER_RADIUS = 4.18;
    const webParticles = [];
    const webConstraints = [];

    const particleIndex = (radial, ring) => ring * WEB_RADIALS + (radial + WEB_RADIALS) % WEB_RADIALS;

    function webPoint(angle, radius, radial, ring) {
      const normalized = (radius - WEB_INNER_RADIUS) / (WEB_OUTER_RADIUS - WEB_INNER_RADIUS);
      const irregular = 1 + 0.022 * Math.sin(radial * 1.91 + ring * 0.83) + 0.014 * Math.cos(radial * 0.71 - ring);
      return new THREE.Vector3(
        Math.cos(angle) * radius * irregular,
        Math.sin(angle) * radius * irregular,
        -0.72 + 0.28 * Math.sin(angle * 1.65 + ring * 0.17) * (0.36 + normalized * 0.64) + 0.12 * Math.cos(angle * 3.1 - ring * 0.44)
      );
    }

    function addConstraint(a, b, stiffness = 0.88) {
      const rest = webParticles[a].position.distanceTo(webParticles[b].position);
      webConstraints.push({ a, b, rest, stiffness });
    }

    function makeDynamicThread(indices, name, connection, radialIndex = null) {
      const points = indices.map((index) => webParticles[index].position);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = trackMaterial(new THREE.LineBasicMaterial({ color: 0x78959d, depthWrite: false, transparent: true }), "web", layerOpacity.all.web);
      const line = new THREE.Line(geometry, material);
      line.renderOrder = 1;
      line.userData = { kind: "thread", name, connection, radialIndex, priority: 4, material, particleIndices: indices };
      webGroup.add(line);
      threadRecords.push(line);
      clickTargets.push(line);
      hoverTargets.push(line);
      return line;
    }

    function buildWeb() {
      for (let ring = 0; ring < WEB_RINGS; ring += 1) {
        const radius = THREE.MathUtils.lerp(WEB_INNER_RADIUS, WEB_OUTER_RADIUS, ring / (WEB_RINGS - 1));
        for (let radial = 0; radial < WEB_RADIALS; radial += 1) {
          const angle = -Math.PI / 2 + radial * Math.PI * 2 / WEB_RADIALS + 0.013 * Math.sin(radial * 2.7 + ring * 0.15);
          const base = webPoint(angle, radius, radial, ring);
          webParticles.push({ position: base.clone(), previous: base.clone(), base: base.clone(), pinned: ring === WEB_RINGS - 1 });
        }
      }

      for (let radial = 0; radial < WEB_RADIALS; radial += 1) {
        const indices = [];
        for (let ring = 0; ring < WEB_RINGS; ring += 1) {
          indices.push(particleIndex(radial, ring));
          if (ring) addConstraint(particleIndex(radial, ring - 1), particleIndex(radial, ring), 0.94);
        }
        makeDynamicThread(indices, `T-${String(radial + 11).padStart(3, "0")}`, `${marketNames[radial % 8]} ↔ ${marketNames[(radial + 1) % 8]}`, radial);
      }

      for (let ring = 0; ring < WEB_RINGS; ring += 1) {
        const indices = [];
        for (let radial = 0; radial < WEB_RADIALS; radial += 1) {
          indices.push(particleIndex(radial, ring));
          addConstraint(particleIndex(radial, ring), particleIndex(radial + 1, ring), ring === WEB_RINGS - 1 ? 1 : 0.82);
        }
        indices.push(indices[0]);
        makeDynamicThread(indices, `C-${String(ring + 1).padStart(3, "0")}`, `${marketNames[ring % 8]} ↔ ${marketNames[(ring + 3) % 8]}`);
      }

      for (let i = 0; i < 8; i += 1) {
        const radial = i * 2;
        const anchorIndex = particleIndex(radial, WEB_RINGS - 1);
        const material = trackMaterial(new THREE.MeshBasicMaterial({ color: 0xc75a31, depthWrite: false, depthTest: false }), "node", layerOpacity.all.node);
        const node = new THREE.Mesh(new THREE.IcosahedronGeometry(i === 2 ? 0.1 : 0.074, 1), material);
        node.position.copy(webParticles[anchorIndex].position);
        node.renderOrder = 6;
        node.userData = { kind: "node", index: i, radial, anchorIndex, name: marketNames[i], priority: 10, material };
        nodeGroup.add(node);
        marketNodes.push(node);
        clickTargets.push(node);
        hoverTargets.push(node);
        const label = document.createElement("span");
        label.className = "nervex-soma-node-label";
        label.textContent = marketNames[i];
        nodeLayer.appendChild(label);
        nodeLabels.push(label);
      }
    }

    function applyParticleImpulse(index, strength = 1) {
      const particle = webParticles[index];
      if (!particle || particle.pinned) return;
      const direction = particle.position.clone().normalize().multiplyScalar(0.055 * strength);
      direction.z += 0.2 * strength;
      particle.previous.sub(direction);
    }

    function applyThreadImpulse(thread, strength = 1) {
      const indices = thread?.userData?.particleIndices || [];
      if (!indices.length) return;
      const movable = indices.filter((index) => !webParticles[index].pinned);
      const center = movable[Math.floor(movable.length / 2)];
      applyParticleImpulse(center, strength);
      const position = movable.indexOf(center);
      if (position > 0) applyParticleImpulse(movable[position - 1], strength * 0.55);
      if (position + 1 < movable.length) applyParticleImpulse(movable[position + 1], strength * 0.55);
    }

    buildWeb();
    buildPathways();
    buildRig();

    const pulseMaterial = new THREE.MeshBasicMaterial({ color: 0xff7a43, transparent: true, opacity: 0, depthTest: false, depthWrite: false });
    const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.052, 12, 8), pulseMaterial);
    pulse.renderOrder = 12;
    signalGroup.add(pulse);
    const hubPulseMaterial = new THREE.MeshBasicMaterial({ color: 0xef6c3a, transparent: true, opacity: 0, depthTest: false, depthWrite: false });
    const hubPulse = new THREE.Mesh(new THREE.SphereGeometry(0.19, 18, 12), hubPulseMaterial);
    hubPulse.position.set(0, 0.53, 0.1);
    hubPulse.renderOrder = 11;
    signalGroup.add(hubPulse);

    let signalCurve = new THREE.CatmullRomCurve3([
      marketNodes[3].position.clone(),
      marketNodes[3].position.clone().multiplyScalar(0.72),
      new THREE.Vector3(-1.52, 1.5, -0.22),
      legEndpoints[6].clone(),
      new THREE.Vector3(0.46, 0.34, 0.09),
      new THREE.Vector3(0, 0.53, 0.1)
    ], false, "centripetal", 0.25);

    const raycaster = new THREE.Raycaster();
    raycaster.params.Line.threshold = 0.075;
    const pointer = new THREE.Vector2(9, 9);
    let pointerEvent = null;
    let hoverDirty = false;
    let hovered = null;
    let selected = { kind: "cns" };
    const uiState = { selectedLayer: "all", selectedBodyPart: "cns", selectedNode: null, selectedThread: null, currentSignal: null };
    let layer = "all";
    let webScope = "global";
    let personalData = null;
    let walletConnected = false;
    let pendingPluck = null;
    let inView = true;
    let cameraTween = null;
    let interactionStarted = { x: 0, y: 0 };
    let signalStart = performance.now();
    let signalCycle = 0;
    let signalStage = -1;
    let signalNodeIndex = 3;
    let signalLegIndex = 6;
    let signalIsLive = false;
    let latestArcSignal = null;
    let observedGlobalNodeCount = 0;
    let inspectorRevision = 0;
    let selectedNodeIndex = -1;
    let controlResumeAt = 0;
    const loadingStarted = performance.now();
    const signalThread = threadRecords.find((thread) => thread.userData.radialIndex === 6);

    function configureSignalPath(nodeIndex, legIndex) {
      const source = marketNodes[nodeIndex].position.clone();
      signalCurve = new THREE.CatmullRomCurve3([
        source,
        source.clone().multiplyScalar(0.73),
        webParticles[particleIndex(marketNodes[nodeIndex].userData.radial, WEB_RINGS - 3)].position.clone(),
        legEndpoints[legIndex].clone(),
        new THREE.Vector3((legIndex < 4 ? -1 : 1) * 0.46, 0.34, 0.09),
        new THREE.Vector3(0, 0.53, 0.1)
      ], false, "centripetal", 0.25);
    }

    function setRows(rows) {
      rowsHost.replaceChildren(...rows.map(([key, value, tone = ""]) => {
        const row = document.createElement("div");
        row.className = "nervex-soma-inspector-row";
        const label = document.createElement("span");
        label.textContent = key;
        const result = document.createElement("strong");
        result.className = tone;
        result.textContent = value;
        row.append(label, result);
        return row;
      }));
    }

    function setInspectorAction(label, handler) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "nervex-soma-inspector-action";
      button.textContent = label;
      button.addEventListener("click", handler, { once: true });
      rowsHost.appendChild(button);
    }

    function inspectPreset(preset, status) {
      inspector.classList.remove("processing");
      inspectorTitle.textContent = preset.title;
      inspectorSubtitle.textContent = preset.subtitle;
      setRows(preset.rows);
      selection.textContent = status || `${preset.title} // INSPECTED`;
      inspectorLive.textContent = [inspectorPresets.soma, inspectorPresets.cns, inspectorPresets.rig].includes(preset) ? "BIOLOGICAL REFERENCE" : webScope === "personal" ? "LIVE / SOLANA" : (layer === "signal" ? (signalIsLive ? "LIVE / SOLANA" : "SIMULATED RESEARCH") : "SIMULATED RESEARCH");
    }

    function queueInspector(preset, status, processLabel) {
      const revision = ++inspectorRevision;
      inspector.classList.add("processing");
      inspectorLive.textContent = "PROCESSING";
      selection.textContent = `${processLabel} // UPDATING VIEW`;
      window.setTimeout(() => {
        if (revision !== inspectorRevision) return;
        inspectPreset(preset, status);
      }, reduceMotion ? 0 : 220);
    }

    function inspectLeg(index) {
      const number = String(index + 1).padStart(2, "0");
      uiState.selectedBodyPart = `leg-${number}`;
      uiState.selectedNode = null;
      uiState.selectedThread = null;
      selectedNodeIndex = -1;
      inspectorTitle.textContent = `LEG ${number}`;
      inspectorSubtitle.textContent = "SENSORY CHANNEL";
      setRows([["CHANNEL", channels[index], "hot"], ["SIGNAL LOAD", index === 4 ? "0.72" : `0.${64 + index * 3}`, "hot"], ["LAST VIBRATION", latestArcSignal ? "LIVE / CURRENT" : "14 SEC"], ["INPUT", index === 4 || signalLegIndex === index ? (latestArcSignal?.type || "TOKEN TRANSFER") : "WEB VIBRATION"], ["PATHWAY TYPE", "NERVEX COMPUTATIONAL OVERLAY"]]);
      selection.textContent = `LEG_${number} // ${channels[index]}`;
      inspectorLive.textContent = latestArcSignal && signalLegIndex === index ? "LIVE / SOLANA" : "COMPUTATIONAL";
      pathwayRecords.forEach((path, pathIndex) => {
        path.material.color.setHex(pathIndex === index ? 0xff713a : 0xa84825);
        path.material.userData.selectionBoost = pathIndex === index ? 0.22 : 0;
      });
    }

    function inspectNode(index) {
      const node = marketNodes[index];
      const isSolAnchor = node.userData.name === "SOL" && webScope === "global";
      const liveNode = Boolean(node.userData.address) || webScope === "personal" || (isSolAnchor && section.querySelector("[data-soma-block]")?.textContent !== "—");
      const contactCount = personalData?.counterparties?.length || 0;
      const flow = latestArcSignal && liveNode ? `${latestArcSignal.amount} ${latestArcSignal.symbol || "TOKEN"}` : "UNAVAILABLE";
      uiState.selectedNode = node.userData.name;
      uiState.selectedBodyPart = null;
      uiState.selectedThread = null;
      selectedNodeIndex = index;
      inspectorTitle.textContent = node.userData.name;
      inspectorSubtitle.textContent = isSolAnchor ? "SOLANA PRIMARY ANCHOR" : liveNode ? "SOLANA OBSERVED NODE" : "SIMULATED RESEARCH NODE";
      setRows([["NODE CLASS", isSolAnchor ? "NETWORK ANCHOR" : node.userData.kind || (liveNode ? "SOLANA CONTACT" : "RESEARCH CATEGORY"), "hot"], ["NETWORK", isSolAnchor ? "SOLANA" : "—"], ["DATA SOURCE", liveNode ? "LIVE / SOLANA" : "SIMULATED RESEARCH", liveNode ? "ok" : "warn"], ["ADDRESS", node.userData.address || "UNAVAILABLE"], ["FLOW", flow], ["CONTACTS", String(contactCount)], ["TENSION", personalData?.tension?.label || "UNAVAILABLE"], ["LAST VIBRATION", latestArcSignal && liveNode ? `SLOT ${latestArcSignal.slot}` : "UNAVAILABLE"]]);
      if (node.userData.kind === "MINT" && node.userData.address && window.NervexSolana) {
        window.NervexSolana.provider.mintInfo(node.userData.address).then((info) => {
          if (!info || selectedNodeIndex !== index) return;
          setRows([["NODE CLASS", info.tokenStandard, "hot"], ["MINT", info.mint], ["DECIMALS", String(info.decimals)], ["SUPPLY", info.supply || "UNAVAILABLE"], ["EXTENSIONS", info.extensions.join(", ") || "NONE OBSERVED"], ["DATA SOURCE", "LIVE / SOLANA", "ok"]]);
          setInspectorAction("OPEN TOKEN NODE", () => window.NervexSolana.inspectMint(info.mint));
        }).catch(() => {});
      }
      selection.textContent = `${node.userData.name} // NODE SELECTED`;
      inspectorLive.textContent = liveNode ? "LIVE / SOLANA" : "SIMULATED RESEARCH";
      marketNodes.forEach((item, itemIndex) => {
        item.scale.setScalar(itemIndex === index ? 1.42 : 1);
        item.material.color.setHex(itemIndex === index ? 0xff7642 : 0xc75a31);
      });
      nodeLabels.forEach((labelNode, itemIndex) => labelNode.classList.toggle("active", itemIndex === index));
      vibrateNode(index, performance.now());
    }

    function pluckThread(object) {
      selectedNodeIndex = -1;
      pendingPluck = object;
      uiState.selectedThread = object.userData.name;
      uiState.selectedNode = null;
      uiState.selectedBodyPart = null;
      inspectorTitle.textContent = "WEB PLUCK";
      inspectorSubtitle.textContent = object.userData.connection;
      setRows([["THREAD", object.userData.connection, "hot"], ["LAST ACTIVITY", latestArcSignal ? `SLOT ${latestArcSignal.slot}` : "UNAVAILABLE"], ["FLOW", latestArcSignal ? `${latestArcSignal.amount} ${latestArcSignal.symbol || "TOKEN"}` : "UNAVAILABLE"], ["TENSION", personalData?.tension?.label || "UNAVAILABLE"], ["SOURCE", webScope === "personal" ? "LIVE / SOLANA" : "SIMULATED RESEARCH"]]);
      setInspectorAction("[ PLUCK ]", () => {
        selection.textContent = `WEB PLUCK // ${object.userData.name} // QUERYING SOLANA`;
        inspectorLive.textContent = "LIVE QUERY";
        setRows([["THREAD", object.userData.connection, "hot"], ["QUERY", "SOLANA RPC"], ["STATE", "WAITING FOR RETURN", "warn"]]);
        window.dispatchEvent(new CustomEvent("nervex:pluck-request", { detail: { thread: object.userData.name, connection: object.userData.connection, scope: webScope } }));
      });
      selection.textContent = `THREAD ${object.userData.name} // READY TO PLUCK`;
      inspectorLive.textContent = "THREAD SELECTED";
    }

    function applyPersonalWeb() {
      if (!personalData) return;
      const mintAddresses = [...new Set((personalData.tokenAccounts || []).map((item) => item.mint))];
      const contacts = [personalData.address, ...mintAddresses, ...(personalData.counterparties || []).slice(0, 6), ""];
      const names = ["YOU", ...mintAddresses.map((mint) => mint.slice(0, 6)), ...(personalData.counterparties || []).slice(0, 6).map((address) => address.slice(0, 6)), "SOL"].slice(0, marketNodes.length);
      marketNodes.forEach((node, index) => {
        const visible = index < names.length;
        node.visible = visible;
        node.userData.name = names[index] || "";
        node.userData.address = contacts[index] || "";
        node.userData.kind = index === 0 ? "WALLET" : index <= mintAddresses.length ? "MINT" : "ACCOUNT";
        node.userData.personal = true;
        node.scale.setScalar(index === 0 ? 1.8 : 1);
        node.material.color.setHex(index === 0 ? 0x8eaa88 : 0xc75a31);
        nodeLabels[index].textContent = names[index] || "";
        nodeLabels[index].style.display = visible ? "flex" : "none";
      });
      threadRecords.forEach((thread, index) => {
        const contact = names[(index % Math.max(1, names.length - 1)) + 1] || "SOL";
        thread.userData.connection = `YOU ↔ ${contact}`;
      });
      section.querySelector("[data-soma-contacts]").textContent = String(personalData.tokenAccounts?.length || 0);
      section.querySelector("[data-soma-tension]").textContent = personalData.tension.label;
      inspectorTitle.textContent = "YOU";
      inspectorSubtitle.textContent = personalData.address;
      setRows([["SOURCE", "LIVE / SOLANA", "ok"], ["SOL BALANCE", personalData.balance], ["TOKEN ACCOUNTS", String(personalData.tokenAccounts?.length || 0)], ["TRANSACTIONS", String(personalData.transactions?.length || 0)], ["UNIQUE CONTACTS", String(personalData.counterparties?.length || 0)], ["PROGRAMS", String(personalData.programIds?.length || 0)], ["WEB TENSION", personalData.tension.label, "hot"]]);
      selection.textContent = "PERSONAL WEB // YOU NODE RESOLVED";
    }

    function setWebScope(nextScope) {
      if (nextScope === "personal" && !personalData) {
        selection.textContent = walletConnected ? "PERSONAL WEB // SCAN MY WEB TO MATERIALIZE" : "CONNECT WALLET TO MATERIALIZE YOUR WEB";
        window.dispatchEvent(new CustomEvent(walletConnected ? "nervex:request-scan" : "nervex:request-connect"));
        return;
      }
      webScope = nextScope;
      section.dataset.webScope = webScope;
      section.querySelectorAll("[data-soma-scope]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.somaScope === webScope)));
      section.querySelector("[data-soma-scope-label]").textContent = webScope.toUpperCase();
      section.querySelector("[data-soma-source]").textContent = webScope === "personal" ? "LIVE / PERSONAL SOLANA WEB" : observedGlobalNodeCount ? "LIVE SOLANA CONTACTS / SIMULATED RELATIONS" : "SIMULATED RESEARCH / GLOBAL WEB";
      if (webScope === "personal") applyPersonalWeb();
      else {
        marketNodes.forEach((node, index) => { node.visible = true; node.userData.name = globalMarketNames[index]; node.userData.address = ""; node.userData.kind = index === 0 ? "NETWORK ANCHOR" : "RESEARCH CATEGORY"; node.userData.personal = false; node.scale.setScalar(1); node.material.color.setHex(0xc75a31); nodeLabels[index].textContent = globalMarketNames[index]; nodeLabels[index].style.display = "flex"; });
        threadRecords.forEach((thread, index) => { thread.userData.connection = `${globalMarketNames[index % 8]} ↔ ${globalMarketNames[(index + 1) % 8]}`; });
        inspectPreset(inspectorPresets.web, "GLOBAL WEB // SIMULATED RESEARCH LAYER");
      }
    }

    window.addEventListener("nervex:web-data", (event) => { personalData = event.detail; if (webScope === "personal") applyPersonalWeb(); });
    window.addEventListener("nervex:solana-slot", (event) => {
      const value = Number(event.detail?.slot || 0).toLocaleString();
      section.querySelector("[data-soma-block]").textContent = value;
      [inspectorPresets.all, inspectorPresets.cns].forEach((preset) => { const row = preset.rows.find((item) => item[0] === "CURRENT SLOT"); if (row) row[1] = value; });
    });
    window.addEventListener("nervex:wallet-state", (event) => {
      walletConnected = Boolean(event.detail?.connected);
      if (!walletConnected) {
        personalData = null;
        section.querySelector("[data-soma-contacts]").textContent = "—";
        section.querySelector("[data-soma-tension]").textContent = "—";
        if (webScope === "personal") setWebScope("global");
      }
    });
    window.addEventListener("nervex:set-web-scope", (event) => setWebScope(event.detail?.scope || "global"));
    window.addEventListener("nervex:global-nodes", (event) => {
      if (webScope !== "global") return;
      const observed = (event.detail?.nodes || []).slice(0, marketNodes.length - 1);
      observedGlobalNodeCount = observed.length;
      section.querySelector("[data-soma-source]").textContent = observed.length ? "LIVE SOLANA CONTACTS / SIMULATED RELATIONS" : "SIMULATED RESEARCH / GLOBAL WEB";
      observed.forEach((item, index) => {
        const nodeIndex = index + 1;
        marketNodes[nodeIndex].userData.name = item.name;
        marketNodes[nodeIndex].userData.address = item.address;
        marketNodes[nodeIndex].userData.kind = item.kind;
        nodeLabels[nodeIndex].textContent = item.name;
      });
    });
    window.addEventListener("nervex:solana-signal", (event) => {
      latestArcSignal = event.detail;
      uiState.currentSignal = latestArcSignal;
      let liveIndex = Math.max(0, marketNodes.findIndex((node) => node.userData.name === latestArcSignal.symbol));
      if (latestArcSignal.mint) {
        liveIndex = liveIndex >= 0 ? liveIndex : 0;
        marketNodes[liveIndex].userData.name = latestArcSignal.symbol;
        marketNodes[liveIndex].userData.address = latestArcSignal.mint;
        marketNodes[liveIndex].userData.kind = "MINT";
        nodeLabels[liveIndex].textContent = latestArcSignal.symbol;
      }
      vibrateNode(liveIndex, performance.now());
      marketNodes[liveIndex].userData.pluckStart = performance.now();
      if (layer === "signal") startSignal(latestArcSignal, true);
    });
    window.addEventListener("nervex:pluck-result", (event) => {
      const result = event.detail;
      if (!pendingPluck) return;
      if (!result.ok) {
        setRows([["SOURCE", result.source], ["STATE", "UNAVAILABLE", "warn"], ["ERROR", result.error || "RPC FAILURE"]]);
        selection.textContent = `WEB PLUCK // ${pendingPluck.userData.name} // UNAVAILABLE`;
        inspectorLive.textContent = "RPC DEGRADED";
        pendingPluck = null;
        return;
      }
      const now = performance.now();
      setRows([["SOURCE", result.source, "ok"], ["SOLANA SLOT", String(result.slot), "hot"], ["SIGNATURE", result.signature || "UNAVAILABLE"], ["ACTIVITY", result.activity || "UNAVAILABLE"], ["PROGRAM", result.program || "UNAVAILABLE"], ["SOL BALANCE", result.balance ?? "UNAVAILABLE"], ["LATENCY", `${result.latency} ms`], ["OBSERVED", result.timestamp]]);
      selection.textContent = `WEB PLUCK // ${pendingPluck.userData.name} // SOLANA RETURN RECEIVED`;
      inspectorLive.textContent = "LIVE / SOLANA";
      pendingPluck.userData.material.color.setHex(0xe16b3b);
      pendingPluck.userData.material.userData.selectionBoost = 0.22;
      applyThreadImpulse(pendingPluck, 1.15);
      pendingPluck = null;
    });

    function clearHighlights() {
      selectedNodeIndex = -1;
      pathwayRecords.forEach((path) => { path.material.color.setHex(0xa84825); path.material.userData.selectionBoost = 0; });
      marketNodes.forEach((node) => { node.scale.setScalar(1); node.material.color.setHex(0xc75a31); });
      nodeLabels.forEach((labelNode) => labelNode.classList.remove("active"));
      threadRecords.forEach((thread) => { thread.material.color.setHex(0x739099); thread.material.userData.selectionBoost = 0; });
    }

    function selectObject(hit) {
      clearHighlights();
      const data = hit.object.userData;
      selected = data;
      if (data.kind === "cns") {
        uiState.selectedBodyPart = "cns";
        uiState.selectedNode = null;
        uiState.selectedThread = null;
        inspectorPresets.cns.rows[3][1] = latestArcSignal?.type || "TOKEN FLOW";
        inspectPreset(inspectorPresets.cns, "CENTRAL SYNGANGLION // PROCESSING");
      }
      else if (data.kind === "leg") inspectLeg(data.index);
      else if (data.kind === "node") {
        inspectNode(data.index);
      } else if (data.kind === "thread") pluckThread(hit.object);
      else if (data.kind === "spinneret") {
        uiState.selectedBodyPart = "spinneret";
        uiState.selectedNode = null;
        uiState.selectedThread = null;
        inspectPreset(inspectorPresets.abdomen, "SPINNERET ENGINE // BODY → SILK → WEB");
      }
      else if (data.kind === "body") {
        const point = hit.point;
        if (Math.abs(point.x) > 0.76) {
          let nearest = 0;
          let distance = Infinity;
          legEndpoints.forEach((tip, index) => {
            const current = tip.distanceToSquared(point);
            if (current < distance) { distance = current; nearest = index; }
          });
          inspectLeg(nearest);
        } else if (point.y < -0.34) inspectPreset(inspectorPresets.abdomen, "ABDOMEN // SPINNERET ENGINE");
        else inspectPreset(inspectorPresets.all, "CENTRAL HUB // EXTENDED COGNITION");
      }
    }

    function showTooltip(data, x, y) {
      let title = "";
      let copy = "";
      if (data.kind === "cns") { title = "SYNGANGLION"; copy = "CENTRAL INTEGRATION STRUCTURE"; }
      else if (data.kind === "leg") { title = `LEG_${String(data.index + 1).padStart(2, "0")}`; copy = `${data.channel} CHANNEL`; }
      else if (data.kind === "thread") { title = `THREAD ${data.name}`; copy = `${data.connection}\nTENSION 0.82`; }
      else if (data.kind === "node") { title = data.name; copy = data.index === 3 ? "RETAIL ANOMALY NODE" : "MARKET WEB NODE"; }
      else if (data.kind === "spinneret") { title = "SPINNERET ENGINE"; copy = "SILK OUTPUT // ACTIVE"; }
      else if (data.kind === "body") { title = "SOMA"; copy = "SPECIMEN SURFACE // CLICK TO INSPECT"; }
      else return hideTooltip();
      tooltip.innerHTML = `<strong>${title}</strong>${copy}`;
      const left = Math.min(wrap.clientWidth - 220, Math.max(8, x + 14));
      const top = Math.min(wrap.clientHeight - 72, Math.max(8, y + 14));
      tooltip.style.transform = `translate(${left}px,${top}px)`;
      tooltip.classList.add("visible");
      tooltip.setAttribute("aria-hidden", "false");
    }

    function hideTooltip() {
      tooltip.classList.remove("visible");
      tooltip.setAttribute("aria-hidden", "true");
      if (hovered?.material && hovered.kind !== "node") hovered.material.userData.hoverBoost = 0;
      hovered = null;
      canvas.classList.remove("is-pickable");
      if (!inspector.classList.contains("processing")) inspectorLive.textContent = layer === "signal" ? "SIGNAL ROUTING" : "LIVE PICKING";
    }

    function updatePointer(event) {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      pointerEvent = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      hoverDirty = true;
    }

    function pick(objects) {
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(objects, false).filter((hit) => {
        const material = hit.object.material;
        return hit.object.visible && (!material || material.opacity > 0.055);
      });
    }

    function updateHover() {
      hoverDirty = false;
      const hits = pick(hoverTargets);
      const hit = hits.sort((a, b) => (b.object.userData.priority || 0) - (a.object.userData.priority || 0) || a.distance - b.distance)[0];
      if (!hit) return hideTooltip();
      if (hovered?.material && hovered !== hit.object.userData) hovered.material.userData.hoverBoost = 0;
      hovered = hit.object.userData;
      if (hovered.material) hovered.material.userData.hoverBoost = 0.14;
      canvas.classList.add("is-pickable");
      inspectorLive.textContent = `PREVIEW // ${hovered.kind.toUpperCase()}`;
      showTooltip(hovered, pointerEvent.x, pointerEvent.y);
    }

    function vibrateNode(index, now) {
      const radial = marketNodes[index]?.userData?.radial ?? index * 2;
      const ring = WEB_RINGS - 2;
      applyParticleImpulse(particleIndex(radial, ring), 1.35);
      applyParticleImpulse(particleIndex(radial - 1, ring), 0.62);
      applyParticleImpulse(particleIndex(radial + 1, ring), 0.62);
    }

    const constraintDelta = new THREE.Vector3();
    const velocity = new THREE.Vector3();
    function updateWebPhysics(delta) {
      const frameScale = Math.min(1.5, Math.max(0.35, delta * 60));
      webParticles.forEach((particle) => {
        if (particle.pinned) {
          particle.position.copy(particle.base);
          particle.previous.copy(particle.base);
          return;
        }
        velocity.subVectors(particle.position, particle.previous).multiplyScalar(Math.pow(0.962, frameScale));
        particle.previous.copy(particle.position);
        particle.position.add(velocity);
        particle.position.lerp(particle.base, 0.0045 * frameScale);
      });
      for (let iteration = 0; iteration < 5; iteration += 1) {
        webConstraints.forEach((constraint) => {
          const a = webParticles[constraint.a];
          const b = webParticles[constraint.b];
          constraintDelta.subVectors(b.position, a.position);
          const distance = constraintDelta.length() || 0.0001;
          const correction = (distance - constraint.rest) / distance * constraint.stiffness;
          if (!a.pinned && !b.pinned) {
            a.position.addScaledVector(constraintDelta, correction * 0.5);
            b.position.addScaledVector(constraintDelta, -correction * 0.5);
          } else if (!a.pinned) a.position.addScaledVector(constraintDelta, correction);
          else if (!b.pinned) b.position.addScaledVector(constraintDelta, -correction);
        });
      }
      threadRecords.forEach((thread) => {
        const attribute = thread.geometry.attributes.position;
        thread.userData.particleIndices.forEach((index, pointIndex) => {
          const point = webParticles[index].position;
          attribute.setXYZ(pointIndex, point.x, point.y, point.z);
        });
        attribute.needsUpdate = true;
        thread.geometry.computeBoundingSphere();
      });
      marketNodes.forEach((node) => node.position.copy(webParticles[node.userData.anchorIndex].position));
    }

    function setLayer(nextLayer) {
      layer = nextLayer;
      uiState.selectedLayer = nextLayer;
      clearHighlights();
      section.querySelectorAll("[data-soma-layer]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.somaLayer === layer)));
      const targets = layerOpacity[layer];
      trackedMaterials.forEach((material) => { material.userData.targetOpacity = targets[material.userData.layer] ?? 0; });
      pulseMaterial.opacity = 0;
      hubPulseMaterial.opacity = 0;
      cnsMaterial.emissiveIntensity = 0.74;
      if (layer === "signal") {
        inspectorRevision += 1;
        signalStart = performance.now();
        signalCycle += 1;
        signalStage = -1;
        inspector.classList.add("processing");
        inspectorLive.textContent = "SIGNAL ROUTING";
        selection.textContent = "SIGNAL ROUTING // INITIALIZING";
        startSignal(latestArcSignal, Boolean(latestArcSignal));
      } else {
        const presets = { all: inspectorPresets.all, soma: inspectorPresets.soma, cns: inspectorPresets.cns, web: inspectorPresets.web, rig: inspectorPresets.rig };
        const labels = { all: "RENDERING COMPLETE FIELD", soma: "ISOLATING SOMA", cns: "ROUTING CNS LAYER", web: "RENDERING WEB LAYER", rig: "RESOLVING JOINT HIERARCHY" };
        const statuses = { all: "CENTRAL HUB // ALL LAYERS ACTIVE", soma: "NERVEX SOMA // SPECIMEN LAYER", cns: "SYNGANGLION // CNS LAYER", web: "WEB TOPOLOGY // EXTERNAL SENSORIUM", rig: "8-LEG RIG // RESEARCH MODE" };
        queueInspector(presets[layer], statuses[layer], labels[layer]);
      }
    }

    function startSignal(detail = null, live = false) {
      signalIsLive = live;
      signalNodeIndex = live ? Math.max(0, marketNodes.findIndex((node) => node.userData.name === detail?.symbol)) : 3;
      signalLegIndex = live ? 4 : 6;
      signalStart = performance.now();
      signalStage = -1;
      signalCycle += 1;
      uiState.currentSignal = detail || { source: "SIMULATED RESEARCH", type: "MARKET ATTENTION", amount: "UNAVAILABLE", slot: "—" };
      section.dataset.signalSource = live ? "live" : "simulated";
      section.dataset.signalStage = "listening";
      configureSignalPath(signalNodeIndex, signalLegIndex);
      const origin = marketNodes[signalNodeIndex].userData.name;
      inspectorPresets.signal.subtitle = `${origin} → WEB → LEG ${String(signalLegIndex + 1).padStart(2, "0")} → SYNGANGLION`;
      inspectorPresets.signal.rows = [["STATE", "LISTENING", "hot"], ["ORIGIN", origin], ["INPUT", detail?.type || "SIMULATED SIGNAL"], ["SOLANA SLOT", detail?.slot ? String(detail.slot) : "UNAVAILABLE"], ["LEG CHANNEL", channels[signalLegIndex]], ["SOURCE", live ? "LIVE / SOLANA" : "SIMULATED RESEARCH", live ? "ok" : "warn"]];
      inspectPreset(inspectorPresets.signal, `LISTENING // ${origin} CONTACT FIELD`);
      inspectorLive.textContent = live ? "LIVE / SOLANA" : "SIMULATED RESEARCH";
      vibrateNode(signalNodeIndex, signalStart);
      marketNodes[signalNodeIndex].userData.pluckStart = signalStart;
    }

    function updateSignal(now) {
      if (layer !== "signal") return;
      const total = 6200;
      const elapsed = now - signalStart;
      const activeThread = threadRecords.find((thread) => thread.userData.radialIndex === marketNodes[signalNodeIndex].userData.radial);
      if (elapsed > total) {
        pulseMaterial.opacity = 0;
        hubPulseMaterial.opacity = 0;
        cnsMaterial.emissiveIntensity = 0.74;
        pathwayRecords[signalLegIndex].material.color.setHex(0xa84825);
        if (activeThread) activeThread.material.color.setHex(0x78959d);
        marketNodes[signalNodeIndex].scale.setScalar(signalNodeIndex === selectedNodeIndex ? 1.42 : 1);
        if (signalStage !== 4) {
          signalStage = 4;
          section.dataset.signalStage = "complete";
          inspectorPresets.signal.rows[0][1] = "AWAITING CONTACT";
          inspectPreset(inspectorPresets.signal, "STATE CHANGE COMPLETE // NEXT CONTACT PENDING");
          inspectorLive.textContent = signalIsLive ? "LIVE / SOLANA" : "SIMULATED RESEARCH";
        }
        if (!signalIsLive && elapsed > 12800) startSignal(null, false);
        return;
      }
      // Clamp at both ends: a signal may start between RAF callbacks, making
      // the next frame's timestamp briefly older than signalStart. Three's
      // CatmullRomCurve3 cannot sample a negative progress value.
      const t = THREE.MathUtils.clamp(Number.isFinite(elapsed) ? elapsed / total : 0, 0, 1);
      const curveReady = signalCurve?.points?.length >= 4 && signalCurve.points.every((point) => point?.isVector3);
      if (!curveReady) configureSignalPath(signalNodeIndex, signalLegIndex);
      pulse.position.copy(signalCurve.getPointAt(t));
      pulseMaterial.opacity = Math.sin(Math.PI * Math.min(1, t * 1.12)) * 0.96;
      pulse.scale.setScalar(0.82 + 0.35 * Math.sin(elapsed * 0.018));
      const stage = t < 0.18 ? 0 : t < 0.43 ? 1 : t < 0.72 ? 2 : 3;
      const names = ["LISTENING", "LOCALIZING", "CLASSIFYING", "PROCESSING"];
      if (stage !== signalStage) {
        signalStage = stage;
        section.dataset.signalStage = names[stage].toLowerCase();
        inspectorPresets.signal.rows[0][1] = names[stage];
        inspectPreset(inspectorPresets.signal, `${names[stage]} // ${marketNodes[signalNodeIndex].userData.name} → SYNGANGLION`);
        inspectorLive.textContent = signalIsLive ? "LIVE / SOLANA" : "SIMULATED RESEARCH";
        if (stage === 1) applyParticleImpulse(particleIndex(marketNodes[signalNodeIndex].userData.radial, WEB_RINGS - 3), 0.8);
      }
      const sourcePhase = THREE.MathUtils.smoothstep(1 - t, 0.72, 1);
      marketNodes[signalNodeIndex].scale.setScalar(1 + Math.sin(sourcePhase * Math.PI) * 0.48);
      if (activeThread) activeThread.material.color.setHex(t < 0.54 ? 0xe16b3b : 0x78959d);
      const legActive = t > 0.43 && t < 0.9;
      pathwayRecords[signalLegIndex].material.color.setHex(legActive ? 0xff713a : 0xa84825);
      const hubPhase = THREE.MathUtils.smoothstep(t, 0.7, 1);
      hubPulseMaterial.opacity = Math.sin(hubPhase * Math.PI) * 0.28;
      hubPulse.scale.setScalar(0.75 + hubPhase * 0.9);
      cnsMaterial.emissiveIntensity = 0.74 + Math.sin(hubPhase * Math.PI) * 0.46;
    }

    function updateNodePulses(now) {
      marketNodes.forEach((node, index) => {
        const started = node.userData.pluckStart;
        if (!started || layer === "signal" && index === 3) return;
        const elapsed = (now - started) / 1000;
        if (elapsed < 1.1) {
          node.scale.setScalar(1 + Math.sin(elapsed * Math.PI * 3.2) * Math.exp(-elapsed * 2.2) * 0.3);
        } else {
          node.userData.pluckStart = 0;
          node.scale.setScalar(index === selectedNodeIndex ? 1.42 : 1);
        }
      });
    }

    function updateMaterials(delta) {
      const speed = 1 - Math.exp(-delta * 11.5);
      trackedMaterials.forEach((material) => {
        const boost = (material.userData.hoverBoost || 0) + (material.userData.selectionBoost || 0);
        const target = Math.min(1, material.userData.targetOpacity + boost);
        material.userData.currentOpacity = THREE.MathUtils.lerp(material.userData.currentOpacity, target, speed);
        material.opacity = material.userData.currentOpacity;
        material.visible = material.opacity > 0.004;
      });
    }

    function projectLabels() {
      const width = wrap.clientWidth;
      const height = wrap.clientHeight;
      marketNodes.forEach((node, index) => {
        const projected = node.getWorldPosition(new THREE.Vector3()).project(camera);
        const outside = projected.z > 1 || projected.x < -1.08 || projected.x > 1.08 || projected.y < -1.08 || projected.y > 1.08 || node.material.opacity < 0.12;
        const label = nodeLabels[index];
        label.classList.toggle("outside", outside);
        label.style.left = `${(projected.x * 0.5 + 0.5) * width}px`;
        label.style.top = `${(-projected.y * 0.5 + 0.5) * height}px`;
      });
    }

    const cameraPresets = {
      front: { position: new THREE.Vector3(0, 0, 12), target: new THREE.Vector3(0, 0.03, 0) },
      side: { position: new THREE.Vector3(11.5, 0.2, 2), target: new THREE.Vector3(0, 0.03, 0) },
      top: { position: new THREE.Vector3(0.4, 9.2, 7.6), target: new THREE.Vector3(0, 0.08, 0) }
    };

    function setCameraPreset(name) {
      const preset = cameraPresets[name];
      cameraTween = { start: performance.now(), from: camera.position.clone(), to: preset.position.clone(), targetFrom: controls.target.clone(), targetTo: preset.target.clone() };
      section.querySelectorAll("[data-soma-view]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.somaView === name)));
      inspector.classList.add("processing");
      inspectorLive.textContent = "UPDATING VIEW";
      selection.textContent = `CAMERA // ${name.toUpperCase()} VIEW`;
      window.setTimeout(() => { inspector.classList.remove("processing"); inspectorLive.textContent = layer === "signal" ? "SIGNAL ROUTING" : "LIVE PICKING"; }, reduceMotion ? 0 : 540);
      controlResumeAt = autoRotateEnabled ? performance.now() + 3400 : Number.POSITIVE_INFINITY;
      controls.autoRotate = false;
    }

    function updateCameraTween(now) {
      if (!cameraTween) return;
      const t = Math.min(1, (now - cameraTween.start) / 520);
      const eased = 1 - Math.pow(1 - t, 3);
      camera.position.lerpVectors(cameraTween.from, cameraTween.to, eased);
      controls.target.lerpVectors(cameraTween.targetFrom, cameraTween.targetTo, eased);
      if (t >= 1) cameraTween = null;
    }

    function resize() {
      const width = Math.max(1, wrap.clientWidth);
      const height = Math.max(1, wrap.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.8);
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    canvas.addEventListener("pointermove", updatePointer);
    canvas.addEventListener("pointerleave", hideTooltip);
    controls.addEventListener("start", () => {
      cameraTween = null;
      controls.autoRotate = false;
      controlResumeAt = autoRotateEnabled ? performance.now() + 4200 : Number.POSITIVE_INFINITY;
    });
    controls.addEventListener("end", () => {
      controlResumeAt = autoRotateEnabled ? performance.now() + 4200 : Number.POSITIVE_INFINITY;
    });
    canvas.addEventListener("pointerdown", (event) => {
      interactionStarted = { x: event.clientX, y: event.clientY };
    });
    canvas.addEventListener("pointerup", (event) => {
      const moved = Math.hypot(event.clientX - interactionStarted.x, event.clientY - interactionStarted.y);
      if (moved > 5) return;
      updatePointer(event);
      const hits = pick(clickTargets).sort((a, b) => (b.object.userData.priority || 0) - (a.object.userData.priority || 0) || a.distance - b.distance);
      if (hits[0]) selectObject(hits[0]);
    });
    canvas.addEventListener("dblclick", () => setCameraPreset("front"));

    section.querySelectorAll("[data-soma-layer]").forEach((button) => button.addEventListener("click", () => setLayer(button.dataset.somaLayer)));
    section.querySelectorAll("[data-soma-scope]").forEach((button) => button.addEventListener("click", () => setWebScope(button.dataset.somaScope)));
    section.querySelectorAll("[data-soma-view]").forEach((button) => button.addEventListener("click", () => setCameraPreset(button.dataset.somaView)));
    section.querySelector(".nervex-soma-reset").addEventListener("click", () => setCameraPreset("front"));
    section.querySelector(".nervex-soma-auto").addEventListener("click", (event) => {
      autoRotateEnabled = !autoRotateEnabled;
      controls.autoRotate = autoRotateEnabled;
      event.currentTarget.setAttribute("aria-pressed", String(autoRotateEnabled));
      event.currentTarget.textContent = autoRotateEnabled ? "AUTO ROTATE [ON]" : "AUTO ROTATE [OFF]";
      controlResumeAt = autoRotateEnabled ? 0 : Number.POSITIVE_INFINITY;
      selection.textContent = `AUTO ROTATE // ${autoRotateEnabled ? "ON" : "OFF"}`;
      inspectorLive.textContent = autoRotateEnabled ? "AUTO MODE" : "MANUAL MODE";
    });
    section.querySelectorAll("[data-soma-modal]").forEach((button) => button.addEventListener("click", () => {
      button.classList.add("is-active");
      window.setTimeout(() => button.classList.remove("is-active"), 900);
      window.NervexLab?.openModal(button.dataset.somaModal, button);
    }));
    section.querySelectorAll("[data-soma-stat]").forEach((button) => button.addEventListener("click", () => {
      const type = button.dataset.somaStat;
      if (type === "block") {
        const slot = Number((section.querySelector("[data-soma-block]")?.textContent || "").replace(/\D/g, ""));
        const explorer = window.NervexSolana?.provider;
        if (slot && explorer) window.open(explorer.explorer("slot", slot), "_blank", "noopener,noreferrer");
        else inspectPreset({ title: "SOLANA SLOT", subtitle: "LIVE / SOLANA", rows: [["STATE", "UNAVAILABLE", "warn"], ["SOURCE", "SOLANA RPC"]] }, "SOLANA SLOT // WAITING FOR RPC");
      } else if (type === "contacts") {
        const rows = personalData?.counterparties?.length ? personalData.counterparties.slice(0, 6).map((address, index) => [`CONTACT ${String(index + 1).padStart(2, "0")}`, address]) : [["STATE", "CONNECT + SCAN TO RESOLVE", "warn"], ["LATEST LIVE FLOW", latestArcSignal ? `${latestArcSignal.from.slice(0, 8)}… → ${latestArcSignal.to.slice(0, 8)}…` : "UNAVAILABLE"]];
        inspectPreset({ title: "TOKEN CONTACTS", subtitle: personalData ? "LIVE / PERSONAL SOLANA WEB" : "LIVE / SOLANA FEED", rows }, "TOKEN CONTACTS // INSPECTED");
      } else if (type === "tension") {
        inspectPreset({ title: "WEB TENSION", subtitle: "COMPUTATIONAL FORMULA", rows: [["ACTIVITY", "30%"], ["VOLUME", "25%"], ["UNIQUE INTERACTIONS", "25%"], ["RECENCY", "20%"], ["CURRENT", personalData?.tension?.label || "UNAVAILABLE", personalData ? "hot" : "warn"]] }, "WEB TENSION // FORMULA");
      } else if (type === "scope") {
        inspectPreset({ title: "DATA SCOPE", subtitle: "PROVENANCE MAP", rows: [["GLOBAL", "SIMULATED RESEARCH"], ["PERSONAL", personalData ? "LIVE / SOLANA" : "UNAVAILABLE"], ["CHAIN SIGNAL", latestArcSignal ? "LIVE" : "WAITING"], ["EXTERNAL MARKET", "EXPLICITLY SEPARATE"], ["MORPHOLOGY", "BIOLOGICAL REFERENCE"], ["MARKET CHANNELS", "COMPUTATIONAL OVERLAY"]] }, "DATA SCOPE // EXPLICIT SOURCES");
      }
    }));

    new ResizeObserver(resize).observe(wrap);
    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }, { rootMargin: "160px" }).observe(section);
    resize();
    inspectPreset(inspectorPresets.cns, "INITIALIZING FIELD // 00%");
    inspector.classList.add("processing");
    inspectorLive.textContent = "INITIALIZING";
    loaderLabel.textContent = "INITIALIZING FIELD...";
    window.setTimeout(() => { if (!loaderNode.classList.contains("ready")) loaderLabel.textContent = "LOADING MORPHOLOGY..."; }, 280);
    window.setTimeout(() => { if (!loaderNode.classList.contains("ready")) loaderLabel.textContent = "SYNCING WEB STATE..."; }, 650);

    const gltfLoader = new GLTFLoader();
    gltfLoader.setMeshoptDecoder(MeshoptDecoder);
    Promise.all([
      gltfLoader.loadAsync("/assets/models/agelenidae-soma.glb"),
      gltfLoader.loadAsync("/assets/models/uloborus-synganglion.glb")
    ]).then(async ([bodyAsset, cnsAsset]) => {
      const body = bodyAsset.scene;
      const bounds = new THREE.Box3().setFromObject(body);
      const center = bounds.getCenter(new THREE.Vector3());
      const size = bounds.getSize(new THREE.Vector3());
      const scale = 4.9 / Math.max(size.x, size.z);
      body.scale.setScalar(scale);
      body.position.copy(center.multiplyScalar(-scale));
      specimenGroup.rotation.x = -Math.PI / 2;
      specimenGroup.position.z = 0.02;
      body.traverse((object) => {
        if (!object.isMesh) return;
        object.geometry.computeVertexNormals();
        object.material = bodyMaterial;
        object.renderOrder = 3;
        object.userData = { kind: "body", priority: 1, material: bodyMaterial };
        bodyMeshes.push(object);
        clickTargets.push(object);
        hoverTargets.push(object);
      });
      specimenGroup.add(body);

      const cns = cnsAsset.scene;
      cns.rotation.x = -Math.PI / 2;
      cns.scale.set(0.88, 0.4, 0.66);
      cns.position.set(0, 0.56, 0.12);
      cns.traverse((object) => {
        if (!object.isMesh) return;
        object.geometry.computeVertexNormals();
        object.material = cnsMaterial;
        object.renderOrder = 9;
        object.userData = { kind: "cns", priority: 9, material: cnsMaterial };
        cnsMeshes.push(object);
        clickTargets.push(object);
        hoverTargets.push(object);
      });
      cnsGroup.add(cns);
      const remaining = Math.max(0, 960 - (performance.now() - loadingStarted));
      if (remaining) await new Promise((resolve) => window.setTimeout(resolve, remaining));
      loaderLabel.textContent = "FIELD ONLINE";
      loaderNode.classList.add("ready");
      inspector.classList.remove("processing");
      inspectPreset(inspectorPresets.all, "CENTRAL HUB // ALL LAYERS ACTIVE");
    }).catch((error) => {
      console.error("WEB–SOMA asset load failed", error);
      loaderNode.classList.add("ready");
      const fallback = document.createElement("div");
      fallback.className = "nervex-soma-fallback";
      fallback.textContent = "ARCHIVED MORPHOLOGY COULD NOT BE LOADED // CHECK NETWORK OR WEBGL SUPPORT";
      wrap.appendChild(fallback);
    });

    let lastFrame = performance.now();
    function animate(now) {
      requestAnimationFrame(animate);
      if (!inView || document.hidden) return;
      const delta = Math.min(Math.max(0, (now - lastFrame) / 1000), 0.05);
      lastFrame = now;
      if (autoRotateEnabled && !reduceMotion && !controls.autoRotate && Number.isFinite(controlResumeAt) && now > controlResumeAt) {
        controls.autoRotate = true;
        const autoButton = section.querySelector(".nervex-soma-auto");
        autoButton.setAttribute("aria-pressed", "true");
        autoButton.textContent = "AUTO ROTATE [ON]";
        controlResumeAt = 0;
      }
      updateCameraTween(now);
      controls.update(delta);
      if (hoverDirty) updateHover();
      updateWebPhysics(delta);
      updateNodePulses(now);
      updateSignal(now);
      updateMaterials(delta);
      projectLabels();
      renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);
  }
}
