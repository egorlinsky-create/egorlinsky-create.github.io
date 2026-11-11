import { useState } from 'react';

/**
 * Стенд токенов Noboring DS: компонентный токен → семантическая роль → примитив.
 * Цепочки и значения — из alias-привязок библиотеки (см. кейс). Переключение темы
 * меняет только последнее звено: компонент и роль остаются теми же.
 */

type Theme = 'light' | 'dark';
type Chain = {
  id: string;
  part: string;
  component: string;
  semantic: string;
  primitive: Record<Theme, { name: string; hex: string }>;
};

const CHAINS: Chain[] = [
  {
    id: 'bg-primary',
    part: 'Фон основной кнопки',
    component: 'Button/Color/Bg/primary/default',
    semantic: 'Colors/bg/action/default',
    primitive: { light: { name: 'Primary/500', hex: '#1D23CD' }, dark: { name: 'Primary/400', hex: '#4B50D8' } },
  },
  {
    id: 'text-primary',
    part: 'Текст основной кнопки',
    component: 'Button/Color/Text/primary/default',
    semantic: 'Colors/text/primary/-on-action-primary',
    primitive: { light: { name: 'Basic/-white', hex: '#FFFFFF' }, dark: { name: 'Basic/-white', hex: '#FFFFFF' } },
  },
  {
    id: 'bg-secondary',
    part: 'Фон вторичной кнопки',
    component: 'Button/Color/Bg/secondary/default',
    semantic: 'Colors/bg/secondary/default',
    primitive: { light: { name: 'Primary/50', hex: '#E7E8F9' }, dark: { name: 'Primary/900', hex: '#060728' } },
  },
];

// Подложка превью условная: в кейсе её значения не приводятся
const STAGE: Record<Theme, string> = { light: '#FFFFFF', dark: '#1E1E24' };

export default function TokenChain() {
  const [theme, setTheme] = useState<Theme>('light');
  const [hover, setHover] = useState<string | null>(null);
  const v = (id: string) => CHAINS.find((c) => c.id === id)!.primitive[theme].hex;
  const dim = (id: string) => (hover && hover !== id ? 'opacity-40' : 'opacity-100');

  return (
    <div className="not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-line bg-surface p-[3px]" role="group" aria-label="Тема">
          {(['light', 'dark'] as Theme[]).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={theme === t}
              onClick={() => setTheme(t)}
              className={`h-8 rounded-full px-4 text-sm transition-colors ${theme === t ? 'bg-text text-bg' : 'text-muted hover:text-text'}`}
            >
              {t === 'light' ? 'Light' : 'Dark'}
            </button>
          ))}
        </div>
        <p className="text-[13px] text-muted">Режим есть только у семантики — компонентный токен не знает о теме</p>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_200px]">
        <ol className="grid gap-2">
          {CHAINS.map((c) => {
            const p = c.primitive[theme];
            return (
              <li
                key={c.id}
                onMouseEnter={() => setHover(c.id)}
                onMouseLeave={() => setHover(null)}
                className={`rounded-xl border border-line bg-surface p-3 transition-opacity ${dim(c.id)}`}
              >
                <p className="text-[13px] text-muted">{c.part}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[12px] leading-5">
                  <span className="rounded-md bg-surface-2 px-2 py-0.5">{c.component}</span>
                  <span aria-hidden="true" className="text-muted">→</span>
                  <span className="rounded-md bg-surface-2 px-2 py-0.5">{c.semantic}</span>
                  <span aria-hidden="true" className="text-muted">→</span>
                  <span key={`${c.id}-${theme}`} className="tc-swap inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-0.5">
                    <i className="inline-block size-3 rounded-sm border border-line" style={{ background: p.hex }} aria-hidden="true" />
                    {p.name} <span className="text-muted">{p.hex}</span>
                  </span>
                </div>
              </li>
            );
          })}
        </ol>

        <div
          className="flex flex-col items-center justify-center gap-3 rounded-xl border border-line p-5 transition-colors duration-300"
          style={{ background: STAGE[theme] }}
          aria-label={`Превью кнопок, тема ${theme === 'light' ? 'Light' : 'Dark'}`}
        >
          <span
            className={`inline-flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-[background-color,opacity] duration-300 ${hover === 'bg-secondary' ? 'opacity-40' : ''}`}
            style={{ background: v('bg-primary'), color: v('text-primary') }}
          >
            Основная
          </span>
          <span
            className={`inline-flex h-10 w-full items-center justify-center rounded-lg border text-sm transition-[background-color,opacity] duration-300 ${hover && hover !== 'bg-secondary' ? 'opacity-40' : ''}`}
            style={{ background: v('bg-secondary'), borderColor: 'rgb(127 127 127 / 0.25)', color: theme === 'light' ? '#1D23CD' : '#E7E8F9' }}
          >
            Вторичная
          </span>
          <p className="text-center text-[11px] leading-4" style={{ color: theme === 'light' ? '#64748b' : '#94a3b8' }}>
            Подложка и текст вторичной кнопки — условные, остальное из библиотеки
          </p>
        </div>
      </div>
    </div>
  );
}
