#!/usr/bin/env node
/**
 * Valida ficheros de receta contra el schema de la colección, sin build.
 *
 * Existe para la migración a `schema_version: 1`: mientras conviven recetas
 * viejas y nuevas, `astro build` aborta en la primera que falla y no deja ver
 * el resto. Esto las revisa todas y las lista de una vez.
 *
 *   node scripts/validar-recetas.mjs                      # toda la colección
 *   node scripts/validar-recetas.mjs docs/modo-cocina/*.md
 *
 * Sale con código 1 si alguna falla, así que sirve tal cual en un hook o en CI.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { z } from 'astro/zod';
import yaml from 'js-yaml';

import { camposReceta, coherenciaDeIds } from '../src/content/recipe-schema.ts';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const COLECCION = join(RAIZ, 'src/content/recipes');

// `image()` es un helper del build de Astro y aquí no existe. Para validar el
// resto de la receta basta con aceptar la ruta como texto: si está mal escrita,
// lo dirá el build al optimizar la foto.
const schema = z
  .object({ ...camposReceta, image: z.string().optional() })
  .superRefine(coherenciaDeIds);

/** Devuelve el bloque YAML de la cabecera, o null si el fichero no tiene. */
function frontmatter(texto) {
  const match = texto.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match ? match[1] : null;
}

function validar(ruta) {
  const nombre = basename(ruta);
  const cabecera = frontmatter(readFileSync(ruta, 'utf8'));

  if (cabecera === null) {
    return { nombre, errores: ['El fichero no tiene frontmatter.'] };
  }

  let datos;
  try {
    datos = yaml.load(cabecera);
  } catch (error) {
    return { nombre, errores: [`YAML inválido: ${error.message}`] };
  }

  const resultado = schema.safeParse(datos);
  if (resultado.success) return { nombre, errores: [] };

  const errores = resultado.error.issues.map((issue) => {
    const donde = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
    return `${donde}${issue.message}`;
  });

  return { nombre, errores };
}

const argumentos = process.argv.slice(2);
const ficheros =
  argumentos.length > 0
    ? argumentos
    : readdirSync(COLECCION)
        .filter((f) => f.endsWith('.md'))
        .map((f) => join(COLECCION, f));

if (ficheros.length === 0) {
  console.error('No hay ficheros que validar.');
  process.exit(1);
}

let fallan = 0;

for (const ruta of ficheros) {
  const { nombre, errores } = validar(ruta);

  if (errores.length === 0) {
    console.log(`  ok   ${nombre}`);
    continue;
  }

  fallan += 1;
  console.log(`  MAL  ${nombre}`);
  for (const error of errores) console.log(`         ${error}`);
}

console.log(`\n${ficheros.length - fallan} de ${ficheros.length} recetas válidas.`);
process.exit(fallan > 0 ? 1 : 0);
