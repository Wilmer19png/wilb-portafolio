// Mapa de páginas del sitio en los dos idiomas (brief §10b).
// Cada página sale de una plantilla de src/pages y se genera una vez por idioma.
import { projects } from './projects.js';

export const LANGS = ['es', 'en'];

export const pages = [
  { id: 'home', template: 'home', es: '/', en: '/en/' },
  { id: 'trabajos', template: 'trabajos', es: '/trabajos/', en: '/en/work/' },
  { id: 'sobre', template: 'sobre', es: '/sobre-mi/', en: '/en/about/' },
  { id: 'contacto', template: 'contacto', es: '/contacto/', en: '/en/contact/' },
  { id: 'historia', template: 'historia', es: '/historia/', en: '/en/story/' },
  { id: 'sistema', template: 'sistema', es: '/sistema/', en: '/en/system/' }, // sistema de diseño (Atomic Design), fuera del menú
  ...projects.map((p) => ({
    id: `proyecto:${p.slug}`,
    template: 'proyecto',
    project: p.slug,
    es: `/trabajos/${p.slug}/`,
    en: `/en/work/${p.slug}/`,
  })),
];

// Ruta de una página en un idioma: url('trabajos', 'en') → '/en/work/'
export function url(id, lang) {
  const page = pages.find((p) => p.id === id);
  if (!page) throw new Error(`Página desconocida: ${id}`);
  return page[lang];
}

// Busca qué página e idioma corresponden a una ruta: '/en/work/' → { page, lang }
export function match(pathname) {
  const clean = pathname.endsWith('/') ? pathname : `${pathname}/`;
  for (const page of pages) {
    for (const lang of LANGS) {
      if (page[lang] === clean) return { page, lang };
    }
  }
  return null;
}
