# Fork & Commit

Recetario personal. Sitio estático con [Astro](https://astro.build), publicado en
GitHub Pages: <https://pabloalejos.github.io/fork-and-commit>

Las recetas viven en `src/content/recipes/` como markdown con frontmatter, y el
schema de la colección está en `src/content/config.ts`.

```bash
npm install
npm run dev      # http://localhost:4321/fork-and-commit
npm run build
```

## Sección de administración

`/admin` permite generar recetas con Claude y publicarlas sin tocar el repo a
mano. Habla con el backend
[fork-and-commit-recipe-manager](https://github.com/PabloAlejos/fork-and-commit-recipe-manager),
que corre autohospedado.

El sitio sigue siendo estático: la página consume la API por `fetch` desde el
navegador, no hay nada en tiempo de servidor.

```bash
cp .env.example .env     # apunta PUBLIC_API_URL a tu backend
npm run dev
```

### Acceso

Una sola clave, la misma `ADMIN_TOKEN` del backend. Se escribe al entrar en
`/admin` y se guarda en el `localStorage` del navegador; el botón «salir» la
borra.

No hay usuarios ni sesiones porque no hacen falta: **en un sitio estático no se
puede esconder un secreto**. Todo lo que la página necesite para autenticarse
viaja en el JavaScript y lo ve cualquiera. Por eso quien decide es el backend,
que compara la clave contra su `ADMIN_TOKEN` y responde `401` si no coincide.
La página no protege nada por sí misma: solo evita enseñar el formulario.

### Contenido mixto: la parte que sorprende

Una página servida por HTTPS **no puede llamar a una API por HTTP**. GitHub
Pages es HTTPS, así que:

| Abres el admin en | API en | ¿Funciona? |
| :---------------- | :----- | :--------- |
| `pabloalejos.github.io/…/admin` | `http://localhost:8000` | Sí — `localhost` es la excepción |
| `pabloalejos.github.io/…/admin` | `http://192.168.1.50:8000` | **No.** El navegador lo bloquea |
| `localhost:4321` (`npm run dev`) | `http://192.168.1.50:8000` | Sí — http contra http |
| `pabloalejos.github.io/…/admin` | `https://recetas.midominio` | Sí |

Si el backend no corre en la misma máquina desde la que abres el navegador,
necesita HTTPS. Lo más corto es [Tailscale](https://tailscale.com)
(`tailscale serve`) o un túnel de Cloudflare: los dos dan certificado real sin
abrir puertos en el router.

La página detecta ese bloqueo y lo dice con todas las letras en vez de dejar un
error genérico de red.

### CORS

El backend solo acepta peticiones desde los orígenes de su `CORS_ORIGINS`. Si
sirves el sitio desde otro sitio, añádelo allí.

## Estructura

```
src/
├── layouts/Layout.astro      # tokens del sistema de diseño y tipografía
├── components/
│   ├── RecipeCard.astro      # tarjeta del listado
│   └── RecipeFilters.astro   # búsqueda (Pagefind) y filtros
├── pages/
│   ├── index.astro           # listado
│   ├── admin.astro           # generación y publicación
│   ├── manifest.webmanifest.ts
│   └── recipes/[slug].astro  # detalle
└── content/recipes/          # las recetas
```

## Diseño

Relectura contemporánea de los noventa: formas redondeadas, sombra dura
desplazada y seis pasteles definidos en oklch a la misma luminosidad y croma.
Todo vive en variables CSS en `src/layouts/Layout.astro`; cambiando esos seis
tonos se recolorea el sitio entero.

Tipografía: Bricolage Grotesque de display, Nunito de cuerpo y Silkscreen para
las etiquetas diminutas.
