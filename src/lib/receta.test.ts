import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  contenidoAHtml,
  formatearCantidad,
  formatearDuracion,
  formatearNumero,
  textoIngrediente,
  type Ingrediente,
} from './receta.ts';

/** Los casos salen de las dos recetas de referencia, no de la imaginación. */
const ing = (parcial: Partial<Ingrediente>): Ingrediente => ({
  id: 'x',
  amount: null,
  name: 'cosa',
  ...parcial,
});

describe('formatearDuracion', () => {
  it('baja a segundos: escaldar el pak choi son 30 s', () => {
    assert.equal(formatearDuracion(30), '30 s');
  });

  it('minutos redondos', () => {
    assert.equal(formatearDuracion(1500), '25 min');
    assert.equal(formatearDuracion(2100), '35 min');
    assert.equal(formatearDuracion(360), '6 min');
  });

  it('minutos con resto', () => {
    assert.equal(formatearDuracion(90), '1 min 30 s');
  });

  it('horas', () => {
    assert.equal(formatearDuracion(3600), '1 h');
    assert.equal(formatearDuracion(9000), '2 h 30 min');
  });

  it('fermentaciones largas', () => {
    assert.equal(formatearDuracion(86400), '24 h');
    assert.equal(formatearDuracion(93600), '26 h');
  });

  it('no produce «1 h 60 min» al redondear', () => {
    assert.equal(formatearDuracion(7199), '2 h');
  });

  it('devuelve cadena vacía si no hay duración', () => {
    assert.equal(formatearDuracion(0), '');
  });
});

describe('formatearNumero', () => {
  it('fracciones comunes', () => {
    assert.equal(formatearNumero(0.5), '½');
    assert.equal(formatearNumero(0.25), '¼');
    assert.equal(formatearNumero(0.75), '¾');
    assert.equal(formatearNumero(1 / 3), '⅓');
  });

  it('entero más fracción', () => {
    assert.equal(formatearNumero(1.5), '1½');
  });

  it('enteros tal cual', () => {
    assert.equal(formatearNumero(9), '9');
    assert.equal(formatearNumero(150), '150');
  });

  it('decimal sin fracción limpia, con coma', () => {
    assert.equal(formatearNumero(2.7), '2,7');
  });
});

describe('formatearCantidad', () => {
  it('«al gusto» no lleva número', () => {
    assert.equal(formatearCantidad(ing({ amount: null })), '');
  });

  it('unidad de peso', () => {
    assert.equal(formatearCantidad(ing({ amount: 150, unit: 'g' })), '150 g');
  });

  it('unidad contable: sin unidad', () => {
    assert.equal(formatearCantidad(ing({ amount: 9, unit: null })), '9');
  });

  it('pluraliza las cucharadas y no los gramos', () => {
    assert.equal(formatearCantidad(ing({ amount: 2, unit: 'cucharada' })), '2 cucharadas');
    assert.equal(formatearCantidad(ing({ amount: 1, unit: 'cucharada' })), '1 cucharada');
    assert.equal(formatearCantidad(ing({ amount: 2, unit: 'g' })), '2 g');
  });

  it('rango: el plural lo manda el extremo alto', () => {
    assert.equal(
      formatearCantidad(ing({ amount: 1, amount_max: 2, unit: 'cucharadita' })),
      '1-2 cucharaditas',
    );
  });
});

describe('textoIngrediente', () => {
  it('lleva «de» solo cuando hay unidad', () => {
    assert.equal(
      textoIngrediente(ing({ amount: 150, unit: 'g', name: 'pechuga de pollo', prep: 'en dados' })),
      '150 g de pechuga de pollo, en dados',
    );
    assert.equal(
      textoIngrediente(ing({ amount: 2, unit: null, name: 'dientes de ajo', prep: 'laminados finos' })),
      '2 dientes de ajo, laminados finos',
    );
  });

  it('media unidad contable', () => {
    assert.equal(
      textoIngrediente(ing({ amount: 0.5, unit: null, name: 'pimiento rojo o verde' })),
      '½ pimiento rojo o verde',
    );
  });

  it('sin cantidad, el nombre en mayúscula y sin NaN a la vista', () => {
    const texto = textoIngrediente(ing({ amount: null, name: 'aceite de oliva' }));
    assert.equal(texto, 'Aceite de oliva');
    assert.ok(!texto.includes('NaN') && !texto.includes('null'));
  });

  it('nota entre paréntesis', () => {
    assert.equal(
      textoIngrediente(ing({ amount: 9, unit: null, name: 'tomates cherry', note: 'un puñado, 8-10' })),
      '9 tomates cherry (un puñado, 8-10)',
    );
  });

  it('opcional al final', () => {
    assert.equal(
      textoIngrediente(
        ing({ amount: 0.5, unit: null, name: 'limón', note: 'solo el zumo', optional: true }),
      ),
      '½ limón (solo el zumo) — opcional',
    );
  });
});

describe('contenidoAHtml', () => {
  it('un párrafo por bloque, negritas incluidas', () => {
    assert.equal(
      contenidoAHtml('Saltear 2-3 minutos.\n\n**No te lo saltes.**'),
      '<p>Saltear 2-3 minutos.</p>\n<p><strong>No te lo saltes.</strong></p>',
    );
  });

  it('los saltos sueltos no parten el párrafo', () => {
    assert.equal(contenidoAHtml('Láminas finas.\ny a fuego medio.'), '<p>Láminas finas. y a fuego medio.</p>');
  });

  it('escapa el HTML antes de meter negritas', () => {
    assert.equal(contenidoAHtml('Calentar a <200 °C>'), '<p>Calentar a &lt;200 °C&gt;</p>');
  });
});
