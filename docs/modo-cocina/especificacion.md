# Especificación: Modo Cocina (Fork & Commit)

**Versión:** 1
**Consume:** recetas con `schema_version: 1`
**Contexto:** sitio estático Astro, desplegado en GitHub Pages
**Dispositivo objetivo:** iPhone en la encimera, en vertical, con las manos sucias

---

## 1. Objetivo

Convertir una receta en una interfaz de ejecución paso a paso, usable mientras se
cocina. No es una vista de lectura: es una herramienta que se maneja con un dedo,
a medio metro de distancia, con la pantalla encendida y posiblemente con
temporizadores corriendo.

La vista normal de la receta (lectura, ingredientes, notas) ya existe y **no es
parte de esta especificación**. El modo cocina se entra desde ella con un botón y
se sale con otro.

---

## 2. Restricciones de arquitectura

- **Todo ocurre en el cliente.** El sitio es estático; no hay backend, no hay
  sesión, no hay persistencia en servidor. Ningún requisito puede depender de una
  llamada de red en tiempo de cocinado.
- **Isla hidratada.** Astro renderiza la página en build time y monta el
  componente del modo cocina con `client:load`. Los datos llegan como props desde
  el frontmatter ya parseado por content collections, no se hacen fetch.
- **Debe funcionar sin conexión** una vez cargada la página. No introducir
  dependencias que requieran red en runtime (fuentes remotas, APIs, CDNs de
  datos).

---

## 3. Contrato de datos

El componente recibe el objeto de receta parseado del frontmatter. Estructura
relevante:

```ts
type Unit = 'g' | 'kg' | 'ml' | 'l' | 'cucharada' | 'cucharadita' | null;

interface Ingredient {
  id: string;
  amount: number | null;      // null = "al gusto", NO escalable
  amount_max?: number;         // rango: "1-2 cucharaditas"
  unit?: Unit;
  name: string;
  prep?: string;
  note?: string;
  optional?: boolean;
}

interface IngredientGroup {
  group: string | null;        // null = lista plana, sin cabecera
  items: Ingredient[];
}

type StepType = 'prep' | 'rest' | 'cook' | 'plate';

interface Step {
  id: string;
  type: StepType;
  title: string;
  timer?: number;              // SEGUNDOS
  scalable_time?: boolean;     // por defecto false: los tiempos NO escalan
  uses?: string[];             // ids de Ingredient
  content: string;             // markdown inline (negritas, saltos de párrafo)
}

interface Recipe {
  schema_version: 1;
  title: string;
  servings: number;            // raciones base del fichero
  total_time: number;          // segundos
  active_time: number;
  utensils?: string[];
  ingredients: IngredientGroup[];
  steps: Step[];               // el orden del array ES el orden de ejecución
  notes?: { title: string; content: string }[];
}
```

**Validar en build, no en runtime.** Definir un schema de Zod en la content
collection de Astro. Si una receta tiene un `id` en `uses` que no existe en
`ingredients`, el build debe fallar con un mensaje claro. Nunca degradar en
silencio en el cliente.

---

## 4. Modelo de estado

```ts
interface CookState {
  currentIndex: number;              // índice en el array steps
  servings: number;                  // raciones actuales (escalado)
  timers: ActiveTimer[];             // VARIOS simultáneos, no uno
  wakeLockActive: boolean;
  completed: Set<string>;            // ids de pasos marcados como hechos
}

interface ActiveTimer {
  stepId: string;
  label: string;                     // title del paso
  endsAt: number;                    // timestamp absoluto (Date.now() + ms)
  duration: number;                  // segundos originales, para el progreso
  status: 'running' | 'finished' | 'dismissed';
}
```

**Requisito crítico sobre los timers:** el estado es `endsAt`, un timestamp
absoluto. El tiempo restante se **calcula** en cada tick como `endsAt -
Date.now()`. Nunca decrementar un contador: si iOS suspende la pestaña, un
contador pierde tiempo y un timestamp no.

Un único `setInterval` de 1 segundo recalcula todos los timers activos. No un
interval por timer.

---

## 5. Pantallas

### 5.1 Entrada — Resumen previo

Primera pantalla al entrar en modo cocina. Su función es que decidas si puedes
empezar ahora.

Contenido:
1. **Avisos de reposo**, destacados arriba: si hay pasos `type: rest`, mostrarlos
   con su duración de forma prominente ("Requiere 1 h de infusión en frío — o
   toda la noche"). Es la información que cambia cuándo empiezas a cocinar.
2. **Selector de raciones** (ver §6).
3. **Lista completa de ingredientes** con las cantidades ya escaladas, agrupada
   según `ingredients`.
4. **Utensilios**, si los hay.
5. Botón grande: **Empezar**.

### 5.2 Mise en place — pasos `prep`

Los pasos `type: prep` se muestran **todos juntos en una sola pantalla**, como
lista con checkbox. No uno a uno: cuando estás cortando, quieres ver todo lo que
hay que cortar.

Cada entrada: título, contenido, y los ingredientes de `uses` con cantidad
escalada.

Si la receta no tiene pasos `prep`, **esta pantalla se omite por completo**. No
mostrar una sección vacía.

### 5.3 Ejecución — pasos `rest`, `cook`, `plate`

Una pantalla por paso. Es la vista principal.

Contenido, por orden de importancia visual:

1. **Indicador de posición** — "Paso 3 de 7". Discreto pero presente.
2. **Título del paso**, grande.
3. **Ingredientes de este paso** — derivados de `uses`, con cantidad escalada.
   En un bloque visualmente separado del texto. Si `uses` está vacío o ausente,
   se omite el bloque.
4. **Contenido**, con las negritas renderizadas. Tipografía grande: se lee de
   pie, a distancia de brazo.
5. **Botón de temporizador**, si el paso tiene `timer`. Muestra la duración
   formateada ("35 min"). Al pulsarlo arranca el timer y el botón pasa a estado
   activo.
6. **Navegación**: anterior / siguiente. Zonas táctiles grandes, en la mitad
   inferior de la pantalla — es donde llega el pulgar.

### 5.4 Barra de temporizadores activos

**Persistente en todas las pantallas** mientras haya algún timer corriendo. Fija
arriba o abajo, siempre visible.

Muestra, por cada timer activo: etiqueta del paso, tiempo restante, y acción de
cancelar. Al pulsar un timer, navegar al paso que lo originó.

Este es el requisito que más condiciona el diseño y el que se hace mal por
defecto. Ver §7.

### 5.5 Final

Tras el último paso: pantalla de cierre con un mensaje breve y opción de volver a
la receta. Cancelar los timers pendientes o preguntar si dejarlos correr.

---

## 6. Escalado de raciones

Control en la pantalla de resumen y accesible durante la ejecución.

Reglas:

- **Factor** = `servings actuales / recipe.servings`.
- Se aplica a `amount` y a `amount_max`.
- **`amount: null` no se toca nunca.** Se muestra tal cual ("Sal", "Aceite de
  oliva"). Es el caso más frecuente después de las cantidades normales.
- **Los tiempos NO escalan.** `timer` se ignora en el escalado salvo que el paso
  tenga `scalable_time: true` explícito. Por defecto, no.
- El escalado afecta a lo que se muestra, no a los datos: no mutar el objeto de
  receta.

### Formateo de cantidades

Es donde se ve si está bien hecho:

- Decimales que son fracciones comunes se muestran como fracción: `0.5` → `½`,
  `1.5` → `1½`, `0.25` → `¼`, `0.75` → `¾`, `0.33` → `⅓`.
- Decimales sin fracción limpia: redondear a 1 decimal y quitar el `.0`.
- Gramos y mililitros: redondear a entero por encima de 10; a 0.5 por debajo.
- Unidades contables (`unit: null`): redondear a entero si el resultado está
  cerca de uno. `2.7 dientes de ajo` es peor que `3 dientes de ajo`.
- Rangos: escalar ambos extremos → `1-2 cucharaditas` a 2× → `2-4 cucharaditas`.

---

## 7. Temporizadores

### Requisitos funcionales

- **Múltiples timers simultáneos.** No asumir uno solo. Ver caso real en §9.
- Avanzar de paso **no cancela** el timer del paso anterior. Sigue corriendo y
  visible en la barra.
- Al terminar un timer: aviso sonoro + vibración (`navigator.vibrate`) + estado
  visual destacado hasta que se descarte. El sonido debe ser un asset local
  (Web Audio API o `<audio>` con fichero en el bundle), no una API externa.
- Cancelar y reiniciar un timer individual.

### Limitaciones a asumir explícitamente

**Con la pestaña en segundo plano o el móvil bloqueado, el JavaScript se congela
y el timer no sonará a su hora.** Esto no se arregla en el cliente: es una
restricción de iOS. Sin backend no hay Web Push.

Mitigaciones que sí forman parte del alcance:

1. **Wake Lock API** — `navigator.wakeLock.request('screen')` al entrar en modo
   cocina. Mantiene la pantalla encendida y por tanto el JS vivo. Es lo que hace
   que los timers funcionen en la práctica.
   - Liberar al salir del modo cocina.
   - **Re-adquirir en el evento `visibilitychange`**: iOS libera el lock al
     cambiar de app y no lo devuelve solo.
   - Envolver en try/catch: no está disponible en todos los navegadores, y su
     ausencia no debe romper nada.
2. **Recálculo al volver al foreground** — en `visibilitychange`, recalcular
   todos los timers contra `Date.now()`. Los que hayan vencido mientras la
   pestaña estaba dormida se marcan como terminados y se avisa al volver.
3. **Escape hatch a Atajos de iOS** *(opcional, valorar)* — un enlace
   `shortcuts://x-callback-url/run-shortcut?name=Temporizador&input=NN` lanza un
   temporizador **nativo** del sistema, fiable con la app cerrada. Útil para
   esperas largas (el reposo de 1 hora del ramen). Requiere que el usuario haya
   creado el Atajo. Ofrecerlo como acción secundaria en timers largos, nunca como
   único mecanismo.

---

## 8. Requisitos de interfaz

- **Vertical, una columna.** No hay caso de uso en horizontal.
- **Zonas táctiles mínimas de 44×44 px.** Se pulsa con el dedo, no con precisión.
- **Contraste alto y tipografía grande.** La pantalla se mira desde lejos y con
  las manos ocupadas.
- **Navegación por gestos opcional** (swipe entre pasos), siempre con botones
  como alternativa. El swipe no puede ser el único modo.
- **Sin scroll para las acciones principales.** El botón de siguiente y el de
  timer deben estar visibles sin desplazar.
- **Sin modales que bloqueen.** Un aviso de timer no debe impedir seguir cocinando.
- Respetar `prefers-reduced-motion`.

---

## 9. Casos límite verificables

Estos casos salen de las dos recetas de referencia y son la prueba real de que la
implementación es correcta:

| # | Caso | Qué falla si no se contempla |
|---|---|---|
| 1 | Receta **sin pasos `rest`** (salteado) | Se renderiza una sección de reposo vacía. Iterar sobre los tipos presentes, no sobre los cuatro. |
| 2 | Receta **sin pasos `prep`** | Pantalla de mise en place en blanco. |
| 3 | `group: null` (salteado) frente a **tres grupos** (ramen) | Cabecera de grupo vacía o ingredientes sin agrupar. |
| 4 | **Timers solapados**: en el ramen, el horno de 35 min corre mientras se prepara el tare, se dora el tofu y se escalda el pak choi | Con un solo timer activo, el del horno se pierde. Es el caso que rompe el diseño ingenuo. |
| 5 | **Timers encadenados**: en el salteado, cuatro pasos `cook` consecutivos con timer sobre la misma sartén | La barra se llena de timers acumulados si no se descartan al avanzar habiendo terminado. |
| 6 | Timer de **30 segundos** (escaldar pak choi) | UI pensada solo para minutos; el formateo debe bajar a segundos. |
| 7 | Escalar el salteado de **1 a 3 raciones** | `1.5 pimientos` y `1.5 cucharaditas` sin formateo de fracciones. |
| 8 | `9 tomates cherry` escalados a 3× | `27 tomates cherry`. Numéricamente correcto, prácticamente absurdo. Aceptable en v1, pero la `note` ("un puñado, 8-10") debe seguir visible para dar contexto. |
| 9 | Seis ingredientes con `amount: null` en el ramen | El escalador intenta multiplicar `null` y produce `NaN` o `0`. |
| 10 | Paso `c6` (cocer fideos) **sin `timer`** | Botón de temporizador roto o con `undefined`. |
| 11 | `uses` con ingredientes de **grupos distintos** (el emplatado del ramen usa ingredientes de los tres) | Resolución de `id` que asume un solo grupo. |
| 12 | Salir del modo cocina y volver a entrar | Estado y timers perdidos, o duplicados al remontar. |

---

## 10. Criterios de aceptación

1. Con `ramen-vegetariano-setas-miso-gochujang.md`: se puede recorrer la receta
   completa de principio a fin, el aviso de infusión en frío aparece en la
   pantalla de entrada, y los timers de asado (35 min), caldo (7 min), tofu
   (6 min) y pak choi (30 s) pueden estar activos simultáneamente y se muestran
   todos en la barra.
2. Con `salteado-pollo-garbanzos-tajin.md`: no aparece sección de reposo, los
   ingredientes se muestran sin cabecera de grupo, y escalar a 3 raciones produce
   `1½ pimiento` y `1½ cucharadita de comino`.
3. En ambas: los ingredientes con `amount: null` se muestran sin cantidad y no
   generan `NaN` a ninguna escala.
4. Con la pantalla encendida y la app en primer plano, un timer de 2 minutos
   suena con menos de 2 segundos de desviación.
5. Tras cambiar a otra app durante 30 segundos y volver, el tiempo restante es
   correcto (no se ha "congelado").
6. Toda la interacción principal es posible sin scroll y con una sola mano.

---

## 11. Fuera de alcance (v1)

- Notificaciones push con la app cerrada (requiere backend).
- Persistencia del progreso entre sesiones.
- Historial de cocinado, valoraciones, notas de la última vez.
- Variantes de receta (versión vegetariana, etc.) — viven en `notes` como texto.
- Escalado de tiempos de cocción.
- Modo de voz o control manos libres.
- Edición de la receta desde el modo cocina.

---

## 12. Orden de implementación sugerido

1. Schema de Zod en la content collection + validación de las dos recetas de
   referencia. **Antes de escribir UI.** Valida el formato y da tipos.
2. Utilidades puras: escalado, formateo de cantidades, formateo de duraciones.
   Testeables sin DOM, y son donde están los bugs sutiles.
3. Navegador de pasos, sin timers. Pantallas de resumen, mise en place y
   ejecución.
4. Wake Lock.
5. Timers, con la barra persistente y múltiples simultáneos.
6. Pulido táctil: tamaños, contraste, gestos.

Los timers son la parte más vistosa y la última: si el esquema tiene un problema
de fondo, aparece en los pasos 1-3, y descubrirlo con los timers ya escritos
significa tirar trabajo.
