import mongoose from 'mongoose';

export interface ILevelSetting {
  level: number;
  isRequired: boolean;
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
    },
  },
  { _id: false }
);

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
    levelSettings: {
      type: [levelSettingSchema],
      validate: {
        validator: function(settings: ILevelSetting[]) {
          if (!settings) return true;
          if (settings.length === 0) return true;
          if (settings.length !== 4) return false;
          
          // Check if we have exactly one setting for each level 1-4
          const levels = settings.map(s => s.level);
          return [1, 2, 3, 4].every(level => levels.includes(level));
        },
        message: 'Level settings must contain exactly one setting for each level from 1 to 4'
      },
      default: () => [
        { level: 1, isRequired: false },
        { level: 2, isRequired: false },
        { level: 3, isRequired: false },
        { level: 4, isRequired: false }
      ]
    }
  },
  {
    timestamps: true,
  }
);

// Add compound index for domain-based queries
SubControlSchema.index({ mainDomainId: 1, subDomainId: 1 });

export default mongoose.models.SubControl ||
  mongoose.model('SubControl', SubControlSchema);
