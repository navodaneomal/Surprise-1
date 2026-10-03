// CASE 002 — THE PATTERN   (sealed with the answer to Case 001)
// Solution: six ◇ slips give exact minutes (dates washed out); six camera
// stills give the date of each visit and show the time on the wall clock.
// Order the minutes by date: 12, 9, 19, 20, 5, 14 -> A1Z26 -> LISTEN.
// The same letters also spell SILENT/ENLIST/TINSEL/INLETS, so the order matters.
import { D, mark } from './_shared.js';

export default {
  id: 2,
  code: '002',
  title: 'The Pattern',
  teaser: 'Six nights. One visitor with no name.',

  transition: `
    <p><b>PRESENT.</b> Not missing. Present. Either the curator is lying, or everyone has been looking at the wrong thing.</p>
    <p>E. Varga went back to the slip box.</p>`,

  brief: `
    <p>Reading Room 4 asks every visitor to fill in a slip: name, date, time in, time out. For six nights before the box was reported missing, someone filled one in without a name.</p>
    <p>Camera 2 watches the room. Its timestamp has been broken for years and shows only the date. There is, however, a clock on the wall.</p>`,

  evidence: [
    {
      id: 'c2-slips',
      type: 'slips',
      label: 'Exhibit 2-A',
      title: `Visitor slips signed ${D}`,
      icon: 'slip',
      notes: [`Six ${D} slips from 8–13 Nov. Times in: 21:05, 21:09, 21:12, 21:14, 21:19, 21:20. The dates are illegible.`],
      data: {
        memo: `Six slips, all ${D}, all from the slip box for 8–13 November. Rain got into the box and the dates have washed out. Only the minutes change. Why would anyone care about the minutes? <span class="memo-sig">E.V.</span>`,
        prompt: 'Tap a slip to turn it over.',
        // Display order is shuffled on purpose. `id` encodes the real date.
        slips: [
          { id: 's11', time: '21:20' },
          { id: 's12', time: '21:05' },
          { id: 's08', time: '21:12' },
          { id: 's13', time: '21:14' },
          { id: 's09', time: '21:09', back: mark(2, 'O') },
          { id: 's10', time: '21:19' },
        ],
      },
    },
    {
      id: 'c2-stills',
      type: 'stills',
      label: 'Exhibit 2-B',
      title: 'Camera 2 stills, 8–13 Nov',
      icon: 'camera',
      notes: [
        'Camera 2 saves one frame a night, when the door first opens after 21:00. The wall clock shows the time.',
        'Nobody appears in any frame.',
      ],
      data: {
        intro: 'Camera 2 saves a single frame each night, the first time the door opens after 21:00. The timestamp only shows the date. Tap the wall clock to read it.',
        // h:m is what the wall clock shows. The other flags draw what is (and
        // isn't) in display case 3 that night: Case 003 confirms each change.
        frames: [
          { day: 8,  h: 9, m: 12, label: false, card: false, outline: false, raised: false },
          { day: 9,  h: 9, m: 9,  label: true,  card: false, outline: false, raised: false },
          { day: 10, h: 9, m: 19, label: true,  card: true,  outline: false, raised: false },
          { day: 11, h: 9, m: 20, label: true,  card: true,  outline: true,  raised: false },
          { day: 12, h: 9, m: 5,  label: true,  card: true,  outline: true,  raised: true },
          { day: 13, h: 9, m: 14, label: true,  card: true,  outline: true,  raised: true },
        ],
        footnote: 'Nobody appears in any frame. The reading-room chair is pulled out every night.',
      },
    },
  ],

  key: { question: `What does ${D} want you to do?`, mask: '______' },

  hints: [
    { text: `All six slips are signed ${D}. Compare them. What changes from slip to slip, and what stays the same?` },
    { text: 'Only the minutes change, and every one of them is between 1 and 26. The camera stills tell you which night each time belongs to.' },
    { text: 'Read the wall clock in each still in date order, 8 to 13 November. Then turn each minute into a letter: 1 = A, 2 = B, 3 = C, and so on.' },
  ],

  filed: 'Every night at ten past nine, the same nameless visitor spelled out an instruction, one minute at a time.',
};
