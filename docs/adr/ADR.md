# ADR — Architecture Decision Records

Un ADR (Architecture Decision Record) documenta una decisión arquitectónica importante: el contexto, las alternativas
consideradas, la decisión tomada y las consecuencias.

---

## ADR-001 — Base de datos: MongoDB

**Estado:** Aceptado

### Contexto

Necesitamos almacenar actividades con atributos heterogéneos (algunas tienen imágenes, otras múltiples idiomas, datos de
accesibilidad variables) y hacer consultas geoespaciales para filtrar por zona.

### Alternativas consideradas

| Opción                   | Ventajas                                                  | Desventajas                                     |
| ------------------------ | --------------------------------------------------------- | ----------------------------------------------- |
| **MongoDB**              | Esquema flexible, índice 2dsphere nativo, Mongoose maduro | Menos ACID que SQL, joins costosos              |
| **PostgreSQL + PostGIS** | ACID completo, SQL familiar, PostGIS potente              | Mayor complejidad de setup, ORM menos flexible  |
| **SQLite**               | Cero configuración                                        | Sin capacidades geoespaciales reales, no escala |

### Decisión

MongoDB 7 con Mongoose ODM e índice `2dsphere`.

### Consecuencias

- Las coordenadas se guardan en orden GeoJSON `[lng, lat]`, no `[lat, lng]`.
- Las consultas fulltext usan el índice `$text` de MongoDB.
- No hay transacciones multi-documento en el MVP.

---

## ADR-002 — Frontend: Angular 17 con Standalone Components y Signals

**Estado:** Aceptado

### Contexto

Criterio del módulo de DAW: usar Angular. Dentro de Angular 17 hay que elegir entre el enfoque tradicional (módulos
NgModule, RxJS para todo) y el moderno (standalone components, signals).

### Decisión

Standalone components + signals para estado local, RxJS solo para streams HTTP. No se usa NgRx para el MVP.

### Consecuencias positivas

- Menos boilerplate (no hay módulos que mantener).
- Los signals son el futuro oficial de Angular.
- El estado es más legible: `signal()`, `computed()`, `effect()`.

### Consecuencias negativas

- Signals son relativamente nuevos; menos ejemplos en Stack Overflow.
- Si en el futuro se necesita estado complejo habrá que añadir NgRx o similar.

---

## ADR-003 — Mapa: Leaflet con SVG imageOverlay

**Estado:** Aceptado (revisado — sustituye decisión inicial de SVG estático puro)

### Contexto

La app necesita mostrar un mapa de Asturias con marcadores de actividades. La decisión inicial era usar un SVG estático
con marcadores posicionados mediante CSS y transformación lineal. Durante la implementación se detectaron limitaciones:
sin zoom nativo, sin paneo, y dificultad para posicionar marcadores con precisión en dispositivos con distintas
resoluciones.

### Alternativas consideradas

| Opción                     | Ventajas                                                          | Desventajas                                                |
| -------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------- |
| **SVG estático + CSS**     | Sin dependencias, offline, control total                          | Sin zoom nativo, calibración manual compleja, sin paneo    |
| **Leaflet + imageOverlay** | Zoom y paneo nativos, coordenadas geográficas reales, open source | Requiere internet para tiles (se desactivan en producción) |
| **Mapbox GL JS**           | Muy potente, bonito                                               | Requiere API key de pago a escala                          |
| **Google Maps**            | Familiar, robusto                                                 | Coste, dependencia de Google, privacidad                   |

### Decisión

**Leaflet 1.9** con el SVG de Asturias (fuente ArcGIS) como `imageOverlay` sobre un mapa base vacío. Los marcadores son
`L.marker` con `DivIcon` que muestran el icono y color de cada categoría. Las coordenadas geográficas reales se usan
directamente — no hay transformación lineal.

### Consecuencias positivas

- Zoom y paneo nativos sin código adicional.
- Los marcadores se posicionan usando lat/lng reales — sin calibración manual.
- El SVG artístico de Asturias se superpone como capa visual manteniendo la identidad del proyecto.
- Funciona en móvil con gestos táctiles.

### Consecuencias negativas

- Dependencia de Leaflet (~40kb gzip).
- Los tiles de OpenStreetMap requieren internet (se usan solo para calibración; en producción se eliminan).
- CommonJS warning en el build de Angular (resuelto con `allowedCommonJsDependencies`).

---

## ADR-004 — Autenticación: JWT stateless (sin sesiones en servidor)

**Estado:** Aceptado

### Contexto

Necesitamos proteger el panel de administración.

### Alternativas consideradas

| Opción                     | Ventajas                                  | Desventajas                                               |
| -------------------------- | ----------------------------------------- | --------------------------------------------------------- |
| **JWT stateless**          | Sin estado en servidor, escalable, simple | No hay revocación inmediata de tokens                     |
| **Sesiones con cookies**   | Revocación sencilla, más seguro ante XSS  | Requiere almacenamiento de sesiones (Redis), más complejo |
| **OAuth2/OpenID (Google)** | No hay que gestionar contraseñas          | Dependencia externa, complejidad mayor                    |

### Decisión

JWT con access token (15 min) + refresh token (7 días). El access token se guarda en `sessionStorage`.

### Consecuencias

- Si se compromete un token, es válido hasta que expire (15 min máximo).
- No hay logout real en el servidor — solo en el cliente.
- `sessionStorage` se vacía al cerrar la pestaña (comportamiento deseado).
- **Mejora futura:** lista negra de refresh tokens en Redis para revocación inmediata.

---

## ADR-005 — Soft delete de actividades

**Estado:** Aceptado

### Contexto

Cuando un admin elimina una actividad, ¿qué hacemos con el registro?

### Decisión

Soft delete: `active: false`. El registro permanece en la BD.

### Consecuencias positivas

- Auditoría: podemos saber qué actividades existieron.
- Recuperación: un admin puede reactivar una actividad.

### Consecuencias negativas

- Todas las queries públicas deben incluir `{ active: true }`.
- La BD crece con registros no servidos (irrelevante para el MVP).

---

## ADR-006 — CI/CD: GitHub Actions

**Estado:** Aceptado

### Decisión

GitHub Actions con pipeline: tests backend (Jest) + build y tests frontend (Jasmine/Karma).

### Alternativas descartadas

- **GitLab CI:** el repositorio está en GitHub.
- **Jenkins:** demasiada infraestructura para un proyecto académico.
- **CircleCI:** gratuito solo con límites, menos integrado con GitHub.

### Consecuencias

- Pipeline gratuita para repositorios públicos.
- Configuración en `.github/workflows/ci.yml` dentro del repositorio.
- Las ramas `main` y `develop` requieren pipeline verde para merge.

```

```
