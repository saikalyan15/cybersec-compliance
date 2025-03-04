import mongoose from 'mongoose';

const SubControlSchema = new mongoose.Schema(
  {
    subControlId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    controlId: {
      type: String,
      required: true,
      index: true,
    },
    mainDomainId: {
      type: Number,
      required: true,
    },
    subDomainId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add compound index for domain-based queries
SubControlSchema.index({ mainDomainId: 1, subDomainId: 1 });

export default mongoose.models.SubControl ||
  mongoose.model('SubControl', SubControlSchema);
