# Wil B · Portafolio de Wilmer Buriticá

Portafolio de **Wilmer Alejandro Buriticá Alvira**, director y filmmaker (Diseño Crossmedia, UCC).
Dos puertas: una **directa** (Inicio, Trabajos, Sobre mí, Contacto), rápida para enviar, y una
**escondida** (`/historia`), la experiencia narrativa BLUR → LIT → FOCUS.

Website by RAKÜN.

## Stack

- [Vite](https://vite.dev) multipágina · HTML5 · CSS3 · JavaScript en módulos
- [Tailwind CSS v4](https://tailwindcss.com) leyendo los tokens de `src/styles/tokens.css` con `@theme`
- Netlify (hosting y formularios)
- Próximas fases: GSAP + ScrollTrigger, Lenis, Howler.js

## Cómo correrlo

```bash
npm install
npm run dev       # servidor local en http://localhost:5173
npm run build     # genera dist/ (una página por ruta e idioma)
npm run preview   # sirve dist/ para revisarlo
```

## Idiomas

Español es el idioma base; todo existe también en inglés.

| Español | English |
|---|---|
| `/` | `/en/` |
| `/trabajos/` | `/en/work/` |
| `/trabajos/:slug/` | `/en/work/:slug/` |
| `/sobre-mi/` | `/en/about/` |
| `/contacto/` | `/en/contact/` |
| `/historia/` | `/en/story/` |
| `/sistema/` | `/en/system/` (sistema de diseño, fuera del menú) |

- Cada página tiene **una sola plantilla** en `src/pages/`. El plugin `plugins/i18n-pages.js` la
  genera en los dos idiomas: en desarrollo al vuelo y en el build como `dist/<ruta>/index.html`.
- Los textos viven en `src/i18n/es.js` y `src/i18n/en.js`. En las plantillas se usan marcas:

  | Marca | Qué hace |
  |---|---|
  | `{{t:home.intro}}` | texto del diccionario |
  | `{{url:trabajos}}` | ruta de otra página en el idioma actual |
  | `{{alt}}` | la misma página en el otro idioma |
  | `{{lang}}` | `es` o `en` |
  | `<!--@header-->` | bloque de `src/render/index.js` (header, footer, lista de trabajos…) |

- Las rutas están en `src/data/routes.js`; los proyectos (con sus textos en los dos idiomas) en
  `src/data/projects.js`.
- En el navegador, `t('clave')` de `src/lib/i18n.js` usa el idioma de `<html lang>`.
- Primera visita a la portada: si el navegador no está en español, pasa a `/en/`. Un enlace
  compartido siempre se respeta.

## Estructura

```
plugins/          plugin de Vite que genera las páginas por idioma
public/           archivos que se copian tal cual (img, fuentes)
src/
  data/           rutas y proyectos
  i18n/           diccionarios es / en
  lib/            utilidades del navegador (i18n…)
  pages/          una plantilla HTML por tipo de página
  render/         bloques HTML compartidos (Header, Footer…)
  styles/         tokens.css (design tokens) y main.css
  main.js         entrada común
```

## Atomic Design

Cada nivel tiene su archivo de HTML en `src/render/` y su hoja de estilos en `src/styles/`, con la clase igual al nombre (`Pill` → `.pill`). La página `/sistema/` los muestra todos junto a los tokens.

| Nivel | Archivos | Piezas |
|---|---|---|
| Átomos | `atoms.js` · `atoms.css` | `Pill`, `LangToggle`, `Logo`, `Tape`, `ButtonPrimary`, `Input`, `Tag`, `Folio`, `LightSwitch`, `RakunEye`, `ToneToggle`, `Grain` |
| Moléculas | `molecules.js` · `molecules.css` | `NavGroup`, `ChapterTitle`, `FieldLabel`, `WorkCard`, `SoundToggle`, `Signature`, `Credits`, `YouTubeLite` |
| Organismos | `organisms.js` · `organisms.css` | `Header`, `MenuMobile`, `Footer`, `HomeReel`, `WorksOverview`, `AllWorksPill` |
| Plantillas | `src/pages/*.html` · `templates.css` | `HomeTemplate` (home.html), `WorksTemplate` (trabajos.html), `ProjectTemplate` (proyecto.html) |

El comportamiento (menú del celular, tono oscuro / claro, sonido) está en `src/lib/ui.js`. El tono usa variables `--tono-*` y `data-tono="claro"` en `<html>`; solo Sobre mí y Contacto lo pueden cambiar y se recuerda entre visitas.

Los nombres son los mismos en Figma y en el código (brief §13).

## Videos e imágenes

Todo está en un solo manifiesto: `src/data/media.js` (brief §9.5). Cada proyecto tiene 3 fragmentos mudos en `public/media/trabajos/<proyecto>/`:

| Archivo | Uso |
|---|---|
| `<n>-1080.mp4` | Inicio en computador |
| `<n>-720.mp4` | Trabajos, página de proyecto y celular |
| `<n>.jpg` | portada (un cuadro del mismo clip) |

Se comprimieron con ffmpeg (H.264, `-crf 27/28`, `-movflags +faststart` para que empiecen sin bajar el archivo completo). Los proyectos completos se ven en YouTube, que carga solo al hacer clic.

- **Inicio:** cada proyecto dura un ciclo del logo (BLUR → FOCUS → LIT) más una pausa con el logo cerrado. Sus fragmentos se encadenan sin repetirse y al final entra el siguiente proyecto. Los reels verticales no entran en el Inicio. Por donde pasa el mouse, las letras se pintan con los colores de la marca.
- **Trabajos:** quietos y desenfocados; el adelanto se precarga cuando el recuadro se acerca y corre al pasar el mouse (en celular, el que está a la vista). Filtros con `?c=categoria` en la dirección.
- **Entrada:** recuadros y textos suben desde abajo y se enfocan al aparecer (`src/lib/reveal.js`).
- Con «reducir movimiento» o ahorro de datos se quedan las portadas, sin video ni animaciones.

## Logo animado

El logo es la misma animación hecha en Remotion: `src/lib/logo/scene.ts` y `words.ts` son copia de `Videos/WilB animacion logo/logo-anim/src` (ahí se editan; luego se copian aquí). `canvas.ts` lo dibuja en un `<canvas>` y `mount.ts` arranca cada `<canvas data-logo>` (`data-mode="intro"` se arma una vez, `"loop"` repite BLUR / FOCUS / LIT; `data-color` lo pone de un solo color). Con «reducir movimiento» se ve el logo terminado.

## Tipografías

Archivo (titulares, ancho 72 %), Space Grotesk y Space Mono, todas con licencia OFL e instaladas en local con Fontsource (no se cargan de Google). DeFonte Reduced queda pendiente de licencia.

## Fases

- [x] 0. Boceto en el lienzo de diseño
- [x] 1. Proyecto base, estructura e idiomas
- [x] 2. Tokens, tipografías y átomos (ver `/sistema/`)
- [x] 3. Moléculas y organismos base (Header con el logo animado, menú del celular, Footer, tono claro / oscuro)
- [x] 4. Inicio + Trabajos + Proyecto (reel sincronizado con el logo, filtros, YouTube al clic)
- [ ] 5–11. Historia, piezas editoriales, juego, contacto, proceso
- [ ] 12. Sonido y audiodescripción
- [ ] 13. Responsive, accesibilidad y rendimiento
- [ ] 14. Despliegue y evidencias

## Pendientes (TODO)

- Licencias de Coolvetica y DeFonte Reduced antes de publicar.
- Textos de los proyectos en primera persona y revisión del inglés.
- Retrato, correo público y redes.
