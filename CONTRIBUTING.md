### Ramas protegidas

| Rama      | Requisitos para merge         |
| --------- | ----------------------------- |
| `main`    | Pipeline verde + 2 revisiones |
| `develop` | Pipeline verde + 1 revisión   |

**Nunca** hacer push directo a `main` o `develop`.

---

## Crear una rama

```bash
# Siempre desde develop actualizado
git checkout develop
git pull origin develop

# Nombre: tipo/ID-descripcion-corta
git checkout -b feature/S2-01-modelo-activity
```

### Tipos de rama

| Prefijo     | Cuándo usar                                  |
| ----------- | -------------------------------------------- |
| `feature/`  | Nueva funcionalidad                          |
| `fix/`      | Corrección de bug                            |
| `docs/`     | Solo documentación                           |
| `test/`     | Solo tests                                   |
| `refactor/` | Refactorización sin cambio de comportamiento |

---

## Commits: Conventional Commits

Formato: `tipo(ámbito): descripción breve en minúsculas`

```bash
feat(backend): añadir endpoint GET /api/activities con filtros
fix(frontend): corregir posición de marcadores en Safari
test(backend): añadir tests de autenticación JWT
docs(api): actualizar openapi.yaml con endpoint refresh
refactor(map): extraer MapProjectionService del componente
chore(docker): actualizar imagen nginx a 1.27-alpine
```

### Tipos permitidos

| Tipo       | Descripción                             |
| ---------- | --------------------------------------- |
| `feat`     | Nueva funcionalidad                     |
| `fix`      | Corrección de bug                       |
| `test`     | Tests (añadir/corregir)                 |
| `docs`     | Documentación                           |
| `refactor` | Refactorización                         |
| `chore`    | Tareas de mantenimiento (deps, config)  |
| `style`    | Formato de código (sin cambios lógicos) |
| `perf`     | Optimización de rendimiento             |

---

## Pull Request

1. **Título:** seguir el mismo formato que los commits
2. **Descripción:** qué hace, por qué, cómo probarlo
3. **Enlazar tarea:** mencionar el ID del sprint (ej. `Cierra S2-01`)
4. **Capturas de pantalla** si hay cambios visuales
5. **Self-review** antes de pedir revisión a otros

### Checklist antes de abrir el PR

- [ ] El código sigue las convenciones del proyecto (TypeScript estricto, nombres en inglés)
- [ ] Los tests existentes pasan: `npm test`
- [ ] Se han añadido tests para el código nuevo
- [ ] La pipeline de CI está verde
- [ ] La documentación se ha actualizado si corresponde

---

## Desarrollo local sin Docker

Si prefieres arrancar el frontend fuera de Docker:

```bash
# Terminal 1 — backend + MongoDB con Docker
docker-compose up mongodb backend

# Terminal 2 — frontend fuera de Docker
cd frontend
npm install
npm start   # ng serve con proxy al backend en localhost:3000
```

Para arrancar el backend también fuera de Docker:

```bash
cd backend
npm install
cp ../.env.example .env   # ajustar MONGODB_URI a localhost:27018
npm run dev               # node --watch, hot reload
```

---

## Ejecutar tests

```bash
# Tests unitarios backend (Jest)
cd backend && npm test

# Tests unitarios frontend (Jasmine/Karma)
cd frontend && npm test

# Tests E2E (Playwright)
# Requiere frontend en :4200 y backend en :3000
npx playwright test

# Ver informe E2E
npx playwright show-report
```

---

## Definition of Done (DoD)

Una tarea está **terminada** cuando:

1. ✅ El código está en una rama con nombre correcto
2. ✅ Los commits siguen Conventional Commits
3. ✅ Los tests unitarios del código nuevo están escritos y pasan
4. ✅ La cobertura global no ha bajado
5. ✅ La pipeline de CI está verde
6. ✅ La documentación relevante está actualizada
7. ✅ Merged a `develop`

---

## Equipo

Proyecto desarrollado en el módulo Proyecto del ciclo DAW en el CIFP Avilés.
