import azkarData from '../data/azkar-data.json';

const LEGACY_KEY_PATTERN = /^([a-z]+)-(\d+)$/;
const categoryCache = new Map();

/**
 * Returns local calendar date key (YYYY-MM-DD) for timezone-safe daily persistence.
 */
export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns a memoized list of hydrated azkar items for a category key.
 */
export function getAzkarByCategory(tabKey) {
  if (!tabKey || !azkarData.categories?.[tabKey]) return [];

  if (categoryCache.has(tabKey)) {
    return categoryCache.get(tabKey);
  }

  const category = azkarData.categories[tabKey];
  const hydrated = category.items
    .map((ref) => {
      const base = azkarData.items?.[ref.id];
      if (!base) return null;

      return {
        id: ref.id,
        cardId: `${tabKey}:${ref.id}`,
        arabic: base.arabic,
        benefit: ref.benefit ?? base.benefit,
        count: ref.count ?? base.count,
        source: ref.source ?? base.source,
        tags: ref.tags ?? base.tags ?? [],
      };
    })
    .filter(Boolean);

  categoryCache.set(tabKey, hydrated);
  return hydrated;
}

/**
 * Extracts the category key from either v2 ("tabKey:itemId") or legacy ("tabKey-0") card IDs.
 */
export function getCategoryTabFromCardId(cardId) {
  if (typeof cardId !== 'string') return '';
  if (cardId.includes(':')) return cardId.split(':')[0];
  return cardId.split('-')[0];
}

/**
 * Resolves a legacy index-based card ID ("morning-0") to its canonical v2 ID ("morning:ayat-al-kursi").
 */
export function resolveCardId(cardId) {
  if (typeof cardId !== 'string') return '';
  if (cardId.includes(':')) return cardId;

  const match = cardId.match(LEGACY_KEY_PATTERN);
  if (!match) return cardId;

  const [, tabKey, indexStr] = match;
  const list = getAzkarByCategory(tabKey);
  const item = list[Number(indexStr)];
  return item ? item.cardId : cardId;
}

/**
 * Migrates stored counter keys from legacy index format to stable v2 card IDs.
 */
export function migrateStoredCounters(rawCounters) {
  if (!rawCounters || typeof rawCounters !== 'object') return {};

  const migrated = {};
  for (const [key, value] of Object.entries(rawCounters)) {
    const resolvedKey = resolveCardId(key);
    // Preserve explicit v2 entries if both legacy and v2 keys exist
    if (key.includes(':') || !(resolvedKey in migrated)) {
      migrated[resolvedKey] = value;
    }
  }
  return migrated;
}

/**
 * Migrates stored favorite card IDs from legacy index format to stable v2 card IDs.
 */
export function migrateStoredFavorites(rawFavorites) {
  if (!Array.isArray(rawFavorites)) return [];
  const uniqueIds = new Set();
  for (const id of rawFavorites) {
    const resolved = resolveCardId(id);
    if (resolved) uniqueIds.add(resolved);
  }
  return [...uniqueIds];
}
