// LogoIdent (brief §2.0): antes de la historia, como las productoras antes de la película.
// Negro → se enciende el tubo (línea que se abre) → el logo se arma despacio con efecto de televisor
// → pausa con el logo cerrado → se funde a negro → desde el negro aparece la página, despacio.
// Se salta con clic, toque o cualquier tecla. Con «reducir movimiento» no aparece.
import { draw, LOOP_FROM } from './logo/canvas';

const ease = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
const lerp = (a, b, k) => a + (b - a) * k;

// Tiempos en segundos (≈ 9,3 s más la entrada de la página; se puede saltar en cualquier momento)
const T = { line: 0.45, open: 0.8, opened: 1.15, logo0: 1.1, logo1: 7.1, fade: 8.0, black: 9.3 };
const PAGE_IN_MS = 1400; // el negro se disuelve y aparece la página

/** Devuelve una promesa que se cumple cuando la pantalla ya está en negro y empieza a aparecer la página. */
export function runIdent(el) {
  return new Promise((resolve) => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.remove(); resolve(); return; }

    const screen = el.querySelector('.logoident__pantalla');
    const logoCv = el.querySelector('.logoident__logo');
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const W = Math.round(innerWidth * dpr);
    const H = Math.round(innerHeight * dpr);
    screen.width = W; screen.height = H;

    // La imagen que entra al televisor: fondo negro con el logo centrado y aire alrededor
    const src = document.createElement('canvas');
    src.width = W; src.height = H;
    const sctx = src.getContext('2d');
    const lw = Math.min(W * (W > H ? 0.52 : 0.8), 1500 * dpr);
    const lh = lw * (204 / 760); // misma proporción que el canvas del logo (760 × 204)

    let crt = null;
    let t0 = 0;
    let raf = 0;
    let skipAt = 0;
    let done = false;
    const m = /ident=([0-9.]+)/.exec(location.hash);
    const frozen = m ? Number(m[1]) : null; // prueba: #ident=3 congela la apertura en ese segundo

    // Ya en negro: el negro se disuelve y la página entra con sus animaciones
    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      crt?.destroy();
      el.classList.add('is-done');
      resolve();
      setTimeout(() => el.remove(), PAGE_IN_MS + 100);
    };

    const frame = (now) => {
      let s = (now - t0) / 1000;
      if (skipAt) s = T.fade + (now - skipAt) / 1000; // saltar: va directo al fundido
      if (frozen !== null) s = frozen;

      // el logo se arma despacio desde el principio hasta quedar cerrado (t = LOOP_FROM)
      const lt = ease(T.logo0, T.logo1, s) * LOOP_FROM;
      draw(logoCv, Math.max(lt, 0.01), 'completo');
      sctx.fillStyle = '#000';
      sctx.fillRect(0, 0, W, H);
      sctx.drawImage(logoCv, (W - lw) / 2, (H - lh) / 2, lw, lh);

      // tubo: encendido (línea horizontal que se abre); al final, fundido a negro
      let sx = 1, sy = 1, glow = 0;
      if (s < T.line) { sx = 0; sy = 0.003; }
      else if (s < T.open) { sx = ease(T.line, T.open, s); sy = 0.003; glow = 1; }
      else if (s < T.opened + 0.15) { sy = lerp(0.003, 1, ease(T.open, T.opened, s)); glow = 1 - ease(T.open, T.opened + 0.15, s); }
      const fade = 1 - ease(T.fade, T.black, s);

      if (crt) crt.render(src, s, { sx, sy, glow, fade });
      else drawFallback(screen.getContext('2d'), src, W, H, { sx, sy, glow, fade });

      if (s >= T.black && frozen === null) { finish(); return; }
      raf = requestAnimationFrame(frame);
    };

    const start = (glMod) => {
      if (glMod) crt = glMod.createCRT(screen);
      if (!crt) el.classList.add('is-fallback'); // sin WebGL: la imagen tal cual con barrido en CSS
      t0 = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const skip = () => { if (!skipAt && t0 && (performance.now() - t0) / 1000 < T.fade) skipAt = performance.now(); };
    el.addEventListener('pointerdown', skip);
    addEventListener('keydown', skip, { once: true });
    el.querySelector('.logoident__saltar')?.addEventListener('click', (e) => { e.stopPropagation(); skip(); });

    if (!navigator.connection?.saveData) import('./crt.js').then(start).catch(() => start(null));
    else start(null);
  });
}

// Sin WebGL: la misma secuencia dibujada en 2D
function drawFallback(c, src, W, H, { sx, sy, glow, fade }) {
  c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
  c.save();
  c.globalAlpha = fade;
  c.translate(W / 2, H / 2); c.scale(Math.max(sx, 0.001), Math.max(sy, 0.001)); c.translate(-W / 2, -H / 2);
  c.drawImage(src, 0, 0);
  if (glow > 0) { c.globalAlpha = glow * fade; c.fillStyle = '#fbf9f3'; c.fillRect(0, 0, W, H); }
  c.restore();
}

/** «Apaga la luz»: el interruptor baja, la página se va a negro y entra la historia. */
export function initLightsOff() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-apagar]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    e.preventDefault();
    a.classList.add('is-apagando');
    document.documentElement.classList.add('apagando');
    setTimeout(() => { location.href = a.href; }, 650);
  });
}
