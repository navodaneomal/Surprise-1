/*
 * Sound — every sound in the case file is synthesised with the Web Audio API.
 * No audio files, nothing fetched. Kept deliberately quiet and short.
 * Audio only starts after the player presses a button (browser rule).
 */
(function (root) {
  'use strict';

  var ctx = null, master = null, noiseBuf = null;
  var enabled = true;
  var hiss = null;            // running tape hiss {src, gain}
  var morseNodes = [];        // scheduled oscillators for the hum
  var melodyNodes = [];

  // Morse code table, shared with the evidence renderer and the build checks.
  var MORSE = {
    A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---',
    K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-',
    U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
    0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.'
  };
  var UNIT = 0.12;            // seconds. Letter and word gaps are stretched for learners.
  var GAP = { symbol: 1, letter: 4, word: 9 };

  /** Timeline of pulses for a phrase: [{start, dur, kind}] in seconds, plus total length. */
  function morseTimeline(text) {
    var t = 0, pulses = [];
    var words = String(text).toUpperCase().trim().split(/\s+/);
    words.forEach(function (word, wi) {
      if (wi > 0) t += (GAP.word - GAP.letter) * UNIT;
      word.split('').forEach(function (ch, ci) {
        var code = MORSE[ch];
        if (!code) return;
        if (ci > 0) t += GAP.letter * UNIT;
        code.split('').forEach(function (sym, si) {
          if (si > 0) t += GAP.symbol * UNIT;
          var dur = (sym === '.' ? 1 : 3) * UNIT;
          pulses.push({ start: t, dur: dur, kind: sym, letter: ch });
          t += dur;
        });
      });
    });
    return { pulses: pulses, length: t };
  }

  function init() {
    if (ctx) return true;
    var AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return false;
    try {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.55;
      master.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      var d = noiseBuf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      return true;
    } catch (e) {
      ctx = null;
      return false;
    }
  }

  function ready() {
    if (!enabled) return false;
    if (!init()) return false;
    if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
    return true;
  }

  function envGain(t0, attack, peak, release, hold) {
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t0 + attack);
    if (hold) g.gain.setValueAtTime(Math.max(peak, 0.0002), t0 + attack + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + (hold || 0) + release);
    return g;
  }

  function noise(opts) {
    if (!ready()) return;
    var t0 = ctx.currentTime + (opts.delay || 0);
    var src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    var f = ctx.createBiquadFilter();
    f.type = opts.type || 'bandpass';
    f.frequency.setValueAtTime(opts.freq || 1200, t0);
    if (opts.freqTo) f.frequency.exponentialRampToValueAtTime(opts.freqTo, t0 + (opts.dur || opts.release || 0.2));
    f.Q.value = opts.q || 0.8;
    var g = envGain(t0, opts.attack || 0.005, opts.gain || 0.2, opts.release || opts.dur || 0.2, opts.hold || 0);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t0, Math.random() * 1.5);
    src.stop(t0 + (opts.attack || 0.005) + (opts.hold || 0) + (opts.release || opts.dur || 0.2) + 0.05);
  }

  function tone(freq, opts) {
    if (!ready()) return null;
    var t0 = ctx.currentTime + (opts.delay || 0);
    var o = ctx.createOscillator();
    o.type = opts.type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (opts.freqTo) o.frequency.exponentialRampToValueAtTime(opts.freqTo, t0 + (opts.release || 0.2));
    var g = envGain(t0, opts.attack || 0.004, opts.gain || 0.2, opts.release || 0.2, opts.hold || 0);
    o.connect(g); g.connect(master);
    o.start(t0);
    o.stop(t0 + (opts.attack || 0.004) + (opts.hold || 0) + (opts.release || 0.2) + 0.05);
    return o;
  }

  var api = {
    MORSE: MORSE,
    morseTimeline: morseTimeline,

    setEnabled: function (on) {
      enabled = !!on;
      if (!enabled) { api.stopHiss(); api.stopMorse(); api.stopMelody(); }
    },
    isEnabled: function () { return enabled; },
    /** Call from a click handler to unlock audio on mobile browsers. */
    unlock: function () { ready(); },

    static: function (dur) {
      noise({ type: 'highpass', freq: 900, q: 0.3, gain: 0.09, attack: 0.02, hold: (dur || 0.8) * 0.5, release: (dur || 0.8) * 0.5 });
    },
    paper: function () {
      noise({ type: 'bandpass', freq: 2600, q: 0.7, gain: 0.08, attack: 0.01, release: 0.12 });
      noise({ type: 'bandpass', freq: 1800, freqTo: 3400, q: 0.9, gain: 0.06, attack: 0.02, release: 0.18, delay: 0.09 });
    },
    click: function () {
      noise({ type: 'highpass', freq: 3200, q: 0.5, gain: 0.07, attack: 0.001, release: 0.025 });
    },
    tick: function () {
      tone(1900, { type: 'triangle', gain: 0.05, attack: 0.001, release: 0.03 });
      noise({ type: 'highpass', freq: 4000, gain: 0.04, attack: 0.001, release: 0.02 });
    },
    pencil: function () {
      noise({ type: 'bandpass', freq: 5200, q: 2, gain: 0.05, attack: 0.01, hold: 0.06, release: 0.08 });
      noise({ type: 'bandpass', freq: 4600, q: 2, gain: 0.04, attack: 0.01, hold: 0.04, release: 0.06, delay: 0.16 });
    },
    stamp: function () {
      tone(110, { freqTo: 46, gain: 0.5, attack: 0.002, release: 0.22 });
      noise({ type: 'lowpass', freq: 700, gain: 0.25, attack: 0.001, release: 0.09 });
    },
    rattle: function () {
      for (var i = 0; i < 3; i++) {
        noise({ type: 'bandpass', freq: 900 + i * 300, q: 3, gain: 0.08, attack: 0.002, release: 0.05, delay: i * 0.07 });
      }
    },
    clunk: function () {
      tone(160, { freqTo: 70, gain: 0.35, attack: 0.002, release: 0.25 });
      noise({ type: 'bandpass', freq: 1200, q: 1.5, gain: 0.15, attack: 0.002, release: 0.12 });
      noise({ type: 'bandpass', freq: 600, freqTo: 300, q: 1, gain: 0.1, attack: 0.05, release: 0.5, delay: 0.15 });
    },
    drawer: function () {
      noise({ type: 'lowpass', freq: 500, freqTo: 1400, q: 1.2, gain: 0.12, attack: 0.05, hold: 0.25, release: 0.2 });
      tone(90, { gain: 0.12, attack: 0.002, release: 0.12, delay: 0.5 });
    },
    lampOn: function () {
      tone(60, { type: 'sawtooth', gain: 0.015, attack: 0.05, hold: 0.25, release: 0.3 });
      noise({ type: 'highpass', freq: 6000, gain: 0.02, attack: 0.002, release: 0.04 });
    },

    /** Continuous tape hiss for the interview player. */
    startHiss: function () {
      if (hiss || !ready()) return;
      var src = ctx.createBufferSource();
      src.buffer = noiseBuf; src.loop = true;
      var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2500;
      var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 9000;
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.022, ctx.currentTime + 0.3);
      src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(master);
      src.start();
      hiss = { src: src, gain: g };
      tone(70, { gain: 0.08, attack: 0.002, release: 0.06 });
    },
    stopHiss: function () {
      if (!hiss || !ctx) { hiss = null; return; }
      var h = hiss; hiss = null;
      try {
        h.gain.gain.cancelScheduledValues(ctx.currentTime);
        h.gain.gain.setValueAtTime(h.gain.gain.value, ctx.currentTime);
        h.gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
        h.src.stop(ctx.currentTime + 0.2);
      } catch (e) { /* already stopped */ }
    },

    /** Play a Morse phrase as a soft hum, starting `offset` seconds in. */
    playMorse: function (text, offset) {
      api.stopMorse();
      if (!ready()) return;
      var tl = morseTimeline(text), base = ctx.currentTime + 0.05, off = offset || 0;
      tl.pulses.forEach(function (p) {
        if (p.start + p.dur <= off) return;
        var start = Math.max(0, p.start - off), dur = p.dur - Math.max(0, off - p.start);
        var t0 = base + start;
        var o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
        o1.type = 'sine'; o1.frequency.value = 520;
        o2.type = 'sine'; o2.frequency.value = 1040;
        var g = ctx.createGain(), g2 = ctx.createGain();
        g2.gain.value = 0.18;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.16, t0 + 0.012);
        g.gain.setValueAtTime(0.16, t0 + Math.max(0.013, dur - 0.015));
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        o1.connect(g); o2.connect(g2); g2.connect(g); g.connect(master);
        o1.start(t0); o2.start(t0); o1.stop(t0 + dur + 0.02); o2.stop(t0 + dur + 0.02);
        morseNodes.push(o1, o2);
      });
    },
    stopMorse: function () {
      morseNodes.forEach(function (o) { try { o.stop(); } catch (e) { /* done */ } });
      morseNodes = [];
    },

    /** A small music box. notes: [[freq, beat], ...]; returns length in seconds. */
    playMelody: function (notes, beat) {
      api.stopMelody();
      var b = beat || 0.55, t = 0, total = 0;
      notes.forEach(function (n) { total += n[1] * b; });
      if (!ready()) return total + 1.2;
      var base = ctx.currentTime + 0.08;
      notes.forEach(function (n) {
        var f = n[0], t0 = base + t;
        [[1, 0.16], [2.0, 0.05], [3.01, 0.025], [4.2, 0.012]].forEach(function (p) {
          var o = ctx.createOscillator();
          o.type = 'sine';
          o.frequency.value = f * p[0];
          var g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, t0);
          g.gain.exponentialRampToValueAtTime(p[1], t0 + 0.004);
          g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.6 / p[0] + 0.3);
          o.connect(g); g.connect(master);
          o.start(t0); o.stop(t0 + 2.2);
          melodyNodes.push(o);
        });
        // the tiny mechanical tick of the comb
        noise({ type: 'highpass', freq: 5000, gain: 0.015, attack: 0.001, release: 0.015, delay: t + 0.08 });
        t += n[1] * b;
      });
      return total + 1.2;
    },
    stopMelody: function () {
      melodyNodes.forEach(function (o) { try { o.stop(); } catch (e) { /* done */ } });
      melodyNodes = [];
    }
  };

  // Item 0047's five notes (A minor, falling to rest), and the longer version
  // the curator saved for the Deep Archive.
  api.MELODY = [[659.25, 1], [523.25, 1], [587.33, 1], [493.88, 1], [440.0, 2]];
  api.MELODY_LONG = api.MELODY.concat([[523.25, 1], [659.25, 1], [880.0, 2.5]]);

  // Sound must never break the game: every public call is wrapped so an audio
  // failure (old browser, interrupted context) is silently ignored.
  Object.keys(api).forEach(function (k) {
    var fn = api[k];
    if (typeof fn !== 'function' || k === 'morseTimeline') return;
    api[k] = function () {
      try { return fn.apply(api, arguments); } catch (e) { return k === 'playMelody' ? 5 : undefined; }
    };
  });

  root.Sound = api;
})(typeof window !== 'undefined' ? window : this);
