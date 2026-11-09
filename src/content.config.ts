import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const cases = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/cases' }),
  schema: z.object({
    title: z.string(),
    cardTitle: z.string().max(40),
    summary: z.string().max(140),
    company: z.string(),
    product: z.string(),
    type: z.enum(['Продукт', 'Система', 'Исследование']),
    status: z.string(),
    accent: z.enum(['green', 'blue', 'purple', 'gray']).default('gray'),
    order: z.number(),
    cover: z.string().optional(),
    /** Главная цифра кейса для обложки-заглушки: «2 дня», «87%» */
    metric: z.string().max(14).optional(),
    metricLabel: z.string().max(80).optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { cases };
