// Página de proyecto: YouTube carga solo al hacer clic, y los fotogramas en movimiento
// se descargan y corren solo cuando están a la vista (brief §9.3).

export function initYouTubeLite(root = document) {
  root.querySelectorAll('.youtubelite[data-youtube]').forEach((box) => {
    box.querySelector('.youtubelite__play')?.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(box.dataset.youtube)}?autoplay=1&rel=0&playsinline=1`;
      iframe.title = box.dataset.title;
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      box.replaceChildren(iframe);
      box.classList.add('is-playing');
      iframe.focus();
    }, { once: true });
  });
}

export function initClips(root = document) {
  const vids = [...root.querySelectorAll('video[data-src]')];
  if (!vids.length) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || navigator.connection?.saveData) return; // se queda el póster
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target: v, isIntersecting }) => {
      if (isIntersecting) {
        if (!v.src) v.src = v.dataset.src;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, { rootMargin: '120px 0px' });
  vids.forEach((v) => io.observe(v));
}
