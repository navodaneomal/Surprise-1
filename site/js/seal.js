/*
 * Seal — tiny, dependency-free content sealing for Case File 001.
 *
 * Every case after the first is shipped as an encrypted blob. The key for a
 * blob is the (normalised) answer to the case before it, so reading the page
 * source does not spoil the mystery. This is obfuscation for a puzzle game,
 * not security: there is nothing secret here worth protecting.
 *
 * The same file is loaded by the browser and by tools/build.mjs (through a
 * Node vm sandbox), so the build and the site can never disagree.
 */
(function (root) {
  'use strict';

  var MAGIC = 'WA001|';

  /** Uppercase, strip accents, keep only A–Z and 0–9. "Look under!" -> "LOOKUNDER" */
  function normalize(s) {
    var str = String(s == null ? '' : s);
    if (str.normalize) str = str.normalize('NFKD');
    return str.toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  /* cyrb128: fast 128-bit string hash -> four 32-bit seeds */
  function cyrb128(str) {
    var h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
    for (var i = 0, k; i < str.length; i++) {
      k = str.charCodeAt(i);
      h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
      h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
      h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
      h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    h1 ^= (h2 ^ h3 ^ h4); h2 ^= h1; h3 ^= h1; h4 ^= h1;
    return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
  }

  /* sfc32 PRNG returning unsigned 32-bit integers */
  function sfc32(a, b, c, d) {
    return function () {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
      var t = (a + b) | 0;
      a = b ^ (b >>> 9);
      b = (c + (c << 3)) | 0;
      c = (c << 21) | (c >>> 11);
      d = (d + 1) | 0;
      t = (t + d) | 0;
      c = (c + t) | 0;
      return t >>> 0;
    };
  }

  function keystream(salt, scope, key) {
    var s = cyrb128(salt + '|' + scope + '|' + key);
    var next = sfc32(s[0], s[1], s[2], s[3]);
    for (var i = 0; i < 32; i++) next();
    return next;
  }

  function utf8Encode(str) {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(str);
    var bin = unescape(encodeURIComponent(str));
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function utf8Decode(bytes) {
    if (typeof TextDecoder !== 'undefined') return new TextDecoder().decode(bytes);
    var bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    try { return decodeURIComponent(escape(bin)); } catch (e) { return ''; }
  }

  function toB64(bytes) {
    var bin = '';
    for (var i = 0; i < bytes.length; i += 0x8000) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(bin);
  }

  function fromB64(b64) {
    var bin = atob(b64);
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function xor(bytes, next) {
    var out = new Uint8Array(bytes.length);
    for (var i = 0; i < bytes.length; i++) out[i] = bytes[i] ^ (next() & 255);
    return out;
  }

  /** Encrypt text with a key (the key is normalised first). */
  function seal(text, key, scope, salt) {
    return toB64(xor(utf8Encode(MAGIC + text), keystream(salt, scope, normalize(key))));
  }

  /** Decrypt; returns the text, or null when the key is wrong. */
  function open(b64, key, scope, salt) {
    try {
      var text = utf8Decode(xor(fromB64(b64), keystream(salt, scope, normalize(key))));
      return text.indexOf(MAGIC) === 0 ? text.slice(MAGIC.length) : null;
    } catch (e) {
      return null;
    }
  }

  /** Short one-way tag used to look up alternative and near-miss answers. */
  function tag(value, scope, salt) {
    var h = cyrb128(salt + '|tag|' + scope + '|' + normalize(value));
    return ('00000000' + h[0].toString(16)).slice(-8) + ('00000000' + h[1].toString(16)).slice(-8);
  }

  root.Seal = { normalize: normalize, seal: seal, open: open, tag: tag };
})(typeof window !== 'undefined' ? window : this);
