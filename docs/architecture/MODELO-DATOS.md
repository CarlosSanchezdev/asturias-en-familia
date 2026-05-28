# Modelo de Datos — Asturias en Familia

---

## 1. Diagrama Entidad-Relación

```
┌─────────────────────────────────────┐
│              Category               │
├─────────────────────────────────────┤
│ _id          ObjectId  PK           │
│ name         String    required     │
│ slug         String    unique       │
│ icon         String    required     │
│ color        String    #RRGGBB      │
│ description  String    max:200      │
│ order        Number    default:0    │
│ active       Boolean   default:true │
│ createdAt    Date      auto         │
│ updatedAt    Date      auto         │
└─────────────────────────────────────┘
              │
              │ 1
              │ (una categoría tiene muchas actividades)
              │ N
              ▼
┌─────────────────────────────────────┐
│              Activity               │
├─────────────────────────────────────┤
│ _id          ObjectId  PK           │
│ name         String    required     │
│ description  String    max:2000     │
│ category     ObjectId  FK→Category  │
│ location     GeoJSON   Point        │
│   .type      'Point'                │
│   .coordinates [lng,lat]            │
│ zone         Enum      oriente|     │
│                        centro|      │
│                        occidente    │
│ municipality String                 │
│ images       [String]  URLs         │
│ accessible   Boolean   default:F    │
│ price        Number    ≥0, def:0    │
│ languages    [String]  def:['es']   │
│ mapLeft      Number    0-100%       │
│ mapTop       Number    0-100%       │
│ active       Boolean   default:true │
│ createdAt    Date      auto         │
│ updatedAt    Date      auto         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│                User                 │
├─────────────────────────────────────┤
│ _id          ObjectId  PK           │
│ email        String    unique       │
│ passwordHash String    select:false │
│ role         Enum      admin|visitor│
│ active       Boolean   default:true │
│ lastLogin    Date                   │
│ createdAt    Date      auto         │
│ updatedAt    Date      auto         │
└─────────────────────────────────────┘
```

> Los usuarios no tienen relación directa con actividades en el MVP. Las actividades creadas por un admin no guardan
> referencia a qué admin las creó. _(Mejora futura: campo `createdBy: ObjectId → User`)_

---

## 2. Colecciones y volumen esperado

| Colección    | Documentos MVP | Documentos estimados (1 año) |
| ------------ | -------------- | ---------------------------- |
| `categories` | 6              | 10-15                        |
| `activities` | 20-50          | 200-500                      |
| `users`      | 2-3 (admins)   | 10-20                        |

---

## 3. Índices

### Colección `activities`

| Índice                                  | Tipo        | Propósito                                |
| --------------------------------------- | ----------- | ---------------------------------------- |
| `{ location: '2dsphere' }`              | Geoespacial | Consultas `$near`, `$geoWithin`          |
| `{ zone: 1 }`                           | Simple      | Filtro por zona (muy frecuente)          |
| `{ category: 1 }`                       | Simple      | Filtro por categoría                     |
| `{ active: 1 }`                         | Simple      | Excluir inactivas (en todas las queries) |
| `{ name: 'text', description: 'text' }` | Fulltext    | Búsqueda por texto                       |

### Colección `categories`

| Índice                    | Tipo      | Propósito                              |
| ------------------------- | --------- | -------------------------------------- |
| `{ slug: 1 }`             | Único     | Lookup por slug, garantiza unicidad    |
| `{ active: 1, order: 1 }` | Compuesto | Listado ordenado de categorías activas |

### Colección `users`

| Índice         | Tipo  | Propósito                 |
| -------------- | ----- | ------------------------- |
| `{ email: 1 }` | Único | Login, garantiza unicidad |

---

## 4. Documentos de ejemplo

### Category

```json
{
	"_id": "664a1b2c3d4e5f6a7b8c9d0e",
	"name": "Rutas",
	"slug": "rutas",
	"icon": "icon-rutas.svg",
	"color": "#3D7A36",
	"description": "Rutas de senderismo y naturaleza para toda la familia",
	"order": 1,
	"active": true,
	"createdAt": "2025-10-01T09:00:00.000Z",
	"updatedAt": "2025-10-01T09:00:00.000Z"
}
```

### Activity

```json
{
	"_id": "664a1b2c3d4e5f6a7b8c9d0f",
	"name": "Ruta del Oso — Picos de Europa",
	"description": "Ruta circular de dificultad baja ideal para familias con niños mayores de 6 años. Discurre por hayedos centenarios con vistas al macizo central.",
	"category": {
		"_id": "664a1b2c3d4e5f6a7b8c9d0e",
		"name": "Rutas",
		"slug": "rutas",
		"icon": "icon-rutas.svg",
		"color": "#3D7A36"
	},
	"location": {
		"type": "Point",
		"coordinates": [-4.9902, 43.2547]
	},
	"zone": "oriente",
	"municipality": "Cangas de Onís",
	"images": ["https://example.com/ruta-oso-1.jpg", "https://example.com/ruta-oso-2.jpg"],
	"accessible": false,
	"price": 0,
	"isFree": true,
	"languages": ["es"],
	"mapLeft": 72.34,
	"mapTop": 28.91,
	"active": true,
	"createdAt": "2025-10-15T10:30:00.000Z",
	"updatedAt": "2025-10-15T10:30:00.000Z"
}
```

### User (con passwordHash oculto)

```json
{
	"_id": "664a1b2c3d4e5f6a7b8c9d10",
	"email": "admin@asturias-familia.es",
	"role": "admin",
	"active": true,
	"lastLogin": "2025-10-20T08:15:00.000Z",
	"createdAt": "2025-10-01T09:00:00.000Z",
	"updatedAt": "2025-10-20T08:15:00.000Z"
}
```

---

## 5. Validaciones por campo

### Activity

| Campo                  | Tipo     | Required | Validación adicional              |
| ---------------------- | -------- | -------- | --------------------------------- |
| `name`                 | String   | ✅       | trim, maxLength: 100              |
| `description`          | String   | ❌       | trim, maxLength: 2000             |
| `category`             | ObjectId | ✅       | ref: 'Category'                   |
| `location.coordinates` | [Number] | ✅       | lng ∈ [-9,0], lat ∈ [43,44]       |
| `zone`                 | Enum     | ✅       | oriente / centro / occidente      |
| `municipality`         | String   | ❌       | trim                              |
| `images`               | [String] | ❌       | default: []                       |
| `accessible`           | Boolean  | ❌       | default: false                    |
| `price`                | Number   | ❌       | min: 0, default: 0                |
| `languages`            | [String] | ❌       | default: ['es']                   |
| `mapLeft`              | Number   | ❌       | Calculado automáticamente [0,100] |
| `mapTop`               | Number   | ❌       | Calculado automáticamente [0,100] |
| `active`               | Boolean  | ❌       | default: true                     |

### Category

| Campo         | Tipo    | Required | Validación adicional              |
| ------------- | ------- | -------- | --------------------------------- |
| `name`        | String  | ✅       | trim, maxLength: 50               |
| `slug`        | String  | ✅       | unique, lowercase, /^[a-z0-9-]+$/ |
| `icon`        | String  | ✅       | —                                 |
| `color`       | String  | ✅       | /^#[0-9A-Fa-f]{6}$/               |
| `description` | String  | ❌       | trim, maxLength: 200              |
| `order`       | Number  | ❌       | default: 0                        |
| `active`      | Boolean | ❌       | default: true                     |

### User

| Campo          | Tipo    | Required | Validación adicional                |
| -------------- | ------- | -------- | ----------------------------------- |
| `email`        | String  | ✅       | unique, lowercase, /^\S+@\S+\.\S+$/ |
| `passwordHash` | String  | ✅       | select: false                       |
| `role`         | Enum    | ❌       | admin / visitor, default: 'visitor' |
| `active`       | Boolean | ❌       | default: true                       |

---

## 6. Convención de coordenadas

**IMPORTANTE:** MongoDB y GeoJSON usan el orden `[longitud, latitud]`, que es el opuesto al orden habitual en mapas
(`[latitud, longitud]`).

```javascript
// ✅ Correcto — GeoJSON
coordinates: [-5.6618, 43.5454]; // [lng, lat] → Gijón

// ❌ Incorrecto
coordinates: [43.5454, -5.6618]; // [lat, lng] → no funciona con 2dsphere
```

El frontend recibe las coordenadas en este orden y las usa para el cálculo SVG. La transformación lineal espera
`coordinates[0]` como longitud y `coordinates[1]` como latitud.
