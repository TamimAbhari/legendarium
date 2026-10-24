// Общие функции для wikilinks в стиле Obsidian: [[Цель]], [[Цель | подпись]].
// Используются и remark-плагином (при сборке Markdown), и страницами
// (обратные ссылки, список ненаписанных статей).

import fs from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';

/** Приводит название к виду для сравнения: без регистра, ё = е, лишние пробелы убраны. */
export function normalize(value) {
  return String(value)
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Находит все [[...]] в тексте. Встраивания ![[...]] (картинки Obsidian) пропускает. */
export const WIKILINK_RE = /(!?)\[\[([^\[\]\n]+?)\]\]/g;

/** Разбирает содержимое скобок: "Цель#раздел | подпись" -> { target, label }. */
export function parseWikilink(inner) {
  const [rawTarget, ...rest] = inner.split('|');
  const target = rawTarget.split('#')[0].trim();
  const label = rest.length ? rest.join('|').trim() : rawTarget.trim();
  return { target, label: label || target };
}

/** Все цели ссылок, найденные в сыром Markdown. */
export function extractTargets(markdown) {
  const targets = [];
  for (const match of markdown.matchAll(WIKILINK_RE)) {
    if (match[1] === '!') continue;
    const { target } = parseWikilink(match[2]);
    if (target) targets.push(target);
  }
  return targets;
}

let cache = { dir: '', at: 0, index: null };

/**
 * Читает все статьи в папке и строит индекс: нормализованное название или
 * псевдоним -> { slug, title }. Результат кэшируется на пару секунд,
 * чтобы dev-сервер подхватывал новые файлы без перезапуска.
 */
export function buildIndex(dir) {
  const now = Date.now();
  if (cache.index && cache.dir === dir && now - cache.at < 2000) return cache.index;

  const index = new Map();
  if (fs.existsSync(dir)) {
    for (const file of fs.readdirSync(dir)) {
      if (!/\.mdx?$/.test(file)) continue;
      const slug = file.replace(/\.mdx?$/, '').toLowerCase();
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      let data = {};
      if (match) {
        try {
          data = parseYaml(match[1]) ?? {};
        } catch {
          data = {};
        }
      }
      const title = typeof data.title === 'string' && data.title ? data.title : slug;
      const names = [title, ...(Array.isArray(data.aliases) ? data.aliases : [])];
      for (const name of names) {
        if (typeof name === 'string') index.set(normalize(name), { slug, title });
      }
    }
  }

  cache = { dir, at: now, index };
  return index;
}
