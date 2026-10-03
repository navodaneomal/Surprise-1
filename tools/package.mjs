#!/usr/bin/env node
// Build, verify, then zip the whole project into dist/case-file-001.zip
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib.mjs';

const run = (cmd, args) => execFileSync(cmd, args, { cwd: ROOT, stdio: 'inherit' });
run(process.execPath, ['tools/build.mjs']);
run(process.execPath, ['tools/verify.mjs']);

const out = path.join(ROOT, 'dist', 'case-file-001.zip');
fs.rmSync(out, { force: true });
const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: ROOT, encoding: 'utf8' })
  .split('\n').filter((f) => f && !f.endsWith('.zip') && fs.existsSync(path.join(ROOT, f)));
execFileSync('zip', ['-q', '-X', out, ...files], { cwd: ROOT });
console.log(`✓ wrote dist/case-file-001.zip (${(fs.statSync(out).size / 1024).toFixed(0)} KB, ${files.length} files)`);
