// Bloques HTML que se repiten entre páginas. Cada función recibe el contexto de la página:
// { page, lang, t(clave), url(id), alt, hrefs: { es, en } } y devuelve HTML.
// Las plantillas los llaman con <!--@nombre--> (plugins/i18n-pages.js).
import { projects, bySlug, loc } from '../data/projects.js';
import { esc } from './atoms.js';
import { ChapterTitle, WorkCard } from './molecules.js';
import { Header, Footer, TONE_PAGES } from './organisms.js';
export * from './system.js';

// <head> común: título, descripción, enlaces entre idiomas (hreflang) y el tono guardado
export function head(ctx) {
  const project = ctx.page.project ? bySlug(ctx.page.project) : null;
  const TITLES = { home: 'home.title', trabajos: 'works.title', sobre: 'about.title', contacto: 'contact.title', historia: 'story.title', sistema: 'system.title' };
  const name = project ? project.title : ctx.t(TITLES[ctx.page.id]);
  const title = ctx.page.id === 'home' ? name : `${name} · ${ctx.t('meta.siteName')}`;
  // El tono claro se aplica antes de pintar para que no parpadee
  const tone = TONE_PAGES.includes(ctx.page.id)
    ? `<script>try{if(localStorage.getItem('wilb:tono')==='claro')document.documentElement.dataset.tono='claro'}catch(e){}</script>`
    : '';
  return `<title>${esc(title)}</title>
    <meta name="description" content="${esc(ctx.t('meta.description'))}">
    <link rel="alternate" hreflang="es" href="${ctx.hrefs.es}">
    <link rel="alternate" hreflang="en" href="${ctx.hrefs.en}">
    <link rel="alternate" hreflang="x-default" href="${ctx.hrefs.es}">
    ${tone}`;
}

export const header = Header;
export const footer = Footer;

// Titular partido de cada página: <!--@title--> usa las claves <seccion>.left / .right
export function title(ctx) {
  const KEYS = { home: 'home', trabajos: 'works', sobre: 'about', contacto: 'contact', sistema: 'system' };
  const k = KEYS[ctx.page.id];
  if (ctx.page.id === 'home') return ChapterTitle({ left: ctx.t('home.first'), right: ctx.t('home.last'), label: `${ctx.t('home.first')} ${ctx.t('home.last')}` });
  return ChapterTitle({ left: ctx.t(`${k}.left`), right: ctx.t(`${k}.right`) });
}

// Pie de un trabajo en una sola línea: nombre · género · formato
export function workLine(p, ctx) {
  const cat = ctx.t(`categories.${p.category}`);
  const format = loc(p.format, ctx.lang);
  return [p.title, cat, format !== cat ? format : ''].filter(Boolean).join(' · ');
}

// Lista de trabajos (provisional: la maquetación editorial y los videos llegan en la fase 4)
export function worksList(ctx) {
  return `<div class="works-grid">${projects.map((p) => WorkCard({ href: ctx.url(`proyecto:${p.slug}`), line: workLine(p, ctx), height: '24vw' })).join('')}
  </div>`;
}

// Cuerpo de la página de un proyecto
export function project(ctx) {
  const i = projects.findIndex((p) => p.slug === ctx.page.project);
  const p = projects[i];
  const prev = projects[(i - 1 + projects.length) % projects.length];
  const next = projects[(i + 1) % projects.length];
  return `<article class="project">
    ${ChapterTitle({ left: p.title, right: ctx.t(`categories.${p.category}`) })}
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
