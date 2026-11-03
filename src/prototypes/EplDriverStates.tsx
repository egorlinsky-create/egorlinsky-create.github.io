import { useEffect, useId, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

/**
 * Прототип: состояния электронного путевого листа (ЭПЛ) глазами водителя.
 * Реконструкция логики из кейса для портфолио, не код продукта. Данные демонстрационные.
 * Токены — из дизайн-системы TradeTaxi (design-system-catalog/tokens), заданы локально.
 */

const tt = {
  '--tt-brand': '#ffed00', // color.brand.primary
  '--tt-brand-hover': '#d1a600', // color.button.primary.bg-hover
  '--tt-on-brand': '#1d1d1b', // color.brand.on-primary
  '--tt-text': '#1d1d1b', // color.text.primary
  '--tt-text-2': '#424242', // color.text.secondary
  '--tt-text-3': '#616161', // color.text.tertiary
  '--tt-bg': '#f5f5f5', // color.bg.page
  '--tt-surface': '#ffffff', // color.bg.surface
  '--tt-muted': '#ebebeb', // color.bg.muted
  '--tt-border': '#d6d6d6', // color.border.default
  '--tt-focus': '#2f00ff', // color.border.focus
  '--tt-success': '#11a75c', // color.semantic.success
  '--tt-success-bg': '#eafef5', // color.green.100
  '--tt-error': '#fa5252', // color.semantic.error
  '--tt-error-bg': '#fff5f4', // color.red.100
  '--tt-r-md': '8px',
  '--tt-r-lg': '12px',
  '--tt-r-xl': '16px',
} as CSSProperties;

type Step = 'mileage' | 'pending' | 'active' | 'error' | 'finish' | 'done';
type Outcome = 'success' | 'error';

const PREV_MILEAGE = 124_530;
const fmt = (n: number) => n.toLocaleString('ru-RU');

export default function EplDriverStates() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState<Step>('mileage');
  const [outcome, setOutcome] = useState<Outcome>('success');
  const [startKm, setStartKm] = useState<number | null>(null);
  const [endKm, setEndKm] = useState<number | null>(null);
  const [supportNote, setSupportNote] = useState(false);

  const titles: Record<Step, string> = {
    mileage: 'Пробег при выезде на линию',
    pending: 'Выпускаем путевой лист',
    active: 'Путевой лист активен',
    error: 'Не удалось выпустить путевой лист',
    finish: 'Завершение смены',
    done: 'Смена завершена',
  };

  useEffect(() => {
    if (step !== 'pending') return;
    const t = window.setTimeout(() => setStep(outcome === 'success' ? 'active' : 'error'), reduce ? 600 : 2200);
    return () => window.clearTimeout(t);
  }, [step, outcome, reduce]);

  const reset = () => {
    setSupportNote(false);
    setStep('mileage');
    setStartKm(null);
    setEndKm(null);
  };

  return (
    <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center lg:gap-10">
      {/* Телефон */}
      <div
        style={tt}
        className="w-full max-w-[340px] shrink-0 rounded-[40px] border-[10px] border-[#1d1d1b] bg-[var(--tt-bg)] shadow-xl"
      >
        <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[12px] font-semibold text-[var(--tt-text)]">
          <span>07:42</span>
          <span aria-hidden="true" className="h-5 w-20 rounded-full bg-[#1d1d1b]" />
          <span>4G</span>
        </div>
        <div className="flex min-h-[520px] flex-col px-4 pt-2 pb-5 text-[var(--tt-text)]">
          <p className="text-[13px] text-[var(--tt-text-3)]">Путевой лист</p>
          <p aria-live="polite" className="mt-0.5 text-[20px] leading-tight font-bold">
            {titles[step]}
          </p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, y: reduce ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -6 }}
              transition={{ duration: reduce ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 flex flex-1 flex-col"
            >
              {step === 'mileage' && (
                <MileageForm
                  label="Пробег при выезде на линию"
                  hint={`Прошлое показание при закрытии смены: ${fmt(PREV_MILEAGE)} км`}
                  min={PREV_MILEAGE}
                  minError={`Пробег меньше прошлого показания (${fmt(PREV_MILEAGE)} км). Проверьте цифры на одометре.`}
                  submitLabel="Запросить путевой лист"
                  onSubmit={(km) => {
                    setStartKm(km);
                    setStep('pending');
                  }}
                />
              )}

              {step === 'pending' && (
                <div className="flex flex-1 flex-col">
                  <Card>
                    <div className="flex items-center gap-3">
                      <Spinner reduce={!!reduce} />
                      <div>
                        <p className="text-[15px] font-semibold">Ждём выпуска листа</p>
                        <p className="text-[13px] text-[var(--tt-text-3)]">Это займёт несколько минут. Пришлём уведомление, когда лист станет активным.</p>
                      </div>
                    </div>
                  </Card>
                  <p className="mt-3 text-[13px] text-[var(--tt-text-3)]">Пока лист не активен, выезжать на линию нельзя.</p>
                </div>
              )}

              {step === 'active' && (
                <div className="flex flex-1 flex-col">
                  <Card>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tt-success-bg)] px-2.5 py-1 text-[12px] font-semibold text-[var(--tt-success)]">
                        <span className="size-1.5 rounded-full bg-current" /> Активен
                      </span>
                      <span className="text-[13px] text-[var(--tt-text-3)]">№ 0001 248</span>
                    </div>
                    <div className="mt-4 flex justify-center">
                      <FakeQr />
                    </div>
                    <p className="mt-3 text-center text-[13px] text-[var(--tt-text-2)]">Покажите QR-код инспектору</p>
                    <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--tt-border)] pt-3 text-[13px]">
                      <div>
                        <dt className="text-[var(--tt-text-3)]">Действует до</dt>
                        <dd className="font-semibold">07:40 завтра</dd>
                      </div>
                      <div>
                        <dt className="text-[var(--tt-text-3)]">Осталось</dt>
                        <dd className="font-semibold">23 ч 58 мин</dd>
                      </div>
                      <div>
                        <dt className="text-[var(--tt-text-3)]">Автомобиль</dt>
                        <dd className="font-semibold">А 000 АА 161</dd>
                      </div>
                      <div>
                        <dt className="text-[var(--tt-text-3)]">Пробег при выезде</dt>
                        <dd className="font-semibold">{startKm ? `${fmt(startKm)} км` : '—'}</dd>
                      </div>
                    </dl>
                  </Card>
                  <div className="mt-auto pt-4">
                    <Button variant="secondary" onClick={() => setStep('finish')}>
                      Завершить смену
                    </Button>
                  </div>
                </div>
              )}

              {step === 'error' && (
                <div className="flex flex-1 flex-col">
                  <div role="alert" className="rounded-[var(--tt-r-lg)] border border-[var(--tt-error)]/30 bg-[var(--tt-error-bg)] p-4">
                    <p className="text-[15px] font-semibold">Выезжать на линию нельзя</p>
                    <p className="mt-1 text-[13px] text-[var(--tt-text-2)]">
                      Напишите в поддержку — оператор увидит номер заявки и подскажет, что делать дальше.
                    </p>
                  </div>
                  <div className="mt-auto flex flex-col gap-2 pt-4">
                    {supportNote && (
                      <p className="text-[13px] text-[var(--tt-text-3)]">В продукте здесь откроется чат поддержки. В прототипе он не реализован.</p>
                    )}
                    <Button onClick={() => setSupportNote(true)}>Написать в поддержку</Button>
                    <Button variant="secondary" onClick={() => setStep('pending')}>
                      Запросить ещё раз
                    </Button>
                  </div>
                </div>
              )}

              {step === 'finish' && (
                <MileageForm
                  label="Пробег при завершении смены"
                  hint={`При выезде было: ${fmt(startKm ?? PREV_MILEAGE)} км`}
                  min={startKm ?? PREV_MILEAGE}
                  minError={`Пробег меньше, чем при выезде (${fmt(startKm ?? PREV_MILEAGE)} км). Проверьте цифры на одометре.`}
                  submitLabel="Завершить смену"
                  secondary={{ label: 'Вернуться к листу', onClick: () => setStep('active') }}
                  onSubmit={(km) => {
                    setEndKm(km);
                    setStep('done');
                  }}
                />
              )}

              {step === 'done' && (
                <div className="flex flex-1 flex-col">
                  <Card>
                    <p className="text-[15px] font-semibold">Время и пробег зафиксированы</p>
                    <dl className="mt-3 grid grid-cols-2 gap-3 text-[13px]">
                      <div>
                        <dt className="text-[var(--tt-text-3)]">За смену</dt>
                        <dd className="font-semibold">{startKm && endKm ? `${fmt(endKm - startKm)} км` : '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-[var(--tt-text-3)]">Завершена</dt>
                        <dd className="font-semibold">07:42</dd>
                      </div>
                    </dl>
                  </Card>
                  <p className="mt-3 text-[13px] text-[var(--tt-text-3)]">Следующий лист можно запросить перед выездом.</p>
                  <div className="mt-auto pt-4">
                    <Button variant="secondary" onClick={reset}>
                      Начать заново
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Управление демо */}
      <div className="w-full max-w-[340px] text-[15px] lg:max-w-[260px]">
        <p className="font-semibold">Как пройти</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted">
          <li>Введите пробег меньше {fmt(PREV_MILEAGE)} — увидите ошибку валидации.</li>
          <li>Запросите лист и дождитесь выпуска.</li>
          <li>Переключите исход на «Ошибка», чтобы увидеть сбой и выход в поддержку.</li>
        </ol>
        <fieldset className="mt-5">
          <legend className="text-[13px] font-semibold tracking-wide text-muted uppercase">Исход выпуска</legend>
          <div className="mt-2 inline-flex rounded-full border border-line bg-surface p-1">
            {(['success', 'error'] as const).map((o) => (
              <label
                key={o}
                className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent ${
                  outcome === o ? 'bg-text text-bg' : 'text-muted hover:text-text'
                }`}
              >
                <input type="radio" name="epl-outcome" value={o} checked={outcome === o} onChange={() => setOutcome(o)} className="sr-only" />
                {o === 'success' ? 'Успех' : 'Ошибка'}
              </label>
            ))}
          </div>
        </fieldset>
        <button type="button" onClick={reset} className="mt-5 text-sm font-medium text-accent underline underline-offset-4">
          Сбросить прототип
        </button>
      </div>
    </div>
  );
}

function MileageForm({
  label,
  hint,
  min,
  minError,
  submitLabel,
  secondary,
  onSubmit,
}: {
  label: string;
  hint: string;
  min: number;
  minError: string;
  submitLabel: string;
  secondary?: { label: string; onClick: () => void };
  onSubmit: (km: number) => void;
}) {
  const id = useId();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const digits = value.replace(/\D/g, '');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!digits) return setError('Введите пробег — цифры с одометра, без пробелов.');
    const km = Number(digits);
    if (km < min) return setError(minError);
    if (km - min > 2000) return setError('Пробег больше прошлого на 2 000 км. Проверьте, нет ли лишней цифры.');
    setError(null);
    onSubmit(km);
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-1 flex-col">
      <label htmlFor={id} className="text-[13px] font-semibold text-[var(--tt-text-2)]">
        {label}, км
      </label>
      <input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        placeholder="Например, 124 610"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (error) setError(null);
        }}
        aria-invalid={!!error}
        aria-describedby={`${id}-hint`}
        className={`mt-1.5 h-12 rounded-[var(--tt-r-md)] border bg-[var(--tt-surface)] px-3 text-[17px] font-semibold outline-none focus:border-[var(--tt-focus)] focus:ring-2 focus:ring-[var(--tt-focus)]/20 ${
          error ? 'border-[var(--tt-error)]' : 'border-[var(--tt-border)]'
        }`}
      />
      <p id={`${id}-hint`} className={`mt-1.5 text-[13px] ${error ? 'text-[var(--tt-error)]' : 'text-[var(--tt-text-3)]'}`}>
        {error ?? hint}
      </p>
      <button
        type="button"
        className="mt-3 flex items-center gap-2 self-start rounded-[var(--tt-r-md)] px-1 text-[14px] font-semibold text-[var(--tt-text-2)] underline underline-offset-4"
        onClick={() => {
          setValue(String(min + 84));
          setError(null);
        }}
      >
        Распознать по фото одометра
      </button>
      <p className="mt-1 text-[12px] text-[var(--tt-text-3)]">В прототипе подставит пример значения.</p>
      <div className="mt-auto flex flex-col gap-2 pt-4">
        <Button type="submit">{submitLabel}</Button>
        {secondary && (
          <Button variant="secondary" onClick={secondary.onClick}>
            {secondary.label}
          </Button>
        )}
      </div>
    </form>
  );
}

function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-[var(--tt-r-xl)] border border-[var(--tt-border)] bg-[var(--tt-surface)] p-4">{children}</div>;
}

function Button({
  children,
  variant = 'primary',
  type = 'button',
  onClick,
}: {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit';
  onClick?: () => void;
}) {
  const base =
    'h-12 w-full rounded-[var(--tt-r-lg)] text-[15px] font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--tt-focus)] focus-visible:ring-offset-2';
  const styles =
    variant === 'primary'
      ? 'bg-[var(--tt-brand)] text-[var(--tt-on-brand)] hover:bg-[var(--tt-brand-hover)]'
      : 'border border-[var(--tt-border)] bg-[var(--tt-surface)] text-[var(--tt-text)] hover:bg-[var(--tt-muted)]';
  return (
    <button type={type} onClick={onClick} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

function Spinner({ reduce }: { reduce: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block size-8 shrink-0 rounded-full border-[3px] border-[var(--tt-muted)] border-t-[var(--tt-text)] ${reduce ? '' : 'animate-spin'}`}
    />
  );
}

/** Декоративный «QR»: детерминированный узор, не настоящий код. */
function FakeQr() {
  const size = 21;
  const cells: boolean[] = [];
  let seed = 7;
  for (let i = 0; i < size * size; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    cells.push(seed / 233280 > 0.52);
  }
  const finder = (x: number, y: number) => {
    const inBox = (ox: number, oy: number) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
    for (const [ox, oy] of [
      [0, 0],
      [size - 7, 0],
      [0, size - 7],
    ]) {
      if (inBox(ox, oy)) {
        const dx = x - ox;
        const dy = y - oy;
        const ring = dx === 0 || dy === 0 || dx === 6 || dy === 6;
        const core = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
        return ring || core ? 1 : 0;
      }
    }
    return -1;
  };
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="size-40" role="img" aria-label="QR-код путевого листа (демонстрационный)">
      <rect width={size} height={size} fill="#fff" />
      {cells.map((on, i) => {
        const x = i % size;
        const y = Math.floor(i / size);
        const f = finder(x, y);
        const fill = f === -1 ? on : f === 1;
        return fill ? <rect key={i} x={x} y={y} width={1} height={1} fill="#1d1d1b" /> : null;
      })}
    </svg>
  );
}
