// MOLÉCULAS (Atomic Design, brief §13): átomos juntos que hacen una sola cosa.
// Mismos nombres en Figma y en el código. Estilos en src/styles/molecules.css.
import { esc, Pill, Input, Tape, Grain, RakunEye } from './atoms.js';

/** NavGroup: un grupo de Pills del menú. items = [{ href, label, on }] */
export function NavGroup({ label, items, extra = '', className = '' }) {
  return `<nav class="navgroup ${className}" aria-label="${esc(label)}">${items.map(Pill).join('')}${extra}</nav>`;
}

/** ChapterTitle: el titular partido a los dos lados («Trabajos ····· Vista general»). */
export function ChapterTitle({ left, right, tag = 'h1', label = '' }) {
  const aria = label ? ` aria-label="${esc(label)}"` : '';
  return `<${tag} class="chaptertitle"${aria}><span>${esc(left)}</span><span>${esc(right)}</span></${tag}>`;
}

/** FieldLabel: etiqueta + Input del formulario. */
export function FieldLabel({ id, label, ...input }) {
  return `<div class="fieldlabel"><label for="${id}">${esc(label)}</label>${Input({ id, name: id, ...input })}</div>`;
}

/** WorkCard: recuadro de un trabajo. Cinta de 4 colores encima, imagen quieta y desenfocada;
 *  al pasar el mouse se enfoca y corre el video (data-video). Pie en una sola línea. */
export function WorkCard({ href, line, poster = '', video = '', width = '100%', height = '30vw' }) {
  const img = poster
    ? `<img src="${poster}" alt="" loading="lazy" decoding="async">`
    : '<span class="workcard__vacio" aria-hidden="true"></span>';
  return `<a class="workcard" href="${href}" style="--ancho:${width};--alto:${height}"${video ? ` data-video="${video}"` : ''}>
      <span class="workcard__cuadro">${Tape({ variant: 'marca' })}<span class="workcard__marco">${img}${Grain()}</span></span>
      <span class="workcard__pie">${esc(line)}</span>
    </a>`;
}

/** SoundToggle: las 4 barras de ecualizador; prende y apaga el sonido. */
export function SoundToggle({ labelOn, labelOff }) {
  return `<button class="soundtoggle" type="button" data-sound-toggle aria-pressed="false" data-label-on="${esc(labelOn)}" data-label-off="${esc(labelOff)}" aria-label="${esc(labelOn)}">
      <span></span><span></span><span></span><span></span>
    </button>`;
}

/** Credits: «©2026 WILMER BURITICÁ · WEBSITE BY» y el ojo de RAKÜN. */
export function Credits({ websiteBy }) {
  return `<span class="credits">©2026 WILMER BURITICÁ <span class="credits__punto" aria-hidden="true">·</span> <span class="credits__by">${esc(websiteBy)} ${RakunEye()}</span></span>`;
}
