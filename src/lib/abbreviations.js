import dictionary from './data/abbreviations.json';

/**
 * Word/phrase -> abbreviation lookup, sourced from the department's
 * standards spreadsheet (~6,000 entries, bundled as static JSON - far too
 * large for an admin CRUD screen, and it never changes at runtime).
 */

const normalize = (text) => text.trim().toLowerCase().replace(/\s+/g, ' ');

/** Splits one query into its individual words, on both underscores and whitespace. */
function tokenize(query) {
  return query
    .trim()
    .split(/[_\s]+/)
    .filter(Boolean);
}

/**
 * Resolves one word/phrase to its abbreviation.
 *
 * Tries the whole phrase against the dictionary first (covers multi-word
 * entries like "year to date" -> "YTD"), then falls back to resolving it
 * word by word and joining with "_". Any word that has no dictionary match
 * is kept exactly as typed, never dropped or replaced with a placeholder.
 *
 * @param {string} query
 * @returns {{ query: string, result: string, matched: boolean }}
 */
export function lookupAbbreviation(query) {
  const trimmed = query.trim();
  if (!trimmed) return { query: trimmed, result: '', matched: false };

  const wholePhrase = normalize(trimmed.replace(/_/g, ' '));
  if (dictionary[wholePhrase]) {
    return { query: trimmed, result: dictionary[wholePhrase], matched: true };
  }

  const tokens = tokenize(trimmed);
  let matchedAny = false;
  const resolved = tokens.map((token) => {
    const hit = dictionary[normalize(token)];
    if (hit) {
      matchedAny = true;
      return hit;
    }
    return token;
  });

  return { query: trimmed, result: resolved.join('_'), matched: matchedAny };
}

/**
 * Resolves a comma-separated list of words/phrases.
 * @param {string} input
 * @returns {{ query: string, result: string, matched: boolean }[]}
 */
export function lookupAbbreviations(input) {
  return input
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map(lookupAbbreviation);
}
