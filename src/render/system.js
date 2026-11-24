// Página del sistema de diseño (/sistema/, /en/system/): tokens y átomos con su nombre,
// los mismos que en Figma. Evidencia de Atomic Design para la UCC.
import { esc, Pill, LangToggle, Logo, Tape, ButtonPrimary, Input, Tag, Folio, LightSwitch, RakunEye, Grain, ToneToggle } from './atoms.js';
import { NavGroup, ChapterTitle, FieldLabel, WorkCard, SoundToggle, Signature, Credits, YouTubeLite } from './molecules.js';
import { Footer } from './organisms.js';

const COLORES = [
  ['hueso', '#F3EFE6'], ['noche', '#0E0E0E'], ['grafito', '#1C1C1C'], ['carbon', '#161616'], ['papel', '#E7E6E3'],
  ['humo', '#8C8C85'], ['amarillo', '#F5C518'], ['naranja', '#F27A1A'], ['azul', '#1F3FBF'], ['rojo', '#D62828'],
];

const ficha = (nombre, html, nota = '', mod = '') => `
  <figure class="ds-ficha">
    <div class="ds-ficha__muestra${mod}">${html}</div>
    <figcaption><b>${nombre}</b>${nota ? ` · ${esc(nota)}` : ''}</figcaption>
  </figure>`;

export function systemPage(ctx) {
  const t = (k) => ctx.t(`system.${k}`);
  return `
  <h1 class="chaptertitle"><span>${esc(t('left'))}</span><span>${esc(t('right'))}</span></h1>

  <section class="ds-seccion" aria-labelledby="ds-color">
    <h2 id="ds-color" class="ds-h2">${esc(t('colors'))}</h2>
    <div class="ds-colores">${COLORES.map(([n, hex]) => `
      <div class="ds-color"><span class="bg-${n}"></span><b>--color-${n}</b><code>${hex}</code></div>`).join('')}
    </div>
  </section>

  <section class="ds-seccion" aria-labelledby="ds-tipo">
    <h2 id="ds-tipo" class="ds-h2">${esc(t('type'))}</h2>
    <p class="font-display-cond text-display">Wilmer Buriticá</p>
    <p class="font-sans text-2xl">${esc(t('sample'))} <span class="ds-nota">--font-sans · Space Grotesk</span></p>
    <p class="font-mono text-meta uppercase">${esc(t('sample'))} <span class="ds-nota">--font-mono · Space Mono</span></p>
  </section>

  <section class="ds-seccion" aria-labelledby="ds-atomos">
    <h2 id="ds-atomos" class="ds-h2">${esc(t('atoms'))}</h2>
    <div class="ds-fichas">
      ${ficha('Logo', Logo({ href: ctx.url('home'), mode: 'intro' }), 'intro · a color')}
      ${ficha('Logo', Logo({ href: ctx.url('home'), mode: 'loop', color: '#ffffff' }), 'loop · blanco (Inicio)')}
      ${ficha('Pill', `${Pill({ href: '#', label: ctx.t('nav.works') })} ${Pill({ href: '#', label: ctx.t('nav.home'), on: true })}`)}
      ${ficha('LangToggle', LangToggle({ lang: ctx.lang, hrefs: ctx.hrefs, label: ctx.t('nav.langLabel') }))}
      ${ficha('Tape', `<div style="width:100%">${Tape()}</div>`, 'linea · menú')}
      ${ficha('Tape', Tape({ variant: 'marca' }), 'marca · recuadros')}
      ${ficha('ButtonPrimary', ButtonPrimary({ label: t('send') }))}
      ${ficha('Input', `<label class="ds-nota" for="ds-input">${esc(t('name'))}</label>${Input({ id: 'ds-input', name: 'ds-input' })}`)}
      ${ficha('Tag', ['videoclip:azul', 'documental:rojo', 'ficcion:naranja', 'formatos:amarillo'].map((x) => { const [c, col] = x.split(':'); return Tag({ label: ctx.t(`categories.${c}`), color: col }); }).join('<br>'))}
      ${ficha('Folio', Folio({ n: 1, total: 6, title: 'Amor de calle - Apostol' }))}
      ${ficha('LightSwitch', LightSwitch({ href: ctx.url('historia'), label: ctx.t('footer.lightsOff') }))}
      ${ficha('RakunEye', `<span class="ds-fila">${esc(ctx.t('footer.websiteBy'))} ${RakunEye()}</span>`)}
      ${ficha('Grain', `<div class="ds-grano">${Grain()}</div>`, 'sobre imágenes y videos')}
      ${ficha('ToneToggle', ToneToggle({ label: ctx.t('nav.tone'), dark: ctx.t('nav.dark'), light: ctx.t('nav.light') }), 'Sobre mí y Contacto')}
    </div>
  </section>`;
}

// Moléculas y organismos (fase 3). Se agregan al final de la página del sistema.
export function systemPageParts(ctx) {
  const t = (k) => ctx.t(`system.${k}`);
  const home = { ...ctx, page: { ...ctx.page, id: 'home' } };
  const p = { title: 'Amor de calle', line: `Amor de calle · ${ctx.t('categories.videoclip')}` };
  return `
  <section class="ds-seccion" aria-labelledby="ds-moleculas">
    <h2 id="ds-moleculas" class="ds-h2">${esc(t('molecules'))}</h2>
    <div class="ds-fichas">
      ${ficha('NavGroup', NavGroup({ label: 'Demo', items: [{ href: '#', label: ctx.t('nav.home'), on: true }, { href: '#', label: ctx.t('nav.works') }] }))}
      ${ficha('ChapterTitle', `<div style="width:100%">${ChapterTitle({ left: 'Wil', right: 'B', tag: 'p' })}</div>`)}
      ${ficha('FieldLabel', `<div style="width:100%">${FieldLabel({ id: 'ds-campo', label: t('name'), autocomplete: 'off' })}</div>`)}
      ${ficha('SoundToggle', SoundToggle({ labelOn: ctx.t('footer.soundOn'), labelOff: ctx.t('footer.soundOff') }), 'clic: se mueve')}
      ${ficha('Signature', Signature({ websiteBy: ctx.t('footer.websiteBy') }))}
      ${ficha('WorkCard', `<div style="width:100%">${WorkCard({ href: '#', line: p.line, poster: '/media/trabajos/amor-de-calle/1.jpg', height: '200px' })}</div>`, 'pasa el mouse: se enfoca')}
      ${ficha('Credits', Credits({ items: [[ctx.t('project.format'), ctx.t('categories.videoclip')], [ctx.t('project.client'), 'Apostol'], [ctx.t('project.year'), '2026']] }))}
      ${ficha('YouTubeLite', `<div style="width:100%">${YouTubeLite({ id: '4RtfGuRQXYw', poster: '/media/trabajos/amor-de-calle/1.jpg', title: 'Amor de calle', playLabel: ctx.t('project.play') })}</div>`, 'carga YouTube solo al hacer clic')}
    </div>
  </section>

  <section class="ds-seccion" aria-labelledby="ds-organismos">
    <h2 id="ds-organismos" class="ds-h2">${esc(t('organisms'))}</h2>
    <div class="ds-fichas ds-fichas--ancho">
      ${ficha('Header', `<p class="ds-nota">${esc(t('headerNote'))}</p>`)}
      ${ficha('MenuMobile', `<p class="ds-nota">${esc(t('menuNote'))}</p>`)}
      ${ficha('HomeReel · WorksOverview · AllWorksPill', `<p class="ds-nota">${esc(t('pagesNote'))}</p>`)}
      ${ficha('Footer', Footer(home), 'Inicio', ' ds-ficha__muestra--bloque')}
      ${ficha('Footer', Footer(ctx), 'resto de páginas', ' ds-ficha__muestra--bloque')}
    </div>
  </section>`;
}
