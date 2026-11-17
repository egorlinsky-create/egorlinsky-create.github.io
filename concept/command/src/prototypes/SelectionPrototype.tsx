import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import './nf-table.css';

/**
 * Прототип: режим подборки в панели распределения клиентов НФ, версия 2.0.
 * Сценарий и тексты — по макетам Figma «UI-2026 / Доработка Flow создания подборки».
 * Колонки — из distributionPanelConfig, визуал — контракт TableFinance и токены prototype-kit.
 * Данные демонстрационные.
 */

type Vacation = { status: 'В процессе' | 'Запланирован'; range: string };
type Partner = { id: number; ini: string; name: string; org: string; vacation: Vacation; rates: number; category: string; sphere: string };

const PARTNERS: Partner[] = [
  { id: 1, ini: 'ИА', name: 'Иванова Анна', org: 'КДВ ▸ Дивизион 2-1', vacation: { status: 'В процессе', range: 'С 10.06.2024 — по 24.06.2024' }, rates: 2, category: '1 Категория', sphere: 'Сельское хозяйство' },
  { id: 2, ini: 'КК', name: 'Константинопольская Константина', org: 'КДВ ▸ Дивизион 2-2', vacation: { status: 'Запланирован', range: 'С 10.07.2024 — по 01.07.2024' }, rates: 0, category: '1 Категория', sphere: 'Сельское хозяйство' },
  { id: 3, ini: 'АА', name: 'Аскарова Алина', org: 'Администратор секции учёта данных', vacation: { status: 'Запланирован', range: 'С 10.07.2024 — по 01.07.2024' }, rates: 3, category: '1 Категория', sphere: 'Сельское хозяйство' },
  { id: 4, ini: 'ФК', name: 'Филипова Ксения', org: 'Администратор ▸ Дивизион 1-2', vacation: { status: 'Запланирован', range: 'С 10.07.2024 — по 01.07.2024' }, rates: 1, category: '2 Категория', sphere: 'Сельское хозяйство' },
  { id: 5, ini: 'АА', name: 'Алексеев Андрей', org: 'Бизнес-коуч ▸ Администратор', vacation: { status: 'В процессе', range: 'С 17.06.2024 — по 01.07.2024' }, rates: 2, category: '1 Категория', sphere: 'Сельское хозяйство' },
];

type Mode = 'normal' | 'create' | 'howto' | 'selecting' | 'done';

const plural = (n: number, one: string, few: string, many: string) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
};

function Modal({ title, children, onClose, labelId }: { title: string; children: ReactNode; onClose: () => void; labelId: string }) {
  return (
    <div className="nf-overlay" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="nf-dialog relative" role="dialog" aria-modal="true" aria-labelledby={labelId} style={{ maxWidth: 370 }}>
        <button type="button" onClick={onClose} aria-label="Закрыть" className="absolute top-3 right-3 grid size-8 place-items-center rounded-lg text-[#64748b] hover:bg-[#f1f5f9]">
          ✕
        </button>
        <h4 id={labelId} style={{ fontSize: 24, lineHeight: '32px', paddingRight: 24 }}>
          {title}
        </h4>
        {children}
      </div>
    </div>
  );
}

export default function SelectionPrototype() {
  const [mode, setMode] = useState<Mode>('normal');
  const [name, setName] = useState('Для ООО Ромашка');
  const [picked, setPicked] = useState<number[]>([]);
  const [hideHowto, setHideHowto] = useState(false);
  const [dontShow, setDontShow] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [exitAsk, setExitAsk] = useState(false);
  const [finish, setFinish] = useState(false);
  const [product, setProduct] = useState('');
  const [check, setCheck] = useState('');
  const [finishErr, setFinishErr] = useState(false);
  const ids = { create: useId(), howto: useId(), exit: useId(), finish: useId() };
  const nameRef = useRef<HTMLInputElement>(null);
  const selecting = mode === 'selecting';
  const rows = useMemo(() => PARTNERS, []);

  useEffect(() => {
    if (mode === 'create') nameRef.current?.focus();
  }, [mode]);

  const toggle = (id: number) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const reset = () => {
    setMode('normal');
    setPicked([]);
    setDrawer(false);
    setExitAsk(false);
    setFinish(false);
    setProduct('');
    setCheck('');
    setFinishErr(false);
    setInfoOpen(false);
  };
  const send = () => {
    if (!product || !check.trim()) return setFinishErr(true);
    setFinish(false);
    setDrawer(false);
    setMode('done');
  };

  return (
    <div className="nf relative overflow-hidden rounded-xl border border-line" style={{ minHeight: 560 }}>
      {/* Шапка приложения */}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="grid size-9 place-items-center rounded-lg bg-[#ef1d1d] text-[13px] font-bold text-white">НФ</span>
        <span style={{ fontSize: 18, lineHeight: '24px' }}>{selecting ? 'Панель распределения клиентов' : 'Панель распределения'}</span>
      </div>

      {selecting && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2" style={{ background: 'var(--nf-primary-hover)', color: '#fff' }} role="status">
          <span className="flex items-center gap-2 text-[13px]">
            <span className="rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide" style={{ background: 'rgb(255 255 255 / 0.22)' }}>
              РЕЖИМ ПОДБОРКИ
            </span>
            Подборка: «{name}»
          </span>
          <button type="button" className="nf-btn nf-btn--s nf-btn--secondary" onClick={() => setExitAsk(true)}>
            Выйти из режима подборки
          </button>
        </div>
      )}

      <div className="px-4 pt-4">
        <span className="inline-flex h-8 items-center gap-2 rounded-lg px-3 text-[13px]" style={{ background: 'var(--nf-secondary-hover)', color: 'var(--nf-text)' }}>
          ☰ Фильтр
          <span className="rounded-full px-1.5 text-[11px] text-white" style={{ background: 'var(--nf-primary-hover)' }}>
            20
          </span>
        </span>
      </div>

      <div className="nf-title-row" style={{ paddingTop: 12 }}>
        <span className="nf-counter">
          Найдено: {rows.length} {plural(rows.length, 'запись', 'записи', 'записей')}
        </span>
        <span className="flex items-center gap-3">
          {mode === 'normal' || mode === 'create' || mode === 'howto' ? (
            <button type="button" className="nf-btn nf-btn--s nf-btn--secondary" onClick={() => setMode('create')}>
              Создать подборку
            </button>
          ) : null}
          {selecting && (
            <>
              <span>ФД в подборке: {picked.length}</span>
              <button type="button" className="nf-btn nf-btn--s nf-btn--primary" onClick={() => setDrawer(true)}>
                Открыть подборку
              </button>
            </>
          )}
        </span>
      </div>

      <div className="nf-table-wrap" style={{ marginBottom: 16 }}>
        <table className="nf-table">
          <thead>
            <tr>
              <th className="nf-col-num">№</th>
              <th style={{ minWidth: 240 }}>Партнер</th>
              <th style={{ minWidth: 210 }}>Ближайший отпуск</th>
              <th style={{ minWidth: 150 }}>Факт. Итого Ставок</th>
              <th style={{ minWidth: 120 }}>Категория</th>
              <th style={{ minWidth: 200 }}>Роль и место в структуре</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const isIn = picked.includes(p.id);
              return (
                <tr key={p.id} className={isIn ? 'nf-row--picked' : undefined}>
                  <td className="nf-col-num">
                    <div className="nf-cell">
                      {selecting ? (
                        <button
                          type="button"
                          className="nf-add"
                          aria-pressed={isIn}
                          aria-label={isIn ? `Убрать ${p.name} из подборки` : `Добавить ${p.name} в подборку`}
                          onClick={() => toggle(p.id)}
                        >
                          {isIn ? '✓' : '+'}
                        </button>
                      ) : (
                        <span className="nf-num">{p.id}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="nf-cell">
                      <span className="nf-avatar">{p.ini}</span>
                      <span className="nf-link truncate">{p.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="nf-cell" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2, justifyContent: 'center' }}>
                      <span
                        className="nf-tag nf-tag--stroke"
                        style={p.vacation.status === 'В процессе' ? { color: '#4b50d8', background: '#fff' } : { color: '#b45309', borderColor: '#fbbf24', background: '#fff' }}
                      >
                        <span style={{ color: 'var(--nf-text)', fontSize: 13 }}>{p.vacation.status}</span>
                      </span>
                      <span className="nf-desc" style={{ marginTop: 0 }}>
                        {p.vacation.range}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="nf-cell" style={{ justifyContent: 'flex-end' }}>
                      <span className="nf-num">{p.rates}</span>
                    </div>
                  </td>
                  <td>
                    <div className="nf-cell">
                      <span className="nf-tag">{p.category}</span>
                    </div>
                  </td>
                  <td>
                    <div className="nf-cell">
                      <span className="nf-tag">{p.org}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 02 · Создать новую подборку */}
      {mode === 'create' && (
        <Modal title="Создать новую подборку" labelId={ids.create} onClose={() => setMode('normal')}>
          <p className="nf-desc" style={{ fontSize: 15, lineHeight: '22px', marginTop: 8 }}>
            Текущие фильтры сохранятся. К ним автоматически добавится фильтр: статус заявки на клиента — «Открыто»
          </p>
          <label className="nf-field" htmlFor={`${ids.create}-n`}>
            <span className="nf-label" style={{ fontSize: 14, color: 'var(--nf-text)' }}>
              Название<span style={{ color: 'var(--nf-primary)' }}>*</span>
            </span>
            <span className="relative block">
              <input
                id={`${ids.create}-n`}
                ref={nameRef}
                className="nf-input"
                placeholder="Введите название подборки"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {name && (
                <button type="button" aria-label="Очистить название" onClick={() => setName('')} className="absolute top-1/2 right-3 -translate-y-1/2 text-[#94a3b8]">
                  ✕
                </button>
              )}
            </span>
          </label>
          <label className="nf-field">
            <span className="nf-label" style={{ fontSize: 14, color: 'var(--nf-text)' }}>
              Инициатор<span style={{ color: 'var(--nf-primary)' }}>*</span>
            </span>
            <span className="nf-input flex items-center gap-2">
              <span className="nf-avatar">ИА</span>Иванова Анна
            </span>
          </label>
          <div className="mt-6 grid grid-cols-2 gap-2">
            <button type="button" className="nf-btn nf-btn--secondary" onClick={() => setMode('normal')}>
              Отменить
            </button>
            <button
              type="button"
              className="nf-btn nf-btn--primary"
              disabled={!name.trim()}
              onClick={() => setMode(hideHowto ? 'selecting' : 'howto')}
            >
              Создать
            </button>
          </div>
        </Modal>
      )}

      {/* Подсказка: как добавить ФД */}
      {mode === 'howto' && (
        <Modal title="Как добавить ФД в подборку?" labelId={ids.howto} onClose={() => setMode('selecting')}>
          <p className="nf-desc" style={{ fontSize: 15, lineHeight: '22px', marginTop: 8 }}>
            Нажмите на иконку «плюс» рядом с ФИО ФД для добавления в подборку
          </p>
          <label className="mt-5 flex cursor-pointer items-center gap-3" style={{ fontSize: 15 }}>
            <input type="checkbox" checked={dontShow} onChange={(e) => setDontShow(e.target.checked)} className="size-5 accent-[#1d23cd]" />
            Больше не выводить это сообщение
          </label>
          <button
            type="button"
            className="nf-btn nf-btn--primary mt-6 w-full"
            onClick={() => {
              if (dontShow) setHideHowto(true);
              setMode('selecting');
            }}
          >
            Ок, понятно
          </button>
        </Modal>
      )}

      {/* Выйти из режима подборки? */}
      {exitAsk && (
        <Modal title="Выйти из режима подборки?" labelId={ids.exit} onClose={() => setExitAsk(false)}>
          <p className="nf-desc" style={{ fontSize: 15, lineHeight: '22px', marginTop: 8 }}>
            Все ФД, добавленные в подборку «{name}», будут из неё удалены. Подборка сохранится, но станет пустой.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-2">
            <button type="button" className="nf-btn nf-btn--secondary" onClick={() => setExitAsk(false)}>
              Отмена
            </button>
            <button type="button" className="nf-btn" style={{ background: '#fee2e2', color: '#ef4444' }} onClick={reset}>
              Выйти
            </button>
          </div>
        </Modal>
      )}

      {/* 04 · Создание подборки — правая панель */}
      {drawer && (
        <div className="nf-panel" role="dialog" aria-label="Создание подборки" style={{ width: 'min(440px, 100%)' }}>
          <div className="nf-panel-head" style={{ justifyContent: 'flex-start', gap: 12 }}>
            <button type="button" aria-label="Назад к таблице" className="nf-btn nf-btn--s nf-btn--ghost" onClick={() => setDrawer(false)}>
              ←
            </button>
            <h4>Создание подборки</h4>
          </div>
          <div className="nf-panel-body" style={{ padding: 0 }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--nf-border)' }}>
              <span style={{ fontSize: 16, fontWeight: 500 }}>
                Информация о клиенте <span style={{ color: '#f59e0b' }}>ⓘ</span>
              </span>
              <button type="button" style={{ color: 'var(--nf-primary)' }} onClick={() => setInfoOpen((v) => !v)} aria-expanded={infoOpen}>
                {infoOpen ? 'Свернуть ⌃' : 'Показать ⌄'}
              </button>
            </div>
            {infoOpen && (
              <dl className="grid grid-cols-[150px_1fr] gap-y-2 px-6 py-4" style={{ borderBottom: '1px solid var(--nf-border)' }}>
                {[
                  ['Название*', name],
                  ['Инициатор*', 'Иванова Анна'],
                  ['Продукт*', null],
                  ['Отрасль*', 'Сельское хозяйство'],
                  ['Компетенции', '1С'],
                  ['Чек клиента в месяц*', null],
                ].map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="nf-desc" style={{ fontSize: 14, marginTop: 0 }}>
                      {k}
                    </dt>
                    <dd style={{ color: v ? 'var(--nf-text)' : 'var(--nf-faint)' }}>{v ?? 'Добавить'}</dd>
                  </div>
                ))}
                <p className="nf-desc col-span-2">Отрасль и компетенции подставлены из фильтров таблицы.</p>
              </dl>
            )}
            <div className="px-6 py-4">
              <p style={{ fontSize: 16, fontWeight: 500 }}>ФД в подборке</p>
              {picked.length === 0 ? (
                <p className="nf-desc" style={{ fontSize: 14, lineHeight: '20px', marginTop: 8 }}>
                  Пока пусто. Добавьте ФД через «+» в колонке № — кнопка «Создать» станет активной.
                </p>
              ) : (
                <ul className="mt-2">
                  {picked.map((id) => {
                    const p = PARTNERS.find((x) => x.id === id)!;
                    return (
                      <li key={id} className="flex items-center justify-between gap-2 py-2.5" style={{ borderBottom: '1px solid var(--nf-border)' }}>
                        <span className="flex items-center gap-2.5">
                          <span className="nf-avatar" style={{ width: 36, height: 36, fontSize: 12 }}>
                            {p.ini}
                          </span>
                          <span>
                            <span className="nf-link">{p.name}</span>
                            <span className="nf-sub" style={{ marginTop: 0 }}>
                              {p.org}
                            </span>
                          </span>
                        </span>
                        <button type="button" aria-label={`Удалить ${p.name} из подборки`} onClick={() => toggle(id)} style={{ color: '#ef4444' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                            <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />
                          </svg>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
          <div className="nf-panel-foot" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="nf-btn nf-btn--secondary" onClick={() => setExitAsk(true)}>
              Удалить
            </button>
            <button type="button" className="nf-btn nf-btn--primary" disabled={picked.length === 0} onClick={() => setFinish(true)}>
              Создать
            </button>
          </div>
        </div>
      )}

      {/* Завершить подборку */}
      {finish && (
        <Modal title="Завершить подборку" labelId={ids.finish} onClose={() => setFinish(false)}>
          <p className="nf-desc" style={{ fontSize: 15, lineHeight: '22px', marginTop: 8 }}>
            Заполните обязательные, чтобы ФД мог качественно подготовиться к встрече с клиентом
          </p>
          <label className="nf-field">
            <span className="nf-label" style={{ fontSize: 14, color: 'var(--nf-text)' }}>
              Продукт<span style={{ color: 'var(--nf-primary)' }}>*</span>
            </span>
            <select
              className="nf-input"
              value={product}
              aria-invalid={finishErr && !product}
              onChange={(e) => setProduct(e.target.value)}
            >
              <option value="">Выберите продукт клиента</option>
              <option>Финансовый директор на аутсорсе</option>
              <option>Управленческий учёт</option>
            </select>
          </label>
          <label className="nf-field">
            <span className="nf-label" style={{ fontSize: 14, color: 'var(--nf-text)' }}>
              Чек клиента в месяц<span style={{ color: 'var(--nf-primary)' }}>*</span>
            </span>
            <span className="relative block">
              <input
                className="nf-input"
                inputMode="numeric"
                placeholder="100 000"
                value={check}
                aria-invalid={finishErr && !check.trim()}
                onChange={(e) => setCheck(e.target.value.replace(/[^\d ]/g, ''))}
              />
              <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[#94a3b8]">₽</span>
            </span>
          </label>
          <label className="nf-field">
            <span className="nf-label" style={{ fontSize: 14, color: 'var(--nf-text)' }}>
              Тип подборки<span style={{ color: 'var(--nf-primary)' }}>*</span>
            </span>
            <select className="nf-input" defaultValue="Смотрины">
              <option>Смотрины</option>
            </select>
          </label>
          {finishErr && <p className="nf-desc nf-desc--error mt-3">Заполните продукт и чек клиента — без них ФД не подготовится к встрече.</p>}
          <div className="mt-6 grid grid-cols-2 gap-2">
            <button type="button" className="nf-btn nf-btn--secondary" onClick={() => setFinish(false)}>
              Отменить
            </button>
            <button type="button" className="nf-btn nf-btn--primary" onClick={send}>
              Отправить
            </button>
          </div>
        </Modal>
      )}

      {mode === 'done' && (
        <div className="nf-overlay" style={{ background: 'rgb(255 255 255 / 0.94)' }} role="status">
          <div className="text-center">
            <h4 style={{ fontSize: 20, fontWeight: 500 }}>Подборка «{name}» отправлена</h4>
            <p className="nf-desc" style={{ fontSize: 14, marginTop: 8 }}>
              {picked.length} {plural(picked.length, 'ФД', 'ФД', 'ФД')} под параметры клиента
            </p>
            <button type="button" className="nf-btn nf-btn--secondary mt-4" onClick={reset}>
              Начать заново
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
