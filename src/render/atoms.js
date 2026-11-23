// ÁTOMOS (Atomic Design, brief §13). Mismos nombres en Figma y en el código.
// Cada átomo es una función que devuelve HTML; sus estilos están en src/styles/atoms.css
// con la clase del mismo nombre en minúsculas (Pill → .pill, Tape → .tape…).

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const COLORES = ['azul', 'rojo', 'naranja', 'amarillo'];

/** Pill: enlace en píldora del menú. */
export function Pill({ href, label, on = false }) {
  return `<a class="pill${on ? ' is-on' : ''}" href="${href}"${on ? ' aria-current="page"' : ''}>${esc(label)}</a>`;
}

/** LangToggle: ES / EN, enlaza a la misma página en el otro idioma. */
export function LangToggle({ lang, hrefs, label }) {
  const item = (l) => (l === lang
    ? `<b aria-current="true">${l.toUpperCase()}</b>`
    : `<a href="${hrefs[l]}" hreflang="${l}" lang="${l}" data-lang-switch>${l.toUpperCase()}</a>`);
  return `<span class="langtoggle" role="group" aria-label="${esc(label)}">${item('es')} / ${item('en')}</span>`;
}

/** Logo: la animación del logo (scene.ts de Remotion) dibujada en un canvas.
 *  mode: 'intro' se arma una vez y queda quieto · 'loop' repite el ciclo BLUR / FOCUS / LIT.
 *  color: '' a color, o un color para todo (ej. '#ffffff'). */
export function Logo({ href, label = 'Wil B', mode = 'intro', color = '' }) {
  return `<a class="logo" href="${href}" aria-label="${esc(label)}">
      <canvas data-logo data-mode="${mode}"${color ? ` data-color="${color}"` : ''} aria-hidden="true"></canvas>
    </a>`;
}

/** Tape: la cinta de 4 colores del logo.
 *  'linea' = franja a lo ancho (arriba del menú) · 'marca' = 4 cuadritos sobre un recuadro. */
export function Tape({ variant = 'linea' } = {}) {
  return `<span class="tape tape--${variant}" aria-hidden="true">${COLORES.map((c) => `<span class="bg-${c}"></span>`).join('')}</span>`;
}

/** ButtonPrimary: botón principal (Escríbeme, Play…). */
export function ButtonPrimary({ label, type = 'button', href = '' }) {
  return href
    ? `<a class="buttonprimary" href="${href}">${esc(label)}</a>`
    : `<button class="buttonprimary" type="${type}">${esc(label)}</button>`;
}

/** Input: campo de formulario con línea inferior (la etiqueta la pone la molécula FieldLabel). */
export function Input({ id, name, type = 'text', multiline = false, autocomplete = '', required = false }) {
  const attrs = `id="${id}" name="${name}" class="input"${autocomplete ? ` autocomplete="${autocomplete}"` : ''}${required ? ' required' : ''}`;
  return multiline ? `<textarea ${attrs} rows="4"></textarea>` : `<input ${attrs} type="${type}">`;
}

/** Tag: categoría con su cuadrito de color (filtros de Trabajos). */
export function Tag({ label, color = 'hueso' }) {
  return `<span class="tag"><span class="tag__chip bg-${color}" aria-hidden="true"></span>${esc(label)}</span>`;
}

/** Folio: número del proyecto en el reel («01 - 06  Amor de calle»). */
export function Folio({ n, total, title }) {
  const pad = (x) => String(x).padStart(2, '0');
  return `<span class="folio"><b>${pad(n)} - ${pad(total)}</b>&nbsp; ${esc(title)}</span>`;
}

/** LightSwitch: el interruptor de «Apaga la luz», la puerta a la historia. */
export function LightSwitch({ href, label }) {
  return `<a class="lightswitch" href="${href}"><span class="lightswitch__placa" aria-hidden="true"><span></span></span>${esc(label)}</a>`;
}

/** RakunEye: el ojo de RAKÜN en monocromático (toma el color del texto). */
export function RakunEye({ label = 'RAKÜN' } = {}) {
  return `<svg class="rakuneye" viewBox="0 0 212 140" role="img" aria-label="${esc(label)}"><path fill="currentColor" fill-rule="evenodd" d="M10 5L100 4C152 4 182 34 204 134L8 14Q2 9 10 5ZM36 12L100 12C146 12 174 36 194 123.83L32 24.69Q26 16 36 12ZM83.31 56.09A40 40 0 1 1 151.52 97.83Z"/></svg>`;
}

/** Grain: grano de película animado encima de imágenes y videos. */
export function Grain() {
  return '<span class="grain" aria-hidden="true"></span>';
}
