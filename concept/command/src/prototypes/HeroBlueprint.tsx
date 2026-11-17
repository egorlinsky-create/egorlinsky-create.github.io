import { useEffect, useRef } from 'react';

/**
 * Фон hero: интерфейсные компоненты на сетке для command;
 * архитектурный чертёж сохранён для классической главной.
 * У курсора UI-блоки целиком выравниваются и подсвечиваются.
 * Декоративный слой: aria-hidden, без событий; при prefers-reduced-motion — статичный кадр.
 */

type Seg = { x1: number; y1: number; x2: number; y2: number; dx: number; dy: number; depth: number; delay: number; w: number; anchorX?: number; anchorY?: number };
type Flyer = { kind: 'h' | 'v' | 'd'; pos: number; born: number; life: number; dir: 1 | -1 };

const AXES_X = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'];
const AXES_Y = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'И', 'К'];
const STEP = 120; // шаг осей, px
const MM = 6000; // шаг осей «в миллиметрах» для размерных подписей

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Фасад панельного дома: контур, этажи, швы панелей, окна-ленты. */
function facade(out: Seg[], r: () => number, x: number, y: number, cols: number, floors: number, pw: number, ph: number, depth: number, delay0: number) {
  const W = cols * pw;
  const H = floors * ph;
  const push = (x1: number, y1: number, x2: number, y2: number, w = 1, extra = 0) =>
    out.push({ x1, y1, x2, y2, dx: (r() - 0.5) * 36, dy: (r() - 0.5) * 36, depth, delay: delay0 + extra + r() * 500, w });
  // контур и кровля
  push(x, y, x + W, y, 1.4);
  push(x, y + H, x + W, y + H, 1.4);
  push(x, y, x, y + H, 1.4);
  push(x + W, y, x + W, y + H, 1.4);
  push(x - 6, y - 8, x + W + 6, y - 8, 1, 200);
  // межэтажные швы и вертикальные швы панелей
  for (let f = 1; f < floors; f++) push(x, y + f * ph, x + W, y + f * ph, 0.8, f * 40);
  for (let c = 1; c < cols; c++) push(x + c * pw, y, x + c * pw, y + H, 0.6, c * 40);
  // окна: в каждой панели по одному проёму, лоджии — через одну
  for (let f = 0; f < floors; f++) {
    for (let c = 0; c < cols; c++) {
      if (r() < 0.12) continue;
      const wx = x + c * pw + pw * 0.22;
      const wy = y + f * ph + ph * 0.28;
      const ww = pw * 0.56;
      const wh = ph * 0.44;
      const d = 300 + (f + c) * 35;
      push(wx, wy, wx + ww, wy, 0.6, d);
      push(wx, wy + wh, wx + ww, wy + wh, 0.6, d);
      push(wx, wy, wx, wy + wh, 0.6, d);
      push(wx + ww, wy, wx + ww, wy + wh, 0.6, d);
      if ((f + c) % 2 === 0) push(wx + ww / 2, wy, wx + ww / 2, wy + wh, 0.4, d + 60);
    }
  }
}

/** Контуры UI на сетке 24 px. Каждый блок собирается целиком, без деформации строк. */
function interfaceSketch(out: Seg[], x: number, y: number, w: number, h: number, kind: 'table' | 'form' | 'toolbar', index: number) {
  const dx = index % 2 === 0 ? 12 : -12;
  const dy = index % 2 === 0 ? -8 : 8;
  const line = (x1: number,y1: number,x2: number,y2: number,weight = .7) => out.push({x1,y1,x2,y2,dx,dy,depth:.45,delay:0,w:weight,anchorX:x+w/2,anchorY:y+h/2});
  const box = (bx:number,by:number,bw:number,bh:number) => {line(bx,by,bx+bw,by);line(bx+bw,by,bx+bw,by+bh);line(bx+bw,by+bh,bx,by+bh);line(bx,by+bh,bx,by);};
  box(x,y,w,h);
  line(x,y+32,x+w,y+32);
  // Заголовок и действия, без выдуманных чисел и читаемого контента.
  line(x+16,y+16,x+88,y+16,1.4);
  box(x+w-36,y+12,16,8);
  if(kind==='table') {
    box(x+16,y+48,96,24);box(x+128,y+48,48,24);
    line(x,y+88,x+w,y+88);
    for(let row=0;row<Math.floor((h-96)/32);row++) {
      const ry=y+104+row*32;
      box(x+16,ry-4,8,8);line(x+40,ry,x+w*.47,ry);
      line(x+w*.6,ry,x+w*.76,ry);line(x+w*.85,ry,x+w-16,ry);
      if(ry+16<y+h)line(x,ry+16,x+w,ry+16,.4);
    }
  } else if(kind==='form') {
    for(let row=0;row<2;row++) {
      const ry=y+56+row*72;
      line(x+16,ry,x+80,ry);box(x+16,ry+12,w-32,32);
      line(x+28,ry+28,x+112,ry+28,.5);
    }
    box(x+w-96,y+h-40,80,24);
  } else {
    box(x+16,y+48,56,24);box(x+88,y+48,56,24);box(x+w-72,y+48,56,24);
  }
  // Углы выделения напоминают рамку компонента в редакторе.
  for(const [hx,hy] of [[x,y],[x+w,y],[x,y+h],[x+w,y+h]])box(hx-2,hy-2,4,4);
}

export default function HeroBlueprint({ palette = 'site' }: { palette?: 'site' | 'command' } = {}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let segs: Seg[] = [];
    let flyers: Flyer[] = [];
    let raf = 0;
    let visible = true;
    const t0 = performance.now();
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false };
    const colors = { line: '22 22 20', accent: '29 35 205', red: '217 48 54' };

    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      const hex = (v: string, fb: string) => {
        const m = v.trim().match(/^#([0-9a-f]{6})$/i);
        if (!m) return fb;
        const n = parseInt(m[1], 16);
        return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
      };
      colors.line = hex(cs.getPropertyValue(palette === 'command' ? '--command-text' : '--c-text'), colors.line);
      colors.accent = hex(cs.getPropertyValue(palette === 'command' ? '--command-bright' : '--c-accent'), colors.accent);
      if (palette === 'command') colors.red = hex(cs.getPropertyValue('--command-red'), colors.red);
    };

    const build = () => {
      const r = rand(7);
      segs = [];
      if (palette === 'command') {
        const snap = (n:number) => 12 + Math.round((n-12)/24)*24;
        if(W >= 760) {
          interfaceSketch(segs,12,snap(H-184),288,144,'table',0);
          interfaceSketch(segs,snap(W*.39),132,216,240,'form',1);
          interfaceSketch(segs,snap(W-324),60,288,216,'table',2);
          interfaceSketch(segs,snap(W*.49),snap(H-136),240,96,'toolbar',3);
        } else {
          interfaceSketch(segs,snap(W-252),snap(H*.46),240,208,'table',0);
          interfaceSketch(segs,12,snap(H*.68),216,240,'form',1);
        }
      } else {
      // Ряд домов по низу: разная этажность и ширина — как микрорайон на генплане
      // линия земли — в пределах первого экрана, чтобы дома были видны без скролла
      // на узком экране текст занимает весь первый экран — дома уходят в низ блока, под демо
      const base = W >= 1024 ? Math.min(H - 30, window.innerHeight - 24) : H - 30;
      // Дома не заходят под текст: на широком экране — справа от колонки текста и в левом поле
      const contentLeft = Math.max(16, (W - 1152) / 2 + 32);
      const zones: [number, number][] = W >= 1024 ? (palette === 'command' ? [[-60, W * 0.34], [W * 0.56, W + 40]] : [[W * 0.53, W + 40]]) : [[-40, W + 40]];
      if (palette === 'site' && W >= 1024 && contentLeft > 140) zones.push([-30, contentLeft - 40]);
      let i = 0;
      for (const [from, to] of zones) {
        let x = from;
        while (x < to) {
          const cols = Math.max(2, Math.min(4 + Math.floor(r() * 6), Math.floor((to - x) / 26)));
          const floors = Math.min(W >= 1024 ? 8 : 12, 5 + Math.floor(r() * (i % 3 === 1 ? 9 : 5)));
          const pw = 26 + Math.floor(r() * 6);
          const ph = 18;
          if (to - x < 2 * pw && to < W) break;
          facade(segs, r, x, base - floors * ph, cols, floors, pw, ph, 0.4 + r() * 0.6, 200 + i * 180);
          x += cols * pw + 28 + r() * 60;
          i++;
        }
      }
      }
      // Длинные построечные линии сетки осей
      for (let ax = 0; ax * STEP < W + STEP; ax++) {
        const gx = 60 + ax * STEP;
        segs.push({ x1: gx, y1: 118, x2: gx, y2: H, dx: 0, dy: 0, depth: 0.15, delay: ax * 50, w: 0.5 });
      }
      for (let ay = 0; 160 + ay * STEP < H; ay++) {
        const gy = 160 + ay * STEP;
        segs.push({ x1: 36, y1: gy, x2: W, y2: gy, dx: 0, dy: 0, depth: 0.15, delay: ay * 60, w: 0.5 });
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      W = Math.max(1, rect.width);
      H = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      readColors();
      build();
      if (reduce) draw(performance.now() + 10000);
      else if (!raf) raf = requestAnimationFrame(loop);
    };

    const ease = (p: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, p)), 3);

    const drawAxisBubble = (x: number, y: number, label: string, hot: number) => {
      ctx.beginPath();
      ctx.arc(x, y, 11, 0, Math.PI * 2);
      ctx.strokeStyle = hot > 0 ? `rgb(${colors.accent} / ${0.25 + hot * 0.6})` : `rgb(${colors.line} / 0.18)`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = hot > 0 ? `rgb(${colors.accent} / ${0.4 + hot * 0.6})` : `rgb(${colors.line} / 0.32)`;
      ctx.fillText(label, x, y + 0.5);
    };

    const draw = (now: number) => {
      const t = now - t0;
      ctx.clearRect(0, 0, W, H);

      // Курсор: плавно догоняет цель; без мыши — медленный обход по кривой
      if (!mouse.active && palette !== 'command') {
        const k = t / 9000;
        mouse.tx = W * (0.62 + 0.25 * Math.sin(k * 2.1));
        mouse.ty = H * (0.55 + 0.25 * Math.sin(k * 3.3 + 1));
      }
      if (!mouse.active && palette === 'command') { mouse.tx=W*.5; mouse.ty=H*.5; }
      if (mouse.x < -1000) {
        mouse.x = mouse.tx;
        mouse.y = mouse.ty;
      }
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;
      const mx = mouse.x;
      const my = mouse.y;
      const R = Math.min(280, Math.max(180, W * 0.2));
      const px = (mx / W - 0.5) * 2;
      const py = (my / H - 0.5) * 2;

      // Мелкая сетка чертёжной бумаги
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = `rgb(${colors.line} / 0.035)`;
      ctx.beginPath();
      for (let gx = 60 % 24; gx < W; gx += 24) {
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, H);
      }
      for (let gy = 60 % 24; gy < H; gy += 24) {
        ctx.moveTo(0, gy);
        ctx.lineTo(W, gy);
      }
      ctx.stroke();

      // Сегменты: прилёт, параллакс, сборка у курсора
      for (const s of segs) {
        const p = reduce ? 1 : ease((t - s.delay) / 1100);
        if (p <= 0) continue;
        const cx = s.anchorX ?? (s.x1 + s.x2) / 2;
        const cy = s.anchorY ?? (s.y1 + s.y2) / 2;
        const dist = Math.hypot(cx - mx, cy - my);
        const near = palette === 'command' && !mouse.active ? 0 : Math.max(0, 1 - dist / R);
        const inf = near * near * (3 - 2 * near);
        const loose = (1 - inf) * (palette === 'command' ? 1 : .35);
        const ox = reduce ? 0 : s.dx * loose - (palette === 'command' ? 0 : px * 10 * s.depth);
        const oy = reduce ? 0 : s.dy * loose - (palette === 'command' ? 0 : py * 6 * s.depth);
        // прилёт: линия выезжает вдоль себя и дорисовывается
        const len = Math.hypot(s.x2 - s.x1, s.y2 - s.y1) || 1;
        const ux = (s.x2 - s.x1) / len;
        const uy = (s.y2 - s.y1) / len;
        const fly = palette === 'command' ? 0 : (1 - p) * 160;
        const x1 = s.x1 + ox - ux * fly;
        const y1 = s.y1 + oy - uy * fly;
        const x2 = x1 + (s.x2 - s.x1) * p;
        const y2 = y1 + (s.y2 - s.y1) * p;
        const a = (0.09 + 0.13 * s.depth) * (0.7 + 0.3 * p) + inf * (palette === 'command' ? .18 : .5);
        ctx.strokeStyle = inf > 0.35 ? `rgb(${colors.accent} / ${a})` : `rgb(${colors.line} / ${a})`;
        ctx.lineWidth = s.w;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      ctx.font = '500 10px "JetBrains Mono", ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if(palette !== 'command') {
      // Оси с подписями в кружках, как на архитектурном чертеже
      ctx.font = '500 10px "JetBrains Mono", ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const nearX = Math.round((mx - 60) / STEP);
      const nearY = Math.round((my - 160) / STEP);
      for (let ax = 0; ax < AXES_X.length && 60 + ax * STEP < W; ax++) {
        const gx = 60 + ax * STEP - px * 1.5;
        const hot = ax === nearX || ax === nearX + 1 ? Math.max(0, 1 - Math.abs(mx - gx) / (STEP * 1.2)) : 0;
        drawAxisBubble(gx, 104, AXES_X[ax], hot);
      }
      for (let ay = 0; ay < AXES_Y.length && 160 + ay * STEP < H - 40; ay++) {
        const gy = 160 + ay * STEP - py * 1;
        const hot = ay === nearY ? Math.max(0, 1 - Math.abs(my - gy) / STEP) : 0;
        drawAxisBubble(22, gy, AXES_Y[ay], hot);
      }

      }
      // Пролетающие построечные линии — как рейсшина по листу
      if (!reduce && palette !== 'command') {
        if (flyers.length < 3 && Math.random() < 0.02) {
          const kind = (['h', 'v', 'd'] as const)[Math.floor(Math.random() * 3)];
          flyers.push({ kind, pos: Math.random(), born: t, life: 2600 + Math.random() * 1800, dir: Math.random() < 0.5 ? 1 : -1 });
        }
        flyers = flyers.filter((f) => t - f.born < f.life);
        for (const f of flyers) {
          const q = (t - f.born) / f.life;
          const fade = Math.sin(q * Math.PI);
          ctx.strokeStyle = `rgb(${colors.line} / ${0.22 * fade})`;
          ctx.lineWidth = 0.7;
          ctx.setLineDash([14, 6, 2, 6]);
          ctx.beginPath();
          if (f.kind === 'h') {
            const y = H * (f.dir > 0 ? q : 1 - q);
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
          } else if (f.kind === 'v') {
            const x = W * (f.dir > 0 ? q : 1 - q);
            ctx.moveTo(x, 0);
            ctx.lineTo(x, H);
          } else {
            const off = (q - 0.5) * (W + H) * 1.2;
            ctx.moveTo(off, H);
            ctx.lineTo(off + H * 0.58, 0); // 60° — угол рейсшины с угольником
          }
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Курсор: перекрестие, размерная линия между ближайшими осями, отметка
      const showCursor = !reduce && (mouse.active || !finePointer);
      if (showCursor) {
        const ax0 = 60 + Math.floor((mx - 60) / STEP) * STEP;
        const ax1 = ax0 + STEP;
        const dimY = Math.min(H - 60, my + 46);
        ctx.strokeStyle = `rgb(${colors.accent} / 0.18)`;
        ctx.lineWidth = 0.6;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(mx, 0);
        ctx.lineTo(mx, H);
        ctx.moveTo(0, my);
        ctx.lineTo(W, my);
        ctx.stroke();
        ctx.setLineDash([]);
        // размерная линия с засечками под 45°
        ctx.strokeStyle = `rgb(${colors.accent} / 0.55)`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(ax0, dimY);
        ctx.lineTo(ax1, dimY);
        for (const x of [ax0, ax1]) {
          ctx.moveTo(x - 4, dimY + 4);
          ctx.lineTo(x + 4, dimY - 4);
          ctx.moveTo(x, dimY - 10);
          ctx.lineTo(x, dimY + 6);
        }
        ctx.stroke();
        ctx.fillStyle = `rgb(${colors.accent} / 0.75)`;
        ctx.fillText(palette === 'command' ? `${STEP} px` : String(MM), (ax0 + ax1) / 2, dimY - 8);
        // отметка курсора: красный квадрат — единственный цветовой акцент
        ctx.fillStyle = `rgb(${colors.red} / 0.85)`;
        ctx.fillRect(mx - 3, my - 3, 6, 6);
        ctx.textAlign = 'left';
        ctx.fillStyle = `rgb(${colors.line} / 0.45)`;
        const ix = Math.max(0, Math.min(AXES_X.length - 1, Math.floor((mx - 60) / STEP)));
        const iy = Math.max(0, Math.min(AXES_Y.length - 1, Math.round((my - 160) / STEP)));
        ctx.fillText(palette === 'command' ? '24 px · grid' : `${AXES_Y[iy]}–${AXES_X[ix]}  ·  ±0.000`, mx + 10, my - 10);
        ctx.textAlign = 'center';
      }
    };

    const loop = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      draw(now);
      const settled = Math.abs(mouse.tx-mouse.x)<.1 && Math.abs(mouse.ty-mouse.y)<.1;
      if (palette !== 'command' || now-t0<1800 || !settled) raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      mouse.active = inside && e.pointerType === 'mouse';
      if (mouse.active) {
        mouse.tx = x;
        mouse.ty = y;
      }
      if (!raf && !reduce) raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([en]) => { visible=en.isIntersecting; if(visible&&!reduce&&!raf)raf=requestAnimationFrame(loop); });
    io.observe(canvas);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onScheme = () => { readColors(); if(reduce)draw(performance.now()+10000); else if(!raf)raf=requestAnimationFrame(loop); };
    const onVisibility = () => { if(!document.hidden&&!reduce&&!raf)raf=requestAnimationFrame(loop); };
    document.addEventListener('visibilitychange',onVisibility);
    mq.addEventListener('change', onScheme);
    resize();
    if (!reduce) {
      window.addEventListener('pointermove', onMove, { passive: true });
      if(!raf) raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mq.removeEventListener('change', onScheme);
      document.removeEventListener('visibilitychange',onVisibility);
      window.removeEventListener('pointermove', onMove);
    };
  }, [palette]);

  return <canvas ref={ref} aria-hidden="true" className="hero-blueprint" />;
}
