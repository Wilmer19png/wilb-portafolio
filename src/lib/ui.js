// Comportamiento de los organismos: menú del celular, tono oscuro / claro y sonido.
import { logos } from './logo/mount';

const root = document.documentElement;
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
};

/* ---------- Tono (Sobre mí y Contacto) ---------- */
function applyTone(claro) {
  if (claro) root.dataset.tono = 'claro'; else delete root.dataset.tono;
  document.querySelectorAll('[data-tone-toggle]').forEach((b) => b.setAttribute('aria-pressed', String(claro)));
  // El logo de esas páginas es de un solo color: blanco en oscuro, grafito en claro
  document.querySelectorAll('.header canvas[data-logo][data-color]').forEach((c) => {
    logos.get(c)?.setColor(claro ? '#1c1c1c' : '#ffffff');
  });
}

function initTone() {
  const toggles = document.querySelectorAll('[data-tone-toggle]');
  if (!toggles.length) return;
  applyTone(root.dataset.tono === 'claro');
  toggles.forEach((b) => b.addEventListener('click', () => {
    const claro = root.dataset.tono !== 'claro';
    store.set('wilb:tono', claro ? 'claro' : 'oscuro');
    applyTone(claro);
  }));
}

/* ---------- Menú del celular ---------- */
function initMenu() {
  const menu = document.getElementById('menu-movil');
  const opener = document.querySelector('[data-menu-open]');
  if (!menu || !opener) return;
  const focusables = () => [...menu.querySelectorAll('a[href], button:not([disabled])')];

  const close = () => {
    menu.hidden = true;
    opener.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    opener.focus();
  };
  const onKey = (e) => {
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    const f = focusables();
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  opener.addEventListener('click', () => {
    menu.hidden = false;
    opener.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    menu.querySelector('[data-menu-close]')?.focus();
  });
  menu.querySelector('[data-menu-close]')?.addEventListener('click', close);
  // Si la pantalla vuelve a ser ancha con el menú abierto, cerrarlo
  matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches && !menu.hidden) close(); });
}

/* ---------- Sonido (el sistema de sonido llega en la fase 12) ---------- */
function initSound() {
  const buttons = document.querySelectorAll('[data-sound-toggle]');
  if (!buttons.length) return;
  const set = (on) => {
    buttons.forEach((b) => {
      b.setAttribute('aria-pressed', String(on));
      b.setAttribute('aria-label', on ? b.dataset.labelOff : b.dataset.labelOn);
    });
    // Arranca apagado en cada visita: el navegador no deja sonar nada sin un clic
    window.dispatchEvent(new CustomEvent('wilb:sonido', { detail: { on } }));
  };
  buttons.forEach((b) => b.addEventListener('click', () => set(b.getAttribute('aria-pressed') !== 'true')));
}

export function initUI() {
  initTone();
  initMenu();
  initSound();
}
