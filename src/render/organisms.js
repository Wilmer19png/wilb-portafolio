// ORGANISMOS (Atomic Design, brief §13): secciones completas hechas de moléculas y átomos.
// Estilos en src/styles/organisms.css; el comportamiento (menú, tono, sonido) en src/lib/ui.js.
import { esc, Pill, LangToggle, Logo, Tape, LightSwitch, ToneToggle } from './atoms.js';
import { NavGroup, SoundToggle, Signature } from './molecules.js';

// Páginas con interruptor oscuro / claro: Sobre mí, Contacto, Trabajos y cada proyecto
export const TONE_PAGES = ['sobre', 'contacto', 'trabajos'];
export const hasTone = (ctx) => TONE_PAGES.includes(ctx.page.id) || ctx.page.template === 'proyecto';

const isOn = (ctx, id) => ctx.page.id === id || (id === 'trabajos' && ctx.page.template === 'proyecto');

const links = (ctx) => ({
  main: [['home', 'nav.home'], ['trabajos', 'nav.works']],
  second: [['sobre', 'nav.about'], ['contacto', 'nav.contact']],
});

const toneToggle = (ctx) => ToneToggle({ label: ctx.t('nav.tone'), dark: ctx.t('nav.dark'), light: ctx.t('nav.light') });
const langToggle = (ctx) => LangToggle({ lang: ctx.lang, hrefs: ctx.hrefs, label: ctx.t('nav.langLabel') });

/** Logo según la página: Inicio en blanco y en ciclo; Sobre mí / Contacto de un solo color que sigue el tono;
 *  Trabajos y proyectos a color (en claro, las letras pasan a grafito: ver ui.js). */
function headerLogo(ctx) {
  const home = ctx.page.id === 'home';
  const mono = home || ['sobre', 'contacto'].includes(ctx.page.id);
  return Logo({
    href: ctx.url('home'),
    label: `Wil B · ${ctx.t('nav.home')}`,
    mode: home ? 'loop' : 'intro',
    color: mono ? '#ffffff' : '',
  });
}

/** Header: cinta de colores, menú partido a los lados y el logo animado al centro. */
export function Header(ctx) {
  const { main, second } = links(ctx);
  const items = (list) => list.map(([id, key]) => ({ href: ctx.url(id), label: ctx.t(key), on: isOn(ctx, id) }));
  const tono = hasTone(ctx);
  return `<header class="header${ctx.page.id === 'home' ? ' header--sobre' : ''}">
    ${Tape()}
    <div class="header__fila">
      ${NavGroup({ label: ctx.t('nav.main'), items: items(main), className: 'header__lado' })}
      ${headerLogo(ctx)}
      ${NavGroup({ label: ctx.t('nav.secondary'), items: items(second), className: 'header__lado header__lado--der', extra: `${tono ? toneToggle(ctx) : ''}${langToggle(ctx)}` })}
      ${Pill({ label: ctx.t('nav.menu'), attrs: 'data-menu-open aria-controls="menu-movil" aria-expanded="false"' }).replace('class="pill"', 'class="pill header__menu"')}
    </div>
  </header>
  ${MenuMobile(ctx)}`;
}

/** MenuMobile: el menú a pantalla completa en celular. */
export function MenuMobile(ctx) {
  const { main, second } = links(ctx);
  const tono = hasTone(ctx);
  return `<div class="menumobile" id="menu-movil" role="dialog" aria-modal="true" aria-label="${esc(ctx.t('nav.menu'))}" hidden>
    ${Tape()}
    <div class="menumobile__top">
      ${langToggle(ctx)}
      ${Pill({ label: ctx.t('nav.close'), attrs: 'data-menu-close' })}
    </div>
    <nav class="menumobile__links" aria-label="${esc(ctx.t('nav.main'))}">
      ${[...main, ...second].map(([id, key]) => `<a href="${ctx.url(id)}"${isOn(ctx, id) ? ' aria-current="page"' : ''}>${esc(ctx.t(key))}</a>`).join('')}
    </nav>
    <div class="menumobile__pie">
      ${tono ? toneToggle(ctx) : ''}
      ${LightSwitch({ href: ctx.url('historia'), label: ctx.t('footer.lightsOff') })}
    </div>
  </div>`;
}

/** Footer: créditos con el ojo de RAKÜN y la puerta a la historia.
 *  En el Inicio lleva el ecualizador de sonido y el interruptor «Apaga la luz». */
export function Footer(ctx) {
  const credits = Signature({ websiteBy: ctx.t('footer.websiteBy') });
  if (ctx.page.id === 'home') {
    return `<footer class="footer footer--home">
      <div class="footer__izq">${SoundToggle({ labelOn: ctx.t('footer.soundOn'), labelOff: ctx.t('footer.soundOff') })}${credits}</div>
      ${LightSwitch({ href: ctx.url('historia'), label: ctx.t('footer.lightsOff') })}
    </footer>`;
  }
  return `<footer class="footer">
    ${credits}
    <a class="footer__fosforo" href="${ctx.url('historia')}">${esc(ctx.t('footer.match'))}</a>
  </footer>`;
}

/* ======================= Fase 4: Inicio, Trabajos y Proyecto ======================= */
import { projects, loc } from '../data/projects.js';
import { mediaFor } from '../data/media.js';
import { Folio, Grain } from './atoms.js';
import { ChapterTitle, WorkCard } from './molecules.js';

// Pie de un trabajo en una sola línea: nombre · género · formato
export function workLine(p, ctx) {
  const cat = ctx.t(`categories.${p.category}`);
  const format = loc(p.format, ctx.lang);
  return [p.title, cat, format !== cat ? format : ''].filter(Boolean).join(' · ');
}

// Nombre corto del reel: el artista en los videoclips, el formato en lo demás
const reelTitle = (p, ctx) => `${p.title} - ${p.category === 'videoclip' ? loc(p.client, ctx.lang) : loc(p.format, ctx.lang)}`;

const arrow = (d) => `<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="${d}"/></svg>`;

/** HomeReel: el reel a sangre del Inicio. Cada proyecto dura un ciclo de palabras del logo:
 *  entra desenfocado (BLUR), se enfoca (FOCUS) y sube la luz (LIT). Sin reels verticales. */
export function HomeReel(ctx) {
  const items = projects.filter((p) => !mediaFor(p.slug).vertical && mediaFor(p.slug).clips?.length);
  const first = items[0];
  return `<section class="homereel" data-homereel aria-label="${esc(ctx.t('home.reel'))}">
    <div class="homereel__capas" aria-hidden="true">
      ${items.map((p, i) => `<div class="homereel__capa${i === 0 ? ' is-on' : ''}" data-clips='${JSON.stringify(mediaFor(p.slug).clips.map(({ hd, sd, dur }) => ({ hd, sd, dur })))}' data-href="${ctx.url(`proyecto:${p.slug}`)}" data-title="${esc(reelTitle(p, ctx))}" data-name="${esc(p.title)}">
        <img src="${mediaFor(p.slug).poster}" alt="" decoding="async"${i === 0 ? ' fetchpriority="high"' : ' loading="lazy"'}>
      </div>`).join('')}
      ${Grain()}
      <div class="homereel__sombra"></div>
    </div>

    <div class="homereel__contenido">
      ${ChapterTitle({ left: ctx.t('home.first'), right: ctx.t('home.last'), label: `${ctx.t('home.first')} ${ctx.t('home.last')}` })}

      <div class="homereel__medio">
        <div class="homereel__bio" data-reveal style="--d:.25s">
          <b>${esc(ctx.t('home.role'))}</b>
          <div>
            <p>${esc(ctx.t('home.intro'))}</p>
            <a href="${ctx.url('sobre')}">${esc(ctx.t('home.more'))}</a>
          </div>
        </div>

        <a class="homereel__play" data-reveal style="--d:.4s" href="${ctx.url(`proyecto:${first.slug}`)}" data-play aria-label="${esc(ctx.t('home.playLabel'))}: ${esc(first.title)}" data-label="${esc(ctx.t('home.playLabel'))}">
          <span class="homereel__aro homereel__aro--3"></span><span class="homereel__aro homereel__aro--2"></span><span class="homereel__aro homereel__aro--1"></span>
          <span class="homereel__play-txt">${esc(ctx.t('home.play'))}</span>
        </a>

        <div class="homereel__control" data-reveal style="--d:.55s">
          <span data-folio data-total="${items.length}">${Folio({ n: 1, total: items.length, title: reelTitle(first, ctx) })}</span>
          <div class="homereel__barra">
            <div class="homereel__progreso" aria-hidden="true"><span data-progress></span></div>
            <button type="button" class="homereel__flecha" data-prev aria-label="${esc(ctx.t('home.prev'))}">${arrow('M10 3 5 8l5 5')}</button>
            <button type="button" class="homereel__flecha" data-next aria-label="${esc(ctx.t('home.next'))}">${arrow('m6 3 5 5-5 5')}</button>
          </div>
          <span class="homereel__fases" aria-hidden="true"><span data-fase="blur">BLUR</span> · <span data-fase="focus">FOCUS</span> · <span data-fase="lit">LIT</span></span>
          <span class="sr-only" aria-live="polite" data-anuncio></span>
        </div>
      </div>

      <div data-reveal style="--d:.7s">${Footer(ctx)}</div>
    </div>
  </section>`;
}

// Ritmo de revista de Trabajos (lienzo v3): una grande, dos de distinto ancho, dos iguales, los reels
const LAYOUT = [
  { pad: '17%', items: [[0, '100%', '30vw']] },
  { pad: '0%', items: [[1, '66.5%', '30.5vw'], [2, '33.5%', '30.5vw']] },
  { pad: '17%', items: [[3, '50%', '30.5vw'], [4, '50%', '30.5vw']] },
  { pad: '25%', items: [[5, '100%', '34vw']] },
];

/** WorksOverview: todos los trabajos en tamaños mixtos. Quietos y desenfocados hasta pasar el mouse. */
export function WorksOverview(ctx) {
  const card = (p, width, height, i, j = 0) => {
    const m = mediaFor(p.slug);
    return WorkCard({
      href: ctx.url(`proyecto:${p.slug}`), line: workLine(p, ctx), category: p.category,
      poster: m.preview?.poster ?? m.poster, posters: (m.reels ?? []).map((r) => r.poster), video: m.preview?.sd ?? '',
      width, height, eager: i === 0, delay: j * 0.14,
    });
  };
  const used = new Set(LAYOUT.flatMap((r) => r.items.map(([i]) => i)));
  const extra = projects.map((p, i) => i).filter((i) => !used.has(i)).map((i) => ({ pad: '17%', items: [[i, '100%', '30vw']] }));
  return `<div class="worksoverview" data-works>
    ${[...LAYOUT, ...extra].map((row) => `<div class="worksoverview__fila" style="--pad:${row.pad}">
      ${row.items.filter(([i]) => projects[i]).map(([i, w, h], j) => card(projects[i], w, h, i, j)).join('')}
    </div>`).join('')}
    <p class="worksoverview__vacio" data-vacio hidden>${esc(ctx.t('works.empty'))}<br><span class="todo">${esc(ctx.t('works.todoEditorial'))}</span></p>
  </div>`;
}

const FILTER_COLORS = { todos: 'hueso', videoclip: 'azul', documental: 'rojo', ficcion: 'naranja', formatos: 'amarillo', editorial: 'humo' };

/** AllWorksPill: la píldora fija abajo al centro con los filtros por categoría. */
export function AllWorksPill(ctx) {
  const name = (k) => (k === 'todos' ? ctx.t('works.all') : ctx.t(`categories.${k}`));
  return `<div class="allworkspill" data-filtros>
    <div class="allworkspill__caja">
      <span class="allworkspill__barras" aria-hidden="true"><span class="bg-azul"></span><span class="bg-rojo"></span><span class="bg-naranja"></span><span class="bg-amarillo"></span></span>
      <span class="allworkspill__nombre" data-filtro-nombre aria-live="polite">${esc(name('todos'))}</span>
      <button type="button" class="allworkspill__boton" data-filtro-abrir aria-expanded="false" aria-controls="filtros-lista" aria-label="${esc(ctx.t('works.filter'))}">
        <svg viewBox="0 0 20 12" width="18" height="10" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M1 3h18M1 9h18"/></svg>
      </button>
      <div class="allworkspill__lista" id="filtros-lista" role="group" aria-label="${esc(ctx.t('works.filter'))}" hidden>
        ${Object.keys(FILTER_COLORS).map((k) => `<button type="button" class="allworkspill__op" data-filtro="${k}" data-nombre="${esc(name(k))}" aria-pressed="${k === 'todos'}"><span class="bg-${FILTER_COLORS[k]}" aria-hidden="true"></span>${esc(name(k))}</button>`).join('')}
      </div>
    </div>
  </div>`;
}
