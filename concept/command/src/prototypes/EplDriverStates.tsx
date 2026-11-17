import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { withBase } from '@/lib/utils';

/**
 * Прототип «Выезд на линию» в приложении водителя Трейд Такси.
 * Экраны, тексты и правила проверки пробега — из макетов TradeTaxi v2 (раздел «Выезд на линию»),
 * карточка ЭПЛ на главной — из макетов «ЭПЛ активен» и «Ошибка выпуска».
 * Ожидание выпуска и QR-шторка — реконструкция для портфолио. Данные демонстрационные.
 */

const tt = {
  '--tt-brand': '#ffe600',
  '--tt-brand-soft': '#fff6a8',
  '--tt-on-brand': '#1d1d1b',
  '--tt-text': '#1d1d1b',
  '--tt-text-2': '#424242',
  '--tt-text-3': '#757575',
  '--tt-bg': '#ffffff',
  '--tt-fill': '#f2f2f2',
  '--tt-border': '#e3e3e3',
  '--tt-slot-bg': '#fffbea',
  '--tt-slot-line': '#e8c400',
  '--tt-info': '#2f6bff',
  '--tt-info-bg': '#eef5ff',
  '--tt-success': '#11a75c',
  '--tt-success-bg': '#eafef5',
  '--tt-warn': '#b27b00',
  '--tt-warn-bg': '#fff8e1',
  '--tt-error': '#f03e3e',
  '--tt-error-bg': '#fff5f4',
} as CSSProperties;

type Screen = 'main' | 'form';
type Epl = 'none' | 'pending' | 'active' | 'error';
type Photo = 'empty' | 'recognizing' | 'recognized' | 'failed';
type Tone = 'info' | 'success' | 'warn' | 'error';

const PREV = 83_545; // пробег при закрытии прошлой смены, как в макетах
const MAX_DELTA = 2_000; // порог «слишком большого» значения — условный для прототипа
const RECOGNIZED = 84_390;
const fmt = (n: number) => n.toLocaleString('ru-RU');

function check(raw: string, firstRun: boolean, touched: boolean): { tone: Tone; lead?: string; text?: string; ok: boolean } {
  const hint = { tone: 'info' as Tone, text: 'Фиксируется по закрытию рейса, если это ваш первый рейс введите текущий пробег' };
  if (!raw) return touched ? { tone: 'error', text: 'Пробег не может быть пустым', ok: false } : { ...hint, ok: false };
  const km = Number(raw);
  if (km === 0) return { tone: 'error', text: 'Значение не может быть нулем', ok: false };
  if (firstRun) return { ...hint, ok: true };
  const d = km - PREV;
  if (d < 0) return { tone: 'error', lead: `−${fmt(-d)} км`, text: 'Не может быть меньше текущего пробега', ok: false };
  if (d === 0) return { tone: 'warn', text: 'Пробег не изменился с закрытия смены', ok: true };
  if (d > MAX_DELTA) return { tone: 'error', lead: `+${fmt(d)} км`, text: 'Слишком большое значение. Проверьте введенную информацию', ok: false };
  return { tone: 'success', lead: `+${fmt(d)} км`, ok: true };
}

export default function EplDriverStates() {
  const reduce = !!useReducedMotion();
  const [screen, setScreen] = useState<Screen>('main');
  const [epl, setEpl] = useState<Epl>('none');
  const [firstRun, setFirstRun] = useState(false);
  const [photoOk, setPhotoOk] = useState(true);
  const [issueOk, setIssueOk] = useState(true);
  const [mileage, setMileage] = useState(PREV);
  const [qr, setQr] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (epl !== 'pending') return;
    const t = window.setTimeout(() => setEpl(issueOk ? 'active' : 'error'), reduce ? 700 : 2400);
    return () => window.clearTimeout(t);
  }, [epl, issueOk, reduce]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const reset = () => {
    setScreen('main');
    setEpl('none');
    setMileage(PREV);
    setQr(false);
    setToast(null);
  };

  const slide = (dir: number) => ({
    initial: { opacity: 0, x: reduce ? 0 : 24 * dir },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: reduce ? 0 : -24 * dir },
    transition: { duration: reduce ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center lg:gap-10">
      <div
        style={tt}
        className="relative h-[740px] w-full max-w-[360px] shrink-0 overflow-hidden rounded-[44px] border-[10px] border-[#1d1d1b] bg-[var(--tt-bg)] text-[var(--tt-text)] shadow-xl"
      >
        <StatusBar />
        <AnimatePresence mode="wait" initial={false}>
          {screen === 'main' ? (
            <motion.div key="main" {...slide(-1)} className="absolute inset-x-0 top-11 bottom-0 flex flex-col">
              <MainScreen
                epl={epl}
                mileage={mileage}
                onRequest={() => setScreen('form')}
                onQr={() => setQr(true)}
                onSupport={() => setToast('В продукте здесь откроется чат поддержки с номером ЭПЛ')}
              />
            </motion.div>
          ) : (
            <motion.div key={`form-${firstRun}`} {...slide(1)} className="absolute inset-x-0 top-11 bottom-0 flex flex-col">
              <FormScreen
                firstRun={firstRun}
                photoOk={photoOk}
                reduce={reduce}
                onBack={() => setScreen('main')}
                onNext={(km) => {
                  setMileage(km);
                  setEpl('pending');
                  setScreen('main');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {qr && <QrSheet reduce={reduce} onClose={() => setQr(false)} />}
        </AnimatePresence>

        <AnimatePresence>
          {toast && (
            <motion.p
              role="status"
              initial={{ opacity: 0, y: reduce ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-4 bottom-28 rounded-xl bg-[#1d1d1b] px-4 py-3 text-[13px] leading-snug text-white"
            >
              {toast}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Управление демо */}
      <div className="w-full max-w-[360px] text-[15px] lg:max-w-[280px]">
        <p className="font-semibold">Что попробовать</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted">
          <li>«Запросить ЭПЛ» → сфотографировать тахограф: пробег подставится сам.</li>
          <li>Ввести пробег вручную: меньше {fmt(PREV)}, ноль, пусто или больше на {fmt(MAX_DELTA)}+ км.</li>
          <li>«Далее» → дождаться выпуска и открыть QR-код.</li>
        </ol>

        <div className="mt-5 grid gap-4">
          <Toggle label="Рейс" value={firstRun} onChange={setFirstRun} options={[[false, 'Не первый'], [true, 'Первый']]} />
          <Toggle label="Фото тахографа" value={photoOk} onChange={setPhotoOk} options={[[true, 'Распознано'], [false, 'Не распознано']]} />
          <Toggle label="Выпуск ЭПЛ" value={issueOk} onChange={setIssueOk} options={[[true, 'Успех'], [false, 'Ошибка']]} />
        </div>

        <button type="button" onClick={reset} className="mt-5 text-sm font-medium text-accent underline underline-offset-4">
          Сбросить прототип
        </button>
        <p className="mt-4 text-[13px] leading-snug text-muted">
          Порог «слишком большого» пробега в прототипе условный. Камера и чат поддержки не подключены.
        </p>
      </div>
    </div>
  );
}

/* ——— Экраны ——— */

function MainScreen({
  epl,
  mileage,
  onRequest,
  onQr,
  onSupport,
}: {
  epl: Epl;
  mileage: number;
  onRequest: () => void;
  onQr: () => void;
  onSupport: () => void;
}) {
  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--tt-border)] px-4">
        <img src={withBase('/images/taxi-epl/epl-proto-logo.webp')} alt="" width={40} height={40} className="size-10 rounded-full" />
        <p className="min-w-0 flex-1 truncate text-[15px] font-semibold">Константинопольский Константин</p>
        <span className="relative" aria-label="Уведомления: 1">
          <Icon d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          <span className="absolute -top-1.5 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--tt-error)] px-1 text-[10px] font-semibold text-white">
            1
          </span>
        </span>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 pt-5 pb-4">
        {epl === 'none' && (
          <button type="button" onClick={onRequest} className={btn('primary')}>
            Запросить ЭПЛ
          </button>
        )}
        {epl !== 'none' && <EplCard epl={epl} onQr={onQr} onSupport={onSupport} />}

        <section className="rounded-2xl border border-[var(--tt-border)] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[17px] font-bold">BelGee X50, 2024</p>
              <p className="mt-2 inline-flex overflow-hidden rounded-md bg-[var(--tt-brand)] text-[13px] font-semibold">
                <span className="px-2 py-0.5">А 123 МР</span>
                <span className="border-l border-[#1d1d1b]/15 px-2 py-0.5">777</span>
              </p>
            </div>
            <img src={withBase('/images/taxi-epl/epl-proto-car.webp')} alt="" width={64} height={64} className="size-16 rounded-full object-cover" />
          </div>
          <hr className="my-4 border-[var(--tt-border)]" />
          <InfoRow icon="M12 14l4-4M3.34 19a10 10 0 1 1 17.32 0" label="Текущий пробег" value={`${fmt(mileage)} км`} />
          <InfoRow
            icon="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"
            label="Подразделение"
            value="Краснобогатырская 89 стр1 (Преображенская)"
          />
        </section>
      </div>

      <TabBar />
    </>
  );
}

function EplCard({ epl, onQr, onSupport }: { epl: Exclude<Epl, 'none'>; onQr: () => void; onSupport: () => void }) {
  const chip = {
    pending: ['Выпускается', 'bg-[var(--tt-fill)] text-[var(--tt-text-2)]'],
    active: ['Активен', 'bg-[var(--tt-success-bg)] text-[var(--tt-success)]'],
    error: ['Ошибка выпуска', 'bg-[var(--tt-error-bg)] text-[var(--tt-error)]'],
  }[epl];
  return (
    <section className="rounded-2xl border border-[var(--tt-border)] p-4" aria-live="polite">
      <div className="flex items-center justify-between">
        <p className="text-[17px] font-bold">ЭПЛ-2005934</p>
        <span className={`rounded-md px-1.5 py-0.5 text-[12px] font-medium ${chip[1]}`}>{chip[0]}</span>
      </div>

      {epl === 'pending' && (
        <div className="mt-3 flex items-start gap-3 rounded-xl bg-[var(--tt-fill)] p-3">
          <Spinner />
          <p className="text-[13px] leading-snug text-[var(--tt-text-2)]">
            Лист оформляется. Пришлём уведомление, когда он станет активным — до этого выезжать нельзя.
          </p>
        </div>
      )}

      {epl === 'active' && (
        <>
          <div className="mt-3 flex items-center justify-between rounded-xl border border-[var(--tt-border)] px-4 py-2.5">
            <TimePoint time="08:00" date="06.06" />
            <div className="flex-1 px-3 text-center">
              <p className="text-[12px] font-medium">11 ч. 59 мин.</p>
              <span className="my-0.5 block h-px bg-[var(--tt-border)]" aria-hidden="true" />
              <p className="text-[12px] text-[var(--tt-text-3)]">До завершения</p>
            </div>
            <TimePoint time="20:00" date="06.06" />
          </div>
          <button type="button" onClick={onQr} className={`mt-3 ${btn('secondary')}`}>
            QR Код
          </button>
        </>
      )}

      {epl === 'error' && (
        <button type="button" onClick={onSupport} className={`mt-3 ${btn('secondary')}`}>
          Написать в поддержку
        </button>
      )}
    </section>
  );
}

function FormScreen({
  firstRun,
  photoOk,
  reduce,
  onBack,
  onNext,
}: {
  firstRun: boolean;
  photoOk: boolean;
  reduce: boolean;
  onBack: () => void;
  onNext: (km: number) => void;
}) {
  const id = useId();
  const [raw, setRaw] = useState(firstRun ? '' : String(PREV));
  const [touched, setTouched] = useState(false);
  const [photo, setPhoto] = useState<Photo>('empty');
  const timer = useRef<number>(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const busy = photo === 'recognizing';
  const state = check(raw, firstRun, touched && !busy);
  const canGo = state.ok && !busy;
  const invalid = state.tone === 'error';

  const shoot = () => {
    setPhoto('recognizing');
    timer.current = window.setTimeout(
      () => {
        if (photoOk) {
          setPhoto('recognized');
          setRaw(String(RECOGNIZED));
          setTouched(true);
        } else setPhoto('failed');
      },
      reduce ? 600 : 1800,
    );
  };

  return (
    <>
      <header className="flex h-14 shrink-0 items-center border-b border-[var(--tt-border)] px-2">
        <button type="button" onClick={onBack} aria-label="Назад на главную" className="grid size-10 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--tt-info)]">
          <Icon d="M19 12H5M12 19l-7-7 7-7" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-4">
        <h3 className="text-[24px] leading-tight font-bold">Выехать на линию</h3>
        <p className="mt-1 text-[13px] leading-snug text-[var(--tt-text-3)]">Выезд на линию доступен только при наличии электронного путевого листа</p>

        <div className="mt-6">
          {photo === 'empty' ? (
            <button
              type="button"
              onClick={shoot}
              className="flex w-full flex-col items-center rounded-xl border border-dashed border-[var(--tt-slot-line)] bg-[var(--tt-slot-bg)] px-4 py-4 outline-none focus-visible:ring-2 focus-visible:ring-[var(--tt-info)]"
            >
              <span className="grid size-10 place-items-center rounded-full bg-[var(--tt-brand)]">
                <Icon d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3zM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" size={20} />
              </span>
              <span className="mt-2.5 text-[15px] font-medium">Сфотографировать тахограф</span>
              <span className="mt-1 text-[12px] text-[var(--tt-text-3)]">Мы автоматически распознаем пробег</span>
            </button>
          ) : (
            <PhotoItem photo={photo} onDelete={() => setPhoto('empty')} />
          )}
        </div>

        <label htmlFor={id} className="mt-6 block text-[15px]">
          Пробег при выезде на линию, км <span className="text-[var(--tt-info)]">*</span>
        </label>
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          placeholder={touched ? '' : '0'}
          value={raw ? fmt(Number(raw)) : ''}
          disabled={busy}
          onChange={(e) => {
            setRaw(e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 7));
            setTouched(true);
          }}
          aria-invalid={invalid}
          aria-describedby={`${id}-inf`}
          className={`mt-2 h-12 w-full rounded-xl border-2 text-center text-[18px] font-bold tabular-nums outline-none transition-colors placeholder:text-[var(--tt-text)] disabled:opacity-60 ${
            invalid
              ? 'border-[var(--tt-error)] bg-[var(--tt-bg)]'
              : raw
                ? 'border-[var(--tt-brand)] bg-[var(--tt-bg)]'
                : 'border-transparent bg-[var(--tt-fill)] focus:border-[var(--tt-brand)] focus:bg-[var(--tt-bg)]'
          }`}
        />
        <Informer id={`${id}-inf`} tone={state.tone} lead={state.lead} text={state.text} />
      </div>

      <footer className="shrink-0 border-t border-[var(--tt-border)] px-4 pt-3 pb-6">
        {!firstRun && (
          <p className="mb-3 flex items-center justify-between text-[13px] text-[var(--tt-text-3)]">
            Пробег при закрытии смены <span className="text-[15px] font-semibold text-[var(--tt-text)]">{fmt(PREV)} км</span>
          </p>
        )}
        <button type="button" disabled={!canGo} onClick={() => onNext(Number(raw))} className={btn('primary')}>
          Далее
        </button>
      </footer>
    </>
  );
}

function PhotoItem({ photo, onDelete }: { photo: Exclude<Photo, 'empty'>; onDelete: () => void }) {
  const failed = photo === 'failed';
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-2 ${failed ? 'border-[var(--tt-error)]/25 bg-[var(--tt-error-bg)]' : 'border-[var(--tt-slot-line)]/40 bg-[var(--tt-slot-bg)]'}`}
      aria-live="polite"
    >
      <span className={`grid size-10 shrink-0 place-items-center rounded-lg text-[12px] font-medium ${failed ? 'bg-[#ffe0dc]' : 'bg-[var(--tt-brand-soft)]'}`}>JPG</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px]">Photo-2134.jpg</p>
        <p className={`flex items-center gap-1 text-[12px] ${failed ? 'text-[var(--tt-error)]' : 'text-[var(--tt-text-3)]'}`}>
          {photo === 'recognizing' && <Spinner small />}
          {photo === 'recognizing' && 'Идёт распознавание'}
          {photo === 'recognized' && `Мы распознали ${fmt(RECOGNIZED)} км`}
          {failed && 'Пробег не распознан'}
        </p>
      </div>
      {photo !== 'recognizing' && (
        <button
          type="button"
          onClick={onDelete}
          aria-label="Удалить фото и снять заново"
          className="grid size-10 place-items-center rounded-full text-[var(--tt-error)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--tt-info)]"
        >
          <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" size={18} />
        </button>
      )}
    </div>
  );
}

function Informer({ id, tone, lead, text }: { id: string; tone: Tone; lead?: string; text?: string }) {
  const c = {
    info: 'bg-[var(--tt-info-bg)] text-[var(--tt-info)]',
    success: 'bg-[var(--tt-success-bg)] text-[var(--tt-success)]',
    warn: 'bg-[var(--tt-warn-bg)] text-[var(--tt-warn)]',
    error: 'bg-[var(--tt-error-bg)] text-[var(--tt-error)]',
  }[tone];
  return (
    <div id={id} role={tone === 'error' ? 'alert' : undefined} className={`mt-2 flex gap-2 rounded-lg px-2 py-2 text-[13px] leading-snug ${c}`}>
      <Icon d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8v4M12 16h.01" size={16} />
      <p>
        {lead && <span className="block font-semibold">{lead}</span>}
        {text && <span className={tone === 'success' ? '' : 'text-[var(--tt-text-2)]'}>{text}</span>}
      </p>
    </div>
  );
}

function QrSheet({ reduce, onClose }: { reduce: boolean; onClose: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    ref.current?.focus();
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', k, true);
    return () => document.removeEventListener('keydown', k, true);
  }, [onClose]);
  return (
    <motion.div className="absolute inset-0 z-10 flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button type="button" aria-label="Закрыть" tabIndex={-1} onClick={onClose} className="absolute inset-0 bg-black/40" />
      <motion.div
        role="dialog"
        aria-label="QR-код путевого листа"
        initial={{ y: reduce ? 0 : '100%' }}
        animate={{ y: 0 }}
        exit={{ y: reduce ? 0 : '100%' }}
        transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full rounded-t-3xl bg-[var(--tt-bg)] px-4 pt-3 pb-8"
      >
        <span className="mx-auto block h-1 w-10 rounded-full bg-[var(--tt-border)]" aria-hidden="true" />
        <p className="mt-4 text-[17px] font-bold">ЭПЛ-2005934</p>
        <p className="text-[13px] text-[var(--tt-text-3)]">Действует до 20:00, 06.06</p>
        <div className="mt-4 flex justify-center">
          <FakeQr />
        </div>
        <p className="mt-3 text-center text-[13px] text-[var(--tt-text-2)]">Покажите код инспектору на линии</p>
        <button ref={ref} type="button" onClick={onClose} className={`mt-5 ${btn('secondary')}`}>
          Закрыть
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ——— Мелкие части ——— */

function StatusBar() {
  return (
    <div className="flex h-11 items-center justify-between px-6 text-[14px] font-semibold" aria-hidden="true">
      <span>9:41</span>
      <span className="flex items-center gap-1.5">
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="1" /><rect x="4.5" y="5" width="3" height="6" rx="1" /><rect x="9" y="2.5" width="3" height="8.5" rx="1" /><rect x="13.5" y="0" width="3" height="11" rx="1" /></svg>
        <svg width="24" height="11" viewBox="0 0 24 11" fill="none"><rect x=".5" y=".5" width="20" height="10" rx="3" stroke="currentColor" opacity=".4" /><rect x="2" y="2" width="17" height="7" rx="1.5" fill="currentColor" /></svg>
      </span>
    </div>
  );
}

function TabBar() {
  const tabs: [string, string][] = [
    ['Главная', 'M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z'],
    ['Штрафы', 'M6 2h12v20l-3-2-3 2-3-2-3 2zM9 7h6M9 11h6'],
    ['ЭПЛ', 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5'],
    ['Профиль', 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6M6.2 18.6a7 7 0 0 1 11.6 0'],
  ];
  return (
    <nav className="shrink-0 px-3 pt-1 pb-4" aria-hidden="true">
      <div className="grid grid-cols-4 rounded-full bg-[var(--tt-fill)] p-1.5">
        {tabs.map(([label, d], i) => (
          <span key={label} className={`flex h-14 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] ${i === 0 ? 'bg-[var(--tt-brand)]' : 'text-[var(--tt-text-2)]'}`}>
            <Icon d={d} size={20} />
            {label}
          </span>
        ))}
      </div>
    </nav>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="mt-3 flex items-start gap-3 first-of-type:mt-0">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--tt-fill)]">
        <Icon d={icon} size={20} />
      </span>
      <div>
        <p className="text-[13px] text-[var(--tt-text-3)]">{label}</p>
        <p className="text-[15px] leading-snug">{value}</p>
      </div>
    </div>
  );
}

function TimePoint({ time, date }: { time: string; date: string }) {
  return (
    <div className="text-center">
      <p className="text-[17px] font-medium tabular-nums">{time}</p>
      <p className="text-[12px] text-[var(--tt-text-3)]">{date}</p>
    </div>
  );
}

function Toggle<T extends boolean>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <fieldset>
      <legend className="text-[13px] text-muted">{label}</legend>
      <div className="mt-1.5 inline-flex rounded-full border border-line bg-surface p-1">
        {options.map(([v, l]) => (
          <button
            key={l}
            type="button"
            aria-pressed={value === v}
            onClick={() => onChange(v)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${value === v ? 'bg-text text-bg' : 'text-muted hover:text-text'}`}
          >
            {l}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function btn(v: 'primary' | 'secondary') {
  const base = 'h-12 w-full rounded-xl text-[16px] font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--tt-info)] focus-visible:ring-offset-2';
  return v === 'primary'
    ? `${base} bg-[var(--tt-brand)] text-[var(--tt-on-brand)] hover:brightness-95 disabled:bg-[var(--tt-brand-soft)] disabled:text-[#1d1d1b]/35 disabled:hover:brightness-100`
    : `${base} bg-[var(--tt-fill)] text-[var(--tt-text-2)] hover:bg-[var(--tt-border)]`;
}

function Icon({ d, size = 22 }: { d: string; size?: number }): ReactNode {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
      <path d={d} />
    </svg>
  );
}

function Spinner({ small }: { small?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 animate-spin rounded-full border-2 border-[var(--tt-border)] border-t-[var(--tt-text)] motion-reduce:animate-none ${small ? 'size-3' : 'mt-0.5 size-5'}`}
    />
  );
}

/** Декоративный «QR»: детерминированный узор, не настоящий код. */
function FakeQr() {
  const size = 25;
  const cells: boolean[] = [];
  let seed = 11;
  for (let i = 0; i < size * size; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    cells.push(seed / 233280 > 0.5);
  }
  const finder = (x: number, y: number) => {
    for (const [ox, oy] of [
      [0, 0],
      [size - 7, 0],
      [0, size - 7],
    ]) {
      if (x >= ox && x < ox + 7 && y >= oy && y < oy + 7) {
        const dx = x - ox;
        const dy = y - oy;
        return dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4) ? 1 : 0;
      }
      if (x >= ox - 1 && x <= ox + 7 && y >= oy - 1 && y <= oy + 7) return 0;
    }
    return -1;
  };
  return (
    <svg viewBox={`-1 -1 ${size + 2} ${size + 2}`} className="size-48" role="img" aria-label="QR-код путевого листа (демонстрационный)">
      <rect x="-1" y="-1" width={size + 2} height={size + 2} fill="#fff" />
      {cells.map((on, i) => {
        const x = i % size;
        const y = Math.floor(i / size);
        const f = finder(x, y);
        const fill = f === -1 ? on : f === 1;
        return fill ? <rect key={i} x={x} y={y} width="1" height="1" fill="#1d1d1b" /> : null;
      })}
    </svg>
  );
}
