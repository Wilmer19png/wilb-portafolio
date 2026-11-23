// Bloques HTML que se repiten entre páginas. Cada función recibe el contexto de la página:
// { page, lang, t(clave), url(id), alt, hrefs: { es, en } } y devuelve HTML.
// En la fase 3 cada bloque pasa a ser su organismo (Header, Footer…) con el diseño final.
import { projects, bySlug, loc } from '../data/projects.js';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// <head> común: título, descripción y enlaces entre idiomas (hreflang)
export function head(ctx) {
  const project = ctx.page.project ? bySlug(ctx.page.project) : null;
  const TITLES = { home: 'home.title', trabajos: 'works.title', sobre: 'about.title', contacto: 'contact.title', historia: 'story.title' };
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
  const link = (id, key) => {
    const on = ctx.page.id === id || (id === 'trabajos' && ctx.page.template === 'proyecto');
    return `<a class="pill${on ? ' is-on' : ''}" href="${ctx.url(id)}"${on ? ' aria-current="page"' : ''}>${esc(ctx.t(key))}</a>`;
  };
  return `<header class="site-header">
    <nav aria-label="${esc(ctx.t('nav.main'))}">${link('home', 'nav.home')}${link('trabajos', 'nav.works')}</nav>
    <a class="logo" href="${ctx.url('home')}" aria-label="Wil B">Wil B</a>
    <nav aria-label="${esc(ctx.t('nav.secondary'))}">${link('sobre', 'nav.about')}${link('contacto', 'nav.contact')}${langToggle(ctx)}</nav>
  </header>`;
}

// LangToggle (átomo): enlaza a la misma página en el otro idioma
export function langToggle(ctx) {
  const item = (lang) => (lang === ctx.lang
    ? `<b aria-current="true">${lang.toUpperCase()}</b>`
    : `<a href="${ctx.hrefs[lang]}" hreflang="${lang}" lang="${lang}" data-lang-switch>${lang.toUpperCase()}</a>`);
  return `<span class="lang-toggle" role="group" aria-label="${esc(ctx.t('nav.langLabel'))}">${item('es')} / ${item('en')}</span>`;
}

// Footer (organismo)
export function footer(ctx) {
  return `<footer class="site-footer">
    <span>©2026 WILMER BURITICÁ · ${esc(ctx.t('footer.websiteBy'))} <img src="/img/rakun-ojo.svg" alt="RAKÜN" width="22" height="22"></span>
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
