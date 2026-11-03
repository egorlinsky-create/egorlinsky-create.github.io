---
name: portfolio-components
description: Подобрать и добавить компонент, блок, эффект или прототип в портфолио — shadcn/ui, Magic UI, Aceternity, 21st.dev, affectUI, паттерны Mobbin и дизайн-система TradeTaxi из design-system-catalog. Use when the portfolio needs a new UI component, section, visual effect or interactive prototype.
---

# Компоненты портфолио

## Сначала — нужен ли новый компонент

1. Есть в `src/components` или `src/components/case`? Используй, добавь свойство.
2. Решается токенами и Tailwind за 20 строк? Пиши сам.
3. Только потом — реестр. Берёшь код к себе (shadcn-подход), правишь под токены сайта.

## Карта источников

| Источник | Что брать | Как ставить | Лицензия |
|---|---|---|---|
| **shadcn/ui** | База: Dialog, Sheet, Tabs, Tooltip, Accordion | `npx shadcn@latest add sheet` | MIT |
| **Magic UI** | Тихие эффекты: Number Ticker, Blur Fade, Marquee, Border Beam, Animated Beam | `npx shadcn@latest add @magicui/number-ticker` | MIT |
| **Aceternity UI** | Hero и bento: Bento Grid, Spotlight, 3D Card. Только бесплатная часть | `npx shadcn@latest add @aceternity/bento-grid` | Free + Pro |
| **21st.dev** | Компоненты сообщества, поиск по задаче | `npx shadcn@latest add "https://21st.dev/r/<author>/<component>"` | разная — проверяй |
| **affectUI** | Компоненты для AI-продуктов: Agent Plan, Approval Card, Agent Tree — для кейсов про AI-процесс. Один .tsx без зависимостей | shadcn CLI или копия файла; точная команда — affectui.com/docs/installation; есть MCP | 40 шт MIT, остальное Pro |
| **Mobbin** (MCP) | Не код, а паттерны из реальных приложений — обоснование решений в кейсе | навык `mobbin:search`, затем ссылка на экраны в тексте | — |
| **design-system-catalog** | Токены и компоненты TradeTaxi (DriverList, WalletBlock, StatusBadge) для прототипов кейса ЭПЛ | `C:\Users\jonik\design-system-catalog`: `tokens/*.json`, `components/*/component.json` | своё |

Pro-компоненты и платные шаблоны не ставить без явного согласия Евгения.

## Правила адаптации

- Цвета из реестра → токены `global.css` (`bg-surface`, `text-muted`, `border-line`, `bg-accent`). Hex и `zinc-*` из чужого кода заменить.
- Анимация из реестра → проверить по навыку `portfolio-motion` (бюджет, reduced motion).
- Компонент кладём в `src/components/ui/<name>.tsx`, утилиту `cn` — из `@/lib/utils`.
- Тяжёлые эффекты (WebGL, canvas, particles) — нет. Сайт должен открываться на слабом ноутбуке рекрутера.

## Прототипы для кейсов

Прототип в кейсе — главный аргумент «прототип уровня прода за день». Требования:

- Файл `src/prototypes/<Name>.tsx`, вставка через `<Prototype>` + `client:visible`.
- Сценарий из кейса, а не витрина: пользователь делает действие и видит следующее состояние.
- Все состояния: пусто, загрузка, ошибка, успех, disabled. Микротексты — из реальных макетов.
- Для TradeTaxi бери токены из `design-system-catalog/tokens` (бренд — жёлтый `color.brand.primary`), для НФ — Noboring DS (`Colors/Primary/500` = #1D23CD) через локальные CSS-переменные внутри прототипа. Глобальные токены сайта не трогать.
- Клавиатура, фокус, `aria-live` для смены состояний.

## Как искать

- shadcn: `npx shadcn@latest search @magicui -q "number"` или MCP shadcn.
- Mobbin: искать паттерн по задаче («status timeline driver app»), а не по названию компонента.
- 21st.dev: искать на сайте по задаче, смотреть зависимости до установки.
