# Arquitectura Técnica — Asturias en Familia

**Versión:** 1.0 · **Fecha:** 2025

---

## 1. Visión general

Asturias en Familia es una SPA (Single Page Application) con arquitectura
cliente-servidor clásica, desplegada en contenedores Docker. El usuario final
interactúa con un mapa SVG de Asturias sobre el que aparecen marcadores de
actividades familiares filtradas en tiempo real.

### Diagrama de componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAVEGADOR (cliente)                       │
│                                                                  │
│   ┌────────────────────────────────────────────────────────┐    │
│   │              Angular 17 SPA (puerto 4200)              │    │
│   │                                                        │    │
│   │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐   │    │
│   │  │  MapFeature  │  │ AdminFeature │  │ AuthFeature│   │    │
│   │  │  (lazy)      │  │ (lazy+guard) │  │ (lazy)     │   │    │
│   │  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘   │    │
│   │         │                 │                 │          │    │
│   │  ┌──────▼─────────────────▼─────────────────▼──────┐  │    │
│   │  │              Core (singleton)                    │  │    │
│   │  │  ActivitiesService · AuthService · MapProjection │  │    │
│   │  │  authInterceptor · authGuard                     │  │    │
│   │  └────────────────────────┬─────────────────────────┘  │    │
│   └───────────────────────────┼────────────────────────────┘    │
│                               │ HTTP (REST JSON)                 │
└───────────────────────────────┼─────────────────────────────────┘
                                │
        ┌───────────────────────▼──────────────────────┐
        │           NGINX (reverse proxy)               │
        │   /api/* → backend:3000                       │
        │   /*      → index.html (SPA fallback)         │
        └───────────────────────┬──────────────────────┘
                                │
        ┌───────────────────────▼──────────────────────┐
        │       Node.js 20 + Express 5 (puerto 3000)    │
        │                                               │
        │  Middleware global:                           │
        │    cors · morgan · express.json               │
        │    requireAuth · requireAdmin                 │
        │    handleValidationErrors · errorHandler      │
        │                                               │
        │  Routers:                                     │
        │    /api/activities  ←→  Activity (Mongoose)   │
        │    /api/categories  ←→  Category (Mongoose)   │
        │    /api/auth        ←→  User (Mongoose)       │
        └───────────────────────┬──────────────────────┘
                                │ Mongoose ODM
        ┌───────────────────────▼──────────────────────┐
        │            MongoDB 7 (puerto 27017)           │
        │                                               │
        │  Base de datos: asturias-familia              │
        │  Colecciones: activities · categories · users │
        │  Índices: 2dsphere (location) · text (name)   │
        └──────────────────────────────────────────────┘
```

---

## 2. Stack tecnológico

### Frontend
| Tecnología | Versión | Motivo de elección |
|------------|---------|-------------------|
| Angular | 17 | Criterio del módulo de DAW. Standalone components y signals son el enfoque moderno |
| TypeScript | 5.4 | Tipado estricto, mejor DX en equipos pequeños |
| RxJS | 7.8 | Gestión de streams HTTP; signals para estado local |
| SCSS | — | Variables, anidado, legibilidad frente a CSS puro |

### Backend
| Tecnología | Versión | Motivo de elección |
|------------|---------|-------------------|
| Node.js | 20 LTS | Misma plataforma que el frontend (TypeScript/JS), curva de aprendizaje menor |
| Express | 5 | Mínimo y explícito. Express 5 incluye manejo de errores async nativo |
| Mongoose | 8 | ODM maduro, validaciones declarativas, hooks pre/post |
| JWT (jsonwebtoken) | 9 | Autenticación stateless, compatible con microservicios futuros |
| bcryptjs | 2.4 | Hashing de contraseñas probado en producción |
| express-validator | 7 | Validación de entradas declarativa, integrada con Express |

### Base de datos
| Tecnología | Versión | Motivo de elección |
|------------|---------|-------------------|
| MongoDB | 7 | Esquema flexible para actividades con atributos heterogéneos. Índice 2dsphere para consultas geoespaciales |

### Infraestructura
| Tecnología | Versión | Motivo |
|------------|---------|--------|
| Docker | 24+ | Entorno reproducible, sin "en mi máquina funciona" |
| Docker Compose | 2+ | Orquestación local sencilla con healthchecks |
| Nginx | 1.27 | Proxy inverso + servidor de estáticos en producción |
| GitHub Actions | — | CI/CD gratuito, bien integrado con el repositorio |

---

## 3. Flujo de una petición típica

### GET /api/activities?zone=centro (usuario visitante)

```
Navegador
  → Angular ActivitiesService.loadActivities({ zone: 'centro' })
  → HttpClient GET /api/activities?zone=centro
  → [authInterceptor] no hay token, no añade cabecera
  → Nginx recibe en puerto 80
  → Nginx proxy_pass a backend:3000/api/activities?zone=centro
  → Express router GET /api/activities
  → [handleValidationErrors] zona válida ✓
  → Activity.find({ zone: 'centro', active: true })
       .populate('category')
       .sort({ createdAt: -1 })
       .skip(0).limit(20).lean()
  → MongoDB busca en colección activities con índice { zone: 1 }
  → Devuelve array de documentos
  → Express responde JSON { data: [...], pagination: {...} }
  → Angular actualiza signal activities()
  → Componente MapComponent re-renderiza marcadores (sin Change Detection manual)
```

### POST /api/activities (admin autenticado)

```
Admin rellena formulario → ActivityFormComponent.submit()
  → ActivitiesService.create(activityDto)
  → HttpClient POST /api/activities + body JSON
  → [authInterceptor] añade: Authorization: Bearer <jwt>
  → Nginx proxy_pass a backend:3000
  → Express router POST /api/activities
  → [requireAuth] verifica JWT → req.user = { id, email, role: 'admin' }
  → [requireAdmin] role === 'admin' ✓
  → [activityValidators] valida campos
  → [handleValidationErrors] sin errores ✓
  → Activity.create(req.body)
       → hook pre-save calcula mapLeft/mapTop desde coordinates
  → MongoDB inserta documento
  → Express responde 201 + actividad creada (con populate)
  → Frontend navega al mapa y recarga actividades
```

---

## 4. Sistema de posicionamiento SVG

El mapa SVG de Asturias tiene coordenadas propias (píxeles) que no corresponden
directamente a latitud/longitud. Se usa una **transformación lineal calibrada**
con ciudades de referencia conocidas.

### Fórmula de calibración

```
svgX = (lng - B_LNG) / A_LNG
svgY = (lat - B_LAT) / A_LAT

left% = (svgX / SVG_WIDTH)  * 100
top%  = (svgY / SVG_HEIGHT) * 100
```

### Constantes actuales

| Constante | Valor | Descripción |
|-----------|-------|-------------|
| `A_LNG` | 0.00358282 | Escala horizontal lng→px |
| `B_LNG` | -7.183398 | Offset horizontal |
| `A_LAT` | -0.00170741 | Escala vertical lat→px (negativa, eje Y invertido) |
| `B_LAT` | 43.781844 | Offset vertical |
| `SVG_W` | 777.74173 px | Ancho del SVG original (ArcGIS) |
| `SVG_H` | 413.26299 px | Alto del SVG original |

### Ciudades de referencia para calibrar

| Ciudad | Lat real | Lng real | left% esperado | top% esperado |
|--------|----------|----------|----------------|---------------|
| Oviedo | 43.3614 | -5.8593 | ~35.9 % | ~24.8 % |
| Gijón | 43.5454 | -5.6618 | ~41.0 % | ~14.1 % |
| Avilés | 43.5547 | -5.9249 | ~34.1 % | ~13.6 % |

> Si los marcadores no cuadran con la realidad, usar `posicionador-ciudades.html`
> para recalibrar visualmente y actualizar las constantes en `Activity.js` y
> `map-projection.service.ts`.

### Por qué se guarda en la BD

El cálculo se hace en el hook `pre-save` de Mongoose. Esto tiene dos ventajas:
1. El frontend no necesita recalcular — los valores llegan listos
2. Si se recalibra la transformación, se puede recalcular con un migration script
   sin tocar el frontend

---

## 5. Seguridad

### Autenticación JWT

- **Access token:** 15 min, firmado con `JWT_SECRET`, contiene `{ sub, email, role }`
- **Refresh token:** 7 días, permite renovar el access token
- El frontend guarda el access token en `sessionStorage` (no `localStorage`)
  para que expire al cerrar la pestaña
- Las rutas admin están protegidas en el backend (source of truth) y en el
  frontend (UX, no seguridad)

### Validación de entradas

Todo dato que entra al backend pasa por `express-validator` antes de llegar
al controlador. Si hay errores, se devuelve 400 antes de tocar la base de datos.

### Soft delete

Las actividades no se borran físicamente. `DELETE /api/activities/:id` pone
`active: false`. Esto permite auditoría y recuperación de datos.

### CORS

En desarrollo: `http://localhost:4200`
En producción: configurar `CORS_ORIGIN` con el dominio real.

---

## 6. Gestión de errores

```
Error en controlador
  → next(err) — Express 5 captura automáticamente errores en async
  → errorHandler middleware

errorHandler clasifica por tipo:
  ValidationError (Mongoose)  → 422 + lista de campos inválidos
  CastError (ObjectId malo)   → 400 "Identificador no válido"
  Código 11000 (duplicado)    → 409 "Ya existe con ese campo"
  Error genérico              → 500 (mensaje oculto en producción)
```

---

## 7. Estrategia de estado en el frontend

Se usan **signals de Angular 17** para el estado de la aplicación:

```typescript
// En ActivitiesService
readonly activities = signal<Activity[]>([]);
readonly selectedActivity = signal<Activity | null>(null);
readonly isLoading = signal(false);
readonly filters = signal<ActivitiesFilters>({});

// Computed derivado — se recalcula automáticamente
readonly filteredCount = computed(() => this.activities().length);
```

**Por qué signals y no NgRx:**
- El estado de esta app es simple (una lista + un elemento seleccionado + filtros)
- NgRx añadiría boilerplate innecesario para el MVP
- Los signals son la dirección oficial de Angular; NgRx queda para apps con
  estado muy complejo o colaboración entre muchos módulos

---

## 8. Estructura de módulos Angular

```
app/
├── core/                    ← Singleton (provideIn: 'root')
│   ├── services/
│   │   ├── activities.service.ts
│   │   ├── auth.service.ts
│   │   └── categories.service.ts
│   ├── interceptors/
│   │   └── auth.interceptor.ts
│   └── guards/
│       └── auth.guard.ts
├── shared/                  ← Componentes reutilizables sin lógica de negocio
│   └── components/
│       ├── loading-spinner/
│       └── error-message/
└── features/                ← Módulos cargados lazy
    ├── map/                 ← Ruta raíz '/'
    ├── admin/               ← Ruta '/admin' (protegida)
    └── auth/                ← Rutas '/auth/login', '/auth/register'
```

**Regla de dependencias:**
- `features` puede usar `core` y `shared`
- `core` NO puede usar `features`
- `shared` NO puede usar `core` ni `features`
- Los features NO se importan entre sí (comunicación vía servicios de `core`)
