"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config({ path: '.env.local' });
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}
const mainDomains = [
    { domainId: 1, name: 'Cybersecurity Governance' },
    { domainId: 2, name: 'Cybersecurity Defence' },
    { domainId: 3, name: 'Cybersecurity Resilience' },
    { domainId: 4, name: 'Third Party Cybersecurity' },
];
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
// Type assertion for MONGODB_URI since we've already checked it's not undefined
const MainDomain = mongoose_1.default.models.MainDomain || mongoose_1.default.model('MainDomain', mainDomainSchema);
async function seedMainDomains() {
    try {
        // Type assertion here since we've checked MONGODB_URI is not undefined above
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('Connected to MongoDB.');
        await MainDomain.deleteMany({});
        console.log('Cleared existing main domains.');
        await MainDomain.insertMany(mainDomains);
        console.log('Successfully seeded main domains.');
        await mongoose_1.default.connection.close();
        console.log('Database connection closed.');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding main domains:', error);
        process.exit(1);
    }
}
seedMainDomains();
