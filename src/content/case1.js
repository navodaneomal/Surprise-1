// CASE 001 — THE OBJECT
// Shipped unsealed: this is the first thing the player sees.
// Solution: the curator's note is an acrostic. First letters -> PRESENT.
// (Its last letters spell WITNESS, which only matters in Case 005.)
import { D, T, mark } from './_shared.js';

export default {
  id: 1,
  code: '001',
  title: 'The Object',
  teaser: 'A music box is missing from a locked display case.',

  // Shown once, the first time the investigation begins.
  cover: {
    html: `
      <div class="doc-head"><span>The Wrenfield Archive · Internal</span><span>File WA/001</span></div>
      <p class="eyebrow">Reading Room copy · Not for circulation</p>
      <p>This file was never meant to leave Reading Room 4.</p>
      <p>If you are reading it, it found its way to you. In this archive, that usually means it was meant to.</p>
      <p>The case is unresolved. Everyone who has looked at it so far has looked for the wrong thing.</p>
      <p>Begin with the object. Everyone does.</p>
      <div class="sticky"><span>You weren't supposed to find this. But since you have, the case is yours now.</span><span class="sticky-sig">C.</span></div>`,
    button: 'Open the file',
  },

  brief: `
    <p>On the morning of <b>14 November</b>, the assistant archivist unlocked Reading Room 4 of the Wrenfield Archive and found display case 3 empty.</p>
    <p>The object it held, catalogue number <b>0047</b>, a small walnut music box, was reported missing. The case was locked. Nothing was broken. Nobody saw anything.</p>
    <p class="aside">Start with what's in front of you.</p>`,

  evidence: [
    {
      id: 'c1-report',
      type: 'doc',
      label: 'Exhibit 1-A',
      title: 'Incident report',
      icon: 'doc',
      notes: [
        'Item 0047 was in <b>display case 3</b>, Reading Room 4.',
        `An unsigned slip marked ${D} arrived at 21:14 on 13 Nov and never signed out.`,
      ],
      data: {
        paper: 'typed',
        html: `
          <div class="doc-head"><span>The Wrenfield Archive</span><span>Ref. WA/001</span></div>
          <h3 class="doc-title">Incident Report</h3>
          <dl class="kv">
            <div><dt>Date</dt><dd>14 November</dd></div>
            <div><dt>Time of report</dt><dd>06:52</dd></div>
            <div><dt>Reported by</dt><dd>E. Varga, Assistant Archivist</dd></div>
            <div><dt>Location</dt><dd>Reading Room 4, display case 3</dd></div>
            <div><dt>Item</dt><dd>0047, music box, walnut</dd></div>
          </dl>
          <h4>Account</h4>
          <p>At 06:40 I unlocked Reading Room 4 for the day. Display case 3 was empty. The case was locked and its key was in its place in the key cabinet. There was no damage to the glass, the lock or the room.</p>
          <p>The velvet inside the case shows a clean outline where the item stood. The brass label (0047) is still in place.</p>
          <p>Visitor slips for the previous evening: the last signed visitor left at 20:58. One further slip is unsigned, marked only with a ${D}. It shows an arrival at 21:14 and no departure.</p>
          <p>The night custodian, T. Reyl, was on duty from 21:00 to 06:00 and reports nothing unusual.</p>
          <h4>Action taken</h4>
          <p>Case file opened. Item recorded as <span data-uv="missing">missing</span>.</p>
          <div class="doc-foot"><span class="sig">E. Varga</span><span class="stamp red">Unresolved</span></div>`,
      },
    },
    {
      id: 'c1-card',
      type: 'doc',
      label: 'Exhibit 1-B',
      title: 'Catalogue card 0047',
      icon: 'card',
      notes: ['Item 0047 plays a melody of <b>five notes</b> when wound.', 'There is no accession record. Nobody remembers it arriving.'],
      data: {
        paper: 'card',
        html: `
          <div class="card-head"><span>Wrenfield Archive · Catalogue</span><span class="no">No. 0047</span></div>
          <dl class="kv tight">
            <div><dt>Object</dt><dd>Music box</dd></div>
            <div><dt>Material</dt><dd>Walnut case, brass comb</dd></div>
            <div><dt>Size</dt><dd>11 × 7 × 5 cm</dd></div>
            <div><dt>Description</dt><dd>Plays a short melody of five notes when wound. Melody unidentified.</dd></div>
            <div><dt>Donor</dt><dd>—</dd></div>
            <div><dt>Acquired</dt><dd>—</dd></div>
            <div><dt>Accession record</dt><dd>None found <span class="stamp red sm">No record</span></dd></div>
            <div><dt>Location</dt><dd>RR4 / Case 3</dd></div>
          </dl>
          <p class="hand blue">Who catalogued this? I can't find anyone who remembers it arriving. E.V.</p>
          <span class="corner-mark" title="a small pencilled triangle">${T}</span>`,
      },
    },
    {
      id: 'c1-photo',
      type: 'photo',
      label: 'Exhibit 1-C',
      title: 'Photograph: display case 3',
      icon: 'photo',
      notes: ['Photograph of display case 3, 07:05, 14 Nov.'],
      data: {
        art: 'casePhoto',
        ratio: '4 / 3',
        caption: 'Display case 3, Reading Room 4. Photographed 07:05, 14 November.',
        prompt: 'Tap anything in the photograph to look closer.',
        border: 'RR4 · case 3 · 14.XI · 07:05',
        mark: mark(1, 'N', 'pmark-photo'),
        hotspots: [
          {
            id: 'outline', x: 42.5, y: 50.5, w: 15, h: 10,
            label: 'The velvet',
            text: 'The velvet floor of the case. A darker rectangle where something stood, about 11 by 7 centimetres. The edges are sharp, as if someone drew them with a ruler. The outline looks made, not left behind.',
            note: 'The outline on the velvet looks <b>made</b>, not left behind.',
          },
          {
            id: 'label', x: 44, y: 61, w: 12, h: 8,
            label: 'The brass label',
            text: 'The brass label: ITEM 0047. Underneath, engraved very small: ON LOAN. On loan from whom?',
            note: 'The label is engraved <b>ON LOAN</b>.',
          },
          {
            id: 'lock', x: 64, y: 64, w: 10, h: 9,
            label: 'The lock',
            text: 'The lock. Unforced. The brass around the keyhole is polished bright, the way it gets when a lock is opened often.',
          },
          {
            id: 'under', x: 25, y: 82, w: 13, h: 11,
            label: 'Under the cabinet',
            text: 'Something pale is wedged under the front foot of the cabinet. You work it free: a folded index card, handwritten.',
            note: 'A folded note was hidden under the cabinet.',
            reveal: 'c1-note',
            flag: 'noteFound',
          },
          {
            id: 'glass', x: 55, y: 25, w: 19, h: 23,
            label: 'The glass',
            text: 'A reflection in the glass. Someone is standing where you are standing now, looking in.',
          },
        ],
      },
    },
    {
      id: 'c1-note',
      type: 'note',
      label: 'Exhibit 1-D',
      title: "The curator's note",
      icon: 'note',
      requires: 'noteFound',
      notes: ['A note signed C.: <i>"Trust the beginnings, not the endings."</i>'],
      data: {
        // One line per row. Do not let these wrap: the acrostic (first letters)
        // and the telestich (last letters) are both read from these lines.
        lines: [
          "Please don't call it stolen, not just now.",
          'Reading rooms like this keep no alibi.',
          'Every empty case is keeping a secret.',
          'Some things are only kept by being given.',
          'Even dust can tell the time.',
          'Nothing here was taken. Look at what remains.',
          'Trust the beginnings, not the endings.',
        ],
        sign: 'C.',
        found: 'Found under display case 3',
      },
    },
  ],

  key: { question: 'The curator left you a word. What is it?', mask: '_______' },

  hints: [
    { text: 'Read everything, then look harder at the photograph. Tap anything that seems out of place.' },
    { text: "There's something under the front of the cabinet in the photograph. It's a note from the curator." },
    { text: 'The note tells you how to read it: <i>trust the beginnings</i>. Read the first letter of each line, from top to bottom.' },
  ],

  filed: 'The curator says the object is <i>present</i>. Not missing. Present.',
};
