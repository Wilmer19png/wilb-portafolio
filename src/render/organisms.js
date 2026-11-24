// ORGANISMOS (Atomic Design, brief §13): secciones completas hechas de moléculas y átomos.
// Estilos en src/styles/organisms.css; el comportamiento (menú, tono, sonido) en src/lib/ui.js.
import { esc, Pill, LangToggle, Logo, Tape, LightSwitch, ToneToggle } from './atoms.js';
import { NavGroup, SoundToggle, Credits } from './molecules.js';

// Páginas con interruptor oscuro / claro (lienzo: Sobre mí y Contacto)
export const TONE_PAGES = ['sobre', 'contacto'];

const isOn = (ctx, id) => ctx.page.id === id || (id === 'trabajos' && ctx.page.template === 'proyecto');

const links = (ctx) => ({
  main: [['home', 'nav.home'], ['trabajos', 'nav.works']],
  second: [['sobre', 'nav.about'], ['contacto', 'nav.contact']],
});

const toneToggle = (ctx) => ToneToggle({ label: ctx.t('nav.tone'), dark: ctx.t('nav.dark'), light: ctx.t('nav.light') });
const langToggle = (ctx) => LangToggle({ lang: ctx.lang, hrefs: ctx.hrefs, label: ctx.t('nav.langLabel') });

/** Logo según la página: Inicio en blanco y en ciclo; Sobre mí / Contacto en un color que sigue el tono;
 *  el resto a color, armado una vez. */
function headerLogo(ctx) {
  const home = ctx.page.id === 'home';
  const tono = TONE_PAGES.includes(ctx.page.id);
  return Logo({
    href: ctx.url('home'),
    label: `Wil B · ${ctx.t('nav.home')}`,
    mode: home ? 'loop' : 'intro',
    color: home || tono ? '#ffffff' : '',
  });
}

/** Header: cinta de colores, menú partido a los lados y el logo animado al centro. */
export function Header(ctx) {
  const { main, second } = links(ctx);
  const items = (list) => list.map(([id, key]) => ({ href: ctx.url(id), label: ctx.t(key), on: isOn(ctx, id) }));
  const tono = TONE_PAGES.includes(ctx.page.id);
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
  const tono = TONE_PAGES.includes(ctx.page.id);
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
  const credits = Credits({ websiteBy: ctx.t('footer.websiteBy') });
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
