import { execFileSync } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";

/** @param {string} dir */
async function files(dir) {
  /** @type {string[]} */
  const output = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, item.name);
    if (item.isDirectory()) output.push(...await files(path));
    else if ([".js", ".mjs"].includes(extname(path))) output.push(path);
  }
  return output;
}

for (const dir of ["src", "demo", "scripts", "tests"]) {
  for (const path of await files(dir)) {
    execFileSync(process.execPath, ["--check", path], { stdio: "pipe" });
    const content = await readFile(path, "utf8");
    if (/[^\S\n]+$/m.test(content) || !content.endsWith("\n")) {
      throw new Error(`Whitespace check failed: ${path}`);
    }
  }
}
console.log("Syntax and whitespace checks passed.");
