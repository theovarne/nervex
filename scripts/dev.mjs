import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const localEnv = resolve(root, ".env.local");
if (existsSync(localEnv)) process.loadEnvFile(localEnv);
const port = Number(process.env.PORT || 3000);
const host = "127.0.0.1";
const endpoints = Object.freeze({
  "mainnet-beta": process.env.SOLANA_MAINNET_RPC_URL || "https://api.mainnet-beta.solana.com",
  devnet: process.env.SOLANA_DEVNET_RPC_URL || "https://api.devnet.solana.com"
});
const allowed = new Set([
  "getSlot", "getBlock", "getTransaction", "getBalance",
  "getSignaturesForAddress", "getTokenAccountsByOwner",
  "getAccountInfo", "getTokenSupply"
]);
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript" };

createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${host}:${port}`);
    if (url.pathname === "/api/solana") {
      if (request.method !== "POST") {
        response.writeHead(405).end("POST required");
        return;
      }
      let raw = "";
      for await (const chunk of request) {
        raw += chunk;
        if (raw.length > 16384) throw new Error("RPC body too large");
      }
      const body = JSON.parse(raw);
      const cluster = request.headers["x-solana-cluster"] || "mainnet-beta";
      if (typeof cluster !== "string" || !Object.hasOwn(endpoints, cluster) ||
          !allowed.has(body.method) || !Array.isArray(body.params) ||
          body.params.length > 4) {
        response.writeHead(400).end("Unsupported RPC request");
        return;
      }
      const upstream = await fetch(endpoints[cluster], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0", id: body.id || 1,
          method: body.method, params: body.params
        }),
        signal: AbortSignal.timeout(15000)
      });
      response.writeHead(upstream.status, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }).end(await upstream.text());
      return;
    }
    if (request.method !== "GET") {
      response.writeHead(405).end("GET required");
      return;
    }
    const route = url.pathname === "/" ? "/demo/index.html" : url.pathname;
    const file = resolve(join(root, route.slice(1)));
    if (!file.startsWith(root + sep)) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    const info = await stat(file);
    if (!info.isFile()) throw new Error("Not a file");
    response.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream" });
    response.end(await readFile(file));
  } catch (error) {
    response.writeHead(404, { "Content-Type": "text/plain" }).end("Unavailable");
    if (process.env.DEBUG) console.error(error);
  }
}).listen(port, host, () => {
  console.log(`NERVEX research harness: http://${host}:${port}`);
});
