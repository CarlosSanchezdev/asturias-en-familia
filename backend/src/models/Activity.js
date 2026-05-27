import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      maxlength: [100, 'El nombre no puede superar 100 caracteres'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'La descripción no puede superar 2000 caracteres'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'La categoría es obligatoria'],
    },
    // GeoJSON Point — coordenadas reales [lng, lat]
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],   // [lng, lat] — orden GeoJSON
        required: [true, 'Las coordenadas son obligatorias'],
        validate: {
          validator: ([lng, lat]) =>
            lng >= -9 && lng <= 0 && lat >= 43 && lat <= 44,
          message: 'Coordenadas fuera del rango de Asturias',
        },
      },
    },
    zone: {
      type: String,
      enum: {
        values: ['oriente', 'centro', 'occidente'],
        message: 'La zona debe ser oriente, centro u occidente',
      },
      required: [true, 'La zona es obligatoria'],
    },
    municipality: {
      type: String,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    accessible: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      min: [0, 'El precio no puede ser negativo'],
      default: 0,
    },
    languages: {
      type: [String],
      default: ['es'],
    },
    // Posición calculada para el mapa SVG
    mapLeft: {
      type: Number,
      min: 0,
      max: 100,
    },
    mapTop: {
      type: Number,
      min: 0,
      max: 100,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,   // createdAt, updatedAt automáticos
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Índices ───────────────────────────────────────────────
activitySchema.index({ location: '2dsphere' });
activitySchema.index({ zone: 1 });
activitySchema.index({ category: 1 });
activitySchema.index({ active: 1 });
activitySchema.index({ name: 'text', description: 'text' }); // búsqueda fulltext

// ─── Virtual: precio formateado ────────────────────────────
activitySchema.virtual('isFree').get(function () {
  return this.price === 0;
});

// ─── Pre-save: calcular posición SVG desde coordenadas ─────
// Constantes de calibración (ver posicionador-ciudades.html)
const A_LNG = 0.00358282;
const B_LNG = -7.183398;
const A_LAT = -0.00170741;
const B_LAT = 43.781844;
const SVG_W = 777.74173;
const SVG_H = 413.26299;

activitySchema.pre('save', function (next) {
  if (this.isModified('location')) {
    const [lng, lat] = this.location.coordinates;
    const svgX = (lng - B_LNG) / A_LNG;
    const svgY = (lat - B_LAT) / A_LAT;
    this.mapLeft = parseFloat(((svgX / SVG_W) * 100).toFixed(4));
    this.mapTop  = parseFloat(((svgY / SVG_H) * 100).toFixed(4));
  }
  next();
});

export default mongoose.model('Activity', activitySchema);
