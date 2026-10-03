// CASE 004 — THE MISSING PIECE   (sealed with the answer to Case 003)
// Solution, part 1: the lockbox tags each point at earlier evidence.
//   note    -> "How many?"                 five notes (catalogue card, 001)   5
//   diamond -> "How many nights?"          six ◇ visits (slips/stills, 002)   6
//   label   -> "Which night did I appear?" the ninth (custodian, 003)         9
//   case    -> "Which case?"               display case 3 (report, 001)       3
// Solution, part 2: the accession slip is a Caesar cipher. "Set the wheel to
// the room" = Reading Room 4. SRI UYMIX XLMRK -> ONE QUIET THING,
// MRHIB -> INDEX.
import { D, mark } from './_shared.js';

export default {
  id: 4,
  code: '004',
  title: 'The Missing Piece',
  teaser: 'A locked box, four tags, and a record nobody could find.',

  transition: `
    <p><b>LOOK UNDER.</b> Varga unlocked case 3 and lifted the velvet. It came away too easily, as if it had been lifted many times before.</p>`,

  brief: `
    <p>Under the velvet lining of display case 3 lay a flat steel box, no bigger than a paperback, tagged with the same number as the music box: <b>0047</b>.</p>
    <p>It has four brass dials and four paper tags tied to its handle. Everyone has been looking for the object that went missing. Nobody looked for what was missing from the record.</p>`,

  evidence: [
    {
      id: 'c4-box',
      type: 'lockbox',
      label: 'Exhibit 4-A',
      title: 'Steel lockbox, tagged 0047',
      icon: 'box',
      notes: ['A steel lockbox with four dials, found under the velvet in case 3.'],
      data: {
        intro: 'Four brass dials, each from 0 to 9. A paper tag is tied to each one.',
        tags: [
          { icon: 'note', text: 'How many?' },
          { icon: 'diamond', text: 'How many nights?' },
          { icon: 'label', text: 'Which night did I appear?' },
          { icon: 'case', text: 'Which case?' },
        ],
        // lockTag is injected by tools/build.mjs from src/content/answers.js
        wrong: ['The handle won’t turn.', 'Nothing. The dials sit tight.', 'A dull click, and nothing more.'],
        opened: 'The dials click into place and the lid lifts. Inside: a slip of paper torn from a ledger, a small brass key, and a card wheel printed with two alphabets.',
        lid: `<span class="lid-text">Property of the Wrenfield Archive</span>${mark(4, 'I', 'pmark-lid')}`,
        reveals: ['c4-slip', 'c4-wheel', 'c4-key'],
        flags: ['boxOpen', 'hasKey'],
        openNote: 'The lockbox held the <b>missing accession slip</b>, a winding key and a cipher wheel.',
      },
    },
    {
      id: 'c4-slip',
      type: 'doc',
      label: 'Exhibit 4-B',
      title: 'Accession slip, torn from the register',
      icon: 'slip',
      requires: 'boxOpen',
      notes: ['The accession slip is in cipher. <i>"Set the wheel to the room."</i>'],
      data: {
        paper: 'ledger',
        html: `
          <div class="doc-head"><span>The Wrenfield Archive · Accession register</span><span>p. 112</span></div>
          <dl class="kv">
            <div><dt>Item</dt><dd>0047</dd></div>
            <div><dt>Received</dt><dd>8–13 November, in parts</dd></div>
            <div><dt>Depositor</dt><dd>${D}</dd></div>
            <div><dt>Contents</dt><dd class="cipher">SRI UYMIX XLMRK</dd></div>
            <div><dt>Filed under</dt><dd class="cipher">MRHIB</dd></div>
          </dl>
          <div class="doc-foot"><span class="stamp blue">Cipher · set the wheel to the room</span></div>
          <p class="small">Find each letter on the inner ring. Read the letter on the outer ring.</p>`,
      },
    },
    {
      id: 'c4-wheel',
      type: 'wheel',
      label: 'Exhibit 4-C',
      title: 'Cipher wheel',
      icon: 'wheel',
      requires: 'boxOpen',
      notes: [],
      data: {
        intro: 'Two card discs pinned at the centre. The outer ring is fixed; turn the inner ring with the buttons. The window at the top shows the setting.',
      },
    },
    {
      id: 'c4-key',
      type: 'item',
      label: 'Exhibit 4-D',
      title: 'Brass winding key',
      icon: 'key',
      requires: 'boxOpen',
      notes: ['A winding key: <i>"For the box that isn’t here. Keep it."</i>'],
      data: {
        art: 'windKey',
        html: `
          <p>A small brass winding key, the kind that fits a music box. A paper tag is tied to it with thread.</p>
          <p class="hand">For the box that isn't here. Keep it. You'll know when.</p>
          <p class="small">Added to your inventory.</p>`,
      },
    },
  ],

  key: { question: 'Where was Item 0047 filed?', mask: '_____' },

  hints: [
    { when: '!boxOpen', text: 'Each tag on the box points to something you have already seen in an earlier case. Your notebook keeps track of what you found.' },
    { when: '!boxOpen', text: 'The note: the catalogue card (Case 001). The diamond: the visitor slips (Case 002). The label: the custodian (Case 003). The case: the incident report (Case 001).' },
    { when: '!boxOpen', text: 'Five notes. Six nights. The label appeared on the 9th. Display case 3. Set the dials to 5 · 6 · 9 · 3.' },
    { when: 'boxOpen', text: 'The slip says to set the wheel to the room. Which room has all of this happened in?' },
    { when: 'boxOpen', text: 'Reading Room 4. Set the wheel to 4, find each cipher letter on the inner ring, and read the letter on the outer ring.' },
    { when: 'boxOpen', text: 'At setting 4, M becomes I, R becomes N, H becomes D, I becomes E and B becomes X. The first line reads ONE QUIET THING.' },
  ],

  // Solving this case also opens the box, so nobody can get stuck without the key.
  solveFlags: ['boxOpen', 'hasKey'],

  filed: `The missing record has been found. Item 0047 was received in parts, over six nights, from ${D}. Its contents: one quiet thing.`,
};
