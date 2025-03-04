"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// models/User.js
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Clear any existing models
if (mongoose_1.default.models.User) {
    delete mongoose_1.default.models.User;
}
// Define the User Schema with all required fields
const userSchema = new mongoose_1.default.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    designation: {
        type: String,
        required: true,
        trim: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'owner'],
        default: 'user',
        required: true,
    },
}, {
    timestamps: true,
    // This ensures that when converting to JSON/Object, virtuals are included
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        const salt = await bcryptjs_1.default.genSalt(12);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        next();
    }
    catch (_a) {
        // Removed unused parameter
        next(new Error('Failed to hash password'));
    }
});
// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcryptjs_1.default.compare(candidatePassword, this.password);
    }
    catch (_a) {
        // Removed unused parameter
        throw new Error('Error comparing passwords');
    }
};
// Ensure all fields are selected by default
const User = mongoose_1.default.model('User', userSchema);
// Add this to help with debugging
if (process.env.NODE_ENV !== 'production') {
    User.watch().on('change', (data) => {
        console.log('User collection change:', data);
    });
}
exports.default = User;
