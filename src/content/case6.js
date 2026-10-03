// CASE 006 — THE TRUTH   (sealed with the answer to Case 005)
// No key to find. The final report explains everything; the player winds the
// key from Case 004 in front of the empty case, then closes the file.
import { D, mark } from './_shared.js';

export default {
  id: 6,
  code: '006',
  title: 'The Truth',
  teaser: 'One document left. Dated today.',

  transition: `
    <p><b>WITNESS.</b> Read from both edges, the curator's first note had been saying it from the start: <i>present</i>, <i>witness</i>. A witness who was present.</p>
    <p>Not the archivist. Not the custodian. Someone else, who has been here the whole time.</p>`,

  brief: `<p>There is one document left in the file. It is unsigned, and it is dated today.</p>`,

  evidence: [
    {
      id: 'c6-report',
      type: 'doc',
      label: 'Exhibit 6-A',
      title: 'Final report, unsigned',
      icon: 'doc',
      notes: ['Final report: nothing was taken from case 3. Things were left in it, one a night, for whoever would follow them.'],
      data: {
        paper: 'typed',
        html: `
          <div class="doc-head"><span>The Wrenfield Archive</span><span>Ref. WA/001</span></div>
          <h3 class="doc-title">Final Report</h3>
          <dl class="kv">
            <div><dt>Date</dt><dd><span data-today>today</span></dd></div>
            <div><dt>Subject</dt><dd>Item 0047</dd></div>
            <div><dt>Investigator</dt><dd><span class="redact" data-closed="the one who noticed">████████████</span></dd></div>
          </dl>
          <h4>Findings</h4>
          <ol class="findings">
            <li>The Wrenfield Archive never held a music box. There is no donor, no accession, no photograph. There was a sound, a name, a note, a shape, a box under the velvet, and a question.</li>
            <li>Each was left in Reading Room 4, one each night from 8 to 13 November, by a visitor who signed with ${D}: the curator's mark for <i>deposited</i>.</li>
            <li>Nothing was taken from display case 3. Things were added to it.</li>
            <li>They were not left for the archivist, who saw an empty space and called it a loss. They were not left for the custodian, who heard the hum every night and was the only one who listened.</li>
            <li>They were left for whoever would follow them all the way here.</li>
            <li>Item 0047 is not a music box. It is not missing. It is in this room.</li>
          </ol>
          <h4>Conclusion</h4>
          <p class="conclusion">The object was never the point.</p>
          <div class="doc-foot"><span class="sig muted">unsigned</span>${mark(6, 'E', 'pmark-report')}</div>`,
      },
    },
    {
      id: 'c6-room',
      type: 'scene',
      label: 'Exhibit 6-B',
      title: 'Reading Room 4, 21:12',
      icon: 'room',
      notes: [],
      data: {
        intro: 'Reading Room 4. The room is dark except for the reading lamp. Display case 3 is empty, as it has always been. You still have the brass key.',
        needKey: 'You need the winding key from the lockbox in Case 004.',
        windLabel: 'Wind the key',
        afterWind: [
          'You hold the brass key over the empty velvet and turn it. There is nothing for it to fit. You turn it anyway.',
          'Five notes, from an empty case.',
          'There was never a box. There didn’t need to be.',
        ],
        reflection: 'In the glass: the lamp, the empty velvet, and you, looking in.',
        closeLabel: 'Close the case',
      },
    },
  ],

  hints: [
    { text: 'Read the final report, then open Reading Room 4. You still have the winding key from Case 004.' },
    { text: 'In Reading Room 4, wind the key. When the music stops, close the case.' },
  ],

  // The closing sequence. Strings are shown one at a time; numbers are pauses (ms).
  finale: [
    'The object was never the point.',
    1600,
    'You spent all this time looking for something hidden.',
    2600,
    'Maybe that was the point.',
    2400,
    'The things worth noticing are rarely the loudest things in the room.',
    2600,
  ],

  // Hints for the Deep Archive door (shown only after the case is closed).
  // doorReveal (the word itself) is injected by tools/build.mjs.
  doorHints: [
    'The margins. Each of the six cases has one faint pencil mark in it, quieter than everything around it. Tap a mark to copy it into your notebook.',
    '001: the photograph’s border. 002: the back of a slip. 003: the tape’s label. 004: inside the lockbox lid. 005: the back of a card in the last drawer. 006: the final report’s margin.',
    'Read the six letters in case order, 001 to 006.',
  ],

  closed: {
    title: 'Case closed',
    lines: [
      'Item 0047 was never missing, and it was never a music box.',
      'It was six small things, left one at a time, for whoever would notice them.',
      'You did.',
    ],
    whisper: 'Some things in this file were quieter than others.',
  },

  filed: 'The object was never the point.',
};
