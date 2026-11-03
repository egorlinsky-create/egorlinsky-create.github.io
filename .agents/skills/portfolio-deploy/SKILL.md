---
name: portfolio-deploy
description: Выкатить правки портфолио на GitHub Pages — проверка сборки, коммит, push, проверка деплоя, свой домен. Use when publishing portfolio changes, checking a failed deploy or connecting a custom domain.
---

# Деплой портфолио

Сайт живёт в репозитории `<username>.github.io`, публикуется GitHub Actions (`.github/workflows/deploy.yml`) на каждый push в `main`. Адрес: `https://<username>.github.io`.

## Выкатить правки

```bash
npm run build                 # должно пройти без ошибок
git add -A
git commit -m "Кейс ЭПЛ: прототип состояний водителя"
git push
```

Через 1–2 минуты сайт обновится. Проверить: вкладка **Actions** в репозитории → последний запуск зелёный.

## Первый запуск (один раз)

1. Создать публичный репозиторий `<username>.github.io`: `gh repo create <username>.github.io --public --source . --push`.
2. Settings → Pages → Source: **GitHub Actions**.
3. Дождаться зелёного запуска в Actions.

## Если деплой упал

| Шаг в Actions | Что проверить |
|---|---|
| Install | Версия пакета в `package.json` существует; Node 22 |
| Build | Локально `npm run build`, читать первую ошибку, не последнюю |
| Deploy | Pages включён, Source = GitHub Actions |

## Свой домен (позже)

1. Купить домен, в DNS: `CNAME www → <username>.github.io` и A-записи на IP GitHub Pages (актуальные — в документации GitHub Pages).
2. Добавить `public/CNAME` с доменом одной строкой.
3. В `deploy.yml` заменить `SITE_URL` на `https://<домен>`.
4. Settings → Pages → Custom domain, включить Enforce HTTPS.

## PDF-версия для hh.ru

Работодатели иногда просят PDF. Печать страницы кейса (`Ctrl+P`) использует print-стили: панель разворачивается на всю ширину, навигация скрыта.
