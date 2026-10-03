// CASE 005 — THE ARCHIVE   (sealed with the answer to Case 004)
// Solution: find card 0047 in the index (drawer 0041–0048) and turn it over.
// It gives you an ultraviolet lamp. Earlier documents now show hidden ink.
// Under the lamp, the LAST letters of the curator's note (Case 001) glow:
// W-I-T-N-E-S-S. The note always said "present witness".
//
// `uv` holds every hidden annotation for earlier evidence. It lives here, in
// this sealed blob, so nobody can read it before they reach the archive.
import { D, T, O, mark } from './_shared.js';

const card = (no, title, back) => ({ no, title, back });

export default {
  id: 5,
  code: '005',
  title: 'The Archive',
  teaser: 'Every object has a card. Almost every object.',

  transition: `
    <p><b>INDEX.</b> The Wrenfield card index fills one wall of the basement: six oak drawers, holding a card for every object the archive has ever kept.</p>`,

  brief: `
    <p>Buttons. Feathers. Tickets nobody used. The Wrenfield keeps the small things nobody else thought worth keeping, and every one of them has a card.</p>
    <p>If Item 0047 was ever really here, it has a card too. If it wasn't, someone has gone to a lot of trouble.</p>`,

  evidence: [
    {
      id: 'c5-index',
      type: 'cabinet',
      label: 'Exhibit 5-A',
      title: 'The card index',
      icon: 'drawer',
      notes: ['The card index is arranged by catalogue number, eight numbers to a drawer.'],
      data: {
        intro: 'Six drawers, labelled by catalogue number. Open a drawer, then tap a card to turn it over.',
        drawers: [
          { label: '0001–0008', cards: [
            card('0003', 'Key, iron. Fits no lock in the building.', 'Kept in case the lock turns up. Condition: good.'),
            card('0006', 'Letter, sealed, unsent. Addressed “To whoever finds this.”', 'Never opened, by policy. Condition: good.'),
          ] },
          { label: '0009–0016', cards: [
            card('0011', 'Pebble, grey, smooth. Label: “from the beach where we decided.”', 'Beach unknown. Condition: unchanged.'),
            card('0014', 'Thimble, silver, dented on one side.', 'Donor: a tailor, retired. Condition: fair.'),
          ] },
          { label: '0017–0024', cards: [
            card('0018', 'Cinema ticket, unused. Seat F12.', 'The film was never identified. Condition: good.'),
            card('0023', 'Photograph of the back of someone’s head, at a window.', 'Donor’s note: “You’d know them anywhere.”'),
          ] },
          { label: '0025–0032', cards: [
            card('0026', 'Glove, left hand, grey wool.', 'The right one was never brought in. Condition: worn.'),
            card('0031', 'Recipe card, lemon cake. One ingredient rubbed out.', 'Staff have tried several guesses. None were right.'),
          ] },
          { label: '0033–0040', cards: [
            card('0035', 'Clover, pressed. Three leaves.', 'Donated as “the lucky one”. Condition: fragile.'),
            card('0039', 'Bookmark, left at page 212.', 'The archive does not hold the book. Condition: good.'),
          ] },
          { label: '0041–0048', cards: [
            card('0041', 'Button, horn, from a coat nobody recognised.', 'Condition: good.'),
            card('0042', 'Feather, wren. Found on the reading-room sill.', 'Condition: good. Handle gently.'),
            card('0043', 'Seed packet, sweet peas, unopened. “Plant when ready.”', 'Condition: dry.'),
            card('0044', 'Piano key, middle C, from an upright that was never found.', 'Condition: yellowed.'),
            card('0045', 'Matchbook with one match left.', 'Do not use. Condition: good.'),
            card('0046', 'Watch hands, no watch. Stopped at ten past nine.', 'Condition: stopped.'),
            { no: '0047', title: `Music box, walnut. <b>Status: see reverse.</b>`,
              back: `
                <p class="hand">Curator's marks</p>
                <ul class="legend">
                  <li>${D}<span>deposited · left in our keeping</span></li>
                  <li>${T}<span>look again</span></li>
                  <li>${O}<span>listen</span></li>
                </ul>
                <p>Issued to the investigator of WA/001: <b>one ultraviolet lamp</b>. Use it on everything you have already read.</p>
                <p class="clip">A small lamp is clipped to the card.</p>`,
              grant: { flag: 'lamp', reveal: 'c5-lamp', toast: 'You took the lamp. Documents you have already read now have a lamp switch.' },
              special: true },
            card('0048', 'Envelope, empty. Labelled “later”.', `Condition: waiting. ${mark(5, 'C', 'pmark-card')}`),
          ] },
        ],
      },
    },
    {
      id: 'c5-lamp',
      type: 'item',
      label: 'Exhibit 5-B',
      title: 'Ultraviolet lamp',
      icon: 'lamp',
      requires: 'lamp',
      notes: ['The UV lamp shows hidden ink on documents you have already read.'],
      data: {
        art: 'uvLamp',
        html: `
          <p>A pocket ultraviolet lamp, the kind shops use to check banknotes. Archivists use them to read faded ink. Some people use them to write it.</p>
          <p>Every document you have already read now has a <b>lamp</b> switch. Sweep the beam across the page, or flood the whole page with light.</p>
          <p class="small">Added to your inventory.</p>`,
      },
    },
  ],

  key: { question: 'The first note has two edges. What does the other edge say?', mask: '_______' },

  hints: [
    { text: 'Find Item 0047 in the card index. The drawers are labelled by catalogue number. Turn the card over.' },
    { text: 'The lamp shows ink that ordinary light doesn’t. Go back to earlier evidence with the lamp on, starting with the very first note in Case 001.' },
    { text: 'In Case 001 you read the first letter of each line of the curator’s note. Under the lamp, the last letter of each line glows.' },
  ],

  solveFlags: ['lamp'],

  filed: 'Read from both edges, the very first note said it all along: <i>present</i>, <i>witness</i>.',

  // Hidden ink, shown only under the lamp. Keys are evidence ids.
  uv: {
    'c1-report': {
      notes: [{ pos: 'top', html: 'They saw an empty space and called it a loss. Most people do. C.' }],
      over: { missing: 'present' },
      sr: 'Hidden ink: "They saw an empty space and called it a loss. Most people do." The words "recorded as missing" are crossed out and replaced with "recorded as present".',
    },
    'c1-card': {
      notes: [{ pos: 'bottom', html: 'Catalogued by me. Acquired by no one. C.' }],
      sr: 'Hidden ink: "Catalogued by me. Acquired by no one."',
    },
    'c1-photo': {
      overlay: 'deposited',
      notes: [{ pos: 'bottom', html: `${D} deposited, not removed.` }],
      sr: 'Under the lamp, a diamond glows on the velvet outline, with the word "deposited".',
    },
    'c1-note': {
      notes: [{ pos: 'bottom', html: 'I lied about the endings.' }],
      sr: 'Under the lamp, the last letter of every line glows: W, I, T, N, E, S, S. Hidden ink: "I lied about the endings."',
    },
    'c2-slips': {
      memo: 'Left, not taken. One thing a night.',
      slips: {
        s08: { date: '8 Nov', left: 'a sound' },
        s09: { date: '9 Nov', left: 'a name' },
        s10: { date: '10 Nov', left: 'a note' },
        s11: { date: '11 Nov', left: 'a shape' },
        s12: { date: '12 Nov', left: 'a box' },
        s13: { date: '13 Nov', left: 'a question' },
      },
      sr: 'Under the lamp the washed-out dates return, and each slip lists what was left that night: 8 Nov a sound, 9 Nov a name, 10 Nov a note, 11 Nov a shape, 12 Nov a box, 13 Nov a question.',
    },
    'c3-tape': {
      jcard: 'Thank you for listening, T.',
      sr: 'Hidden ink on the tape label: "Thank you for listening, T."',
    },
    'c3-log': {
      notes: [{ pos: 'bottom', html: 'He noticed, every night. Nobody asked him. C.' }],
      sr: 'Hidden ink: "He noticed, every night. Nobody asked him."',
    },
    'c4-slip': {
      notes: [{ pos: 'bottom', html: 'The missing piece was never in the box.' }],
      sr: 'Hidden ink: "The missing piece was never in the box."',
    },
    'c5-index': {
      cards: { '0047': 'The first note has two edges. You’ve only read one.' },
      sr: 'Hidden ink on card 0047: "The first note has two edges. You’ve only read one."',
    },
  },
};
