import { useEffect, useId, useMemo, useRef, useState } from 'react';
import './nf-table.css';

/**
 * Прототип: режим подборки в панели распределения клиентов НФ (версия 2.0).
 * Колонки — из конфига distributionPanelConfig (libs/config/.../distributionPanel), визуал — контракт
 * TableFinance (_skeleton.md, _cells.md) и токены prototype-kit. Логика — по кейсу. Данные демонстрационные.
 */

type Sphere = 'Производство' | 'Оптовая торговля' | 'Розница' | 'IT';
type Partner = {
  id: number;
  ini: string;
  name: string;
  org: string;
  spheres: Sphere[];
  skills: string[];
  rates: number;
};

const PARTNERS: Partner[] = [
  { id: 1, ini: 'АК', name: 'Ким Анна Сергеевна', org: 'ФД · Дивизион 2', spheres: ['Производство'], skills: ['Управленческий учёт', 'Себестоимость', '1С'], rates: 2.5 },
  { id: 2, ini: 'СИ', name: 'Соколов Илья Андреевич', org: 'ФД · Дивизион 1', spheres: ['Производство', 'Оптовая торговля'], skills: ['ДДС', 'Бюджетирование'], rates: 3 },
  { id: 3, ini: 'ВМ', name: 'Волкова Мария Олеговна', org: 'ФД · Дивизион 2', spheres: ['Производство'], skills: ['Кредитование', 'Бюджетирование', 'P&L'], rates: 4.5 },
  { id: 4, ini: 'ПД', name: 'Петров Денис Игоревич', org: 'ФД · Дивизион 3', spheres: ['Розница'], skills: ['Юнит-экономика'], rates: 1.5 },
  { id: 5, ini: 'ЛО', name: 'Лис Ольга Викторовна', org: 'ФД · Дивизион 1', spheres: ['IT'], skills: ['SaaS-метрики', 'P&L'], rates: 3.5 },
  { id: 6, ini: 'МЕ', name: 'Морозова Елена Павловна', org: 'ФД · Дивизион 3', spheres: ['Производство'], skills: ['МСФО', 'Аудит'], rates: 1 },
];
const SPHERES: Sphere[] = ['Производство', 'Оптовая торговля', 'Розница', 'IT'];
const MAX_RATES = 3;

type Mode = 'normal' | 'creating' | 'selecting' | 'done';

const plural = (n: number) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'запись';
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'записи';
  return 'записей';
};

function Tags({ values }: { values: string[] }) {
  // Как ColumnFinalSelectDictionary: 1 значение + счётчик «+N»; если значений ровно 2 — видны оба
  const shown = values.length === 2 ? values : values.slice(0, 1);
  const rest = values.length - shown.length;
  return (
    <span className="nf-tags">
      {shown.map((v) => (
        <span key={v} className="nf-tag">
          {v}
        </span>
      ))}
      {rest > 0 && <span className="nf-tag nf-tag--more">+{rest}</span>}
    </span>
  );
}

export default function SelectionPrototype() {
  const [sphere, setSphere] = useState<Sphere | null>('Производство');
  const [lowRates, setLowRates] = useState(true);
  const [mode, setMode] = useState<Mode>('normal');
  const [name, setName] = useState('ООО «Северный ветер»');
  const [nameError, setNameError] = useState(false);
  const [picked, setPicked] = useState<number[]>([]);
  const [hint, setHint] = useState(true);
  const [panel, setPanel] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [task, setTask] = useState('');
  const [taskError, setTaskError] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const nameId = useId();
  const taskId = useId();
  const nameRef = useRef<HTMLInputElement>(null);

  const rows = useMemo(
    () => PARTNERS.filter((p) => (!sphere || p.spheres.includes(sphere)) && (!lowRates || p.rates <= MAX_RATES)),
    [sphere, lowRates],
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
    setPanel(false);
    setConfirmClear(false);
    setTask('');
    setTaskError(false);
  };
  const create = () => {
    if (!task.trim()) return setTaskError(true);
    setPanel(false);
    setMode('done');
  };

  return (
    <div className="nf relative overflow-hidden rounded-xl border border-line">
      {selecting && (
        <div className="nf-banner" role="status">
          <span>
            <b>Режим подборки</b> · {name}
          </span>
          <span className="flex items-center gap-3">
            <span className="nf-banner-count">В подборке: {picked.length}</span>
            <button type="button" onClick={reset}>
              Выйти из режима
            </button>
          </span>
        </div>
      )}

      <div className="nf-title-row">
        <span className="nf-counter">
          Найдено: {rows.length} {plural(rows.length)}
        </span>
        <span className="flex gap-2">
          {mode === 'normal' && (
            <button type="button" className="nf-btn nf-btn--s nf-btn--primary" onClick={() => setMode('creating')}>
              Создать подборку
            </button>
          )}
          {selecting && (
            <button
              type="button"
              className="nf-btn nf-btn--s nf-btn--primary"
              aria-disabled={picked.length === 0}
              style={picked.length === 0 ? { opacity: 0.3 } : undefined}
              onClick={() => (picked.length ? setPanel(true) : setToast('Добавьте партнёра через «+» в колонке №'))}
            >
              Подборка ({picked.length})
            </button>
          )}
        </span>
      </div>

      <div className="nf-filters" aria-label="Фильтры">
        {SPHERES.map((s) => (
          <button key={s} type="button" className="nf-filter-chip" aria-pressed={sphere === s} onClick={() => setSphere(sphere === s ? null : s)}>
            Опыт в отрасли: {s}
          </button>
        ))}
        <button type="button" className="nf-filter-chip" aria-pressed={lowRates} onClick={() => setLowRates((v) => !v)}>
          Факт. итого ставок ≤ {MAX_RATES}
        </button>
        {selecting && <span className="nf-filter-chip nf-filter-chip--auto">Статус: Открыто</span>}
        {(sphere || lowRates) && !selecting && (
          <button
            type="button"
            className="nf-clear"
            onClick={() => {
              setSphere(null);
              setLowRates(false);
            }}
          >
            Очистить
          </button>
        )}
      </div>

      <div className="relative pb-4">
        <div className="nf-table-wrap">
          {rows.length === 0 ? (
            <div className="nf-empty">
              Ничего не найдено
              <br />
              <button
                type="button"
                onClick={() => {
                  setSphere(null);
                  setLowRates(false);
                }}
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <table className="nf-table">
              <thead>
                <tr>
                  <th className="nf-col-num">№</th>
                  <th style={{ minWidth: 240 }}>Партнер</th>
                  <th style={{ minWidth: 170 }}>Опыт в отрасли</th>
                  <th style={{ minWidth: 210 }}>Компетенции</th>
                  <th>Факт. итого ставок</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p, idx) => {
                  const isIn = picked.includes(p.id);
                  return (
                    <tr key={p.id} className={isIn ? 'nf-row--picked' : undefined}>
                      <td className="nf-col-num relative">
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
                        {selecting && hint && idx === 0 && (
                          <div className="nf-hint" style={{ top: 'calc(100% - 6px)', left: 8 }}>
                            Нажмите «+», чтобы добавить партнёра в подборку. Подсказка больше не появится.
                            <button type="button" onClick={() => setHint(false)}>
                              Понятно
                            </button>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="nf-cell" style={{ alignItems: 'flex-start', paddingTop: 12 }}>
                          <span className="nf-avatar">{p.ini}</span>
                          <span>
                            <span className="nf-link">{p.name}</span>
                            <span className="nf-sub">{p.org}</span>
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="nf-cell">
                          <Tags values={p.spheres} />
                        </div>
                      </td>
                      <td>
                        <div className="nf-cell">
                          <Tags values={p.skills} />
                        </div>
                      </td>
                      <td>
                        <div className="nf-cell">
                          <span className="nf-num">{p.rates.toLocaleString('ru-RU')}</span>
                        </div>
                      </td>
                      <td>
                        <div className="nf-cell">
                          <span className="nf-tag nf-tag--stroke nf-tag--positive">Открыто</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Создание подборки — Dialog default */}
      {mode === 'creating' && (
        <div className="nf-overlay">
          <div className="nf-dialog" role="dialog" aria-modal="true" aria-labelledby={`${nameId}-t`}>
            <h4 id={`${nameId}-t`}>Новая подборка</h4>
            <label className="nf-field" htmlFor={nameId}>
              <span className="nf-label">Название подборки *</span>
              <input
                id={nameId}
                ref={nameRef}
                className="nf-input"
                value={name}
                aria-invalid={nameError}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError(false);
                }}
              />
              {nameError && <p className="nf-desc nf-desc--error">Введите название — по нему подборку найдут в списке.</p>}
            </label>
            <label className="nf-field">
              <span className="nf-label">Инициатор</span>
              <input className="nf-input" value="Вы · аккаунт-менеджер" disabled readOnly style={{ background: 'var(--nf-bg)' }} />
            </label>
            <p className="nf-note">Текущие фильтры сохранятся. К ним добавится «Статус заявки на клиента — Открыто».</p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className="nf-btn nf-btn--secondary" onClick={() => setMode('normal')}>
                Отмена
              </button>
              <button type="button" className="nf-btn nf-btn--primary" onClick={() => (name.trim() ? setMode('selecting') : setNameError(true))}>
                Перейти к выбору
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Подборка — Dialog rightPanel */}
      {panel && (
        <div className="nf-panel" role="dialog" aria-label="Подборка">
          <div className="nf-panel-head">
            <h4>Подборка · {picked.length}</h4>
            <button type="button" className="nf-btn nf-btn--s nf-btn--ghost" onClick={() => setPanel(false)} aria-label="Закрыть">
              ✕
            </button>
          </div>
          <div className="nf-panel-body">
            {picked.length === 0 ? (
              <p className="nf-desc" style={{ fontSize: 14, lineHeight: '20px' }}>
                Подборка пустая. Название и данные клиента сохранены — добавьте партнёров из таблицы.
              </p>
            ) : (
              <ul className="space-y-3">
                {picked.map((id) => {
                  const p = PARTNERS.find((x) => x.id === id)!;
                  return (
                    <li key={id} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <span className="nf-avatar">{p.ini}</span>
                        {p.name}
                      </span>
                      <button type="button" className="nf-clear" style={{ margin: 0 }} onClick={() => toggle(id)}>
                        Убрать
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="nf-label" style={{ marginTop: 24 }}>
              Клиент
            </p>
            <p>
              Опыт в отрасли: {sphere ?? 'не указан'} <span className="nf-desc">· из фильтра</span>
            </p>
            <label className="nf-field" htmlFor={taskId}>
              <span className="nf-label">Запрос клиента *</span>
              <textarea
                id={taskId}
                rows={3}
                className="nf-input"
                value={task}
                aria-invalid={taskError}
                placeholder="Например: навести порядок в управленческом учёте перед кредитом"
                onChange={(e) => {
                  setTask(e.target.value);
                  setTaskError(false);
                }}
              />
              {taskError ? (
                <p className="nf-desc nf-desc--error">Опишите запрос клиента — без него партнёр не подготовится к встрече.</p>
              ) : (
                <p className="nf-desc">Нужен партнёру, чтобы подготовиться к встрече с клиентом.</p>
              )}
            </label>
          </div>
          <div className="nf-panel-foot">
            {confirmClear ? (
              <div className="nf-note" style={{ margin: 0, width: '100%' }}>
                Список партнёров очистится. Название и данные клиента останутся.
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    className="nf-btn nf-btn--s nf-btn--primary"
                    onClick={() => {
                      setPicked([]);
                      setConfirmClear(false);
                    }}
                  >
                    Очистить
                  </button>
                  <button type="button" className="nf-btn nf-btn--s nf-btn--secondary" onClick={() => setConfirmClear(false)}>
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button type="button" className="nf-btn nf-btn--secondary" disabled={picked.length === 0} onClick={() => setConfirmClear(true)}>
                  Очистить
                </button>
                <button type="button" className="nf-btn nf-btn--primary flex-1" disabled={picked.length === 0} onClick={create}>
                  Создать подборку
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {mode === 'done' && (
        <div className="nf-overlay" style={{ background: 'rgb(255 255 255 / 0.92)' }} role="status">
          <div className="text-center">
            <h4 style={{ fontSize: 20, fontWeight: 500 }}>Подборка «{name}» создана</h4>
            <p className="nf-desc" style={{ fontSize: 14, marginTop: 8 }}>
              Партнёров в подборке: {picked.length}. Собрана под параметры клиента
            </p>
            <button type="button" className="nf-btn nf-btn--secondary mt-4" onClick={reset}>
              Начать заново
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="nf-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
