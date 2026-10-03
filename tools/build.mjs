#!/usr/bin/env node
// Build Case File 001.
//   node tools/build.mjs            seal src/content -> site/js/vault.js, write dist/case-file-001.html
//   node tools/build.mjs --check    fail if site/js/vault.js is out of date (used in CI)
//   node tools/build.mjs --fragment <file>   also write a <body>-only copy (for embedding hosts)
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, SITE, loadSeal, loadContent, buildVault, vaultSource, standaloneHtml, fragmentHtml } from './lib.mjs';

const args = process.argv.slice(2);
const check = args.includes('--check');
const fragIdx = args.indexOf('--fragment');

const Seal = loadSeal();
const content = await loadContent();
const source = vaultSource(buildVault(content, Seal));
const vaultPath = path.join(SITE, 'js', 'vault.js');

if (check) {
  const current = fs.existsSync(vaultPath) ? fs.readFileSync(vaultPath, 'utf8') : '';
  if (current !== source) {
    console.error('✗ site/js/vault.js is out of date. Run `npm run build` and commit the result.');
    process.exit(1);
  }
  console.log('✓ site/js/vault.js matches src/content');
  process.exit(0);
}

fs.writeFileSync(vaultPath, source);
console.log(`✓ wrote site/js/vault.js (${(source.length / 1024).toFixed(1)} KB)`);

const dist = path.join(ROOT, 'dist');
fs.mkdirSync(dist, { recursive: true });
const full = standaloneHtml();
fs.writeFileSync(path.join(dist, 'case-file-001.html'), full);
console.log(`✓ wrote dist/case-file-001.html (${(full.length / 1024).toFixed(0)} KB, single file, works offline)`);

if (fragIdx >= 0 && args[fragIdx + 1]) {
  const out = path.resolve(args[fragIdx + 1]);
  fs.writeFileSync(out, fragmentHtml(full));
  console.log(`✓ wrote fragment ${out}`);
}
