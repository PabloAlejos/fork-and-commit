/**
 * Utilidades de presentación de una receta.
 *
 * Puras y sin DOM a propósito: son las que traducen los datos crudos del
 * frontmatter a lo que se lee en pantalla, y las comparten la vista de lectura
 * y el modo cocina. Es también donde se esconden los bugs sutiles —el redondeo,
 * los plurales, las fracciones—, así que conviene tenerlas juntas y a mano.
 */

export type Unidad = 'g' | 'kg' | 'ml' | 'l' | 'cucharada' | 'cucharadita';

export interface Ingrediente {
  id: string;
  amount: number | null;
  amount_max?: number;
  unit?: Unidad | null;
  name: string;
  prep?: string;
  note?: string;
  optional?: boolean;
}

export interface GrupoIngredientes {
  group: string | null;
  items: Ingrediente[];
}

export type TipoPaso = 'prep' | 'rest' | 'cook' | 'plate';

export interface Paso {
  id: string;
  type: TipoPaso;
  title: string;
  timer?: number;
  uses: string[];
  content: string;
}

/**
 * Segundos a texto legible: `1500` → `"25 min"`, `9000` → `"2 h 30 min"`,
 * `30` → `"30 s"`.
 *
 * Baja hasta los segundos porque los hay de verdad: escaldar el pak choi son
 * 30 s, y «0 min» o «0,5 min» no le sirven a nadie.
 */
export function formatearDuracion(segundos: number): string {
  if (!Number.isFinite(segundos) || segundos <= 0) return '';

  if (segundos < 60) return `${Math.round(segundos)} s`;

  if (segundos < 3600) {
    const minutos = Math.floor(segundos / 60);
    const resto = Math.round(segundos % 60);
    return resto > 0 ? `${minutos} min ${resto} s` : `${minutos} min`;
  }

  let horas = Math.floor(segundos / 3600);
  let minutos = Math.round((segundos % 3600) / 60);

  // 7199 s redondea a 60 min y saldría «1 h 60 min».
  if (minutos === 60) {
    horas += 1;
    minutos = 0;
  }

  return minutos > 0 ? `${horas} h ${minutos} min` : `${horas} h`;
}

const FRACCIONES: [number, string][] = [
  [0.25, '¼'],
  [1 / 3, '⅓'],
  [0.5, '½'],
  [2 / 3, '⅔'],
  [0.75, '¾'],
];

/**
 * `0.5` → `"½"`, `1.5` → `"1½"`, `2` → `"2"`, `2.7` → `"2,7"`.
 *
 * Las fracciones no son un adorno: las recetas ya vienen escritas con ellas
 * («½ pimiento», «½ cucharadita de comino»), y un «0.5 pimiento» en la
 * encimera se lee peor que el original.
 */
export function formatearNumero(valor: number): string {
  const entero = Math.floor(valor);
  const decimal = valor - entero;

  const fraccion = FRACCIONES.find(([v]) => Math.abs(decimal - v) < 0.02);
  if (fraccion) {
    return entero > 0 ? `${entero}${fraccion[1]}` : fraccion[1];
  }

  // Sin fracción limpia: un decimal como mucho, y coma, que es lo que se
  // escribe en español.
  return (Math.round(valor * 10) / 10).toString().replace('.', ',');
}

/** Las de peso y volumen nunca pluralizan; las de cuchara, sí. */
function pluralizarUnidad(unidad: Unidad, cantidad: number): string {
  if (unidad === 'cucharada' || unidad === 'cucharadita') {
    return cantidad > 1 ? `${unidad}s` : unidad;
  }
  return unidad;
}

function mayuscula(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/**
 * La cantidad sola: `"150 g"`, `"½"`, `"1-2 cucharaditas"`, `""`.
 *
 * Cadena vacía cuando `amount` es `null`, que es «al gusto» —sal, aceite,
 * Tajín por encima— y no lleva número.
 */
export function formatearCantidad(ingrediente: Ingrediente): string {
  const { amount, amount_max, unit } = ingrediente;

  if (amount === null || amount === undefined) return '';

  const numero =
    amount_max !== undefined
      ? `${formatearNumero(amount)}-${formatearNumero(amount_max)}`
      : formatearNumero(amount);

  if (!unit) return numero;

  // El plural lo manda el extremo alto: «1-2 cucharaditas», no «1-2 cucharadita».
  return `${numero} ${pluralizarUnidad(unit, amount_max ?? amount)}`;
}

/**
 * La línea completa tal y como se lee en la lista:
 * `"150 g de pechuga de pollo, en dados"`, `"½ pimiento rojo o verde"`,
 * `"Aceite de oliva"`, `"½ limón (solo el zumo) — opcional"`.
 *
 * El «de» solo aparece cuando hay unidad: «150 g **de** pechuga» pero «2
 * dientes de ajo», porque ahí el «de» ya viene dentro del nombre.
 */
export function textoIngrediente(ingrediente: Ingrediente): string {
  const cantidad = formatearCantidad(ingrediente);

  let texto = cantidad
    ? `${cantidad}${ingrediente.unit ? ' de' : ''} ${ingrediente.name}`
    : mayuscula(ingrediente.name);

  if (ingrediente.prep) texto += `, ${ingrediente.prep}`;
  if (ingrediente.note) texto += ` (${ingrediente.note})`;
  if (ingrediente.optional) texto += ' — opcional';

  return texto;
}

/** Índice `id → ingrediente`, para resolver los `uses` de los pasos. */
export function indexarIngredientes(grupos: GrupoIngredientes[]): Map<string, Ingrediente> {
  const indice = new Map<string, Ingrediente>();
  for (const grupo of grupos) {
    for (const item of grupo.items) indice.set(item.id, item);
  }
  return indice;
}

/**
 * Los ingredientes que toca un paso, en el orden en que los declara `uses`.
 *
 * Los ids huérfanos se ignoran aquí porque el schema ya los caza en build: si
 * uno llega hasta esta función, el despliegue no debería haber ocurrido.
 */
export function ingredientesDelPaso(
  paso: Paso,
  indice: Map<string, Ingrediente>,
): Ingrediente[] {
  return paso.uses.map((id) => indice.get(id)).filter((i): i is Ingrediente => i !== undefined);
}

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * El `content` de un paso a HTML.
 *
 * Solo negritas y saltos de párrafo, que es a lo que se compromete el schema.
 * No se usa un renderizador de markdown entero porque no hace falta y porque
 * meter uno significa decidir qué más se permite; aquí el contrato es
 * deliberadamente pequeño.
 *
 * Se escapa antes de sustituir: el texto lo escribe un modelo de lenguaje, y
 * un `<` suelto no debería poder inventarse una etiqueta.
 */
export function contenidoAHtml(contenido: string): string {
  const escapado = contenido.replace(/[&<>"']/g, (c) => ESCAPES[c]);

  return escapado
    .trim()
    .split(/\n\s*\n/)
    .map((parrafo) => {
      const conNegritas = parrafo
        .replace(/\*\*(.+?)\*\*/gs, '<strong>$1</strong>')
        .replace(/\n/g, ' ');
      return `<p>${conNegritas}</p>`;
    })
    .join('\n');
}

/** Los pasos de un tipo, en el orden del fichero. */
export function pasosDeTipo(pasos: Paso[], tipo: TipoPaso): Paso[] {
  return pasos.filter((paso) => paso.type === tipo);
}

/**
 * Un reposo largo no se acompaña con un temporizador de JavaScript: la pestaña
 * se duerme mucho antes. A partir de dos horas se muestra la duración y se
 * ofrece el atajo nativo, pero no se promete una alarma que no va a sonar.
 */
export const LIMITE_TEMPORIZADOR = 2 * 3600;
