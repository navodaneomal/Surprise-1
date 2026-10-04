#!/usr/bin/env node
// Build, verify, then write two zips:
//   dist/case-file-001.zip          the whole project (source, tools, docs)
//   dist/case-file-001-website.zip  ONLY the game, inside one folder
//                                   (unzip, then drag that folder onto Netlify Drop)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ROOT, SITE } from './lib.mjs';

const run = (cmd, args) => execFileSync(cmd, args, { cwd: ROOT, stdio: 'inherit' });
run(process.execPath, ['tools/build.mjs']);
run(process.execPath, ['tools/verify.mjs']);

const dist = path.join(ROOT, 'dist');
const kb = (f) => (fs.statSync(f).size / 1024).toFixed(0) + ' KB';

// 1. Whole project
const project = path.join(dist, 'case-file-001.zip');
fs.rmSync(project, { force: true });
const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: ROOT, encoding: 'utf8' })
  .split('\n').filter((f) => f && !f.endsWith('.zip') && fs.existsSync(path.join(ROOT, f)));
execFileSync('zip', ['-q', '-X', project, ...files], { cwd: ROOT });
console.log(`✓ wrote dist/case-file-001.zip (${kb(project)}, ${files.length} files)`);

// 2. Website only, wrapped in a single folder with index.html at its top
const website = path.join(dist, 'case-file-001-website.zip');
fs.rmSync(website, { force: true });
const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'cf001-'));
const folder = path.join(stage, 'case-file-001-website');
fs.cpSync(SITE, folder, { recursive: true });
execFileSync('zip', ['-q', '-X', '-r', website, 'case-file-001-website'], { cwd: stage });
fs.rmSync(stage, { recursive: true, force: true });
console.log(`✓ wrote dist/case-file-001-website.zip (${kb(website)}): unzip, then drag the folder onto https://app.netlify.com/drop`);
