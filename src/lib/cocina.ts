/**
 * Lógica del modo cocina que no necesita DOM.
 *
 * Vive aquí porque es la parte que falla en silencio: una cuenta atrás que
 * pinta mal a partir de la hora, o timers que se quedan pegados en la barra.
 * Dentro de un `<script>` de Astro no hay forma de probarla; fuera, sí.
 */

export interface TimerActivo {
  pasoId: string;
  etiqueta: string;
  /** Timestamp absoluto en ms. Nunca un contador que se decrementa. */
  finEn: number;
  duracion: number;
  pantalla: number;
  avisado: boolean;
}

/**
 * Cuenta atrás para leer de un vistazo: `"7:00"`, `"0:30"`, `"1:05:00"`.
 *
 * Distinta de `formatearDuracion`, que escribe para leer en prosa («7 min»).
 * Aquí manda el reloj, con los minutos y segundos siempre a dos cifras para
 * que las cifras no bailen al descontar.
 */
export function cuentaAtras(segundos: number): string {
  const s = Math.max(0, Math.round(segundos));
  const horas = Math.floor(s / 3600);
  const minutos = Math.floor((s % 3600) / 60);
  const resto = s % 60;

  const dosCifras = (n: number) => String(n).padStart(2, '0');

  return horas > 0
    ? `${horas}:${dosCifras(minutos)}:${dosCifras(resto)}`
    : `${minutos}:${dosCifras(resto)}`;
}

/**
 * Qué temporizadores sobran de la barra al plantarse en una pantalla.
 *
 * En el salteado hay cuatro pasos seguidos con temporizador sobre la misma
 * sartén: sin esto, la barra se llena de cuentas a cero de pasos que ya has
 * dejado atrás. Se van los que han terminado **y** quedan detrás de donde
 * estás; el del horno del ramen, que sigue corriendo, se queda aunque avances.
 */
export function timersACaducar(
  timers: Iterable<TimerActivo>,
  indiceActual: number,
  ahora: number,
): string[] {
  const fuera: string[] = [];

  for (const timer of timers) {
    if (timer.finEn <= ahora && timer.pantalla < indiceActual) {
      fuera.push(timer.pasoId);
    }
  }

  return fuera;
}

/**
 * El contador que ve quien cocina: «3 de 9».
 *
 * Ni el resumen ni la pantalla final cuentan como paso, así que el número no
 * puede salir del índice del array tal cual. Devuelve cadena vacía cuando no
 * estás en un paso.
 */
export function textoPosicion(indice: number, totalPantallas: number): string {
  const pasos = totalPantallas - 2;
  return indice >= 1 && indice <= pasos ? `${indice} de ${pasos}` : '';
}
