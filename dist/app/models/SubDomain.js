"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const subDomainSchema = new mongoose_1.default.Schema({
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
}, {
    timestamps: true,
});
// Clear existing model and create new one
if (mongoose_1.default.models.SubDomain) {
    delete mongoose_1.default.models.SubDomain;
}
const SubDomain = mongoose_1.default.model('SubDomain', subDomainSchema);
exports.default = SubDomain;
