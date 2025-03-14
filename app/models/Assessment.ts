import mongoose, { Schema, Document } from "mongoose";

export interface IAssessment extends Document {
  name: string;
  date: string;
  dueDate: string;
  controls: Array<{
    controlId: string;
    name: string;
    evidenceOwner: mongoose.Types.ObjectId;
    verifiedEvidence: string;
    missingEvidence: string;
    status: "Not Implemented" | "Partially Implemented" | "Implemented";
    comments: string;
    artifactLink: string;
    subDomainName: string;
    subDomainId: string;
  }>;
  createdBy: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Clear any existing models to prevent OverwriteModelError
if (mongoose.models.Assessment) {
  delete mongoose.models.Assessment;
}

const AssessmentSchema = new Schema(
  {
    name: { type: String, required: true },
    date: { type: String, required: true },
    dueDate: { type: String, required: true },
    controls: [
      {
        controlId: { type: String, required: true },
        name: { type: String, required: true },
        evidenceOwner: { type: Schema.Types.ObjectId, ref: "User" },
        verifiedEvidence: { type: String, default: "" },
        missingEvidence: { type: String, default: "" },
        status: {
          type: String,
          enum: ["Not Implemented", "Partially Implemented", "Implemented"],
          default: "Not Implemented",
        },
        comments: { type: String, default: "" },
        artifactLink: { type: String, default: "" },
        subDomainName: { type: String, required: true },
        subDomainId: { type: String, required: true },
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
AssessmentSchema.index({ createdBy: 1 });
AssessmentSchema.index({ owner: 1 });
AssessmentSchema.index({ "controls.controlId": 1 });

export default mongoose.model<IAssessment>("Assessment", AssessmentSchema);
