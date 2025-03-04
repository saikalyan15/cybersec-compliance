import { Schema, model, models } from 'mongoose';

export interface IControl {
  controlId: string;
  name: string;
  mainDomainId: number;
  subDomainId: string;
}

const ControlSchema = new Schema<IControl>({
  controlId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  mainDomainId: { type: Number, required: true },
  subDomainId: { type: String, required: true },
});

// Check if the model exists before creating a new one
const Control = models.Control || model<IControl>('Control', ControlSchema);

export default Control;
