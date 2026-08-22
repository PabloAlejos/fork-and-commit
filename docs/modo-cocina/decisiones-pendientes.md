Confirmado un caso que importa para la migración: `kimchi` tiene `total_time: "40 min + fermentación"`. En segundos eso no existe. Lo apunto abajo.

## Lo que el formato resuelve

El salto real es `uses: [ids]`. Con eso el paso deja de ser prosa y pasa a saber qué ingredientes toca, que es lo que permite enseñar «para este paso: 150 g de pollo, aceite, sal» sin que el cocinero vuelva a la lista de arriba. Y `timer` en segundos + `scalable_time` es lo que convierte un paso en algo accionable. Los tiempos en segundos, además, matan de paso el `parseTime` frágil de `RecipeFilters.astro:483`.

Dicho eso, hay tres decisiones que tomar antes de escribir una línea.

## 1. El fichero tiene dos verdades

El cuerpo del `.md` es una proyección del frontmatter: los mismos ingredientes, los mismos pasos, el mismo texto. Si alguien toca uno y no el otro, el modo cook y la vista de lectura dicen cosas distintas y nada lo detecta.

Mi propuesta: **el frontmatter es la fuente, el cuerpo se genera**. Encaja exactamente con lo que ya decidiste hace dos mensajes — la BD manda y `markdown.py` renderiza el `.md` al publicar. Solo hay que enseñarle a renderizar también el cuerpo largo a partir de `ingredients`, `steps`, `utensils` y `notes`. El fichero sigue leyéndose bien en GitHub, Pagefind lo sigue indexando, la impresión sigue funcionando, y `[slug].astro` sigue pintando `<Content />` sin tocar nada.

La regla que lo sostiene: **nadie edita un `.md` a mano**. Ya la habíamos aceptado.

## 2. La prosa lleva cantidades dentro, y la prosa no escala

Este es el fallo serio del formato, y conviene verlo ahora:

```yaml
- id: r1
  uses: [kombu, shiitake_seco, agua]
  content: |
    Poner el kombu y el shiitake deshidratado en 500 ml del agua fría.
```

Si el modo cook escala a 8 raciones, `agua` pasa a 4 l en la lista de `uses`… y el texto sigue diciendo «500 ml». El paso miente. Lo mismo con `c2`: «los 1,5 litros de agua restantes».

Dos salidas:

- **(a)** El escalado solo afecta a la lista de ingredientes del paso, y la prosa se queda como está. Barato, pero convive con contradicciones a la vista.
- **(b)** Las cantidades en el `content` se escriben como referencias, `{agua}` o `{agua:500ml}`, y se resuelven al pintar. Correcto, pero obliga a que el generador nunca escriba un número suelto — y eso es difícil de garantizar con un LLM.

Mi recomendación es **(a) para la v1, pero decidiendo ya que la prosa no repite cantidades**: que el paso diga «poner el kombu y el shiitake en parte del agua fría» y que el cuánto viva solo en `uses`. Es una regla para el prompt y para el skill, no código. Si luego escuece, (b) es un añadido, no un rediseño.

Hay que decidirlo ahora porque condiciona cómo se escriben los `content` en la migración de las 10 recetas.

## 3. No lances el import todavía

Si importas ahora, la BD de pro se llena con el modelo viejo (`total_time` como texto, `shopping_list`, sin `steps`) y en cuanto cambiemos el modelo hay que vaciarla y repetir. Y no hay herramienta de migraciones: lo dice el propio script de import.

El orden barato es: **migrar los 10 `.md` → cambiar el modelo → importar**. La BD de pro tiene una sola receta, así que este es literalmente el mejor momento posible para el refactor. Si ya lo lanzaste, no pasa nada: se borra la tabla y se repite.

## Lo que se rompe (para dimensionar)

| Sitio | Qué |
| :-- | :-- |
| `content/config.ts` | schema entero nuevo, con `superRefine` para validar que cada `uses` apunta a un id que existe |
| `[slug].astro:26` | `shopping_list` desaparece → se deriva de `ingredients` |
| `[slug].astro:30-31` | tiempos en segundos → hay que formatearlos («2 h 30 min») |
| `RecipeFilters.astro:483` | `parseTime` se borra: el filtro pasa a comparar números |
| `RecipeCard.astro` | recibe `totalTime: string` → number |
| `admin.astro` | el formulario de edición: hoy son inputs de texto planos, y ahora hay que editar grupos, ingredientes y pasos |
| backend `models.py` | `ingredients`/`steps`/`utensils`/`notes` como JSON, tiempos a Integer, fuera `shopping_list` |
| backend `prompts.py` + skill `recipe-generator` | tienen que producir la estructura nueva |

El más gordo con diferencia es el formulario del admin: pasar de diez inputs a editar un árbol de pasos con ids. Puede que ahí la respuesta sea editar el YAML en crudo en un `<textarea>` con validación, en lugar de construir un editor.

## Lo que necesito que me digas

1. **¿Qué es el modo cook para ti?** Yo imagino una pantalla dedicada (`/recipes/[slug]/cook`), paso a paso, con: selector de raciones, los ingredientes del paso ya escalados, temporizador con cuenta atrás, checklist para la mise en place, pantalla siempre encendida y progreso guardado por si sales. ¿Sobra algo? ¿Falta algo?

2. **¿Escalado en la v1, sí o no?** Es lo que arrastra el problema 2. Sin escalado, el modo cook es bastante más simple y `amount`/`unit` pasan a ser casi decorativos.

3. **`kimchi` y `masa-pizza`**: fermentaciones de días. ¿`total_time` en segundos incluye la fermentación (26 h = 93 600) o el reposo vive solo como paso `rest` y el total cuenta solo lo demás? Afecta al filtro «≤ 30 min».

4. **`draft: false`** en el frontmatter, ¿para qué? El estado ya lo lleva la BD. ¿Es para que Astro excluya borradores del build?

5. **`image` no aparece en tus ejemplos** y `pulled-pork` tiene foto. Doy por hecho que se mantiene, ¿verdad?

6. **Los 10 `.md` viejos**: ¿los convierte Claude desde el backend con un script de un solo uso y tú revisas, o prefieres ir uno a uno? Los `uses` son lo que hay que revisar con lupa.

Cuando me contestes esto, te escribo el `.md` con las tareas.
