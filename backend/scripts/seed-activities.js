import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const A_LNG = 0.004863492265927784;
const B_LNG = -7.720763681427141;
const A_LAT = -0.002585444509287294;
const B_LAT = 43.82839845916549;
const SVG_W = 777.74173;
const SVG_H = 413.26299;

function calcSVGPosition(lng, lat) {
  const svgX = (lng - B_LNG) / A_LNG;
  const svgY = (lat - B_LAT) / A_LAT;
  return {
    mapLeft: parseFloat((svgX / SVG_W * 100).toFixed(4)),
    mapTop: parseFloat((svgY / SVG_H * 100).toFixed(4)),
  };
}

await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/asturias-familia');

const db = mongoose.connection.db;

// Obtener IDs de categorías
const categories = await db.collection('categories').find().toArray();
const cat = (slug) => categories.find(c => c.slug === slug)?._id;

await db.collection('activities').insertMany([
    {
        name: 'Acuario de Gijón',
        shortDescription: 'El mayor acuario del norte de España con más de 4.000 animales marinos.',
        description: 'El Acuario de Gijón es uno de los más importantes de España. Alberga más de 4.000 animales de 200 especies diferentes. Dispone de zona de tocatón para que los niños puedan tocar rayas y estrellas de mar. Perfecto para toda la familia.',
        category: cat('acuario'),
        location: { type: 'Point', coordinates: [-5.6618, 43.5454] },
        zone: 'centro',
        municipality: 'Gijón',
        images: [],
        accessible: true,
        price: 12.50,
        languages: ['es', 'en'],
        active: true,
        ...calcSVGPosition(-5.6618, 43.5454),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Playa de Rodiles',
        shortDescription: 'Una de las mejores playas de Asturias, ideal para familias con niños.',
        description: 'La playa de Rodiles se encuentra en la desembocadura del río Sella, en el concejo de Villaviciosa. Con más de 800 metros de longitud y una arena fina y dorada, es perfecta para familias. Junto a la playa hay una zona de camping y merenderos.',
        category: cat('playas'),
        location: { type: 'Point', coordinates: [-5.3847, 43.5289] },
        zone: 'centro',
        municipality: 'Villaviciosa',
        images: [],
        accessible: false,
        price: 0,
        languages: ['es'],
        active: true,
        ...calcSVGPosition(-5.3847, 43.5289),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Senda del Oso',
        shortDescription: 'Ruta ciclable y peatonal de 22 km a través de los valles del Oso.',
        description: 'La Senda del Oso es una ruta de 22 km que discurre por el antiguo trazado de un ferrocarril minero. El camino pasa junto al recinto de los osos pardos asturianos Paca y Tola. Apta para bicicletas y carricoches. Baja dificultad.',
        category: cat('rutas'),
        location: { type: 'Point', coordinates: [-6.0789, 43.2547] },
        zone: 'centro',
        municipality: 'Proaza',
        images: [],
        accessible: true,
        price: 0,
        languages: ['es'],
        active: true,
        ...calcSVGPosition(-6.0789, 43.2547),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Museo del Jurásico de Asturias (MUJA)',
        shortDescription: 'El museo de dinosaurios más importante del norte de España.',
        description: 'El MUJA es el museo paleontológico de referencia en el norte de España. Cuenta con réplicas a tamaño real de dinosaurios y una exposición sobre las huellas de dinosaurios encontradas en la costa asturiana. Muy recomendado para niños.',
        category: cat('museos'),
        location: { type: 'Point', coordinates: [-4.5234, 43.4789] },
        zone: 'oriente',
        municipality: 'Colunga',
        images: [],
        accessible: true,
        price: 7,
        languages: ['es', 'en'],
        active: true,
        ...calcSVGPosition(-4.5234, 43.4789),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Lagos de Covadonga',
        shortDescription: 'Los lagos de montaña más famosos de Asturias, en pleno Parque Nacional.',
        description: 'Los Lagos de Covadonga (Enol y Ercina) son uno de los paisajes más emblemáticos de Asturias. Se encuentran en el Parque Nacional de los Picos de Europa. En temporada alta el acceso es solo en autobús lanzadera desde Cangas de Onís.',
        category: cat('rutas'),
        location: { type: 'Point', coordinates: [-4.9902, 43.2657] },
        zone: 'oriente',
        municipality: 'Cangas de Onís',
        images: [],
        accessible: false,
        price: 0,
        languages: ['es', 'en'],
        active: true,
        ...calcSVGPosition(-4.9902, 43.2657),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Centro Ecuestre El Palacio',
        shortDescription: 'Rutas a caballo para toda la familia por los valles asturianos.',
        category: cat('caballos'),
        location: { type: 'Point', coordinates: [-6.3421, 43.3678] },
        zone: 'occidente',
        municipality: 'Tineo',
        images: [],
        accessible: false,
        price: 25,
        languages: ['es'],
        active: true,
        ...calcSVGPosition(-6.3421, 43.3678),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Parque de la Prehistoria de Teverga',
        shortDescription: 'Reproducción de las pinturas rupestres más importantes de la Prehistoria.',
        description: 'El Parque de la Prehistoria ofrece una visita interactiva por la historia del arte rupestre. Incluye reproducción de la cueva de Altamira y paneles interactivos. Muy adecuado para familias con niños a partir de 6 años.',
        category: cat('museos'),
        location: { type: 'Point', coordinates: [-6.0234, 43.1456] },
        zone: 'centro',
        municipality: 'Teverga',
        images: [],
        accessible: true,
        price: 9,
        languages: ['es'],
        active: true,
        ...calcSVGPosition(-6.0234, 43.1456),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Playa de Torimbia',
        shortDescription: 'Playa virgen en un entorno natural espectacular, de difícil acceso.',
        category: cat('playas'),
        location: { type: 'Point', coordinates: [-4.7823, 43.4912] },
        zone: 'oriente',
        municipality: 'Llanes',
        images: [],
        accessible: false,
        price: 0,
        languages: ['es'],
        active: true,
        ...calcSVGPosition(-4.7823, 43.4912),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Ruta de los Miradores del Fitu',
        shortDescription: 'Mirador con vistas panorámicas a los Picos de Europa y el Cantábrico.',
        category: cat('rutas'),
        location: { type: 'Point', coordinates: [-5.2134, 43.4234] },
        zone: 'oriente',
        municipality: 'Parres',
        images: [],
        accessible: false,
        price: 0,
        languages: ['es'],
        active: true,
        ...calcSVGPosition(-5.2134, 43.4234),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Jardín Botánico Atlántico de Gijón',
        shortDescription: 'El mayor jardín botánico de la Cornisa Cantábrica con más de 20.000 plantas.',
        description: 'El Jardín Botánico Atlántico ocupa 25 hectáreas y reúne la flora atlántica europea. Cuenta con zonas de juego para niños, cafetería y actividades didácticas los fines de semana. Entrada gratuita los martes.',
        category: cat('parques'),
        location: { type: 'Point', coordinates: [-5.6234, 43.5123] },
        zone: 'centro',
        municipality: 'Gijón',
        images: [],
        accessible: true,
        price: 3.5,
        languages: ['es', 'en'],
        active: true,
        ...calcSVGPosition(-5.6234, 43.5123),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
]);

console.log('✅ 10 actividades insertadas correctamente');
await mongoose.disconnect();
