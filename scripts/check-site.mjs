import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..', 'site');
const required = [
  'index.html',
  'docs/index.html',
  'tracks/index.html',
  'config.js',
  'lab.js',
  'lab.css',
  'solana-product.js',
  'arc-product.css',
  'web-soma.js',
  'web-soma.css',
  'providers/solana-rpc.js',
  'providers/solana-wallet-standard.js',
  'api/solana.js',
  'assets/nervex-hero.mp4',
  'assets/nervex-hero-poster.webp',
  'assets/nervex-spider-logo.png',
  'assets/jetbrains-mono.woff2',
  'assets/models/agelenidae-soma.glb',
  'assets/models/uloborus-synganglion.glb',
  'assets/models/ATTRIBUTION.md',
  'vendor/three/three.module.js',
  'vendor/three/LICENSE-three.txt',
  'vercel.json',
];
const missing = required.filter((file) => !existsSync(resolve(root, file)));
if (missing.length) {
  throw new Error('Missing production-site files:\n' + missing.join('\n'));
}
const pages = ['index.html', 'docs/index.html', 'tracks/index.html'];
for (const page of pages) {
  const html = readFileSync(resolve(root, page), 'utf8');
  if (!html.includes('https://github.com/theovarne/nervex')) {
    throw new Error(page + ' lacks the repository link');
  }
  if (!html.includes('NERVEX')) {
    throw new Error(page + ' lacks the NERVEX brand');
  }
}
const config = readFileSync(resolve(root, 'config.js'), 'utf8');
if (!config.includes('https://github.com/theovarne/nervex')) {
  throw new Error('Production config has the wrong GitHub URL');
}
console.log('Production static snapshot: required files and links present.');
