// 1️⃣ Importamos las utilidades de Astro para definir colecciones
import { defineCollection, z } from 'astro:content';

// 2️⃣ Definimos una colección de ejemplo: "posts" de un blog ficticio
const recipesCollection = defineCollection({
  // Tipo de contenido (casi siempre 'content' para Markdown/MDX)
  type: 'content',
  // Schema: define qué campos tiene cada entrada y su tipo
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()).optional(),
    difficulty: z.string(), // Aqui lo voy a dejar sin enum por si acaso
    total_time: z.string(),
    active_time: z.string(),
    servings: z.number(),
    category: z.string(),
    shopping_list: z.array(z.string()).optional(),
    date: z.date(),
  }),
});

// 3️⃣ Exportamos todas las colecciones
// ⚠️ IMPORTANTE: La key ('posts') debe coincidir EXACTAMENTE
// con el nombre de la carpeta en src/content/posts/
export const collections = {
  recipes: recipesCollection,
};

// 📝 Ahora adapta esto para tu colección 'recipes'
// Pistas:
// - Cambia 'posts' por 'recipes' (carpeta + export)
// - Mapea tus campos: title, tags, difficulty, total_time, active_time, servings, category, shopping_list, date
// - Elige el tipo correcto para cada campo (string, number, array, enum, etc)
