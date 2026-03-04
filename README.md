# Fork & Commit

Colección personal de recetas de cocina, construida con Astro y desplegada en GitHub Pages.

**Live:** [pabloalejos.github.io/fork-and-commit](https://pabloalejos.github.io/fork-and-commit)

## Stack

- [Astro](https://astro.build) v5 — generación estática
- [Bun](https://bun.sh) — runtime y package manager
- GitHub Actions — CI/CD automático a GitHub Pages

## Estructura

```
src/
├── content/recipes/   # Recetas en Markdown (content collections)
├── pages/
│   ├── index.astro    # Listado con búsqueda y filtros
│   └── recipes/
│       └── [slug].astro  # Página de detalle por receta
├── components/
│   ├── RecipeCard.astro
│   └── RecipeFilters.astro
└── layouts/
    └── Layout.astro
```

## Añadir una receta

Crea un archivo `.md` en `src/content/recipes/` con el frontmatter correspondiente (title, difficulty, total_time, active_time, servings, tags, category). Al hacer push a `main`, se despliega automáticamente.

## Comandos

| Comando           | Acción                                  |
| :---------------- | :-------------------------------------- |
| `bun install`     | Instalar dependencias                   |
| `bun dev`         | Servidor local en `localhost:4321`      |
| `bun build`       | Build de producción en `./dist/`        |
| `bun preview`     | Preview del build antes de desplegar    |
