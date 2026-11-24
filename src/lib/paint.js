// Inicio: por donde pasa el mouse, las letras blancas se pintan con un degradado de los colores
// de la marca (amarillo → naranja → rojo → azul) que deja una estela corta y se apaga al salir.
// Truco: cada texto usa su propio fondo recortado a las letras (background-clip: text);
// el fondo es hueso y encima van los degradados, puestos donde está el mouse.

const BRAND = ['#f5c518', '#f27a1a', '#d62828', '#1f3fbf'];
const TRAIL = 6;
const R = 170; // radio del pincel (px)
const SELECTOR = '.chaptertitle > span, .homereel__bio b, .homereel__bio p, .homereel__bio a, .homereel__play-txt, [data-folio], .signature, .lightswitch';

export function initPaint(root) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const els = [...root.querySelectorAll(SELECTOR)];
  els.forEach((el) => el.classList.add('pinta'));
  root.classList.add('pinta-on');

  const target = { x: -9999, y: -9999 };
  const pts = Array.from({ length: TRAIL }, () => ({ x: -9999, y: -9999 }));
  let inside = false;
  let alpha = 0;
  let raf = 0;

  const brush = (x, y, r, k) => (k === 0
    ? `radial-gradient(circle ${r}px at ${x}px ${y}px, ${BRAND[0]} 0%, ${BRAND[1]} 26%, ${BRAND[2]} 50%, ${BRAND[3]} 72%, rgb(31 63 191 / 0) 100%)`
    : `radial-gradient(circle ${r}px at ${x}px ${y}px, ${BRAND[k % 4]} 0%, rgb(0 0 0 / 0) 72%)`);

  const frame = () => {
    alpha += ((inside ? 1 : 0) - alpha) * 0.08;
    // la cabeza sigue al mouse; cada punto de la estela sigue al anterior
    pts[0].x += (target.x - pts[0].x) * 0.3;
    pts[0].y += (target.y - pts[0].y) * 0.3;
    for (let k = 1; k < TRAIL; k++) {
      pts[k].x += (pts[k - 1].x - pts[k].x) * 0.32;
      pts[k].y += (pts[k - 1].y - pts[k].y) * 0.32;
    }
    els.forEach((el) => {
      const b = el.getBoundingClientRect();
      if (alpha < 0.01) { el.style.backgroundImage = ''; return; }
      const layers = pts.map((p, k) => brush((p.x - b.left).toFixed(1), (p.y - b.top).toFixed(1), (R * alpha * (1 - k * 0.11)).toFixed(1), k));
      el.style.backgroundImage = `${layers.join(', ')}, linear-gradient(var(--color-hueso), var(--color-hueso))`;
    });
    const settled = !inside && alpha < 0.01;
    raf = settled ? 0 : requestAnimationFrame(frame);
  };
  const wake = () => { if (!raf) raf = requestAnimationFrame(frame); };

  root.addEventListener('pointermove', (e) => {
    if (!inside) pts.forEach((p) => { p.x = e.clientX; p.y = e.clientY; }); // al entrar, la estela nace en el mouse
    inside = true;
    target.x = e.clientX;
    target.y = e.clientY;
    wake();
  });
  root.addEventListener('pointerleave', () => { inside = false; wake(); });
}
