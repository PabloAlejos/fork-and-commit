---
schema_version: 1
title: "Ramen Vegetariano de Setas con Tare de Miso y Gochujang"
description: "Ramen vegetariano de caldo oscuro y profundo, con verduras y setas muy asadas, tare de miso blanco y gochujang, y el umami del kombu y el shiitake deshidratado."
date: 2026-03-26
category: "Plato principal"
tags: [japonés, ramen, vegetariano, setas, picante, fermentación]
difficulty: "Media"
servings: 4
total_time: 9000
active_time: 3600
draft: false
utensils:
  - "Bandeja de horno"
  - "Olla a presión"
  - "Bol pequeño para el tare"
  - "Colador fino"

ingredients:
  - group: "Caldo"
    items:
      - {id: agua,        amount: 2,   unit: l,    name: "agua fría"}
      - {id: kombu,       amount: 15,  unit: g,    name: "kombu", note: "1-2 trozos"}
      - {id: shiitake_seco, amount: 20, unit: g,   name: "shiitake deshidratado"}
      - {id: cebolla,     amount: 2,   unit: null, name: "cebollas medianas", prep: "cortadas por la mitad"}
      - {id: puerro,      amount: 1,   unit: null, name: "puerro", prep: "en trozos grandes"}
      - {id: ajo,         amount: 1,   unit: null, name: "cabeza de ajo entera", prep: "cortada por la mitad horizontalmente"}
      - {id: zanahoria,   amount: 2,   unit: null, name: "zanahorias medianas", prep: "en trozos"}
      - {id: ostra,       amount: 150, unit: g,    name: "setas de ostra"}
      - {id: shiitake,    amount: 150, unit: g,    name: "shiitake fresco"}
      - {id: portobello,  amount: 200, unit: g,    name: "champiñón portobello", prep: "en trozos"}
      - {id: manzana,     amount: 1,   unit: null, name: "manzana pequeña", prep: "sin corazón y en cuartos"}
      - {id: aceite_asar, amount: null, name: "aceite de oliva", note: "para asar"}
      - {id: sal_caldo,   amount: null, name: "sal"}

  - group: "Tare de miso y gochujang"
    items:
      - {id: miso,        amount: 80,  unit: g,           name: "miso blanco (shiro)"}
      - {id: leche_avena, amount: 60,  unit: ml,          name: "leche de avena"}
      - {id: mirin,       amount: 2,   unit: cucharada,   name: "mirin"}
      - {id: sake,        amount: 1,   unit: cucharada,   name: "sake", note: "o mirin extra"}
      - {id: tamari,      amount: 1,   unit: cucharada,   name: "tamari o soja"}
      - {id: gochujang,   amount: 1,   amount_max: 2, unit: cucharadita, name: "gochujang", note: "según nivel de picante"}

  - group: "Para servir"
    items:
      - {id: fideos,      amount: 400, unit: g,    name: "fideos ramen", note: "o soba, udon"}
      - {id: tofu,        amount: 300, unit: g,    name: "tofu firme"}
      - {id: pak_choi,    amount: 2,   unit: null, name: "pak choi", prep: "en mitades"}
      - {id: nori,        amount: 4,   unit: null, name: "láminas de nori"}
      - {id: cebolleta,   amount: null, name: "cebolleta fresca", prep: "picada"}
      - {id: aceite_chili, amount: null, name: "aceite de chili", note: "al gusto"}
      - {id: sesamo,      amount: null, name: "sésamo tostado"}
      - {id: maiz,        amount: null, name: "maíz cocido", optional: true}

steps:
  - id: r1
    type: rest
    title: "Infusión en frío"
    timer: 3600
    uses: [kombu, shiitake_seco, agua]
    content: |
      Poner el kombu y el shiitake deshidratado en 500 ml del agua fría. Dejar
      reposar al menos 1 hora a temperatura ambiente, o toda la noche en nevera.

      **No tirar el agua de infusión — es concentrado puro de umami.**

  - id: p1
    type: prep
    title: "Cortar las verduras"
    uses: [cebolla, puerro, ajo, zanahoria]
    content: |
      Cebollas por la mitad, puerro en trozos grandes, cabeza de ajo cortada por
      la mitad en horizontal y zanahorias en trozos gruesos. No hace falta finura:
      todo va al horno.

  - id: p2
    type: prep
    title: "Preparar las setas y la manzana"
    uses: [ostra, shiitake, portobello, manzana]
    content: |
      Portobello en trozos grandes, setas de ostra y shiitake enteros o partidos
      según tamaño. Manzana sin corazón y en cuartos, sin pelar.

  - id: p3
    type: prep
    title: "Cortar el tofu"
    uses: [tofu]
    content: |
      Láminas de 1 cm. Si el tofu suelta mucha agua, prensarlo entre papel de
      cocina unos minutos: se dorará mucho mejor.

  - id: c1
    type: cook
    title: "Asar las verduras"
    timer: 2100
    uses: [cebolla, puerro, ajo, zanahoria, ostra, shiitake, portobello, aceite_asar, sal_caldo]
    content: |
      Precalentar el horno a 200 °C. Disponer en la bandeja la cebolla, puerro,
      ajo, zanahoria, setas de ostra, shiitake fresco y portobello. Regar con un
      hilo de aceite y una pizca de sal. Hornear 30-35 minutos hasta que estén
      bien dorados, casi quemados en los bordes.

      **Ese punto de tostado intenso es donde está el sabor del caldo — no tengas
      miedo al color.**

  - id: c2
    type: cook
    title: "Cocer el caldo"
    timer: 420
    scalable_time: false
    uses: [kombu, shiitake_seco, manzana, agua]
    content: |
      Retirar el kombu del agua de infusión antes de calentar, para evitar el
      amargor. Volcar en la olla los 1,5 litros de agua restantes junto con todas
      las verduras asadas, el shiitake rehidratado con su líquido y la manzana en
      cuartos.

      Cerrar y cocer 7 minutos desde que alcance presión. Dejar despresurizar
      sola. Colar con colador fino y desechar los sólidos: debe quedar un caldo
      oscuro y aromático.

  - id: c3
    type: cook
    title: "Preparar el tare"
    uses: [miso, leche_avena, mirin, sake, tamari, gochujang]
    content: |
      Mezclar en un bol el miso blanco con la leche de avena hasta obtener una
      crema homogénea sin grumos. Añadir el mirin, el sake, el tamari y el
      gochujang. Remover bien.

      **No calentar nunca el tare de miso — pierde sabor y propiedades.** Reservar
      a temperatura ambiente hasta el momento de servir.

  - id: c4
    type: cook
    title: "Dorar el tofu"
    timer: 360
    uses: [tofu]
    content: |
      Dorar las láminas de tofu en una sartén con aceite a fuego alto, hasta que
      estén doradas por ambos lados. Reservar.

  - id: c5
    type: cook
    title: "Escaldar el pak choi"
    timer: 30
    scalable_time: false
    uses: [pak_choi]
    content: |
      Escaldar el pak choi en agua hirviendo 30 segundos. Escurrir y reservar.
      Debe quedar verde brillante y con el tallo aún crujiente.

  - id: c6
    type: cook
    title: "Cocer los fideos"
    uses: [fideos]
    content: |
      Cocer los fideos según las instrucciones del paquete. Escurrir y reservar.
      Cocerlos justo antes de montar los boles: se pasan enseguida.

  - id: pl1
    type: plate
    title: "Montar los boles"
    uses: [miso, fideos, tofu, pak_choi, nori, maiz, cebolleta, sesamo, aceite_chili]
    content: |
      Poner 2-3 cucharadas de tare en el fondo del bol. Verter el caldo muy
      caliente por encima y remover para integrar. Añadir los fideos, el tofu
      dorado, el pak choi y el maíz si se usa. Apoyar la lámina de nori en el
      borde. Terminar con cebolleta fresca, sésamo tostado y unas gotas de aceite
      de chili.

notes:
  - title: "Kombu"
    content: "Retirarlo siempre antes de hervir — si hierve mucho tiempo amarga y da textura viscosa."
  - title: "Agua de rehidratación"
    content: "No tirarla nunca, es la parte más umami de todo el caldo."
  - title: "Tare"
    content: "La cantidad por bol es orientativa. Empieza con 2 cucharadas, prueba y ajusta — es donde controlas la sal y el picante."
  - title: "Gochujang"
    content: "Si quieres más picante, añade también aceite de chili o rayu encima en el bol. Así cada comensal regula su nivel."
  - title: "Leche de avena"
    content: "Añadirla al tare en frío funciona perfectamente. Si la añades también al caldo, hazlo fuera del fuego o a fuego muy bajo para que no se corte."
  - title: "Fideos"
    content: "Los ramen secos de supermercado funcionan. Si encuentras frescos, mejor. El soba de trigo sarraceno también casa bien con este caldo."
  - title: "Almacenamiento"
    content: "El caldo aguanta 4-5 días en nevera o 3 meses congelado. El tare aguanta 2 semanas en nevera en tarro cerrado. Preparar en cantidad y congelar por raciones."
---

Ramen vegetariano de caldo oscuro y profundo, con verduras y setas muy asadas,
tare de miso blanco y gochujang, y el umami del kombu y el shiitake deshidratado.

## Ingredientes (4 personas)

### Caldo

- 2 l de agua fría
- 15 g de kombu (1-2 trozos)
- 20 g de shiitake deshidratado
- 2 cebollas medianas, cortadas por la mitad
- 1 puerro, en trozos grandes
- 1 cabeza de ajo entera, cortada por la mitad horizontalmente
- 2 zanahorias medianas, en trozos
- 150 g de setas de ostra
- 150 g de shiitake fresco
- 200 g de champiñón portobello, en trozos
- 1 manzana pequeña, sin corazón y en cuartos
- Aceite de oliva (para asar)
- Sal

### Tare de miso y gochujang

- 80 g de miso blanco (shiro)
- 60 ml de leche de avena
- 2 cucharadas de mirin
- 1 cucharada de sake (o mirin extra)
- 1 cucharada de tamari o soja
- 1-2 cucharaditas de gochujang (según nivel de picante)

### Para servir

- 400 g de fideos ramen (o soba, udon)
- 300 g de tofu firme
- 2 pak choi, en mitades
- 4 láminas de nori
- Cebolleta fresca, picada
- Aceite de chili (al gusto)
- Sésamo tostado
- Maíz cocido (opcional)

## Utensilios

- Bandeja de horno
- Olla a presión
- Bol pequeño para el tare
- Colador fino

## Reposo

### Infusión en frío — 1 h

Poner el kombu y el shiitake deshidratado en 500 ml del agua fría. Dejar reposar
al menos 1 hora a temperatura ambiente, o toda la noche en nevera.

**No tirar el agua de infusión — es concentrado puro de umami.**

## Preparación previa

### Cortar las verduras

Cebollas por la mitad, puerro en trozos grandes, cabeza de ajo cortada por la
mitad en horizontal y zanahorias en trozos gruesos. No hace falta finura: todo va
al horno.

### Preparar las setas y la manzana

Portobello en trozos grandes, setas de ostra y shiitake enteros o partidos según
tamaño. Manzana sin corazón y en cuartos, sin pelar.

### Cortar el tofu

Láminas de 1 cm. Si el tofu suelta mucha agua, prensarlo entre papel de cocina
unos minutos: se dorará mucho mejor.

## Elaboración

### Asar las verduras — 35 min

Precalentar el horno a 200 °C. Disponer en la bandeja la cebolla, puerro, ajo,
zanahoria, setas de ostra, shiitake fresco y portobello. Regar con un hilo de
aceite y una pizca de sal. Hornear 30-35 minutos hasta que estén bien dorados,
casi quemados en los bordes.

**Ese punto de tostado intenso es donde está el sabor del caldo — no tengas miedo
al color.**

### Cocer el caldo — 7 min

Retirar el kombu del agua de infusión antes de calentar, para evitar el amargor.
Volcar en la olla los 1,5 litros de agua restantes junto con todas las verduras
asadas, el shiitake rehidratado con su líquido y la manzana en cuartos.

Cerrar y cocer 7 minutos desde que alcance presión. Dejar despresurizar sola.
Colar con colador fino y desechar los sólidos: debe quedar un caldo oscuro y
aromático.

### Preparar el tare

Mezclar en un bol el miso blanco con la leche de avena hasta obtener una crema
homogénea sin grumos. Añadir el mirin, el sake, el tamari y el gochujang. Remover
bien.

**No calentar nunca el tare de miso — pierde sabor y propiedades.** Reservar a
temperatura ambiente hasta el momento de servir.

### Dorar el tofu — 6 min

Dorar las láminas de tofu en una sartén con aceite a fuego alto, hasta que estén
doradas por ambos lados. Reservar.

### Escaldar el pak choi — 30 s

Escaldar el pak choi en agua hirviendo 30 segundos. Escurrir y reservar. Debe
quedar verde brillante y con el tallo aún crujiente.

### Cocer los fideos

Cocer los fideos según las instrucciones del paquete. Escurrir y reservar.
Cocerlos justo antes de montar los boles: se pasan enseguida.

## Emplatado

### Montar los boles

Poner 2-3 cucharadas de tare en el fondo del bol. Verter el caldo muy caliente
por encima y remover para integrar. Añadir los fideos, el tofu dorado, el pak
choi y el maíz si se usa. Apoyar la lámina de nori en el borde. Terminar con
cebolleta fresca, sésamo tostado y unas gotas de aceite de chili.

## Notas

- **Kombu**: retirarlo siempre antes de hervir — si hierve mucho tiempo amarga y da textura viscosa.
- **Agua de rehidratación**: no tirarla nunca, es la parte más umami de todo el caldo.
- **Tare**: la cantidad por bol es orientativa. Empieza con 2 cucharadas, prueba y ajusta — es donde controlas la sal y el picante.
- **Gochujang**: si quieres más picante, añade también aceite de chili o rayu encima en el bol. Así cada comensal regula su nivel.
- **Leche de avena**: añadirla al tare en frío funciona perfectamente. Si la añades también al caldo, hazlo fuera del fuego o a fuego muy bajo para que no se corte.
- **Fideos**: los ramen secos de supermercado funcionan. Si encuentras frescos, mejor. El soba de trigo sarraceno también casa bien con este caldo.
- **Almacenamiento**: el caldo aguanta 4-5 días en nevera o 3 meses congelado. El tare aguanta 2 semanas en nevera en tarro cerrado. Preparar en cantidad y congelar por raciones.
