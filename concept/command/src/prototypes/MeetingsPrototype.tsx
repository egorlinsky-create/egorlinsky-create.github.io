import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import './nf-table.css';
import './nf-meetings.css';

/**
 * Прототип «План встреч и задач» в кабинете клиента НФ.
 * Десктоп — по макетам Figma «UI-2026 / Встречи и задачи» и доработкам по обратной связи
 * (подсветка сроков, документы, напоминания, поиск и фильтры, перетаскивание пунктов чек-листа).
 * Мобильная версия — проработка для портфолио по паттернам мобильного кабинета клиента
 * (карточка на весь экран, фильтры нижним листом). Данные демонстрационные.
 */

type Kind = 'meet' | 'task';
type Status = 'plan' | 'done' | 'cancel';
type Doc = { id: number; name: string; state: 'ok' | 'loading' | 'error' };
type Check = { id: number; text: string; done: boolean };
type Comment = { who: string; text: string; time: string };
type Item = {
  id: number;
  kind: Kind;
  title: string;
  status: Status;
  date: string; // ГГГГ-ММ-ДД
  owner: string;
  members: string[];
  labels: string[];
  checklist: Check[];
  docs: Doc[];
  comments: Comment[];
  remind?: { on: boolean; before: string };
  isNew?: boolean;
};
type Device = 'desk' | 'mob';
type Term = 'all' | '7' | '30';

const TODAY = new Date(2026, 10, 10);
const ME = 'Иванова Анна';
const KIND_LABEL: Record<Kind, string> = { meet: 'Встреча', task: 'Задача' };
const STATUS_LABEL: Record<Status, string> = { plan: 'Запланировано', done: 'Выполнено', cancel: 'Отменено' };
const REMIND = ['За 15 минут', 'За 30 минут', 'За 1 час', 'За день'];

let seq = 100;
const ck = (text: string, done = false): Check => ({ id: seq++, text, done });

const SEED: Item[] = [
  {
    id: 456790, kind: 'task', title: 'Согласовать план платежей на ноябрь', status: 'plan', date: '2026-11-10', owner: ME,
    members: ['Петров Илья', 'Смирнова Ольга'], labels: [],
    checklist: [ck('Собрать заявки на оплату', true), ck('Сверить с остатками на счетах'), ck('Отправить план собственнику'), ck('Внести правки')],
    docs: [], comments: [{ who: 'Петров Илья', text: 'Добавил заявку от подрядчика, посмотрите до обеда', time: '09:12' }],
  },
  {
    id: 456791, kind: 'task', title: 'Проверить ДДС за октябрь', status: 'plan', date: '2026-11-11', owner: ME,
    members: ['Смирнова Ольга'], labels: [], checklist: [ck('Выгрузить выписки'), ck('Разнести платежи по статьям')],
    docs: [{ id: 1, name: 'ДДС_октябрь.xlsx', state: 'ok' }], comments: [],
  },
  {
    id: 456792, kind: 'meet', title: 'Презентация отчётности за октябрь', status: 'plan', date: '2026-11-14', owner: ME,
    members: ['Петров Илья', 'Смирнова Ольга', 'Козлов Артём'], labels: ['Презентация отчётности', 'Отчёт о результатах'],
    checklist: [ck('Итоги месяца: выручка и маржа'), ck('Отклонения от бюджета'), ck('План на ноябрь')],
    docs: [{ id: 2, name: 'Отчётность_октябрь.pdf', state: 'ok' }], comments: [], remind: { on: true, before: 'За 30 минут' },
  },
  {
    id: 456793, kind: 'task', title: 'Согласовать бюджет на декабрь', status: 'plan', date: '2026-12-09', owner: 'Петров Илья',
    members: [ME], labels: [], checklist: [], docs: [], comments: [],
  },
  {
    id: 238147, kind: 'meet', title: 'Первое знакомство. Протокол встречи', status: 'done', date: '2026-10-15', owner: 'Козлов Артём',
    members: [ME], labels: ['Знакомство'], checklist: [ck('Цели клиента', true), ck('Доступы к учёту', true)], docs: [], comments: [],
    remind: { on: false, before: 'За 30 минут' },
  },
  {
    id: 134545, kind: 'task', title: 'Сверка дебиторской задолженности за сентябрь', status: 'cancel', date: '2026-09-30', owner: ME,
    members: [], labels: [], checklist: [], docs: [], comments: [],
  },
];

const ini = (name: string) => name.split(' ').map((p) => p[0]).slice(0, 2).join('');
const parse = (d: string) => {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day);
};
const daysLeft = (d: string) => Math.round((parse(d).getTime() - TODAY.getTime()) / 86400000);
const fmt = (d: string) => d.split('-').reverse().join('.');

function Avatar({ name }: { name: string }) {
  return (
    <span className="nf-avatar" title={name} aria-hidden="true">
      {ini(name)}
    </span>
  );
}

function Due({ item }: { item: Item }) {
  if (item.status !== 'plan') return null;
  const d = daysLeft(item.date);
  if (d < 0) return <span className="nfm-badge nfm-badge--late">Просрочено</span>;
  if (d <= 1) return <span className="nfm-badge" title="Дней до срока">{d} дн.</span>;
  return null;
}

const Icon = {
  search: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="7" cy="7" r="5" />
      <path d="m11 11 3 3" />
    </svg>
  ),
  filter: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M2 4h12M4 8h8M6 12h4" />
    </svg>
  ),
  sort: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M5 2v12M2 11l3 3 3-3M11 14V2M8 5l3-3 3 3" />
    </svg>
  ),
  list: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="2" width="10" height="12" rx="2" />
      <path d="M6 6h4M6 9h4" />
    </svg>
  ),
  chat: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M2 3h12v8H6l-3 2v-2H2z" />
    </svg>
  ),
  file: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M4 1.5h5l3 3v10H4zM9 1.5v3h3M8 7v5M6 10l2 2 2-2" />
    </svg>
  ),
  back: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M15 9H3M8 4 3 9l5 5" />
    </svg>
  ),
};

function Card({ item, onOpen }: { item: Item; onOpen: () => void }) {
  const done = item.checklist.filter((c) => c.done).length;
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`nfm-card ${item.status !== 'plan' ? 'nfm-card--muted' : ''} ${item.isNew ? 'nfm-card--new' : ''}`}
      aria-label={`${KIND_LABEL[item.kind]} «${item.title}», ${STATUS_LABEL[item.status].toLowerCase()}, срок ${fmt(item.date)}`}
    >
      <span className="nfm-card-top">
        <span className="nfm-id">#{item.id}</span>
        <span className={`nfm-type nfm-type--${item.kind}`}>{KIND_LABEL[item.kind]}</span>
        {item.labels.map((l) => (
          <span key={l} className="nfm-label">
            {l}
          </span>
        ))}
        <span className={`nfm-status nfm-status--${item.status}`}>{STATUS_LABEL[item.status]}</span>
      </span>
      <span className="nfm-card-title block">{item.title}</span>
      <span className="nfm-card-bottom">
        <span className="nfm-owner">
          <Avatar name={item.owner} />
          {item.owner}
        </span>
        {item.checklist.length > 0 && (
          <span className="nfm-meta" title="Пункты чек-листа">
            {Icon.list}
            {done}/{item.checklist.length}
          </span>
        )}
        {item.comments.length > 0 && (
          <span className="nfm-meta" title="Комментарии">
            {Icon.chat}
            <span className="nfm-count">+{item.comments.length}</span>
          </span>
        )}
        <span className="nfm-meta">{fmt(item.date)}</span>
        <Due item={item} />
      </span>
    </button>
  );
}

function Stats({ items }: { items: Item[] }) {
  const [tab, setTab] = useState<Kind>('meet');
  const list = items.filter((i) => i.kind === tab);
  const by = (s: Status) => list.filter((i) => i.status === s).length;
  const rows: [string, number, string][] = [
    ['В плане', by('plan'), '#3b82f6'],
    ['Завершено', by('done'), '#10b981'],
    ['Отменено', by('cancel'), '#ef4444'],
  ];
  return (
    <div className="nfm-stats">
      <div className="flex items-center justify-between text-[18px] text-[#0f172a]">
        <span aria-hidden="true" className="text-[#94a3b8]">‹</span>2026<span aria-hidden="true" className="text-[#94a3b8]">›</span>
      </div>
      <div className="nfm-seg w-full" role="group" aria-label="Что считать">
        {(['meet', 'task'] as Kind[]).map((k) => (
          <button key={k} type="button" className="flex-1" aria-pressed={tab === k} onClick={() => setTab(k)}>
            {k === 'meet' ? 'Встречи' : 'Задачи'}
          </button>
        ))}
      </div>
      <div className="nfm-box flex items-center justify-between">
        <span className="text-[13px] text-[#64748b]">Всего за год</span>
        <b className="nf-num text-[18px] font-medium">{list.length}</b>
      </div>
      <div className="nfm-box grid gap-3">
        {rows.map(([label, n, color]) => (
          <div key={label}>
            <div className="flex justify-between text-[12px]">
              <span className="text-[#64748b]">{label}</span>
              <b className="font-medium">{n}</b>
            </div>
            <div className="nfm-bar">
              <i style={{ width: list.length ? `${(n / list.length) * 100}%` : 0, background: color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Sheet({ device, title, onClose, children, footer, labelId }: { device: Device; title: string; onClose: () => void; children: ReactNode; footer: ReactNode; labelId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('input, button')?.focus();
  }, []);
  const head = (
    <div className="nf-panel-head">
      <h4 id={labelId}>{title}</h4>
      <button type="button" onClick={onClose} aria-label="Закрыть" className="nfm-del">
        ✕
      </button>
    </div>
  );
  return (
    <>
      <div className="nf-overlay" style={{ zIndex: 24 }} onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        className={device === 'mob' ? 'nfm-sheet' : 'nf-panel'}
        style={device === 'desk' ? { zIndex: 25, width: 320 } : undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      >
        {head}
        <div className="nf-panel-body">{children}</div>
        <div className="nf-panel-foot">{footer}</div>
      </div>
    </>
  );
}

type Filters = { kinds: Kind[]; statuses: Status[]; term: Term };
const NO_FILTERS: Filters = { kinds: [], statuses: [], term: 'all' };

function Drawer({
  item, device, onClose, onChange, toast,
}: { item: Item; device: Device; onClose: () => void; onChange: (patch: Partial<Item>) => void; toast: (t: string) => void }) {
  const [tab, setTab] = useState<'card' | 'chat'>('card');
  const [draft, setDraft] = useState('');
  const [msg, setMsg] = useState('');
  const [dragId, setDragId] = useState<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);
  const uploads = useRef(0);
  const titleId = useId();
  const backRef = useRef<HTMLButtonElement>(null);
  useEffect(() => backRef.current?.focus(), [item.id]);

  const done = item.checklist.filter((c) => c.done).length;
  const setList = (checklist: Check[]) => onChange({ checklist });
  const move = (from: number, to: number) => {
    if (to < 0 || to >= item.checklist.length || from === to) return;
    const next = [...item.checklist];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    setList(next);
  };
  const addCheck = () => {
    const text = draft.trim();
    if (!text) return;
    setList([...item.checklist, ck(text)]);
    setDraft('');
  };
  const upload = (retryId?: number) => {
    const n = uploads.current++;
    const id = retryId ?? Date.now();
    const name = n === 0 ? 'Протокол встречи.pdf' : 'Акт сверки.pdf';
    const fail = n === 1 && retryId === undefined; // вторая загрузка падает — показать ошибку
    const base = retryId ? item.docs.map((d) => (d.id === id ? { ...d, state: 'loading' as const } : d)) : [...item.docs, { id, name, state: 'loading' as const }];
    onChange({ docs: base });
    window.setTimeout(() => {
      onChange({ docs: base.map((d) => (d.id === id ? { ...d, state: fail ? 'error' : 'ok' } : d)) });
      if (!fail) toast('Файл загружен');
    }, 1100);
  };
  const send = () => {
    const text = msg.trim();
    if (!text) return;
    onChange({ comments: [...item.comments, { who: ME, text, time: '10:24' }] });
    setMsg('');
  };

  const comments = (
    <div>
      {item.comments.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-[#64748b]">
          <b className="block text-[14px] font-medium text-[#0f172a]">Список комментариев пуст</b>
          Начните обсуждение ситуации, оставив комментарий
        </p>
      ) : (
        item.comments.map((c, i) => (
          <p key={i} className="nfm-comment">
            <b>{c.who}</b> <span className="text-[12px] text-[#94a3b8]">{c.time}</span>
            <br />
            {c.text}
          </p>
        ))
      )}
      <div className="nfm-composer">
        <input
          className="nf-input"
          placeholder="Сообщение или @ФИО"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          aria-label="Комментарий"
        />
        <button type="button" className="nf-btn nf-btn--primary" onClick={send} disabled={!msg.trim()}>
          Отправить
        </button>
      </div>
    </div>
  );

  const card = (
    <>
      <h4 id={titleId}>{item.title}</h4>
      <dl className="nfm-props">
        <dt>Тип</dt>
        <dd>
          <span className={`nfm-type nfm-type--${item.kind}`}>{KIND_LABEL[item.kind]}</span>
          {item.labels.map((l) => (
            <span key={l} className="nfm-label">
              {l}
            </span>
          ))}
        </dd>
        <dt>Ответственный</dt>
        <dd>
          <Avatar name={item.owner} />
          {item.owner}
        </dd>
        <dt>Участники</dt>
        <dd>{item.members.length ? item.members.map((m) => <Avatar key={m} name={m} />) : <span className="text-[#94a3b8]">Не добавлены</span>}</dd>
        <dt>{item.kind === 'meet' ? 'Дата встречи' : 'Дата выполнения'}</dt>
        <dd>
          {fmt(item.date)} <Due item={item} />
        </dd>
        {item.kind === 'meet' && item.remind && (
          <>
            <dt>Напоминание</dt>
            <dd>
              <button
                type="button"
                role="switch"
                aria-checked={item.remind.on}
                aria-label="Напоминать участникам"
                className="nfm-switch"
                onClick={() => onChange({ remind: { ...item.remind!, on: !item.remind!.on } })}
              />
              {item.remind.on ? (
                <select className="nfm-select" value={item.remind.before} aria-label="Когда напомнить" onChange={(e) => onChange({ remind: { on: true, before: e.target.value } })}>
                  {REMIND.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              ) : (
                <span className="text-[13px] text-[#64748b]">Выключено</span>
              )}
            </dd>
          </>
        )}
        <dt>Документы</dt>
        <dd className="!flex-col !items-start">
          {item.docs.map((d) =>
            d.state === 'error' ? (
              <span key={d.id} className="nfm-file nfm-file--error" role="alert">
                Не удалось загрузить «{d.name}». Файл больше 20 МБ или пропала связь.
                <button type="button" className="nfm-link" onClick={() => upload(d.id)}>
                  Повторить
                </button>
              </span>
            ) : (
              <span key={d.id} className="nfm-file" aria-busy={d.state === 'loading'}>
                {Icon.file}
                {d.name}
                {d.state === 'loading' && <span className="text-[12px] text-[#64748b]">загружается…</span>}
              </span>
            ),
          )}
          <button type="button" className="text-[14px] text-[#94a3b8] hover:text-[#1d23cd]" onClick={() => upload()}>
            Добавить файл
          </button>
        </dd>
      </dl>

      <p className="nfm-section">
        Чек-лист <span className="nfm-id">{done}/{item.checklist.length}</span>
      </p>
      <input
        className="nf-input mt-2"
        placeholder="+ Добавить пункт"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && addCheck()}
        aria-label="Новый пункт чек-листа, Enter — добавить"
      />
      {item.checklist.length === 0 ? (
        <p className="mt-2 text-[13px] text-[#64748b]">Пунктов нет. Добавьте план встречи или шаги задачи.</p>
      ) : (
        <ul className="nfm-check-list">
          {item.checklist.map((c, i) => (
            <li
              key={c.id}
              className={`nfm-check ${c.done ? 'nfm-check--done' : ''} ${dragId === c.id ? 'nfm-check--drag' : ''} ${overId === c.id && dragId !== c.id ? 'nfm-check--over' : ''}`}
              draggable={device === 'desk'}
              onDragStart={() => setDragId(c.id)}
              onDragOver={(e) => {
                e.preventDefault();
                setOverId(c.id);
              }}
              onDrop={() => {
                const from = item.checklist.findIndex((x) => x.id === dragId);
                move(from, i);
                setDragId(null);
                setOverId(null);
              }}
              onDragEnd={() => {
                setDragId(null);
                setOverId(null);
              }}
            >
              <button
                type="button"
                className="nfm-handle"
                aria-label={`Переместить «${c.text}»: стрелки вверх и вниз`}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    move(i, e.key === 'ArrowUp' ? i - 1 : i + 1);
                  }
                }}
              >
                ⠿
              </button>
              <input
                type="checkbox"
                checked={c.done}
                onChange={() => setList(item.checklist.map((x) => (x.id === c.id ? { ...x, done: !x.done } : x)))}
                aria-label={c.text}
              />
              <span>{c.text}</span>
              <button type="button" className="nfm-del" aria-label={`Удалить «${c.text}»`} onClick={() => setList(item.checklist.filter((x) => x.id !== c.id))}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
      {device === 'desk' && (
        <>
          <p className="nfm-section">Комментарии</p>
          {comments}
        </>
      )}
    </>
  );

  return (
    <>
      {device === 'desk' && <div className="nf-overlay" style={{ zIndex: 19 }} onClick={onClose} aria-hidden="true" />}
      <div className="nfm-drawer" role="dialog" aria-modal="true" aria-labelledby={titleId} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
        <div className="nfm-drawer-head">
          <button ref={backRef} type="button" onClick={onClose} aria-label="Закрыть карточку" className="nfm-icon-btn !bg-transparent">
            {Icon.back}
          </button>
          <span className="min-w-0 flex-1 truncate text-[12px] text-[#64748b]">
            #{item.id} · Создано: {ME}
          </span>
          <select
            className={`nfm-select nfm-select--${item.status}`}
            value={item.status}
            aria-label="Статус"
            onChange={(e) => {
              onChange({ status: e.target.value as Status });
              toast(`Статус: ${STATUS_LABEL[e.target.value as Status].toLowerCase()}`);
            }}
          >
            {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        {device === 'mob' && (
          <div className="nfm-tabs" role="tablist">
            <button type="button" role="tab" aria-selected={tab === 'card'} onClick={() => setTab('card')}>
              Карточка
            </button>
            <button type="button" role="tab" aria-selected={tab === 'chat'} onClick={() => setTab('chat')}>
              Комментарии{item.comments.length ? ` · ${item.comments.length}` : ''}
            </button>
          </div>
        )}
        <div className="nfm-drawer-body">{device === 'mob' && tab === 'chat' ? comments : card}</div>
      </div>
    </>
  );
}

export default function MeetingsPrototype() {
  const [device, setDevice] = useState<Device>('desk');
  const [items, setItems] = useState<Item[]>(SEED);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [draftF, setDraftF] = useState<Filters>(NO_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newKind, setNewKind] = useState<Kind>('task');
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('2026-11-12');
  const [newErr, setNewErr] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [summary, setSummary] = useState(false);
  const [toastText, setToastText] = useState('');
  const ids = { filter: useId(), title: useId() };
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!toastText) return;
    const t = window.setTimeout(() => setToastText(''), 2200);
    return () => window.clearTimeout(t);
  }, [toastText]);
  useEffect(() => {
    if (adding) titleRef.current?.focus();
  }, [adding]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((i) => !q || i.title.toLowerCase().includes(q))
      .filter((i) => !filters.kinds.length || filters.kinds.includes(i.kind))
      .filter((i) => !filters.statuses.length || filters.statuses.includes(i.status))
      .filter((i) => filters.term === 'all' || (i.status === 'plan' && daysLeft(i.date) >= 0 && daysLeft(i.date) <= Number(filters.term)))
      .sort((a, b) => {
        if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
        const rank = (s: Status) => (s === 'plan' ? 0 : 1);
        if (rank(a.status) !== rank(b.status)) return rank(a.status) - rank(b.status);
        return (sortAsc ? 1 : -1) * (parse(a.date).getTime() - parse(b.date).getTime());
      });
  }, [items, query, filters, sortAsc]);

  const chips: { key: string; label: string; drop: () => void }[] = [
    ...filters.kinds.map((k) => ({ key: k, label: k === 'meet' ? 'Встречи' : 'Задачи', drop: () => setFilters((f) => ({ ...f, kinds: f.kinds.filter((x) => x !== k) })) })),
    ...filters.statuses.map((s) => ({ key: s, label: STATUS_LABEL[s], drop: () => setFilters((f) => ({ ...f, statuses: f.statuses.filter((x) => x !== s) })) })),
    ...(filters.term !== 'all' ? [{ key: 'term', label: `Срок: ${filters.term} дней`, drop: () => setFilters((f) => ({ ...f, term: 'all' as Term })) }] : []),
  ];
  const resetAll = () => {
    setFilters(NO_FILTERS);
    setQuery('');
  };
  const open = items.find((i) => i.id === openId) ?? null;
  const patch = (id: number, p: Partial<Item>) => setItems((list) => list.map((i) => (i.id === id ? { ...i, ...p } : i)));

  const create = () => {
    if (!newTitle.trim()) {
      setNewErr(true);
      titleRef.current?.focus();
      return;
    }
    const item: Item = {
      id: 456800 + items.length, kind: newKind, title: newTitle.trim(), status: 'plan', date: newDate, owner: ME, members: [], labels: [],
      checklist: [], docs: [], comments: [], remind: newKind === 'meet' ? { on: true, before: 'За 30 минут' } : undefined, isNew: true,
    };
    setItems((l) => [item, ...l.map((i) => ({ ...i, isNew: false }))]);
    setAdding(false);
    setNewTitle('');
    setNewErr(false);
    setToastText(newKind === 'meet' ? 'Встреча создана' : 'Задача создана');
  };

  const toggleIn = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const mob = device === 'mob';

  const list = (
    <div className="min-w-0">
      <h3 className="nfm-title">План встреч и задач</h3>
      <div className="nfm-controls">
        <label className="nfm-search">
          <span className="sr-only">Найти по названию</span>
          <input className="nf-input" placeholder="Найти по названию" value={query} onChange={(e) => setQuery(e.target.value)} />
          {query ? (
            <button type="button" className="nfm-search-clear" aria-label="Очистить поиск" onClick={() => setQuery('')}>
              ✕
            </button>
          ) : (
            <span className="nfm-search-clear" aria-hidden="true">
              {Icon.search}
            </span>
          )}
        </label>
        <button type="button" className="nfm-icon-btn" aria-label={sortAsc ? 'Сортировка: сначала ближайшие. Сменить' : 'Сортировка: сначала дальние. Сменить'} onClick={() => setSortAsc((s) => !s)}>
          {Icon.sort}
        </button>
        <button
          type="button"
          className={mob ? 'nfm-icon-btn' : 'nf-btn nf-btn--secondary'}
          aria-label={mob ? 'Фильтровать' : undefined}
          onClick={() => {
            setDraftF(filters);
            setFilterOpen(true);
          }}
        >
          {Icon.filter}
          {!mob && 'Фильтровать'}
        </button>
      </div>

      {(chips.length > 0 || query) && (
        <div className="nfm-chips" aria-live="polite">
          {chips.map((c) => (
            <span key={c.key} className="nfm-chip">
              {c.label}
              <button type="button" aria-label={`Убрать условие «${c.label}»`} onClick={c.drop}>
                ✕
              </button>
            </span>
          ))}
          <span className="nfm-found">Найдено {visible.length}</span>
          <button type="button" className="nfm-link" onClick={resetAll}>
            Сбросить
          </button>
        </div>
      )}

      {(
        <div className="nfm-sum">
          <button type="button" className="nfm-summary-toggle" aria-expanded={summary} onClick={() => setSummary((s) => !s)}>
            <span className="text-[14px]">Сводка за 2026</span>
            <span aria-hidden="true">{summary ? '⌃' : '⌄'}</span>
          </button>
          {summary && (
            <div className="mt-2">
              <Stats items={items} />
            </div>
          )}
        </div>
      )}

      {adding ? (
        <div className="nfm-form">
          <div className="nfm-seg" role="group" aria-label="Что создать">
            {(['task', 'meet'] as Kind[]).map((k) => (
              <button key={k} type="button" aria-pressed={newKind === k} onClick={() => setNewKind(k)}>
                {KIND_LABEL[k]}
              </button>
            ))}
          </div>
          <label className="nf-field">
            <span className="nf-label" id={ids.title}>
              Название
            </span>
            <input
              ref={titleRef}
              className="nf-input"
              value={newTitle}
              aria-labelledby={ids.title}
              aria-invalid={newErr}
              placeholder={newKind === 'meet' ? 'Например, «Презентация отчётности»' : 'Например, «Проверить ДДС за ноябрь»'}
              onChange={(e) => {
                setNewTitle(e.target.value);
                if (e.target.value.trim()) setNewErr(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && create()}
            />
            {newErr && <span className="nf-desc nf-desc--error block">Введите название — по нему встречу или задачу найдут в списке</span>}
          </label>
          <label className="nf-field">
            <span className="nf-label">{newKind === 'meet' ? 'Дата встречи' : 'Дата выполнения'}</span>
            <input type="date" className="nf-input" value={newDate} min="2026-11-10" onChange={(e) => setNewDate(e.target.value)} />
          </label>
          <div className="mt-3 flex gap-2">
            <button type="button" className="nf-btn nf-btn--primary nf-btn--s" onClick={create}>
              Создать
            </button>
            <button
              type="button"
              className="nf-btn nf-btn--ghost nf-btn--s"
              onClick={() => {
                setAdding(false);
                setNewErr(false);
              }}
            >
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="nfm-add" onClick={() => setAdding(true)}>
          <span className="nfm-add-plus" aria-hidden="true">
            +
          </span>
          Добавить встречу или задачу
        </button>
      )}

      {visible.length === 0 ? (
        <div className="nfm-empty">
          <p className="text-[16px] font-medium text-[#0f172a]">Ничего не нашли</p>
          <p className="mt-1 text-[13px] text-[#64748b]">Измените запрос или сбросьте фильтры — записи никуда не делись.</p>
          <button type="button" className="nf-btn nf-btn--secondary nf-btn--s mt-3" onClick={resetAll}>
            Сбросить фильтры и поиск
          </button>
        </div>
      ) : (
        <div className="nfm-list">
          {visible.map((i) => (
            <Card key={i.id} item={i} onOpen={() => setOpenId(i.id)} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="nfm-device" role="group" aria-label="Версия прототипа">
        <button type="button" aria-pressed={!mob} onClick={() => setDevice('desk')}>
          Десктоп
        </button>
        <button type="button" aria-pressed={mob} onClick={() => setDevice('mob')}>
          Мобильная
        </button>
      </div>
      <div className={`nf nfm-shell nfm-shell--${device}`}>
        <div className="nfm-scroll">
          <header className="nfm-header">
            <span className="nfm-logo" aria-hidden="true">
              НФ
            </span>
            <span className="nfm-company">ООО «Ромашка»</span>
            <span className="nfm-user">
              <Avatar name={ME} />
              {!mob && ME}
            </span>
          </header>
          <div className="nfm-body">
            {list}
            <div className="nfm-side">
              <Stats items={items} />
            </div>
          </div>
        </div>

        {open && (
          <Drawer key={open.id} item={open} device={device} onClose={() => setOpenId(null)} onChange={(p) => patch(open.id, p)} toast={setToastText} />
        )}

        {filterOpen && (
          <Sheet
            device={device}
            title="Фильтры"
            labelId={ids.filter}
            onClose={() => setFilterOpen(false)}
            footer={
              <>
                <button
                  type="button"
                  className="nf-btn nf-btn--primary flex-1"
                  onClick={() => {
                    setFilters(draftF);
                    setFilterOpen(false);
                  }}
                >
                  Применить
                </button>
                <button type="button" className="nf-btn nf-btn--ghost" onClick={() => setDraftF(NO_FILTERS)}>
                  Сбросить все
                </button>
              </>
            }
          >
            <fieldset className="nfm-group">
              <legend>Тип</legend>
              {(['meet', 'task'] as Kind[]).map((k) => (
                <label key={k} className="nfm-opt">
                  <input type="checkbox" checked={draftF.kinds.includes(k)} onChange={() => setDraftF((f) => ({ ...f, kinds: toggleIn(f.kinds, k) }))} />
                  {k === 'meet' ? 'Встречи' : 'Задачи'}
                </label>
              ))}
            </fieldset>
            <fieldset className="nfm-group">
              <legend>Статус</legend>
              {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
                <label key={s} className="nfm-opt">
                  <input type="checkbox" checked={draftF.statuses.includes(s)} onChange={() => setDraftF((f) => ({ ...f, statuses: toggleIn(f.statuses, s) }))} />
                  {STATUS_LABEL[s]}
                </label>
              ))}
            </fieldset>
            <fieldset className="nfm-group !border-0">
              <legend>Срок</legend>
              {(
                [
                  ['all', 'Любой'],
                  ['7', 'Ближайшие 7 дней'],
                  ['30', 'Ближайшие 30 дней'],
                ] as [Term, string][]
              ).map(([v, l]) => (
                <label key={v} className="nfm-opt">
                  <input type="radio" name="nfm-term" checked={draftF.term === v} onChange={() => setDraftF((f) => ({ ...f, term: v }))} />
                  {l}
                </label>
              ))}
            </fieldset>
          </Sheet>
        )}

        {toastText && (
          <div className="nf-toast" role="status">
            {toastText}
          </div>
        )}
      </div>
    </div>
  );
}
