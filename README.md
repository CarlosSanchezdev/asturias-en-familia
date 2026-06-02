# Asturias en Familia 🗺️

Mapa interactivo de actividades familiares en Asturias.

**Proyecto Intermodular II · DAW · CIFP Avilés · Curso 2025-2026**

---

## Arrancar el proyecto en local (< 10 minutos)

### Prerrequisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ≥ 24
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) ≥ 20 (solo para tests y desarrollo frontend fuera de Docker)

### 1 — Clonar el repositorio

```bash
git clone https://github.com/CarlosSanchezdev/asturias-en-familia.git
cd asturias-en-familia
```

### 2 — Configurar variables de entorno

```bash
cp .env.example .env
# No es necesario modificar nada para desarrollo local
```

### 3 — Arrancar con Docker Compose

```bash
docker-compose up --build
```

La primera vez tarda ~3-5 minutos. Las siguientes arrancadas son casi instantáneas.

### 4 — Verificar que todo funciona

| Servicio           | URL                          | Estado esperado                         |
| ------------------ | ---------------------------- | --------------------------------------- |
| Frontend (Angular) | http://localhost:4200        | Mapa de Asturias visible                |
| Backend (API)      | http://localhost:3000/health | `{ "status": "ok", "db": "connected" }` |
| MongoDB            | localhost:27018              | Conectado desde el backend              |

---

## Ejecutar tests

### Tests unitarios backend (Jest)

> ⚠️ Requiere Docker corriendo (MongoDB en puerto 27018)

```bash
cd backend
npm install
npm test
```

Cobertura: Statements ≥ 75% · Functions ≥ 80% · Lines ≥ 80%

### Tests unitarios frontend (Jasmine/Karma)

```bash
cd frontend
npm install
npm test
```

Cobertura: Statements ≥ 96% · Branches ≥ 81% · Functions ≥ 96%

### Tests E2E (Playwright)

> ⚠️ Requiere frontend en http://localhost:4200 y backend en http://localhost:3000

```bash
# Terminal 1 — backend + MongoDB
docker-compose up mongodb backend

# Terminal 2 — frontend
cd frontend && ng serve

# Terminal 3 — tests E2E
npx playwright test

# Ver informe visual
npx playwright show-report
```

---

## Comandos útiles

```bash
# Arrancar todo
docker-compose up

# Arrancar en segundo plano
docker-compose up -d

# Ver logs del backend
docker-compose logs -f backend

# Parar todos los servicios
docker-compose down

# Parar y borrar volúmenes (borra la BD — cuidado)
docker-compose down -v

# Reconstruir una imagen específica
docker-compose build backend

# Abrir shell en el contenedor del backend
docker-compose exec backend sh
```

---

## Seed de datos de desarrollo

### Categorías

Las 6 categorías (Rutas, Acuario, Caballos, Museos, Parques, Playas) se insertan automáticamente al arrancar Docker por
primera vez mediante `backend/scripts/mongo-init.js`.

### Actividades de ejemplo

```bash
# Con Docker levantado
docker exec -it aef-backend node scripts/seed-activities.js
```

> ⚠️ Ejecutar solo una vez. Para limpiar: `docker-compose down -v`

### Verificar datos cargados

```bash
curl http://localhost:3000/api/categories  # debe devolver 6
curl http://localhost:3000/api/activities  # debe devolver 10 tras el seed
```

---

## Usuario administrador por defecto

| Campo      | Valor                     |
| ---------- | ------------------------- |
| Email      | admin@asturias-familia.es |
| Contraseña | Admin1234                 |
| Rol        | admin                     |

> ⚠️ Cambia la contraseña en producción

---

## Conectar MongoDB Compass

```
mongodb://localhost:27018
```

> El proyecto usa el puerto 27018 para evitar conflictos con MongoDB local (27017).

---

## Estructura del proyecto

```
asturias-en-familia/
├── frontend/              # Angular 17 SPA
│   ├── src/app/
│   │   ├── core/          # Servicios singleton, interceptors, guards
│   │   ├── shared/        # Componentes reutilizables
│   │   └── features/      # map, admin, auth (lazy loaded)
│   └── coverage/          # Informe de cobertura Karma
├── backend/               # Node.js 20 + Express 5 API REST
│   ├── src/
│   │   ├── models/        # Mongoose: Activity, Category, User
│   │   ├── routes/        # activities, categories, auth, uploads
│   │   └── middleware/    # auth, errorHandler, upload
│   ├── tests/             # Jest: activities, auth, categories, uploads
│   └── coverage/          # Informe de cobertura Jest
├── tests/                 # Playwright E2E
│   ├── admin-flow.spec.ts
│   └── map-filters.spec.ts
├── docs/                  # Documentación técnica
│   ├── ARQUITECTURA.md
│   ├── LOGICA-NEGOCIO.md
│   ├── MODELO-DATOS.md
│   ├── PLAN-IMPLEMENTACION.md
│   ├── DISENO-UI-UX.md
│   ├── api/
│   │   └── openapi.yaml   # Contrato API (Swagger)
│   ├── testing/
│   │   └── CASOS-DE-USO.md
│   └── adr/
│       └── ADR.md         # Decisiones de arquitectura
├── docker-compose.yml
├── playwright.config.ts
└── .env.example
```

---

## Documentación

| Documento                                             | Descripción                                          |
| ----------------------------------------------------- | ---------------------------------------------------- |
| [Arquitectura](docs/ARQUITECTURA.md)                  | Diagrama de componentes, flujos, decisiones técnicas |
| [Lógica de negocio](docs/LOGICA-NEGOCIO.md)           | Reglas de validación, roles, soft-delete, mapa       |
| [Modelo de datos](docs/MODELO-DATOS.md)               | Colecciones, índices, validaciones                   |
| [Plan de implementación](docs/PLAN-IMPLEMENTACION.md) | Sprints, tareas, hitos                               |
| [Diseño UI/UX](docs/DISENO-UI-UX.md)                  | Paleta, tipografía, componentes, accesibilidad       |
| [Contrato API](docs/api/openapi.yaml)                 | OpenAPI 3.0 — todos los endpoints                    |
| [Casos de uso](docs/testing/CASOS-DE-USO.md)          | CUs con criterios de aceptación y tests              |
| [ADR](docs/adr/ADR.md)                                | Decisiones de arquitectura                           |

Para ver el contrato API visualmente → [editor.swagger.io](https://editor.swagger.io)

---

## Tecnologías

| Capa          | Tecnología                            |
| ------------- | ------------------------------------- |
| Frontend      | Angular 17, TypeScript, SCSS, Signals |
| Backend       | Node.js 20, Express 5, Mongoose       |
| Base de datos | MongoDB 7 (índice 2dsphere)           |
| Mapa          | Leaflet 1.9 + SVG imageOverlay        |
| Testing       | Jest · Jasmine/Karma · Playwright     |
| CI/CD         | GitHub Actions                        |
| Contenedores  | Docker + Docker Compose               |

---

## Posibles ampliaciones futuras

- Despliegue en hosting público (Vercel + Railway + MongoDB Atlas)
- Integración con APIs de turismo del Principado de Asturias
- Sistema de valoraciones y comentarios de usuarios
- Navegación jerárquica del mapa por concejo
- Soporte multiidioma con Angular i18n

---

## Contribuir

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para el flujo de ramas, commits y pipeline de CI.

---

## Equipo

Proyecto desarrollado en el módulo Proyecto Intermodular II del ciclo DAW en el CIFP Avilés.
