# Lógica de Negocio — Asturias en Familia

Este documento recoge las reglas de negocio del sistema: aquellas decisiones
que van más allá de la infraestructura técnica y definen el comportamiento
esperado de la aplicación.

---

## 1. Actividades

### 1.1 Creación

**Reglas:**
- Solo usuarios con rol `admin` pueden crear actividades.
- El `name` es obligatorio y no puede superar 100 caracteres.
- Las coordenadas deben estar dentro del rango de Asturias:
  - Longitud: entre -9 y 0 (oeste a este)
  - Latitud: entre 43 y 44 (sur a norte)
- La `zone` (oriente / centro / occidente) es obligatoria y no se calcula
  automáticamente desde las coordenadas — el admin la asigna manualmente.
  Esto permite correcciones editoriales cuando una actividad está en el límite
  entre zonas.
- El `price` es 0 por defecto (gratuita).
- El campo `languages` incluye `['es']` por defecto.

**Efecto secundario automático:**
Al guardar una actividad (insert o update de `location`), el hook `pre-save`
de Mongoose calcula `mapLeft` y `mapTop` a partir de las coordenadas usando
la transformación lineal calibrada. Estos valores se guardan en la BD.

### 1.2 Edición

- Solo admins pueden editar actividades.
- Si se actualiza `location.coordinates`, se recalculan `mapLeft` y `mapTop`.
- Los campos `createdAt` y `updatedAt` son gestionados por Mongoose
  (`timestamps: true`); el cliente no puede escribirlos.

### 1.3 Eliminación (Soft Delete)

Las actividades **nunca se eliminan físicamente** de la base de datos.
`DELETE /api/activities/:id` pone `active: false`.

**Motivo:** Preservar la integridad histórica y permitir recuperación.

**Consecuencia:** Todas las queries públicas incluyen el filtro `{ active: true }`.
Las queries del panel admin pueden omitirlo para ver actividades desactivadas.

### 1.4 Visibilidad pública

Un visitante (sin sesión) puede:
- Ver todas las actividades activas
- Filtrar por zona, categoría, accesibilidad y precio
- Buscar por texto en nombre y descripción
- Ver el detalle completo de una actividad

Un visitante NO puede:
- Crear, editar ni eliminar actividades
- Ver actividades con `active: false`

---

## 2. Categorías

### 2.1 Categorías del MVP

Las 6 categorías iniciales se insertan con el script `mongo-init.js` y son:
Rutas, Acuario, Caballos, Museos, Parques, Playas.

### 2.2 Gestión

- Solo admins pueden crear o editar categorías.
- El `slug` debe ser único, en minúsculas, solo letras/números/guiones.
- El `color` debe ser un hexadecimal válido `#RRGGBB`.
- El campo `order` determina el orden de presentación en los filtros.
- Las categorías también tienen `active`. Desactivar una categoría
  **no desactiva** las actividades asociadas — solo desaparece del filtro.

### 2.3 Relación con actividades

- Cada actividad tiene exactamente una categoría (campo obligatorio).
- Al devolver actividades, la categoría se resuelve con `populate`
  (nombre, slug, icono y color) para que el frontend no necesite
  hacer una segunda petición.

---

## 3. Autenticación y autorización

### 3.1 Registro

- El email debe ser único y válido.
- La contraseña debe cumplir: mínimo 8 caracteres, al menos 1 mayúscula
  y al menos 1 número.
- La contraseña se hashea con bcrypt (12 rondas) antes de guardar.
- El campo `passwordHash` tiene `select: false` en Mongoose: no se devuelve
  en ninguna query a menos que se pida explícitamente con `.select('+passwordHash')`.
- El rol por defecto es `visitor`. No hay endpoint para asignarse rol `admin`
  desde el registro — ese cambio se hace directamente en la BD o desde un
  script de administración.

### 3.2 Login

- Si el email no existe o la contraseña es incorrecta, se devuelve el mismo
  error genérico ("Credenciales inválidas") para evitar user enumeration.
- En login correcto se actualiza `lastLogin`.
- Se devuelven dos tokens:
  - **Access token** (15 min): enviado en `Authorization: Bearer`
  - **Refresh token** (7 días): usado para obtener un nuevo access token

### 3.3 Tokens

- El frontend guarda el access token en `sessionStorage` (se borra al cerrar
  la pestaña). No se usa `localStorage` para reducir el riesgo de XSS persistente.
- El `authInterceptor` inyecta automáticamente el access token en todas
  las peticiones salientes al backend.
- Si el access token expira (respuesta 401 con "Token expirado"), el frontend
  debe llamar a `POST /api/auth/refresh` con el refresh token para renovarlo.
  *(El manejo automático del refresh queda como mejora futura.)*

### 3.4 Protección de rutas

| Recurso | Roles permitidos |
|---------|-----------------|
| `GET /api/activities` | Todos (sin autenticación) |
| `GET /api/activities/:id` | Todos |
| `GET /api/categories` | Todos |
| `POST/PUT/DELETE /api/activities` | Solo admin |
| `POST/PUT /api/categories` | Solo admin |
| `GET /api/auth/me` | Cualquier usuario autenticado |

---

## 4. Mapa SVG — Reglas de presentación

### 4.1 Marcadores

- Cada actividad activa se representa con un marcador posicionado en
  (`mapLeft`%, `mapTop`%) sobre el SVG.
- El color del marcador es el del campo `color` de su categoría.
- El icono del marcador es el del campo `icon` de su categoría.

### 4.2 Filtrado visual

Cuando el usuario aplica filtros, los marcadores que no cumplen los filtros
se **ocultan** (no se eliminan del DOM) para mantener el rendimiento.
Se muestran todos al cargar y se filtran en el cliente con los datos ya cargados.

**Excepción:** la búsqueda por texto sí hace una petición al servidor
(fulltext search de MongoDB) porque filtra sobre todos los documentos,
no solo los cargados en memoria.

### 4.3 Zonas geográficas

| Zona | Municipios de referencia |
|------|--------------------------|
| oriente | Llanes, Ribadesella, Cangas de Onís, Arriondas |
| centro | Oviedo, Gijón, Avilés, Siero, Mieres |
| occidente | Cangas del Narcea, Tineo, Luarca, Navia |

La asignación de zona es editorial (hecha por el admin), no automática.

---

## 5. Búsqueda fulltext

Se usa el índice `{ name: 'text', description: 'text' }` de MongoDB.

- La búsqueda se activa pasando el parámetro `?search=texto` al endpoint.
- MongoDB puntúa los resultados por relevancia; los más relevantes aparecen
  primero (cuando se usa `$text`).
- La búsqueda es case-insensitive y elimina palabras vacías en español.
- Mínimo de caracteres para buscar: 2 (validado en el frontend con debounce
  de 300 ms).

---

## 6. Reglas de validación — resumen

| Campo | Regla |
|-------|-------|
| `name` | Requerido, máx. 100 chars |
| `description` | Opcional, máx. 2000 chars |
| `category` | Requerido, ObjectId válido |
| `location.coordinates` | Requerido, [lng, lat], dentro de Asturias |
| `zone` | Requerido, enum: oriente/centro/occidente |
| `price` | Opcional, número ≥ 0, por defecto 0 |
| `accessible` | Opcional, booleano, por defecto false |
| `languages` | Opcional, array de strings, por defecto ['es'] |
| `email` (auth) | Requerido, formato válido, único |
| `password` (auth) | Mín. 8 chars, 1 mayúscula, 1 número |
| `slug` (categoría) | Único, solo /^[a-z0-9-]+$/ |
| `color` (categoría) | Hexadecimal /^#[0-9A-Fa-f]{6}$/ |
