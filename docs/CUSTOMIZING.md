# Customizing Case File 001

Everything the player reads lives in plain, editable files under
[`src/content/`](../src/content). The build step seals that content into
`site/js/vault.js`. **After any edit, rebuild:**

```bash
npm run build      # re-seal the content into site/js/vault.js (+ dist/case-file-001.html)
npm run verify     # prove every puzzle is still solvable
```

You need [Node.js](https://nodejs.org) 18 or newer. There are no other
dependencies.

---

## 1. The personal touch (safe, recommended)

Open [`src/content/config.js`](../src/content/config.js):

```js
export default {
  dedication: '',                                   // e.g. 'For M. Happy birthday.'
  finalMessage: 'You were the thing worth noticing.', // the one final, subtle message
  signature: 'C.',                                  // how the curator signs
};
```

- These appear **only in the Deep Archive** (the secret final layer), which stays
  sealed until she finds all six margin marks. Nobody can read them in the page
  source.
- None of them affect any puzzle. Change them freely.
- `finalMessage` is printed very faintly at the bottom of the curator's notes and
  glows under the ultraviolet lamp. Keep it short; one sentence lands best.

Then run `npm run build` and redeploy the `site/` folder.

---

## 2. Changing text that isn't a puzzle

The story, documents, hints and transitions are in `case1.js` … `case6.js` and
`deep.js`. Edit the prose freely. The verifier (`npm run verify`) will flag it if
you accidentally break a clue. For example, it checks that the catalogue card
still says "five notes", because that is a lock digit.

Things to keep consistent if you rewrite:

| If you change… | …also change |
|---|---|
| "five notes" on the catalogue card | lock dial I in `answers.js` → `lock` |
| the number of ◇ nights | lock dial II, and the slips and stills |
| "the ninth" in the tape | lock dial III, the stills, Reyl's log |
| "display case 3" | lock dial IV, and every mention of case 3 |
| "Reading Room 4" | the Caesar shift (the ciphertext on the accession slip) |

---

## 3. Changing a puzzle answer (advanced)

Answers live in [`src/content/answers.js`](../src/content/answers.js). Each case
key is also the encryption key for the next case. That's handled automatically.
Change the answer **and** the evidence that produces it, then run `npm run build`
and `npm run verify`. The verifier derives each answer from the evidence itself
(acrostic, clock minutes, Morse, lock facts, Caesar shift, margin marks) and fails
loudly if anything no longer adds up.

Examples:

- **Case 001 (acrostic):** rewrite the seven lines of the curator's note in
  `case1.js` so the first letters spell the new word. The last letters currently
  spell `WITNESS` (the Case 005 answer), so keep both edges in mind.
- **Case 002 (clock minutes):** edit `frames` (`m` = minute, 1–26) and the matching
  slip times in `case2.js`.
- **Case 003 (Morse):** change `morse: 'LOOK UNDER'` in `case3.js`. The audio, the
  waveform and the text view all follow automatically.
- **Case 004 (cipher):** shift your new word forward by 4 (the room number) and put
  it in the accession slip's `class="cipher"` fields.
- **Deep Archive:** the six `mark(n, 'X')` calls, one in each case file, spell the
  door word.

`alts` lists other accepted phrasings. `near` lists close-but-wrong guesses that
get a friendly nudge.

---

## 4. How the sealing works (for the curious)

- Case 001 ships readable. Cases 002–006 and the Deep Archive are each encrypted
  with the previous case's answer (`site/js/seal.js`: a small keyed stream cipher,
  no dependencies). The "reveal the key" hints are sealed too.
- So **viewing the page source spoils nothing**. This is puzzle-grade obfuscation,
  not security; there's nothing sensitive to protect.
- Accepted alternatives and near-miss nudges are stored as one-way tags. They
  don't reveal the words that trigger them.
- `npm run build -- --check` (used in CI) fails if `vault.js` is out of date with
  `src/content`.

## 5. Testing your changes

```bash
npm run verify       # puzzle logic + vault (seconds, no browser)
npm run test:e2e     # full automated playthrough in headless Chromium
SHOTS=1 npm run test:e2e   # …and save screenshots to tests/screenshots/
```

`test:e2e` needs Playwright (`npm i -D playwright`, then `npx playwright install chromium`).
