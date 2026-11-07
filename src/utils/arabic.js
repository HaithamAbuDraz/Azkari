/**
 * Comprehensive Arabic text normalization and search utilities.
 * Handles diacritics (tashkeel/harakat), tatweel (kashida),
 * Alef variations (أ, إ, آ, ٱ), Taa Marbuta (ة), and Alef Maksura (ى).
 */

// Regex covering all Arabic diacritical marks (Tashkeel, Tanwin, Sukun, Shadda, Quranic marks)
const ARABIC_DIACRITICS_REGEX = /[\u064B-\u065F\u0670\u0640\u06D6-\u06ED]/g;

/**
 * Normalizes an Arabic string for flexible, fuzzy searching:
 * 1. Strips all diacritics / harakat / tashkeel / tatweel.
 * 2. Unifies Alef variants: أ, إ, آ, ٱ -> ا
 * 3. Unifies Taa Marbuta: ة -> ه
 * 4. Unifies Alef Maksura: ى -> ي
 * 5. Lowercases (for mixed English/Arabic) and trims extra spaces.
 *
 * @param {string} text - Raw input string
 * @returns {string} Normalized string
 */
export function normalizeArabic(text) {
  if (!text || typeof text !== 'string') return '';

  return text
    .replace(ARABIC_DIACRITICS_REGEX, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .toLowerCase()
    .trim();
}

/**
 * Checks if targetText contains query, ignoring diacritics,
 * Alef variants, and minor letter differences.
 * Also supports multi-word token queries (e.g. "قل احد").
 *
 * @param {string} targetText - The text to search inside (e.g. zikr.arabic)
 * @param {string} query - The user search query
 * @returns {boolean} True if query matches targetText
 */
export function matchesArabicSearch(targetText, query) {
  if (!query || typeof query !== 'string') return true;
  if (!targetText || typeof targetText !== 'string') return false;

  const normTarget = normalizeArabic(targetText);
  const normQuery = normalizeArabic(query);

  if (!normQuery) return true;

  // Direct substring match
  if (normTarget.includes(normQuery)) return true;

  // Multi-word token matching (all words in query must exist in target)
  const tokens = normQuery.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    return tokens.every((token) => normTarget.includes(token));
  }

  return false;
}
