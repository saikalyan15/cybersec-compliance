import mongoose from 'mongoose';

export interface ILevel {
  _id?: string;
  levelId: number;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const levelSchema = new mongoose.Schema<ILevel>(
  {
    levelId: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
      max: 4,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Level =
  mongoose.models.Level || mongoose.model<ILevel>('Level', levelSchema);

export default Level;
