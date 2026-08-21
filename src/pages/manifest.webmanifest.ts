import type { APIRoute } from 'astro';

// El manifest vivía en public/ con rutas absolutas ('/icon-192.png'),
// que ignoran la base del sitio y daban 404 en GitHub Pages. Generándolo
// aquí, las rutas salen siempre de astro.config.mjs.
const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');

const manifest = {
  name: 'Fork & Commit',
  short_name: 'Fork & Commit',
  description: 'Colección personal de recetas donde el código se encuentra con la cocina.',
  lang: 'es',
  start_url: base,
  scope: base,
  display: 'standalone',
  background_color: '#F9F3E3',
  theme_color: '#F9F3E3',
  icons: [
    { src: `${base}icon-192.png`, sizes: '192x192', type: 'image/png' },
    { src: `${base}icon-512.png`, sizes: '512x512', type: 'image/png' },
  ],
};

export const GET: APIRoute = () =>
  new Response(JSON.stringify(manifest, null, 2), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  });
