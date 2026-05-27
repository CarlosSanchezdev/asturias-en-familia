import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      maxlength: 50,
    },
    slug: {
      type: String,
      required: [true, 'El slug es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'El slug solo puede contener letras, números y guiones'],
    },
    icon: {
      type: String,   // nombre del archivo SVG en assets/icons/
      required: [true, 'El icono es obligatorio'],
    },
    color: {
      type: String,
      required: [true, 'El color es obligatorio'],
      match: [/^#[0-9A-Fa-f]{6}$/, 'El color debe ser un hexadecimal válido (#RRGGBB)'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    active: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

categorySchema.index({ slug: 1 });
categorySchema.index({ active: 1, order: 1 });

export default mongoose.model('Category', categorySchema);
