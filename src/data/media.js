// Manifiesto de medios (brief §9.5): cambiar un video o una portada es cambiar una línea.
// Los adelantos mudos ya están comprimidos y publicados en el almacenamiento de RAKÜN (Supabase),
// el mismo que usa la web de RAKÜN. Las portadas viven en public/media/posters.
const RAKUN = 'https://ajbydapzrtfagmcpglte.supabase.co/storage/v1/object/public/trabajo';

export const media = {
  'amor-de-calle': {
    poster: '/media/posters/amor-de-calle.jpg',
    reel: `${RAKUN}/amor-de-calle/mv7e8exh-Portada-Amor-De-Calle.mp4`,            // Inicio
    preview: `${RAKUN}/amor-de-calle/mv7gzui2-Videoportada2-Amor-De-Calle.mp4`,    // Trabajos (al pasar el mouse)
    clips: [
      `${RAKUN}/amor-de-calle/mv7e8exh-Portada-Amor-De-Calle.mp4`,
      `${RAKUN}/amor-de-calle/mv7gzsow-Portada3-Amor-De-Calle.mp4`,
      `${RAKUN}/amor-de-calle/mv7gzui2-Videoportada2-Amor-De-Calle.mp4`,
    ],
  },
  'donde-la-musica-muere': {
    poster: '/media/posters/donde-la-musica-muere.jpg',
    reel: `${RAKUN}/donde-la-musica-muere/mv7gvbx9-Portada-Donde-Muere-La-Musica-1.mp4`,
    preview: `${RAKUN}/donde-la-musica-muere/mv7gvjl8-Portada-Donden-Muere-La-Musica-2.mp4`,
    // El tercer adelanto pesa 33 MB sin comprimir: TODO comprimirlo y agregarlo
    clips: [
      `${RAKUN}/donde-la-musica-muere/mv7gvbx9-Portada-Donde-Muere-La-Musica-1.mp4`,
      `${RAKUN}/donde-la-musica-muere/mv7gvjl8-Portada-Donden-Muere-La-Musica-2.mp4`,
    ],
  },
  'el-pregon-de-la-plaza': {
    poster: '/media/posters/el-pregon-de-la-plaza.jpg',
    reel: `${RAKUN}/el-pregon-de-la-plaza/mv7h89jw-Pregon-De-La-Plaza-Protada-1.mp4`,
    preview: `${RAKUN}/el-pregon-de-la-plaza/mv7h8dkp-Portada-2-El-Pregon.mp4`,
    clips: [
      `${RAKUN}/el-pregon-de-la-plaza/mv7h89jw-Pregon-De-La-Plaza-Protada-1.mp4`,
      `${RAKUN}/el-pregon-de-la-plaza/mv7h8bve-Portada-3-El-Pregon-De-La-Plaza.mp4`,
      `${RAKUN}/el-pregon-de-la-plaza/mv7h8dkp-Portada-2-El-Pregon.mp4`,
    ],
  },
  'otro-amanecer': {
    poster: '/media/posters/otro-amanecer.jpg',
    reel: `${RAKUN}/otro-amanecer/mv7gz47l-Portada-Otro-Amanecer.mp4`,
    preview: `${RAKUN}/otro-amanecer/mv7gz8kb-Portada3-Otroamanecer.mp4`,
    clips: [
      `${RAKUN}/otro-amanecer/mv7gz47l-Portada-Otro-Amanecer.mp4`,
      `${RAKUN}/otro-amanecer/mv7gz14c-Portada-2-Otro-Amanecer.mp4`,
      `${RAKUN}/otro-amanecer/mv7gz8kb-Portada3-Otroamanecer.mp4`,
    ],
  },
  'nos-fui-pues-mijo': {
    poster: '/media/posters/nos-fui-pues-mijo.jpg',
    reel: `${RAKUN}/nos-fui-pues-mijo/mv7h1ayc-Portada1-Nosfui.mp4`,
    preview: `${RAKUN}/nos-fui-pues-mijo/mv7h1gpl-Portada-2-Nosfui.mp4`,
    clips: [
      `${RAKUN}/nos-fui-pues-mijo/mv7h1ayc-Portada1-Nosfui.mp4`,
      `${RAKUN}/nos-fui-pues-mijo/mv7h1em2-Portada3-Nosfuipues.mp4`,
      `${RAKUN}/nos-fui-pues-mijo/mv7h1gpl-Portada-2-Nosfui.mp4`,
    ],
  },
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
