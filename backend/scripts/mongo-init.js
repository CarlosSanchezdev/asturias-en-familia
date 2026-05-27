// Script de inicialización ejecutado por MongoDB al crear el contenedor
// Crea las categorías iniciales del proyecto

db = db.getSiblingDB('asturias-familia');

// ─── Categorías ────────────────────────────────────────────
db.categories.insertMany([
  {
    name: 'Rutas',
    slug: 'rutas',
    icon: 'icon-rutas.svg',
    color: '#3D7A36',
    description: 'Rutas de senderismo y naturaleza para toda la familia',
    order: 1,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Acuario',
    slug: 'acuario',
    icon: 'icon-acuario.svg',
    color: '#2E88B0',
    description: 'Visitas al acuario y actividades relacionadas con el mar',
    order: 2,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Caballos',
    slug: 'caballos',
    icon: 'icon-caballos.svg',
    color: '#7B5EA7',
    description: 'Rutas ecuestres y centros hípicos',
    order: 3,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Museos',
    slug: 'museos',
    icon: 'icon-museos.svg',
    color: '#C0522A',
    description: 'Museos y espacios culturales con actividades familiares',
    order: 4,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Parques',
    slug: 'parques',
    icon: 'icon-parques.svg',
    color: '#3A9E6E',
    description: 'Parques naturales y zonas de juego al aire libre',
    order: 5,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Playas',
    slug: 'playas',
    icon: 'icon-playas.svg',
    color: '#2AACAB',
    description: 'Playas y actividades acuáticas para familias',
    order: 6,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);

print('✅ Categorías iniciales insertadas');

// ─── Usuario admin ──────────────────────────────────────────
const adminExists = db.users.findOne({ email: 'admin@asturias-familia.es' });

if (!adminExists) {
  db.users.insertOne({
    email: 'admin@asturias-familia.es',
    passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBpj2ky.U9hqH2',
    role: 'admin',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  print('✅ Usuario admin creado: admin@asturias-familia.es / Admin1234');
} else {
  print('ℹ️  Usuario admin ya existe, omitiendo');
}
