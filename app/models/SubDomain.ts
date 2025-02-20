import mongoose from 'mongoose';

const subDomainSchema = new mongoose.Schema(
  {
    mainDomainId: {
      type: Number,
      required: true,
      ref: 'MainDomain',
    },
    subDomainId: {
      type: String, // Will store as "1-1", "2-5" etc.
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Clear existing model and create new one
if (mongoose.models.SubDomain) {
  delete mongoose.models.SubDomain;
}

const SubDomain = mongoose.model('SubDomain', subDomainSchema);
export default SubDomain;
