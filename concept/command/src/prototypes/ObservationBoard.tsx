import { useState } from 'react';

/**
 * Доска наблюдений исследования входящих обращений: 104 карточки отчёта по типам.
 * Количества и примеры — из отчёта, как они описаны в кейсе. Тексты карточек не публикуются.
 */

type Kind = { id: string; label: string; count: number; tone: string; examples: string[] };

const KINDS: Kind[] = [
  {
    id: 'positive',
    label: 'Положительные реакции',
    count: 30,
    tone: 'var(--c-green)',
    examples: ['Модалка с комментарием при закрытии обращения — положительная реакция в конкретном эпизоде'],
  },
  {
    id: 'difficulty',
    label: 'Затруднения',
    count: 9,
    tone: 'var(--c-red)',
    examples: ['Акцентный блок «Взять в работу» не заметили без подсказки', 'Клиенту сложно выбрать тему обращения'],
  },
  { id: 'assumption', label: 'Предположения', count: 27, tone: 'var(--c-amber)', examples: [] },
  {
    id: 'proposal',
    label: 'Предложения',
    count: 11,
    tone: 'var(--c-blue)',
    examples: ['Убрать выбор темы у клиента', 'Мультиселект ответственных', 'Объединить ответственных и участников — не принято'],
  },
  {
    id: 'backlog',
    label: 'Бэклог и гипотезы',
    count: 12,
    tone: 'var(--c-purple)',
    examples: ['Сохранять обратную связь при закрытии', 'Согласовать сроки и приоритеты SLA', 'Распределять обращения через ФД первого уровня'],
  },
  { id: 'interview', label: 'Ответы на интервью после теста', count: 15, tone: 'var(--c-gray)', examples: [] },
];

const TOTAL = KINDS.reduce((s, k) => s + k.count, 0);

export default function ObservationBoard() {
  const [active, setActive] = useState<string | null>(null);
  const current = KINDS.find((k) => k.id === active);
  const cells = KINDS.flatMap((k) => Array.from({ length: k.count }, (_, i) => ({ k, i })));

  return (
    <div className="not-prose">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Фильтр по типу наблюдения">
        <button
          type="button"
          aria-pressed={active === null}
          onClick={() => setActive(null)}
          className={`h-8 rounded-full border px-3 text-sm transition-colors ${active === null ? 'border-text bg-text text-bg' : 'border-line text-muted hover:text-text'}`}
        >
          Все · {TOTAL}
        </button>
        {KINDS.map((k) => (
          <button
            key={k.id}
            type="button"
            aria-pressed={active === k.id}
            onClick={() => setActive(active === k.id ? null : k.id)}
            className={`inline-flex h-8 items-center gap-2 rounded-full border px-3 text-sm transition-colors ${active === k.id ? 'border-text text-text' : 'border-line text-muted hover:text-text'}`}
          >
            <i className="size-2 rounded-full" style={{ background: k.tone }} aria-hidden="true" />
            {k.label} · <span className="tabular-nums">{k.count}</span>
          </button>
        ))}
      </div>

      <div
        className="mt-5 grid gap-1 rounded-xl border border-line bg-surface p-3"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(18px, 1fr))' }}
        role="img"
        aria-label={
          current
            ? `${current.label}: ${current.count} из ${TOTAL} карточек`
            : `${TOTAL} карточек наблюдений: ${KINDS.map((k) => `${k.label.toLowerCase()} — ${k.count}`).join(', ')}`
        }
      >
        {cells.map(({ k, i }) => (
          <span
            key={`${k.id}-${i}`}
            className="aspect-square rounded-[3px] transition-opacity duration-200"
            style={{ background: k.tone, opacity: !active || active === k.id ? 0.85 : 0.12 }}
          />
        ))}
      </div>

      <div className="mt-4 min-h-[72px] text-[15px]" aria-live="polite">
        {current ? (
          current.examples.length ? (
            <>
              <p className="font-medium">
                {current.label} · {current.count} из {TOTAL}. Примеры из отчёта:
              </p>
              <ul className="mt-2 grid gap-1 text-muted">
                {current.examples.map((e) => (
                  <li key={e}>— {e}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-muted">
              {current.label} · {current.count} из {TOTAL}. Отдельные карточки этого типа в кейсе не публикую — они разобраны в отчёте.
            </p>
          )
        ) : (
          <p className="text-muted">Выберите тип, чтобы увидеть его долю и примеры. Решения принимались по действиям участников, а не по баллам.</p>
        )}
      </div>
    </div>
  );
}
