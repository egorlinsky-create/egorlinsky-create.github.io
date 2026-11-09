/**
 * Статичные сцены кейса «Подборка ФД». Собраны кодом по реальным макетам, данные демонстрационные.
 * Рендерятся без JS (React без client:*). Используются в src/content/cases/selection.mdx.
 */
import type { ReactNode } from 'react';

const Frame = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`overflow-hidden rounded-xl border border-line bg-surface text-[12px] leading-snug shadow-[0_18px_40px_-28px_rgb(0_0_0/0.45)] ${className}`}>
    {children}
  </div>
);

const Chip = ({ children, on, dashed, gone }: { children: ReactNode; on?: boolean; dashed?: boolean; gone?: boolean }) => (
  <span
    className={`rounded-full border px-2 py-0.5 text-[11px] whitespace-nowrap ${
      gone
        ? 'border-dashed border-line text-muted line-through opacity-60'
        : dashed
          ? 'border-dashed border-accent text-accent'
          : on
            ? 'border-text bg-text text-bg'
            : 'border-line text-muted'
    }`}
  >
    {children}
  </span>
);

const Row = ({ name, picked, plus }: { name: string; picked?: boolean; plus?: boolean }) => (
  <div className={`flex items-center gap-2 border-t border-line px-3 py-2 ${picked ? 'bg-accent-soft' : ''}`}>
    {plus && (
      <span
        className={`grid size-5 place-items-center rounded border text-[11px] font-bold ${picked ? 'border-accent bg-accent text-on-accent' : 'border-line text-muted'}`}
      >
        {picked ? '✓' : '+'}
      </span>
    )}
    <span className="grid size-6 place-items-center rounded-full bg-accent-soft text-[10px] font-bold text-accent">{name.slice(0, 1)}</span>
    <span className="flex-1">{name}</span>
    <span className="h-1.5 w-10 rounded-full bg-surface-2" />
  </div>
);

/** Было / стало: вход в режим подборки сбрасывал фильтры */
export function FiltersBeforeAfter() {
  return (
    <figure className="not-prose">
      <div className="grid gap-4 rounded-2xl border border-line bg-surface-2 p-4 sm:grid-cols-2 sm:p-6">
        <div>
          <p className="mb-2 flex items-center gap-2 text-[13px] font-semibold">
            <span className="rounded-full bg-st-gray-soft px-2 py-0.5 text-[11px] text-st-gray">v1</span> Вход в режим — фильтры сброшены
          </p>
          <Frame>
            <div className="flex flex-wrap gap-1.5 border-b border-line p-3">
              <Chip gone>Производство</Chip>
              <Chip gone>Загрузка до 70%</Chip>
            </div>
            <div className="border-y border-dashed border-st-amber bg-st-amber-soft px-3 py-1.5 text-[11px] text-st-amber">⚠ Фильтры сбросились при входе в режим</div>
            <Row name="Анна Ким" />
            <Row name="Денис Петров" />
            <Row name="Ольга Лис" />
            <Row name="Роман Гусев" />
          </Frame>
          <p className="mt-2 text-[12.5px] text-muted">Сотрудник отфильтровал заявки — и в режиме подборки начинал заново.</p>
        </div>
        <div>
          <p className="mb-2 flex items-center gap-2 text-[13px] font-semibold">
            <span className="rounded-full bg-st-green-soft px-2 py-0.5 text-[11px] text-st-green">v2</span> Подборка продолжает работу
          </p>
          <Frame>
            <div className="bg-accent px-3 py-1.5 text-[11px] text-on-accent">Режим подборки · ООО «Северный ветер»</div>
            <div className="flex flex-wrap gap-1.5 border-b border-line p-3">
              <Chip on>Производство</Chip>
              <Chip on>Загрузка до 70%</Chip>
              <Chip dashed>+ Заявка: открыто</Chip>
            </div>
            <Row name="Анна Ким" plus picked />
            <Row name="Илья Соколов" plus />
            <Row name="Елена Морозова" plus picked />
          </Frame>
          <p className="mt-2 text-[12.5px] text-muted">Фильтры остаются, к ним добавляется только статус заявки «Открыто».</p>
        </div>
      </div>
      <figcaption className="mt-3 text-[14px] leading-snug text-muted">
        <strong className="font-semibold text-text">Главная правка версии 2.0.</strong> Реконструкция по макетам, данные демонстрационные
      </figcaption>
    </figure>
  );
}

/** Flow версии 2.0 в четыре шага */
export function SelectionFlow() {
  const steps: { n: string; title: string; text: string; ui: ReactNode }[] = [
    {
      n: '01',
      title: 'Обычный режим',
      text: 'Таблица ФД с применёнными фильтрами — отправная точка',
      ui: (
        <Frame>
          <div className="flex gap-1 border-b border-line p-2">
            <Chip on>Производство</Chip>
          </div>
          <Row name="Анна Ким" />
          <Row name="Илья Соколов" />
          <div className="p-2">
            <span className="block rounded-md bg-accent py-1 text-center text-[10.5px] font-semibold text-on-accent">Собрать подборку</span>
          </div>
        </Frame>
      ),
    },
    {
      n: '02',
      title: 'Создание',
      text: 'Название и инициатор; фильтры сохраняются',
      ui: (
        <Frame className="p-2.5">
          <p className="font-semibold">Новая подборка</p>
          <span className="mt-2 block rounded-md border border-accent px-2 py-1">ООО «Северный ветер»</span>
          <span className="mt-2 block rounded-md bg-surface-2 p-1.5 text-[10.5px] text-muted">Фильтры сохранятся + «Заявка — Открыто»</span>
          <span className="mt-2 block rounded-md bg-accent py-1 text-center text-[10.5px] font-semibold text-on-accent">Перейти к выбору ФД</span>
        </Frame>
      ),
    },
    {
      n: '03',
      title: 'Режим подборки',
      text: 'Баннер и счётчик: видно, что действия попадают в подборку',
      ui: (
        <Frame>
          <div className="flex justify-between bg-accent px-2 py-1.5 text-[10.5px] text-on-accent">
            <span>Режим подборки</span>
            <b>2 ФД</b>
          </div>
          <Row name="Анна Ким" plus picked />
          <Row name="Илья Соколов" plus />
          <Row name="Елена Морозова" plus picked />
        </Frame>
      ),
    },
    {
      n: '04',
      title: 'Подборка сформирована',
      text: 'Drawer со списком: проверить состав и создать',
      ui: (
        <Frame className="p-2.5">
          <p className="font-semibold">Подборка · 2 ФД</p>
          <p className="mt-1.5">Анна Ким</p>
          <p>Елена Морозова</p>
          <p className="mt-1.5 text-[10.5px] text-muted">Отрасль: производство · из фильтра</p>
          <span className="mt-2 block rounded-md bg-accent py-1 text-center text-[10.5px] font-semibold text-on-accent">Создать подборку</span>
        </Frame>
      ),
    },
  ];
  return (
    <figure className="not-prose">
      <ol className="grid gap-3 rounded-2xl border border-line bg-surface-2 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
        {steps.map((s, i) => (
          <li key={s.n} className="relative flex flex-col gap-2">
            <p className="font-mono text-[12px] text-accent">{s.n}</p>
            {s.ui}
            <p className="mt-1 text-[13px] font-semibold">{s.title}</p>
            <p className="text-[12.5px] leading-snug text-muted">{s.text}</p>
            {i < steps.length - 1 && (
              <span aria-hidden="true" className="absolute top-14 -right-2.5 hidden text-muted lg:block">
                →
              </span>
            )}
          </li>
        ))}
      </ol>
      <figcaption className="mt-3 text-[14px] leading-snug text-muted">
        <strong className="font-semibold text-text">Flow версии 2.0:</strong> фильтры → создание → режим подборки → список ФД. Реконструкция по макетам,
        данные демонстрационные
      </figcaption>
    </figure>
  );
}

/** Время до решения о договоре: было / стало */
export function TimeToDecision() {
  return (
    <figure className="not-prose">
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-7">
        <div className="grid gap-5">
          <div>
            <div className="flex items-baseline justify-between text-[13px]">
              <span className="text-muted">Было: подбор вручную</span>
              <span className="font-semibold">≈ 1 месяц</span>
            </div>
            <div className="mt-2 grid grid-cols-[repeat(30,1fr)] gap-[3px]">
              {Array.from({ length: 30 }, (_, i) => (
                <span key={i} className="h-3 rounded-[3px] bg-st-gray-soft" />
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between text-[13px]">
              <span className="text-muted">Стало: подборка под параметры клиента</span>
              <span className="text-[22px] font-semibold tracking-tight text-st-green">2 дня</span>
            </div>
            <div className="mt-2 grid grid-cols-[repeat(30,1fr)] gap-[3px]">
              {Array.from({ length: 30 }, (_, i) => (
                <span key={i} className={`h-3 rounded-[3px] ${i < 2 ? 'bg-st-green' : 'bg-transparent'}`} />
              ))}
            </div>
          </div>
        </div>
        <p className="mt-5 text-[12.5px] text-muted">Одна клетка — день. От заявки до решения о подписании договора с компанией.</p>
      </div>
      <figcaption className="mt-3 text-[14px] leading-snug text-muted">
        <strong className="font-semibold text-text">Срок сократился за счёт всего процесса</strong> — интерфейс его часть, а не единственная причина
      </figcaption>
    </figure>
  );
}
