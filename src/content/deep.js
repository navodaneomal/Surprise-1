// SECRET DEEP ARCHIVE   (sealed with NOTICE, the six margin marks in order)
// Contains: bonus evidence, unused documents, a hidden visual, the curator's
// notes, and one final subtle message (from config.js).
import { D } from './_shared.js';
import config from './config.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export default {
  id: 'deep',
  title: 'Deep Archive',
  intro: `
    <p>Material withheld from Case File 001.</p>
    <p>You found six marks in the margins that nobody else saw. The curator kept these for whoever did.</p>`,

  sections: [
    { title: 'Recovered evidence', items: ['d-box', 'd-slip'] },
    { title: 'Unused documents', items: ['d-file000', 'd-questions', 'd-label'] },
    { title: 'Plate 7', items: ['d-plate'] },
    { title: "Curator's notes", items: ['d-notes'] },
  ],

  evidence: [
    {
      id: 'd-box',
      type: 'musicbox',
      label: 'Item 0047',
      title: 'The music box, as described',
      icon: 'box',
      data: {
        intro: 'The music box never existed, so the curator had one made for whoever got this far. Walnut, brass comb, eleven by seven centimetres. Five notes.',
        windLabel: 'Wind it',
        inside: 'Received: one investigator. Condition: excellent. No longer on loan.',
      },
    },
    {
      id: 'd-slip',
      type: 'doc',
      label: 'Slip 7',
      title: `A seventh slip signed ${D}`,
      icon: 'slip',
      data: {
        paper: 'slip',
        html: `
          <div class="slip-head"><span>Wrenfield Archive</span><span>Reading Room 4 · Visitor slip</span></div>
          <dl class="kv slip-kv">
            <div><dt>Name</dt><dd>${D}</dd></div>
            <div><dt>Date</dt><dd><span data-today>today</span></dd></div>
            <div><dt>In</dt><dd><span data-now>now</span></dd></div>
            <div><dt>Out</dt><dd>—</dd></div>
            <div><dt>Purpose</dt><dd class="hand">To see if you'd come.</dd></div>
          </dl>`,
      },
    },
    {
      id: 'd-file000',
      type: 'doc',
      label: 'Case File 000',
      title: 'Rejected draft',
      icon: 'doc',
      data: {
        paper: 'typed',
        html: `
          <div class="doc-head"><span>The Wrenfield Archive</span><span>Ref. WA/000 · DRAFT</span></div>
          <h3 class="doc-title">Incident Report</h3>
          <dl class="kv">
            <div><dt>Item</dt><dd>Oil painting, <i>Harbour at Dusk</i>, two metres wide</dd></div>
            <div><dt>Status</dt><dd>Stolen</dd></div>
          </dl>
          <p>At 06:40 the gallery was found open and the painting gone. Alarms sounded across three floors. The police were called. The newspapers were called. Everyone noticed.</p>
          <div class="doc-foot"><span class="stamp red">Rejected</span></div>
          <p class="hand">Too loud. Everyone notices when a painting goes missing. Start again with something small. C.</p>`,
      },
    },
    {
      id: 'd-questions',
      type: 'doc',
      label: 'Memo',
      title: 'Questions nobody asked',
      icon: 'note',
      data: {
        paper: 'memo',
        html: `
          <p class="eyebrow">E. Varga · questions for T. Reyl · not asked</p>
          <ol class="plain">
            <li>Why dust a case that has been empty for eleven years?</li>
            <li>When the hum stopped, did you ever wait to see if it would start again?</li>
            <li>Who taught you to listen like that?</li>
          </ol>
          <p class="hand">Some questions are better left for whoever is still listening. C.</p>`,
      },
    },
    {
      id: 'd-label',
      type: 'doc',
      label: 'Draft',
      title: 'Draft label, rejected',
      icon: 'card',
      data: {
        paper: 'card',
        html: `
          <div class="card-head"><span>Display label · draft</span><span class="no">0047</span></div>
          <p class="label-draft"><s>ITEM 0047 · FOR THE ONE WHO NOTICES</s></p>
          <p class="hand">Too obvious. They would stop looking. Engrave ON LOAN instead. C.</p>`,
      },
    },
    {
      id: 'd-plate',
      type: 'plate',
      label: 'Plate 7',
      title: 'Reading Room 4, long exposure',
      icon: 'photo',
      data: {
        intro: 'A photographic plate, found in the curator’s desk. The sleeve reads: Reading Room 4, 13 November, shutter open 21:14 to 06:40. It has never been developed.',
        develop: 'Develop the plate',
        caption: 'An exposure of more than nine hours. Anything that stays still fades into the dark; only moving light stays on the plate. Someone carried a small lamp slowly around the empty case and drew a wren in the air.',
      },
    },
    {
      id: 'd-notes',
      type: 'doc',
      label: 'Notes',
      title: "Curator's notes",
      icon: 'book',
      data: {
        paper: 'page',
        html: `
          <p class="eyebrow">Notes on Case File 001</p>
          <p>Every case needs an object. People expect one, so I gave them a music box. Nobody can resist a music box, and no sound is quieter than one that isn't there.</p>
          <p>I left something every night for six nights: a sound, a name, a note, a shape, a box, and a question. Each one was small enough to walk past. Most people did.</p>
          <p>E. Varga saw an empty space and called it a loss. That's the usual mistake. When something is quiet, we assume it's missing.</p>
          <p>Tomas Reyl heard the hum every night for a week and wrote it down. He was the only one who listened, so the tape was his.</p>
          <p>The card index, the lamp, and the two edges of the first note were for whoever came after: someone patient enough to read a thing twice.</p>
          <p>You were never really looking for a music box. You were following the quiet things, one at a time, to see where they led. They led here.</p>
          ${config.dedication ? `<p class="dedication">${esc(config.dedication)}</p>` : ''}
          <p class="sig">${esc(config.signature)}</p>
          <p class="whisper" data-final>P.S. ${esc(config.finalMessage)}</p>`,
      },
    },
  ],

  // Shown under the lamp in the Deep Archive.
  uv: {
    'd-notes': {
      notes: [],
      sr: `The faint line at the bottom reads: "P.S. ${config.finalMessage}"`,
    },
  },

  hints: [],
};
