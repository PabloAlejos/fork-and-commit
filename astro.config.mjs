import { defineConfig } from 'astro/config';
import pagefind from 'astro-pagefind';

export default defineConfig({
  site: 'https://PabloAlejos.github.io',
  base: '/fork-and-commit',
  output: 'static',
  integrations: [pagefind()],
});