import mongoose from 'mongoose';

export interface ILevelSetting {
  level: number;
  isRequired: boolean;
}

export interface IMainControl {
  controlId: string;
  name: string;
  mainDomainId: number;
  subDomainId: string;
  levelSettings: ILevelSetting[];
  createdAt?: Date;
  updatedAt?: Date;
}

const levelSettingSchema = new mongoose.Schema<ILevelSetting>(
  {
    level: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },
    isRequired: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { _id: false }
);

const mainControlSchema = new mongoose.Schema<IMainControl>(
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
    levelSettings: {
      type: [levelSettingSchema],
      required: true,
      validate: {
        validator: function (settings: ILevelSetting[]) {
          // Ensure we have exactly 4 levels
          if (settings.length !== 4) return false;

          // Ensure levels 1-4 are present exactly once
          const levels = settings.map((setting) => setting.level).sort();
          return JSON.stringify(levels) === JSON.stringify([1, 2, 3, 4]);
        },
        message: 'Control must have exactly one setting for each level (1-4)',
      },
      default: [
        { level: 1, isRequired: false },
        { level: 2, isRequired: false },
        { level: 3, isRequired: false },
        { level: 4, isRequired: false },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Add index for efficient querying by level and setting
mainControlSchema.index({
  'levelSettings.level': 1,
  'levelSettings.isRequired': 1,
});

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

const MainControl = mongoose.model<IMainControl>(
  'MainControl',
  mainControlSchema
);

export default MainControl;
