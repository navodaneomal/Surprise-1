#!/usr/bin/env node
// Puzzle integrity checks for Case File 001.
// Proves, from the content itself, that every case key can be derived from the
// evidence the player sees, that the sealed vault opens with exactly those
// keys, and that nothing the engine needs is missing.
import fs from 'node:fs';
import path from 'node:path';
import { SITE, SALT, loadSeal, loadSound, loadContent, buildVault, vaultSource } from './lib.mjs';

const Seal = loadSeal();
const Sound = loadSound();
const content = await loadContent();
const { cases, deep, answers, config } = content;
const N = Seal.normalize;

let failures = 0, passes = 0;
function check(name, ok, detail = '') {
  if (ok) { passes++; console.log(`  ✓ ${name}`); }
  else { failures++; console.log(`  ✗ ${name}${detail ? `\n      ${detail}` : ''}`); }
}
const section = (t) => console.log(`\n${t}`);
const text = (html) => String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const ev = (n, id) => cases[n].evidence.find((e) => e.id === id);
const decodeMorse = (code) => {
  const rev = Object.fromEntries(Object.entries(Sound.MORSE).map(([k, v]) => [v, k]));
  return code.split(' / ').map((w) => w.split(' ').map((c) => rev[c] || '?').join('')).join(' ');
};

/* ── Case 001: acrostic and telestich ─────────────────────────────────── */
section('Case 001 · The Object');
const lines = ev(1, 'c1-note').data.lines;
const firsts = lines.map((l) => l.match(/[A-Za-z]/)[0]).join('').toUpperCase();
const lasts = lines.map((l) => l.match(/[A-Za-z](?=[^A-Za-z]*$)/)[0]).join('').toUpperCase();
check(`first letters of the note spell ${answers.c1.key}`, firsts === N(answers.c1.key), `got ${firsts}`);
check(`last letters of the note spell ${answers.c5.key} (Case 005)`, lasts === N(answers.c5.key), `got ${lasts}`);
check('the note can only be found through the photograph', ev(1, 'c1-note').requires === 'noteFound' &&
  ev(1, 'c1-photo').data.hotspots.some((h) => h.flag === 'noteFound' && h.reveal === 'c1-note'));
check('the note hints at its own reading ("Trust the beginnings")', /trust the beginnings/i.test(lines.join(' ')));

/* ── Case 002: minutes ordered by date -> A1Z26 ────────────────────────── */
section('Case 002 · The Pattern');
const frames = ev(2, 'c2-stills').data.frames.slice().sort((a, b) => a.day - b.day);
const letters = frames.map((f) => String.fromCharCode(64 + f.m)).join('');
check(`clock minutes in date order spell ${answers.c2.key}`, letters === N(answers.c2.key), `got ${letters}`);
const slipMins = ev(2, 'c2-slips').data.slips.map((s) => +s.time.split(':')[1]).sort((a, b) => a - b);
const frameMins = frames.map((f) => f.m).sort((a, b) => a - b);
check('slip times and clock times are the same six minutes', JSON.stringify(slipMins) === JSON.stringify(frameMins), `${slipMins} vs ${frameMins}`);
const slipIds = ev(2, 'c2-slips').data.slips.map((s) => s.id);
const shuffled = slipIds.some((id, i) => i > 0 && id < slipIds[i - 1]);
check('slips are shown out of date order (the stills are needed)', shuffled);
check('every minute is between 1 and 26', frameMins.every((m) => m >= 1 && m <= 26));
check('every clock reads ten-past-nine-ish (matches the witness)', frames.every((f) => f.h === 9 && f.m >= 5 && f.m <= 20));
const sorted = N(answers.c2.key).split('').sort().join('');
check('near-miss anagrams are handled (SILENT etc.)', ['SILENT', 'ENLIST', 'TINSEL', 'INLETS'].every((w) => answers.c2.near[w] && w.split('').sort().join('') === sorted));

/* ── Case 003: Morse ───────────────────────────────────────────────────── */
section('Case 003 · The Witness');
const tape = ev(3, 'c3-tape').data;
const morseCode = N(tape.morse).length && tape.morse.toUpperCase().split(/\s+/).map((w) => w.split('').map((c) => Sound.MORSE[c]).join(' ')).join(' / ');
check(`the hum decodes to ${answers.c3.key}`, N(decodeMorse(morseCode)) === N(answers.c3.key), decodeMorse(morseCode));
const tl = Sound.morseTimeline(tape.morse);
const mLine = tape.lines.find((l) => l.morse);
const after = tape.lines.find((l) => l.t > mLine.t);
check(`the recorded hum (${tl.length.toFixed(1)}s) fits before the next line`, mLine.t + tl.length < after.t, `${mLine.t}+${tl.length} vs ${after.t}`);
check('the handbook gives every letter needed', tape.morse.replace(/\s/g, '').toUpperCase().split('').every((c) => Sound.MORSE[c]));
check('tape lines are in time order', tape.lines.every((l, i) => i === 0 || l.t > tape.lines[i - 1].t));
const transcript = tape.lines.map((l) => l.text).join(' ');
check('the witness says the label appeared on the ninth', /label turned up on the ninth/i.test(transcript));
check('the witness contradicts the report (case always empty)', /empty for eleven years/i.test(transcript) && /never seen it/i.test(transcript));

/* ── Case 004: lock + Caesar ───────────────────────────────────────────── */
section('Case 004 · The Missing Piece');
const lock = answers.lock.split('').map(Number);
const card = text(ev(1, 'c1-card').data.html);
const report = text(ev(1, 'c1-report').data.html);
const NUM = { five: 5, six: 6 };
const notes = card.match(/melody of (\w+) notes/i);
check(`dial I = number of notes on the catalogue card (${lock[0]})`, notes && NUM[notes[1].toLowerCase()] === lock[0], notes && notes[1]);
check(`dial II = number of ◇ nights (${lock[1]})`, ev(2, 'c2-slips').data.slips.length === lock[1] && frames.length === lock[1]);
const labelFrame = frames.find((f) => f.label);
check(`dial III = night the label appeared (${lock[2]})`, labelFrame.day === lock[2] && /ninth/.test(transcript) && lock[2] === 9);
const caseNo = report.match(/display case (\d)/i);
check(`dial IV = display case number in the report (${lock[3]})`, caseNo && +caseNo[1] === lock[3]);
const box = ev(4, 'c4-box').data;
check('tags ask the four questions in dial order', box.tags.map((t) => t.icon).join(',') === 'note,diamond,label,case');
const slipHtml = text(ev(4, 'c4-slip').data.html);
const ciphers = [...ev(4, 'c4-slip').data.html.matchAll(/class="cipher">([A-Z ]+)</g)].map((m) => m[1]);
const room = +(/Reading Room (\d)/.exec(cases[1].brief)[1]);
const shift = (s, k) => s.replace(/[A-Z]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - 65 - k + 26) % 26) + 65));
check('the slip says to set the wheel to the room', /set the wheel to the room/i.test(slipHtml));
check(`"Contents" decodes at setting ${room} to ONE QUIET THING`, shift(ciphers[0], room) === 'ONE QUIET THING', shift(ciphers[0], room));
check(`"Filed under" decodes at setting ${room} to ${answers.c4.key}`, N(shift(ciphers[1], room)) === N(answers.c4.key), shift(ciphers[1], room));
check('solving 004 always grants the winding key', (cases[4].solveFlags || []).includes('hasKey'));

/* ── Case 005: the index and the lamp ──────────────────────────────────── */
section('Case 005 · The Archive');
const cab = ev(5, 'c5-index').data;
const drawer = cab.drawers.find((d) => d.cards.some((c) => c.no === '0047'));
const [lo, hi] = drawer.label.split('–').map(Number);
check('card 0047 is in the drawer whose range covers 47', lo <= 47 && 47 <= hi);
check('every card sits in the right drawer', cab.drawers.every((d) => { const [a, b] = d.label.split('–').map(Number); return d.cards.every((c) => +c.no >= a && +c.no <= b); }));
const c47 = drawer.cards.find((c) => c.no === '0047');
check('turning card 0047 over grants the lamp', c47.grant && c47.grant.flag === 'lamp' && ev(5, 'c5-lamp').requires === 'lamp');
check('UV ink exists for the curator’s note', !!cases[5].uv['c1-note']);
check('card 0047 under the lamp points to the note’s other edge', /two edges/i.test(cases[5].uv['c5-index'].cards['0047']));
check('every UV entry targets real evidence', Object.keys(cases[5].uv).every((id) => [1, 2, 3, 4, 5].some((n) => ev(n, id))));
check('every UV entry has a screen-reader description', Object.values(cases[5].uv).every((u) => u.sr));
check('UV slip dates restore 8–13 Nov in order', Object.entries(cases[5].uv['c2-slips'].slips).every(([id, v]) => +id.slice(1) === parseInt(v.date, 10)));

/* ── Case 006 + Deep Archive ───────────────────────────────────────────── */
section('Case 006 · The Truth / Deep Archive');
const finaleText = cases[6].finale.filter((x) => typeof x === 'string');
check('finale contains the required lines, in order', [
  'The object was never the point.',
  'You spent all this time looking for something hidden.',
  'Maybe that was the point.',
  'The things worth noticing are rarely the loudest things in the room.',
].every((l, i, arr) => finaleText.indexOf(l) >= 0 && (i === 0 || finaleText.indexOf(l) > finaleText.indexOf(arr[i - 1]))));
const allHtml = JSON.stringify([cases, deep]);
const marks = [...allHtml.matchAll(/data-mark=\\"(\d)\\" data-letter=\\"([A-Z])\\"/g)].map((m) => [+m[1], m[2]]);
const markNums = marks.map((m) => m[0]).sort();
check('exactly six margin marks, numbered 1–6', JSON.stringify(markNums) === '[1,2,3,4,5,6]', JSON.stringify(markNums));
const perCase = [1, 2, 3, 4, 5, 6].every((n) => JSON.stringify(cases[n]).includes(`data-mark=\\"${n}\\"`));
check('mark n lives in case n', perCase);
const word = marks.sort((a, b) => a[0] - b[0]).map((m) => m[1]).join('');
check(`marks in case order spell ${answers.deep.key}`, word === N(answers.deep.key), word);
check('deep archive has bonus evidence, unused documents, a hidden visual and curator notes',
  ['musicbox', 'plate'].every((t) => deep.evidence.some((e) => e.type === t)) && deep.sections.length >= 4);
check('the final subtle message comes from config.js', JSON.stringify(deep).includes(config.finalMessage.replace(/'/g, '\u2019').slice(0, 10)) || JSON.stringify(deep).includes(config.finalMessage.slice(0, 10)));
check('door hints exist for the Deep Archive', (cases[6].doorHints || []).length >= 3);

/* ── Structure ─────────────────────────────────────────────────────────── */
section('Structure');
const ids = [];
for (let n = 1; n <= 6; n++) cases[n].evidence.forEach((e) => ids.push(e.id));
deep.evidence.forEach((e) => ids.push(e.id));
check('evidence ids are unique', new Set(ids).size === ids.length);
const TYPES = ['doc', 'note', 'item', 'photo', 'slips', 'stills', 'tape', 'morsechart', 'lockbox', 'wheel', 'cabinet', 'scene', 'musicbox', 'plate'];
check('every evidence type has a renderer', ids.length && [...Object.values(cases).flatMap((c) => c.evidence), ...deep.evidence].every((e) => TYPES.includes(e.type)));
const evSrc = fs.readFileSync(path.join(SITE, 'js/evidence.js'), 'utf8');
check('every renderer exists in evidence.js', TYPES.every((t) => new RegExp(`T\\.${t} = \\{`).test(evSrc)));
const flagsSet = new Set(['noteFound', 'boxOpen', 'hasKey', 'lamp']);
const req = [...Object.values(cases).flatMap((c) => c.evidence)].filter((e) => e.requires).map((e) => e.requires);
check('every "requires" flag can be set by play', req.every((f) => flagsSet.has(f)), req.join(','));
for (let n = 1; n <= 5; n++) {
  check(`case ${n}: has a key question, hints, and a filed summary`, cases[n].key && cases[n].key.question && cases[n].hints.length >= 3 && cases[n].filed);
}
const reveals = ids.length && [...Object.values(cases).flatMap((c) => c.evidence)].flatMap((e) => (e.data.hotspots || []).map((h) => h.reveal).concat(e.data.reveals || [])).filter(Boolean);
check('every revealed exhibit exists', reveals.every((id) => ids.includes(id)));
check('photo hotspots stay inside the picture', ev(1, 'c1-photo').data.hotspots.every((h) => h.x >= 0 && h.y >= 0 && h.x + h.w <= 100 && h.y + h.h <= 100));

/* ── The sealed vault ──────────────────────────────────────────────────── */
section('Vault');
const vault = buildVault(content, Seal);
const built = fs.readFileSync(path.join(SITE, 'js/vault.js'), 'utf8');
check('site/js/vault.js is up to date', built === vaultSource(vault), 'run `npm run build`');
const scopes = ['c2', 'c3', 'c4', 'c5', 'c6', 'deep'];
const keyFor = { c2: answers.c1, c3: answers.c2, c4: answers.c3, c5: answers.c4, c6: answers.c5, deep: answers.deep };
for (const s of scopes) {
  const blob = vault.sealed[s];
  const opened = Seal.open(blob.d, keyFor[s].key, s, SALT);
  check(`${s} opens with "${keyFor[s].key}"`, opened && JSON.parse(opened));
  check(`${s} stays sealed for wrong keys`, ['', 'WRONG', 'PRESENTS', 'LISTENS', keyFor[s].key + 'X'].every((k) => Seal.open(blob.d, k, s, SALT) === null));
  for (const alt of keyFor[s].alts || []) {
    const entry = blob.alt.find((a) => a.t === Seal.tag(alt, s + ':alt', SALT));
    const canon = entry && Seal.open(entry.k, alt, s + ':alt', SALT);
    check(`${s} accepts "${alt}"`, canon && Seal.open(blob.d, canon, s, SALT) !== null);
  }
  for (const [word, msg] of Object.entries(keyFor[s].near || {})) {
    const entry = blob.near.find((a) => a.t === Seal.tag(word, s + ':near', SALT));
    check(`${s} nudges "${word}"`, entry && Seal.open(entry.m, word, s + ':near', SALT) === msg);
  }
}
const c4 = JSON.parse(Seal.open(vault.sealed.c4.d, answers.c3.key, 'c4', SALT));
check('the lock opens with the derived combination only', c4.evidence[0].data.lockTag === Seal.tag(answers.lock, 'lock', SALT) && c4.evidence[0].data.lockTag !== Seal.tag('0000', 'lock', SALT));
for (let n = 1; n <= 5; n++) {
  const c = n === 1 ? vault.c1 : JSON.parse(Seal.open(vault.sealed['c' + n].d, answers['c' + (n - 1)].key, 'c' + n, SALT));
  check(`case ${n}: "show me the key" reveals ${answers['c' + n].key}`, Seal.open(c.reveal, 'REVEAL', 'c' + n + ':reveal', SALT) === answers['c' + n].key);
}
const c6 = JSON.parse(Seal.open(vault.sealed.c6.d, answers.c5.key, 'c6', SALT));
check('the Deep Archive door reveal opens to its key', Seal.open(c6.doorReveal, 'REVEAL', 'deep:reveal', SALT) === answers.deep.key);
check('case 1 is readable without any key', vault.c1.id === 1 && vault.c1.evidence.length === 4);
check('no answer appears in the page source in the clear', ['c1', 'c2', 'c3', 'c4', 'c5', 'deep'].every((k) => !built.includes(answers[k].key)) && !built.includes(answers.lock));

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
