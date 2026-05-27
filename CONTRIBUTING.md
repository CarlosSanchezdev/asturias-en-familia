# Guía de Contribución — Asturias en Familia

---

## Flujo de trabajo con Git

Seguimos **GitHub Flow** simplificado:

```
main ──────────────────────────────────── producción (estable)
  └── develop ────────────────────────── integración continua
        ├── feature/S2-01-modelo-activity
        ├── feature/S5-03-marcadores-mapa
        └── fix/S6-02-filtro-zona-bug
```

### Ramas protegidas

| Rama | Requisitos para merge |
|------|-----------------------|
| `main` | Pipeline verde + 2 revisiones |
| `develop` | Pipeline verde + 1 revisión |

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

| Prefijo | Cuándo usar |
|---------|------------|
| `feature/` | Nueva funcionalidad |
| `fix/` | Corrección de bug |
| `docs/` | Solo documentación |
| `test/` | Solo tests |
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

| Tipo | Descripción |
|------|-------------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `test` | Tests (añadir/corregir) |
| `docs` | Documentación |
| `refactor` | Refactorización |
| `chore` | Tareas de mantenimiento (deps, config) |
| `style` | Formato de código (sin cambios lógicos) |
| `perf` | Optimización de rendimiento |

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

Si prefieres no usar Docker para el backend durante el desarrollo:

```bash
# MongoDB debe estar corriendo (Docker o instalación local)

# Backend
cd backend
npm install
cp ../.env.example .env    # ajustar MONGODB_URI a localhost
npm run dev                # node --watch, hot reload

# Frontend (en otra terminal)
cd frontend
npm install
npm start                  # ng serve con proxy al backend
```

---

## Ejecutar tests

```bash
# Tests unitarios backend (Jest)
cd backend && npm test

# Tests con cobertura
cd backend && npm test -- --coverage

# Tests unitarios frontend (Jasmine/Karma)
cd frontend && npm test

# Tests E2E (Playwright) — requiere los tres servicios levantados
cd e2e && npx playwright test

# Ver informe E2E
cd e2e && npx playwright show-report
```

---

## Definition of Done (DoD)

Una tarea está **terminada** cuando:

1. ✅ El código está en una rama con nombre correcto
2. ✅ Los commits siguen Conventional Commits
3. ✅ Los tests unitarios del código nuevo están escritos y pasan
4. ✅ La cobertura global no ha bajado
5. ✅ El PR está revisado y aprobado por al menos 1 compañero
6. ✅ La pipeline de CI está verde
7. ✅ La documentación relevante está actualizada
8. ✅ Merged a `develop`
