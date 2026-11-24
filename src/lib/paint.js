// Pintura con el mouse: por donde pasa, el texto (y el logo) se pinta con un degradado de los colores
// de la marca (amarillo → naranja → rojo → azul) que deja una estela corta y se apaga al salir.
//  · Textos: fondo recortado a las letras (background-clip: text) con los degradados encima.
//  · Aros del PLAY (Inicio): el mismo fondo, recortado al borde con una máscara.
//  · Logo: los degradados se dibujan dentro del canvas, solo sobre el logo (source-atop).
//  · Fondo (resto de páginas): una capa detrás del contenido con los mismos colores, granulada.
// Solo con mouse y sin «reducir movimiento».

import { logos } from './logo/mount';
import { drawWater } from './agua.js';

// Agua (forma orgánica + reflejos) con la CSS Paint API (Chrome/Edge); si no, degradado redondo
const WORKLET = typeof CSS !== 'undefined' && 'paintWorklet' in CSS;
if (WORKLET) CSS.paintWorklet.addModule('/worklets/agua.js');

const TRAIL = 6;
const STOPS = '#f5c518 0%, #f4a019 14%, #f27a1a 30%, #e4512a 44%, #d62828 56%, #9a3270 68%, #5b3a9c 78%, #1f3fbf 88%, rgb(31 63 191 / 0) 100%';

export const PRESETS = {
  home: {
    texts: '.chaptertitle > span, .homereel__bio b, .homereel__bio p, .homereel__bio a, .homereel__play-txt, [data-folio], .signature, .lightswitch',
    rings: '.homereel__aro',
    base: 'currentColor',
    radius: 170,
    background: false,
  },
  pages: {
    texts: '.chaptertitle > span, .workcard__pie, .signature, .footer__fosforo, .proyecto__sinopsis, .proyecto__aprendi h2, .proyecto__nav b, .credits, .proyecto__rakun, .lightswitch',
    rings: '',
    base: 'currentColor',
    radius: 150,
    background: true,
  },
};

export function initPaint(root, preset = PRESETS.home) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const texts = [...root.querySelectorAll(preset.texts)];
  const rings = preset.rings ? [...root.querySelectorAll(preset.rings)] : [];
  [...texts, ...rings].forEach((el) => el.classList.add('pinta'));
  document.documentElement.classList.add('pinta-on');
  if (WORKLET) document.documentElement.classList.add('agua');
  const canvas = document.querySelector('.header canvas[data-logo]');
  const logo = canvas && logos.get(canvas);

  let fondo = null;
  if (preset.background) {
    fondo = document.createElement('div');
    fondo.className = 'fondo-pinta';
    fondo.setAttribute('aria-hidden', 'true');
    document.body.prepend(fondo);
  }

  const R = preset.radius;
  const target = { x: -9999, y: -9999 };
  const pts = Array.from({ length: TRAIL }, () => ({ x: -9999, y: -9999 }));
  let inside = false;
  let alpha = 0;
  let raf = 0;

  const radius = (k, scale = 1) => R * scale * alpha * (1 - k * 0.11);

  /* ---- CSS: textos, aros y fondo ---- */
  // Degradado suave y parejo (con pasos intermedios): todos los puntos de la estela usan el mismo
  const brush = (x, y, r) => `radial-gradient(circle ${r}px at ${x}px ${y}px, ${STOPS})`;
  const layersFor = (el, base) => {
    const b = el.getBoundingClientRect();
    if (b.bottom < -R || b.top > innerHeight + R) return null; // fuera de pantalla: no tocar
    const layers = pts.map((p, k) => brush((p.x - b.left).toFixed(1), (p.y - b.top).toFixed(1), radius(k).toFixed(1)));
    return `${layers.join(', ')}, linear-gradient(${base}, ${base})`;
  };
  // Con el worklet: solo se pasan los puntos (relativos a cada elemento) y el tiempo
  const ptsFor = (ox, oy, scale = 1) => pts.map((p, k) => `${(p.x - ox).toFixed(1)},${(p.y - oy).toFixed(1)},${radius(k, scale).toFixed(1)}`).join('|');
  const setWater = (el, value, t) => { el.style.setProperty('--agua-pts', value); el.style.setProperty('--agua-t', t); };

  /* ---- canvas: el logo ---- */
  const paintLogo = (cv) => {
    if (alpha < 0.01) return;
    const b = cv.getBoundingClientRect();
    if (!b.width) return;
    const s = cv.width / b.width;
    const ctx = cv.getContext('2d');
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-atop'; // solo donde ya hay logo
    const local = pts.map((p, k) => ({ x: (p.x - b.left) * s, y: (p.y - b.top) * s, r: radius(k) * s }));
    drawWater(ctx, local, performance.now() / 1000, cv.width, cv.height);
    ctx.restore();
  };
  logo?.setOverlay(paintLogo);

  const frame = () => {
    alpha += ((inside ? 1 : 0) - alpha) * 0.08;
    // la cabeza sigue al mouse; cada punto de la estela sigue al anterior
    pts[0].x += (target.x - pts[0].x) * 0.3;
    pts[0].y += (target.y - pts[0].y) * 0.3;
    for (let k = 1; k < TRAIL; k++) {
      pts[k].x += (pts[k - 1].x - pts[k].x) * 0.32;
      pts[k].y += (pts[k - 1].y - pts[k].y) * 0.32;
    }
    const off = alpha < 0.01;
    if (WORKLET) {
      const t = (performance.now() / 1000).toFixed(3);
      [...texts, ...rings].forEach((el) => {
        if (off) { setWater(el, '', t); return; }
        const b = el.getBoundingClientRect();
        if (b.bottom < -R || b.top > innerHeight + R) return;
        setWater(el, ptsFor(b.left, b.top), t);
      });
      if (fondo) setWater(fondo, off ? '' : ptsFor(0, 0, 2.4), t);
      logo?.repaint();
      raf = !inside && off ? 0 : requestAnimationFrame(frame);
      return;
    }
    texts.forEach((el) => {
      if (off) { el.style.backgroundImage = ''; return; }
      const l = layersFor(el, preset.base);
      if (l) el.style.backgroundImage = l;
    });
    rings.forEach((el) => { el.style.backgroundImage = off ? '' : layersFor(el, 'rgb(243 239 230 / .75)') ?? ''; });
    if (fondo) {
      fondo.style.backgroundImage = off ? '' : pts.map((p, k) => brush(p.x.toFixed(1), p.y.toFixed(1), radius(k, 2.4).toFixed(1))).join(', ');
    }
    logo?.repaint(); // el logo quieto (ya armado) también recibe la pintura
    raf = !inside && off ? 0 : requestAnimationFrame(frame);
  };
  const wake = () => { if (!raf) raf = requestAnimationFrame(frame); };

  // Toda la página: el header (con el logo) también cuenta
  document.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    if (!inside) pts.forEach((p) => { p.x = e.clientX; p.y = e.clientY; }); // al entrar, la estela nace en el mouse
    inside = true;
    target.x = e.clientX;
    target.y = e.clientY;
    wake();
  });
  document.documentElement.addEventListener('pointerleave', () => { inside = false; wake(); });

  // Prueba: #pinta=x,y deja el pincel quieto en ese punto
  const test = /pinta=([0-9]+),([0-9]+)/.exec(location.hash);
  if (test) {
    inside = true; alpha = 1;
    target.x = +test[1]; target.y = +test[2];
    pts.forEach((p, k) => { p.x = target.x - k * 38; p.y = target.y + k * 10; });
    wake();
  }
  window.addEventListener('blur', () => { inside = false; wake(); });
}
