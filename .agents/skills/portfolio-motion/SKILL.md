---
name: portfolio-motion
description: Правила анимации портфолио — бюджет моушена, длительности, кривые, Motion vs GSAP vs CSS, reduced motion, переходы панели кейса. Use when adding, reviewing or fixing any animation, transition or scroll effect on the portfolio site.
---

# Моушен в портфолио

Анимация объясняет: откуда пришёл элемент, что изменилось, куда смотреть. Если она только украшает — убрать.

## Бюджет

| Зона | Можно | Нельзя |
|---|---|---|
| Hero главной | 1 входная анимация текста, 1 тихий эффект (Blur Fade, Spotlight) | Частицы, WebGL, автоплей-видео со звуком |
| Карточки | hover: подъём 2–4px, тень, лёгкий zoom обложки ≤ 1.03 | 3D-наклоны на всю сетку |
| Панель кейса | slide-in справа 280–320ms, подложка fade | Bounce, overshoot |
| Тело кейса | Появление фигур при скролле (opacity + 8–12px), счётчики цифр в итогах | Pin-секции и scrub на каждом блоке |
| Прототипы | Переходы между состояниями как в продукте | Анимации, которых нет в макете |

## Числа

- Длительность: 150–200ms — микро (hover, toggle); 250–320ms — панели и модалки; ≤ 600ms — входные.
- Кривая: `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-quint) для появления, `cubic-bezier(0.4, 0, 1, 1)` для ухода. Токены — `--ease-out`, `--ease-in` в `global.css`.
- Выход быстрее входа примерно на треть.
- Анимируем только `transform` и `opacity`. Не `height`, `top`, `box-shadow` в цикле.

## Инструменты

1. **CSS / Astro View Transitions** — переходы страниц и панели, hover. По умолчанию.
2. **Motion (`motion/react`)** — состояния внутри React-прототипов, `AnimatePresence`, layout-анимации. Всегда `useReducedMotion()`.
3. **GSAP + ScrollTrigger** — только для одного scroll-сторителлинга в кейсе, если он объясняет процесс (например, путь ЭПЛ T1–T6). Через `useGSAP`, с cleanup. Перед этим — внешний навык `gsap-scrolltrigger`.

## Reduced motion — обязательно

- CSS: глобальный блок `@media (prefers-reduced-motion: reduce)` в `global.css` уже гасит длительности.
- Motion: `const reduce = useReducedMotion()` → `transition={{ duration: reduce ? 0 : 0.25 }}`.
- GSAP: `gsap.matchMedia()` с условием `(prefers-reduced-motion: no-preference)`.
- Смысл не должен теряться без анимации: состояние меняется мгновенно, но меняется.

## Ревью анимации — вопросы

1. Что она объясняет? Ответ одной фразой.
2. Можно ли сделать быстрее? Обычно да.
3. Мешает ли читать или кликать сразу после загрузки?
4. Проверена ли с reduced motion и на мобилке?

Для глубокого ревью — внешний навык `emil-design-eng`.
