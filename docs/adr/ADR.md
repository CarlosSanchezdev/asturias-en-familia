# ADR — Architecture Decision Records

Un ADR (Architecture Decision Record) documenta una decisión arquitectónica
importante: el contexto, las alternativas consideradas, la decisión tomada
y las consecuencias.

---

## ADR-001 — Base de datos: MongoDB

**Fecha:** 2024-10
**Estado:** Aceptado

### Contexto
Necesitamos almacenar actividades con atributos heterogéneos (algunas tienen
imágenes, otras múltiples idiomas, datos de accesibilidad variables) y hacer
consultas geoespaciales para filtrar por zona.

### Alternativas consideradas

| Opción | Ventajas | Desventajas |
|--------|----------|-------------|
| **MongoDB** | Esquema flexible, índice 2dsphere nativo, Mongoose maduro | Menos ACID que SQL, joins costosos |
| **PostgreSQL + PostGIS** | ACID completo, SQL familiar, PostGIS potente | Mayor complejidad de setup, ORM menos flexible para esquemas cambiantes |
| **SQLite** | Cero configuración | Sin capacidades geoespaciales reales, no escala |

### Decisión
MongoDB 7 con Mongoose ODM e índice `2dsphere`.

### Consecuencias
- Las coordenadas deben guardarse en orden GeoJSON `[lng, lat]`, no `[lat, lng]`.
- Las consultas fulltext usan el índice `$text` de MongoDB (no tan potente como
  Elasticsearch, pero suficiente para el MVP).
- No hay transacciones multi-documento en el MVP (no las necesitamos).

---

## ADR-002 — Frontend: Angular 17 con Standalone Components y Signals

**Fecha:** 2024-10
**Estado:** Aceptado

### Contexto
Criterio del módulo de DAW: usar Angular. Dentro de Angular 17 hay que elegir
entre el enfoque tradicional (módulos NgModule, RxJS para todo) y el moderno
(standalone components, signals).

### Decisión
Standalone components + signals para estado local, RxJS solo para streams HTTP.
No se usa NgRx para el MVP.

### Consecuencias positivas
- Menos boilerplate (no hay módulos que mantener).
- Los signals son el futuro oficial de Angular; mejor alineamiento con la dirección
  del framework.
- El estado es más legible: `signal()`, `computed()`, `effect()` son conceptos
  simples frente a Subject/BehaviorSubject de RxJS.

### Consecuencias negativas
- Signals son relativamente nuevos; menos ejemplos en Stack Overflow.
- Si en el futuro se necesita estado compartido complejo (undo/redo, sincronización
  multi-pestaña) habrá que añadir NgRx o similar.

---

## ADR-003 — Mapa: SVG estático en lugar de Leaflet/Mapbox

**Fecha:** 2024-10
**Estado:** Aceptado

### Contexto
La app necesita mostrar un mapa de Asturias con marcadores de actividades.

### Alternativas consideradas

| Opción | Ventajas | Desventajas |
|--------|----------|-------------|
| **SVG estático** | Sin dependencias externas, control total del estilo, ligero | Requiere calibración manual, no es interactivo (zoom, paneo nativo) |
| **Leaflet** | Open source, tiles de OpenStreetMap, zoom nativo | Depende de tiles externos (necesita internet), estilos más difíciles de personalizar |
| **Mapbox GL JS** | Muy potente, bonito | Requiere API key, tiene coste a escala |
| **Google Maps** | Familiar, robusto | Coste, dependencia de Google, privacidad |

### Decisión
SVG estático de Asturias (fuente ArcGIS) con marcadores posicionados mediante CSS.

### Consecuencias
- El SVG necesita calibración con el `posicionador-ciudades.html` si cambia.
- No hay zoom nativo. Si se necesitara, se podría implementar con CSS `transform: scale()`
  o panning manual — queda como mejora futura.
- La app funciona completamente offline (sin tiles externos).
- El estilo del mapa está 100 % bajo nuestro control (colores, fuentes, etc.).

---

## ADR-004 — Autenticación: JWT stateless (sin sesiones en servidor)

**Fecha:** 2024-10
**Estado:** Aceptado

### Contexto
Necesitamos proteger el panel de administración.

### Alternativas consideradas

| Opción | Ventajas | Desventajas |
|--------|----------|-------------|
| **JWT stateless** | Sin estado en servidor, escalable, simple | No hay revocación inmediata de tokens |
| **Sesiones con cookies** | Revocación sencilla, más seguro ante XSS | Requiere almacenamiento de sesiones (Redis), más complejo |
| **OAuth2/OpenID (Google)** | No hay que gestionar contraseñas | Dependencia externa, complejidad mayor |

### Decisión
JWT con access token (15 min) + refresh token (7 días).
El access token se guarda en `sessionStorage`.

### Consecuencias
- Si se compromete un token, es válido hasta que expire (15 min máximo).
- No hay logout "real" en el servidor — solo en el cliente.
- `sessionStorage` se vacía al cerrar la pestaña (comportamiento deseado).
- El refresh token permite sesiones largas sin pedir contraseña cada 15 min.
- **Mejora futura:** implementar lista negra de refresh tokens en Redis para
  revocación inmediata.

---

## ADR-005 — Soft delete de actividades

**Fecha:** 2024-10
**Estado:** Aceptado

### Contexto
Cuando un admin "elimina" una actividad, ¿qué hacemos con el registro?

### Decisión
Soft delete: `active: false`. El registro permanece en la BD.

### Consecuencias positivas
- Auditoría: podemos saber qué actividades existieron.
- Recuperación: un admin puede reactivar una actividad.
- Sin cascadas problemáticas (si hubiera valoraciones u otras relaciones en el futuro).

### Consecuencias negativas
- Todas las queries públicas deben incluir `{ active: true }`.
- La BD crece con registros que no se sirven. Para el MVP es irrelevante.

---

## ADR-006 — CI/CD: GitHub Actions

**Fecha:** 2024-10
**Estado:** Aceptado

### Decisión
GitHub Actions con pipeline: lint → test backend → test frontend → E2E.

### Alternativas descartadas
- **GitLab CI:** el repositorio está en GitHub.
- **Jenkins:** demasiada infraestructura para un proyecto de clase.
- **CircleCI:** gratuito solo con límites, menos integrado con GitHub.

### Consecuencias
- La pipeline es gratuita para repositorios públicos.
- Configuración en YAML dentro del propio repositorio (`.github/workflows/ci.yml`).
- Las ramas `main` y `develop` requieren pipeline verde + 1 revisión para merge.
