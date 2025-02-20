import mongoose from 'mongoose';

const mainDomainSchema = new mongoose.Schema(
  {
    domainId: {
      type: Number,
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
if (mongoose.models.MainDomain) {
  delete mongoose.models.MainDomain;
}

const MainDomain = mongoose.model('MainDomain', mainDomainSchema);
export default MainDomain;
