"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const SubControlSchema = new mongoose_1.default.Schema({
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
}, {
    timestamps: true,
});
// Add compound index for domain-based queries
SubControlSchema.index({ mainDomainId: 1, subDomainId: 1 });
exports.default = mongoose_1.default.models.SubControl ||
    mongoose_1.default.model('SubControl', SubControlSchema);
