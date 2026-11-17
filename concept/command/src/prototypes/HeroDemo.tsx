import { useEffect, useRef, useState } from 'react';

/**
 * Hero-демо «задача агенту → интерфейс из компонентов дизайн-системы».
 * Иллюстрация процесса, не запись реального агента. Данные демонстрационные.
 * Без анимационных библиотек: шаги — состояние React, переходы — CSS (.hd-*) в global.css.
 */

const PROMPT =
  'Собери кабинет таксопарка: список автомобилей, фильтр по статусу и карточку с причиной статуса. Компоненты — из дизайн-системы.';

const CHECKS = ['Токены дизайн-системы', 'Table, StatusBadge, Drawer', 'Состояния: пусто, загрузка, ошибка'];

const ROWS = [
  { car: 'Kia Rio · А 101 АА', status: 'На линии', tone: 'ok' },
  { car: 'Skoda Rapid · В 202 ВВ', status: 'Не готов', tone: 'warn' },
  { car: 'Hyundai Solaris · Е 303 ЕЕ', status: 'На линии', tone: 'ok' },
  { car: 'VW Polo · К 404 КК', status: 'В ремонте', tone: 'muted' },
] as const;

// Таймлайн, мс от старта цикла
const T = {
  typeEnd: 2600,
  checks: [3000, 3400, 3800],
  frame: 4300,
  rows: [4700, 4900, 5100, 5300],
  select: 6300,
  drawer: 6700,
  end: 11000,
};

type Phase = { typed: number; checks: number; frame: boolean; rows: number; selected: boolean; drawer: boolean };

const FINAL: Phase = { typed: PROMPT.length, checks: CHECKS.length, frame: true, rows: ROWS.length, selected: true, drawer: true };
const START: Phase = { typed: 0, checks: 0, frame: false, rows: 0, selected: false, drawer: false };

function phaseAt(t: number): Phase {
  return {
    typed: Math.min(PROMPT.length, Math.floor((t / T.typeEnd) * PROMPT.length)),
    checks: T.checks.filter((x) => t >= x).length,
    frame: t >= T.frame,
    rows: T.rows.filter((x) => t >= x).length,
    selected: t >= T.select,
    drawer: t >= T.drawer,
  };
}

export default function HeroDemo() {
  const [reduce, setReduce] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [phase, setPhase] = useState<Phase>(START);
  const elapsed = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduce(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (reduce) {
      setPhase(FINAL);
      return;
    }
    if (!playing) return;
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      elapsed.current += now - last;
      last = now;
      if (elapsed.current > T.end) elapsed.current = 0;
      const next = phaseAt(elapsed.current);
      setPhase((prev) =>
        prev.typed === next.typed && prev.checks === next.checks && prev.rows === next.rows && prev.frame === next.frame && prev.drawer === next.drawer && prev.selected === next.selected
          ? prev
          : next,
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, reduce]);

  const typing = phase.typed < PROMPT.length;

  return (
    <figure className="hd" aria-label="Иллюстрация: агент собирает интерфейс из компонентов дизайн-системы">
      <div className="hd-window">
        <div className="hd-bar" aria-hidden="true">
          <span />
          <span />
          <span />
          <p>Агент · прототип</p>
        </div>

        <div className="hd-chat">
          <div className="hd-prompt">
            <span className="hd-label">Задача</span>
            <p>
              {PROMPT.slice(0, phase.typed)}
              {typing && <i className="hd-caret" aria-hidden="true" />}
            </p>
          </div>
          <ul className="hd-checks">
            {CHECKS.map((c, i) => (
              <li key={c} data-on={i < phase.checks}>
                <span aria-hidden="true">✓</span>
                {c}
              </li>
            ))}
          </ul>
        </div>

        <div className="hd-ui" data-on={phase.frame} aria-hidden={!phase.frame}>
          <div className="hd-ui-head">
            <b>Автомобили</b>
            <div className="hd-chips">
              <span data-active="true">Все</span>
              <span>На линии</span>
              <span>Не готов</span>
            </div>
          </div>
          <ul className="hd-rows">
            {ROWS.map((r, i) => (
              <li key={r.car} data-on={i < phase.rows} data-selected={phase.selected && i === 1}>
                <span>{r.car}</span>
                <em data-tone={r.tone}>{r.status}</em>
              </li>
            ))}
          </ul>

          <aside className="hd-drawer" data-on={phase.drawer}>
            <b>Skoda Rapid · В 202 ВВ</b>
            <em data-tone="warn">Не готов</em>
            <dl>
              <dt>Причина</dt>
              <dd>Истёк полис ОСАГО</dd>
              <dt>Кто продолжит</dt>
              <dd>Менеджер парка</dd>
              <dt>Условие выхода</dt>
              <dd>Загрузить новый полис</dd>
            </dl>
            <button type="button" tabIndex={-1}>
              Загрузить полис
            </button>
          </aside>
        </div>
      </div>

      <figcaption className="hd-caption">
        <span>Задача агенту → экран из компонентов дизайн-системы. Иллюстрация процесса, данные демонстрационные.</span>
        {!reduce && (
          <button type="button" onClick={() => setPlaying((p) => !p)} aria-pressed={!playing}>
            {playing ? 'Пауза' : 'Продолжить'}
          </button>
        )}
      </figcaption>
    </figure>
  );
}
