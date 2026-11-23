// Arranca cada <canvas data-logo> de la página.
//   data-mode="intro"  se arma una vez (con estelas) y queda quieto
//   data-mode="loop"   después de armarse repite el ciclo de palabras BLUR / FOCUS / LIT
//   data-color="#fff"  todo en un color (sin él, a color)
// Con «reducir movimiento» se dibuja directo el logo terminado.
import { draw, LOOP_FROM, FIN, SPEED } from './canvas';

export type LogoTick = (t: number, cycle: number) => void;

export interface LogoController {
  /** Tiempo actual de la coreografía (frames a 30 fps sin tempo). */
  readonly t: number;
  /** Se llama en cada cuadro: el reel del Inicio se sincroniza con esto. */
  onTick(fn: LogoTick): void;
  /** Salta al comienzo de un ciclo de palabras (al cambiar de proyecto a mano). */
  restartCycle(): void;
  setColor(color: string): void;
}

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function mountLogo(canvas: HTMLCanvasElement): LogoController {
  const loop = canvas.dataset.mode === 'loop';
  let color = canvas.dataset.color || undefined;
  let t = 0;
  let cycle = 0;
  let intro = true;
  let start = performance.now();
  let raf = 0;
  const listeners: LogoTick[] = [];

  const paint = () => draw(canvas, t, 'completo', color);

  const frame = (now: number) => {
    if (intro) {
      t = ((now - start) / 1000) * SPEED;
      if (t >= FIN) {
        if (!loop) { t = FIN - 0.01; paint(); listeners.forEach((fn) => fn(t, cycle)); raf = 0; return; }
        intro = false; start = now; cycle += 1; t = LOOP_FROM;
      }
    } else {
      t = LOOP_FROM + ((now - start) / 1000) * SPEED;
      if (t >= FIN) { start = now; cycle += 1; t = LOOP_FROM; }
    }
    paint();
    listeners.forEach((fn) => fn(t, cycle));
    raf = requestAnimationFrame(frame);
  };

  if (reduce()) { t = FIN - 0.01; paint(); }
  else raf = requestAnimationFrame(frame);

  // Si cambia el tamaño, redibujar el cuadro actual
  new ResizeObserver(() => paint()).observe(canvas);

  return {
    get t() { return t; },
    onTick(fn) { listeners.push(fn); },
    restartCycle() {
      if (!loop || reduce()) return;
      intro = false; start = performance.now(); cycle += 1; t = LOOP_FROM;
      if (!raf) raf = requestAnimationFrame(frame);
    },
    setColor(c) { color = c || undefined; paint(); },
  };
}

export const logos = new Map<HTMLCanvasElement, LogoController>();

export function mountAll(root: ParentNode = document) {
  root.querySelectorAll<HTMLCanvasElement>('canvas[data-logo]').forEach((c) => {
    if (!logos.has(c)) logos.set(c, mountLogo(c));
  });
}
