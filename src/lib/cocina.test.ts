import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { cuentaAtras, textoPosicion, timersACaducar, type TimerActivo } from './cocina.ts';

const timer = (parcial: Partial<TimerActivo>): TimerActivo => ({
  pasoId: 'x',
  etiqueta: 'paso',
  finEn: 0,
  duracion: 60,
  pantalla: 1,
  avisado: false,
  ...parcial,
});

describe('cuentaAtras', () => {
  it('minutos y segundos a dos cifras', () => {
    assert.equal(cuentaAtras(420), '7:00');
    assert.equal(cuentaAtras(65), '1:05');
    assert.equal(cuentaAtras(30), '0:30');
    assert.equal(cuentaAtras(9), '0:09');
  });

  it('pasa a horas cuando toca', () => {
    assert.equal(cuentaAtras(3600), '1:00:00');
    assert.equal(cuentaAtras(3905), '1:05:05');
  });

  it('no baja de cero ni enseña negativos', () => {
    assert.equal(cuentaAtras(0), '0:00');
    assert.equal(cuentaAtras(-12), '0:00');
  });
});

describe('timersACaducar', () => {
  const ahora = 1_000_000;

  it('quita el que terminó y quedó atrás', () => {
    const fuera = timersACaducar(
      [timer({ pasoId: 'c1', finEn: ahora - 5_000, pantalla: 2 })],
      4,
      ahora,
    );
    assert.deepEqual(fuera, ['c1']);
  });

  it('respeta el que sigue corriendo aunque avances — el horno del ramen', () => {
    const fuera = timersACaducar(
      [timer({ pasoId: 'c1', finEn: ahora + 600_000, pantalla: 2 })],
      6,
      ahora,
    );
    assert.deepEqual(fuera, []);
  });

  it('no quita el del paso en el que estás aunque haya terminado', () => {
    const fuera = timersACaducar(
      [timer({ pasoId: 'c2', finEn: ahora - 1_000, pantalla: 3 })],
      3,
      ahora,
    );
    assert.deepEqual(fuera, []);
  });

  it('los cuatro encadenados del salteado no se acumulan', () => {
    const encadenados = [1, 2, 3, 4].map(i =>
      timer({ pasoId: `c${i}`, finEn: ahora - 1_000, pantalla: i }),
    );
    assert.deepEqual(timersACaducar(encadenados, 5, ahora), ['c1', 'c2', 'c3', 'c4']);
  });
});

describe('textoPosicion', () => {
  // El ramen: 11 pantallas = resumen + preparación + 8 pasos + final.
  it('cuenta pasos, no pantallas', () => {
    assert.equal(textoPosicion(1, 11), '1 de 9');
    assert.equal(textoPosicion(9, 11), '9 de 9');
  });

  it('el resumen y el final no son pasos', () => {
    assert.equal(textoPosicion(0, 11), '');
    assert.equal(textoPosicion(10, 11), '');
  });
});
