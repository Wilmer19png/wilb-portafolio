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
  return `<${tag} class="chaptertitle"${aria}><span data-reveal>${esc(left)}</span><span data-reveal style="--d:.12s">${esc(right)}</span></${tag}>`;
}

/** FieldLabel: etiqueta + Input del formulario. */
export function FieldLabel({ id, label, ...input }) {
  return `<div class="fieldlabel"><label for="${id}">${esc(label)}</label>${Input({ id, name: id, ...input })}</div>`;
}

/** WorkCard: recuadro de un trabajo. Cinta de 4 colores encima, imagen quieta y desenfocada;
 *  al pasar el mouse se enfoca y corre el video (data-video). Pie en una sola línea. */
export function WorkCard({ href, line, poster = '', posters = [], video = '', category = '', width = '100%', height = '30vw', eager = false, delay = 0 }) {
  const load = eager ? '' : ' loading="lazy"';
  let img = '<span class="workcard__vacio" aria-hidden="true"></span>';
  if (posters.length) img = `<span class="workcard__reels">${posters.map((p) => `<img src="${p}" alt="" decoding="async">`).join('')}</span>`;
  else if (poster) img = `<img src="${poster}" alt=""${load} decoding="async">`;
  return `<a class="workcard" href="${href}" style="--ancho:${width};--alto:${height}"${category ? ` data-cat="${category}"` : ''}${video ? ` data-video="${video}"` : ''}>
      <span class="workcard__cuadro" data-reveal style="--d:${delay}s">${Tape({ variant: 'marca' })}<span class="workcard__marco${posters.length ? ' workcard__marco--reels' : ''}">${img}${Grain()}</span></span>
      <span class="workcard__pie" data-reveal style="--d:${(delay + 0.15).toFixed(2)}s">${esc(line)}</span>
    </a>`;
}

/** Credits: los créditos de un proyecto en mono (término · dato). items = [[término, dato]] */
export function Credits({ items }) {
  return `<dl class="credits">${items.filter(([, v]) => v).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
}

/** YouTubeLite: portada con botón Play; el reproductor de YouTube carga solo al hacer clic (brief §9.1). */
export function YouTubeLite({ id, poster, title, playLabel, vertical = false }) {
  return `<div class="youtubelite${vertical ? ' youtubelite--vertical' : ''}" data-youtube="${id}" data-title="${esc(title)}">
      <img src="${poster}" alt="" decoding="async">
      ${Grain()}
      <button type="button" class="youtubelite__play" aria-label="${esc(playLabel)}: ${esc(title)}"><span>PLAY</span></button>
    </div>`;
}

/** SoundToggle: las 4 barras de ecualizador; prende y apaga el sonido. */
export function SoundToggle({ labelOn, labelOff }) {
  return `<button class="soundtoggle" type="button" data-sound-toggle aria-pressed="false" data-label-on="${esc(labelOn)}" data-label-off="${esc(labelOff)}" aria-label="${esc(labelOn)}">
      <span></span><span></span><span></span><span></span>
    </button>`;
}

/** Signature: la firma del pie, «©2026 WILMER BURITICÁ · WEBSITE BY» y el ojo de RAKÜN. */
export function Signature({ websiteBy }) {
  return `<span class="signature">©2026 WILMER BURITICÁ <span class="signature__punto" aria-hidden="true">·</span> <span class="signature__by">${esc(websiteBy)} ${RakunEye()}</span></span>`;
}
