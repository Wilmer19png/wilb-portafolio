// Entrada común de todas las páginas.
import { currentLang } from './lib/i18n.js';

const KEY = 'wilb:lang';
const lang = currentLang();

// Recordar el idioma cuando la persona lo cambia a mano (brief §10b)
document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-lang-switch]');
  if (link) {
    try { sessionStorage.setItem(KEY, link.getAttribute('hreflang')); } catch {}
  }
});

// Primera visita al inicio: si el navegador no está en español, pasar a inglés.
// Solo en la portada y solo una vez por visita; un enlace compartido siempre se respeta.
const onHome = location.pathname === '/' || location.pathname === '/en/';
let saved = null;
try { saved = sessionStorage.getItem(KEY); } catch {}
if (onHome && !saved) {
  const wanted = (navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en';
  try { sessionStorage.setItem(KEY, wanted); } catch {}
  if (wanted !== lang) {
    const alt = document.querySelector(`link[rel="alternate"][hreflang="${wanted}"]`);
    if (alt) location.replace(alt.getAttribute('href'));
  }
}
