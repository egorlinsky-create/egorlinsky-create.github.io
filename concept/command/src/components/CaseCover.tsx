/**
 * Обложка карточки кейса — сцена из фрагментов реальных интерфейсов кейса. Данные демонстрационные.
 * React-компонент без client:* → Astro отдаёт чистый HTML без JS. Стили — src/styles/covers.css.
 * Новый кейс: добавь сцену в SCENES по slug. Если в frontmatter есть cover и файл лежит в public,
 * CaseCard показывает картинку вместо сцены.
 */
import type { ReactNode } from 'react';

type Tone = 'ok' | 'warn' | 'info' | 'muted';

const Chip = ({ tone, children, end }: { tone: Tone; children: ReactNode; end?: boolean }) => (
  <span className={`cv-chip cv-chip--${tone}`} style={end ? { justifySelf: 'end' } : undefined}>
    {children}
  </span>
);

const Bar = ({ title }: { title: string }) => (
  <div className="cv-win-bar">
    <i />
    <i />
    <i />
    <b>{title}</b>
  </div>
);

function Selection() {
  const rows: [string, string, string, string, boolean][] = [
    ['АК', 'Анна Ким', 'Производство, 1С', 'Загрузка 60%', true],
    ['ИС', 'Илья Соколов', 'Опт, управленка', 'Загрузка 40%', true],
    ['МВ', 'Мария Волкова', 'Производство', 'Загрузка 85%', false],
    ['ДП', 'Денис Петров', 'Ритейл, бюджеты', 'Загрузка 30%', true],
    ['ОЛ', 'Ольга Лис', 'IT, юнит-экономика', 'Загрузка 70%', false],
  ];
  return (
    <div className="cv cv-sel">
      <div className="cv-win">
        <Bar title="Панель распределения" />
        <div className="cv-sel-mode">
          <b>Режим подборки · ООО «Северный ветер»</b>
          <em>В подборке: 3 ФД</em>
        </div>
        <div className="cv-sel-filters">
          <span>Отрасль: производство</span>
          <span>Выручка до 500 млн</span>
          <span>Заявка: открыто</span>
        </div>
        {rows.map(([ini, name, skill, load, inSel]) => (
          <div className="cv-sel-row" data-in={inSel ? '' : undefined} key={name}>
            <span className="cv-sel-add">{inSel ? '✓' : '+'}</span>
            <span className="cv-avatar">{ini}</span>
            <span>
              {name}
              <small>{skill}</small>
            </span>
            <Chip tone="muted">{load}</Chip>
            <span className="cv-line" />
          </div>
        ))}
      </div>
      <div className="cv-win cv-sel-drawer">
        <h4>Подборка сформирована</h4>
        <ul>
          {[
            ['АК', 'Анна Ким'],
            ['ИС', 'Илья Соколов'],
            ['ДП', 'Денис Петров'],
          ].map(([ini, name]) => (
            <li key={name}>
              <span className="cv-avatar">{ini}</span>
              {name}
            </li>
          ))}
        </ul>
        <span className="cv-btn" style={{ width: '100%' }}>
          Создать подборку
        </span>
      </div>
    </div>
  );
}

function Meetings() {
  return (
    <div className="cv cv-meet">
      <div className="cv-win">
        <div className="cv-seg">
          <span>Задача</span>
          <span data-on="">Встреча</span>
        </div>
        <h4>Презентация отчётности за октябрь</h4>
        <div className="cv-meet-meta">
          <span>14 нояб, 11:00</span>
          <span>60 мин</span>
          <Chip tone="info">Презентация отчётности</Chip>
        </div>
        <p className="cv-label">Чек-лист</p>
        <div className="cv-check" data-done="">
          <i>✓</i>
          <span>Сверить ДДС с банком</span>
        </div>
        <div className="cv-check" data-done="">
          <i>✓</i>
          <span>Обновить план-факт</span>
        </div>
        <div className="cv-check">
          <i />
          <span>Согласовать бюджет на Q1</span>
        </div>
        <p className="cv-label">Кто видит</p>
        <div className="cv-vis">
          <div data-on="">
            <b>Совместная</b>
            <small>Видна клиенту</small>
          </div>
          <div>
            <b>Внутренняя</b>
            <small>Только в ERP</small>
          </div>
        </div>
      </div>
      <div className="cv-note cv-n1">
        <b>затруднение</b>План встречи приняли за список задач
      </div>
      <div className="cv-note cv-note--pink cv-n2">
        <b>предложение</b>План, результат и шаги — одно поле
      </div>
      <div className="cv-note cv-note--green cv-n3">
        <b>реакция</b>Переключение «задача / встреча» поняли все 5
      </div>
    </div>
  );
}

const QR = Array.from({ length: 81 }, (_, i) => {
  const x = i % 9;
  const y = Math.floor(i / 9);
  const finder = (ox: number, oy: number) => x >= ox && x < ox + 3 && y >= oy && y < oy + 3;
  if (finder(0, 0) || finder(6, 0) || finder(0, 6)) return true;
  return ((i * 7 + 3) % 5) % 2 === 0;
});

function Epl() {
  const rows: [string, string, number, boolean, Tone, string][] = [
    ['0001 248', 'Kia Rio · А 101 АА', 6, false, 'ok', 'Активен'],
    ['0001 249', 'Skoda Rapid · В 202 ВВ', 4, false, 'info', 'Обработка'],
    ['0001 250', 'VW Polo · К 404 КК', 3, true, 'warn', 'Ошибка'],
    ['0001 251', 'Hyundai Solaris · Е 303 ЕЕ', 6, false, 'ok', 'Активен'],
    ['0001 252', 'Kia K5 · М 505 ММ', 1, false, 'muted', 'Создан'],
    ['0001 253', 'Kia Rio · О 606 ОО', 2, false, 'info', 'Обработка'],
  ];
  return (
    <div className="cv cv-epl">
      <div className="cv-win cv-admin">
        <Bar title="Путевые листы · T1–T6" />
        {rows.map(([num, car, done, err, tone, label]) => (
          <div className="cv-epl-row" key={num}>
            <span>
              № {num}
              <small>до 07:40</small>
            </span>
            <span>
              {car}
              <span className="cv-steps" style={{ marginTop: '0.4em' }}>
                {Array.from({ length: 6 }, (_, i) => (
                  <i key={i} data-on={i < done ? '' : undefined} data-err={err && i === done ? '' : undefined} />
                ))}
              </span>
            </span>
            <Chip tone={tone} end>
              {label}
            </Chip>
          </div>
        ))}
      </div>
      <div className="cv-phone">
        <small>Путевой лист</small>
        <h5>Активен до 07:40</h5>
        <div className="cv-phone-card">
          <Chip tone="ok">● Активен</Chip>
          <div className="cv-qr">
            {QR.map((on, i) => (
              <i key={i} data-off={on ? undefined : ''} />
            ))}
          </div>
          <div className="cv-phone-meta">
            <span>
              Осталось<b>23 ч 58 мин</b>
            </span>
            <span style={{ textAlign: 'right' }}>
              Пробег<b>124 610 км</b>
            </span>
          </div>
        </div>
        <span className="cv-phone-btn">Завершить смену</span>
      </div>
    </div>
  );
}

function Ds() {
  return (
    <div className="cv cv-ds">
      <div className="cv-ds-chain">
        {[
          ['Примитив', 'Colors/Primary/500'],
          ['Семантика · Light / Dark', 'Colors/bg/action/default'],
          ['Компонент', 'Button/Color/Bg/primary'],
        ].map(([level, name]) => (
          <div className="cv-token" key={name}>
            <i />
            <span>
              <small>{level}</small>
              {name}
            </span>
          </div>
        ))}
      </div>
      <div className="cv-ds-themes">
        {(['light', 'dark'] as const).map((t) => (
          <div className={`cv-ds-${t}`} key={t}>
            <small>{t === 'light' ? 'Light' : 'Dark'}</small>
            <span className="cv-btn">Сохранить</span>
            <span className="cv-btn cv-btn--ghost">Отмена</span>
          </div>
        ))}
      </div>
      <div className="cv-fields">
        <span className="cv-field">Default</span>
        <span className="cv-field" data-s="focus">
          Active<span>|</span>
        </span>
        <span className="cv-field" data-s="filled">
          1 250 000 ₽
        </span>
        <span className="cv-field" data-s="error">
          Error<span>!</span>
        </span>
        <span className="cv-field" data-s="disabled">
          Disabled
        </span>
        <span className="cv-field">Hover</span>
      </div>
      <div className="cv-badge">
        <strong>87%</strong>
        <span>экземпляров в макетах ERP — из библиотеки</span>
      </div>
    </div>
  );
}

function Research() {
  const rows: [string, string, Tone, string][] = [
    ['Не сходится баланс за сентябрь', 'Анна Ким', 'warn', 'Новое'],
    ['Доступ к отчёту ДДС', 'Илья Соколов', 'info', 'В работе'],
    ['Перенос встречи по бюджету', 'Денис Петров', 'info', 'В работе'],
    ['Вопрос по налоговой нагрузке', 'Ольга Лис', 'ok', 'Решено'],
    ['Нужна выгрузка для банка', 'Анна Ким', 'ok', 'Решено'],
  ];
  return (
    <div className="cv cv-res">
      <div className="cv-hyp">
        <p>Метка «Входящее обращение» в рисках закроет ручную таблицу</p>
        <b>→ Отдельный реестр и процесс обращений</b>
      </div>
      <div className="cv-win">
        <Bar title="Входящие обращения" />
        {rows.map(([title, who, tone, label]) => (
          <div className="cv-res-row" key={title}>
            <span>{title}</span>
            <span style={{ color: 'var(--cv-muted)' }}>{who}</span>
            <Chip tone={tone} end>
              {label}
            </Chip>
          </div>
        ))}
      </div>
      <div className="cv-note cv-n1">
        <b>14:20 · вывод</b>Обращение не всегда связано с риском
      </div>
      <div className="cv-note cv-note--pink cv-n2">
        <b>затруднение</b>«Взять в работу» нашли только с подсказкой
      </div>
    </div>
  );
}

const SCENES: Record<string, () => ReactNode> = {
  selection: Selection,
  'erp-meetings': Meetings,
  'taxi-epl': Epl,
  'noboring-ds': Ds,
  'research-appeals': Research,
};

export default function CaseCover({ slug, metric, metricLabel }: { slug: string; metric?: string; metricLabel?: string }) {
  const Scene = SCENES[slug];
  if (Scene) return <div aria-hidden="true">{Scene()}</div>;
  return (
    <div className="case-metric" aria-hidden="true">
      <strong>{metric}</strong>
      {metricLabel && <span>{metricLabel}</span>}
    </div>
  );
}
