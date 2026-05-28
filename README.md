# Asturias en Familia 🗺️

Mapa interactivo de actividades familiares en Asturias.

**Proyecto Intermodular II · DAW · CIFP Avilés · Curso 2025-2026**

---

## Arrancar el proyecto en local (< 10 minutos)

### Prerrequisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ≥ 24
- [Git](https://git-scm.com/)

### 1 — Clonar el repositorio

```bash
git clone https://github.com/CarlosSanchezdev/asturias-en-familia.git
cd asturias-en-familia
```

### 2 — Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env si se quiere cambiar algún valor (no es necesario para desarrollo)
```

### 3 — Arrancar con Docker Compose

```bash
docker-compose up --build
```

La primera vez tarda ~3-5 minutos (descarga imágenes + instala dependencias). Las siguientes arrancadas son casi
instantáneas.

### 4 — Verificar que todo funciona

| Servicio           | URL                          | Estado esperado                         |
| ------------------ | ---------------------------- | --------------------------------------- |
| Frontend (Angular) | http://localhost:4200        | Mapa de Asturias visible                |
| Backend (API)      | http://localhost:3000/health | `{ "status": "ok", "db": "connected" }` |
| MongoDB            | localhost:27018              | Conectado desde el backend              |

---

## Comandos útiles

```bash
# Arrancar todo
docker-compose up

# Arrancar en segundo plano
docker-compose up -d

# Ver logs del backend en tiempo real
docker-compose logs -f backend

# Ver logs del frontend
docker-compose logs -f frontend

# Parar todos los servicios
docker-compose down

# Parar y borrar volúmenes (borra la BD — cuidado)
docker-compose down -v

# Reconstruir una imagen específica
docker-compose build backend

# Ejecutar tests del backend dentro del contenedor
docker-compose exec backend npm test

# Abrir una shell en el contenedor del backend
docker-compose exec backend sh
```

## Seed de datos de desarrollo

### Categorías

Las 6 categorías se insertan automáticamente al arrancar Docker por primera vez mediante el script
`backend/scripts/mongo-init.js`.

### Actividades de ejemplo

Para insertar las 10 actividades de ejemplo ejecuta (con Docker levantado):

```bash
docker exec -it aef-backend node scripts/seed-activities.js
```

> ⚠️ Ejecutar solo una vez. Si se ejecuta dos veces se duplican los registros. Para limpiar: `docker-compose down -v` y
> volver a levantar.

### Verificar que los datos están cargados

```bash
# Categorías (debe devolver 6)
curl http://localhost:3000/api/categories

# Actividades (debe devolver 10 tras el seed)
curl http://localhost:3000/api/activities
```

---

## Usuario administrador por defecto

Al arrancar por primera vez se crea automáticamente un usuario admin:

| Campo | Valor |
|---|---|
| Email | admin@asturias-familia.es |
| Contraseña | Admin1234 |
| Rol | admin |

> ⚠️ Cambia la contraseña en producción modificando el hash en backend/scripts/mongo-init.js

Para cambiar el rol de un usuario existente desde MongoDB:
```bash
docker exec -it aef-mongodb mongosh asturias-familia --eval "db.users.updateOne({ email: 'tu@email.com' }, { \$set: { role: 'admin' } })"
```

---

## Conectar MongoDB Compass al proyecto

La instancia de Docker usa el puerto 27018 para evitar conflictos con MongoDB local.
Usa esta URI en Compass:

```
mongodb://localhost:27018
```

> ℹ️ Si tienes MongoDB instalado localmente en Windows ocupa el puerto 27017.
> El proyecto usa el 27018 para que ambos puedan coexistir.

---

## Estructura del proyecto

```
asturias-en-familia/
├── frontend/          # Angular 17 SPA
├── backend/           # Node.js 20 + Express 5 API REST
├── e2e/               # Tests Playwright
├── docs/              # Documentación técnica
│   ├── PLAN-IMPLEMENTACION.md
│   ├── LOGICA-NEGOCIO.md
│   ├── architecture/
│   │   └── ARQUITECTURA.md
│   ├── api/
│   │   └── openapi.yaml        # Contrato API (Swagger)
│   ├── testing/
│   │   └── CASOS-DE-USO.md
│   └── adr/
│       └── ADR.md              # Decisiones de arquitectura
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
```

---

## Documentación

| Documento                                             | Descripción                                          |
| ----------------------------------------------------- | ---------------------------------------------------- |
| [Arquitectura](docs/architecture/ARQUITECTURA.md)     | Diagrama de componentes, flujos, decisiones técnicas |
| [Lógica de negocio](docs/LOGICA-NEGOCIO.md)           | Reglas de validación, roles, soft-delete, mapa       |
| [Plan de implementación](docs/PLAN-IMPLEMENTACION.md) | Sprints, tareas, hitos de entrega                    |
| [Contrato API](docs/api/openapi.yaml)                 | OpenAPI 3.0 — todos los endpoints documentados       |
| [Casos de uso](docs/testing/CASOS-DE-USO.md)          | CUs con criterios de aceptación y tests asociados    |
| [ADR](docs/adr/ADR.md)                                | Por qué elegimos cada tecnología                     |

Para ver el contrato API de forma visual, pega el contenido de `openapi.yaml` en
[editor.swagger.io](https://editor.swagger.io).

---

## Tecnologías

| Capa          | Tecnología                            |
| ------------- | ------------------------------------- |
| Frontend      | Angular 17, TypeScript, SCSS, Signals |
| Backend       | Node.js 20, Express 5, Mongoose       |
| Base de datos | MongoDB 7 (índice 2dsphere)           |
| Mapa          | Leaflet 1.9 + SVG imageOverlay        | Zoom nativo, coordenadas geográficas reales |
| Testing       | Jest, Jasmine/Karma, Playwright       |
| CI/CD         | GitHub Actions                        |
| Contenedores  | Docker + Docker Compose               |

---

## Posibles ampliaciones futuras

- Separación del detalle de actividad en colección independiente `ActivityDetail`
  para optimizar la carga del mapa (solo datos mínimos) y permitir contenido
  enriquecido (galería de fotos, horarios, tarifas detalladas) sin afectar
  al rendimiento del listado principal.
- Navegación jerárquica del mapa a 3 niveles (Asturias → Zona → Concejo)
  requiere añadir IDs por municipio al SVG actual. El SVG disponible (ArcGIS)
  no tiene paths identificados por concejo. Implementación futura cuando se
  disponga de un SVG con esa estructura.

---

## Contribuir

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para el flujo de ramas, commits y cómo pasar la pipeline de CI antes de hacer un
PR.

---

## Equipo

Proyecto desarrollado en el módulo Proyecto del ciclo DAW en el Cifp Aviles.
