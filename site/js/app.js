/*
 * Case File 001 — application shell.
 * Screens, routing, saving, keys, hints, notebook, settings, the lamp,
 * margin marks, the finale and the Deep Archive door.
 * No network access of any kind: everything is in this page.
 */
(function () {
  'use strict';

  var V = window.VAULT, Seal = window.Seal, Ev = window.Evidence, Art = window.Art, Sound = window.Sound;
  var d = document, html = d.documentElement;
  var esc = Ev.esc;
  var SAVE_KEY = 'wrenfield.casefile001.v1';
  var MARK_COUNT = 6;

  /* ── State & saving ─────────────────────────────────────────────────────── */
  var DEFAULTS = {
    v: 1, begun: false, coverSeen: false, closed: false, last: 'file',
    keys: {}, deepKey: null, flags: {}, seen: {}, hotspots: {}, notes: [], marks: {},
    hints: {}, reveals: {}, doorHints: 0, wrong: 0,
    settings: { sound: true, motion: 'system', text: 'normal' }
  };
  function fresh() { return JSON.parse(JSON.stringify(DEFAULTS)); }
  function load() {
    var s = fresh();
    try {
      var raw = window.localStorage.getItem(SAVE_KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        if (saved && saved.v === 1) {
          Object.keys(s).forEach(function (k) { if (saved[k] !== undefined) s[k] = saved[k]; });
          s.settings = Object.assign(fresh().settings, saved.settings || {});
        }
      }
    } catch (e) { /* private mode or blocked storage: play without saving */ }
    return s;
  }
  var state = load();
  function save() {
    try { window.localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* not saved */ }
  }
  function wipe() {
    try { window.localStorage.removeItem(SAVE_KEY); } catch (e) { /* nothing to remove */ }
    var keep = state.settings;
    state = fresh();
    state.settings = keep;
    save();
    restore();
    uiStore = {};
  }

  /* ── Content: unseal what the saved keys open ───────────────────────────── */
  var cases = {}, deep = null, uiStore = {};
  function openSealed(scope, key) {
    var blob = V.sealed[scope];
    if (!blob || !key) return null;
    var text = Seal.open(blob.d, key, scope, V.salt);
    if (text == null) return null;
    try { return JSON.parse(text); } catch (e) { return null; }
  }
  function restore() {
    cases = { 1: V.c1 };
    deep = null;
    for (var n = 1; n <= 5; n++) {
      if (!state.keys[n]) break;
      var c = openSealed('c' + (n + 1), state.keys[n]);
      if (!c) { for (var m = n; m <= 5; m++) delete state.keys[m]; break; }
      cases[n + 1] = c;
    }
    if (!cases[6]) state.closed = false;
    if (state.deepKey) {
      deep = state.closed ? openSealed('deep', state.deepKey) : null;
      if (!deep) state.deepKey = null;
    }
  }
  function tryKey(scope, input) {
    var norm = Seal.normalize(input);
    if (!norm) return { empty: true };
    var blob = V.sealed[scope];
    var data = openSealed(scope, norm);
    if (data) return { ok: true, key: norm, data: data };
    var t = Seal.tag(norm, scope + ':alt', V.salt), i;
    for (i = 0; i < blob.alt.length; i++) {
      if (blob.alt[i].t !== t) continue;
      var canon = Seal.open(blob.alt[i].k, norm, scope + ':alt', V.salt);
      data = canon && openSealed(scope, canon);
      if (data) return { ok: true, key: Seal.normalize(canon), data: data };
    }
    t = Seal.tag(norm, scope + ':near', V.salt);
    for (i = 0; i < blob.near.length; i++) {
      if (blob.near[i].t !== t) continue;
      var msg = Seal.open(blob.near[i].m, norm, scope + ':near', V.salt);
      if (msg) return { near: msg };
    }
    return {};
  }

  function allEvidence() {
    var out = [];
    for (var n = 1; n <= 6; n++) if (cases[n]) cases[n].evidence.forEach(function (ev) { out.push({ ev: ev, c: n }); });
    if (deep) deep.evidence.forEach(function (ev) { out.push({ ev: ev, c: 'deep' }); });
    return out;
  }
  function findEvidence(id) {
    var all = allEvidence();
    for (var i = 0; i < all.length; i++) if (all[i].ev.id === id) return all[i];
    return null;
  }
  function visible(ev) { return !ev.requires || !!state.flags[ev.requires]; }
  function titleMap() { var m = {}; allEvidence().forEach(function (x) { m[x.ev.id] = stripTags(x.ev.title); }); return m; }
  function stripTags(s) { return String(s).replace(/<[^>]*aria-label="([^"]*)"[^>]*><\/i>/g, '$1').replace(/<[^>]+>/g, ''); }
  function uvFor(id) {
    if (!state.flags.lamp) return null;
    var a = (cases[5] && cases[5].uv) || {}, b = (deep && deep.uv) || {};
    return a[id] || b[id] || null;
  }
  function solved(n) { return n === 6 ? state.closed : !!state.keys[n]; }
  function revealOf(n) { var c = cases[n]; return (c && c.reveal && Seal.open(c.reveal, 'REVEAL', 'c' + n + ':reveal', V.salt)) || ''; }
  function doorReveal() { var c = cases[6]; return (c && c.doorReveal && Seal.open(c.doorReveal, 'REVEAL', 'deep:reveal', V.salt)) || ''; }
  function code(n) { return '00' + n; }

  /* ── Settings ───────────────────────────────────────────────────────────── */
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function reduced() {
    var m = state.settings.motion;
    if (m === 'reduce') return true;
    if (m === 'full') return false;
    return !!(mq && mq.matches);
  }
  function applySettings() {
    html.classList.toggle('reduce-motion', reduced());
    html.classList.toggle('text-lg', state.settings.text === 'large');
    Sound.setEnabled(state.settings.sound);
  }
  if (mq && mq.addEventListener) mq.addEventListener('change', applySettings);

  /* ── Small UI helpers ───────────────────────────────────────────────────── */
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var screenEl = $('#screen'), openingEl = $('#opening'), layer = $('#layer'), toastEl = $('#toast'), srEl = $('#sr'), appEl = $('#app');

  function announce(msg) { srEl.textContent = ''; setTimeout(function () { srEl.textContent = msg; }, 30); }
  // One toast at a time; a newer message replaces the current one so nothing arrives late.
  var toastTimer = 0;
  function toast(msg) {
    toastEl.innerHTML = '<span>' + msg + '</span>';
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, Math.min(7000, 2600 + String(msg).length * 30));
  }
  function hideToast() { clearTimeout(toastTimer); toastEl.classList.remove('on'); }
  function today() {
    try { return new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return new Date().toDateString(); }
  }
  function now() { var t = new Date(); return ('0' + t.getHours()).slice(-2) + ':' + ('0' + t.getMinutes()).slice(-2); }
  function setFlag(f) { if (!state.flags[f]) { state.flags[f] = true; save(); } }
  function addNote(c, h) {
    for (var i = 0; i < state.notes.length; i++) if (state.notes[i].h === h) return;
    state.notes.push({ c: c, h: h });
  }
  function markSeen(ev, c) {
    if (state.seen[ev.id]) return;
    state.seen[ev.id] = true;
    (ev.notes || []).forEach(function (n) { addNote(c, n); });
    save();
  }
  function marksFound() { return Object.keys(state.marks).length; }
  function marginSlots() {
    var s = '';
    for (var n = 1; n <= MARK_COUNT; n++) s += '<span class="slot' + (state.marks[n] ? ' got' : '') + '" aria-label="' + (state.marks[n] ? 'Case ' + code(n) + ': ' + state.marks[n] : 'Case ' + code(n) + ': not found') + '">' + (state.marks[n] ? esc(state.marks[n]) : '·') + '</span>';
    return '<div class="margins" role="group" aria-label="Margin marks, in case order">' + s + '</div>';
  }

  /* Paper grain, drawn once */
  (function grain() {
    try {
      var c = d.createElement('canvas'); c.width = c.height = 96;
      var x = c.getContext('2d'), img = x.createImageData(96, 96);
      for (var i = 0; i < img.data.length; i += 4) {
        var v = (Math.random() * 255) | 0;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 22;
      }
      x.putImageData(img, 0, 0);
      html.style.setProperty('--grain', 'url(' + c.toDataURL() + ')');
    } catch (e) { /* plain paper */ }
  })();

  /* ── Routing ─────────────────────────────────────────────────────────────
   * #file  #case3  #closed  #deep  #finale   (+ .ev.<id> or .<panel>)
   * Dialogs push a history entry so the phone's back button closes them. */
  var memMode = false, memHash = '', memDepth = 0;
  function rawHash() { return memMode ? memHash : (location.hash || '').replace(/^#/, ''); }
  function depth() { return memMode ? memDepth : ((history.state && history.state.d) || 0); }
  function parse(h) {
    var parts = (h || '').split('.'), r = { screen: 'opening', n: 0, overlay: null };
    var s = parts[0];
    if (s === 'file' || s === 'closed' || s === 'deep' || s === 'finale') r.screen = s;
    else if (/^case[1-6]$/.test(s)) { r.screen = 'case'; r.n = +s.slice(4); }
    if (parts[1] === 'ev' && parts[2]) r.overlay = { type: 'ev', id: parts.slice(2).join('.') };
    else if (parts[1]) r.overlay = { type: 'panel', name: parts[1] };
    r.base = r.screen === 'case' ? 'case' + r.n : (r.screen === 'opening' ? '' : r.screen);
    return r;
  }
  function go(h, replace) {
    var cur = parse(rawHash()), nxt = parse(h);
    var dep = nxt.overlay ? (cur.base === nxt.base ? (cur.overlay ? depth() + 1 : 1) : 0) : 0;
    if (replace) dep = nxt.overlay ? depth() : 0;
    try {
      if (memMode) throw new Error('mem');
      if (replace) history.replaceState({ d: dep }, '', '#' + h);
      else history.pushState({ d: dep }, '', '#' + h);
    } catch (e) {
      memMode = true; memHash = h; memDepth = dep;
    }
    route();
  }
  function closeOverlay() {
    var r = parse(rawHash());
    if (!r.overlay) return;
    if (!memMode && depth() > 0) { try { history.back(); return; } catch (e) { /* fall through */ } }
    go(r.base, true);
  }
  window.addEventListener('popstate', route);
  window.addEventListener('hashchange', route);
  d.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    var h = a.getAttribute('href').slice(1);
    if (a.hasAttribute('data-open')) return; // handled by the evidence viewer
    e.preventDefault();
    go(h);
  });

  var curScreen = null, curOverlay = null, lastRoute = null;
  function route() {
    var r = parse(rawHash());
    lastRoute = r;
    if (r.screen !== 'opening' && !state.begun) return go('', true);
    if (r.screen === 'case' && !cases[r.n]) return go('file', true);
    if (r.screen === 'closed' && !state.closed) return go('file', true);
    if (r.screen === 'deep' && !deep) return go(state.closed ? 'closed' : 'file', true);
    if (r.screen === 'finale' && !cases[6]) return go('file', true);
    var key = r.base;
    if (key !== curScreen) {
      closeOverlayDom(true);
      curScreen = key;
      renderScreen(r, { top: true });
    }
    syncOverlay(r);
  }

  /* ── Screens ────────────────────────────────────────────────────────────── */
  var stopStatic = null;
  function renderScreen(r, opts) {
    opts = opts || {};
    if (stopStatic) { stopStatic(); stopStatic = null; }
    if (r.screen === 'opening') {
      screenEl.hidden = true; screenEl.innerHTML = '';
      openingEl.hidden = false;
      setupOpening();
      return;
    }
    openingEl.hidden = true;
    screenEl.hidden = false;
    var htmlOut;
    if (r.screen === 'file') htmlOut = dossierHtml();
    else if (r.screen === 'case') htmlOut = caseHtml(r.n, opts);
    else if (r.screen === 'closed') htmlOut = closedHtml();
    else if (r.screen === 'deep') htmlOut = deepHtml();
    else if (r.screen === 'finale') htmlOut = '';
    screenEl.className = 'screen screen-' + r.screen;
    if (r.screen === 'finale') { runFinale(); return; }
    screenEl.innerHTML = htmlOut;
    if (r.screen !== 'finale') { state.last = r.base; save(); }
    mountScreen(r);
    if (opts.top) {
      window.scrollTo(0, 0);
      var main = $('#main', screenEl);
      if (main) try { main.focus({ preventScroll: true }); } catch (e) { main.focus(); }
    }
  }
  function refreshScreen(focusKey) {
    var r = parse(rawHash()), y = window.scrollY;
    renderScreen(r, {});
    window.scrollTo(0, y);
    if (focusKey) { var t = $('[data-k="' + focusKey + '"]', screenEl); if (t) try { t.focus({ preventScroll: true }); } catch (e) { t.focus(); } }
  }

  function topbar(back, title, base) {
    return '<header class="topbar"><div class="tb-in">' +
      (back ? '<a class="tb-back" href="#' + back.href + '" data-k="tb-back"><span aria-hidden="true">←</span> ' + back.label + '</a>' : '<span class="tb-brand">Wrenfield · WA/001</span>') +
      '<span class="tb-title">' + title + '</span>' +
      '<nav class="tb-actions" aria-label="Tools"><a class="tb-btn" href="#' + base + '.notes" data-k="tb-notes">Notebook</a><a class="tb-btn" href="#' + base + '.settings" data-k="tb-settings">Settings</a></nav>' +
      '</div></header>';
  }

  /* Opening */
  function setupOpening() {
    var st = $('[data-status]', openingEl);
    st.textContent = state.closed ? 'CLOSED' : 'UNRESOLVED';
    var btn = $('#begin', openingEl), restart = $('#restart', openingEl), confirmBox = $('#restart-confirm', openingEl);
    btn.textContent = !state.begun ? 'BEGIN INVESTIGATION' : (state.closed ? 'REOPEN THE FILE' : 'RESUME INVESTIGATION');
    restart.hidden = !state.begun;
    confirmBox.hidden = true;
    stopStatic = staticNoise($('canvas.static', openingEl), 1900);
  }
  function staticNoise(canvas, ms) {
    if (!canvas || !canvas.getContext) return null;
    var x = canvas.getContext('2d'), w = canvas.width, h = canvas.height, img = x.createImageData(w, h);
    var stopped = false, raf = 0, last = 0, end = performance.now() + ms;
    function draw() {
      var p = img.data;
      for (var i = 0; i < p.length; i += 4) { var v = (Math.random() * 255) | 0; p[i] = p[i + 1] = p[i + 2] = v; p[i + 3] = 255; }
      x.putImageData(img, 0, 0);
    }
    canvas.classList.remove('settled');
    draw();
    if (reduced()) { canvas.classList.add('settled'); return null; }
    (function loop(t) {
      if (stopped) return;
      if (t - last > 70) { draw(); last = t; }
      if (t < end) raf = requestAnimationFrame(loop); else canvas.classList.add('settled');
    })(performance.now());
    return function () { stopped = true; cancelAnimationFrame(raf); };
  }
  function begin() {
    Sound.unlock();
    Sound.static(0.9);
    var canvas = $('canvas.static', openingEl);
    if (canvas && !reduced()) { canvas.classList.remove('settled'); if (stopStatic) stopStatic(); stopStatic = staticNoise(canvas, 600); }
    var target;
    if (!state.begun) { state.begun = true; save(); target = state.coverSeen ? 'file' : 'file.cover'; }
    else target = state.last || 'file';
    setTimeout(function () { go(target); }, reduced() ? 0 : 520);
  }
  $('#begin').addEventListener('click', begin);
  $('#restart').addEventListener('click', function () { $('#restart-confirm').hidden = false; $('#restart-yes').focus(); });
  $('#restart-no').addEventListener('click', function () { $('#restart-confirm').hidden = true; $('#restart').focus(); });
  $('#restart-yes').addEventListener('click', function () { wipe(); setupOpening(); $('#begin').focus(); toast('Progress erased. The file is sealed again.'); });

  /* Dossier */
  function dossierHtml() {
    var filed = 0;
    for (var k = 1; k <= 5; k++) if (state.keys[k]) filed++;
    var current = 0;
    for (var c = 1; c <= 6; c++) if (cases[c] && !solved(c)) { current = c; break; }
    var folders = V.index.map(function (item, i) {
      var n = i + 1, open = !!cases[n], done = solved(n);
      var status = !open ? 'Sealed' : (done ? (n === 6 ? 'Closed' : 'Key filed') : (n === current ? 'Open' : 'Open'));
      var cls = 'folder' + (!open ? ' is-sealed' : done ? ' is-filed' : ' is-open') + (n === current ? ' is-current' : '');
      var teaser = open ? cases[n].teaser : 'Sealed until the case before it is solved.';
      var inner = '<span class="f-tab">' + item.code + '</span>' +
        '<span class="f-body"><span class="f-title">' + esc(item.title) + '</span><span class="f-teaser">' + esc(teaser) + '</span></span>' +
        '<span class="f-state">' + status + '</span>';
      return '<li class="' + cls + '">' + (open
        ? '<a class="folder-link" href="#case' + n + '" data-k="folder-' + n + '">' + inner + '</a>'
        : '<div class="folder-link" aria-disabled="true">' + inner + '</div>') + '</li>';
    }).join('');
    var door = state.closed ? '<button type="button" class="door" data-door data-k="door" aria-label="A faint diamond at the bottom of the page"><i class="sym sym-d" aria-hidden="true"></i></button>' : '';
    return topbar(null, '', 'file') +
      '<main class="wrap dossier" id="main" tabindex="-1">' +
      '<div class="dossier-head">' +
      '<p class="eyebrow">The Wrenfield Archive · Reading Room 4</p>' +
      '<h1 class="title-xl">Case File 001</h1>' +
      '<p class="status-line">Item 0047 · Status: <b class="st ' + (state.closed ? 'st-closed' : 'st-open') + '">' + (state.closed ? 'Closed' : 'Unresolved') + '</b></p>' +
      '<p class="dossier-help">Read the evidence in each case. Find the case key and file it to unseal the next one. Capitals and spaces don’t matter. Nothing you type leaves this device.</p>' +
      '</div>' +
      '<ol class="folders" aria-label="Cases">' + folders + '</ol>' +
      '<div class="dossier-foot"><p class="progress-line">Keys filed: <b>' + filed + '</b> of 5' + (state.closed ? ' · <a href="#closed">Case closed</a>' : '') + (deep ? ' · <a href="#deep">Deep Archive</a>' : '') + '</p></div>' +
      door + '</main>';
  }

  /* Case */
  function caseHtml(n, opts) {
    var c = cases[n];
    var exhibits = c.evidence.filter(visible).map(function (ev) {
      var seen = !!state.seen[ev.id];
      return '<li><a class="exhibit' + (seen ? ' seen' : ' new') + '" href="#case' + n + '.ev.' + ev.id + '" data-k="ex-' + ev.id + '">' +
        '<span class="ex-icon">' + Art.icon(ev.icon) + '</span>' +
        '<span class="ex-text"><span class="ex-label">' + esc(ev.label) + '</span><span class="ex-title">' + ev.title + '</span></span>' +
        '<span class="ex-state">' + (seen ? 'Read' : 'New') + '</span></a></li>';
    }).join('');
    var hidden = c.evidence.length - c.evidence.filter(visible).length;
    var keyArea = '';
    if (n <= 5) {
      if (state.keys[n]) {
        keyArea = '<section class="filed' + (opts.justFiled ? ' just-filed' : '') + '" aria-labelledby="filed-h">' +
          '<h2 class="section-label" id="filed-h">Case key</h2>' +
          '<div class="filed-card"><span class="stamp stamp-filed" aria-hidden="true">Key filed</span>' +
          '<p class="filed-key">' + esc(revealOf(n) || state.keys[n]) + '</p><p class="filed-text">' + c.filed + '</p></div>' +
          '<a class="btn" href="#case' + (n + 1) + '" data-k="next">Open Case ' + code(n + 1) + ': ' + esc(V.index[n].title) + ' <span aria-hidden="true">→</span></a></section>';
      } else {
        keyArea = '<section class="keybox" aria-labelledby="key-h">' +
          '<h2 class="section-label" id="key-h">Case key</h2>' +
          '<form class="keyform" data-case="' + n + '" novalidate autocomplete="off">' +
          '<label for="key-' + n + '" class="kq">' + c.key.question + '</label>' +
          '<div class="key-row"><input id="key-' + n + '" class="key-input" type="text" inputmode="text" autocomplete="off" autocapitalize="characters" autocorrect="off" spellcheck="false" enterkeyhint="go" maxlength="40" placeholder="' + esc(c.key.mask.split('').join(' ')) + '" aria-describedby="key-msg-' + n + '">' +
          '<button class="btn" type="submit">File key</button></div>' +
          '<p class="key-msg" id="key-msg-' + n + '" role="status" aria-live="polite"></p></form>' +
          '<a class="btn-text hint-link" href="#case' + n + '.hints" data-k="hints">Need a hint?</a></section>';
      }
    } else {
      keyArea = state.closed
        ? '<section class="filed"><div class="filed-card"><span class="stamp stamp-filed" aria-hidden="true">Case closed</span><p class="filed-text">' + c.filed + '</p></div><a class="btn" href="#closed" data-k="closed">Case closed <span aria-hidden="true">→</span></a></section>'
        : '<section class="keybox"><p class="muted">No key to find here. Read what’s left, then go into Reading Room 4.</p><a class="btn-text hint-link" href="#case6.hints" data-k="hints">Need a hint?</a></section>';
    }
    return topbar({ href: 'file', label: 'File' }, 'Case ' + code(n), 'case' + n) +
      '<main class="wrap case" id="main" tabindex="-1">' +
      '<p class="eyebrow">Case File 001 · Part ' + code(n) + '</p>' +
      '<h1 class="case-title">' + esc(c.title) + '</h1>' +
      (c.transition ? '<aside class="file-note" aria-label="File note"><p class="fn-label">File note</p>' + c.transition + '</aside>' : '') +
      '<div class="brief prose">' + c.brief + '</div>' +
      '<h2 class="section-label">Evidence</h2>' +
      '<ul class="exhibits">' + exhibits + '</ul>' +
      (hidden > 0 ? '<p class="small muted more-evidence">Some evidence in this case hasn’t turned up yet.</p>' : '') +
      keyArea + '</main>';
  }

  var WRONG = ['No match in the file.', 'The archive doesn’t recognise that key.', 'Nothing. The file stays sealed.', 'That isn’t it. Look again.'];
  function fileKey(n, value, form) {
    var msgEl = form ? $('.key-msg', form) : null, input = form ? $('.key-input', form) : null;
    var res = tryKey('c' + (n + 1), value);
    function say(t, cls) { if (msgEl) { msgEl.textContent = t; msgEl.className = 'key-msg ' + (cls || ''); } }
    if (res.empty) { say('Type a key first.'); return; }
    if (res.ok) {
      state.keys[n] = res.key;
      cases[n + 1] = res.data;
      (cases[n].solveFlags || []).forEach(function (f) { state.flags[f] = true; });
      save();
      Sound.stamp();
      announce('Key accepted. Case ' + code(n + 1) + ' is unsealed.');
      renderScreen(parse('case' + n), { justFiled: true });
      var sec = $('.filed', screenEl);
      if (sec) { sec.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' }); var nx = $('[data-k="next"]', sec); if (nx) try { nx.focus({ preventScroll: true }); } catch (e) { nx.focus(); } }
      return;
    }
    if (res.near) { say(res.near, 'near'); Sound.click(); return; }
    state.wrong++; save();
    say(WRONG[state.wrong % WRONG.length], 'wrong');
    Sound.rattle();
    if (input && !reduced()) { input.classList.remove('shake'); void input.offsetWidth; input.classList.add('shake'); }
  }

  /* Closed */
  function closedHtml() {
    var c6 = cases[6], hints = 0, reveals = 0;
    Object.keys(state.hints).forEach(function (k) { hints += (state.hints[k] || []).length; });
    Object.keys(state.reveals).forEach(function (k) { if (state.reveals[k]) reveals++; });
    return topbar({ href: 'file', label: 'File' }, 'Case closed', 'closed') +
      '<main class="wrap closed" id="main" tabindex="-1">' +
      '<div class="closed-stamp" aria-hidden="true">Case closed</div>' +
      '<h1 class="title-xl">Case File 001</h1>' +
      '<p class="status-line">Item 0047 · Status: <b class="st st-closed">Closed</b></p>' +
      '<div class="closed-text prose">' + c6.closed.lines.map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') + '</div>' +
      '<dl class="stats">' +
      '<div><dt>Keys filed</dt><dd>5</dd></div>' +
      '<div><dt>Hints read</dt><dd>' + hints + '</dd></div>' +
      '<div><dt>Keys revealed</dt><dd>' + reveals + '</dd></div>' +
      '<div><dt>Wrong keys</dt><dd>' + state.wrong + '</dd></div>' +
      '</dl>' +
      '<div class="closed-actions"><a class="btn" href="#file" data-k="review">Review the file</a>' + (deep ? '<a class="btn btn-ghost" href="#deep" data-k="deep">Deep Archive</a>' : '') + '</div>' +
      '<p class="whisper-line">' + esc(c6.closed.whisper) + '</p>' +
      '<button type="button" class="door" data-door data-k="door" aria-label="A faint diamond at the bottom of the page"><i class="sym sym-d" aria-hidden="true"></i></button>' +
      '</main>';
  }

  /* Deep Archive */
  function deepHtml() {
    var sections = deep.sections.map(function (s) {
      var items = s.items.map(function (id) {
        var ev = deep.evidence.filter(function (e) { return e.id === id; })[0];
        if (!ev) return '';
        var seen = !!state.seen[ev.id];
        return '<li><a class="exhibit vault' + (seen ? ' seen' : ' new') + '" href="#deep.ev.' + ev.id + '" data-k="ex-' + ev.id + '">' +
          '<span class="ex-icon">' + Art.icon(ev.icon) + '</span>' +
          '<span class="ex-text"><span class="ex-label">' + esc(ev.label) + '</span><span class="ex-title">' + ev.title + '</span></span>' +
          '<span class="ex-state">' + (seen ? 'Read' : 'New') + '</span></a></li>';
      }).join('');
      return '<section class="deep-sec"><h2 class="section-label">' + esc(s.title) + '</h2><ul class="exhibits">' + items + '</ul></section>';
    }).join('');
    return topbar({ href: 'closed', label: 'Case closed' }, 'Deep Archive', 'deep') +
      '<main class="wrap deep" id="main" tabindex="-1">' +
      '<p class="eyebrow">Restricted · Wrenfield Archive</p>' +
      '<h1 class="title-xl">' + esc(deep.title) + '</h1>' +
      '<div class="brief prose">' + deep.intro + '</div>' + sections + '</main>';
  }

  /* Finale */
  var finaleTimers = [];
  function runFinale() {
    finaleTimers.forEach(clearTimeout); finaleTimers = [];
    var seq = cases[6].finale.slice();
    screenEl.innerHTML =
      '<main class="finale" id="main" tabindex="-1">' +
      '<div class="fin-stage" aria-live="polite"><p class="fin-line"></p></div>' +
      '<div class="fin-end" hidden><div class="fin-stamp">Case closed</div><a class="btn" href="#closed" data-k="fin-continue">Continue</a></div>' +
      '<button type="button" class="fin-skip">Skip</button></main>';
    if (!state.closed) { state.closed = true; save(); }
    state.last = 'closed'; save();
    hideToast();
    var line = $('.fin-line', screenEl), stage = $('.fin-stage', screenEl), end = $('.fin-end', screenEl);
    var main = $('#main', screenEl);
    try { main.focus({ preventScroll: true }); } catch (e) { main.focus(); }
    var i = 0, waiting = null, rm = reduced();
    Sound.unlock();
    Sound.static(1.4);
    function finish() {
      finaleTimers.forEach(clearTimeout); finaleTimers = [];
      waiting = null;
      line.classList.add('on');
      end.hidden = false;
      $('.fin-skip', screenEl).hidden = true;
      Sound.stamp();
      var b = $('a', end);
      setTimeout(function () { try { b.focus({ preventScroll: true }); } catch (e) { b.focus(); } }, rm ? 0 : 900);
    }
    function next() {
      if (i >= seq.length) { finish(); return; }
      var item = seq[i++];
      if (typeof item === 'number') { waiting = setTimeout(next, rm ? Math.min(item, 1200) : item); finaleTimers.push(waiting); return; }
      line.classList.remove('on');
      finaleTimers.push(setTimeout(function () {
        line.textContent = item;
        line.classList.add('on');
        var read = 1400 + item.length * 45;
        waiting = setTimeout(function () {
          var last = seq.slice(i).every(function (x) { return typeof x === 'number'; });
          if (!last) line.classList.remove('on');
          finaleTimers.push(setTimeout(next, last ? 0 : (rm ? 0 : 900)));
        }, read);
        finaleTimers.push(waiting);
      }, rm ? 0 : 700));
    }
    stage.addEventListener('click', function () {
      if (!waiting) return;
      clearTimeout(waiting); waiting = null;
      finaleTimers.forEach(clearTimeout); finaleTimers = [];
      next();
    });
    $('.fin-skip', screenEl).addEventListener('click', function () {
      var lastLine = seq.filter(function (x) { return typeof x === 'string'; }).pop();
      line.textContent = lastLine;
      finish();
    });
    finaleTimers.push(setTimeout(next, rm ? 200 : 1600));
  }

  /* Screen interactions */
  function mountScreen(r) {
    var form = $('.keyform', screenEl);
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = $('.key-input', form);
        fileKey(+form.getAttribute('data-case'), input.value, form);
      });
    }
    $$('[data-door]', screenEl).forEach(function (b) {
      b.addEventListener('click', function () {
        if (deep) { go('deep'); return; }
        go(r.base + '.door');
      });
    });
  }

  /* ── Overlays: evidence viewer and panels ───────────────────────────────── */
  var lamp = { on: false, mode: 'beam' };
  var opener = null;

  function closeOverlayDom(silent) {
    if (!curOverlay) return;
    var o = curOverlay;
    curOverlay = null;
    if (o.cleanup) o.cleanup();
    o.root.remove();
    appEl.removeAttribute('aria-hidden');
    if ('inert' in appEl) appEl.inert = false;
    html.classList.remove('dlg-open');
    d.removeEventListener('keydown', o.keys, true);
    if (!silent) {
      var k = opener;
      refreshScreen(k);
      opener = null;
    }
  }

  function syncOverlay(r) {
    var want = r.overlay ? r.overlay.type + ':' + (r.overlay.id || r.overlay.name) : null;
    if (curOverlay && curOverlay.key === want) return;
    if (curOverlay) closeOverlayDom(!!want);
    if (!want) return;
    if (r.overlay.type === 'ev') openEvidence(r, r.overlay.id);
    else openPanel(r, r.overlay.name);
  }

  function makeDialog(key, opts) {
    var ae = d.activeElement;
    if (!curOverlay && ae && ae.getAttribute) opener = ae.getAttribute('data-k') || opener;
    var root = d.createElement('div');
    root.className = 'overlay ' + (opts.kind || '');
    root.innerHTML =
      '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="dlg-title">' +
      '<header class="sheet-head"><div class="sheet-titles">' + (opts.label ? '<p class="sheet-label">' + esc(opts.label) + '</p>' : '') +
      '<h2 id="dlg-title" class="sheet-title" tabindex="-1">' + opts.title + '</h2></div>' +
      '<div class="sheet-tools"></div>' +
      '<button type="button" class="sheet-close" aria-label="Close"><span aria-hidden="true">×</span></button></header>' +
      '<div class="sheet-body"></div></div>';
    layer.appendChild(root);
    appEl.setAttribute('aria-hidden', 'true');
    if ('inert' in appEl) appEl.inert = true;
    html.classList.add('dlg-open');
    var sheet = $('.sheet', root);
    root.addEventListener('click', function (e) {
      if (e.target === root) closeOverlay();
      var op = e.target.closest('[data-open]');
      if (op) {
        e.preventDefault();
        var base = parse(rawHash()).base;
        go(base + '.ev.' + op.getAttribute('data-open'));
      }
    });
    $('.sheet-close', root).addEventListener('click', closeOverlay);
    var keys = function (e) {
      if (e.key === 'Escape') { e.preventDefault(); closeOverlay(); return; }
      if (e.key !== 'Tab') return;
      var f = $$('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])', sheet)
        .filter(function (el) { return el.offsetParent !== null && !el.closest('[inert]') && !el.closest('.uvlayer'); });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (d.activeElement === first || !sheet.contains(d.activeElement))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    d.addEventListener('keydown', keys, true);
    var dlg = { key: key, root: root, sheet: sheet, body: $('.sheet-body', root), tools: $('.sheet-tools', root), keys: keys, cleanup: null };
    curOverlay = dlg;
    setTimeout(function () { var t = $('#dlg-title', root); if (t) try { t.focus({ preventScroll: true }); } catch (e) { t.focus(); } }, 20);
    return dlg;
  }

  /* Evidence viewer */
  function openEvidence(r, id) {
    var found = findEvidence(id);
    if (!found || !visible(found.ev)) { go(r.base, true); return; }
    var ev = found.ev;
    markSeen(ev, found.c);
    var dlg = makeDialog('ev:' + id, { kind: 'ev ev-' + ev.type + (found.c === 'deep' ? ' in-deep' : ''), label: ev.label, title: ev.title });
    var view = { dlg: dlg, ev: ev, ui: uiStore[id] || (uiStore[id] = {}), cleanup: null, c: found.c };
    dlg.cleanup = function () { if (view.cleanup) view.cleanup(); view.cleanup = null; };
    renderTools(view);
    renderEvidence(view);
    Sound.paper();
    if (!reduced()) { dlg.sheet.classList.add('scan'); setTimeout(function () { dlg.sheet.classList.remove('scan'); }, 1400); }
  }

  function renderTools(view) {
    var uvd = Ev.supportsUV(view.ev) ? uvFor(view.ev.id) : null;
    if (!uvd) { view.dlg.tools.innerHTML = ''; return; }
    view.dlg.tools.innerHTML =
      '<div class="lamp" role="group" aria-label="Ultraviolet lamp">' +
      '<button type="button" class="lamp-btn" data-lamp="toggle" aria-pressed="' + lamp.on + '">' + (lamp.on ? 'Lamp on' : 'Lamp') + '</button>' +
      (lamp.on ? '<button type="button" class="lamp-btn" data-lamp="mode" aria-pressed="' + (lamp.mode === 'flood') + '">Flood</button>' : '') +
      '</div>';
    $$('[data-lamp]', view.dlg.tools).forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.getAttribute('data-lamp') === 'toggle') { lamp.on = !lamp.on; if (lamp.on) Sound.lampOn(); else Sound.click(); }
        else { lamp.mode = lamp.mode === 'flood' ? 'beam' : 'flood'; Sound.click(); }
        renderTools(view);
        renderEvidence(view);
        var again = $('[data-lamp="' + b.getAttribute('data-lamp') + '"]', view.dlg.tools) || $('[data-lamp="toggle"]', view.dlg.tools);
        if (again) again.focus();
        if (lamp.on) announce(lamp.mode === 'flood' ? 'Lamp on, flooding the page.' : 'Lamp on. Move across the page to sweep the beam.');
      });
    });
  }

  function postProcess(el, uvd, isUV) {
    $$('[data-today]', el).forEach(function (n) { n.textContent = today(); });
    $$('[data-now]', el).forEach(function (n) { n.textContent = now(); });
    if (state.closed) $$('.redact[data-closed]', el).forEach(function (n) { n.textContent = n.getAttribute('data-closed'); n.className = 'unredacted'; });
    $$('.pmark', el).forEach(function (m) {
      if (state.marks[m.getAttribute('data-mark')]) m.classList.add('found');
      if (isUV) m.setAttribute('tabindex', '-1');
    });
    if (isUV && uvd && uvd.over) {
      $$('[data-uv]', el).forEach(function (n) {
        var t = uvd.over[n.getAttribute('data-uv')];
        if (!t) return;
        n.classList.add('uv-struck');
        var s = d.createElement('span'); s.className = 'uv-over uvhand'; s.textContent = t;
        n.appendChild(s);
      });
    }
  }

  function renderEvidence(view, focusSel) {
    if (view.cleanup) { view.cleanup(); view.cleanup = null; }
    var ev = view.ev;
    var uvd = Ev.supportsUV(ev) ? uvFor(ev.id) : null;
    var lampActive = !!(uvd && lamp.on);
    var o = { uv: false, uvd: uvd, lampActive: lampActive, flags: state.flags, state: state, titles: titleMap() };
    var bodyScroll = view.dlg.body.scrollTop;
    var wrap = d.createElement('div');
    wrap.className = 'uvwrap' + (lampActive ? ' lamp-on lamp-' + lamp.mode : '');
    var base = d.createElement('div');
    base.className = 'ev-base ev-' + ev.type;
    base.innerHTML = Ev.render(ev, view.ui, o);
    postProcess(base, uvd, false);
    if (lampActive && uvd.sr) {
      var sr = d.createElement('p'); sr.className = 'sr-only'; sr.textContent = uvd.sr; base.appendChild(sr);
    }
    wrap.appendChild(base);
    if (lampActive) {
      var uvLayer = d.createElement('div');
      uvLayer.className = 'uvlayer ev-' + ev.type;
      uvLayer.setAttribute('aria-hidden', 'true');
      if ('inert' in uvLayer) uvLayer.inert = true;
      uvLayer.innerHTML = Ev.render(ev, view.ui, Object.assign({}, o, { uv: true }));
      postProcess(uvLayer, uvd, true);
      wrap.appendChild(uvLayer);
      attachBeam(wrap);
    }
    view.dlg.body.innerHTML = '';
    view.dlg.body.appendChild(wrap);
    fitLines(wrap);
    if (d.fonts && d.fonts.status !== 'loaded' && d.fonts.ready) d.fonts.ready.then(function () { if (wrap.isConnected) fitLines(wrap); });
    view.dlg.body.scrollTop = bodyScroll;
    view.cleanup = Ev.mount(base, ev, view.ui, ctxFor(view)) || null;
    if (focusSel) { var t = $(focusSel, base); if (t) try { t.focus({ preventScroll: true }); } catch (e) { t.focus(); } }
  }

  /* The curator's note is read by first and last letters, so its lines must
     never wrap: shrink the handwriting until the longest line fits. */
  function fitLines(wrap) {
    var boxes = $$('.note-lines', wrap);
    if (!boxes.length) return;
    boxes.forEach(function (b) { b.style.fontSize = ''; });
    var box = boxes[0], avail = box.clientWidth, widest = 0;
    if (!avail) return;
    $$('.nl', box).forEach(function (l) { widest = Math.max(widest, l.offsetWidth); });
    if (widest <= avail) return;
    var size = parseFloat(window.getComputedStyle(box).fontSize) * (avail / widest) * 0.97;
    boxes.forEach(function (b) { b.style.fontSize = size.toFixed(2) + 'px'; });
  }
  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { if (curOverlay) $$('.uvwrap', curOverlay.root).forEach(fitLines); }, 150);
  });

  function attachBeam(wrap) {
    if (lamp.mode !== 'beam') return;
    wrap.style.setProperty('--mx', '50%');
    wrap.style.setProperty('--my', '160px');
    var pending = null;
    function set(x, y) {
      if (pending) return;
      pending = requestAnimationFrame(function () {
        pending = null;
        var r = wrap.getBoundingClientRect();
        wrap.style.setProperty('--mx', (x - r.left) + 'px');
        wrap.style.setProperty('--my', (y - r.top) + 'px');
      });
    }
    wrap.addEventListener('pointermove', function (e) { if (e.pointerType !== 'touch') set(e.clientX, e.clientY); });
    wrap.addEventListener('pointerdown', function (e) { set(e.clientX, e.clientY); });
    wrap.addEventListener('touchmove', function (e) { var t = e.touches[0]; if (t) set(t.clientX, t.clientY); }, { passive: true });
    wrap.addEventListener('focusin', function (e) {
      var r = e.target.getBoundingClientRect();
      set(r.left + r.width / 2, r.top + r.height / 2);
    });
  }

  function ctxFor(view) {
    return {
      reduced: reduced,
      announce: announce,
      sound: function (name) { if (Sound[name]) Sound[name](); },
      rerender: function (focusSel) { renderEvidence(view, focusSel); },
      flag: function (f) { setFlag(f); },
      seeHotspot: function (evId, h) {
        state.hotspots[evId + ':' + h.id] = true;
        if (h.note) addNote(view.c, h.note);
        if (h.flag && !state.flags[h.flag]) {
          state.flags[h.flag] = true;
          var found = h.reveal && findEvidence(h.reveal);
          if (found) { toast('New evidence: ' + found.ev.title + '.'); addNote(view.c, 'New evidence found: ' + found.ev.title + '.'); }
        }
        save();
      },
      heard: function (id) { setFlag('heard-' + id); },
      checkLock: function (digits, tag) { return Seal.tag(digits, 'lock', V.salt) === tag; },
      openBox: function (ev) {
        (ev.data.flags || []).forEach(function (f) { state.flags[f] = true; });
        if (ev.data.openNote) addNote(view.c, ev.data.openNote);
        save();
        toast('The box is open. New evidence added to Case 004.');
        announce('The box is open.');
      },
      grant: function (g) {
        if (state.flags[g.flag]) return;
        state.flags[g.flag] = true;
        addNote(view.c, 'Took the ultraviolet lamp from card 0047.');
        save();
        Sound.lampOn();
        toast(g.toast);
        renderTools(view);
      },
      finale: function () { go('finale'); }
    };
  }

  /* Margin marks: one delegated handler for the whole page */
  d.addEventListener('click', function (e) {
    var m = e.target.closest('.pmark');
    if (!m || m.closest('.uvlayer')) return;
    e.preventDefault();
    var n = m.getAttribute('data-mark'), letter = m.getAttribute('data-letter');
    if (state.marks[n]) { toast('You already copied this mark: “' + esc(letter) + '”.'); return; }
    state.marks[n] = letter;
    save();
    Sound.pencil();
    $$('.pmark[data-mark="' + n + '"]').forEach(function (x) { x.classList.add('found'); });
    var count = marksFound();
    if (count === 1) toast('A faint pencil mark in the margin: “' + esc(letter) + '”. Someone has been writing in the margins. You copy it into your notebook.');
    else if (count === MARK_COUNT) toast('The sixth mark: “' + esc(letter) + '”. Six letters, one from each case.');
    else toast('Another faint mark: “' + esc(letter) + '”. ' + count + ' of ' + MARK_COUNT + '.');
  });

  /* Panels */
  function openPanel(r, name) {
    if (name === 'notes') return notebookPanel(r);
    if (name === 'settings') return settingsPanel(r);
    if (name === 'hints' && r.screen === 'case') return hintsPanel(r);
    if (name === 'cover' && r.screen === 'file') return coverPanel(r);
    if (name === 'door' && state.closed) return doorPanel(r);
    go(r.base, true);
  }

  function coverPanel() {
    var c = V.c1.cover;
    var dlg = makeDialog('panel:cover', { kind: 'panel cover', label: 'Found in Reading Room 4', title: 'A file that was never meant to leave' });
    dlg.body.innerHTML = '<article class="paper paper-typed cover-memo">' + c.html + '</article><div class="center"><button type="button" class="btn" data-act="go">' + esc(c.button) + '</button></div>';
    $('[data-act="go"]', dlg.body).addEventListener('click', function () { state.coverSeen = true; save(); Sound.paper(); closeOverlay(); });
    dlg.cleanup = function () { if (!state.coverSeen) { state.coverSeen = true; save(); } };
  }

  function notebookPanel() {
    var dlg = makeDialog('panel:notes', { kind: 'panel notebook', label: 'Your notes', title: 'Notebook' });
    var keys = '';
    for (var n = 1; n <= 5; n++) if (state.keys[n]) keys += '<li><span class="nb-case">' + code(n) + '</span> ' + esc(V.index[n - 1].title) + ' <b class="nb-key">' + esc(revealOf(n) || state.keys[n]) + '</b></li>';
    var inv = [];
    if (state.flags.hasKey) inv.push(['c4-key', 'Brass winding key', 'key']);
    if (state.flags.boxOpen) inv.push(['c4-wheel', 'Cipher wheel', 'wheel']);
    if (state.flags.lamp) inv.push(['c5-lamp', 'Ultraviolet lamp', 'lamp']);
    var invHtml = inv.map(function (x) {
      var f = findEvidence(x[0]);
      var label = '<span class="ex-icon">' + Art.icon(x[2]) + '</span>' + esc(x[1]);
      return '<li>' + (f && cases[f.c] ? '<a href="#case' + f.c + '.ev.' + x[0] + '">' + label + '</a>' : label) + '</li>';
    }).join('');
    var groups = '';
    var byCase = {};
    state.notes.forEach(function (nt) { (byCase[nt.c] = byCase[nt.c] || []).push(nt.h); });
    Object.keys(byCase).sort().forEach(function (c) {
      var title = c === 'deep' ? 'Deep Archive' : 'Case ' + code(c) + ' · ' + esc(V.index[c - 1].title);
      groups += '<h4 class="nb-group">' + title + '</h4><ul class="nb-notes">' + byCase[c].map(function (h) { return '<li>' + h + '</li>'; }).join('') + '</ul>';
    });
    dlg.body.innerHTML =
      '<div class="notebook-paper">' +
      '<section><h3 class="section-label">Keys filed</h3>' + (keys ? '<ol class="nb-keys">' + keys + '</ol>' : '<p class="muted">None yet.</p>') + '</section>' +
      (invHtml ? '<section><h3 class="section-label">Inventory</h3><ul class="nb-inv">' + invHtml + '</ul></section>' : '') +
      (marksFound() ? '<section><h3 class="section-label">Margins</h3>' + marginSlots() + '<p class="small muted">Faint pencil marks, copied in case order.</p></section>' : '') +
      '<section><h3 class="section-label">Observations</h3>' + (groups || '<p class="muted">Nothing yet. Things you notice in the evidence are written down here.</p>') + '</section>' +
      '</div>';
  }

  function settingsPanel() {
    var dlg = makeDialog('panel:settings', { kind: 'panel settings', label: 'This device only', title: 'Settings' });
    function draw() {
      var s = state.settings;
      function opt(group, val, label) { return '<button type="button" class="seg" data-set="' + group + '" data-val="' + val + '" aria-pressed="' + (s[group] === val) + '">' + label + '</button>'; }
      dlg.body.innerHTML =
        '<div class="settings-list">' +
        '<div class="set-row"><p class="set-label" id="set-sound">Sound</p><div class="segs" role="group" aria-labelledby="set-sound">' + opt('sound', true, 'On') + opt('sound', false, 'Off') + '</div></div>' +
        '<div class="set-row"><p class="set-label" id="set-motion">Motion</p><div class="segs" role="group" aria-labelledby="set-motion">' + opt('motion', 'system', 'Match device') + opt('motion', 'reduce', 'Reduced') + opt('motion', 'full', 'Full') + '</div></div>' +
        '<div class="set-row"><p class="set-label" id="set-text">Text size</p><div class="segs" role="group" aria-labelledby="set-text">' + opt('text', 'normal', 'Standard') + opt('text', 'large', 'Large') + '</div></div>' +
        '</div>' +
        '<section class="help prose"><h3 class="section-label">How this works</h3>' +
        '<p>Each case holds evidence: documents, photographs, a tape. Open everything. Tap things in pictures. Your notebook keeps what you find.</p>' +
        '<p>Every case hides a key: a word or a short phrase. File it to unseal the next case. Capitals, spaces and punctuation don’t matter.</p>' +
        '<p>Stuck? Each case has hints, from a gentle nudge to the answer itself.</p>' +
        '<p>Your progress is saved in this browser only. Nothing you type is sent anywhere, and nothing is collected.</p></section>' +
        '<section class="danger"><h3 class="section-label">Start over</h3>' +
        '<p class="small muted">Erase all progress on this device and seal the file again.</p>' +
        '<button type="button" class="btn btn-ghost" data-act="reset">Reset investigation</button>' +
        '<div class="confirm" hidden><p>This erases every key, note and mark. Are you sure?</p><button type="button" class="btn btn-danger" data-act="reset-yes">Erase progress</button> <button type="button" class="btn btn-ghost" data-act="reset-no">Keep it</button></div>' +
        '</section>';
    }
    draw();
    dlg.body.addEventListener('click', function (e) {
      var b = e.target.closest('[data-set],[data-act]');
      if (!b) return;
      if (b.hasAttribute('data-set')) {
        var g = b.getAttribute('data-set'), v = b.getAttribute('data-val');
        state.settings[g] = v === 'true' ? true : v === 'false' ? false : v;
        save(); applySettings();
        if (g === 'sound' && state.settings.sound) { Sound.unlock(); Sound.click(); }
        draw();
        var again = $('[data-set="' + g + '"][data-val="' + v + '"]', dlg.body);
        if (again) again.focus();
        return;
      }
      var act = b.getAttribute('data-act');
      if (act === 'reset') { $('.confirm', dlg.body).hidden = false; $('[data-act="reset-yes"]', dlg.body).focus(); }
      if (act === 'reset-no') { $('.confirm', dlg.body).hidden = true; $('[data-act="reset"]', dlg.body).focus(); }
      if (act === 'reset-yes') {
        wipe();
        closeOverlayDom(true);
        curScreen = null;
        go('', true);
        toast('Progress erased. The file is sealed again.');
      }
    });
  }

  function hintsPanel(r) {
    var n = r.n, c = cases[n];
    var dlg = makeDialog('panel:hints', { kind: 'panel hints', label: 'Case ' + code(n) + ' · ' + c.title, title: 'Hints' });
    function applicable(h) {
      if (!h.when) return true;
      var neg = h.when.charAt(0) === '!', f = h.when.replace('!', '');
      return neg ? !state.flags[f] : !!state.flags[f];
    }
    function draw(focus) {
      var shown = state.hints[n] || [];
      var list = c.hints.map(function (h, i) { return shown.indexOf(i) >= 0 ? '<li>' + h.text + '</li>' : ''; }).join('');
      var nextIdx = -1;
      for (var i = 0; i < c.hints.length; i++) if (shown.indexOf(i) < 0 && applicable(c.hints[i])) { nextIdx = i; break; }
      var total = c.hints.filter(applicable).length, used = c.hints.filter(function (h, i) { return applicable(h) && shown.indexOf(i) >= 0; }).length;
      var action;
      if (nextIdx >= 0) action = '<button type="button" class="btn" data-act="next">Show a hint (' + (used + 1) + ' of ' + total + ')</button>';
      else if (n <= 5 && !state.keys[n] && c.reveal) {
        action = state.reveals[n]
          ? '<div class="reveal"><p>The key is <b class="reveal-key">' + esc(revealOf(n)) + '</b>.</p><button type="button" class="btn" data-act="use">File this key</button></div>'
          : '<div class="reveal"><p class="small muted">No hints left. You can see the key itself, if you want to.</p><button type="button" class="btn btn-ghost" data-act="ask">Show me the key</button>' +
            '<div class="confirm" hidden><p>This shows the answer to Case ' + code(n) + '. Sure?</p><button type="button" class="btn" data-act="reveal">Show the key</button> <button type="button" class="btn btn-ghost" data-act="keep">Not yet</button></div></div>';
      } else action = '<p class="small muted">' + (solved(n) ? 'This case is solved.' : 'That’s every hint for this case.') + '</p>';
      dlg.body.innerHTML = (list ? '<ol class="hint-list">' + list + '</ol>' : '<p class="muted">Hints start gently and get more direct. The last one gives the key away.</p>') + '<div class="hint-action">' + action + '</div>';
      if (focus) { var t = $(focus, dlg.body); if (t) t.focus(); }
    }
    draw();
    dlg.body.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (!b) return;
      var act = b.getAttribute('data-act');
      if (act === 'next') {
        var shown = state.hints[n] = state.hints[n] || [];
        for (var i = 0; i < c.hints.length; i++) if (shown.indexOf(i) < 0 && applicable(c.hints[i])) { shown.push(i); break; }
        save(); Sound.paper(); draw('[data-act]');
        var items = $$('.hint-list li', dlg.body);
        if (items.length) announce(items[items.length - 1].textContent);
      }
      if (act === 'ask') { $('.confirm', dlg.body).hidden = false; $('[data-act="reveal"]', dlg.body).focus(); }
      if (act === 'keep') { $('.confirm', dlg.body).hidden = true; $('[data-act="ask"]', dlg.body).focus(); }
      if (act === 'reveal') { state.reveals[n] = true; save(); draw('[data-act="use"]'); }
      if (act === 'use') {
        closeOverlayDom(true);
        go('case' + n, true);
        fileKey(n, revealOf(n), $('.keyform', screenEl));
      }
    });
  }

  function doorPanel(r) {
    var c6 = cases[6];
    var dlg = makeDialog('panel:door', { kind: 'panel door-panel', label: 'Restricted', title: 'Deep Archive' });
    function draw(msg, cls) {
      var hints = (c6.doorHints || []).slice(0, state.doorHints).map(function (h) { return '<li>' + h + '</li>'; }).join('');
      var more = state.doorHints < (c6.doorHints || []).length
        ? '<button type="button" class="btn-text" data-act="hint">' + (state.doorHints ? 'Another hint' : 'A hint') + '</button>'
        : (c6.doorReveal ? '<p class="small">The word is <b>' + esc(doorReveal()) + '</b>.</p>' : '');
      dlg.body.innerHTML =
        '<div class="door-body">' +
        '<p class="door-lead">A drawer with no label, at the very back of the index. It has a small brass lock with six letter wheels.</p>' +
        '<p class="small muted">The margins remember.</p>' + marginSlots() +
        '<form class="keyform door-form" novalidate autocomplete="off"><label for="door-key" class="kq">Six letters</label>' +
        '<div class="key-row"><input id="door-key" class="key-input" type="text" autocomplete="off" autocapitalize="characters" autocorrect="off" spellcheck="false" maxlength="20" placeholder="_ _ _ _ _ _"><button class="btn" type="submit">Open</button></div>' +
        '<p class="key-msg ' + (cls || '') + '" role="status" aria-live="polite">' + esc(msg || '') + '</p></form>' +
        (hints ? '<ol class="hint-list">' + hints + '</ol>' : '') + '<div class="hint-action">' + more + '</div></div>';
      $('.door-form', dlg.body).addEventListener('submit', function (e) {
        e.preventDefault();
        var res = tryKey('deep', $('#door-key', dlg.body).value);
        if (res.ok) {
          state.deepKey = res.key; deep = res.data; save();
          Sound.clunk();
          toast('The drawer slides open.');
          closeOverlayDom(true);
          go('deep', true);
          return;
        }
        if (res.empty) { draw('Type six letters first.'); }
        else if (res.near) { Sound.click(); draw(res.near, 'near'); }
        else { Sound.rattle(); draw('The wheels don’t give.', 'wrong'); }
        var inp = $('#door-key', dlg.body); if (inp) inp.focus();
      });
    }
    draw();
    dlg.body.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act="hint"]');
      if (!b) return;
      state.doorHints++; save(); Sound.paper(); draw();
      var h = $$('.hint-list li', dlg.body); if (h.length) announce(h[h.length - 1].textContent);
      var nb = $('[data-act="hint"]', dlg.body) || $('#door-key', dlg.body); if (nb) nb.focus();
    });
  }

  /* ── Boot ───────────────────────────────────────────────────────────────── */
  restore();
  save();
  applySettings();
  html.classList.add('js');
  route();
})();
