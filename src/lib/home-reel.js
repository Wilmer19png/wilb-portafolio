// HomeReel: el reel del Inicio sigue al logo. Cada proyecto dura un ciclo de palabras del logo:
// entra desenfocado y se enfoca de a poco (BLUR), queda nítido (FOCUS) y al final sube la luz (LIT);
// en el último tramo el siguiente proyecto entra encima, todavía desenfocado.
import { logos } from './logo/mount';
import { LOOP_FROM, FIN } from './logo/canvas';

const smooth = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
const pad = (n) => String(n).padStart(2, '0');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export function initHomeReel(root) {
  const capas = [...root.querySelectorAll('.homereel__capa')];
  const N = capas.length;
  if (!N) return;
  const logo = logos.get(document.querySelector('.header canvas[data-logo]'));
  const folio = root.querySelector('[data-folio]');
  const bar = root.querySelector('[data-progress]');
  const play = root.querySelector('[data-play]');
  const anuncio = root.querySelector('[data-anuncio]');
  const fases = Object.fromEntries([...root.querySelectorAll('[data-fase]')].map((el) => [el.dataset.fase, el]));

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = navigator.connection?.saveData === true;
  const useVideo = !reduce && !saveData;

  let i = 0;
  let dir = 1;
  let lastCycle = 0;
  let sound = false;
  let fase = '';

  /* ---- videos: solo el actual y el siguiente; los demás quietos y sin descargar ---- */
  const videoOf = (n) => {
    const capa = capas[n];
    let v = capa.querySelector('video');
    if (!v && useVideo) {
      v = document.createElement('video');
      Object.assign(v, { muted: !sound, loop: true, playsInline: true, preload: 'auto' });
      v.setAttribute('aria-hidden', 'true');
      v.addEventListener('playing', () => v.classList.add('is-ready'), { once: true });
      v.src = capa.dataset.video;
      capa.append(v);
    }
    return v;
  };
  const start = (n) => { const v = videoOf(n); if (v) { v.muted = !sound; v.play().catch(() => {}); } };
  const stop = (n) => { const v = capas[n].querySelector('video'); if (v) v.pause(); };

  /* ---- textos ---- */
  const show = (n) => {
    const c = capas[n];
    folio.innerHTML = `<span class="folio"><b>${pad(n + 1)} - ${pad(N)}</b>&nbsp; ${esc(c.dataset.title)}</span>`;
    play.href = c.dataset.href;
    play.setAttribute('aria-label', `${play.dataset.label}: ${c.dataset.name}`);
    if (anuncio) anuncio.textContent = c.dataset.title;
  };

  const go = (n) => {
    capas.forEach((c, k) => {
      c.classList.toggle('is-on', k === n);
      c.classList.remove('is-next');
      c.style.opacity = '';
      if (k !== n && k !== (n + 1) % N) stop(k);
    });
    i = n;
    show(i);
    start(i);
  };

  const setFase = (f) => {
    if (f === fase) return;
    fase = f;
    Object.entries(fases).forEach(([k, el]) => el.classList.toggle('is-on', k === f));
  };

  /* ---- cada cuadro del logo ---- */
  const tick = (t, cycle) => {
    if (cycle !== lastCycle) {
      lastCycle = cycle;
      go((i + dir + N) % N);
      dir = 1;
    }
    const intro = cycle === 0;
    const blur = intro ? 14 * (1 - smooth(40, 85, t)) : 14 * (1 - smooth(172, 212, t));
    const luz = 1 + 0.12 * smooth(374, 410, t);
    const cruce = smooth(488, FIN, t);
    const cur = capas[i];
    const nx = (i + 1) % N;
    const filtro = `blur(${blur.toFixed(2)}px) brightness(${luz.toFixed(3)})`;
    cur.querySelectorAll('img, video').forEach((el) => { el.style.filter = filtro; });

    // el siguiente entra encima, todavía desenfocado
    const next = capas[nx];
    if (nx !== i) {
      next.classList.toggle('is-next', cruce > 0);
      next.style.opacity = cruce > 0 ? cruce.toFixed(3) : '';
      next.querySelectorAll('img, video').forEach((el) => { el.style.filter = 'blur(14px)'; });
      if (t > 440) start(nx);
    }

    const prog = intro ? t / FIN : (t - LOOP_FROM) / (FIN - LOOP_FROM);
    bar.style.transform = `scaleX(${Math.min(1, Math.max(0, prog)).toFixed(4)})`;
    setFase(blur > 0.5 ? 'blur' : t < 374 ? 'focus' : 'lit');
  };

  /* ---- flechas ---- */
  const manual = (d) => {
    if (logo && !reduce) { dir = d; logo.restartCycle(); return; }
    go((i + d + N) % N); // sin animación: cambio directo
  };
  root.querySelector('[data-prev]')?.addEventListener('click', () => manual(-1));
  root.querySelector('[data-next]')?.addEventListener('click', () => manual(1));

  /* ---- sonido (botón del pie) ---- */
  window.addEventListener('wilb:sonido', (e) => {
    sound = e.detail.on;
    capas.forEach((c) => { const v = c.querySelector('video'); if (v) v.muted = !sound; });
  });

  /* ---- pausar si la pestaña no se ve ---- */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) capas.forEach((_, k) => stop(k));
    else start(i);
  });

  go(0);
  if (reduce || !logo) {
    setFase('lit');
    bar.style.transform = 'scaleX(1)';
    return;
  }
  logo.onTick(tick);
}
