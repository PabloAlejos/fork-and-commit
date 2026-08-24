# Modo Cocina — plan de trabajo

Deriva de [`especificacion.md`](./especificacion.md), con las correcciones de la
conversación del 2026-08-22 recogidas en §0. Donde las dos digan cosas
distintas, manda este documento.

Toca dos repos:

- **Front** — `fork_and_commit` (Astro, GitHub Pages).
- **Back** — `fork-and-commit-recipe-manager` (FastAPI, publica los `.md`).

---

## 0. Decisiones cerradas

**0.1 — Sin escalado de raciones.** El modo cocina presenta la receta tal como
está escrita. No hay selector de raciones ni recálculo al vuelo.

Consecuencias, todas simplificaciones:

- La **§6 de la especificación desaparece entera**, y con ella el selector de
  raciones de la pantalla de resumen (§5.1, punto 2).
- `scalable_time` **sale del schema**: sin escalado no tiene nada que hacer.
- Los casos límite **7 y 8** de la §9 desaparecen. El **9** (`amount: null`)
  sigue vivo, pero como problema de renderizado, no de aritmética: no imprimir
  `null` ni `undefined` junto al nombre.
- El formateo de fracciones **sigue haciendo falta**, y esto es fácil de pasar
  por alto: los ficheros ya traen `amount: 0.5` (`½ pimiento`, `½ cucharadita de
  comino`, `½ limón`). Hay que pintar `0.5` como `½` aunque nadie escale nada.
- `amount_max` se queda: los rangos (`1-2 cucharaditas`) están en el fichero.
- Muere también la decisión pendiente sobre las cantidades dentro de la prosa
  («500 ml del agua fría»). Si nada escala, el texto nunca se contradice con
  `uses`. No hace falta regla editorial ni plantillas `{agua}`.
- Si una receta trae una incoherencia entre sus ingredientes y su prosa, **se
  corrige a mano en el fichero**. No se resuelve con código.

> Conviene recordar por qué esto no quita nada: hoy la web **tampoco** escala.
> `servings` solo se pinta, en la ficha y en la tarjeta. El escalado habría sido
> funcionalidad nueva, no una que se pierda.

**0.2 — Tiempos y fermentaciones** (decisión delegada):

- `total_time` es **tiempo de calendario e incluye los reposos**. El kimchi son
  26 h, no 40 min. Decir 40 min es mentir sobre cuándo se come.
- `active_time` es el tiempo de pie en la cocina.
- **El filtro de la portada pasa a usar `active_time`**, no `total_time`. La
  pregunta real de quien filtra por «≤ 30 min» es cuánto tiene que currar, no
  cuánto tarda en fermentar. Con `total_time` el kimchi y la masa de pizza no
  aparecen nunca; con `active_time` aparecen, que es lo correcto: el kimchi se
  hace un martes por la noche en 20 minutos.
- La ficha de receta sigue mostrando los dos, como ahora.
- **Un paso `rest` con `timer` > 2 h no ofrece botón de temporizador**, solo
  muestra la duración. Un `setInterval` de 24 h no sirve para nada y prometerlo
  es peor que no ofrecerlo. Para esos casos, el escape hatch a Atajos de iOS de
  la §7.3.

**0.3 — `draft` fuera.** Estaba en los ejemplos por desincronización. El estado
lo lleva la BD del back; Astro no necesita saberlo.

**0.4 — La vista de lectura se pinta desde el frontmatter, con el mismo
aspecto que hoy.** Es el cambio de arquitectura con más alcance de todo el plan:
`[slug].astro:16` deja de usar `<Content />` y construye las secciones desde
`ingredients`, `steps`, `utensils` y `notes`.

El cuerpo del `.md` **se sigue generando** en `markdown.py`, pero ya no lo
consume nadie: existe para que el repo de recetas se lea bien en GitHub, que es
media gracia del proyecto. Al generarse siempre desde la estructura y no
editarse nunca a mano, no hay dos verdades: hay una verdad y una proyección que
nadie lee.

Pagefind sigue funcionando sin tocar nada: indexa el HTML renderizado, y el
texto sigue estando ahí dentro de `data-pagefind-body`.

**0.5 — `image` se mantiene.** Opcional, con el helper `image()` de Astro.
Siguiente tarea después de esta.

**0.6 — La migración de las 10 recetas la lanza Pablo.** Se deja el script
preparado y revisado, pero no se ejecuta.

---

## 1. Formato

Bloquea absolutamente todo lo demás.

- [x] **1.1** Escribir el schema Zod nuevo en `src/content/config.ts`. Sustituye
      al actual entero. Campos según §3 de la especificación, menos
      `scalable_time` y `draft`, más `description` (los ejemplos lo traen y hoy
      esa frase vive en el cuerpo) e `image`.
- [x] **1.2** `superRefine` que valide que **cada id de `uses` existe** en
      `ingredients`. Debe reventar el build con el slug de la receta y el id
      huérfano en el mensaje. Es la red que sostiene todo lo demás: sin ella,
      un `uses` mal escrito se convierte en un hueco silencioso en el modo
      cocina.
- [x] **1.3** Validar también que los `id` de ingrediente **no se repiten**
      dentro de una receta, y que los `id` de paso tampoco. La spec no lo pide,
      pero `uses` resuelve por id y un duplicado da el ingrediente equivocado.
- [ ] **1.4** Script de migración de los 10 `.md` viejos, en el back, de un solo
      uso. Lee el `.md` actual, llama a Claude con `output_format` y escribe el
      `.md` nuevo. **No se ejecuta**: se entrega para que lo lance Pablo (0.6).
- [ ] **1.5** Repasar a mano los `uses` de las 10 recetas migradas. Es lo único
      que el modelo no puede acertar por construcción: relaciona prosa con ids.
      Con el `superRefine` de 1.2, los huérfanos salen solos en el build; los
      que faltan por omisión, no.

> **Orden real:** 1.4 y 1.5 van antes de mergear 1.1, o el build falla con las
> 10 recetas en formato viejo. Alternativa si molesta: unión discriminada por
> `schema_version` durante la transición. Preferible evitarla — es código que
> nace para borrarse.

> **Trampa del caché de Astro.** El content store (`.astro/`) guarda las
> recetas ya parseadas y solo las revalida cuando cambia el fichero de la
> receta o **`src/content/config.ts`**. Como la forma vive en
> `recipe-schema.ts`, tocarla no invalida nada: `astro dev` sigue sirviendo
> datos parseados con el schema viejo, y aparecen campos `undefined` que en
> `astro build` funcionan. Reiniciar dev no basta.
>
> Si tocas el schema y el resultado no cuadra: `rm -rf .astro`.
>
> Es el precio de tener el schema fuera de Astro, y compensa: `npm run validar`
> comprueba una receta en un segundo, sin build. Pero conviene saberlo antes de
> perder media hora persiguiendo un fantasma.

---

## 2. Back

Depende de §1. El orden importa: **migrar los `.md` → cambiar el modelo →
importar**. Al revés, la BD se llena con el modelo viejo y hay que vaciarla.
No hay herramienta de migraciones.

- [ ] **2.1** `src/recipes/models.py`: `ingredients`, `steps`, `utensils` y
      `notes` como `JSON`. `total_time` y `active_time` a `Integer` (segundos).
      Fuera `shopping_list`. Nuevo `description`.
- [ ] **2.2** `src/recipes/schemas.py`: los tres schemas (`RecipeBase`,
      `RecipeUpdate`, `RecipeListItem`) en paralelo. `RecipeListItem` pasa a
      llevar `active_time`, que es por lo que filtra la portada (0.2).
- [ ] **2.3** `CONTENT_FIELDS` en `src/recipes/service.py:14`: fuera
      `shopping_list`, dentro los campos nuevos. Si se olvida, editar los pasos
      de una receta publicada **no la devuelve a `draft`** y el `.md` de GitHub
      se queda viejo sin avisar.
- [ ] **2.4** `src/recipes/markdown.py`: `render_frontmatter` emite la
      estructura nueva — YAML anidado de verdad, no solo listas planas. Los
      ingredientes en flow style (`{id: agua, amount: 2, ...}`) como los
      ejemplos, para que el fichero siga siendo legible.
- [ ] **2.5** `render_document` pasa a **generar el cuerpo** desde la estructura
      (0.4), en vez de volcar `recipe.body`. Mismas secciones que hoy:
      Ingredientes / Utensilios / Reposo / Preparación previa / Elaboración /
      Emplatado / Notas.
- [ ] **2.6** `src/generation/schemas.py`: `GeneratedRecipe` produce la
      estructura nueva. Ya está a medio camino (`ingredient_groups`, `utensils`,
      `steps`, `notes`); lo que falta son los `id`, el `type`, el `timer` y el
      `uses`.
- [ ] **2.7** `src/generation/prompts.py` y el skill `recipe-generator`: enseñar
      al modelo a asignar ids estables, clasificar cada paso en
      `prep`/`rest`/`cook`/`plate` y poner `timer` en segundos.
- [ ] **2.7b** Regla editorial para los pasos `prep`: **una línea, y solo si
      dicen algo que `prep` no puede decir.** Hoy el `p1` del ramen es la
      concatenación literal del `prep` de sus cuatro ingredientes («cortadas
      por la mitad», «en trozos grandes»…): 169 caracteres para repetir un
      dato que ya está. El porqué del corte («así se dorarán en vez de
      vaporizarse») es color editorial y va a `notes`, no a la encimera.

      Con esa regla la mise en place se podría **derivar de los ingredientes
      que llevan `prep`**, y los pasos `prep` quedarían solo para técnica de
      verdad (prensar el tofu). Merece la pena valorarlo al tocar el
      generador; no antes, porque cambia el significado del schema.
- [ ] **2.8** Tests de renderizado del markdown. Lo pide el CLAUDE.md del back
      para cualquier cambio aquí, y este los cambia todos.

---

## 3. Front — vista de lectura

Depende de §1. **El resultado visual debe ser indistinguible del actual.**

- [x] **3.1** `[slug].astro`: quitar `<Content />` (línea 147) y pintar las
      secciones desde el frontmatter, reusando el CSS que ya está.
- [x] **3.2** La lista de la compra (`[slug].astro:26`) se deriva de
      `ingredients` en lugar de `shopping_list`. **Cambia lo que se ve**: hoy es
      una lista corta de nombres a comprar; pasa a ser todos los ingredientes
      con su cantidad. El componente y la interacción de checklist no cambian.
      Es el único punto donde la promesa de «igual que ahora» se rompe a
      propósito.
- [x] **3.3** Utilidad `formatearDuracion(segundos)` → `"2 h 30 min"`, `"35 min"`,
      `"30 s"`. Los tiempos llegan como número y la ficha los muestra como texto
      (`[slug].astro:29-30`).
- [x] **3.4** Utilidad `formatearCantidad(amount, amount_max, unit)`:
      fracciones (`0.5` → `½`, `1.5` → `1½`, `0.25` → `¼`, `0.75` → `¾`),
      rangos, y `amount: null` sin número (0.1). Pura y testeable.
- [x] **3.5** `RecipeFilters.astro`: **borrar `parseTime`** (línea ~483) y
      comparar números. El parser frágil desaparece con el cambio de formato.
      El filtro pasa a mirar `active_time` (0.2).
- [x] **3.6** `RecipeCard.astro`: `totalTime: string` → `number`, y formatear
      con 3.3.
- [x] **3.7** Sección de **utensilios** en la vista de lectura. Es un campo
      nuevo que hoy no se pinta en ningún sitio.

---

## 4. Modo cocina

Aquí empieza la feature de verdad. Todo lo anterior es la condición para poder
escribirla.

- [x] **4.1** Ruta `/recipes/[slug]/cook` e isla `client:load`, con los datos
      como props desde la content collection. Sin `fetch` en runtime.
- [x] **4.2** Botón de entrada desde la vista de receta y salida de vuelta.
- [x] **4.3** Pantalla de **resumen** (§5.1): avisos de reposo arriba,
      descripción, número de pasos y botón Empezar. Sin selector de raciones
      (0.1) y **sin lista de ingredientes ni de utensilios**, que la §5.1 sí
      pide. Se quitan a propósito: a esta pantalla se llega desde la receta,
      donde acabas de leer las dos y de repasar la lista de la compra.
      Repetirlas convertía el arranque en algo que había que desplazar antes
      de poder empezar. Lo que hace falta mientras cocinas —qué lleva este
      paso— viaja con cada paso.
- [x] **4.4** Pantalla de **mise en place** (§5.2): todos los pasos `prep`
      juntos con checkbox. **Se omite entera** si no hay pasos `prep`.
- [x] **4.5** Pantalla de **ejecución** (§5.3), una por paso: posición, título,
      ingredientes del paso, contenido con negritas renderizadas, navegación
      con zonas táctiles grandes en la mitad inferior.
- [x] **4.6** Pantalla **final** (§5.5).
- [x] **4.7** Wake Lock (§7): `try/catch`, liberar al salir y **re-adquirir en
      `visibilitychange`** — iOS lo suelta al cambiar de app y no lo devuelve.
- [x] **4.8** Timers: estado como `endsAt` absoluto, **un solo `setInterval`**
      para todos. Nunca decrementar un contador.
- [x] **4.9** Barra de timers activos persistente (§5.4). **Varios
      simultáneos.** Pulsar un timer navega a su paso.
- [x] **4.10** Fin de timer: sonido con asset local, `navigator.vibrate`, estado
      visual hasta descartar. Sin modal bloqueante.
- [x] **4.11** Recálculo contra `Date.now()` en `visibilitychange`: los timers
      vencidos mientras la pestaña dormía se marcan terminados al volver.
- [x] **4.12** Escape hatch a Atajos de iOS para timers largos (§7.3), acción
      secundaria. Es lo que cubre los reposos de 0.2.
- [x] **4.13** Pulido táctil: 44×44 px mínimo, contraste, tipografía grande,
      sin scroll para las acciones principales, `prefers-reduced-motion`.
- [x] **4.14** Swipe entre pasos, **siempre con botones como alternativa**.

### Casos límite a verificar (§9, ya sin los de escalado)

| # | Caso | Receta |
| :-- | :-- | :-- |
| 1 | Sin pasos `rest` | salteado |
| 2 | Sin pasos `prep` | — |
| 3 | `group: null` frente a tres grupos | salteado / ramen |
| 4 | **Timers solapados** (horno 35 min mientras tare, tofu y pak choi) | ramen |
| 5 | Timers encadenados sobre la misma sartén | salteado |
| 6 | Timer de **30 s** | ramen (`c5`) |
| 9 | Seis ingredientes con `amount: null` | ramen |
| 10 | Paso **sin `timer`** | ramen (`c6`) |
| 11 | `uses` con ingredientes de **tres grupos** | ramen (`pl1`) |
| 12 | Salir del modo cocina y volver | ambas |

---

## 5. Admin

Es el trozo más grande y el más fácil de subestimar: hoy son diez inputs de
texto plano y pasa a haber que editar un árbol de grupos, ingredientes y pasos
con ids.

- [ ] **5.1** Decidir editor estructurado vs. **`<textarea>` con el YAML en
      crudo y validación**. Recomendación: el textarea. Construir un editor de
      árbol para un recetario de una persona es desproporcionado, y el YAML ya
      es legible.
- [ ] **5.2** Implementarlo en `admin.astro`.
- [ ] **5.3** Preview que muestre los errores de validación del `superRefine`
      (1.2) **antes** de publicar, no después de que falle el build.

---

## Orden de ejecución

```
1.1–1.3  schema        ─┐
1.4–1.5  migración     ─┴─> 2 (back)  ─> 3 (lectura) ─> 4 (modo cocina) ─> 5 (admin)
```

Los timers (4.8–4.12) son lo más vistoso y van casi al final a propósito: si el
esquema tiene un problema de fondo, aparece en §1–§3, y descubrirlo con los
timers escritos significa tirar trabajo.
