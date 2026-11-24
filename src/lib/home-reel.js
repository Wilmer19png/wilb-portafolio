// HomeReel: el reel del Inicio sigue al logo.
// Cada proyecto = un ciclo de palabras del logo (BLUR → FOCUS → LIT) + una pausa con el logo cerrado.
// Los fragmentos de cada proyecto se encadenan uno tras otro, sin repetir; al final de la pausa
// el siguiente proyecto entra encima, todavía desenfocado, y el logo arranca su nuevo ciclo.
import { logos, HOLD_MS } from './logo/mount';
import { LOOP_FROM, FIN, SPEED } from './logo/canvas';

const smooth = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
const pad = (n) => String(n).padStart(2, '0');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const EXTRA_MS = 3000; // cuánto más puede durar un proyecto si tiene material de sobra
const XFADE_MS = 1200; // entrada del siguiente proyecto

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
  const hd = innerWidth > 900 && devicePixelRatio * innerWidth > 1300;
  const clipsOf = (capa) => JSON.parse(capa.dataset.clips || '[]');

  let i = 0;
  let dir = 1;
  let lastCycle = 0;
  let segStart = performance.now();
  let target = 0;
  let fase = '';

  /* ---------- videos: los fragmentos de un proyecto, encadenados ---------- */
  const videoFor = (capa, k) => {
    let v = capa.querySelector(`video[data-k="${k}"]`);
    if (v || !useVideo) return v;
    const clip = clipsOf(capa)[k];
    if (!clip) return null;
    v = document.createElement('video');
    Object.assign(v, { muted: true, loop: false, playsInline: true, preload: 'auto' });
    v.dataset.k = k;
    v.setAttribute('aria-hidden', 'true');
    v.src = hd ? clip.hd : clip.sd;
    v.addEventListener('playing', () => {
      v.classList.add('is-ready');
      capa.querySelectorAll('video').forEach((o) => { if (o !== v) o.classList.remove('is-ready'); });
    });
    // Al terminar un fragmento sigue el siguiente; el último se queda en su cuadro final
    v.addEventListener('ended', () => playClip(capa, k + 1));
    v.addEventListener('timeupdate', () => { if (v.duration - v.currentTime < 3) videoFor(capa, k + 1); });
    capa.append(v);
    return v;
  };
  function playClip(capa, k) {
    const v = videoFor(capa, k);
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {});
  }
  const stopCapa = (capa) => capa.querySelectorAll('video').forEach((v) => { v.pause(); v.classList.remove('is-ready'); });
  const isPlaying = (capa) => [...capa.querySelectorAll('video')].some((v) => !v.paused);

  /* ---------- duración de cada proyecto ---------- */
  const segmentMs = (capa, intro) => {
    const logoMs = ((intro ? FIN : FIN - LOOP_FROM) / SPEED) * 1000;
    const minMs = logoMs + HOLD_MS;
    const material = clipsOf(capa).reduce((a, c) => a + c.dur, 0) * 1000;
    return Math.max(minMs, Math.min(material, minMs + EXTRA_MS));
  };

  /* ---------- textos ---------- */
  const show = (n) => {
    const c = capas[n];
    folio.innerHTML = `<span class="folio"><b>${pad(n + 1)} - ${pad(N)}</b>&nbsp; ${esc(c.dataset.title)}</span>`;
    play.href = c.dataset.href;
    play.setAttribute('aria-label', `${play.dataset.label}: ${c.dataset.name}`);
    if (anuncio) anuncio.textContent = c.dataset.title;
  };

  const go = (n, intro = false) => {
    capas.forEach((c, k) => {
      c.classList.toggle('is-on', k === n);
      c.classList.remove('is-next');
      c.style.opacity = '';
      if (k !== n) stopCapa(c);
    });
    i = n;
    segStart = performance.now();
    target = segmentMs(capas[n], intro);
    show(i);
    if (!isPlaying(capas[n])) playClip(capas[n], 0); // si ya entró en el cruce, sigue corriendo
  };

  const setFase = (f) => {
    if (f === fase) return;
    fase = f;
    Object.entries(fases).forEach(([k, el]) => el.classList.toggle('is-on', k === f));
  };

  /* ---------- cada cuadro del logo ---------- */
  const tick = (t, cycle) => {
    if (cycle !== lastCycle) {
      lastCycle = cycle;
      go((i + dir + N) % N);
      dir = 1;
    }
    const now = performance.now();
    const el = now - segStart;
    const intro = cycle === 0;
    // entra desenfocado y se enfoca de a poco (en la primera vuelta, mientras el logo se arma)
    const blur = intro ? 14 * (1 - smooth(40, 85, t)) : 14 * (1 - smooth(100, 1600, el));
    const luz = 1 + 0.12 * smooth(374, 410, t);
    const filtro = `blur(${blur.toFixed(2)}px) brightness(${luz.toFixed(3)})`;
    capas[i].querySelectorAll('img, video').forEach((m) => { m.style.filter = filtro; });

    // el siguiente proyecto se prepara y entra encima, todavía desenfocado
    const nx = (i + 1) % N;
    if (nx !== i) {
      const next = capas[nx];
      if (el > target - 4000) videoFor(next, 0);
      const cruce = smooth(target - XFADE_MS, target, el);
      next.classList.toggle('is-next', cruce > 0);
      next.style.opacity = cruce > 0 ? cruce.toFixed(3) : '';
      if (cruce > 0) {
        next.querySelectorAll('img, video').forEach((m) => { m.style.filter = 'blur(14px)'; });
        const v = next.querySelector('video[data-k="0"]');
        if (v && v.paused && dir === 1) v.play().catch(() => {});
      }
    }

    bar.style.transform = `scaleX(${Math.min(1, el / target).toFixed(4)})`;
    setFase(blur > 0.5 ? 'blur' : t < 374 ? 'focus' : 'lit');
  };

  /* ---------- flechas ---------- */
  const manual = (d) => {
    if (logo && !reduce) { dir = d; logo.restartCycle(); return; }
    go((i + d + N) % N); // sin animación: cambio directo
  };
  root.querySelector('[data-prev]')?.addEventListener('click', () => manual(-1));
  root.querySelector('[data-next]')?.addEventListener('click', () => manual(1));

  /* ---------- pausar si la pestaña no se ve ---------- */
  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { hiddenAt = performance.now(); capas[i].querySelectorAll('video').forEach((v) => v.pause()); return; }
    if (hiddenAt) segStart += performance.now() - hiddenAt;
    capas[i].querySelector('video.is-ready')?.play().catch(() => {});
  });

  go(0, true);
  if (reduce || !logo) {
    setFase('lit');
    bar.style.transform = 'scaleX(1)';
    return;
  }
  // El logo se queda cerrado hasta que el proyecto termina
  logo.holdWhile(() => performance.now() - segStart < target);
  logo.onTick(tick);
}
