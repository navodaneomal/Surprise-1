// Small helpers shared by the case files. Everything here ends up as HTML
// strings inside the sealed vault, rendered by site/js/evidence.js.

/** The curator's diamond (◇), drawn in CSS so it renders on every device. */
export const D = '<i class="sym sym-d" role="img" aria-label="diamond"></i>';
/** Curator's triangle (△): "look again". */
export const T = '<i class="sym sym-t" role="img" aria-label="triangle"></i>';
/** Curator's circle (○): "listen". */
export const O = '<i class="sym sym-o" role="img" aria-label="circle"></i>';

/**
 * A faint pencil mark in a margin. Six of these, one per case, spell the key
 * to the Deep Archive. They are deliberately quiet: low contrast, small, but
 * still real buttons so keyboard and screen-reader users can find them.
 */
export function mark(n, letter, extraClass = '') {
  return `<button type="button" class="pmark ${extraClass}" data-mark="${n}" data-letter="${letter}" aria-label="A faint pencil mark">${letter.toLowerCase()}</button>`;
}
