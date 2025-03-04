"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mainDomainSchema = new mongoose_1.default.Schema({
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
}, {
    timestamps: true,
});
// Clear existing model and create new one
if (mongoose_1.default.models.MainDomain) {
    delete mongoose_1.default.models.MainDomain;
}
const MainDomain = mongoose_1.default.model('MainDomain', mainDomainSchema);
exports.default = MainDomain;
