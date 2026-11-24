// Trabajos: el adelanto corre al pasar el mouse (o al estar a la vista en pantallas táctiles)
// y la píldora de abajo filtra por categoría.

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const saveData = () => navigator.connection?.saveData === true;

/* ---------- adelanto en video ---------- */
function playPreview(card) {
  if (reduce() || saveData()) return;
  const marco = card.querySelector('.workcard__marco');
  let v = marco.querySelector('video');
  if (!v) {
    v = document.createElement('video');
    Object.assign(v, { muted: true, loop: true, playsInline: true, preload: 'auto' });
    v.setAttribute('aria-hidden', 'true');
    v.addEventListener('playing', () => v.classList.add('is-on'));
    v.src = card.dataset.video;
    marco.insertBefore(v, marco.querySelector('.grain'));
  }
  v.play().catch(() => {});
}

function stopPreview(card) {
  const v = card.querySelector('.workcard__marco video');
  if (!v) return;
  v.pause();
  v.classList.remove('is-on');
}

export function initWorkCards(root = document) {
  const cards = [...root.querySelectorAll('.workcard[data-video]')];
  if (!cards.length) return;
  const hover = matchMedia('(hover: hover)').matches;
  if (hover) {
    cards.forEach((c) => {
      c.addEventListener('mouseenter', () => playPreview(c));
      c.addEventListener('mouseleave', () => stopPreview(c));
      c.addEventListener('focus', () => playPreview(c));
      c.addEventListener('blur', () => stopPreview(c));
    });
    return;
  }
  // Celular: corre el que está a la vista
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.intersectionRatio > 0.6 ? playPreview(e.target) : stopPreview(e.target)));
  }, { threshold: [0, 0.6] });
  cards.forEach((c) => io.observe(c));
}

/* ---------- filtros ---------- */
export function initFilters(pill, list) {
  const open = pill.querySelector('[data-filtro-abrir]');
  const menu = pill.querySelector('.allworkspill__lista');
  const nombre = pill.querySelector('[data-filtro-nombre]');
  const vacio = list.querySelector('[data-vacio]');
  const cards = [...list.querySelectorAll('.workcard')];

  const setOpen = (on) => {
    menu.hidden = !on;
    open.setAttribute('aria-expanded', String(on));
    if (on) menu.querySelector('[aria-pressed="true"]')?.focus();
  };

  const apply = (cat) => {
    let visibles = 0;
    cards.forEach((c) => {
      const show = cat === 'todos' || c.dataset.cat === cat;
      c.hidden = !show;
      if (show) visibles += 1;
    });
    list.classList.toggle('is-filtrado', cat !== 'todos');
    vacio.hidden = visibles > 0;
    pill.querySelectorAll('[data-filtro]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filtro === cat)));
    nombre.textContent = pill.querySelector(`[data-filtro="${cat}"]`).dataset.nombre;
    const url = new URL(location.href);
    if (cat === 'todos') url.searchParams.delete('c'); else url.searchParams.set('c', cat);
    history.replaceState(null, '', url);
  };

  open.addEventListener('click', () => setOpen(menu.hidden));
  pill.querySelectorAll('[data-filtro]').forEach((b) => b.addEventListener('click', () => {
    apply(b.dataset.filtro);
    setOpen(false);
    open.focus();
    list.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'start' });
  }));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setOpen(false); open.focus(); } });
  document.addEventListener('click', (e) => { if (!menu.hidden && !pill.contains(e.target)) setOpen(false); });

  // Un enlace compartido con ?c=documental abre ya filtrado
  const inicial = new URL(location.href).searchParams.get('c');
  if (inicial && pill.querySelector(`[data-filtro="${CSS.escape(inicial)}"]`)) apply(inicial);
}
