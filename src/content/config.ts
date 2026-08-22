import { defineCollection, z } from 'astro:content';

import { camposReceta, coherenciaDeIds } from './recipe-schema';

/**
 * La forma de una receta vive en `recipe-schema.ts`, que no depende de Astro.
 * Aquí solo se le añade lo que sí necesita el build —la foto, que pasa por el
 * optimizador de imágenes— y se monta la colección.
 */
const recipesCollection = defineCollection({
  type: 'content',
  // Función para poder usar el helper `image()`, que optimiza la foto en build.
  schema: ({ image }) =>
    z
      .object({
        ...camposReceta,
        image: image().optional(),
      })
      .superRefine(coherenciaDeIds),
});

export const collections = {
  recipes: recipesCollection,
};
