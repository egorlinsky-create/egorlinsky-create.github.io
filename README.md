# Портфолио — Евгений Горлинский

Product Designer · сложные B2B-системы · прототипы уровня прода в AI-агентах.

Сайт: `https://<username>.github.io` · стек: Astro + MDX + React + Tailwind · деплой: GitHub Pages.

## Быстрый старт

```bash
npm install
npm run dev            # http://localhost:4321
npm run build          # проверка перед пушем
npm run skills:install # навыки shadcn, Magic UI, Emil Kowalski, GSAP для Claude Code и Codex
```

## Как устроено

- **Главная** — интро, карточки кейсов, «Интерфейс крупно», «Как работаю», путь.
- **Кейс** открывается в боковой панели поверх главной, как в Notion, но у каждого кейса свой URL: `/cases/taxi-epl`. Ссылку можно отправить рекрутеру отдельно.
- **Кейсы** — `src/content/cases/*.mdx`. Frontmatter = карточка на главной.
- **Живые прототипы** — `src/prototypes/*.tsx`, вставляются в MDX через `<Prototype>`.
- **Картинки** — `public/images/<slug>/`. Пока файла нет, на его месте заглушка с путём.

## Добавить кейс

Попроси агента: «добавь кейс по навыку portfolio-case» — или вручную скопируй любой файл из `src/content/cases` и поменяй frontmatter.

## Агенты: Claude Code и Codex

- Правила проекта — `AGENTS.md` (Codex читает напрямую, Claude Code — через `CLAUDE.md`).
- Навыки проекта — `.agents/skills/` (источник правды) → `.claude/skills/` (копия, `npm run skills:sync`).
- Внешние навыки — список в `skills.config.json`, ставятся `npm run skills:install`.

## Картинки из Notion

Имена файлов в `<Figure src="…">` совпадают с именами в Notion-портфолио. Экспортируй страницу Notion (Export → HTML, с вложенными страницами) и разложи картинки по папкам `public/images/<slug>/` — заглушки заменятся сами.

| Кейс | Папка |
|---|---|
| Подборка финдиректоров | `public/images/selection/` |
| Встречи и задачи ФД | `public/images/erp-meetings/` |
| ЭПЛ и договоры | `public/images/taxi-epl/` |
| Noboring Design System | `public/images/noboring-ds/` |
| Исследование обращений | `public/images/research-appeals/` |
| Главная («Интерфейс крупно») | `public/images/home/` |
