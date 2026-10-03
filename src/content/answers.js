// ─────────────────────────────────────────────────────────────────────────────
//  ANSWER KEY  (SPOILERS)
//  `key` is the canonical answer for each case. It is the decryption key for
//  the next case's sealed content. `alts` are other phrasings that are also
//  accepted. `near` are close-but-wrong guesses that get a helpful nudge.
//  Answers are compared after normalising: uppercase, A–Z and 0–9 only, so
//  "look under", "LOOK-UNDER" and "Look Under!" are all the same.
//  tools/verify.mjs proves every key can be derived from the evidence.
// ─────────────────────────────────────────────────────────────────────────────
export default {
  c1: {
    key: 'PRESENT',
    alts: [],
    near: {
      WITNESS: 'That word is in there too, but not yet. Trust the beginnings.',
      STOLEN: 'That’s what everyone assumes. The curator disagrees.',
      MISSING: 'That’s what everyone assumes. The curator disagrees.',
      ONLOAN: 'The label says so. The curator left you a different word.',
    },
  },
  c2: {
    key: 'LISTEN',
    alts: [],
    near: {
      SILENT: 'The right letters in the wrong order. Put the nights in sequence, 8 to 13 November.',
      ENLIST: 'The right letters in the wrong order. Put the nights in sequence, 8 to 13 November.',
      TINSEL: 'The right letters in the wrong order. Put the nights in sequence, 8 to 13 November.',
      INLETS: 'The right letters in the wrong order. Put the nights in sequence, 8 to 13 November.',
      '1291920514': 'Those are the right numbers, in the right order. Now turn each one into a letter.',
    },
  },
  c3: {
    key: 'LOOK UNDER',
    alts: ['LOOK UNDER THE VELVET', 'LOOK UNDERNEATH'],
    near: {
      UNDER: 'That’s the second word. There is one before it.',
      LOOK: 'That’s the first word. Keep listening.',
    },
  },
  c4: {
    key: 'INDEX',
    alts: ['THE INDEX', 'CARD INDEX', 'THE CARD INDEX'],
    near: {
      ONEQUIETTHING: 'That’s what was deposited. The question is where it was filed.',
      MRHIB: 'That’s still in cipher. Use the wheel.',
      '5693': 'That opens the box. The key is on the slip inside it.',
    },
  },
  c5: {
    key: 'WITNESS',
    alts: ['THE WITNESS', 'A WITNESS', 'PRESENT WITNESS'],
    near: {
      PRESENT: 'That’s the edge you’ve already read. Try the other one.',
      LAMP: 'The lamp is how you read it, not what it says.',
    },
  },
  // The Deep Archive door: the six margin marks, one per case, in case order.
  deep: {
    key: 'NOTICE',
    alts: [],
    near: {
      NOTICED: 'Close. Six letters, one from each case.',
      NOTICES: 'Close. Six letters, one from each case.',
    },
  },
  // The lockbox in Case 004.
  lock: '5693',
};
