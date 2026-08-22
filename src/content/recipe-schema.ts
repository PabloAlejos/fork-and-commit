// `astro/zod` y no `astro:content`: es el mismo zod que usa la colección, pero
// se puede importar desde un script de Node suelto. Eso es lo que permite
// validar una receta sin levantar un build (ver `scripts/validar-recetas.mjs`).
import { z } from 'astro/zod';

/**
 * Schema de las recetas — `schema_version: 1`.
 *
 * Este fichero es el contrato entre el backend que publica los `.md` y el modo
 * cocina que los ejecuta. Nadie edita una receta a mano: las genera el backend
 * desde su base de datos, así que lo que aquí se valide es lo que allí hay que
 * producir. Si cambia algo, cambia también `markdown.py` del recetario.
 *
 * La validación ocurre en build, nunca en el cliente. Una receta mal formada
 * tiene que romper el despliegue con un mensaje claro, no degradar en silencio
 * mientras alguien cocina con el móvil en la mano.
 *
 * Vive separado de `config.ts` porque la parte que importa —la forma de los
 * datos y la coherencia de los ids— no necesita nada de Astro, y así se puede
 * validar una receta sin levantar un build entero.
 */

/**
 * Unidades cerradas a propósito: un `unit: "gr"` en vez de `"g"` es justo el
 * error que un enum caza en build y un string libre deja pasar hasta la
 * pantalla. Ampliar la lista es añadir una línea; conviene hacerlo aquí y no
 * relajar el tipo.
 *
 * Ausente o `null` significa unidad contable — «2 cebollas», «9 tomates
 * cherry» — no «sin cantidad». Eso último es `amount: null`.
 */
export const unidad = z.enum(['g', 'kg', 'ml', 'l', 'cucharada', 'cucharadita']);

export const ingrediente = z.object({
  /** Referenciado desde `steps[].uses`. Único dentro de la receta. */
  id: z.string().min(1),
  /**
   * `null` es «al gusto»: sal, aceite, Tajín por encima. Se pinta sin número.
   * No confundir con la ausencia de `unit`, que sí lleva cantidad.
   */
  amount: z.number().nullable().default(null),
  /** Extremo alto de un rango: `1-2 cucharaditas` es amount 1, amount_max 2. */
  amount_max: z.number().optional(),
  unit: unidad.nullish(),
  name: z.string().min(1),
  /** Cómo llega cortado: «laminados finos», «en dados». */
  prep: z.string().optional(),
  /** Matiz que no es cantidad ni corte: «bote escurrido», «un puñado, 8-10». */
  note: z.string().optional(),
  optional: z.boolean().optional(),
});

export const grupoIngredientes = z.object({
  /** `null` = lista plana, sin cabecera. No es lo mismo que la cadena vacía. */
  group: z.string().nullable().default(null),
  items: z.array(ingrediente).min(1),
});

export const paso = z.object({
  id: z.string().min(1),
  /**
   * Gobierna en qué pantalla del modo cocina cae el paso: los `prep` van todos
   * juntos en la mise en place, el resto uno a uno.
   */
  type: z.enum(['prep', 'rest', 'cook', 'plate']),
  title: z.string().min(1),
  /** Segundos. Sin `timer`, el paso no ofrece temporizador. */
  timer: z.number().int().positive().optional(),
  /** Ids de ingrediente. Se validan contra `ingredients` en `coherenciaDeIds`. */
  uses: z.array(z.string()).default([]),
  /** Markdown en línea: negritas y saltos de párrafo. */
  content: z.string().min(1),
});

export const nota = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

/** Campos comunes. `image` lo añade `config.ts`, que sí necesita a Astro. */
export const camposReceta = {
  schema_version: z.literal(1),

  title: z.string().min(1),
  /** Frase de entrada. Se pinta bajo el título y va en la meta description. */
  description: z.string().min(1),
  date: z.date(),
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  difficulty: z.string().min(1),
  servings: z.number().int().positive(),

  /**
   * Segundos, los dos.
   *
   * `total_time` es tiempo de calendario e **incluye los reposos**: el kimchi
   * son 26 h, no los 40 min que se tarda en prepararlo. Decir 40 min miente
   * sobre cuándo se come.
   *
   * `active_time` es el tiempo de pie en la cocina, y es por el que filtra la
   * portada: quien busca «≤ 30 min» pregunta cuánto tiene que currar, no
   * cuánto tarda en fermentar.
   */
  total_time: z.number().int().positive(),
  active_time: z.number().int().positive(),

  utensils: z.array(z.string()).default([]),
  ingredients: z.array(grupoIngredientes).min(1),
  /** El orden del array **es** el orden de ejecución. */
  steps: z.array(paso).min(1),
  notes: z.array(nota).default([]),
};

type Receta = {
  ingredients: { items: { id: string }[] }[];
  steps: { id: string; uses: string[] }[];
};

/**
 * Los ids son la costura entre pasos e ingredientes, y ninguno de estos fallos
 * se ve a simple vista en el fichero: un `uses` mal escrito es un ingrediente
 * que desaparece de la pantalla del paso sin que nada avise, y un id duplicado
 * hace que el paso pida otra cosa distinta de la que dice su texto.
 *
 * Por eso se comprueban aquí y revientan el build.
 */
export function coherenciaDeIds(receta: Receta, ctx: z.RefinementCtx): void {
  const vistos = new Set<string>();

  receta.ingredients.forEach((grupo, iGrupo) => {
    grupo.items.forEach((item, iItem) => {
      if (vistos.has(item.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['ingredients', iGrupo, 'items', iItem, 'id'],
          message: `Ingrediente duplicado: "${item.id}". Los ids tienen que ser únicos en toda la receta, no solo dentro de su grupo.`,
        });
      }
      vistos.add(item.id);
    });
  });

  const pasosVistos = new Set<string>();

  receta.steps.forEach((step, iStep) => {
    if (pasosVistos.has(step.id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['steps', iStep, 'id'],
        message: `Paso duplicado: "${step.id}".`,
      });
    }
    pasosVistos.add(step.id);

    step.uses.forEach((id, iUso) => {
      if (!vistos.has(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['steps', iStep, 'uses', iUso],
          message: `El paso "${step.id}" usa el ingrediente "${id}", que no existe en "ingredients". Ids disponibles: ${[...vistos].join(', ')}`,
        });
      }
    });
  });
}
