// Arranca cada <canvas data-logo> de la página.
//   data-mode="intro"  se arma una vez (con estelas) y queda quieto
//   data-mode="loop"   después de armarse repite el ciclo de palabras BLUR / FOCUS / LIT,
//                      con una pausa en el logo cerrado (las 4 barras escalonadas) entre ciclos
//   data-color="#fff"  todo en un color (sin él, a color)
// Con «reducir movimiento» se dibuja directo el logo terminado.
import { draw, LOOP_FROM, FIN, SPEED } from './canvas';

export type LogoTick = (t: number, cycle: number, holding: boolean) => void;

/** Pausa mínima en el logo cerrado entre un ciclo de palabras y el siguiente (ms). */
export const HOLD_MS = 2600;

export interface LogoController {
  /** Tiempo actual de la coreografía (frames a 30 fps sin tempo). */
  readonly t: number;
  /** Se llama en cada cuadro: el reel del Inicio se sincroniza con esto. */
  onTick(fn: LogoTick): void;
  /** Mientras devuelva false, el logo se queda cerrado aunque ya pasó la pausa mínima. */
  holdWhile(fn: () => boolean): void;
  /** Salta al comienzo de un ciclo de palabras (al cambiar de proyecto a mano). */
  restartCycle(): void;
  setColor(color: string): void;
  /** Color de las letras cuando el logo va a color (grafito en modo claro). */
  setInk(color: string): void;
  /** Redibuja el cuadro actual (para la pintura del mouse cuando el logo ya está quieto). */
  repaint(): void;
  /** Algo que se dibuja encima del logo en cada cuadro (la pintura del mouse en el Inicio). */
  setOverlay(fn: ((canvas: HTMLCanvasElement) => void) | null): void;
}

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function mountLogo(canvas: HTMLCanvasElement): LogoController {
  const loop = canvas.dataset.mode === 'loop';
  let color = canvas.dataset.color || undefined;
  let ink: string | undefined;
  let t = 0;
  let cycle = 0;
  let intro = true;
  let start = performance.now();
  let holdFrom = 0; // > 0 mientras el logo está en pausa, cerrado
  let raf = 0;
  let keepHolding: () => boolean = () => false;
  const listeners: LogoTick[] = [];
  let overlay: ((canvas: HTMLCanvasElement) => void) | null = null;

  const paint = () => { draw(canvas, t, 'completo', color, ink); overlay?.(canvas); };
  const emit = () => listeners.forEach((fn) => fn(t, cycle, holdFrom > 0));
  const nextCycle = (now: number) => { intro = false; holdFrom = 0; start = now; cycle += 1; t = LOOP_FROM; };

  const frame = (now: number) => {
    if (holdFrom) {
      // Pausa en el logo cerrado
      if (now - holdFrom >= HOLD_MS && !keepHolding()) nextCycle(now);
    } else {
      t = (intro ? 0 : LOOP_FROM) + ((now - start) / 1000) * SPEED;
      if (t >= FIN) {
        t = FIN - 0.01;
        if (!loop) { paint(); emit(); raf = 0; return; }
        holdFrom = now;
      }
    }
    paint();
    emit();
    raf = requestAnimationFrame(frame);
  };

  if (reduce()) { t = FIN - 0.01; paint(); }
  else raf = requestAnimationFrame(frame);

  // Si cambia el tamaño, redibujar el cuadro actual
  new ResizeObserver(() => paint()).observe(canvas);

  return {
    get t() { return t; },
    onTick(fn) { listeners.push(fn); },
    holdWhile(fn) { keepHolding = fn; },
    restartCycle() {
      if (!loop || reduce()) return;
      nextCycle(performance.now());
      if (!raf) raf = requestAnimationFrame(frame);
    },
    setColor(c) { color = c || undefined; paint(); },
    setOverlay(fn) { overlay = fn; },
    setInk(c) { ink = c || undefined; paint(); },
    repaint() { if (!raf) paint(); },
  };
}

export const logos = new Map<HTMLCanvasElement, LogoController>();

export function mountAll(root: ParentNode = document) {
  root.querySelectorAll<HTMLCanvasElement>('canvas[data-logo]').forEach((c) => {
    if (!logos.has(c)) logos.set(c, mountLogo(c));
  });
}
