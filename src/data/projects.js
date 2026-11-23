// Proyectos reales (brief §11). Fuente: rakun-web, trabajo/seed.js.
// Los nombres propios no se traducen; el tipo y los textos sí.
// TODO: reescribir summary y description en primera persona («dirigí», no «asumimos») y revisar el inglés.

export const projects = [
  {
    slug: 'amor-de-calle',
    title: 'Amor de calle',
    category: 'videoclip',
    format: { es: 'Videoclip', en: 'Music video' },
    client: 'Apostol',
    year: 2026,
    role: { es: 'Dirección, foto, post', en: 'Direction, cinematography, post' },
    youtube: '4RtfGuRQXYw',
    featured: true,
    summary: { es: 'La crudeza urbana contada sin filtros.', en: 'Urban rawness, told without filters.' },
  },
  {
    slug: 'donde-la-musica-muere',
    title: 'Donde la música muere',
    category: 'ficcion',
    format: { es: 'Cortometraje', en: 'Short film' },
    client: { es: 'Proyecto de semestre', en: 'Semester project' },
    year: 2024,
    role: { es: 'Dirección, foto, cámara, post', en: 'Direction, cinematography, camera, post' },
    youtube: 'dAaUGrENSRQ',
    featured: true,
    summary: { es: 'Una reinterpretación del universo de ¡Que viva la música!', en: 'A reinterpretation of the world of ¡Que viva la música!' },
  },
  {
    slug: 'el-pregon-de-la-plaza',
    title: 'El pregón de la plaza',
    category: 'documental',
    format: { es: 'Documental', en: 'Documentary' },
    client: { es: 'Proyecto transmedia', en: 'Transmedia project' },
    year: 2026,
    role: { es: 'Dirección, cámara, post', en: 'Direction, camera, post' },
    youtube: '9jISh5-TYGk',
    featured: true,
    summary: { es: 'El «caos con sentido» de los mercados de Pereira, como patrimonio vivo.', en: 'The «meaningful chaos» of Pereira’s markets, as living heritage.' },
  },
  {
    slug: 'otro-amanecer',
    title: 'Otro amanecer',
    category: 'videoclip',
    format: { es: 'Videoclip', en: 'Music video' },
    client: 'Apostol',
    year: 2026,
    role: { es: 'Dirección, foto, post', en: 'Direction, cinematography, post' },
    youtube: 'Yv687H7gZnk',
    featured: true,
    summary: { es: 'El paso de la oscuridad a la luz como un despertar visceral.', en: 'Going from darkness to light as a visceral awakening.' },
  },
  {
    slug: 'nos-fui-pues-mijo',
    title: 'Nos fui ¡Pues mijo!',
    category: 'formatos',
    format: { es: 'Magazine', en: 'Magazine' },
    client: 'UCC Pereira',
    year: 2025,
    role: { es: 'Dirección, cámara, post', en: 'Direction, camera, post' },
    youtube: 'pH4I3-CPcwU',
    featured: false,
    summary: { es: 'Un magazine sobre la vida del campo con una historia que lo une.', en: 'A magazine about country life, held together by one story.' },
  },
  {
    slug: 'doc-mariana-hoyos',
    title: 'Doc Mariana Hoyos',
    category: 'formatos',
    format: { es: 'Reels', en: 'Reels' },
    client: { es: 'Veterinaria', en: 'Veterinary clinic' },
    year: null,
    role: { es: 'Estrategia, grabación, edición', en: 'Strategy, shooting, editing' },
    reels: ['u6wRut-pz0s', 'rlkpU8R4dfY', 'Dr49vCa60ug'],
    featured: false,
    summary: { es: 'Estrategia, grabación y edición para redes.', en: 'Strategy, shooting and editing for social media.' },
  },
];

// Valor en el idioma pedido (acepta texto plano o { es, en })
export const loc = (v, lang) => (v && typeof v === 'object' ? v[lang] ?? v.es : v);

export const bySlug = (slug) => projects.find((p) => p.slug === slug);
