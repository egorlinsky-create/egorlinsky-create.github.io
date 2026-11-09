import { useEffect, useId, useMemo, useRef, useState } from 'react';

/**
 * Прототип: режим подборки ФД в панели распределения (версия 2.0).
 * Реконструкция логики кейса для портфолио, не код продукта. Данные демонстрационные.
 */

type Industry = 'Все' | 'Производство' | 'Ритейл' | 'IT';
type Fd = { id: number; ini: string; name: string; industry: Exclude<Industry, 'Все'>; skills: string; load: number };

const FDS: Fd[] = [
  { id: 1, ini: 'АК', name: 'Анна Ким', industry: 'Производство', skills: '1С, себестоимость', load: 60 },
  { id: 2, ini: 'ИС', name: 'Илья Соколов', industry: 'Производство', skills: 'Управленка, ДДС', load: 40 },
  { id: 3, ini: 'МВ', name: 'Мария Волкова', industry: 'Производство', skills: 'Бюджеты, кредиты', load: 85 },
  { id: 4, ini: 'ДП', name: 'Денис Петров', industry: 'Ритейл', skills: 'Юнит-экономика', load: 30 },
  { id: 5, ini: 'ОЛ', name: 'Ольга Лис', industry: 'IT', skills: 'SaaS-метрики, P&L', load: 70 },
  { id: 6, ini: 'РГ', name: 'Роман Гусев', industry: 'Ритейл', skills: 'Склад, оборачиваемость', load: 55 },
  { id: 7, ini: 'ЕМ', name: 'Елена Морозова', industry: 'Производство', skills: 'МСФО, аудит', load: 20 },
];
const INDUSTRIES: Industry[] = ['Все', 'Производство', 'Ритейл', 'IT'];

type Mode = 'normal' | 'creating' | 'selecting' | 'done';

export default function SelectionPrototype() {
  const [industry, setIndustry] = useState<Industry>('Производство');
  const [lowLoad, setLowLoad] = useState(true);
  const [mode, setMode] = useState<Mode>('normal');
  const [name, setName] = useState('ООО «Северный ветер»');
  const [nameError, setNameError] = useState(false);
  const [picked, setPicked] = useState<number[]>([]);
  const [hint, setHint] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [task, setTask] = useState('');
  const [taskError, setTaskError] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const nameId = useId();
  const taskId = useId();
  const nameRef = useRef<HTMLInputElement>(null);

  const rows = useMemo(
    () => FDS.filter((f) => (industry === 'Все' || f.industry === industry) && (!lowLoad || f.load <= 70)),
    [industry, lowLoad],
  );
  const selecting = mode === 'selecting';

  useEffect(() => {
    if (mode === 'creating') nameRef.current?.focus();
  }, [mode]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  const toggle = (id: number) => {
    setHint(false);
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  const reset = () => {
    setMode('normal');
    setPicked([]);
    setHint(true);
    setDrawer(false);
    setConfirmClear(false);
    setTask('');
    setTaskError(false);
    setName('ООО «Северный ветер»');
  };

  const create = () => {
    if (!task.trim()) {
      setTaskError(true);
      return;
    }
    setDrawer(false);
    setMode('done');
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-surface text-[14px] leading-snug">
      {/* Шапка раздела */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <div>
          <p className="text-[12px] text-muted">ERP · Распределение клиентов</p>
          <p className="text-[16px] font-semibold">Финдиректоры с открытыми заявками</p>
        </div>
        {mode === 'normal' && (
          <button
            type="button"
            onClick={() => setMode('creating')}
            className="rounded-lg bg-accent px-3.5 py-2 text-[13px] font-semibold text-on-accent hover:opacity-90"
          >
            Собрать подборку
          </button>
        )}
      </div>

      {/* Баннер режима */}
      {selecting && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-accent px-4 py-2.5 text-[13px] text-on-accent sm:px-5" role="status">
          <span>
            <b className="font-semibold">Режим подборки</b> · {name}
          </span>
          <span className="flex items-center gap-3">
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 font-semibold">В подборке: {picked.length} ФД</span>
            <button type="button" onClick={reset} className="underline underline-offset-2 hover:no-underline">
              Выйти из режима
            </button>
          </span>
        </div>
      )}

      {/* Фильтры */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3 sm:px-5" aria-label="Фильтры">
        {INDUSTRIES.map((i) => (
          <button
            key={i}
            type="button"
            aria-pressed={industry === i}
            onClick={() => setIndustry(i)}
            className={`rounded-full border px-3 py-1 text-[12.5px] transition-colors ${
              industry === i ? 'border-text bg-text text-bg' : 'border-line text-muted hover:text-text'
            }`}
          >
            {i}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={lowLoad}
          onClick={() => setLowLoad((v) => !v)}
          className={`rounded-full border px-3 py-1 text-[12.5px] transition-colors ${
            lowLoad ? 'border-text bg-text text-bg' : 'border-line text-muted hover:text-text'
          }`}
        >
          Загрузка до 70%
        </button>
        {selecting && (
          <span className="rounded-full border border-dashed border-accent px-3 py-1 text-[12.5px] text-accent" title="Добавлен автоматически">
            Заявка: открыто
          </span>
        )}
      </div>

      {/* Таблица */}
      <div className="relative min-h-[420px]">
        {rows.length === 0 ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center gap-2 p-6 text-center">
            <p className="font-semibold">Нет ФД под эти фильтры</p>
            <p className="text-muted">Снимите один из фильтров — например, «Загрузка до 70%».</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="text-[12px] text-muted">
              <tr className="border-b border-line">
                {selecting && <th className="w-12 py-2 pl-4 font-medium sm:pl-5" />}
                <th className="py-2 pl-4 font-medium sm:pl-5">ФД</th>
                <th className="hidden py-2 font-medium sm:table-cell">Отрасль</th>
                <th className="py-2 pr-4 text-right font-medium sm:pr-5">Загрузка</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((f, idx) => {
                const isIn = picked.includes(f.id);
                return (
                  <tr key={f.id} className={`border-b border-line transition-colors ${isIn ? 'bg-accent-soft' : ''}`}>
                    {selecting && (
                      <td className="relative py-2.5 pl-4 sm:pl-5">
                        <button
                          type="button"
                          onClick={() => toggle(f.id)}
                          aria-pressed={isIn}
                          aria-label={isIn ? `Убрать ${f.name} из подборки` : `Добавить ${f.name} в подборку`}
                          className={`grid size-7 place-items-center rounded-md border text-[15px] font-semibold transition-colors ${
                            isIn ? 'border-accent bg-accent text-on-accent' : 'border-line text-muted hover:border-accent hover:text-accent'
                          }`}
                        >
                          {isIn ? '✓' : '+'}
                        </button>
                        {hint && idx === 0 && (
                          <div className="absolute top-full left-3 z-10 mt-1 w-60 rounded-xl bg-text p-3 text-[12.5px] text-bg shadow-lg">
                            Нажмите «+», чтобы добавить ФД в подборку. Подсказка больше не появится.
                            <button type="button" onClick={() => setHint(false)} className="mt-1.5 block font-semibold underline">
                              Понятно
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                    <td className="py-2.5 pl-4 sm:pl-5">
                      <span className="flex items-center gap-2.5">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-[12px] font-bold text-accent">{f.ini}</span>
                        <span>
                          {f.name}
                          <span className="block text-[12px] text-muted">{f.skills}</span>
                        </span>
                      </span>
                    </td>
                    <td className="hidden py-2.5 text-muted sm:table-cell">{f.industry}</td>
                    <td className="py-2.5 pr-4 text-right sm:pr-5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[12px] font-semibold ${
                          f.load > 70 ? 'bg-st-gray-soft text-st-gray' : 'bg-st-green-soft text-st-green'
                        }`}
                      >
                        {f.load}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Модалка создания */}
        {mode === 'creating' && (
          <div className="absolute inset-0 z-20 grid place-items-center bg-overlay p-4">
            <div role="dialog" aria-modal="true" aria-labelledby={`${nameId}-t`} className="w-full max-w-sm rounded-2xl bg-surface p-5 shadow-2xl">
              <p id={`${nameId}-t`} className="text-[16px] font-semibold">
                Новая подборка
              </p>
              <label htmlFor={nameId} className="mt-4 block text-[12.5px] font-semibold text-muted">
                Название — обычно имя клиента
              </label>
              <input
                id={nameId}
                ref={nameRef}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError(false);
                }}
                aria-invalid={nameError}
                className={`mt-1.5 w-full rounded-lg border bg-surface px-3 py-2 outline-none focus:border-accent ${nameError ? 'border-st-red' : 'border-line'}`}
              />
              {nameError && <p className="mt-1 text-[12.5px] text-st-red">Введите название — по нему подборку найдут в списке.</p>}
              <p className="mt-3 text-[12.5px] text-muted">Инициатор: вы, аккаунт-менеджер</p>
              <p className="mt-3 rounded-lg bg-surface-2 p-3 text-[12.5px]">
                Текущие фильтры сохранятся. К ним добавится «Заявка на клиента — Открыто».
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setMode('normal')} className="rounded-lg border border-line px-3.5 py-2 font-medium hover:bg-surface-2">
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={() => (name.trim() ? setMode('selecting') : setNameError(true))}
                  className="rounded-lg bg-accent px-3.5 py-2 font-semibold text-on-accent hover:opacity-90"
                >
                  Перейти к выбору ФД
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Drawer подборки */}
        {drawer && (
          <div className="absolute inset-y-0 right-0 z-20 flex w-full max-w-sm flex-col border-l border-line bg-surface shadow-2xl" role="dialog" aria-label="Подборка">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="font-semibold">Подборка · {picked.length} ФД</p>
              <button type="button" onClick={() => setDrawer(false)} aria-label="Закрыть подборку" className="rounded-md px-2 py-1 text-muted hover:bg-surface-2">
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {picked.length === 0 ? (
                <p className="text-muted">Подборка пустая. Название и данные клиента сохранены — добавьте ФД из таблицы.</p>
              ) : (
                <ul className="space-y-2">
                  {picked.map((id) => {
                    const f = FDS.find((x) => x.id === id)!;
                    return (
                      <li key={id} className="flex items-center justify-between gap-2">
                        <span>{f.name}</span>
                        <button type="button" onClick={() => toggle(id)} className="text-[12.5px] text-muted underline hover:text-text">
                          Убрать
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              <p className="mt-5 text-[12px] font-semibold tracking-wide text-muted uppercase">Клиент</p>
              <p className="mt-1.5">
                Отрасль: {industry === 'Все' ? 'не указана' : industry} <span className="text-[12px] text-muted">· из фильтра</span>
              </p>
              <label htmlFor={taskId} className="mt-3 block text-[12.5px] font-semibold text-muted">
                Задача клиента — нужна ФД для подготовки к встрече
              </label>
              <textarea
                id={taskId}
                rows={2}
                value={task}
                onChange={(e) => {
                  setTask(e.target.value);
                  setTaskError(false);
                }}
                placeholder="Например: навести порядок в управленке перед кредитом"
                aria-invalid={taskError}
                className={`mt-1.5 w-full resize-none rounded-lg border bg-surface px-3 py-2 outline-none focus:border-accent ${taskError ? 'border-st-red' : 'border-line'}`}
              />
              {taskError && <p className="mt-1 text-[12.5px] text-st-red">Опишите задачу клиента в паре слов — без неё ФД не подготовится.</p>}
            </div>
            <div className="border-t border-line p-4">
              {confirmClear ? (
                <div className="rounded-lg bg-surface-2 p-3 text-[12.5px]">
                  Список ФД очистится. Название и данные клиента останутся.
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPicked([]);
                        setConfirmClear(false);
                      }}
                      className="rounded-md bg-text px-3 py-1.5 font-semibold text-bg"
                    >
                      Очистить
                    </button>
                    <button type="button" onClick={() => setConfirmClear(false)} className="rounded-md border border-line px-3 py-1.5">
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={picked.length === 0}
                    onClick={() => setConfirmClear(true)}
                    className="rounded-lg border border-line px-3 py-2 disabled:opacity-40"
                  >
                    Очистить
                  </button>
                  <button
                    type="button"
                    disabled={picked.length === 0}
                    onClick={create}
                    className="flex-1 rounded-lg bg-accent px-3 py-2 font-semibold text-on-accent disabled:opacity-40"
                  >
                    Создать подборку
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Успех */}
        {mode === 'done' && (
          <div className="absolute inset-0 z-20 grid place-items-center bg-surface/95 p-6 text-center" role="status">
            <div>
              <p className="text-[18px] font-semibold">Подборка «{name}» создана</p>
              <p className="mt-1 text-muted">
                {picked.length} ФД под параметры клиента. Её видно в списке подборок.
              </p>
              <button type="button" onClick={reset} className="mt-4 rounded-lg border border-line px-4 py-2 font-medium hover:bg-surface-2">
                Начать заново
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Нижняя панель режима */}
      {selecting && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-5">
          <span className="text-[12.5px] text-muted">
            {picked.length === 0 ? 'Добавьте хотя бы одного ФД — тогда подборку можно создать' : 'Проверьте состав и создайте подборку'}
          </span>
          <button
            type="button"
            onClick={() => (picked.length ? setDrawer(true) : setToast('Сначала добавьте ФД через «+»'))}
            aria-disabled={picked.length === 0}
            className={`rounded-lg px-3.5 py-2 text-[13px] font-semibold ${picked.length ? 'bg-accent text-on-accent' : 'bg-surface-2 text-muted'}`}
          >
            Посмотреть подборку ({picked.length})
          </button>
        </div>
      )}

      {toast && (
        <div role="status" className="absolute bottom-16 left-1/2 z-30 -translate-x-1/2 rounded-full bg-text px-4 py-2 text-[12.5px] text-bg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
