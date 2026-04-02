# 🚀 Guía de Astro para tu proyecto de Recetas

## ¿Qué es Astro?

Astro es un **framework web moderno** diseñado para crear sitios web **rápidos y centrados en el contenido**.

### La filosofía de Astro: "Ship less JavaScript"

```
Otros frameworks:  HTML + 100KB de JavaScript 😰
Astro:             HTML + 0KB de JavaScript* 🎉
                   (*JavaScript solo donde lo necesites)
```

**Concepto clave**: Por defecto, Astro genera HTML estático puro. Solo añade JavaScript si explícitamente lo necesitas.

## ¿Por qué Astro es PERFECTO para tu proyecto de recetas?

### 1. **Contenido Estático = Velocidad**
```
Tus recetas no cambian cada segundo
→ No necesitas JavaScript para mostrar una receta
→ Astro genera HTML puro
→ Carga instantánea en móvil (incluso con 3G)
```

### 2. **PWA-Friendly**
```
HTML estático + Service Worker = Offline perfecto
→ Cacheas todo fácilmente
→ Funciona sin conexión en la cocina
→ No dependes de una API/servidor
```

### 3. **Mobile-First Natural**
```
Sin JavaScript innecesario = menos datos
Carga rápida = mejor experiencia móvil
HTML semántico = accesibilidad
```

## 🏗️ Estructura de un proyecto Astro

```
fork_and_commit/
├── src/
│   ├── pages/              # 🚪 RUTAS de tu web
│   │   ├── index.astro     # → / (home)
│   │   └── recetas/
│   │       └── [slug].astro # → /recetas/curry-golden
│   │
│   ├── content/            # 📝 CONTENIDO (recetas, blogs, etc)
│   │   └── recetas/
│   │       ├── curry.md
│   │       └── kimchi.md
│   │
│   ├── layouts/            # 🎨 PLANTILLAS reutilizables
│   │   └── Layout.astro    # <html>, <head>, estructura común
│   │
│   ├── components/         # 🧩 COMPONENTES reutilizables
│   │   ├── RecipeCard.astro
│   │   └── IngredientList.astro
│   │
│   └── assets/             # 🖼️ IMÁGENES/CSS procesados por Astro
│
├── public/                 # 📦 ARCHIVOS ESTÁTICOS (copiados tal cual)
│   ├── favicon.svg
│   └── icons/              # (para tu PWA)
│
└── dist/                   # 🎁 OUTPUT (generado al hacer build)
    └── ...                 # HTML estático listo para deploy
```

## 🎯 Conceptos clave de Astro

### 1. **Routing basado en archivos**

```
src/pages/index.astro           → https://tuweb.com/
src/pages/about.astro           → https://tuweb.com/about
src/pages/recetas/[slug].astro  → https://tuweb.com/recetas/cualquier-cosa
```

**No necesitas configurar rutas manualmente**. El nombre del archivo = la URL.

### 2. **Content Collections** 🌟 (LO MÁS IMPORTANTE)

Es la forma oficial de manejar contenido (recetas, posts, etc).

#### Sin Content Collections (❌ forma antigua):
```javascript
// Tienes que hacer todo manual
const recetas = await Astro.glob('../recetas/*.md');
// Sin validación, sin tipos, sin optimización
```

#### Con Content Collections (✅ forma correcta):
```javascript
// Astro lo hace automático
import { getCollection } from 'astro:content';
const recetas = await getCollection('recetas');
// Con TypeScript types, validación, optimización automática
```

**Ventajas**:
- ✅ **Validación**: Define qué campos debe tener cada receta (título, tiempo, etc)
- ✅ **TypeScript**: Autocompletado y errores si falta algo
- ✅ **Optimización**: Astro optimiza imágenes y referencias automáticamente
- ✅ **Organización**: Todo en `src/content/`, separado de código

### 3. **Componentes `.astro`**

Un archivo `.astro` tiene 3 partes:

```astro
---
// 1. COMPONENT SCRIPT (solo se ejecuta en BUILD TIME)
const nombre = "Pablo";
const recetas = await getCollection('recetas');
// Este código corre en el servidor, NO en el navegador
---

<!-- 2. TEMPLATE (HTML con sintaxis tipo JSX) -->
<div>
  <h1>Hola {nombre}</h1>
  {recetas.map(r => (
    <p>{r.data.title}</p>
  ))}
</div>

<style>
  /* 3. ESTILOS (scoped por defecto) */
  h1 {
    color: blue; /* Solo afecta al h1 de ESTE componente */
  }
</style>
```

### 4. **Frontmatter en Markdown**

Tus recetas en Markdown usan **frontmatter YAML** para metadatos:

```markdown
---
title: "Curry Golden"
difficulty: "Media"
time: "45 min"
tags: [vegetariano, japonés]
---

# Contenido de la receta...
```

Astro parsea esto automáticamente y lo convierte en un objeto:
```javascript
{
  data: {
    title: "Curry Golden",
    difficulty: "Media",
    time: "45 min",
    tags: ["vegetariano", "japonés"]
  },
  body: "# Contenido de la receta..."
}
```

### 5. **Astro Islands** 🏝️ (Arquitectura de Islas)

```
╔══════════════════════════════════╗
║  HTML Estático (Astro)           ║  ← La mayoría de tu página
║  ┌─────────────────┐             ║
║  │ 🏝️ React Timer  │             ║  ← Solo esta parte tiene JS
║  │ (interactivo)   │             ║
║  └─────────────────┘             ║
║  HTML Estático (Astro)           ║
╚══════════════════════════════════╝
```

**Para tu proyecto de recetas**:
- Lista de recetas: HTML estático (Astro)
- Detalle de receta: HTML estático (Astro)
- Timer de cocina: JavaScript island (React/Vue/Svelte)

## 🔄 Ciclo de vida: Build Time vs Runtime

### Build Time (cuando haces `bun run build`):
```
1. Astro lee tus archivos .astro, .md, etc
2. Ejecuta el código entre ---
3. Genera HTML estático puro
4. Optimiza imágenes, CSS, etc
5. Output: carpeta dist/ con HTML listo
```

### Runtime (cuando el usuario visita tu web):
```
1. Navegador descarga HTML estático
2. Se renderiza instantáneamente (no hay JS que ejecutar)
3. (Opcional) Si usaste islands, carga JS solo de esas partes
```

**Para tu PWA**: El Service Worker cachea todo el HTML estático → funciona offline.

## 🎨 ¿Cuándo usar cada carpeta?

### `/src/pages/` - Rutas públicas
✅ `index.astro` - Homepage
✅ `recetas/[slug].astro` - Detalle de receta
❌ NO pongas componentes reutilizables aquí

### `/src/content/` - Tu contenido
✅ `recetas/curry.md` - Una receta
✅ `recetas/kimchi.md` - Otra receta
❌ NO pongas código aquí, solo contenido

### `/src/components/` - Componentes UI reutilizables
✅ `RecipeCard.astro` - Tarjeta de preview
✅ `Button.astro` - Botón reutilizable
❌ NO pongas páginas completas aquí

### `/src/layouts/` - Plantillas comunes
✅ `Layout.astro` - `<html>`, `<head>`, estructura base
✅ `RecipeLayout.astro` - Layout específico para recetas
❌ NO pongas componentes pequeños aquí

### `/public/` - Assets estáticos sin procesar
✅ `favicon.ico`
✅ `robots.txt`
✅ `manifest.json` (para tu PWA)
❌ NO pongas imágenes que quieres optimizar (usa `/src/assets/`)

### `/src/assets/` - Assets procesados por Astro
✅ Imágenes que Astro optimizará
✅ CSS/SCSS que quieres procesar
❌ NO pongas archivos que quieres copiar tal cual

## 🚀 Por qué esta arquitectura para tu proyecto

### Tu caso: App de recetas PWA mobile-first

```
Necesitas:
✅ Contenido estático (recetas no cambian constantemente)
✅ Carga ultra-rápida en móvil
✅ Funcionar offline (cocinar sin WiFi)
✅ Búsqueda/filtrado (mínimo JS necesario)
✅ Fácil de mantener (añadir recetas = crear .md)

Astro te da:
✅ HTML estático = velocidad máxima
✅ Content Collections = organización perfecta
✅ Islands = JS solo donde lo necesitas (búsqueda, timers)
✅ Build estático = PWA fácil con Service Worker
✅ Markdown = añadir recetas es trivial
```

## 📦 Comandos esenciales

```bash
bun run dev      # Desarrollo local (hot reload)
bun run build    # Genera HTML estático en /dist
bun run preview  # Previsualiza el build localmente
```

## 🎯 Siguiente paso

Ahora que entiendes la arquitectura, vamos a:

1. **Configurar Content Collections** → Define el schema de tus recetas
2. **Mover tus recetas** → De la raíz a `src/content/recetas/`
3. **Crear páginas** → Lista e índice de recetas
4. **Aplicar diseño mobile-first** → CSS optimizado
5. **Convertir a PWA** → Manifest + Service Worker

---

💡 **Recuerda**: En Astro, el 90% de tu app será HTML estático. JavaScript solo para lo interactivo (búsqueda, timers, favoritos).
