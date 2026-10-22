// Превращает [[Цель | подпись]] в обычную ссылку на /world/<slug>/.
// ![[фото.jpg]] превращается в картинку из src/assets/world/.
// Если статьи с таким названием или псевдонимом нет, рисует «красную ссылку»:
// это <span> с пунктирным подчёркиванием, а не битая ссылка.

import path from 'node:path';
import { buildIndex, normalize, parseWikilink, WIKILINK_RE } from '../lib/wikilinks.mjs';

/**
 * @param {{ contentDir?: string, basePath?: string }} options
 */
export default function remarkWikilinks(options = {}) {
  const contentDir = path.resolve(options.contentDir ?? 'src/content/world');
  const basePath = options.basePath ?? '/world/';
  // Куда класть картинки: путь от файла статьи до src/assets/world/
  const imageBase = options.imageBase ?? '../../assets/world/';

  return (tree) => {
    const index = buildIndex(contentDir);
    walk(tree);

    function walk(node) {
      if (!node.children) return;
      // Внутри кода и уже существующих ссылок ничего не трогаем.
      if (node.type === 'link' || node.type === 'linkReference') return;

      const next = [];
      for (const child of node.children) {
        if (child.type === 'text' && child.value.includes('[[')) {
          next.push(...splitText(child.value));
        } else {
          walk(child);
          next.push(child);
        }
      }
      node.children = next;
    }

    function splitText(value) {
      const parts = [];
      let last = 0;

      for (const match of value.matchAll(WIKILINK_RE)) {
        const [full, bang, inner] = match;
        if (match.index > last) parts.push({ type: 'text', value: value.slice(last, match.index) });
        last = match.index + full.length;

        // ![[картинка.jpeg]] — встраивания Obsidian на сайте не поддерживаются, пропускаем.
        if (bang === '!') {
          const img = parseWikilink(inner);
          if (/\.(jpe?g|png|webp|gif|avif)$/i.test(img.target)) {
            parts.push({ type: 'image', url: `${imageBase}${img.target}`, alt: img.label === img.target ? '' : img.label });
          }
          continue;
        }

        const { target, label } = parseWikilink(inner);
        const hit = index.get(normalize(target));
        const text = { type: 'text', value: label };

        if (hit) {
          parts.push({
            type: 'link',
            url: `${basePath}${hit.slug}/`,
            children: [text],
            data: { hProperties: { className: ['wikilink'] } },
          });
        } else {
          parts.push({
            type: 'emphasis',
            children: [text],
            data: {
              hName: 'span',
              hProperties: {
                className: ['redlink'],
                title: 'Статья ещё не написана',
              },
            },
          });
        }
      }

      if (last < value.length) parts.push({ type: 'text', value: value.slice(last) });
      return parts;
    }
  };
}
