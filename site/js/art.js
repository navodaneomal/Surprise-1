/*
 * Art — every illustration in the case file, drawn as inline SVG strings.
 * No image files. Each call gets unique ids so two copies of the same
 * picture (normal view + ultraviolet view) never collide.
 */
(function (root) {
  'use strict';

  var seq = 0;
  function uid(p) { seq += 1; return p + seq; }
  function svg(vb, inner, cls, label) {
    var a11y = label ? ' role="img" aria-label="' + label + '"' : ' aria-hidden="true" focusable="false"';
    return '<svg class="' + (cls || '') + '" viewBox="' + vb + '" preserveAspectRatio="xMidYMid meet"' + a11y + '>' + inner + '</svg>';
  }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function polar(cx, cy, r, deg) {
    var a = (deg - 90) * Math.PI / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }
  function f(n) { return Math.round(n * 100) / 100; }

  /* ── Small line icons (24×24) for exhibit lists and tags ───────────────── */
  var ICONS = {
    doc: '<path d="M6 3h9l3 3v15H6z"/><path d="M15 3v3h3M9 10h6M9 13h6M9 16h4"/>',
    card: '<rect x="3" y="6" width="18" height="12" rx="1"/><path d="M3 9h18M6 12h8M6 15h5"/>',
    photo: '<rect x="3" y="5" width="18" height="14"/><rect x="5.5" y="7.5" width="13" height="9"/><path d="M8 15l3-3 2 2 2-2 2 3"/>',
    note: '<path d="M5 4h14v12l-4 4H5z"/><path d="M15 20v-4h4M8 8h8M8 11h8M8 14h5"/>',
    slip: '<path d="M7 3h10v18H7z"/><path d="M9.5 7h5M9.5 10h5M9.5 13h3"/><path d="M12 16.2l1.3 1.3-1.3 1.3-1.3-1.3z"/>',
    camera: '<rect x="3" y="7" width="13" height="10" rx="1"/><path d="M16 10l5-3v10l-5-3"/><circle cx="7" cy="10" r="1"/>',
    tape: '<rect x="2.5" y="5" width="19" height="14" rx="1.5"/><circle cx="8.5" cy="12" r="2.2"/><circle cx="15.5" cy="12" r="2.2"/><path d="M8.5 14.2h7M6 19l1.5-3h9L18 19"/>',
    log: '<path d="M6 3h12v18H6z"/><path d="M6 7h12M6 11h12M6 15h12M9 3v18"/>',
    book: '<path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1z"/><path d="M12 6v14"/>',
    box: '<path d="M3 9l9-4 9 4v8l-9 4-9-4z"/><path d="M3 9l9 4 9-4M12 13v8"/>',
    wheel: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="1"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21"/>',
    key: '<circle cx="7" cy="12" r="3.5"/><path d="M10.5 12H21M17 12v3M20 12v2"/>',
    drawer: '<rect x="3" y="4" width="18" height="16"/><path d="M3 12h18M10 8h4M10 16h4"/>',
    lamp: '<path d="M9 3h6v6l-1 2v8a2 2 0 0 1-4 0v-8L9 9z"/><path d="M5 5l-2-1M19 5l2-1M4 9H2M22 9h-2"/>',
    room: '<path d="M3 21V7l9-4 9 4v14"/><rect x="9" y="11" width="6" height="7"/><path d="M9 15h6"/>',
    // tag icons on the lockbox
    music: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
    diamond: '<path d="M12 3l8 9-8 9-8-9z"/>',
    label: '<rect x="4" y="8" width="16" height="8" rx="1"/><path d="M7 12h10"/><circle cx="6" cy="10" r=".6"/>',
    case: '<rect x="5" y="4" width="14" height="10"/><path d="M5 14h14v6H5zM8 4l-2 10M16 4l2 10"/>'
  };
  function icon(name, cls) {
    var body = ICONS[name] || ICONS.doc;
    return '<svg class="icon ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + body + '</svg>';
  }

  /* ── Case 001: photograph of display case 3 (sepia) ────────────────────── */
  function casePhoto(o) {
    o = o || {};
    var id = uid('cp');
    var defs =
      '<defs>' +
      '<linearGradient id="' + id + 'w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a523b"/><stop offset=".7" stop-color="#3a2b1e"/><stop offset="1" stop-color="#241a12"/></linearGradient>' +
      '<radialGradient id="' + id + 'l" cx=".5" cy=".15" r=".75"><stop offset="0" stop-color="#f6e2b8" stop-opacity=".38"/><stop offset="1" stop-color="#f6e2b8" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff4da" stop-opacity=".2"/><stop offset=".45" stop-color="#fff4da" stop-opacity=".03"/><stop offset="1" stop-color="#fff4da" stop-opacity=".12"/></linearGradient>' +
      '<linearGradient id="' + id + 'd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b412b"/><stop offset="1" stop-color="#33241a"/></linearGradient>' +
      '<radialGradient id="' + id + 'v" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>' +
      '</defs>';
    var body =
      '<rect width="400" height="300" fill="url(#' + id + 'w)"/>' +
      '<rect width="400" height="300" fill="url(#' + id + 'l)"/>' +
      '<rect y="232" width="400" height="30" fill="#2b2017"/><rect y="230" width="400" height="3" fill="#4a3725"/>' +
      '<rect y="262" width="400" height="38" fill="#1c140e"/>' +
      '<path d="M0 274h400M0 288h400" stroke="#2a1f16" stroke-width="1"/>' +
      // cabinet
      '<rect x="96" y="186" width="208" height="72" fill="url(#' + id + 'd)"/>' +
      '<rect x="106" y="200" width="86" height="48" fill="none" stroke="#24180f" stroke-width="2"/>' +
      '<rect x="208" y="200" width="86" height="48" fill="none" stroke="#24180f" stroke-width="2"/>' +
      '<rect x="96" y="186" width="208" height="5" fill="#6e5236"/>' +
      '<rect x="102" y="258" width="18" height="8" fill="#20160e"/><rect x="280" y="258" width="18" height="8" fill="#20160e"/>' +
      // the folded card under the front foot
      '<path d="M119 262.5l16-2 1.6 5.8-16.6 1.2z" fill="#e8dcc2"/><path d="M120.5 264.6l14.6-1.6" stroke="#b9a988" stroke-width=".6"/>' +
      // case interior
      '<rect x="106" y="62" width="188" height="124" fill="#180f0a"/>' +
      '<rect x="114" y="70" width="172" height="80" fill="#2b1d15"/>' +
      '<path d="M124 150H276L286 184H114z" fill="#4c2824"/>' +
      '<path d="M124 150H276L286 184H114z" fill="#8a6a58" opacity=".32"/>' +
      // the outline: cleaner (darker) velvet with ruler-sharp edges
      '<path d="M174 158H226L230 176H170z" fill="#3c1e1b" stroke="#2a1311" stroke-width=".8"/>' +
      // glass and frame
      '<rect x="106" y="62" width="188" height="124" fill="url(#' + id + 'g)" stroke="#a5874f" stroke-width="3"/>' +
      '<rect x="101" y="55" width="198" height="9" fill="#6a5134"/>' +
      '<path d="M128 68h34l-46 92h-8z" fill="#fff6e0" opacity=".06"/><path d="M190 68h10l-40 112h-6z" fill="#fff6e0" opacity=".05"/>' +
      // a faint reflection of whoever is looking in
      '<path d="M238 150c0-17 9-24 16-26-8-4-10-13-8-20 2-8 8-12 14-12 8 0 14 6 14 14 0 8-4 14-10 18 8 4 18 10 18 26z" fill="#fff4da" opacity=".07"/>' +
      // label plate and lock
      '<rect x="182" y="190" width="36" height="10" rx="1" fill="#b59559"/><text x="200" y="197.6" font-size="6.6" text-anchor="middle" fill="#3b2a14" font-family="Courier Prime, monospace" letter-spacing=".5">0047</text>' +
      '<circle cx="276" cy="207" r="4.2" fill="#c7a86a"/><rect x="275" y="206" width="2" height="5" fill="#2a1d12"/>' +
      '<rect width="400" height="300" fill="url(#' + id + 'v)"/>';
    return svg('0 0 400 300', defs + body, 'art art-photo', o.label || 'Photograph of an empty glass display case on a wooden cabinet');
  }

  /** Ultraviolet overlay for the photograph: the outline glows with a ◇. */
  function casePhotoUV() {
    var body =
      '<path d="M174 158H226L230 176H170z" fill="none" stroke="#bff7ff" stroke-width="1.4" opacity=".9"/>' +
      '<path d="M200 159l7 8-7 8-7-8z" fill="none" stroke="#e9ff8f" stroke-width="1.6"/>' +
      '<text x="200" y="146" font-size="10" text-anchor="middle" fill="#e9ff8f" font-family="Caveat, cursive">deposited</text>';
    return svg('0 0 400 300', body, 'art art-uv');
  }

  /* ── Case 002: CCTV still of Reading Room 4 (greyscale) ────────────────── */
  function clockHands(cx, cy, r, h, m, sw) {
    var ha = ((h % 12) + m / 60) * 30, ma = m * 6;
    var hp = polar(cx, cy, r * 0.5, ha), mp = polar(cx, cy, r * 0.8, ma);
    return '<line x1="' + cx + '" y1="' + cy + '" x2="' + f(hp[0]) + '" y2="' + f(hp[1]) + '" stroke="#111" stroke-width="' + (sw * 1.5) + '" stroke-linecap="round"/>' +
      '<line x1="' + cx + '" y1="' + cy + '" x2="' + f(mp[0]) + '" y2="' + f(mp[1]) + '" stroke="#111" stroke-width="' + sw + '" stroke-linecap="round"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + (sw * 1.3) + '" fill="#111"/>';
  }

  function still(fr) {
    var id = uid('st');
    var ticks = '';
    for (var i = 0; i < 12; i++) {
      var a = polar(150, 50, 17, i * 30), b = polar(150, 50, 14.5, i * 30);
      ticks += '<line x1="' + f(a[0]) + '" y1="' + f(a[1]) + '" x2="' + f(b[0]) + '" y2="' + f(b[1]) + '" stroke="#222" stroke-width="' + (i % 3 === 0 ? 1.6 : 0.8) + '"/>';
    }
    var velY = fr.raised ? 130.5 : 132;
    var body =
      '<defs>' +
      '<linearGradient id="' + id + 'w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#55595a"/><stop offset="1" stop-color="#2f3233"/></linearGradient>' +
      '<pattern id="' + id + 's" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000" opacity=".22"/></pattern>' +
      '<radialGradient id="' + id + 'v" cx=".5" cy=".5" r=".72"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient>' +
      '</defs>' +
      '<rect width="320" height="240" fill="url(#' + id + 'w)"/>' +
      '<rect y="168" width="320" height="72" fill="#232526"/><path d="M0 168h320" stroke="#3d4142"/>' +
      '<path d="M0 205h320M0 224h320" stroke="#2c2f30"/>' +
      // door on the left
      '<rect x="12" y="66" width="34" height="102" fill="#3a3d3e" stroke="#202223" stroke-width="2"/><circle cx="40" cy="120" r="2" fill="#777"/>' +
      // wall clock
      '<circle cx="150" cy="50" r="20" fill="#dcdedb" stroke="#151616" stroke-width="3"/>' + ticks + clockHands(150, 50, 18, fr.h, fr.m, 1.4) +
      // reading table, lamp, light, chair
      '<path d="M100 104l-26 52h40z" fill="#fff" opacity=".07"/>' +
      '<path d="M58 152h140l14 22H44z" fill="#45443f"/><path d="M58 152h140" stroke="#5c5a54"/>' +
      '<path d="M54 174v30M202 174v30" stroke="#2c2b28" stroke-width="3"/>' +
      '<path d="M86 152v-6h12v6M92 146l10-30" stroke="#999" stroke-width="2" fill="none"/><path d="M96 112l14 6-6 8-14-6z" fill="#8a8a85"/>' +
      '<path d="M214 150v38M214 150h20v18h-20M234 168v20M214 188h0" stroke="#5b5a55" stroke-width="2.4" fill="none"/>' +
      '<path d="M120 148h40v4h-40z" fill="#c9c7c0" opacity=".7"/>' +
      // display case 3 (right)
      '<rect x="244" y="140" width="56" height="44" fill="#3b3a36"/><rect x="244" y="140" width="56" height="2" fill="#5b5952"/>' +
      '<rect x="247" y="184" width="6" height="4" fill="#1d1d1b"/><rect x="291" y="184" width="6" height="4" fill="#1d1d1b"/>' +
      '<rect x="247" y="100" width="50" height="40" fill="#1e1f1f" stroke="#8b8a80" stroke-width="1.5"/>' +
      '<rect x="250" y="' + velY + '" width="44" height="' + (140 - velY - 1) + '" fill="#4a4a4a"/>' +
      (fr.raised ? '<path d="M262 ' + (velY + 0.4) + 'h20" stroke="#6a6a6a" stroke-width=".8"/>' : '') +
      (fr.outline ? '<rect x="263" y="' + (velY + 2) + '" width="18" height="4" fill="#2a2a2a"/>' : '') +
      (fr.label ? '<rect x="268" y="143" width="8" height="3" fill="#e6e6e0"/>' : '') +
      (fr.card ? '<path d="M253 186.6l5-.8.6 1.8-5.2.4z" fill="#f2f2ee"/>' : '') +
      '<path d="M252 104l10 0-12 30h-2z" fill="#fff" opacity=".08"/>' +
      // CCTV overlay
      '<rect width="320" height="240" fill="url(#' + id + 's)"/>' +
      '<rect width="320" height="240" fill="url(#' + id + 'v)"/>' +
      '<g font-family="Courier Prime, monospace" font-size="10" fill="#f2f2ee" opacity=".85">' +
      '<text x="10" y="18">CAM 2 · RR4</text>' +
      '<text x="10" y="230">' + pad2(fr.day) + ' NOV · --:--:--</text>' +
      '<text x="268" y="18">REC</text></g><circle cx="261" cy="14.5" r="3" fill="#c33" opacity=".85"/>';
    return svg('0 0 320 240', body, 'art art-still', 'Camera 2 still, ' + fr.day + ' November. Reading Room 4, empty, with a wall clock, a reading table and display case 3.');
  }

  /** A large wall-clock face for reading the exact time. */
  function clock(h, m, label) {
    var ticks = '', nums = '';
    for (var i = 0; i < 60; i++) {
      var major = i % 5 === 0;
      var a = polar(100, 100, 88, i * 6), b = polar(100, 100, major ? 78 : 83, i * 6);
      ticks += '<line x1="' + f(a[0]) + '" y1="' + f(a[1]) + '" x2="' + f(b[0]) + '" y2="' + f(b[1]) + '" stroke="#1b1b1b" stroke-width="' + (major ? 2.4 : 1) + '"/>';
    }
    for (var n = 1; n <= 12; n++) {
      var p = polar(100, 100, 66, n * 30);
      nums += '<text x="' + f(p[0]) + '" y="' + f(p[1] + 5) + '" text-anchor="middle" font-size="15" font-family="EB Garamond, Georgia, serif" fill="#1b1b1b">' + n + '</text>';
    }
    var body =
      '<circle cx="100" cy="100" r="97" fill="#1b1b1b"/><circle cx="100" cy="100" r="92" fill="#e9e6dc"/>' +
      ticks + nums +
      '<text x="100" y="134" text-anchor="middle" font-size="7" letter-spacing="1.5" font-family="Courier Prime, monospace" fill="#555">RR4</text>' +
      clockHands(100, 100, 86, h, m, 3);
    return svg('0 0 200 200', body, 'art art-clock', label || 'Wall clock');
  }

  /* ── Case 003: cassette ─────────────────────────────────────────────────── */
  function reel(cx, cy) {
    var spokes = '';
    for (var i = 0; i < 6; i++) {
      var a = polar(cx, cy, 7, i * 60);
      spokes += '<line x1="' + cx + '" y1="' + cy + '" x2="' + f(a[0]) + '" y2="' + f(a[1]) + '" stroke="#ddd5c2" stroke-width="2"/>';
    }
    return '<g class="reel"><circle cx="' + cx + '" cy="' + cy + '" r="15" fill="#2a2724"/><circle cx="' + cx + '" cy="' + cy + '" r="9" fill="#151413" stroke="#ddd5c2" stroke-width="1.5"/>' + spokes + '</g>';
  }
  function cassette() {
    var body =
      '<rect x="4" y="4" width="292" height="182" rx="12" fill="#1f1d1b" stroke="#3b3733" stroke-width="2"/>' +
      '<rect x="22" y="18" width="256" height="72" rx="4" fill="#e9e0c9"/>' +
      '<rect x="22" y="18" width="256" height="12" fill="#a8432f" opacity=".85"/>' +
      '<rect x="84" y="102" width="132" height="44" rx="6" fill="#0f0e0d" stroke="#3b3733"/>' +
      '<path d="M106 142c20 6 68 6 88 0" stroke="#4a3a2a" stroke-width="5" fill="none"/>' +
      reel(118, 124) + reel(182, 124) +
      '<path d="M70 186l14-24h132l14 24" fill="#2a2725"/>' +
      '<circle cx="18" cy="172" r="3" fill="#47423d"/><circle cx="282" cy="172" r="3" fill="#47423d"/><circle cx="18" cy="18" r="3" fill="#47423d"/><circle cx="282" cy="18" r="3" fill="#47423d"/>';
    return svg('0 0 300 190', body, 'art art-cassette', 'A cassette tape labelled with the interview');
  }

  /** Waveform of the recorded hum: one bar per pulse, to scale. */
  function waveform(timeline, w, hgt) {
    var W = w || 600, H = hgt || 70, len = timeline.length || 1, pad = 10;
    var scale = (W - pad * 2) / len, mid = H / 2, bars = '';
    // tape noise floor
    for (var x = pad; x < W - pad; x += 3) {
      var n = 1.5 + ((x * 7919) % 13) / 6;
      bars += '<rect x="' + x + '" y="' + f(mid - n / 2) + '" width="1.4" height="' + f(n) + '" fill="currentColor" opacity=".25"/>';
    }
    timeline.pulses.forEach(function (p) {
      var hh = p.kind === '.' ? H * 0.55 : H * 0.7;
      bars += '<rect class="pulse" x="' + f(pad + p.start * scale) + '" y="' + f(mid - hh / 2) + '" width="' + f(Math.max(2, p.dur * scale)) + '" height="' + f(hh) + '" rx="1.5" fill="currentColor"/>';
    });
    return svg('0 0 ' + W + ' ' + H, bars, 'art art-wave', 'Waveform of the recorded hum: a row of short and long pulses');
  }

  /* ── Case 004: lockbox, wheel, key ──────────────────────────────────────── */
  function lockbox(open) {
    var id = uid('lb');
    var defs = '<defs><linearGradient id="' + id + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8b9196"/><stop offset="1" stop-color="#4a4f53"/></linearGradient>' +
      '<linearGradient id="' + id + 'i" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2e30"/><stop offset="1" stop-color="#3d4245"/></linearGradient></defs>';
    var body;
    if (!open) {
      body =
        '<ellipse cx="150" cy="182" rx="128" ry="10" fill="#000" opacity=".35"/>' +
        '<path d="M30 70h240l12 16v84H18V86z" fill="url(#' + id + 's)" stroke="#2c3033" stroke-width="2"/>' +
        '<path d="M18 86h264" stroke="#c9d0d4" stroke-width="1" opacity=".5"/>' +
        '<path d="M120 70v-18a8 8 0 0 1 8-8h44a8 8 0 0 1 8 8v18" fill="none" stroke="#5e6468" stroke-width="7" stroke-linecap="round"/>' +
        '<rect x="72" y="110" width="156" height="34" rx="4" fill="#26292b"/>' +
        [0, 1, 2, 3].map(function (i) { return '<rect x="' + (82 + i * 37) + '" y="116" width="26" height="22" rx="3" fill="#b8955a"/><path d="M' + (82 + i * 37) + ' 121h26M' + (82 + i * 37) + ' 133h26" stroke="#6b5530" stroke-width="1"/>'; }).join('') +
        '<path d="M178 46l38 30" stroke="#d8ccb0" stroke-width="1"/><path d="M212 72l26-6 6 22-26 6z" fill="#efe6d0" stroke="#b8aa8a"/><text x="229" y="85" font-size="8" transform="rotate(-13 229 85)" text-anchor="middle" font-family="Courier Prime, monospace" fill="#5a4a30">0047</text>' +
        '<text x="150" y="162" text-anchor="middle" font-size="8" letter-spacing="2" font-family="Courier Prime, monospace" fill="#22262a" opacity=".7">WRENFIELD</text>';
    } else {
      body =
        '<ellipse cx="150" cy="182" rx="128" ry="10" fill="#000" opacity=".35"/>' +
        '<path d="M30 20h240l12 50H18z" fill="url(#' + id + 's)" stroke="#2c3033" stroke-width="2"/>' +
        '<path d="M44 30h212l8 34H36z" fill="#3a3f42"/>' +
        '<path d="M18 86h264v84H18z" fill="url(#' + id + 's)" stroke="#2c3033" stroke-width="2"/>' +
        '<path d="M18 70h264l-8 16H26z" fill="url(#' + id + 'i)"/>' +
        '<path d="M26 86h248v6H26z" fill="#1f2224"/>' +
        // contents peeking out: slip, key, wheel
        '<path d="M60 74l70-4 2 14-70 4z" fill="#efe6d0" stroke="#b8aa8a"/><path d="M68 77h50M68 81h40" stroke="#8a7b60" stroke-width="1"/>' +
        '<circle cx="200" cy="78" r="12" fill="#efe6d2" stroke="#9a8a6a"/><circle cx="200" cy="78" r="7" fill="#e2d5b8" stroke="#9a8a6a"/><circle cx="200" cy="78" r="1.5" fill="#6b5530"/>' +
        '<circle cx="240" cy="78" r="4" fill="none" stroke="#c7a86a" stroke-width="2.5"/><path d="M244 78h16M256 78v4" stroke="#c7a86a" stroke-width="2.5"/>';
    }
    return svg('0 0 300 200', defs + body, 'art art-box', open ? 'The steel lockbox, open' : 'A flat steel lockbox with four brass dials');
  }

  var ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  function wheel(setting) {
    var outer = '', inner = '', ticks = '';
    for (var i = 0; i < 26; i++) {
      var deg = i * 360 / 26;
      var po = polar(150, 150, 124, deg), pi = polar(150, 150, 88, deg);
      outer += '<text x="' + f(po[0]) + '" y="' + f(po[1] + 5) + '" text-anchor="middle" font-size="15" font-weight="700" transform="rotate(' + f(deg) + ' ' + f(po[0]) + ' ' + f(po[1]) + ')">' + ABC[i] + '</text>';
      inner += '<text x="' + f(pi[0]) + '" y="' + f(pi[1] + 4.5) + '" text-anchor="middle" font-size="13" transform="rotate(' + f(deg) + ' ' + f(pi[0]) + ' ' + f(pi[1]) + ')">' + ABC[i] + '</text>';
      var t1 = polar(150, 150, 140, deg + 360 / 52), t2 = polar(150, 150, 108, deg + 360 / 52);
      ticks += '<line x1="' + f(t1[0]) + '" y1="' + f(t1[1]) + '" x2="' + f(t2[0]) + '" y2="' + f(t2[1]) + '" stroke="#b9a988" stroke-width=".7"/>';
    }
    var rot = -(setting || 0) * 360 / 26;
    var body =
      '<circle cx="150" cy="150" r="146" fill="#f1e8d4" stroke="#8a7a5a" stroke-width="2"/>' + ticks +
      '<g font-family="Courier Prime, monospace" fill="#2a2116">' + outer + '</g>' +
      '<g class="wheel-inner" style="transform:rotate(' + f(rot) + 'deg)">' +
      '<circle cx="150" cy="150" r="106" fill="#e0d1b0" stroke="#8a7a5a" stroke-width="1.5"/>' +
      '<g font-family="Courier Prime, monospace" fill="#8c2f22">' + inner + '</g>' +
      '<circle cx="150" cy="150" r="70" fill="none" stroke="#b9a988" stroke-dasharray="2 4"/>' +
      '<text x="150" y="124" text-anchor="middle" font-size="8" letter-spacing="2" font-family="Courier Prime, monospace" fill="#6b5a3a">WRENFIELD</text>' +
      '</g>' +
      '<path d="M150 2l-7 12h14z" fill="#8c2f22"/>' +
      '<rect x="138" y="16" width="24" height="88" rx="3" fill="none" stroke="#8c2f22" stroke-width="1.5" opacity=".7"/>' +
      '<circle cx="150" cy="150" r="9" fill="#b8955a" stroke="#6b5530"/><circle cx="150" cy="150" r="2.5" fill="#6b5530"/>';
    return svg('0 0 300 300', body, 'art art-wheel', 'A cipher wheel. Outer ring: plain letters. Inner ring: cipher letters.');
  }

  function windKey() {
    var body =
      '<path d="M150 40c-30 0-50 14-50 34s20 34 50 34 50-14 50-34-20-34-50-34zm0 18c18 0 28 7 28 16s-10 16-28 16-28-7-28-16 10-16 28-16z" fill="#c7a35f" stroke="#7a5f2f" stroke-width="2"/>' +
      '<rect x="143" y="106" width="14" height="70" fill="#c7a35f" stroke="#7a5f2f" stroke-width="2"/>' +
      '<rect x="138" y="172" width="24" height="16" rx="2" fill="#b38f4f" stroke="#7a5f2f" stroke-width="2"/>' +
      '<path d="M200 74c30 6 44 20 52 38" stroke="#cfc3a6" stroke-width="1.2" fill="none"/>' +
      '<path d="M236 110l40-8 8 34-40 8z" fill="#efe6d0" stroke="#b8aa8a"/><circle cx="244" cy="116" r="2.5" fill="none" stroke="#9a8a6a"/>';
    return svg('0 0 300 200', body, 'art art-item', 'A small brass winding key with a paper tag');
  }

  function uvLamp() {
    var id = uid('uv');
    var body =
      '<defs><radialGradient id="' + id + 'g" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#b48cff" stop-opacity=".55"/><stop offset="1" stop-color="#b48cff" stop-opacity="0"/></radialGradient></defs>' +
      '<ellipse cx="210" cy="100" rx="90" ry="70" fill="url(#' + id + 'g)"/>' +
      '<rect x="60" y="86" width="110" height="28" rx="12" fill="#2b2b30" stroke="#55555c" stroke-width="2"/>' +
      '<rect x="160" y="80" width="30" height="40" rx="6" fill="#3a3a42" stroke="#55555c" stroke-width="2"/>' +
      '<rect x="186" y="84" width="6" height="32" rx="2" fill="#c9b3ff"/>' +
      '<rect x="92" y="92" width="18" height="6" rx="3" fill="#6a6a72"/>';
    return svg('0 0 300 200', body, 'art art-item', 'A pocket ultraviolet lamp');
  }

  /* ── Case 006: Reading Room 4 at night ──────────────────────────────────── */
  function room(o) {
    o = o || {};
    var id = uid('rm');
    var motes = '';
    for (var i = 0; i < 9; i++) {
      motes += '<circle class="mote" style="animation-delay:' + (i * 0.45).toFixed(2) + 's" cx="' + (176 + (i * 37) % 52) + '" cy="' + (160 - (i * 13) % 20) + '" r="' + (1 + (i % 3) * 0.5) + '" fill="#f6e3b0"/>';
    }
    var body =
      '<defs>' +
      '<radialGradient id="' + id + 'l" cx=".18" cy=".2" r=".7"><stop offset="0" stop-color="#e9c98a" stop-opacity=".42"/><stop offset=".5" stop-color="#e9c98a" stop-opacity=".08"/><stop offset="1" stop-color="#e9c98a" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff4da" stop-opacity=".14"/><stop offset=".5" stop-color="#fff4da" stop-opacity=".02"/><stop offset="1" stop-color="#fff4da" stop-opacity=".08"/></linearGradient>' +
      '</defs>' +
      '<rect width="400" height="300" fill="#0d0b09"/>' +
      '<rect y="236" width="400" height="64" fill="#090807"/>' +
      '<rect width="400" height="300" fill="url(#' + id + 'l)"/>' +
      '<path d="M40 214h96l8 12H32z" fill="#2a2018"/><path d="M60 214v-8h14v8M66 206l16-40" stroke="#6a5a40" stroke-width="2.5" fill="none"/><path d="M76 160l22 8-8 12-22-8z" fill="#7a6648"/>' +
      '<path d="M86 176L40 214h80z" fill="#f2d79c" opacity=".12"/>' +
      '<rect x="140" y="190" width="120" height="58" fill="#241a12"/><rect x="140" y="190" width="120" height="4" fill="#3f2f20"/>' +
      '<rect x="146" y="248" width="10" height="6" fill="#120d09"/><rect x="244" y="248" width="10" height="6" fill="#120d09"/>' +
      '<rect x="146" y="92" width="108" height="98" fill="#0b0807"/>' +
      '<path d="M154 160h92l6 28H148z" fill="#3a1d1a"/>' +
      '<rect x="146" y="92" width="108" height="98" fill="url(#' + id + 'g)" stroke="#7d6640" stroke-width="2.5"/>' +
      '<rect x="142" y="86" width="116" height="7" fill="#4a3826"/>' +
      '<rect x="186" y="195" width="28" height="8" rx="1" fill="#9c804c"/><text x="200" y="201.4" font-size="5.4" text-anchor="middle" fill="#2e2210" font-family="Courier Prime, monospace">0047</text>' +
      '<g class="reflect"><path d="M206 186c0-18 9-26 17-28-8-4-11-13-9-21 2-9 9-13 15-13 9 0 15 7 15 15 0 9-4 15-11 19 9 4 19 11 19 28z" fill="#fff4da" opacity=".13"/></g>' +
      (o.motes ? '<g class="motes">' + motes + '</g>' : '');
    return svg('0 0 400 300', body, 'art art-room', 'Reading Room 4 at night: a reading lamp, and display case 3, empty');
  }

  /* ── Deep Archive: the music box, and Plate 7 ───────────────────────────── */
  function musicBox(open) {
    var id = uid('mb');
    var pins = '';
    for (var i = 0; i < 14; i++) pins += '<circle cx="' + (112 + i * 6) + '" cy="' + (128 + (i * 5) % 9) + '" r="1" fill="#e8d7a8"/>';
    var comb = '';
    for (var j = 0; j < 12; j++) comb += '<rect x="' + (116 + j * 6.4) + '" y="142" width="3.6" height="' + (20 - j) + '" fill="#d2b06a"/>';
    var body =
      '<defs><linearGradient id="' + id + 'w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6b4024"/><stop offset="1" stop-color="#3b2212"/></linearGradient></defs>' +
      '<ellipse cx="150" cy="198" rx="110" ry="9" fill="#000" opacity=".4"/>' +
      '<g class="mb-lid">' +
      (open
        ? '<path d="M50 104l20-80h160l20 80z" fill="url(#' + id + 'w)" stroke="#24140a" stroke-width="2"/><path d="M78 92l14-56h116l14 56z" fill="#5a1f22"/><text x="150" y="70" text-anchor="middle" font-size="9" font-family="Caveat, cursive" fill="#e7cfa0">for whoever noticed</text>'
        : '<path d="M50 104h200v16H50z" fill="url(#' + id + 'w)" stroke="#24140a" stroke-width="2"/>') +
      '</g>' +
      '<path d="M50 120h200v74H50z" fill="url(#' + id + 'w)" stroke="#24140a" stroke-width="2"/>' +
      (open
        ? '<path d="M60 120h180v12H60z" fill="#24140a"/><rect x="104" y="122" width="96" height="14" rx="7" fill="#b89b5e"/>' + pins + comb + '<path d="M210 126l18-4 4 14-18 4z" fill="#efe6d0"/>'
        : '') +
      '<rect x="138" y="150" width="24" height="12" rx="2" fill="#c7a35f" opacity="' + (open ? '.0' : '.9') + '"/>' +
      '<circle cx="250" cy="160" r="6" fill="#c7a35f" stroke="#7a5f2f"/>';
    return svg('0 0 300 210', body, 'art art-mbox', open ? 'The walnut music box, open, its brass comb visible' : 'A small walnut music box, closed');
  }

  function plate() {
    var id = uid('pl');
    var wren = 'M44 58L54 54C56 44 66 38 76 40C86 42 92 50 96 56C106 52 118 52 128 56L146 30C150 25 158 27 157 33L140 66C142 84 132 104 110 108C92 112 72 106 62 94C56 86 54 74 56 66L44 60Z';
    var extra = 'M92 64C104 70 116 74 128 72M96 78C108 84 118 86 128 81M96 108L92 126M92 126L86 128M92 126L97 129M108 108L110 126M110 126L104 128M110 126L115 128M58 128L150 128';
    var body =
      '<defs>' +
      '<linearGradient id="' + id + 't" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff2cf"/><stop offset=".5" stop-color="#ffe0a0"/><stop offset="1" stop-color="#fff7e6"/></linearGradient>' +
      '<radialGradient id="' + id + 'b" cx=".5" cy=".45" r=".7"><stop offset="0" stop-color="#1b1a22"/><stop offset="1" stop-color="#050507"/></radialGradient>' +
      '</defs>' +
      '<rect width="400" height="300" fill="url(#' + id + 'b)"/>' +
      '<g opacity=".18" stroke="#8a8a9a" fill="none"><rect x="150" y="150" width="100" height="80"/><path d="M146 230h108M150 210h100"/></g>' +
      '<g transform="translate(64 26) scale(1.55)" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="' + wren + '" stroke="#ffe7b0" stroke-width="5" opacity=".12"/>' +
      '<path d="' + extra + '" stroke="#ffe7b0" stroke-width="4" opacity=".1"/>' +
      '<path class="trail" d="' + wren + '" stroke="url(#' + id + 't)" stroke-width="1.6"/>' +
      '<path class="trail" d="' + extra + '" stroke="url(#' + id + 't)" stroke-width="1.1" opacity=".85"/>' +
      '<circle cx="68" cy="50" r="2" fill="#fff8e8"/><circle cx="44" cy="58" r="1.6" fill="#fff8e8"/><circle cx="157" cy="31" r="1.6" fill="#fff8e8"/>' +
      '</g>' +
      '<path d="M200 262l6 7-6 7-6-7z" fill="none" stroke="#ffe7b0" stroke-width="1" opacity=".6"/>' +
      '<g font-family="Courier Prime, monospace" font-size="8" fill="#8a8578" opacity=".7"><text x="12" y="290">PLATE 7 · RR4 · 13.XI · 21:14–06:40</text></g>';
    return svg('0 0 400 300', body, 'art art-plate', 'Plate 7: a long exposure of the dark reading room. A trail of light, drawn by a moving lamp, traces a small wren above the empty case.');
  }

  root.Art = {
    icon: icon, casePhoto: casePhoto, casePhotoUV: casePhotoUV, still: still, clock: clock,
    cassette: cassette, waveform: waveform, lockbox: lockbox, wheel: wheel, windKey: windKey,
    uvLamp: uvLamp, room: room, musicBox: musicBox, plate: plate
  };
})(typeof window !== 'undefined' ? window : this);
