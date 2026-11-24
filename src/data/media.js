// Manifiesto de medios (brief §9.5): cambiar un video o una portada es cambiar una línea.
// Fragmentos mudos de cada proyecto en public/media/trabajos/<slug>/:
//   <n>-1080.mp4 (Inicio en computador) · <n>-720.mp4 (Trabajos, proyecto y celular) · <n>.jpg (portada = un cuadro del clip)
// Comprimidos con ffmpeg (H.264, -movflags +faststart para que empiecen sin bajar el archivo completo).
// Original: los adelantos de la web de RAKÜN.

const clip = (slug, n, dur) => ({
  hd: `/media/trabajos/${slug}/${n}-1080.mp4`,
  sd: `/media/trabajos/${slug}/${n}-720.mp4`,
  poster: `/media/trabajos/${slug}/${n}.jpg`,
  dur, // segundos
});

// El orden de los clips es el orden en que se encadenan en el Inicio (sin repetir)
const proyecto = (slug, durs, preview) => {
  const clips = durs.map((d, i) => clip(slug, i + 1, d));
  return { poster: clips[0].poster, clips, preview: clips[preview - 1] };
};

export const media = {
  'amor-de-calle': proyecto('amor-de-calle', [15.0, 5.4, 9.6], 3),
  'donde-la-musica-muere': proyecto('donde-la-musica-muere', [26.5, 9.5, 12.7], 3),
  'el-pregon-de-la-plaza': proyecto('el-pregon-de-la-plaza', [12.1, 6.5, 7.6], 3),
  'otro-amanecer': proyecto('otro-amanecer', [11.9, 3.4, 5.9], 3),
  'nos-fui-pues-mijo': proyecto('nos-fui-pues-mijo', [10.7, 19.0, 18.4], 3),
  // Reels verticales: van en Trabajos y en su página, pero no en el reel del Inicio (pedido de Wilmer)
  'doc-mariana-hoyos': {
    vertical: true,
    reels: [
      { youtube: 'u6wRut-pz0s', poster: '/media/posters/doc-mariana-hoyos-1.jpg' },
      { youtube: 'rlkpU8R4dfY', poster: '/media/posters/doc-mariana-hoyos-2.jpg' },
      { youtube: 'Dr49vCa60ug', poster: '/media/posters/doc-mariana-hoyos-3.jpg' },
    ],
  },
};

export const mediaFor = (slug) => media[slug] ?? {};
