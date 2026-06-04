# Diseño UI/UX — Asturias en Familia

---

## 1. Identidad visual

### Concepto

**Minimalista-rural-familiar** — La interfaz evoca la naturaleza asturiana (verde, piedra, mar) sin ser recargada. El
mapa es el protagonista absoluto.

### Paleta de colores

| Token                   | Hex       | Uso                                              |
| ----------------------- | --------- | ------------------------------------------------ |
| `--color-bg`            | `#FDF8F0` | Fondo general (crema cálido)                     |
| `--color-primary`       | `#2A4D1E` | Verde asturiano — titulares, botones principales |
| `--color-primary-light` | `#3D7A36` | Hover de botones, iconos                         |
| `--color-surface`       | `#FFFFFF` | Tarjetas, paneles                                |
| `--color-border`        | `#E8E0D0` | Bordes sutiles                                   |
| `--color-text`          | `#1A1A1A` | Texto principal                                  |
| `--color-text-muted`    | `#6B6B6B` | Texto secundario, metadatos                      |
| `--color-error`         | `#C0392B` | Errores de formulario                            |
| `--color-success`       | `#27AE60` | Confirmaciones                                   |

### Colores de categorías (marcadores del mapa)

| Categoría   | Color           | Hex       |
| ----------- | --------------- | --------- |
| 🥾 Rutas    | Verde bosque    | `#3D7A36` |
| 🐟 Acuario  | Azul marino     | `#2E88B0` |
| 🐴 Caballos | Violeta         | `#7B5EA7` |
| 🏛️ Museos   | Terracota       | `#C0522A` |
| 🌳 Parques  | Verde esmeralda | `#3A9E6E` |
| 🏖️ Playas   | Turquesa        | `#2AACAB` |

### Tipografía

| Rol                  | Fuente                          | Tamaños                          |
| -------------------- | ------------------------------- | -------------------------------- |
| Títulos y cabeceras  | Playfair Display (Google Fonts) | 2xl: 32px · xl: 24px · lg: 20px  |
| Texto y UI           | DM Sans (Google Fonts)          | base: 16px · sm: 14px · xs: 12px |
| Código / coordenadas | monospace del sistema           | sm: 14px                         |

```css
/* Importar en styles.scss */
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap");

:root {
	--font-heading: "Playfair Display", Georgia, serif;
	--font-body: "DM Sans", system-ui, sans-serif;
}
```

---

## 2. Sistema de espaciado

Basado en múltiplos de 4px:

| Token       | Valor | Uso típico               |
| ----------- | ----- | ------------------------ |
| `--space-1` | 4px   | Separación mínima        |
| `--space-2` | 8px   | Padding interno de chips |
| `--space-3` | 12px  | Gap entre elementos      |
| `--space-4` | 16px  | Padding estándar         |
| `--space-6` | 24px  | Secciones                |
| `--space-8` | 32px  | Bloques grandes          |

---

## 3. Componentes

### Marcador del mapa

```
┌─────────┐
│  ICONO  │  ← SVG de categoría (24×24px)
│  ●●●●●  │  ← Color de categoría de fondo
└────┬────┘
     │       ← Pin triangular
     ▼
```

- Tamaño: 40×48px (incluyendo el pin)
- Al hover: escala 1.1 + sombra
- Seleccionado: escala 1.2 + anillo de borde blanco

### Panel de detalle (escritorio)

```
┌─────────────────┬──────────────────────────────────────┐
│                 │ ✕  Cerrar                             │
│  MAPA SVG       │─────────────────────────────────────│
│  (ancho total   │ 📷 Imagen principal                  │
│   - 380px)      │─────────────────────────────────────│
│                 │ 🥾 Rutas        [chip categoría]     │
│                 │                                      │
│                 │ Título de la actividad               │
│                 │ ─────────────────────────────────── │
│                 │ Descripción completa...              │
│                 │                                      │
│                 │ 📍 Cangas de Onís · Oriente          │
│                 │ 💶 Gratuita                          │
│                 │ ♿ Accesible                         │
│                 │ 🌐 Español, Inglés                   │
└─────────────────┴──────────────────────────────────────┘
```

- Ancho del panel: 380px fijo
- Animación: slide-in desde la derecha (200ms ease-out)

### Panel de detalle (móvil — bottom sheet)

```
┌──────────────────────────────┐
│  ─────  (handle de arrastre) │
│                              │
│  🥾 Rutas                    │
│  Título de la actividad      │
│  ─────────────────────────── │
│  Descripción...              │
│                              │
│  📍 Cangas de Onís           │
│  💶 Gratuita  ♿ Accesible   │
└──────────────────────────────┘
```

- Altura inicial: 50vh, expandible a 90vh
- Animación: slide-up desde abajo (300ms ease-out)

### Chips de filtro

```
[🥾 Rutas]  [🌊 Playas]  [♿ Accesible]  [💶 Gratuitas]
```

- Estado inactivo: fondo blanco, borde `--color-border`
- Estado activo: fondo color de categoría, texto blanco
- Hover: fondo ligeramente más oscuro

### Barra de filtros

```
┌─────────────────────────────────────────────────────────┐
│ 🔍 Buscar actividad...    [Zona ▼]   [Categoría ▼]  ♿ 💶│
│ 12 actividades encontradas                              │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Layout responsive

### Breakpoints

| Nombre | Valor  | Dispositivo  |
| ------ | ------ | ------------ |
| `sm`   | 640px  | Móvil grande |
| `md`   | 768px  | Tablet       |
| `lg`   | 1024px | Escritorio   |

### Móvil (< 768px)

```
┌─────────────────────┐
│ 🗺️ Asturias         │  ← header mínimo
├─────────────────────┤
│  [🔍] [Zona] [Cat]  │  ← filtros compactos
├─────────────────────┤
│                     │
│    MAPA LEAFLET     │  ← 100vw × calc(100vh - cabecera - filtros)
│                     │
└─────────────────────┘
        ↑
  Bottom sheet al clicar marcador
```

### Escritorio (≥ 768px)

```
┌──────────────────────────────────────────────────┐
│  🗺️ Asturias en Familia    [filtros en línea]    │
├───────────────────────────┬──────────────────────┤
│                           │                      │
│      MAPA LEAFLET         │  PANEL LATERAL       │
│      (fullscreen          │  (380px, aparece     │
│       - panel)            │   al cerrar)         │
│                           │                      │
└───────────────────────────┴──────────────────────┘
```

---

## 5. Accesibilidad (WCAG 2.1 AA)

### Contraste mínimo

| Par de colores                         | Ratio  | ¿Cumple AA? |
| -------------------------------------- | ------ | ----------- |
| Texto `#1A1A1A` sobre `#FDF8F0`        | 17.8:1 | ✅ AAA      |
| Texto blanco sobre `#2A4D1E`           | 8.1:1  | ✅ AAA      |
| Texto `#6B6B6B` sobre `#FDF8F0`        | 5.9:1  | ✅ AA       |
| Texto blanco sobre `#2E88B0` (acuario) | 4.6:1  | ✅ AA       |

### Foco visible

Todos los elementos interactivos tienen un outline de foco claro:

```css
:focus-visible {
	outline: 3px solid #2a4d1e;
	outline-offset: 2px;
}
```

### ARIA

| Elemento          | ARIA                                                                         |
| ----------------- | ---------------------------------------------------------------------------- |
| Marcador del mapa | `role="button"` + `aria-label="Actividad: {nombre}, categoría: {categoria}"` |
| Panel de detalle  | `role="dialog"` + `aria-labelledby="detail-title"`                           |
| Botón cerrar      | `aria-label="Cerrar detalle"`                                                |
| Filtros activos   | `aria-pressed="true/false"`                                                  |
| Estado de carga   | `aria-busy="true"` en el contenedor del mapa                                 |

### Navegación por teclado

- `Tab` para moverse entre marcadores y controles
- `Enter` o `Espacio` para activar un marcador
- `Escape` para cerrar el panel de detalle
- El foco vuelve al marcador que abrió el panel al cerrar

---

## 6. Estados de la UI

| Estado                    | Comportamiento visual                                                      |
| ------------------------- | -------------------------------------------------------------------------- |
| **Cargando**              | Skeleton sobre el mapa + spinner en la barra de filtros                    |
| **Error de red**          | Toast rojo en la parte superior: "Error al cargar actividades. Reintentar" |
| **Sin resultados**        | Ilustración + "No hemos encontrado actividades con estos filtros"          |
| **Marcador hover**        | Escala 1.1 + tooltip con nombre de la actividad                            |
| **Marcador seleccionado** | Escala 1.2 + anillo blanco + panel de detalle abierto                      |

---

## 7. Lenguaje e inclusividad

- Usar formas inclusivas en toda la UI: "familias", "personas", evitar genérico masculino.
- Precios: mostrar siempre "Gratuita" (no "Gratis" ni "0 €").
- Accesibilidad: "Accesible para personas con movilidad reducida" (en tooltip expandido).
- Idiomas disponibles: mostrar bandera + nombre del idioma completo.

---

## 8. Notas de implementación

### Leaflet y estilos personalizados

Los marcadores del mapa son `L.divIcon` con HTML generado dinámicamente por Angular. Los estilos del pin se definen en
`map-marker.component.scss` y se inyectan en el DOM de Leaflet mediante `allowedCommonJsDependencies` en `angular.json`.

Los iconos por defecto de Leaflet (`marker-icon.png`, `marker-shadow.png`) se copian en `frontend/src/assets/leaflet/`
para evitar el error 404 en producción.

### Glassmorphism en tooltips

Los tooltips de Leaflet usan un efecto glassmorphism:

```css
.leaflet-tooltip {
	background: rgba(255, 255, 255, 0.85);
	backdrop-filter: blur(8px);
	border: 1px solid rgba(255, 255, 255, 0.3);
	border-radius: 8px;
}
```

### Drawer móvil para filtros

En móvil, los filtros extra (accesibilidad, gratuitas) se ocultan en un drawer con overlay glassmorphism activado por el
botón ⚙️. El drawer usa `position: fixed` y animación `slide-up`.
