import mongoose from 'mongoose';

const mainControlSchema = new mongoose.Schema(
  {
    controlId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mainDomainId: {
      type: Number,
      required: true,
      ref: 'MainDomain',
    },
    subDomainId: {
      type: String,
      required: true,
      ref: 'SubDomain',
    },
  },
  {
    timestamps: true,
  }
);

// Add a pre-save middleware to validate the control ID format
mainControlSchema.pre('save', function (next) {
  const controlIdPattern = /^\d+-\d+-[A-Z]-\d+$/;
  if (!controlIdPattern.test(this.controlId)) {
    next(new Error('Invalid control ID format. Should be like "2-15-P-2"'));
  }
  next();
});

// Clear existing model and create new one
if (mongoose.models.MainControl) {
  delete mongoose.models.MainControl;
}

const MainControl = mongoose.model('MainControl', mainControlSchema);

export default MainControl;
