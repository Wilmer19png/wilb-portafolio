// Dibujo del logo en <canvas> (para el lienzo y la web). Mismo scene.ts de Remotion.
import { layersAt, cameraAt, SEQ, SETTINGS, Layer } from './scene';

type M = [number, number, number, number, number, number];
const mul = (a: M, b: M): M => [a[0]*b[0]+a[2]*b[1], a[1]*b[0]+a[3]*b[1], a[0]*b[2]+a[2]*b[3], a[1]*b[2]+a[3]*b[3], a[0]*b[4]+a[2]*b[5]+a[4], a[1]*b[4]+a[3]*b[5]+a[5]];
function parse(tf: string): M {
  let m: M = [1, 0, 0, 1, 0, 0];
  const re = /(translate|scale)\(([^)]+)\)/g; let r: RegExpExecArray | null;
  while ((r = re.exec(tf))) {
    const v = r[2].trim().split(/[\s,]+/).map(Number);
    m = mul(m, r[1] === 'translate' ? [1, 0, 0, 1, v[0], v[1] ?? 0] : [v[0], 0, 0, v[1] ?? v[0], 0, 0]);
  }
  return m;
}
const cache = new Map<string, Path2D>();
const P = (d: string) => { let p = cache.get(d); if (!p) { p = new Path2D(d); if (cache.size > 400) cache.clear(); cache.set(d, p); } return p; };

// ink: cambia solo las letras (crema) por otro color, para fondos claros; las barras siguen a color
const CREMA = '#f3efe6';
function shapes(ctx: CanvasRenderingContext2D, l: Layer, mono?: string, ink?: string) {
  const col = mono || (ink && l.fill.toLowerCase() === CREMA ? ink : l.fill); ctx.fillStyle = col; ctx.strokeStyle = col;
  for (const s of l.shapes) {
    if (s.kind === 'path') ctx.fill(P(s.d));
    else if (s.kind === 'stroke') { ctx.lineWidth = s.width; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(P(s.d)); }
    else { ctx.beginPath(); (ctx as any).roundRect ? (ctx as any).roundRect(s.x, s.y, s.w, s.h, Math.min(s.rx, s.w / 2, s.h / 2)) : ctx.rect(s.x, s.y, s.w, s.h); ctx.fill(); }
  }
}

let off: HTMLCanvasElement | null = null;
// t = tiempo de la coreografía (frames a 30 fps, sin tempo)
// mono: un solo color para todo (ej. '#fff'); las estelas quedan más tenues para que se lea el movimiento
export function draw(canvas: HTMLCanvasElement, t: number, pass: 'completo' | 'logo' | 'estelas' = 'completo', mono?: string, ink?: string) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  const W = Math.round(w * dpr), H = Math.round(h * dpr);
  if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
  const frame = t * SETTINGS.tempo; // fps 30
  const cam = mul([dpr, 0, 0, dpr, 0, 0], parse(cameraAt(frame, 30, w, h)));
  for (const l of layersAt(frame, 30, { pass, exit: false })) {
    const m = l.transform ? mul(cam, parse(l.transform)) : cam;
    let c = ctx;
    if (l.mask && l.mask.kind === 'stroke') {
      off = off || document.createElement('canvas');
      if (off.width !== W || off.height !== H) { off.width = W; off.height = H; }
      c = off.getContext('2d')!; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
    }
    const alpha = mono && l.key.includes('-estela-') ? l.opacity * 0.3 : l.opacity;
    c.save(); c.setTransform(...m); c.globalAlpha = c === ctx ? alpha : 1;
    if (l.clip) { c.beginPath(); c.rect(l.clip.x, l.clip.y, l.clip.w, l.clip.h); c.clip(); }
    if (l.mask && l.mask.kind === 'fill') c.clip(P(l.mask.d));
    shapes(c, l, mono, ink);
    if (l.mask && l.mask.kind === 'stroke') {
      c.globalAlpha = 1; c.globalCompositeOperation = 'destination-in';
      c.lineWidth = l.mask.width; c.lineCap = 'round'; c.lineJoin = 'round';
      c.setLineDash([l.mask.drawn, l.mask.total + 50]); c.strokeStyle = '#fff'; c.stroke(P(l.mask.d));
      c.restore();
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = alpha; ctx.drawImage(off!, 0, 0); ctx.restore();
    } else c.restore();
  }
}

// Momentos clave (tiempo de coreografía): de aquí en adelante se puede repetir el ciclo de palabras
export const LOOP_FROM = 170;
export const FIN = SEQ.fin;
export const SPEED = 30 / SETTINGS.tempo; // unidades de t por segundo
export const WORDS = SEQ.palabras.map((p) => ({ texto: p.texto, abre: p.abre, cierra: p.abre + p.dur + p.quieta + p.cierra }));
