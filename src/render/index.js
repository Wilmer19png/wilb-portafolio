// Bloques HTML que se repiten entre páginas. Cada función recibe el contexto de la página:
// { page, lang, t(clave), url(id), alt, hrefs: { es, en } } y devuelve HTML.
// Las plantillas los llaman con <!--@nombre--> (plugins/i18n-pages.js).
import { projects, bySlug, loc } from '../data/projects.js';
import { esc, Tape, Grain, RakunEye } from './atoms.js';
import { ChapterTitle, Credits, YouTubeLite } from './molecules.js';
import { mediaFor } from '../data/media.js';
import { Header, Footer, hasTone, HomeReel, WorksOverview, AllWorksPill } from './organisms.js';
export * from './system.js';

// <head> común: título, descripción, enlaces entre idiomas (hreflang) y el tono guardado
export function head(ctx) {
  const project = ctx.page.project ? bySlug(ctx.page.project) : null;
  const TITLES = { home: 'home.title', trabajos: 'works.title', sobre: 'about.title', contacto: 'contact.title', historia: 'story.title', sistema: 'system.title' };
  const name = project ? project.title : ctx.t(TITLES[ctx.page.id]);
  const title = ctx.page.id === 'home' ? name : `${name} · ${ctx.t('meta.siteName')}`;
  // El tono claro se aplica antes de pintar para que no parpadee
  const tone = hasTone(ctx)
    ? `<script>try{if(localStorage.getItem('wilb:tono')==='claro')document.documentElement.dataset.tono='claro'}catch(e){}</script>`
    : '';
  return `<script>document.documentElement.classList.add('js')</script>
    <title>${esc(title)}</title>
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

export const homeReel = HomeReel;
export const worksOverview = WorksOverview;
export const allWorksPill = AllWorksPill;

// Página de un proyecto (ProjectTemplate, brief §2.3): titular partido, video a sangre (YouTube lite),
// sinopsis, créditos en mono, fotogramas en movimiento, lo que aprendí, «Una producción RAKÜN», anterior / siguiente.
export function project(ctx) {
  const i = projects.findIndex((p) => p.slug === ctx.page.project);
  const p = projects[i];
  const m = mediaFor(p.slug);
  const prev = projects[(i - 1 + projects.length) % projects.length];
  const next = projects[(i + 1) % projects.length];
  const play = ctx.t('project.play');

  const video = m.reels
    ? `<div class="proyecto__reels">${m.reels.map((r, n) => YouTubeLite({ id: r.youtube, poster: r.poster, title: `${p.title} · Reel ${n + 1}`, playLabel: play, vertical: true })).join('')}</div>`
    : YouTubeLite({ id: p.youtube, poster: m.poster, title: p.title, playLabel: play });

  const clips = (m.clips ?? []).length
    ? `<section class="proyecto__cuadros" data-reveal aria-label="${esc(ctx.t('project.frames'))}">${m.clips.map((c) => `
        <div class="proyecto__cuadro"><video data-src="${c.sd}" muted loop playsinline preload="none" poster="${c.poster}" aria-hidden="true"></video>${Grain()}</div>`).join('')}
      </section>`
    : '';

  return `<article class="proyecto">
    ${ChapterTitle({ left: p.title, right: ctx.t(`categories.${p.category}`) })}
    <div class="proyecto__video" data-reveal style="--d:.2s">${video}</div>

    <div class="proyecto__cuerpo">
      <div class="proyecto__texto" data-reveal>
        <p class="proyecto__sinopsis">${esc(loc(p.summary, ctx.lang))}</p>
        <span class="todo">${esc(ctx.t('project.todoFirstPerson'))}</span>
      </div>
      <aside class="proyecto__creditos" data-reveal style="--d:.12s">
        ${Tape({ variant: 'marca' })}
        ${Credits({ items: [
          [ctx.t('project.format'), loc(p.format, ctx.lang)],
          [ctx.t('project.client'), loc(p.client, ctx.lang)],
          [ctx.t('project.year'), p.year ? String(p.year) : ''],
          [ctx.t('project.role'), loc(p.role, ctx.lang)],
        ] })}
      </aside>
    </div>

    ${clips}

    <section class="proyecto__aprendi" data-reveal>
      <h2>${esc(ctx.t('project.learned'))}</h2>
      <span class="todo">${esc(ctx.t('project.todoLearned'))}</span>
    </section>

    <p class="proyecto__rakun">${esc(ctx.t('project.production'))} RAKÜN ${RakunEye()}</p>

    <nav class="proyecto__nav" data-reveal aria-label="${esc(ctx.t('project.more'))}">
      <a href="${ctx.url(`proyecto:${prev.slug}`)}" rel="prev"><span>← ${esc(ctx.t('project.prev'))}</span><b>${esc(prev.title)}</b></a>
      <a href="${ctx.url(`proyecto:${next.slug}`)}" rel="next"><span>${esc(ctx.t('project.next'))} →</span><b>${esc(next.title)}</b></a>
    </nav>
  </article>`;
}
