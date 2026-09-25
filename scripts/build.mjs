import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "build");
if (!out.startsWith(root + sep)) throw new Error("Build output escaped project root");
await rm(out, { recursive: true, force: true });
await mkdir(out);
await cp(resolve(root, "demo"), resolve(out, "demo"), { recursive: true });
await cp(resolve(root, "src"), resolve(out, "src"), { recursive: true });
console.log("Built research harness in build/ (serve with npm run dev).");
