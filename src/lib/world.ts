import { getCollection, type CollectionEntry } from 'astro:content';
import { CATEGORIES } from '../content.config';
import { extractTargets, normalize } from './wikilinks.mjs';

export type WorldEntry = CollectionEntry<'world'>;

/** Статьи для показа: черновики видны только в dev. */
export async function getWorldEntries(): Promise<WorldEntry[]> {
  const entries = await getCollection('world', (e) => import.meta.env.DEV || !e.data.draft);
  return entries.sort((a, b) => a.data.title.localeCompare(b.data.title, 'ru'));
}

/** Карта «нормализованное название или псевдоним -> статья». */
function buildLookup(entries: WorldEntry[]) {
  const lookup = new Map<string, WorldEntry>();
  for (const entry of entries) {
    for (const name of [entry.data.title, ...entry.data.aliases]) {
      lookup.set(normalize(name), entry);
    }
  }
  return lookup;
}

/** Какие статьи ссылаются на данную. */
export function getBacklinks(target: WorldEntry, entries: WorldEntry[]): WorldEntry[] {
  const lookup = buildLookup(entries);
  return entries.filter(
    (entry) =>
      entry.id !== target.id &&
      extractTargets(entry.body ?? '').some((t) => lookup.get(normalize(t))?.id === target.id),
  );
}

/** Названия, на которые ссылаются, но статей по ним ещё нет, и где на них ссылаются. */
export function getMissingArticles(entries: WorldEntry[]): { name: string; from: WorldEntry[] }[] {
  const lookup = buildLookup(entries);
  const missing = new Map<string, { name: string; from: WorldEntry[] }>();

  for (const entry of entries) {
    for (const name of extractTargets(entry.body ?? '')) {
      const key = normalize(name);
      if (lookup.has(key)) continue;
      const record = missing.get(key) ?? { name, from: [] };
      if (!record.from.includes(entry)) record.from.push(entry);
      missing.set(key, record);
    }
  }

  return [...missing.values()].sort((a, b) => b.from.length - a.from.length);
}

/** Статьи, сгруппированные по категориям в порядке из схемы. */
export function groupByCategory(entries: WorldEntry[]) {
  return CATEGORIES.map((category) => ({
    category,
    entries: entries.filter((e) => e.data.category === category),
  })).filter((group) => group.entries.length > 0);
}
