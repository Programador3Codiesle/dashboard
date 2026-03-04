## Sistema de diseño NuevaPostventa

Este documento resume cómo usar el sistema de diseño actual de la app (`Next.js + TailwindCSS`) alineado con las reglas **30, 31 y 32** de `optimizacion.mdc`.

El objetivo es que puedas construir nuevas pantallas rápido, con **branding por empresa**, **accesibilidad básica** y **diseño responsive** sin inventar estilos en cada módulo.

---

## 1. Colores y branding por empresa

Los colores dependen del atributo `data-empresa` en el `<html>` (ver `globals.css`):

- `--color-primary`
- `--color-primary-hover`
- `--color-primary-light`
- `--color-primary-dark`
- `--color-primary-ring`

Nunca hardcodear colores (`bg-blue-500`, `text-red-600`, etc.) cuando exista una clase de marca equivalente.

### 1.1. Utilidades de marca principales

Clases definidas en `globals.css` (dentro de `@layer components`):

- **Fondo / superficies**
  - `.brand-bg` → fondo principal (usa `--color-primary`).
  - `.brand-bg-hover` → hover del fondo principal.
  - `.brand-bg-light` → variantes claras para backgrounds suaves.
  - `.brand-dashboard-bg` → fondo general de dashboards (degradado suave).
  - `.glass-effect` → tarjetas translúcidas (cuando necesites efecto cristal).

- **Texto y bordes**
  - `.brand-text` / `.brand-text-hover` → texto con color de marca.
  - `.brand-border` → bordes con color de marca.
  - `.brand-border-active` → borde de elemento activo.

- **Botones, badges y foco**
  - `.brand-btn` → botón primario (usa color de marca + texto blanco).
  - `.brand-badge` → pill/badge con fondo claro de marca.
  - `.brand-focus-ring` → estilo de foco accesible para inputs/botones.

### 1.2. Patrones recomendados

- Para botones primarios:

  ```tsx
  <button className="brand-btn px-4 py-2 rounded-md text-sm font-medium hover-lift">
    Guardar cambios
  </button>
  ```

- Para cards de dashboard:

  ```tsx
  <div className="brand-card rounded-xl p-4 shadow-sm hover-lift">
    {/* contenido */}
  </div>
  ```

Si necesitas un estilo nuevo y se va a usar en más de una pantalla, créalo aquí en `globals.css` dentro de `@layer components` como otra clase `brand-*`.

---

## 2. Tipografía

- Fuente base global: **Plus Jakarta Sans** (configurada en `globals.css`).
- Clases auxiliares:
  - `.font-jakarta` → forzar Jakarta en un componente concreto.
  - `.font-inter` → usar Inter solo cuando sea estrictamente necesario.

Escala recomendada:

- Títulos principales: `text-xl md:text-2xl font-semibold`.
- Subtítulos / secciones: `text-lg md:text-xl font-semibold`.
- Texto base: `text-sm md:text-base`.
- Texto secundario / labels: `text-xs md:text-sm text-gray-500/600`.

---

## 3. Componentes y estados (UX moderna)

- Usa siempre **transiciones suaves**:
  - Añadir `transition-all duration-200` o `duration-300` en elementos interactivos.
- Para micro‑interacciones:
  - `.hover-lift` en cards y botones importantes.
  - `.brand-focus-ring` en inputs y botones para foco accesible.

Ejemplo botón accesible:

```tsx
<button
  type="button"
  className="brand-btn px-4 py-2 rounded-lg text-sm font-semibold hover-lift brand-focus-ring"
>
  Exportar reporte
</button>
```

---

## 4. Accesibilidad básica (a11y)

- Botones de verdad (`<button>`) para acciones, `<a href>` para navegación.
- Cada `input` con su `label` asociado.
- Elementos interactivos con foco visible:
  - Añadir `.brand-focus-ring` cuando uses clases personalizadas.
- Mensajes y estados:
  - No te bases solo en color para errores/estados → acompáñalo de texto claro.

Ejemplo de input:

```tsx
<label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
  Fecha inicio
  <input
    type="date"
    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm brand-focus-ring"
  />
</label>
```

---

## 5. Responsive y layouts

Usar siempre variantes responsivas de Tailwind (`sm`, `md`, `lg`, `xl`) en grillas y tipografía:

- Grids típicos para tarjetas:
  - `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`
- Espaciado:
  - `gap-3 md:gap-4`, `p-3 md:p-4`.

Ejemplo grid de cards de dashboard:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
  {/* cards */}
</div>
```

Para tablas grandes:

- Encapsular en un contenedor con `overflow-auto` y altura máxima definida.

```tsx
<div className="max-h-[70vh] overflow-auto rounded-lg border border-gray-200 bg-white">
  <table className="min-w-full text-sm">
    {/* ... */}
  </table>
  </div>
```

---

## 6. Cómo crear nuevos patrones

1. **Primero**: revisa si ya existe una clase `brand-*` o un patrón similar en otra pantalla.
2. **Si se repite** el mismo estilo en más de una vista:
   - Agrégalo en `globals.css` dentro de `@layer components` como clase reutilizable.
3. **Nunca** mezcles colores hardcodeados cuando exista variable/brand equivalente.

Ejemplo de nueva utilidad (a agregar en `globals.css` si la necesitas mucho):

```css
@layer components {
  .brand-chip {
    @apply inline-flex items-center rounded-full px-3 py-1 text-xs font-medium brand-badge;
  }
}
```

Y su uso:

```tsx
<span className="brand-chip">Meta cumplida</span>
```

---

## 7. Checklist rápido al crear una nueva pantalla

- ¿Estoy usando **clases de marca** (`brand-*`) en vez de colores fijos?
- ¿La tipografía y tamaños son consistentes con el resto del sistema?
- ¿Funciona bien en móvil, tablet y escritorio (sin scroll horizontal raro)?
- ¿Se puede usar solo con teclado (foco visible, botones reales)?
- ¿Los componentes que se repiten podrían vivir como utilidades en `globals.css`?

Si la respuesta es “sí” a todo, la pantalla está alineada con el Design System de NuevaPostventa.

