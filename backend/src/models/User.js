import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'El email no tiene un formato válido'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,   // no se devuelve en queries por defecto
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'visitor'],
        message: 'El rol debe ser admin o visitor',
      },
      default: 'visitor',
    },
    active: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        // Nunca exponemos el hash
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.index({ email: 1 });

// ─── Métodos de instancia ──────────────────────────────────

/** Comprueba si la contraseña en texto plano coincide con el hash */
userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

// ─── Métodos estáticos ────────────────────────────────────

/** Crea un hash bcrypt de la contraseña */
userSchema.statics.hashPassword = async function (plainPassword) {
  const saltRounds = 12;
  return bcrypt.hash(plainPassword, saltRounds);
};

export default mongoose.model('User', userSchema);
