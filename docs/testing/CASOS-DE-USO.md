# Casos de Uso y Criterios de Aceptación — Asturias en Familia

Cada caso de uso incluye: actores, precondiciones, flujo principal, flujos alternativos, postcondiciones y el test
asociado.

---

## Actores del sistema

| Actor         | Descripción                                             |
| ------------- | ------------------------------------------------------- |
| **Visitante** | Usuario sin sesión iniciada. Puede explorar el mapa     |
| **Admin**     | Usuario autenticado con rol `admin`. Gestiona contenido |
| **Sistema**   | El propio backend (procesos automáticos)                |

---

## CU-01 — Ver mapa de actividades

**Actor:** Visitante **Precondición:** Hay al menos una actividad activa en la BD

### Flujo principal

1. El visitante abre la URL raíz (`/`)
2. El sistema carga todas las actividades activas
3. El sistema renderiza el mapa SVG de Asturias
4. El sistema posiciona un marcador por cada actividad en sus coordenadas
5. El visitante ve el mapa con los marcadores

### Flujo alternativo A — Sin actividades

- En el paso 2, si no hay actividades, el mapa se muestra vacío con el mensaje "No hay actividades disponibles todavía"

### Postcondición

- El mapa está visible con todos los marcadores posicionados

### Tests asociados

- `[Jasmine]` `MapComponent` renderiza marcadores cuando hay actividades
- `[Jasmine]` `MapComponent` muestra mensaje vacío cuando no hay datos
- `[Playwright]` E2E: navegar a `/` → el mapa está visible

---

## CU-02 — Filtrar actividades por zona

**Actor:** Visitante **Precondición:** Hay actividades de distintas zonas en la BD

### Flujo principal

1. El visitante pulsa en el filtro "Centro"
2. El sistema actualiza la URL: `/?zone=centro`
3. El sistema oculta los marcadores que no son de la zona centro
4. El sistema muestra el contador: "X actividades"

### Flujo alternativo A — Sin resultados

- Si no hay actividades en la zona seleccionada, el mapa muestra el estado vacío y el contador indica "0 actividades"

### Flujo alternativo B — Quitar filtro

- El visitante vuelve a pulsar el filtro activo → se desactiva
- Se muestran todas las actividades

### Postcondición

- Solo los marcadores de la zona seleccionada son visibles
- La URL refleja el filtro activo (deep-linking)

### Tests asociados

- `[Jasmine]` `FilterPanelComponent` emite el filtro al hacer clic
- `[Jasmine]` `ActivitiesService` filtra correctamente el signal
- `[Playwright]` E2E: clic en "Oriente" → solo marcadores de oriente visibles

---

## CU-03 — Ver detalle de una actividad

**Actor:** Visitante **Precondición:** Hay al menos una actividad visible en el mapa

### Flujo principal

1. El visitante hace clic en un marcador del mapa
2. El sistema carga el detalle de la actividad (`GET /api/activities/:id`)
3. En móvil: aparece un panel deslizante desde abajo En escritorio: aparece un panel lateral derecho
4. El panel muestra: nombre, descripción, categoría, precio, accesibilidad, idiomas e imágenes
5. El visitante pulsa "Cerrar" o hace clic fuera del panel
6. El panel se cierra y vuelve al mapa completo

### Flujo alternativo A — Error de red

- Si la petición falla, el panel muestra un mensaje de error con opción de "Reintentar"

### Postcondición

- El panel está cerrado y el mapa visible al completo

### Tests asociados

- `[Jasmine]` `ActivityDetailComponent` renderiza los campos correctamente
- `[Jasmine]` `ActivityDetailComponent` muestra error si la API falla
- `[Playwright]` E2E: clic marcador → panel visible → cerrar → panel oculto

---

## CU-04 — Buscar actividades por texto

**Actor:** Visitante

### Flujo principal

1. El visitante escribe "senderismo" en el campo de búsqueda
2. El sistema espera 300 ms sin más cambios (debounce)
3. El sistema llama a `GET /api/activities?search=senderismo`
4. Los marcadores se actualizan para mostrar solo los resultados

### Flujo alternativo A — Sin resultados

- El mapa muestra el estado vacío

### Flujo alternativo B — Búsqueda borrada

- El visitante borra el texto → vuelven todos los marcadores

### Criterio de aceptación

- La búsqueda NO se lanza si el texto tiene menos de 2 caracteres
- La búsqueda es insensible a mayúsculas/minúsculas

### Tests asociados

- `[Jasmine]` Debounce de 300 ms en el campo de búsqueda
- `[Jasmine]` No se busca con texto de 1 carácter

---

## CU-05 — Login de administrador

**Actor:** Admin (usuario con rol admin en la BD)

### Flujo principal

1. El admin navega a `/auth/login`
2. Introduce email y contraseña correctos
3. El sistema valida las credenciales (`POST /api/auth/login`)
4. El sistema guarda el access token en `sessionStorage`
5. El sistema redirige a `/admin`

### Flujo alternativo A — Credenciales incorrectas

- El sistema muestra: "Credenciales inválidas"
- El formulario permanece en `/auth/login`
- El campo de contraseña se vacía

### Flujo alternativo B — Usuario visitante

- Las credenciales son válidas pero el rol es `visitor`
- La API devuelve el token normalmente
- Al acceder a `/admin`, el guard detecta que no es admin
- Redirige a `/` con mensaje "Acceso restringido"

### Postcondición

- El admin está autenticado y ve el panel de administración

### Tests asociados

- `[Jasmine]` `AuthService.login()` guarda el token en `sessionStorage`
- `[Jest]` `POST /api/auth/login` con credenciales correctas → 200 + tokens
- `[Jest]` `POST /api/auth/login` con contraseña errónea → 401
- `[Playwright]` E2E: flujo completo login → panel admin visible

---

## CU-06 — Crear actividad (admin)

**Actor:** Admin autenticado **Precondición:** El admin ha iniciado sesión; existe al menos una categoría

### Flujo principal

1. El admin navega a `/admin/actividades/nueva`
2. Rellena el formulario: nombre, descripción, categoría, zona, coordenadas, precio, accesibilidad, idiomas
3. Selecciona la ubicación haciendo clic en el mapa del formulario
4. Pulsa "Guardar"
5. El sistema valida los campos en el cliente
6. El sistema envía `POST /api/activities` con JWT en cabecera
7. El backend valida, calcula `mapLeft`/`mapTop` y guarda en MongoDB
8. El sistema redirige al mapa y recarga las actividades
9. El nuevo marcador aparece en el mapa

### Flujo alternativo A — Validación en cliente falla

- El formulario muestra los errores bajo cada campo
- No se envía la petición al backend

### Flujo alternativo B — Error del servidor

- El sistema muestra el mensaje de error recibido del backend
- El admin puede corregir y reintentar

### Flujo alternativo C — Token expirado

- El backend responde 401
- El sistema llama a refresh, obtiene nuevo token, reintenta la petición

### Postcondición

- La actividad existe en MongoDB con `active: true`
- El marcador aparece en el mapa en la posición correcta

### Tests asociados

- `[Jasmine]` `ActivityFormComponent` valida campos antes de enviar
- `[Jasmine]` `ActivityFormComponent` no envía formulario con datos inválidos
- `[Jest]` `POST /api/activities` sin token → 401
- `[Jest]` `POST /api/activities` con token visitante → 403
- `[Jest]` `POST /api/activities` con token admin y datos válidos → 201
- `[Jest]` `POST /api/activities` con coordenadas fuera de Asturias → 400
- `[Jest]` Hook pre-save calcula `mapLeft`/`mapTop` correctamente
- `[Playwright]` E2E: login → crear actividad → marcador visible en mapa

---

## CU-07 — Editar actividad (admin)

**Actor:** Admin autenticado

### Flujo principal

1. El admin va a `/admin/actividades`
2. Selecciona una actividad de la lista
3. El sistema carga el formulario con los datos actuales
4. El admin modifica los campos deseados
5. Pulsa "Guardar"
6. El sistema envía `PUT /api/activities/:id`
7. La actividad se actualiza en la BD y en el mapa

### Tests asociados

- `[Jest]` `PUT /api/activities/:id` con token admin → 200 + actividad actualizada
- `[Jest]` `PUT /api/activities/:id` con ID inválido → 400
- `[Jest]` `PUT /api/activities/:id` con ID inexistente → 404

---

## CU-08 — Desactivar actividad (admin)

**Actor:** Admin autenticado

### Flujo principal

1. El admin en el listado hace clic en "Desactivar" sobre una actividad
2. Aparece un diálogo de confirmación: "¿Seguro que quieres desactivar esta actividad?"
3. El admin confirma
4. El sistema envía `DELETE /api/activities/:id`
5. El backend pone `active: false` (soft delete)
6. La actividad desaparece del mapa público
7. En el panel admin, la actividad aparece como "Inactiva"

### Flujo alternativo A — Cancelar

- El admin pulsa "Cancelar" en el diálogo → no se hace nada

### Tests asociados

- `[Jest]` `DELETE /api/activities/:id` → 200 + `{ active: false }` en BD
- `[Jest]` La actividad con `active: false` no aparece en `GET /api/activities`
- `[Playwright]` E2E: desactivar actividad → desaparece del mapa público

---

## CU-09 — Acceso no autorizado a panel admin

**Actor:** Visitante (sin sesión o con rol visitor)

### Flujo principal

1. El visitante navega a `/admin` directamente (URL manual)
2. El `authGuard` detecta que no hay sesión válida o el rol no es admin
3. El sistema redirige a `/auth/login`
4. Si inicia sesión como `visitor`, al intentar acceder a `/admin` lo redirige a `/` con aviso

### Tests asociados

- `[Jasmine]` `authGuard` redirige si no hay token
- `[Jasmine]` `authGuard` redirige si el rol no es admin
- `[Playwright]` E2E: navegar a `/admin` sin sesión → redirige a login

---

## Matriz de cobertura de tests

| CU                         | Jasmine/Karma | Jest | Playwright |
| -------------------------- | :-----------: | :--: | :--------: |
| CU-01 Ver mapa             |      ✅       |  —   |     ✅     |
| CU-02 Filtrar zona         |      ✅       |  —   |     ✅     |
| CU-03 Ver detalle          |      ✅       |  ✅  |     ✅     |
| CU-04 Buscar texto         |      ✅       |  ✅  |     —      |
| CU-05 Login                |      ✅       |  ✅  |     ✅     |
| CU-06 Crear actividad      |      ✅       |  ✅  |     ✅     |
| CU-07 Editar actividad     |       —       |  ✅  |     —      |
| CU-08 Desactivar           |       —       |  ✅  |     ✅     |
| CU-09 Acceso no autorizado |      ✅       |  ✅  |     ✅     |
| CU-10 Registro             |       —       |  ✅  |     —      |
