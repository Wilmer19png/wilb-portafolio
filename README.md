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

Los átomos están en `src/render/atoms.js` (HTML) y `src/styles/atoms.css` (estilos, misma clase que el nombre). La página `/sistema/` los muestra todos junto a los tokens.

Los nombres son los mismos en Figma y en el código (brief §13): átomos (`Pill`, `LangToggle`,
`Logo`…), moléculas (`WorkCard`, `NavGroup`…), organismos (`Header`, `HomeReel`, `WorksOverview`,
`Footer`…) y plantillas (`HomeTemplate`, `WorksTemplate`, `ProjectTemplate`, `StoryTemplate`).

## Logo animado

El logo es la misma animación hecha en Remotion: `src/lib/logo/scene.ts` y `words.ts` son copia de `Videos/WilB animacion logo/logo-anim/src` (ahí se editan; luego se copian aquí). `canvas.ts` lo dibuja en un `<canvas>` y `mount.ts` arranca cada `<canvas data-logo>` (`data-mode="intro"` se arma una vez, `"loop"` repite BLUR / FOCUS / LIT; `data-color` lo pone de un solo color). Con «reducir movimiento» se ve el logo terminado.

## Tipografías

Archivo (titulares, ancho 72 %), Space Grotesk y Space Mono, todas con licencia OFL e instaladas en local con Fontsource (no se cargan de Google). DeFonte Reduced queda pendiente de licencia.

## Fases

- [x] 0. Boceto en el lienzo de diseño
- [x] 1. Proyecto base, estructura e idiomas
- [x] 2. Tokens, tipografías y átomos (ver `/sistema/`)
- [ ] 3. Moléculas y organismos base (Header con el logo animado, Footer…)
- [ ] 4. Inicio + Trabajos + Proyecto
- [ ] 5–11. Historia, piezas editoriales, juego, contacto, proceso
- [ ] 12. Sonido y audiodescripción
- [ ] 13. Responsive, accesibilidad y rendimiento
- [ ] 14. Despliegue y evidencias

## Pendientes (TODO)

- Licencias de Coolvetica y DeFonte Reduced antes de publicar.
- Textos de los proyectos en primera persona y revisión del inglés.
- Retrato, correo público y redes.
