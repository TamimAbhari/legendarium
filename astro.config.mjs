// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { unified } from '@astrojs/markdown-remark';
import remarkWikilinks from './src/plugins/remark-wikilinks.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://legendarium.cc',
  trailingSlash: 'always',
  redirects: {
    '/wiki/': '/world/',
  },
  markdown: {
    // В Astro 7 по умолчанию Markdown обрабатывает Sätteri, а наш плагин для [[ссылок]]
    // написан для remark, поэтому явно выбираем remark-процессор.
    processor: unified({
      // Без «умных» кавычек: они ставят английские “ ” вместо русских « ».
      smartypants: false,
      remarkPlugins: [
        [remarkWikilinks, { contentDir: 'src/content/world', basePath: '/world/' }],
      ],
    }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
