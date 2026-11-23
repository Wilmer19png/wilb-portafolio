// Bloques HTML que se repiten entre páginas. Cada función recibe el contexto de la página:
// { page, lang, t(clave), url(id), alt, hrefs: { es, en } } y devuelve HTML.
// En la fase 3 cada bloque pasa a ser su organismo (Header, Footer…) con el diseño final.
import { projects, bySlug, loc } from '../data/projects.js';
import { esc, Pill, LangToggle, Logo, Tape, RakunEye } from './atoms.js';
export * from './system.js';

// <head> común: título, descripción y enlaces entre idiomas (hreflang)
export function head(ctx) {
  const project = ctx.page.project ? bySlug(ctx.page.project) : null;
  const TITLES = { home: 'home.title', trabajos: 'works.title', sobre: 'about.title', contacto: 'contact.title', historia: 'story.title', sistema: 'system.title' };
  const name = project ? project.title : ctx.t(TITLES[ctx.page.id]);
  const title = ctx.page.id === 'home' ? name : `${name} · ${ctx.t('meta.siteName')}`;
  return `<title>${esc(title)}</title>
    <meta name="description" content="${esc(ctx.t('meta.description'))}">
    <link rel="alternate" hreflang="es" href="${ctx.hrefs.es}">
    <link rel="alternate" hreflang="en" href="${ctx.hrefs.en}">
    <link rel="alternate" hreflang="x-default" href="${ctx.hrefs.es}">`;
}

// Header (organismo). Diseño final en la fase 3.
export function header(ctx) {
  const pill = (id, key) => Pill({ href: ctx.url(id), label: ctx.t(key), on: ctx.page.id === id || (id === 'trabajos' && ctx.page.template === 'proyecto') });
  return `<header class="site-header">
    ${Tape()}
    <div class="site-header__fila">
      <nav aria-label="${esc(ctx.t('nav.main'))}">${pill('home', 'nav.home')}${pill('trabajos', 'nav.works')}</nav>
      ${Logo({ href: ctx.url('home'), label: 'Wil B', mode: ctx.page.id === 'home' ? 'loop' : 'intro', color: ctx.page.id === 'home' ? '#ffffff' : '' })}
      <nav aria-label="${esc(ctx.t('nav.secondary'))}">${pill('sobre', 'nav.about')}${pill('contacto', 'nav.contact')}${langToggle(ctx)}</nav>
    </div>
  </header>`;
}

export const langToggle = (ctx) => LangToggle({ lang: ctx.lang, hrefs: ctx.hrefs, label: ctx.t('nav.langLabel') });

// Footer (organismo)
export function footer(ctx) {
  return `<footer class="site-footer">
    <span>©2026 WILMER BURITICÁ <span aria-hidden="true">·</span> <span class="site-footer__by">${esc(ctx.t('footer.websiteBy'))} ${RakunEye()}</span></span>
    <a href="${ctx.url('historia')}">${esc(ctx.t('footer.match'))}</a>
  </footer>`;
}

// Lista de trabajos (provisional: la maquetación editorial llega en la fase 4)
export function worksList(ctx) {
  return `<ul class="works-list">${projects.map((p) => `
    <li><a href="${ctx.url(`proyecto:${p.slug}`)}">${esc(p.title)} · ${esc(ctx.t(`categories.${p.category}`))}${loc(p.format, ctx.lang) !== ctx.t(`categories.${p.category}`) ? ` · ${esc(loc(p.format, ctx.lang))}` : ''}</a></li>`).join('')}
  </ul>`;
}

// Cuerpo de la página de un proyecto
export function project(ctx) {
  const i = projects.findIndex((p) => p.slug === ctx.page.project);
  const p = projects[i];
  const prev = projects[(i - 1 + projects.length) % projects.length];
  const next = projects[(i + 1) % projects.length];
  return `<article class="project">
    <h1>${esc(p.title)}</h1>
    <p>${esc(loc(p.summary, ctx.lang))}</p>
    <dl>
      <dt>${esc(ctx.t('project.client'))}</dt><dd>${esc(loc(p.client, ctx.lang))}</dd>
      <dt>${esc(ctx.t('project.year'))}</dt><dd>${p.year ?? '—'}</dd>
      <dt>${esc(ctx.t('project.role'))}</dt><dd>${esc(loc(p.role, ctx.lang))}</dd>
    </dl>
    <nav class="project-nav">
      <a href="${ctx.url(`proyecto:${prev.slug}`)}">← ${esc(ctx.t('project.prev'))}: ${esc(prev.title)}</a>
      <a href="${ctx.url(`proyecto:${next.slug}`)}">${esc(ctx.t('project.next'))}: ${esc(next.title)} →</a>
    </nav>
  </article>`;
}
