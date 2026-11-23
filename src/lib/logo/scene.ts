import { WORD_PATHS } from './words';

// Lógica pura de la animación (sin dependencias de Remotion).
// Dado un frame devuelve la lista de capas a dibujar, en orden de abajo hacia arriba.
// Todos los tiempos están en frames a 30 fps; se escalan solos a otros fps.

export type Shape =
  | { kind: 'path'; d: string }
  | { kind: 'rect'; x: number; y: number; w: number; h: number; rx: number }
  | { kind: 'stroke'; d: string; width: number }; // trazo redondeado (letras de las palabras)

type Box = { x: number; y: number; w: number; h: number };
type Reveal = 'left' | 'right' | 'up' | 'down' | 'none';

export type Mask =
  | { kind: 'stroke'; d: string; width: number; drawn: number; total: number } // trazo que escribe
  | { kind: 'fill'; d: string }; // mancha que se abre (quemado)

export type Layer = {
  key: string;
  shapes: Shape[];
  fill: string;
  opacity: number;
  transform: string;
  clip: Box | null;
  mask: Mask | null;
};

export type Pass = 'completo' | 'logo' | 'estelas';

export const LOGO_W = 1429.841;
export const LOGO_H = 383.709;

// ---- Colores del logo ----
const CREMA = '#f3efe6';
const AZUL = '#1f3fbf';
const ROJO = '#d62828';
const NARANJA = '#f27a1a';
const AMARILLO = '#f5c518';

// ---- Ajustes generales (cámbialos a gusto) ----
export const SETTINGS = {
  tempo: 1.15, // >1 = más lento, <1 = más rápido
  trailLag: 2, // frames de separación entre cada estela
  trailFade: 6, // frames que tardan las estelas en desaparecer cuando aterriza la pieza
  holdUntil: 222, // (solo para la salida antigua, ya no se usa)
  exitDuration: 36,
};

// ---- Secuencia de palabras (tiempos en frames a 30 fps, antes de aplicar tempo) ----
export const SEQ = {
  igualar: 178, // las barras se estiran al mismo largo
  igualarDur: 22,
  palabras: [
    { texto: 'BLUR', barra: 0, color: '#1f3fbf', abre: 206, dur: 26, quieta: 34, cierra: 20 },
    { texto: 'FOCUS', barra: 2, color: '#f27a1a', abre: 290, dur: 26, quieta: 34, cierra: 20 },
    { texto: 'LIT', barra: 3, color: '#f5c518', abre: 374, dur: 24, quieta: 36, cierra: 20 },
  ],
  escalonar: 458, // las barras vuelven a su largo escalonado (fila 1)
  escalonarDur: 22,
  fin: 520,
};

const W_PATH =
  'M21.928,1.607h26.447c10.564,0,19.625,7.535,21.551,17.922l24.399,131.559,8.417,45.79c4.284,23.307,37.369,24.18,42.877,1.132l11.213-46.922,30.843-132.53c2.31-9.927,11.157-16.951,21.349-16.951h34.227c10.191,0,19.038,7.024,21.348,16.951l30.844,132.53,11.195,47.54c5.449,23.135,38.667,22.271,42.904-1.116l8.411-46.424,24.399-131.559c1.926-10.387,10.987-17.922,21.551-17.922h23.185c13.943,0,24.342,12.846,21.439,26.483l-71.66,336.657c-2.154,10.12-11.092,17.356-21.439,17.356h-46.44c-10.167,0-18.999-6.991-21.334-16.886l-30.262-128.246-11.223-50.133c-5.114-22.841-37.666-22.841-42.78,0l-11.224,50.133-30.262,128.246c-2.334,9.895-11.167,16.886-21.333,16.886h-46.982c-10.347,0-19.285-7.236-21.439-17.356L.489,28.09C-2.414,14.453,7.985,1.607,21.928,1.607Z';
const I_DOT =
  'M499.201,2.421h25.738c12.106,0,21.919,9.814,21.919,21.92v15.409c0,12.106-9.813,21.92-21.919,21.92h-25.738c-12.106,0-21.919-9.814-21.919-21.92v-15.409C477.282,12.235,487.095,2.421,499.201,2.421Z';
const I_STEM =
  'M499.201,86.13h25.738c12.106,0,21.919,9.814,21.919,21.919v251.32c0,12.105-9.813,21.919-21.919,21.919h-25.738c-12.106,0-21.919-9.814-21.919-21.919V108.049C477.282,95.944,487.095,86.13,499.201,86.13Z';
const L_PATH =
  'M597.043,1.607h25.738c12.106,0,21.92,9.813,21.92,21.919v336.657c0,12.106-9.814,21.92-21.92,21.92h-25.738c-12.105,0-21.919-9.814-21.919-21.92V23.526C575.124,11.42,584.938,1.607,597.043,1.607Z';
const CIRCLE_PATH =
  'M1028.479,164.405h0c15.01,0,27.178,12.169,27.178,27.179v.542c0,15.01-12.168,27.178-27.178,27.178h0c-15.011,0-27.179-12.168-27.179-27.178v-.542C1001.3,176.574,1013.468,164.405,1028.479,164.405Z';
const B_PATH =
  'M972.43,256.662c-1.585-16.683-6.04-27.629-10.795-36.839-7.851-14.795-16.833-24.911-16.833-46.954,0-13.286,2.792-21.439,5.963-29.893,3.548-9.361,7.548-19.174,8.756-36.839.303-3.699.454-7.699.454-12.153,0-51.031-24.912-89.153-93.305-93.531-4.378-.302-8.983-.453-13.739-.453-19.551,0-43.481,1.585-60.919,1.585-27.704,0-65.223-1.585-83.642-1.585-24.458,0-35.404,17.362-35.404,34.197v302.785c0,45.671,39.179,46.727,70.732,46.727,26.573,0,52.164-.528,97.835-2.717,5.661-.227,11.096-.528,16.456-.981,40.613-3.096,72.771-11.852,92.625-34.726,8.379-9.586,14.569-21.665,18.268-36.838,2.718-11.021,4.152-23.703,4.152-38.272C973.034,265.268,972.808,260.814,972.43,256.662ZM806.732,29.894c16.985-.227,32.913.528,47.483,2.491,48.312,6.492,80.773,26.496,80.773,67.109,0,2.265-.076,4.53-.378,6.643-1.434,15.022-7.927,27.176-18.57,36.839-14.116,12.833-35.555,21.136-61.825,25.364-14.193,2.265-29.743,3.397-46.427,3.397-67.411,0-107.042-2.718-107.042-70.129C700.746,34.8,742.567,30.422,806.732,29.894ZM887.883,345.285c-10.041,3.775-21.213,6.568-33.291,8.455-12.834,1.963-26.722,2.944-41.368,2.794-82.056-1.057-115.799-1.586-115.799-90.209,0-79.339,46.273-79.339,119.046-79.339,13.361,0,26.043.604,37.744,2.038,33.819,3.775,60.164,13.512,76.017,30.799,8.983,9.739,14.57,21.968,16.23,36.839.378,3.095.528,6.341.528,9.663-.301,16.38-4.302,30.346-11.473,42.122C925.476,325.206,909.096,337.359,887.883,345.285Z';

const bar = (x: number, w: number, rx: number): Shape => ({ kind: 'rect', x, y: 2.56, w, h: 379.414, rx });
const barBox = (x: number, w: number): Box => ({ x, y: 2.56, w, h: 379.414 });

// Líneas centrales de las letras: por aquí se "escriben"
const W_LINE = { d: 'M36,10 L117,372 L226,10 L332,372 L415,10', length: 1497.6, width: 92 };
const B_LINE = {
  d: 'M686,372 L686,16 L840,16 C915,16 946,55 946,95 C946,140 910,179 840,179 L700,179 L850,180 C925,182 960,225 960,272 C960,330 915,369 840,369 L686,369',
  length: 1588.2,
  width: 72,
};

// Medidas de la i (palo + punto)
const I_X = 477.28;
const I_W = 69.58;
const I_R = 21.92;
const DOT_TOP = 2.42;
const DOT_BOTTOM = 61.67;
const STEM_TOP = 86.13;
const STEM_BOTTOM = 381.29;

type Anim =
  | { type: 'slide'; from: { dx?: number; dy?: number; scale?: number }; reveal: Reveal; overshoot?: boolean; land?: boolean }
  | { type: 'write'; line: { d: string; length: number; width: number } }
  | { type: 'morph-i'; from: { dy: number }; morphStart: number; morphDur: number }
  | { type: 'burn'; seeds: Seed[]; band: number };

// Foco del quemado: dónde nace, cuándo arranca (0–1 del tiempo de la pieza) y cuánto crece
type Seed = { x: number; y: number; delay: number; maxR: number; seed: number };

type Piece = {
  id: string;
  shape: Shape;
  fill: string;
  bbox: Box;
  start: number;
  dur: number;
  anim: Anim;
  trails: string[]; // colores de las estelas; el primero es el que va más adelante
  lag?: number; // separación entre estelas (frames)
  bar?: number; // índice de barra (su forma cambia en la secuencia de palabras)
};

// ---- Barras (como la fila 1 del diseño): azul, roja, naranja, amarilla ----
const BAR_X0 = 1083.923;
const BAR_GAP = 28.27;
const BAR_W = [99.194, 74.196, 53.372, 34.357];
const BAR_RX = [2.37, 2.37, 2.054, 1.488];
const BAR_COLORS = [AZUL, ROJO, NARANJA, AMARILLO];
const BAR_TAPER = [1, 0.89, 0.75, 0.59]; // largo de cada barra en la fila 1
const BAR_FULL = 379.414;
const BAR_CY = 2.56 + BAR_FULL / 2;
const barX = (i: number) => BAR_X0 + BAR_W.slice(0, i).reduce((a, w) => a + w + BAR_GAP, 0);
const barRest = (i: number): Shape => {
  const h = BAR_FULL * BAR_TAPER[i];
  return { kind: 'rect', x: barX(i), y: BAR_CY - h / 2, w: BAR_W[i], h, rx: BAR_RX[i] };
};

// Barras: 1 = entran desde la derecha, -1 = desde la izquierda
export const BARRAS_DESDE = 1;
const barra = (i: number, start: number): Piece => {
  const r = barRest(i) as Extract<Shape, { kind: 'rect' }>;
  return {
    id: `barra-${i}`, shape: r, fill: BAR_COLORS[i], bbox: { x: r.x, y: r.y, w: r.w, h: r.h }, start, dur: 22,
    anim: { type: 'slide', from: { dx: 340 * BARRAS_DESDE }, reveal: BARRAS_DESDE > 0 ? 'right' : 'left', land: true },
    trails: [], bar: i,
  };
};

// ---- Coreografía ----
export const PIECES: Piece[] = [
  // 1. La l cae desde arriba
  { id: 'l', shape: { kind: 'path', d: L_PATH }, fill: CREMA, bbox: { x: 575.12, y: 1.61, w: 69.58, h: 380.5 },
    start: 6, dur: 18, anim: { type: 'slide', from: { dy: -220 }, reveal: 'down', land: true }, trails: [NARANJA, AZUL, AMARILLO] },
  // 2. Otro palito sube desde abajo y se transforma en la i
  { id: 'i', shape: { kind: 'path', d: I_STEM }, fill: CREMA, bbox: { x: I_X, y: DOT_TOP, w: I_W, h: STEM_BOTTOM - DOT_TOP },
    start: 12, dur: 18, anim: { type: 'morph-i', from: { dy: 220 }, morphStart: 36, morphDur: 18 },
    trails: [AMARILLO, ROJO, AZUL] },
  // 3. La W se escribe
  { id: 'W', shape: { kind: 'path', d: W_PATH }, fill: CREMA, bbox: { x: 0, y: 1.61, w: 449.02, h: 380.5 },
    start: 52, dur: 34, anim: { type: 'write', line: W_LINE }, trails: [AZUL, ROJO, NARANJA, AMARILLO], lag: 2 },
  // 4. La B se abre como papel quemado / químico que se riega
  { id: 'B', shape: { kind: 'path', d: B_PATH }, fill: CREMA, bbox: { x: 672.97, y: 0, w: 300.07, h: 383.71 },
    start: 64, dur: 56,
    anim: {
      type: 'burn',
      band: 11, // grosor de cada franja de color del borde encendido
      seeds: [
        { x: 818, y: 184, delay: 0, maxR: 310, seed: 1 }, // foco principal, en la mitad
        { x: 935, y: 70, delay: 0.22, maxR: 170, seed: 2 },
        { x: 700, y: 320, delay: 0.3, maxR: 170, seed: 3 },
        { x: 945, y: 320, delay: 0.38, maxR: 160, seed: 4 },
        { x: 700, y: 50, delay: 0.45, maxR: 150, seed: 5 },
      ],
    },
    trails: [ROJO, NARANJA, AMARILLO] },
  // 5. Barras: entran en horizontal, una tras otra, sin estelas
  barra(0, 104),
  barra(1, 108),
  barra(2, 112),
  barra(3, 116),
  // 6. El círculo aparece con rebote
  { id: 'circulo', shape: { kind: 'path', d: CIRCLE_PATH }, fill: CREMA, bbox: { x: 1001.3, y: 164.4, w: 54.36, h: 54.9 },
    start: 136, dur: 16, anim: { type: 'slide', from: { scale: 0 }, reveal: 'none', overshoot: true },
    trails: [AMARILLO, NARANJA, ROJO, AZUL] },
];

// ---- Utilidades ----
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// Curva bezier cúbica (igual que en After Effects / CSS cubic-bezier)
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (u: number) => ((ax * u + bx) * u + cx) * u;
  const sy = (u: number) => ((ay * u + by) * u + cy) * u;
  const dx = (u: number) => (3 * ax * u + 2 * bx) * u + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let u = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(u) - x;
      const d = dx(u);
      if (Math.abs(e) < 1e-6 || Math.abs(d) < 1e-6) break;
      u -= e / d;
    }
    return sy(clamp(u));
  };
}

// Curvas de movimiento
export const CURVES = {
  entrada: bezier(0.16, 1, 0.3, 1), // expo-out: arranca rápido y frena suave
  aterrizaje: bezier(0.34, 1.32, 0.5, 1), // con un pequeño rebote al llegar
  escritura: bezier(0.7, 0, 0.25, 1), // arranca lento, acelera y frena (trazo de pluma)
  quemado: bezier(0.45, 0.05, 0.25, 1), // se prende despacio y se expande
};
const easeOut = CURVES.entrada;
const easeInOut = CURVES.escritura;
const easeOutBack = (t: number, c1 = 1.9) => {
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const pieceEnd = (p: Piece) => (p.anim.type === 'morph-i' ? p.anim.morphStart + p.anim.morphDur : p.start + p.dur);
const buildEnd = () => Math.max(...PIECES.map(pieceEnd)) + SETTINGS.trailFade;

export const totalFrames30 = (_exit?: boolean) => Math.round(SEQ.fin * SETTINGS.tempo);

type State = Omit<Layer, 'key' | 'fill' | 'opacity'>;

function center(b: Box) {
  return { cx: b.x + b.w / 2, cy: b.y + b.h / 2 };
}
function tf(b: Box, dx: number, dy: number, s: number) {
  const { cx, cy } = center(b);
  return `translate(${(cx + dx).toFixed(3)} ${(cy + dy).toFixed(3)}) scale(${Math.max(s, 0.0001).toFixed(4)}) translate(${-cx} ${-cy})`;
}

// Estado de una pieza (o de una estela) en el tiempo t
function pieceState(p: Piece, t: number, grow = 0): State | null {
  if (t < p.start) return null;
  const raw = clamp((t - p.start) / p.dur);
  const e = easeOut(raw);
  const a = p.anim;

  if (a.type === 'burn') {
    const d = a.seeds.map((sd) => blobPath(sd, clamp((raw - sd.delay) / (1 - sd.delay)), t, grow)).filter(Boolean).join(' ');
    if (!d) return null;
    return { shapes: [p.shape], transform: '', clip: null, mask: raw >= 1 && grow === 0 ? null : { kind: 'fill', d } };
  }

  if (a.type === 'write') {
    const prog = easeInOut(raw);
    if (prog <= 0.0005) return null;
    return {
      shapes: [p.shape],
      transform: '',
      clip: null,
      mask: prog >= 1 ? null : { kind: 'stroke', d: a.line.d, width: a.line.width, drawn: prog * a.line.length, total: a.line.length },
    };
  }

  if (a.type === 'morph-i') {
    // Entra como un palito completo (desde abajo) y luego se parte en palo + punto
    const dy = a.from.dy * (1 - CURVES.aterrizaje(raw));
    const r = easeOut(clamp((t - p.start) / (p.dur * 0.75)));
    const mRaw = clamp((t - a.morphStart) / a.morphDur);
    const m = easeOutBack(mRaw, 2.4);
    const hop = -Math.sin(Math.PI * clamp(mRaw * 1.2)) * 34; // pequeño salto del punto
    const dotBottom = lerp(200, DOT_BOTTOM, m);
    const stemTop = lerp(150, STEM_TOP, m);
    const dot: Shape = { kind: 'rect', x: I_X, y: DOT_TOP + hop, w: I_W, h: Math.max(dotBottom - DOT_TOP, 1), rx: I_R };
    const stem: Shape = { kind: 'rect', x: I_X, y: stemTop, w: I_W, h: STEM_BOTTOM - stemTop, rx: I_R };
    return {
      shapes: [stem, dot],
      transform: tf(p.bbox, 0, dy, 1),
      clip: revealBox(p.bbox, 'up', r),
      mask: null,
    };
  }

  const m = a.land ? CURVES.aterrizaje(raw) : e;
  const dx = (a.from.dx ?? 0) * (1 - m);
  const dy = (a.from.dy ?? 0) * (1 - m);
  const s0 = a.from.scale ?? 1;
  const s = a.overshoot ? lerp(s0, 1, easeOutBack(raw)) : lerp(s0, 1, e);
  const r = easeOut(clamp((t - p.start) / (p.dur * 0.75)));
  return { shapes: [p.shape], transform: tf(p.bbox, dx, dy, s), clip: revealBox(p.bbox, a.reveal, r), mask: null };
}

// Ruido suave y determinista por ángulo: le da el borde irregular de papel quemado
function rand(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
const HARMONICS = [
  [2, 0.12], [3, 0.1], [5, 0.08], [7, 0.06], [11, 0.045], [17, 0.03], [23, 0.022], [31, 0.015],
];
function blobPath(sd: Seed, prog: number, t: number, grow: number): string {
  if (prog <= 0) return '';
  const R = sd.maxR * CURVES.quemado(prog) + grow * Math.min(1, prog * 6);
  if (R <= 0.5) return '';
  const N = 160;
  const pts: string[] = [];
  for (let i = 0; i < N; i++) {
    const th = (i / N) * Math.PI * 2;
    let n = 0;
    HARMONICS.forEach(([k, amp], j) => {
      const ph = rand(sd.seed * 10 + j) * Math.PI * 2;
      const drift = (rand(sd.seed * 20 + j) - 0.5) * 0.05; // el borde "hierve" un poco
      n += amp * Math.sin(k * th + ph + drift * t);
    });
    const r = Math.max(0, R * (1 + n));
    pts.push(`${(sd.x + Math.cos(th) * r).toFixed(1)},${(sd.y + Math.sin(th) * r).toFixed(1)}`);
  }
  return `M${pts.join('L')}Z`;
}

function revealBox(b: Box, dir: Reveal, r: number): Box | null {
  const pad = 4;
  const B = { x: b.x - pad, y: b.y - pad, w: b.w + pad * 2, h: b.h + pad * 2 };
  if (dir === 'none' || r >= 1) return null;
  switch (dir) {
    case 'down': return { ...B, h: B.h * r };
    case 'up': return { ...B, y: B.y + B.h * (1 - r), h: B.h * r };
    case 'right': return { ...B, w: B.w * r };
    case 'left': return { ...B, x: B.x + B.w * (1 - r), w: B.w * r };
  }
}

// frame de salida → tiempo de coreografía (la entrada al revés y más rápida)
function choreoTime(frame30: number, exit: boolean): number {
  const hold = SETTINGS.holdUntil;
  if (!exit || frame30 < hold) return frame30;
  const end = buildEnd();
  const speed = end / SETTINGS.exitDuration;
  return end - (frame30 - hold) * speed;
}

// ======================= Palabras =======================
const SW = 30; // grosor del trazo de las letras
const TOP = 2.56 + SW / 2;
const BOT = 2.56 + BAR_FULL - SW / 2;
const LH = BOT - TOP;
const LETTER_GAP = 56;
const WORD_LEAD = 48; // espacio entre la franja y la palabra
const WORD_TAIL = 30; // espacio entre la palabra y la siguiente franja
// ancho exterior de cada letra (proporción de la altura)
const GLYPH_W: Record<string, number> = { B: 0.7, L: 0.55, U: 0.72, R: 0.72, F: 0.6, O: 0.95, C: 0.8, S: 0.7, I: 0, T: 0.78 };

const f = (n: number) => n.toFixed(2);
function glyph(ch: string, x: number): string {
  const w = GLYPH_W[ch] * BAR_FULL; // ancho de la línea central
  const x0 = x, x1 = x + w, y0 = TOP, y1 = BOT;
  const ym = y0 + LH * 0.48;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const pt = (ccx: number, ccy: number, rx: number, ry: number, deg: number) => {
    const a = (deg * Math.PI) / 180;
    return `${f(ccx + rx * Math.cos(a))},${f(ccy + ry * Math.sin(a))}`;
  };
  switch (ch) {
    case 'B': {
      const ru = (ym - y0) / 2, rl = (y1 - ym) / 2, xu = x0 + w * 0.86 - ru, xl = x1 - rl;
      return `M${f(x0)},${f(y1)} L${f(x0)},${f(y0)} L${f(xu)},${f(y0)} A${f(ru)},${f(ru)} 0 0 1 ${f(xu)},${f(ym)} L${f(x0)},${f(ym)} M${f(x0)},${f(ym)} L${f(xl)},${f(ym)} A${f(rl)},${f(rl)} 0 0 1 ${f(xl)},${f(y1)} L${f(x0)},${f(y1)}`;
    }
    case 'L': return `M${f(x0)},${f(y0)} L${f(x0)},${f(y1)} L${f(x1)},${f(y1)}`;
    case 'I': return `M${f(x0)},${f(y0)} L${f(x0)},${f(y1)}`;
    case 'T': return `M${f(x0)},${f(y0)} L${f(x1)},${f(y0)} M${f(cx)},${f(y0)} L${f(cx)},${f(y1)}`;
    case 'F': return `M${f(x1)},${f(y0)} L${f(x0)},${f(y0)} L${f(x0)},${f(y1)} M${f(x0)},${f(ym)} L${f(x0 + w * 0.85)},${f(ym)}`;
    case 'U': {
      const r = w / 2;
      return `M${f(x0)},${f(y0)} L${f(x0)},${f(y1 - r)} A${f(r)},${f(r)} 0 0 0 ${f(x1)},${f(y1 - r)} L${f(x1)},${f(y0)}`;
    }
    case 'R': {
      const yr = y0 + LH * 0.5, r = (yr - y0) / 2, xr = x1 - r;
      return `M${f(x0)},${f(y1)} L${f(x0)},${f(y0)} L${f(xr)},${f(y0)} A${f(r)},${f(r)} 0 0 1 ${f(xr)},${f(yr)} L${f(x0)},${f(yr)} M${f(x0 + (xr - x0) * 0.62)},${f(yr)} L${f(x1)},${f(y1)}`;
    }
    case 'O': {
      const rx = w / 2, ry = LH / 2;
      return `M${f(x1)},${f(cy)} A${f(rx)},${f(ry)} 0 1 1 ${f(x0)},${f(cy)} A${f(rx)},${f(ry)} 0 1 1 ${f(x1)},${f(cy)} Z`;
    }
    case 'C': {
      const rx = w / 2, ry = LH / 2;
      return `M${pt(cx, cy, rx, ry, -42)} A${f(rx)},${f(ry)} 0 1 0 ${pt(cx, cy, rx, ry, 42)}`;
    }
    case 'S': {
      const rx = w / 2, ry = LH / 4, cu = y0 + ry, cl = y1 - ry;
      return `M${pt(cx, cu, rx, ry, -28)} A${f(rx)},${f(ry)} 0 1 0 ${f(cx)},${f(cu + ry)} A${f(rx)},${f(ry)} 0 1 1 ${pt(cx, cl, rx, ry, 152)}`;
    }
  }
  return '';
}

type WordGeom = { d: string; dx: number; width: number }; // width = espacio total que abre (incluye WORD_LEAD)
function wordGeom(text: string): WordGeom {
  const w = WORD_PATHS[text];
  // corre la palabra para que empiece justo WORD_LEAD después de la franja
  return { d: w.d, dx: WORD_LEAD - w.x0, width: WORD_LEAD + (w.x1 - w.x0) + WORD_TAIL };
}

const CURVA_ABRE = bezier(0.22, 1, 0.36, 1);
const CURVA_CIERRA = bezier(0.64, 0, 0.78, 0);
const CURVA_SUAVE = bezier(0.65, 0, 0.35, 1);

// cuánto está abierta cada palabra (0–1)
function wordOpen(wd: (typeof SEQ.palabras)[number], t: number) {
  const o = CURVA_ABRE(clamp((t - wd.abre) / wd.dur));
  const closeStart = wd.abre + wd.dur + wd.quieta;
  const c = CURVA_CIERRA(clamp((t - closeStart) / wd.cierra));
  return o * (1 - c);
}

// estado de las barras durante la secuencia
function barsAt(t: number): Shape[] {
  const opens = SEQ.palabras.map((wd) => ({ bar: wd.barra, w: wordGeom(wd.texto).width * wordOpen(wd, t) }));
  return BAR_W.map((w, i) => {
    const up = CURVA_SUAVE(clamp((t - SEQ.igualar - i * 3) / SEQ.igualarDur));
    const down = CURVA_SUAVE(clamp((t - SEQ.escalonar - (3 - i) * 3) / SEQ.escalonarDur));
    const k = lerp(BAR_TAPER[i], 1, up * (1 - down));
    const h = BAR_FULL * k;
    const push = opens.filter((o) => o.bar < i).reduce((a, o) => a + o.w, 0);
    return { kind: 'rect', x: barX(i) + push, y: BAR_CY - h / 2, w, h, rx: BAR_RX[i] } as Shape;
  });
}

function wordLayers(t: number): Layer[] {
  const out: Layer[] = [];
  const bars = barsAt(t) as Extract<Shape, { kind: 'rect' }>[];
  SEQ.palabras.forEach((wd) => {
    const g = wordGeom(wd.texto);
    const open = g.width * wordOpen(wd, t);
    if (open < 0.5) return;
    const b = bars[wd.barra];
    const barRight = b.x + b.w;
    const shift = barRight + open - g.width + g.dx; // la palabra sale de detrás de la franja
    out.push({
      key: `palabra-${wd.texto}`,
      shapes: [{ kind: 'path', d: g.d }],
      fill: wd.color,
      opacity: 1,
      transform: `translate(${f(shift)} 0)`,
      clip: { x: barRight + 6 - shift, y: -20, w: Math.max(open - 6, 0), h: BAR_FULL + 50 },
      mask: null,
    });
  });
  return out;
}

const maxOpenWidth = () => Math.max(...SEQ.palabras.map((wd) => wordGeom(wd.texto).width));

// Cámara: se aleja suavemente durante la secuencia para que quepan las palabras y sigue el centro
export function cameraAt(frame: number, fps: number, width: number, height: number) {
  const t = (frame * 30) / fps / SETTINGS.tempo;
  const introS = Math.min((width * 0.72) / LOGO_W, (height * 0.8) / LOGO_H);
  const seqS = Math.min(introS, (width * 0.88) / (LOGO_W + maxOpenWidth()));
  const zOut = CURVA_SUAVE(clamp((t - SEQ.igualar) / (SEQ.palabras[0].abre - SEQ.igualar + 6)));
  const zIn = CURVA_SUAVE(clamp((t - (SEQ.escalonar - 6)) / (SEQ.escalonarDur + 12)));
  const s = lerp(introS, seqS, zOut * (1 - zIn));
  const opens = SEQ.palabras.reduce((a, wd) => a + wordGeom(wd.texto).width * wordOpen(wd, t), 0);
  const contentW = LOGO_W + opens;
  const x = width / 2 - (contentW * s) / 2;
  const y = (height - LOGO_H * s) / 2;
  return `translate(${f(x)} ${f(y)}) scale(${s.toFixed(5)})`;
}

export function layersAt(frame: number, fps: number, opts: { pass: Pass; exit: boolean }): Layer[] {
  const f30 = (frame * 30) / fps / SETTINGS.tempo;
  const t = f30;
  const out: Layer[] = [];
  const wantTrails = opts.pass !== 'logo';
  const wantMain = opts.pass !== 'estelas';

  for (const p of PIECES) {
    if (wantTrails) {
      const n = p.trails.length;
      const lag = p.lag ?? SETTINGS.trailLag;
      const opacity = 1 - clamp((t - pieceEnd(p)) / SETTINGS.trailFade);
      if (opacity > 0) {
        p.trails.forEach((color, k) => {
          const burn = p.anim.type === 'burn';
          const shift = burn ? 0 : (n - k) * lag;
          const grow = burn ? (n - k) * (p.anim as { band: number }).band : 0;
          const st = pieceState(p, t + shift, grow);
          if (!st) return;
          out.push({ key: `${p.id}-estela-${k}`, fill: color, opacity, ...st });
        });
      }
    }
    if (wantMain) {
      const st = pieceState(p, t);
      if (st) {
        if (p.bar !== undefined && t >= p.start + p.dur) st.shapes = [barsAt(t)[p.bar]];
        out.push({ key: p.id, fill: p.fill, opacity: 1, ...st });
      }
    }
  }
  if (wantMain) out.push(...wordLayers(t));
  return out;
}

// Encaje del logo dentro del cuadro
export function logoFit(width: number, height: number, widthRatio = 0.72) {
  const scale = Math.min((width * widthRatio) / LOGO_W, (height * 0.8) / LOGO_H);
  const x = (width - LOGO_W * scale) / 2;
  const y = (height - LOGO_H * scale) / 2;
  return `translate(${x} ${y}) scale(${scale})`;
}

const shapeSvg = (sh: Shape, fill: string) =>
  sh.kind === 'path'
    ? `<path d="${sh.d}" fill="${fill}"/>`
    : sh.kind === 'stroke'
      ? `<path d="${sh.d}" fill="none" stroke="${fill}" stroke-width="${sh.width}" stroke-linecap="round" stroke-linejoin="round"/>`
      : `<rect x="${sh.x}" y="${sh.y}" width="${sh.w}" height="${sh.h}" rx="${sh.rx}" fill="${fill}"/>`;

// Versión en texto SVG (para renders fuera de Remotion)
export function svgAt(frame: number, fps: number, width: number, height: number, opts: { pass: Pass; exit: boolean }) {
  const layers = layersAt(frame, fps, opts);
  const defs: string[] = [];
  const body = layers
    .map((l, i) => {
      let inner = l.shapes.map((sh) => shapeSvg(sh, l.fill)).join('');
      if (l.clip) {
        defs.push(`<clipPath id="c${i}"><rect x="${l.clip.x}" y="${l.clip.y}" width="${l.clip.w}" height="${l.clip.h}"/></clipPath>`);
        inner = `<g clip-path="url(#c${i})">${inner}</g>`;
      }
      if (l.mask) {
        const m = l.mask;
        const mp =
          m.kind === 'fill'
            ? `<path d="${m.d}" fill="#fff"/>`
            : `<path d="${m.d}" fill="none" stroke="#fff" stroke-width="${m.width}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${m.drawn.toFixed(2)} ${(m.total + 50).toFixed(2)}"/>`;
        defs.push(`<mask id="m${i}" maskUnits="userSpaceOnUse" x="-1000" y="-1000" width="4000" height="3000">${mp}</mask>`);
        inner = `<g mask="url(#m${i})">${inner}</g>`;
      }
      return `<g${l.transform ? ` transform="${l.transform}"` : ''} opacity="${l.opacity.toFixed(3)}">${inner}</g>`;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs>${defs.join('')}</defs><g transform="${cameraAt(frame, fps, width, height)}">${body}</g></svg>`;
}
