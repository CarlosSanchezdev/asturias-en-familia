# Plan de Implementación — Asturias en Familia

**Proyecto:** Intermodular II · DAW · CIFP Avilés · Curso 2024-2025
**Duración total:** 8 semanas (sprints de 1 semana)
**Metodología:** Scrum simplificado — daily breve, revisión y retrospectiva semanal

---

## Visión general de fases

```
Semana 1-2  │ FASE 0 — Infraestructura y base
Semana 3-4  │ FASE 1 — Backend: API REST completa
Semana 5-6  │ FASE 2 — Frontend: Mapa y visualización
Semana 7    │ FASE 3 — Panel admin y autenticación
Semana 8    │ FASE 4 — QA, pulido y entrega
```

---

## Sprint 1 — Infraestructura base (Semana 1)

**Objetivo:** El entorno local funciona con `docker-compose up`.
Todo el equipo puede arrancar la app sin errores.

### Tareas

| ID | Tarea | Responsable | Estimación | Estado |
|----|-------|-------------|------------|--------|
| S1-01 | Repositorio GitHub + protección de ramas | - | 1h | ⬜ |
| S1-02 | Estructura de carpetas del proyecto | - | 1h | ⬜ |
| S1-03 | `docker-compose.yml` con MongoDB + backend + frontend | - | 3h | ⬜ |
| S1-04 | Dockerfile backend (dev y prod multistage) | - | 2h | ⬜ |
| S1-05 | Dockerfile frontend (dev y prod multistage) | - | 2h | ⬜ |
| S1-06 | Variables de entorno y `.env.example` | - | 1h | ⬜ |
| S1-07 | GitHub Actions CI — pipeline esqueleto (lint + build) | - | 2h | ⬜ |
| S1-08 | Script `mongo-init.js` con seed de categorías | - | 1h | ⬜ |

### Criterio de aceptación del sprint
- `docker-compose up --build` arranca sin errores
- `GET /health` devuelve `{ status: 'ok', db: 'connected' }`
- La SPA Angular carga en `http://localhost:4200`
- Pipeline verde en GitHub Actions

---

## Sprint 2 — Modelos y API: Actividades y Categorías (Semana 2)

**Objetivo:** El backend expone los endpoints de actividades y categorías.
Los datos se persisten correctamente en MongoDB.

### Tareas

| ID | Tarea | Responsable | Estimación | Estado |
|----|-------|-------------|------------|--------|
| S2-01 | Modelo Mongoose `Activity` con índice 2dsphere | - | 3h | ⬜ |
| S2-02 | Modelo Mongoose `Category` | - | 1h | ⬜ |
| S2-03 | Hook pre-save: cálculo `mapLeft`/`mapTop` desde coordenadas | - | 2h | ⬜ |
| S2-04 | Router `GET /api/activities` con filtros y paginación | - | 3h | ⬜ |
| S2-05 | Router `GET /api/activities/:id` | - | 1h | ⬜ |
| S2-06 | Router `GET /api/categories` | - | 1h | ⬜ |
| S2-07 | Middleware `errorHandler` global | - | 2h | ⬜ |
| S2-08 | Middleware `handleValidationErrors` (express-validator) | - | 1h | ⬜ |
| S2-09 | Tests Jest: actividades GET (mocks de Mongoose) | - | 3h | ⬜ |
| S2-10 | Tests Jest: endpoint `/health` | - | 0.5h | ⬜ |

### Criterio de aceptación del sprint
- `GET /api/activities?zone=centro` devuelve lista paginada
- `GET /api/activities/ID_INVALIDO` devuelve 400
- `GET /api/activities/ID_INEXISTENTE` devuelve 404
- Cobertura Jest ≥ 70 %

---

## Sprint 3 — Autenticación JWT (Semana 3)

**Objetivo:** Registro, login y protección de rutas admin funcionan.

### Tareas

| ID | Tarea | Responsable | Estimación | Estado |
|----|-------|-------------|------------|--------|
| S3-01 | Modelo Mongoose `User` con bcrypt | - | 2h | ⬜ |
| S3-02 | `POST /api/auth/register` con validación de contraseña | - | 2h | ⬜ |
| S3-03 | `POST /api/auth/login` — genera access + refresh token | - | 2h | ⬜ |
| S3-04 | `POST /api/auth/refresh` | - | 1h | ⬜ |
| S3-05 | `GET /api/auth/me` | - | 1h | ⬜ |
| S3-06 | Middleware `requireAuth` y `requireAdmin` | - | 2h | ⬜ |
| S3-07 | Proteger rutas POST/PUT/DELETE de activities y categories | - | 1h | ⬜ |
| S3-08 | Tests Jest: auth (register, login, token inválido) | - | 3h | ⬜ |
| S3-09 | Tests Jest: rutas protegidas devuelven 401/403 sin token | - | 2h | ⬜ |

### Criterio de aceptación del sprint
- Login correcto devuelve JWT válido
- `POST /api/activities` sin token → 401
- `POST /api/activities` con token de visitante → 403
- `POST /api/activities` con token admin → 201

---

## Sprint 4 — API admin: POST/PUT/DELETE (Semana 4)

**Objetivo:** El CRUD completo de actividades y categorías funciona desde la API.

### Tareas

| ID | Tarea | Responsable | Estimación | Estado |
|----|-------|-------------|------------|--------|
| S4-01 | `POST /api/activities` con validación completa | - | 2h | ⬜ |
| S4-02 | `PUT /api/activities/:id` | - | 2h | ⬜ |
| S4-03 | `DELETE /api/activities/:id` (soft-delete) | - | 1h | ⬜ |
| S4-04 | `POST /api/categories` | - | 1h | ⬜ |
| S4-05 | `PUT /api/categories/:id` | - | 1h | ⬜ |
| S4-06 | Tests Jest: CRUD completo de actividades | - | 4h | ⬜ |
| S4-07 | Seed de actividades de ejemplo (script separado) | - | 2h | ⬜ |
| S4-08 | Documentación OpenAPI actualizada | - | 2h | ⬜ |

### Criterio de aceptación del sprint
- API completamente funcional y documentada
- Seed carga ≥ 10 actividades reales de Asturias
- Cobertura total Jest ≥ 70 %

---

## Sprint 5 — Frontend: Mapa SVG y marcadores (Semana 5)

**Objetivo:** El mapa de Asturias muestra los marcadores de actividades.
Al hacer clic en un marcador aparece el detalle.

### Tareas

| ID | Tarea | Responsable | Estimación | Estado |
|----|-------|-------------|------------|--------|
| S5-01 | Integrar SVG de Asturias en el componente `MapComponent` | - | 2h | ⬜ |
| S5-02 | Servicio `MapProjectionService` — conversión lat/lng → CSS | - | 2h | ⬜ |
| S5-03 | Componente `MapMarkerComponent` — marcador posicionado | - | 3h | ⬜ |
| S5-04 | `ActivitiesService` — cargar y cachear actividades con signals | - | 2h | ⬜ |
| S5-05 | Renderizar todos los marcadores sobre el SVG | - | 2h | ⬜ |
| S5-06 | `ActivityDetailComponent` — panel de detalle al clicar | - | 3h | ⬜ |
| S5-07 | Responsive: sheet desde abajo en móvil / panel lateral en desktop | - | 3h | ⬜ |
| S5-08 | Animaciones de apertura/cierre del panel | - | 1h | ⬜ |
| S5-09 | Tests Jasmine: `MapProjectionService` — cálculo de posición | - | 2h | ⬜ |

### Criterio de aceptación del sprint
- Los marcadores aparecen en las coordenadas correctas
- Oviedo, Gijón y Avilés están en su posición real en el mapa
- El panel de detalle muestra nombre, descripción, precio y categoría
- Funciona en móvil y escritorio

---

## Sprint 6 — Frontend: Filtros y búsqueda (Semana 6)

**Objetivo:** El usuario puede filtrar actividades por zona, categoría, accesibilidad y precio.
La URL refleja los filtros activos (deep-linking).

### Tareas

| ID | Tarea | Responsable | Estimación | Estado |
|----|-------|-------------|------------|--------|
| S6-01 | `FilterPanelComponent` — chips de zona y categoría | - | 3h | ⬜ |
| S6-02 | Toggles de accesibilidad y gratuito | - | 1h | ⬜ |
| S6-03 | Campo de búsqueda con debounce | - | 2h | ⬜ |
| S6-04 | Sincronizar filtros con query params en la URL | - | 2h | ⬜ |
| S6-05 | El mapa reacciona a los filtros (markers se muestran/ocultan) | - | 2h | ⬜ |
| S6-06 | Contador de resultados visibles | - | 0.5h | ⬜ |
| S6-07 | Estado vacío: mensaje cuando no hay resultados | - | 1h | ⬜ |
| S6-08 | Tests Jasmine: `FilterPanelComponent` | - | 2h | ⬜ |
| S6-09 | Tests Jasmine: `ActivitiesService` filtros | - | 2h | ⬜ |

### Criterio de aceptación del sprint
- Filtrar por zona solo muestra marcadores de esa zona
- La URL `/?zone=oriente&category=rutas` carga el mapa prefiltrado
- La búsqueda responde tras 300 ms de pausa al escribir

---

## Sprint 7 — Panel de administración (Semana 7)

**Objetivo:** Un admin puede crear, editar y desactivar actividades desde la UI.

### Tareas

| ID | Tarea | Responsable | Estimación | Estado |
|----|-------|-------------|------------|--------|
| S7-01 | Página de login (`/auth/login`) | - | 2h | ⬜ |
| S7-02 | `AuthService` — login, logout, tokens con signals | - | 2h | ⬜ |
| S7-03 | `authInterceptor` — inyecta JWT en cabeceras | - | 1h | ⬜ |
| S7-04 | `authGuard` — protege rutas `/admin` | - | 1h | ⬜ |
| S7-05 | `AdminDashboardComponent` — listado de actividades | - | 2h | ⬜ |
| S7-06 | `ActivityFormComponent` — formulario crear/editar | - | 4h | ⬜ |
| S7-07 | Selección de coordenadas en el mapa al crear actividad | - | 3h | ⬜ |
| S7-08 | Botón desactivar actividad (soft-delete) | - | 1h | ⬜ |
| S7-09 | Tests Playwright: flujo login → crear actividad | - | 3h | ⬜ |
| S7-10 | Tests Playwright: flujo filtrado del mapa | - | 2h | ⬜ |

### Criterio de aceptación del sprint
- Un visitante no puede acceder a `/admin` — redirige a `/auth/login`
- El formulario valida todos los campos antes de enviar
- Una actividad creada aparece inmediatamente en el mapa
- Los tests E2E pasan en la pipeline

---

## Sprint 8 — QA, accesibilidad y entrega (Semana 8)

**Objetivo:** La aplicación cumple WCAG 2.1 AA, la documentación está completa
y el proyecto puede evaluarse y presentarse.

### Tareas

| ID | Tarea | Responsable | Estimación | Estado |
|----|-------|-------------|------------|--------|
| S8-01 | Auditoría de accesibilidad con Lighthouse | - | 3h | ⬜ |
| S8-02 | Contraste de colores WCAG AA en todos los estados | - | 2h | ⬜ |
| S8-03 | Navegación por teclado y foco visible en todos los componentes | - | 2h | ⬜ |
| S8-04 | ARIA labels en marcadores del mapa y panel de detalle | - | 1h | ⬜ |
| S8-05 | Revisión final de la documentación técnica | - | 3h | ⬜ |
| S8-06 | README.md con instrucciones de arranque | - | 2h | ⬜ |
| S8-07 | Memoria del proyecto (plantilla) | - | 4h | ⬜ |
| S8-08 | Demo grabada del flujo completo | - | 2h | ⬜ |
| S8-09 | Revisión de cobertura de tests — alcanzar umbrales | - | 2h | ⬜ |
| S8-10 | Pipeline verde en rama `main` | - | 1h | ⬜ |

### Criterio de aceptación del sprint
- Lighthouse Accessibility ≥ 90
- Cobertura Jest ≥ 70 % · Cobertura Karma ≥ 70 %
- Todos los tests E2E Playwright pasan
- README permite arrancar el proyecto desde cero en < 10 min

---

## Resumen de hitos

| Hito | Semana | Descripción |
|------|--------|-------------|
| 🏗️ M1 | Fin S1 | Entorno Docker funcional |
| 🔌 M2 | Fin S2 | API de lectura completa |
| 🔐 M3 | Fin S3 | Autenticación JWT funcional |
| ✅ M4 | Fin S4 | API CRUD completa + seed |
| 🗺️ M5 | Fin S5 | Mapa con marcadores funcionando |
| 🔍 M6 | Fin S6 | Filtros y búsqueda |
| 🛠️ M7 | Fin S7 | Panel admin + E2E |
| 🎓 M8 | Fin S8 | **Entrega final** |

---

## Gestión del trabajo

**Herramienta:** GitHub Projects (tablero Kanban)
**Columnas:** Backlog → En progreso → En revisión → Hecho
**Reuniones:** Daily de 10 min · Revisión semanal viernes

**Convenciones de ramas:**
```
feature/S2-01-modelo-activity
fix/S5-03-marcadores-posicion
docs/S8-06-readme
```

**Definition of Done (DoD):**
- Código en inglés, comentarios en español
- Tests unitarios escritos y pasando
- Pipeline verde antes de mergear a `develop`
