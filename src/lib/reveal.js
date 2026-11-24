// Entrada de los elementos con [data-reveal]: suben desde abajo y se enfocan (blur → nítido)
// cuando aparecen en pantalla. El retraso de cada uno va en la variable CSS --d.
// Sin JavaScript o con «reducir movimiento» todo se ve desde el principio (ver main.css).

let io = null;

export function reveal(root = document) {
  const els = [...root.querySelectorAll('[data-reveal]:not(.is-visible)')];
  if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-visible')); return; }
  io ??= new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
  // Lo que ya está en pantalla entra de una vez (con su retraso --d); lo demás, al hacer scroll
  requestAnimationFrame(() => {
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0 && r.height > 0) el.classList.add('is-visible');
      else io.observe(el);
    });
  });
}

/** Vuelve a esconder y a animar (por ejemplo, al cambiar el filtro de Trabajos). */
export function replay(els) {
  els.forEach((el) => el.classList.remove('is-visible'));
  requestAnimationFrame(() => reveal());
}
