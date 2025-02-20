import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface IMainDomain {
  domainId: number;
  name: string;
}

const mainDomains: IMainDomain[] = [
  { domainId: 1, name: 'Cybersecurity Governance' },
  { domainId: 2, name: 'Cybersecurity Defence' },
  { domainId: 3, name: 'Cybersecurity Resilience' },
  { domainId: 4, name: 'Third Party Cybersecurity' },
];

const mainDomainSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

// Type assertion for MONGODB_URI since we've already checked it's not undefined
const MainDomain =
  mongoose.models.MainDomain || mongoose.model('MainDomain', mainDomainSchema);

async function seedMainDomains(): Promise<void> {
  try {
    // Type assertion here since we've checked MONGODB_URI is not undefined above
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected to MongoDB.');

    await MainDomain.deleteMany({});
    console.log('Cleared existing main domains.');

    await MainDomain.insertMany(mainDomains);
    console.log('Successfully seeded main domains.');

    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding main domains:', error);
    process.exit(1);
  }
}

seedMainDomains();
