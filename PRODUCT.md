# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite (multipágina) · HTML5 · CSS3 · JS módulos · Tailwind CSS v4 leyendo `tokens.css` con `@theme` · GSAP + ScrollTrigger · Lenis · Howler.js · Netlify (+ Forms). Definido en `BRIEF_PORTAFOLIO_WILMER_B.md` §13. Fase 0 = boceto HTML en artifact.

## Users

- **Primario:** productoras y estudios que podrían contratar a Wilmer como director o filmmaker dentro de su equipo. Llegan por un link que él envía; deben entender en 10 s quién es y ver trabajo.
- **Secundarios:** clientes directos (artistas, marcas) y docentes de la UCC (es entrega académica, ruta B).

## Product Purpose

Portafolio personal de Wilmer Alejandro Buriticá Alvira (director y filmmaker, Diseño Crossmedia UCC). Dos puertas: un Home directo y rápido para enviar, y una experiencia narrativa escondida (`/historia`) que cuenta quién es, desde un lienzo en blanco hasta el frente a frente. Éxito: una productora lo ve, entiende su mano y lo contacta.

## Positioning

Cuenta historias con las manos, en un mundo de resultados automáticos. La experiencia escondida (fósforo, bodegón colombiano, juego "Resultado sin alma") es prueba hecha a mano, no adorno.

## Operating Context

Se envía como link a productoras/clientes y se evalúa en clase. Proyectos alojados en YouTube (IDs en el brief §11). Ligado al estudio RAKÜN ("Una producción RAKÜN").

## Capabilities and Constraints

- Bilingüe ES (base) / EN en todo el sitio; rutas `/en/…`.
- Home y Trabajos rapidísimos en 4G; la experiencia completa debe funcionar en móvil.
- Requisitos UCC: tokens en CSS, Atomic Design con mismos nombres en Figma y código, ≥3 páginas responsive, README, repo público ≥15 commits, URL pública.
- Sonido solo por elección del visitante; audiodescripción; subtítulos.
- Pendiente: videos boceto y finales, textos del chispazo/introducción, frases finales, bodegón, editoriales, redes, licencias de Coolvetica/DeFonte/Owners.

## Brand Commitments

- **Nombre: Wil B.** Logo-sistema (`Escritorio\1x\logo.png`): `WilB·` + barras de color + palabra variable **BLUR / FOCUS / LIT**. Letra del logo: Owners (redondeada); la B en DeFonte Reduced.
- **BLUR / LIT / FOCUS marcan los tramos de `/historia`:** BLUR = pared sin identidad; LIT = chispazo y luz; FOCUS = la cámara se acerca hasta el frente a frente.
- **Orden de colores** en barras y cinta: azul, rojo, naranja, amarillo (como el logo).
- Cierre de marca: "A la mierda la IA. Hecho con las manos." (en español en ambas versiones).
- Referencia principal: mikkisindhunata.com (editorial). Fuentes y paleta del brief §8.

## Evidence on Hand

- 7 proyectos reales con IDs de YouTube (brief §11). No inventar otros proyectos, clientes, cifras ni redes.
- Logo estático y archivo de animación (`Escritorio\Animacion del logo.aep`).
- Aún no hay videos boceto, fotos ni piezas editoriales.

## Product Principles

1. Lo directo primero: quien recibe el link ve trabajo sin pasar por la intro.
2. La experiencia se descubre, no se anuncia.
3. Todo lo hecho a mano se nota; nada genérico.
4. Ningún texto inventado: lo que falte queda como `TODO` visible.

## Accessibility & Inclusion

Audiodescripción narrada por Wilmer + texto `aria-live`; subtítulos `.vtt` ES/EN; `prefers-reduced-motion` y `saveData` respetados; interactivos como `<button>`/`<a>` reales con teclado.
