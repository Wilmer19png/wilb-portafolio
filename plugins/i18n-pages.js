// Genera cada página en español y en inglés a partir de una sola plantilla.
//
// Plantillas en src/pages/<nombre>.html. Marcas que entiende:
//   {{lang}}            es | en
//   {{t:clave.ruta}}    texto del diccionario (src/i18n)
//   {{url:id}}          ruta de otra página en este idioma (src/data/routes.js)
//   {{alt}}             la misma página en el otro idioma (para ES / EN)
//   <!--@nombre-->      bloque HTML hecho por una función de src/render (header, footer…)
//
// En desarrollo un middleware arma la página al vuelo; en el build se emite un
// index.html por ruta e idioma (dist/trabajos/index.html, dist/en/work/index.html…).
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const PAGES = path.join(ROOT, 'src/pages');
const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Carga los módulos de datos y render (en dev con ssrLoadModule para que recargue al editar)
async function loadModules(load) {
  const [routes, i18n, render] = await Promise.all([
    load('/src/data/routes.js'),
    load('/src/lib/i18n.js'),
    load('/src/render/index.js'),
  ]);
  return { routes, i18n, render };
}

function renderPage(html, { page, lang, mods }) {
  const { routes, i18n, render } = mods;
  const other = lang === 'es' ? 'en' : 'es';
  const ctx = { page, lang, t: (k) => i18n.translate(lang, k), url: (id) => routes.url(id, lang), alt: page[other], hrefs: { es: page.es, en: page.en } };
  return html
    .replace(/<!--@([\w-]+)-->/g, (_, name) => {
      if (typeof render[name] !== 'function') throw new Error(`Bloque desconocido <!--@${name}--> en ${page.template}.html`);
      return render[name](ctx);
    })
    .replace(/\{\{\s*lang\s*\}\}/g, lang)
    .replace(/\{\{\s*alt\s*\}\}/g, ctx.alt)
    .replace(/\{\{\s*url:([\w:-]+)\s*\}\}/g, (_, id) => ctx.url(id))
    .replace(/\{\{\s*t:([\w.]+)\s*\}\}/g, (_, k) => escapeHtml(ctx.t(k)));
}

const outFile = (route) => (route === '/' ? 'index.html' : `${route.replace(/^\//, '')}index.html`);

export default function i18nPages() {
  let templates = [];
  return {
    name: 'wilb:i18n-pages',
    enforce: 'post',

    config() {
      templates = fs.readdirSync(PAGES).filter((f) => f.endsWith('.html'));
      return {
        appType: 'mpa',
        build: { rollupOptions: { input: Object.fromEntries(templates.map((f) => [f.replace('.html', ''), path.join(PAGES, f)])) } },
      };
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
          const mods = await loadModules((id) => server.ssrLoadModule(id));
          const hit = mods.routes.match(pathname);
          if (!hit) return next();
          if (!pathname.endsWith('/')) { res.statusCode = 301; res.setHeader('Location', `${pathname}/`); return res.end(); }
          const raw = fs.readFileSync(path.join(PAGES, `${hit.page.template}.html`), 'utf8');
          const html = await server.transformIndexHtml(req.url, renderPage(raw, { ...hit, mods }));
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(html);
        } catch (err) {
          next(err);
        }
      });
    },

    async generateBundle(_, bundle) {
      const stamp = Date.now();
      const mods = await loadModules((id) => import(`${pathToFileURL(path.join(ROOT, id)).href}?v=${stamp}`));
      const built = {};
      for (const [name, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'asset' && name.endsWith('.html') && name.includes('src/pages/')) {
          built[path.basename(name, '.html')] = String(chunk.source);
          delete bundle[name];
        }
      }
      for (const page of mods.routes.pages) {
        const html = built[page.template];
        if (!html) throw new Error(`Falta la plantilla src/pages/${page.template}.html`);
        for (const lang of mods.routes.LANGS) {
          this.emitFile({ type: 'asset', fileName: outFile(page[lang]), source: renderPage(html, { page, lang, mods }) });
        }
      }
    },
  };
}
