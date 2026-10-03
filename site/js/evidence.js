/*
 * Evidence — renders every kind of exhibit in the case file.
 *
 * Each type has:
 *   render(ev, ui, o) -> HTML string   (pure: same input, same markup)
 *   mount(el, ev, ui, ctx) -> cleanup  (optional: wires up interaction)
 *
 * `ui` is per-exhibit view state (which slip is turned over, dial values…).
 * `o`  is { uv, uvd, lampActive, flags, state }: `uv` asks for the
 *      ultraviolet copy that sits on top of the normal one under the lamp.
 * The two copies must lay out identically, so hidden ink is always drawn in
 * space that is reserved in both.
 */
(function (root) {
  'use strict';

  var Art = root.Art, Sound = root.Sound;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function q(el, s) { return el.querySelector(s); }
  function qa(el, s) { return Array.prototype.slice.call(el.querySelectorAll(s)); }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function mmss(s) { s = Math.max(0, Math.floor(s)); return pad2(Math.floor(s / 60)) + ':' + pad2(s % 60); }
  function uvFoot(o) {
    if (!o.uvd || !o.uvd.notes || !o.uvd.notes.length) return '';
    var inner = o.uv ? o.uvd.notes.map(function (n) { return '<p class="uvhand">' + n.html + '</p>'; }).join('') : '';
    return '<div class="uvfoot">' + inner + '</div>';
  }

  var T = {};

  /* ── Documents ─────────────────────────────────────────────────────────── */
  T.doc = {
    uv: true,
    render: function (ev, ui, o) {
      var d = ev.data;
      return '<article class="paper paper-' + (d.paper || 'typed') + '">' + d.html + uvFoot(o) + '</article>';
    }
  };

  T.note = {
    uv: true,
    render: function (ev, ui, o) {
      var d = ev.data;
      var lines = d.lines.map(function (line) {
        var i = line.length - 1;
        while (i > 0 && !/[A-Za-z]/.test(line[i])) i--;
        return '<span class="nl">' + esc(line.slice(0, i)) + '<span class="q">' + esc(line[i]) + '</span>' + esc(line.slice(i + 1)) + '</span>';
      }).join('');
      return '<article class="paper paper-note">' +
        (d.found ? '<p class="note-found">' + esc(d.found) + '</p>' : '') +
        '<div class="note-lines">' + lines + '</div>' +
        '<p class="note-sign">' + esc(d.sign) + '</p>' + uvFoot(o) + '</article>';
    }
  };

  T.item = {
    render: function (ev) {
      var d = ev.data;
      return '<div class="item"><div class="item-art">' + (Art[d.art] ? Art[d.art]() : '') + '</div><div class="item-text prose">' + d.html + '</div></div>';
    }
  };

  /* ── Photograph with things to inspect ─────────────────────────────────── */
  T.photo = {
    uv: true,
    render: function (ev, ui, o) {
      var d = ev.data, seen = o.state.hotspots || {};
      var spots = o.uv ? '' : d.hotspots.map(function (h) {
        var cls = 'hotspot' + (seen[ev.id + ':' + h.id] ? ' seen' : '') + (ui.hs === h.id ? ' active' : '');
        return '<button type="button" class="' + cls + '" data-hs="' + h.id + '" style="left:' + h.x + '%;top:' + h.y + '%;width:' + h.w + '%;height:' + h.h + '%" aria-label="Look closer: ' + esc(h.label) + '"><span class="hs-corners" aria-hidden="true"></span></button>';
      }).join('');
      var overlay = (o.uv && o.uvd && o.uvd.overlay && Art.casePhotoUV) ? '<div class="photo-uv">' + Art.casePhotoUV() + '</div>' : '';
      var sel = ui.hs && d.hotspots.filter(function (h) { return h.id === ui.hs; })[0];
      var inspect = sel
        ? '<p class="inspect-label">' + esc(sel.label) + '</p><p>' + esc(sel.text) + '</p>' +
          (sel.reveal && !o.uv ? '<a class="btn btn-small" href="#" data-open="' + sel.reveal + '">Read it</a>' : '')
        : '<p class="muted">' + esc(d.prompt) + '</p>';
      return '<figure class="photo">' +
        '<div class="photo-frame">' +
        '<div class="photo-img" style="aspect-ratio:' + (d.ratio || '4 / 3') + '">' + Art[d.art]() + overlay + spots + '</div>' +
        '<div class="photo-border"><span class="border-cap">' + esc(d.border || '') + '</span>' + (d.mark || '') + '</div>' +
        '</div>' +
        '<figcaption>' + esc(d.caption) + '</figcaption></figure>' +
        '<div class="inspect" aria-live="polite">' + inspect + '</div>' + uvFoot(o);
    },
    mount: function (el, ev, ui, ctx) {
      el.addEventListener('click', function (e) {
        var b = e.target.closest('[data-hs]');
        if (!b) return;
        var h = ev.data.hotspots.filter(function (x) { return x.id === b.getAttribute('data-hs'); })[0];
        if (!h) return;
        ui.hs = h.id;
        ctx.sound('click');
        ctx.seeHotspot(ev.id, h);
        ctx.rerender('[data-hs="' + h.id + '"]');
      });
    }
  };

  /* ── Case 002: visitor slips ───────────────────────────────────────────── */
  T.slips = {
    uv: true,
    render: function (ev, ui, o) {
      var d = ev.data, flipped = ui.flipped || {}, uvs = (o.uvd && o.uvd.slips) || {};
      var memoUV = (o.uv && o.uvd && o.uvd.memo) ? '<span class="uvhand memo-uv">' + esc(o.uvd.memo) + '</span>' : '';
      var cards = d.slips.map(function (s, i) {
        var turned = !o.lampActive && flipped[s.id];
        var u = o.uv ? (uvs[s.id] || {}) : {};
        return '<li class="slip' + (turned ? ' turned' : '') + '">' +
          '<button type="button" class="slip-flip" data-slip="' + s.id + '" aria-pressed="' + (turned ? 'true' : 'false') + '" aria-label="Visitor slip ' + (i + 1) + ', time in ' + s.time + '. Turn over."' + (o.lampActive ? ' disabled' : '') + '></button>' +
          '<div class="slip-face slip-front" aria-hidden="' + (turned ? 'true' : 'false') + '">' +
          '<span class="slip-head">Wrenfield Archive · RR4<br>Visitor slip</span>' +
          '<span class="slip-row"><span class="k">Name</span><span class="v">' + '<i class="sym sym-d" role="img" aria-label="diamond"></i>' + '</span></span>' +
          '<span class="slip-row"><span class="k">Date</span><span class="v smudge">' + (u.date ? '<span class="uvhand">' + esc(u.date) + '</span>' : '') + '</span></span>' +
          '<span class="slip-row"><span class="k">In</span><span class="v t">' + s.time + '</span></span>' +
          '<span class="slip-row"><span class="k">Out</span><span class="v">—</span></span>' +
          '<span class="slip-row"><span class="k">Purpose</span><span class="v">' + (u.left ? '<span class="uvhand">left: ' + esc(u.left) + '</span>' : '') + '</span></span>' +
          '</div>' +
          '<div class="slip-face slip-back" aria-hidden="' + (turned ? 'false' : 'true') + '">' +
          '<span class="slip-print">Please return this slip to the box by the door.</span>' + (s.back || '') +
          '</div></li>';
      }).join('');
      return '<div class="paper paper-memo memo-clip"><p>' + d.memo + '</p>' + memoUV + '</div>' +
        '<p class="prompt">' + esc(o.lampActive ? 'The lamp is on: slips stay face up.' : d.prompt) + '</p>' +
        '<ul class="slips">' + cards + '</ul>';
    },
    mount: function (el, ev, ui, ctx) {
      el.addEventListener('click', function (e) {
        var b = e.target.closest('[data-slip]');
        if (!b || b.disabled) return;
        ui.flipped = ui.flipped || {};
        var id = b.getAttribute('data-slip');
        ui.flipped[id] = !ui.flipped[id];
        ctx.sound('paper');
        ctx.rerender('[data-slip="' + id + '"]');
      });
    }
  };

  /* ── Case 002: camera stills ───────────────────────────────────────────── */
  T.stills = {
    render: function (ev, ui) {
      var d = ev.data, i = ui.i || 0, fr = d.frames[i];
      var tabs = d.frames.map(function (f, k) {
        return '<button type="button" role="tab" class="tab" id="still-tab-' + k + '" aria-controls="still-panel" aria-selected="' + (k === i) + '" tabindex="' + (k === i ? 0 : -1) + '" data-still="' + k + '">' + pad2(f.day) + ' Nov</button>';
      }).join('');
      var zoom = ui.zoom
        ? '<div class="clock-zoom"><div class="clock-zoom-art">' + Art.clock(fr.h, fr.m, 'The wall clock in Reading Room 4 on ' + fr.day + ' November') + '</div><p class="small">The wall clock, ' + fr.day + ' November. <button type="button" class="btn-text" data-zoom="0">Back to the frame</button></p></div>'
        : '';
      return '<p class="intro">' + esc(d.intro) + '</p>' +
        '<div class="tabs" role="tablist" aria-label="Camera stills by date">' + tabs + '</div>' +
        '<figure class="still" id="still-panel" role="tabpanel" aria-labelledby="still-tab-' + i + '">' +
        (ui.zoom ? zoom :
          '<div class="still-img">' + Art.still(fr) +
          '<button type="button" class="clock-btn" data-zoom="1" style="left:38.5%;top:9.5%;width:16.5%;height:22%" aria-label="Look closer at the wall clock"><span class="hs-corners" aria-hidden="true"></span></button></div>') +
        '<figcaption>CAM 2 · RR4 · ' + pad2(fr.day) + ' NOV · <span class="muted">time not recorded</span></figcaption></figure>' +
        '<div class="still-nav"><button type="button" class="btn-ghost" data-step="-1"' + (i === 0 ? ' disabled' : '') + '>Previous night</button><button type="button" class="btn-ghost" data-step="1"' + (i === d.frames.length - 1 ? ' disabled' : '') + '>Next night</button></div>' +
        '<p class="footnote">' + esc(d.footnote) + '</p>';
    },
    mount: function (el, ev, ui, ctx) {
      var n = ev.data.frames.length;
      function set(i, focusTab) {
        ui.i = Math.max(0, Math.min(n - 1, i));
        ctx.sound('click');
        ctx.rerender(focusTab ? '[data-still="' + ui.i + '"]' : null);
      }
      el.addEventListener('click', function (e) {
        var t = e.target.closest('[data-still],[data-zoom],[data-step]');
        if (!t || t.disabled) return;
        if (t.hasAttribute('data-still')) { ui.zoom = false; set(+t.getAttribute('data-still'), true); }
        else if (t.hasAttribute('data-step')) { ui.zoom = false; set((ui.i || 0) + (+t.getAttribute('data-step'))); }
        else { ui.zoom = t.getAttribute('data-zoom') === '1'; ctx.sound('click'); ctx.rerender(ui.zoom ? '[data-zoom="0"]' : '[data-zoom="1"]'); }
      });
      el.addEventListener('keydown', function (e) {
        var t = e.target.closest('[data-still]');
        if (!t) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); ui.zoom = false; set((ui.i || 0) + 1, true); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); ui.zoom = false; set((ui.i || 0) - 1, true); }
      });
    }
  };

  /* ── Case 003: the interview tape ──────────────────────────────────────── */
  function morseText(text) {
    return String(text).toUpperCase().trim().split(/\s+/).map(function (w) {
      return w.split('').map(function (c) { return Sound.MORSE[c] || ''; }).join('   ');
    }).join('   /   ').replace(/-/g, '–').replace(/\./g, '·');
  }

  T.tape = {
    uv: true,
    render: function (ev, ui, o) {
      var d = ev.data, tl = Sound.morseTimeline(d.morse);
      var jcUV = (o.uvd && o.uvd.jcard) ? '<span class="jc-uv">' + (o.uv ? '<span class="uvhand">' + esc(o.uvd.jcard) + '</span>' : '') + '</span>' : '';
      var pos = ui.pos || 0;
      var lines = d.lines.map(function (l) {
        var shown = ui.all || l.t <= pos;
        var who = l.who === 'TAPE' ? '' : '<span class="who">' + esc(l.who) + '</span>';
        return '<li class="tl' + (shown ? ' shown' : '') + (l.who === 'TAPE' ? ' tl-tape' : '') + (l.morse ? ' tl-morse' : '') + '" data-t="' + l.t + '"><span class="tl-time">' + mmss(l.t) + '</span>' + who + '<span class="tl-text">' + (l.who === 'TAPE' ? '[' + esc(l.text) + ']' : esc(l.text)) + '</span></li>';
      }).join('');
      var total = d.lines[d.lines.length - 1].t + 3;
      return '<div class="deck">' +
        '<div class="cassette' + (o.uv ? '' : '') + '">' + Art.cassette() + '<div class="jcard">' + d.jcard + jcUV + '</div></div>' +
        '<div class="deck-meta"><p class="deck-title">' + esc(d.title) + '</p><p class="small">' + esc(d.when) + ' · ' + esc(d.by) + '</p></div>' +
        '<div class="deck-ctl">' +
        '<button type="button" class="btn" data-act="play" aria-pressed="false">Play tape</button>' +
        '<button type="button" class="btn-ghost" data-act="rewind">Rewind</button>' +
        '<span class="counter" aria-hidden="true">' + mmss(pos) + ' / ' + mmss(total) + '</span>' +
        '</div>' +
        '<div class="progress" aria-hidden="true"><span style="width:' + (pos / total * 100) + '%"></span></div>' +
        '</div>' +
        '<section class="wave-box" aria-labelledby="wave-h">' +
        '<h3 class="section-label" id="wave-h">The recording, 12 Nov, 21:05</h3>' +
        '<div class="wave">' + Art.waveform(tl, 600, 70) + '<span class="wave-head" aria-hidden="true"></span></div>' +
        '<div class="wave-ctl"><button type="button" class="btn-ghost" data-act="hum">Play the hum only</button>' +
        '<button type="button" class="btn-ghost" data-act="text" aria-pressed="' + (ui.text ? 'true' : 'false') + '">' + (ui.text ? 'Hide pulses as text' : 'Show pulses as text') + '</button></div>' +
        '<p class="morse-text"' + (ui.text ? '' : ' hidden') + '>' + morseText(d.morse) + '</p>' +
        '</section>' +
        '<section class="transcript-box" aria-labelledby="tr-h">' +
        '<div class="transcript-head"><h3 class="section-label" id="tr-h">Transcript</h3>' +
        '<button type="button" class="btn-text" data-act="all" aria-pressed="' + (ui.all ? 'true' : 'false') + '">' + (ui.all ? 'Follow the tape' : 'Show full transcript') + '</button></div>' +
        '<p class="small muted tr-empty"' + (ui.all || pos > 0 ? ' hidden' : '') + '>Press play, or show the full transcript.</p>' +
        '<ol class="transcript">' + lines + '</ol></section>';
    },
    mount: function (el, ev, ui, ctx) {
      var d = ev.data, tl = Sound.morseTimeline(d.morse);
      var mStart = d.lines.filter(function (l) { return l.morse; })[0].t;
      var total = d.lines[d.lines.length - 1].t + 3;
      var playing = false, raf = 0, t0 = 0, fired = false, humRaf = 0;
      var btn = q(el, '[data-act="play"]'), counter = q(el, '.counter'), bar = q(el, '.progress span');
      var cas = q(el, '.cassette'), head = q(el, '.wave-head'), lines = qa(el, '.tl'), pulses = qa(el, '.pulse'), empty = q(el, '.tr-empty');
      var reduced = ctx.reduced();

      function wave(rel) {
        var on = rel >= 0 && rel <= tl.length;
        el.classList.toggle('humming', on);
        head.style.left = on ? (10 + rel / tl.length * 580) / 600 * 100 + '%' : '0';
        head.style.opacity = on ? '1' : '0';
        pulses.forEach(function (p, i) {
          var pu = tl.pulses[i];
          p.classList.toggle('lit', on && rel >= pu.start && rel <= pu.start + pu.dur + 0.05);
        });
      }
      function update(pos) {
        counter.textContent = mmss(pos) + ' / ' + mmss(total);
        bar.style.width = (pos / total * 100) + '%';
        if (!ui.all) lines.forEach(function (li) { li.classList.toggle('shown', +li.getAttribute('data-t') <= pos); });
        if (empty) empty.hidden = ui.all || pos > 0;
        wave(pos - mStart);
      }
      function frame(now) {
        var pos = (now - t0) / 1000;
        if (pos >= total) {
          stop();
          ui.pos = 0; ui.all = true;
          ctx.heard(ev.id);
          lines.forEach(function (li) { li.classList.add('shown'); });
          counter.textContent = mmss(total) + ' / ' + mmss(total);
          bar.style.width = '100%';
          ctx.announce('End of tape.');
          return;
        }
        ui.pos = pos;
        if (!fired && pos >= mStart && pos < mStart + tl.length) { fired = true; Sound.playMorse(d.morse, pos - mStart); }
        update(pos);
        raf = requestAnimationFrame(frame);
      }
      function play() {
        stopHum();
        Sound.unlock();
        playing = true;
        if ((ui.pos || 0) >= total - 0.5) ui.pos = 0;
        t0 = performance.now() - (ui.pos || 0) * 1000;
        fired = (ui.pos || 0) >= mStart + tl.length;
        Sound.startHiss();
        if (!reduced) cas.classList.add('playing');
        btn.textContent = 'Pause'; btn.setAttribute('aria-pressed', 'true');
        raf = requestAnimationFrame(frame);
      }
      function stop() {
        playing = false;
        cancelAnimationFrame(raf);
        Sound.stopHiss(); Sound.stopMorse();
        cas.classList.remove('playing');
        btn.textContent = 'Play tape'; btn.setAttribute('aria-pressed', 'false');
        wave(-1);
      }
      function stopHum() { cancelAnimationFrame(humRaf); humRaf = 0; if (!playing) { Sound.stopMorse(); wave(-1); } }
      function hum() {
        if (playing) stop();
        stopHum();
        Sound.unlock();
        Sound.playMorse(d.morse, 0);
        var start = performance.now();
        (function step(now) {
          var rel = (now - start) / 1000;
          if (rel > tl.length + 0.2) { wave(-1); humRaf = 0; return; }
          wave(rel);
          humRaf = requestAnimationFrame(step);
        })(start);
      }

      el.addEventListener('click', function (e) {
        var b = e.target.closest('[data-act]');
        if (!b) return;
        var act = b.getAttribute('data-act');
        if (act === 'play') { if (playing) stop(); else play(); }
        else if (act === 'rewind') { stop(); ui.pos = 0; fired = false; update(0); }
        else if (act === 'hum') hum();
        else if (act === 'text' || act === 'all') {
          var wasPlaying = playing;
          if (act === 'text') ui.text = !ui.text; else ui.all = !ui.all;
          if (wasPlaying) {
            // toggle in place so the tape keeps running
            if (act === 'text') { q(el, '.morse-text').hidden = !ui.text; b.textContent = ui.text ? 'Hide pulses as text' : 'Show pulses as text'; b.setAttribute('aria-pressed', String(!!ui.text)); }
            else { b.textContent = ui.all ? 'Follow the tape' : 'Show full transcript'; b.setAttribute('aria-pressed', String(!!ui.all)); if (ui.all) lines.forEach(function (li) { li.classList.add('shown'); }); update(ui.pos || 0); }
          } else {
            ctx.rerender('[data-act="' + act + '"]');
          }
        }
      });
      update(ui.pos || 0);
      return function () { stop(); stopHum(); };
    }
  };

  /* ── Case 003: Morse chart page ────────────────────────────────────────── */
  T.morsechart = {
    render: function (ev) {
      var d = ev.data, keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
      var cells = keys.map(function (k) {
        return '<li><b>' + k + '</b><span>' + Sound.MORSE[k].replace(/-/g, '–').replace(/\./g, '·') + '</span></li>';
      }).join('');
      return '<article class="paper paper-page"><p class="eyebrow">Wrenfield Archive · Custodian’s handbook · p. 14</p>' +
        '<h3 class="doc-title">' + esc(d.heading) + '</h3><p>' + esc(d.intro) + '</p>' +
        '<ul class="morse-grid" aria-label="International Morse code">' + cells + '</ul>' +
        '<p class="small">· dot (short) &nbsp; – dash (long)</p></article>';
    }
  };

  /* ── Case 004: the lockbox ─────────────────────────────────────────────── */
  T.lockbox = {
    render: function (ev, ui, o) {
      var d = ev.data, open = !!o.flags.boxOpen, dials = ui.dials || [0, 0, 0, 0];
      var ROMAN = ['I', 'II', 'III', 'IV'];
      var tags = d.tags.map(function (t, i) {
        return '<li class="tag"><span class="tag-no">' + ROMAN[i] + '</span><span class="tag-icon">' + Art.icon(t.icon === 'note' ? 'music' : t.icon) + '</span><span class="tag-text">' + esc(t.text) + '</span></li>';
      }).join('');
      var dialHtml = dials.map(function (v, i) {
        return '<div class="dial"><button type="button" class="dial-btn" data-dial="' + i + '" data-dir="1" aria-label="Dial ' + ROMAN[i] + ' up"' + (open ? ' disabled' : '') + '>▲</button>' +
          '<output class="dial-val" id="dial-' + i + '" aria-label="Dial ' + ROMAN[i] + '">' + v + '</output>' +
          '<button type="button" class="dial-btn" data-dial="' + i + '" data-dir="-1" aria-label="Dial ' + ROMAN[i] + ' down"' + (open ? ' disabled' : '') + '>▼</button>' +
          '<span class="dial-no">' + ROMAN[i] + '</span></div>';
      }).join('');
      var contents = open ? '<div class="box-contents"><p>' + esc(d.opened) + '</p><ul class="mini-list">' +
        d.reveals.map(function (id) { return '<li><a href="#" class="btn btn-small" data-open="' + id + '">' + esc((o.titles && o.titles[id]) || id) + '</a></li>'; }).join('') +
        '</ul><div class="lid-inside">' + d.lid + '</div></div>' : '';
      return '<p class="intro">' + esc(d.intro) + '</p>' +
        '<div class="box-art' + (ui.shake ? ' shake' : '') + '">' + Art.lockbox(open) + '</div>' +
        '<ol class="tags" aria-label="Paper tags on the dials">' + tags + '</ol>' +
        (open ? '' : '<div class="dials" role="group" aria-label="Combination dials">' + dialHtml + '</div>' +
          '<div class="box-try"><button type="button" class="btn" data-act="try">Turn the handle</button></div>') +
        '<p class="box-msg" role="status" aria-live="polite">' + esc(ui.msg || '') + '</p>' + contents;
    },
    mount: function (el, ev, ui, ctx) {
      ui.dials = ui.dials || [0, 0, 0, 0];
      el.addEventListener('click', function (e) {
        var b = e.target.closest('[data-dial],[data-act="try"]');
        if (!b || b.disabled) return;
        if (b.hasAttribute('data-dial')) {
          var i = +b.getAttribute('data-dial'), dir = +b.getAttribute('data-dir');
          ui.dials[i] = (ui.dials[i] + dir + 10) % 10;
          ui.msg = ''; ui.shake = false;
          ctx.sound('tick');
          var out = q(el, '#dial-' + i);
          if (out) out.textContent = ui.dials[i];
          ctx.announce('Dial ' + ['I', 'II', 'III', 'IV'][i] + ': ' + ui.dials[i]);
          return;
        }
        if (ctx.checkLock(ui.dials.join(''), ev.data.lockTag)) {
          ctx.sound('clunk');
          ui.msg = '';
          ctx.openBox(ev);
          ctx.rerender('.box-contents a');
        } else {
          ctx.sound('rattle');
          var w = ev.data.wrong;
          ui.msg = w[(ui.tries = (ui.tries || 0) + 1) % w.length];
          ui.shake = !ctx.reduced();
          ctx.rerender('[data-act="try"]');
        }
      });
    }
  };

  /* ── Case 004: the cipher wheel ────────────────────────────────────────── */
  var ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  function strip(s) {
    var top = '', bottom = '';
    for (var i = 0; i < 26; i++) { top += '<span>' + ABC[i] + '</span>'; bottom += '<span>' + ABC[(i + s) % 26] + '</span>'; }
    return '<div class="strip" aria-hidden="true"><div class="strip-row strip-outer"><b>Outer</b>' + top + '</div><div class="strip-row strip-inner"><b>Inner</b>' + bottom + '</div></div>';
  }
  function setLabel(s) { return 'Setting ' + pad2(s) + ' · outer A over inner ' + ABC[s % 26]; }

  T.wheel = {
    render: function (ev, ui) {
      var s = ui.setting || 0;
      return '<p class="intro">' + esc(ev.data.intro) + '</p>' +
        '<div class="wheel-art">' + Art.wheel(s) + '</div>' +
        '<div class="wheel-ctl"><button type="button" class="btn-round" data-turn="-1" aria-label="Turn the inner ring back one letter">◀</button>' +
        '<output class="wheel-set" aria-live="polite">' + setLabel(s) + '</output>' +
        '<button type="button" class="btn-round" data-turn="1" aria-label="Turn the inner ring forward one letter">▶</button></div>' +
        '<p class="small center">Find each letter on the inner ring. Read the letter on the outer ring.</p>' +
        '<div class="strip-wrap">' + strip(s) + '</div>';
    },
    mount: function (el, ev, ui, ctx) {
      el.addEventListener('click', function (e) {
        var b = e.target.closest('[data-turn]');
        if (!b) return;
        ui.setting = ((ui.setting || 0) + (+b.getAttribute('data-turn')) + 26) % 26;
        ctx.sound('tick');
        var g = q(el, '.wheel-inner');
        if (g) g.style.transform = 'rotate(' + (-(ui.setting) * 360 / 26) + 'deg)';
        q(el, '.wheel-set').textContent = setLabel(ui.setting);
        q(el, '.strip-wrap').innerHTML = strip(ui.setting);
      });
    }
  };

  /* ── Case 005: the card index ──────────────────────────────────────────── */
  T.cabinet = {
    uv: true,
    render: function (ev, ui, o) {
      var d = ev.data, open = ui.drawer, flipped = ui.flipped || {};
      var uvCards = (o.uvd && o.uvd.cards) || {};
      var drawers = d.drawers.map(function (dr, i) {
        return '<button type="button" class="drawer' + (open === i ? ' open' : '') + '" data-drawer="' + i + '" aria-expanded="' + (open === i) + '" aria-controls="tray">' +
          '<span class="drawer-plate">' + dr.label + '</span><span class="drawer-pull" aria-hidden="true"></span></button>';
      }).join('');
      var tray = '';
      if (open != null && d.drawers[open]) {
        var dr = d.drawers[open];
        tray = '<div class="tray" id="tray" role="region" aria-label="Drawer ' + dr.label + '"><p class="tray-label">Drawer ' + dr.label + ' · ' + dr.cards.length + ' cards</p><ul class="icards">' +
          dr.cards.map(function (c) {
            var turned = !!flipped[c.no];
            var uvLine = uvCards[c.no] !== undefined ? '<span class="icard-uv">' + (o.uv ? '<span class="uvhand">' + esc(uvCards[c.no]) + '</span>' : '') + '</span>' : '';
            return '<li class="icard' + (turned ? ' turned' : '') + (c.special ? ' special' : '') + '">' +
              '<button type="button" class="icard-flip" data-card="' + c.no + '" aria-pressed="' + turned + '" aria-label="Card ' + c.no + '. Turn over."></button>' +
              '<div class="icard-face icard-front" aria-hidden="' + turned + '"><span class="icard-no">' + c.no + '</span><span class="icard-title">' + c.title + '</span></div>' +
              '<div class="icard-face icard-back" aria-hidden="' + !turned + '"><span class="icard-no">' + c.no + ' · reverse</span><div class="icard-body">' + c.back + '</div>' + uvLine + '</div></li>';
          }).join('') + '</ul></div>';
      }
      return '<p class="intro">' + esc(d.intro) + '</p><div class="cabinet">' + drawers + '</div>' + tray;
    },
    mount: function (el, ev, ui, ctx) {
      el.addEventListener('click', function (e) {
        var dr = e.target.closest('[data-drawer]');
        if (dr) {
          var i = +dr.getAttribute('data-drawer');
          ui.drawer = ui.drawer === i ? null : i;
          ctx.sound('drawer');
          ctx.rerender('[data-drawer="' + i + '"]');
          return;
        }
        var c = e.target.closest('[data-card]');
        if (!c) return;
        var no = c.getAttribute('data-card');
        ui.flipped = ui.flipped || {};
        ui.flipped[no] = !ui.flipped[no];
        ctx.sound('paper');
        if (ui.flipped[no]) {
          ev.data.drawers.forEach(function (d) {
            d.cards.forEach(function (card) { if (card.no === no && card.grant) ctx.grant(card.grant); });
          });
        }
        ctx.rerender('[data-card="' + no + '"]');
      });
    }
  };

  /* ── Case 006: Reading Room 4 ──────────────────────────────────────────── */
  T.scene = {
    render: function (ev, ui, o) {
      var d = ev.data, done = !!o.flags.wound || !!o.state.closed, hasKey = !!o.flags.hasKey;
      var lines = d.afterWind.map(function (t) { return '<p class="scene-line' + (done ? ' on' : '') + '">' + esc(t) + '</p>'; }).join('');
      return '<div class="scene' + (done ? ' wound reflecting' : '') + '"><div class="scene-art">' + Art.room({ motes: true }) + '</div></div>' +
        '<p class="scene-intro">' + esc(d.intro) + '</p>' +
        '<div class="scene-log" aria-live="polite">' + lines + '<p class="scene-line reflection' + (done ? ' on' : '') + '">' + esc(d.reflection) + '</p></div>' +
        '<div class="scene-actions">' +
        (hasKey
          ? '<button type="button" class="btn" data-act="wind"' + (done ? ' hidden' : '') + '>' + esc(d.windLabel) + '</button>'
          : '<p class="muted">' + esc(d.needKey) + '</p><a class="btn btn-small" href="#case4">Go to Case 004</a>') +
        '<button type="button" class="btn btn-stamp" data-act="close"' + (done ? '' : ' hidden') + '>' + esc(o.state.closed ? 'Watch the ending again' : d.closeLabel) + '</button>' +
        '</div>';
    },
    mount: function (el, ev, ui, ctx) {
      var timers = [];
      el.addEventListener('click', function (e) {
        var b = e.target.closest('[data-act]');
        if (!b) return;
        var act = b.getAttribute('data-act');
        if (act === 'close') { ctx.finale(); return; }
        if (act !== 'wind') return;
        b.hidden = true;
        Sound.unlock();
        var len = Sound.playMelody(Sound.MELODY);
        var scene = q(el, '.scene'), lines = qa(el, '.scene-line'), reduced = ctx.reduced();
        scene.classList.add('wound');
        var step = reduced ? 400 : Math.max(1400, (len * 1000) / lines.length);
        lines.forEach(function (ln, i) {
          timers.push(setTimeout(function () {
            ln.classList.add('on');
            if (ln.classList.contains('reflection')) scene.classList.add('reflecting');
          }, 300 + i * step));
        });
        timers.push(setTimeout(function () {
          ctx.flag('wound');
          var c = q(el, '[data-act="close"]');
          c.hidden = false;
          c.focus();
        }, 300 + lines.length * step));
      });
      return function () { timers.forEach(clearTimeout); Sound.stopMelody(); };
    }
  };

  /* ── Deep Archive: music box and Plate 7 ───────────────────────────────── */
  T.musicbox = {
    render: function (ev, ui, o) {
      var d = ev.data, open = !!o.flags.mboxOpen;
      return '<div class="mbox' + (open ? ' open' : '') + '">' + Art.musicBox(open) + '</div>' +
        '<p class="intro">' + esc(d.intro) + '</p>' +
        '<div class="center"><button type="button" class="btn" data-act="wind">' + esc(open ? 'Wind it again' : d.windLabel) + '</button></div>' +
        '<div class="paper paper-slip mbox-inside"' + (open ? '' : ' hidden') + '><p class="hand">' + esc(d.inside) + '</p></div>';
    },
    mount: function (el, ev, ui, ctx) {
      var timers = [];
      el.addEventListener('click', function (e) {
        var b = e.target.closest('[data-act="wind"]');
        if (!b) return;
        Sound.unlock();
        var len = Sound.playMelody(Sound.MELODY_LONG, 0.5);
        b.disabled = true;
        timers.push(setTimeout(function () {
          var box = q(el, '.mbox');
          box.innerHTML = Art.musicBox(true);
          box.classList.add('open');
          q(el, '.mbox-inside').hidden = false;
          ctx.flag('mboxOpen');
        }, ctx.reduced() ? 200 : 1600));
        timers.push(setTimeout(function () { b.disabled = false; b.textContent = 'Wind it again'; }, len * 1000));
      });
      return function () { timers.forEach(clearTimeout); Sound.stopMelody(); };
    }
  };

  T.plate = {
    render: function (ev, ui, o) {
      var d = ev.data, dev = !!o.flags.plateDev;
      return '<p class="intro">' + esc(d.intro) + '</p>' +
        '<div class="plate' + (dev ? ' developed' : '') + '"><div class="plate-art">' + Art.plate() + '</div></div>' +
        '<div class="center"><button type="button" class="btn" data-act="develop"' + (dev ? ' hidden' : '') + '>' + esc(d.develop) + '</button></div>' +
        '<p class="plate-caption"' + (dev ? '' : ' hidden') + '>' + esc(d.caption) + '</p>';
    },
    mount: function (el, ev, ui, ctx) {
      var timer;
      el.addEventListener('click', function (e) {
        var b = e.target.closest('[data-act="develop"]');
        if (!b) return;
        b.hidden = true;
        ctx.sound('paper');
        var p = q(el, '.plate');
        p.classList.add('developing');
        timer = setTimeout(function () {
          p.classList.add('developed');
          var cap = q(el, '.plate-caption');
          cap.hidden = false;
          ctx.flag('plateDev');
          ctx.announce(ev.data.caption);
        }, ctx.reduced() ? 50 : 5200);
      });
      return function () { clearTimeout(timer); };
    }
  };

  root.Evidence = {
    types: T,
    esc: esc,
    render: function (ev, ui, o) { return (T[ev.type] || T.doc).render(ev, ui, o); },
    mount: function (el, ev, ui, ctx) { var t = T[ev.type]; return t && t.mount ? t.mount(el, ev, ui, ctx) : null; },
    supportsUV: function (ev) { var t = T[ev.type]; return !!(t && t.uv); }
  };
})(typeof window !== 'undefined' ? window : this);
