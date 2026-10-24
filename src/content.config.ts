import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const CATEGORIES = [
  'Земли',
  'Народы',
  'Организации',
  'События',
  'Личности',
  'Магия',
  'Существа',
  'Понятия',
] as const;

// Базовый лор: объективные факты от автора. Диегетические тексты
// (рукописи хронистов) появятся в отдельной коллекции вместе с Библиотекой.
const world = defineCollection({
  loader: glob({ base: './src/content/world', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    // Фото в врезке справа: путь к файлу в src/assets/world/
    image: image().optional(),
    imageAlt: z.string().optional(),
    imageCaption: z.string().optional(),
    // Другие названия: по ним работают [[ссылки]], например [[Бледнолицые]] -> «Свободные».
    aliases: z.array(z.string()).default([]),
    category: z.enum(CATEGORIES),
    // Одно-два предложения: попадают в списки и в описание страницы для поисковиков.
    summary: z.string(),
    // Строки врезки справа: { 'Основан': 'год 1', 'Столица': 'Таль-Менес' }
    facts: z.record(z.string(), z.string()).default({}),
    tags: z.array(z.string()).default([]),
    // Черновики видны только при `npm run dev`.
    draft: z.boolean().default(false),
    // Фракции показываются карточками на главной в порядке `order`.
    faction: z.boolean().default(false),
    order: z.number().default(100),
  }),
});

export const SHELVES = ['prose', 'poetry', 'chronicles', 'bestiary'] as const;

// Библиотека: тексты, которые читают. Каждая книга имеет свою страницу.
const library = defineCollection({
  loader: glob({ base: './src/content/library', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    shelf: z.enum(SHELVES),
    summary: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { world, library };
