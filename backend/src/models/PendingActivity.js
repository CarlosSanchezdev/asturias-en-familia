import mongoose from 'mongoose';

const pendingActivitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    shortDescription: { type: String, required: true, trim: true, maxlength: 300 },
    category: { type: String, trim: true },
    zone: { type: String, enum: ['oriente', 'centro', 'occidente'] },
    municipality: { type: String, trim: true },
    coordinates: { type: [Number] }, // [lng, lat] opcional
    contactName: { type: String, required: true, trim: true },
    contactEmail: { type: String, required: true, lowercase: true, trim: true },
    contactPhone: { type: String, trim: true },
    additionalInfo: { type: String, trim: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminNotes: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

pendingActivitySchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('PendingActivity', pendingActivitySchema);
