"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mainControlSchema = new mongoose_1.default.Schema({
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
}, {
    timestamps: true,
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
if (mongoose_1.default.models.MainControl) {
    delete mongoose_1.default.models.MainControl;
}
const MainControl = mongoose_1.default.model('MainControl', mainControlSchema);
exports.default = MainControl;
