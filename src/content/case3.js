// CASE 003 — THE WITNESS   (sealed with the answer to Case 002)
// Solution: the custodian's tape contains a recording of a hum in short and
// long pulses: Morse for LOOK UNDER. The handbook page supplies the alphabet,
// the waveform shows the pulses visually, and a text toggle shows dots/dashes.
// The testimony contradicts Case 001: the case was always empty.
import { D, O, mark } from './_shared.js';

export default {
  id: 3,
  code: '003',
  title: 'The Witness',
  teaser: 'The night custodian remembers it differently.',

  transition: `
    <p><b>LISTEN.</b> So Varga did. That afternoon they sat down with the one person who is in Reading Room 4 every night.</p>`,

  brief: `
    <p>Tomas Reyl has been the archive's night custodian for eleven years. He dusts Reading Room 4 every night at ten past nine.</p>
    <p>His interview was recorded at 15:30 on 14 November. It does not agree with the incident report.</p>`,

  evidence: [
    {
      id: 'c3-tape',
      type: 'tape',
      label: 'Exhibit 3-A',
      title: 'Interview tape: T. Reyl',
      icon: 'tape',
      notes: [
        'Reyl says case 3 has been <b>empty for eleven years</b>. He never saw a music box.',
        'Reyl: the label turned up on <b>the ninth</b>. The mark on the velvet on the eleventh.',
        'Every night around 21:10, a hum from inside the case: short and long.',
      ],
      data: {
        title: 'Interview: T. Reyl, night custodian',
        when: '14 November · 15:30',
        by: 'Interviewer: E. Varga',
        jcard: `<span class="jc-title">REYL · 14.XI</span><span class="jc-sub">interview · side A</span><span class="jc-sym" title="a small pencilled circle">${O}</span>${mark(3, 'T', 'pmark-jcard')}`,
        // t = seconds into the tape. The Morse segment's length is computed
        // from the code, so leave a gap after it (it runs about 12.5 s).
        lines: [
          { t: 0, who: 'VARGA', text: "For the record: you're the night custodian for Reading Room 4." },
          { t: 4, who: 'REYL', text: 'Eleven years. Nine at night till six in the morning.' },
          { t: 9, who: 'VARGA', text: 'The music box in case three. When did you last see it?' },
          { t: 13, who: 'REYL', text: "I didn't. I've never seen it." },
          { t: 16, who: 'VARGA', text: 'It was reported missing this morning, Tomas.' },
          { t: 19, who: 'REYL', text: "I dust that case every night. It's been empty for eleven years." },
          { t: 24, who: 'VARGA', text: "There's a label in it. Item 0047." },
          { t: 27, who: 'REYL', text: "The label turned up on the ninth. I thought you'd put it there." },
          { t: 31, who: 'VARGA', text: "I didn't." },
          { t: 33, who: 'REYL', text: 'Then on the eleventh there was a mark on the velvet. Like something had been standing there. Nothing had. I dusted around it.' },
          { t: 41, who: 'VARGA', text: 'Someone signed in every night that week. No name. Just a diamond.' },
          { t: 46, who: 'REYL', text: 'I never saw anyone. But every night, around ten past nine, I heard it.' },
          { t: 51, who: 'VARGA', text: 'Heard what?' },
          { t: 53, who: 'REYL', text: "A hum. From inside the case. Short and long, short and long. Very quiet. You'd miss it if you weren't listening." },
          { t: 61, who: 'VARGA', text: 'Could it be the lamp in the case?' },
          { t: 64, who: 'REYL', text: "The lamp's been off for years. On the twelfth I left this recorder running in the room. Wind it on a bit. There. Listen." },
          { t: 71, who: 'TAPE', text: 'Recording, Reading Room 4, 12 November, 21:05. A soft hum in short and long pulses.', morse: true },
          { t: 86, who: 'REYL', text: 'Every night the same. And every morning, nothing taken. Something…' },
          { t: 91, who: 'VARGA', text: 'Something what?' },
          { t: 93, who: 'REYL', text: 'Something left.' },
          { t: 97, who: 'TAPE', text: 'End of tape.' },
        ],
        morse: 'LOOK UNDER',
      },
    },
    {
      id: 'c3-log',
      type: 'doc',
      label: 'Exhibit 3-B',
      title: "Reyl's night duty log",
      icon: 'log',
      notes: ["Reyl's log: case 3 was <b>empty every night</b>, 8–13 Nov. New label on the 9th."],
      data: {
        paper: 'log',
        html: `
          <div class="doc-head"><span>Night duty log · T. Reyl</span><span>November</span></div>
          <table class="log">
            <thead><tr><th scope="col">Date</th><th scope="col">Time</th><th scope="col">Round</th></tr></thead>
            <tbody>
              <tr><td>8 Nov</td><td>21:10</td><td>RR4 dusted, cases 1–4. Case 3 empty. <span class="hand">Humming near the cases. Pipes?</span></td></tr>
              <tr><td>9 Nov</td><td>21:10</td><td>RR4 dusted. Case 3 empty. <span class="hand">New label in case 3, "0047". Ask E.V.</span></td></tr>
              <tr><td>10 Nov</td><td>21:10</td><td>RR4 dusted. Case 3 empty. <span class="hand">Humming again.</span></td></tr>
              <tr><td>11 Nov</td><td>21:10</td><td>RR4 dusted. Case 3 empty. <span class="hand">Mark on the velvet. Dusted around it.</span></td></tr>
              <tr><td>12 Nov</td><td>21:10</td><td>RR4 dusted. Case 3 empty. <span class="hand">Left the recorder running.</span></td></tr>
              <tr><td>13 Nov</td><td>21:10</td><td>RR4 dusted. Case 3 empty. <span class="hand">Humming. Same as always.</span></td></tr>
            </tbody>
          </table>`,
      },
    },
    {
      id: 'c3-handbook',
      type: 'morsechart',
      label: 'Exhibit 3-C',
      title: "Custodian's handbook, p. 14",
      icon: 'book',
      notes: [],
      data: {
        heading: 'Section 6 · Signals',
        intro: 'If the telephones fail, the basement bell circuit can be used to signal the front desk in Morse code. A dot is short. A dash is long, about three dots. Leave a short pause between letters and a longer pause between words.',
      },
    },
  ],

  key: { question: 'What was the hum saying?', mask: '____ _____' },

  hints: [
    { text: "Play the tape all the way through. Reyl recorded the hum himself. If you can't play sound, open the transcript and use the waveform." },
    { text: "The hum comes in short and long pulses. It's Morse code. The custodian's handbook page has the alphabet." },
    { text: 'Short is a dot and long is a dash. Short gaps separate letters; one longer gap separates two words. Use “Show pulses as text” under the waveform if listening is hard.' },
  ],

  filed: `Nothing was ever taken from case 3. Things were being left in it, one a night, by ${D}.`,
};
