import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface ISubDomain {
  mainDomainId: number;
  subDomainId: string;
  name: string;
}

const subDomains: ISubDomain[] = [
  // Cybersecurity Governance (Main Domain 1)
  {
    mainDomainId: 1,
    subDomainId: '1-1',
    name: 'Cybersecurity Roles and Responsibilities',
  },
  {
    mainDomainId: 1,
    subDomainId: '1-2',
    name: 'Cybersecurity Risk Management',
  },
  {
    mainDomainId: 1,
    subDomainId: '1-3',
    name: 'Compliance with Cybersecurity Standards, Laws, and Regulations',
  },
  {
    mainDomainId: 1,
    subDomainId: '1-4',
    name: 'Cybersecurity in Human Resources',
  },
  {
    mainDomainId: 1,
    subDomainId: '1-5',
    name: 'Cybersecurity in Change Management',
  },

  // Cybersecurity Defense (Main Domain 2)
  { mainDomainId: 2, subDomainId: '2-1', name: 'Asset Management' },
  {
    mainDomainId: 2,
    subDomainId: '2-2',
    name: 'Identity and Access Management',
  },
  {
    mainDomainId: 2,
    subDomainId: '2-3',
    name: 'Information System and Information Processing Facilities Protection',
  },
  { mainDomainId: 2, subDomainId: '2-4', name: 'Network Security Management' },
  { mainDomainId: 2, subDomainId: '2-5', name: 'Mobile Devices Security' },
  {
    mainDomainId: 2,
    subDomainId: '2-6',
    name: 'Data and Information Protection',
  },
  { mainDomainId: 2, subDomainId: '2-7', name: 'Cryptography' },
  {
    mainDomainId: 2,
    subDomainId: '2-8',
    name: 'Backup and Recovery Management',
  },
  { mainDomainId: 2, subDomainId: '2-9', name: 'Vulnerabilities Management' },
  { mainDomainId: 2, subDomainId: '2-10', name: 'Penetration Testing' },
  {
    mainDomainId: 2,
    subDomainId: '2-11',
    name: 'Cybersecurity Event Logs and Monitoring Management',
  },
  {
    mainDomainId: 2,
    subDomainId: '2-12',
    name: 'Cybersecurity Incident and Threat Management',
  },
  { mainDomainId: 2, subDomainId: '2-13', name: 'Physical Security' },
  { mainDomainId: 2, subDomainId: '2-14', name: 'Web Application Security' },
  { mainDomainId: 2, subDomainId: '2-15', name: 'Key Management' },
  {
    mainDomainId: 2,
    subDomainId: '2-16',
    name: 'System Development Security',
  },
  { mainDomainId: 2, subDomainId: '2-17', name: 'Storage Media Security' },

  // Cybersecurity Resilience (Main Domain 3)
  {
    mainDomainId: 3,
    subDomainId: '3-1',
    name: 'Cybersecurity Resilience Aspects of Business Continuity Management (BCM)',
  },

  // Third-Party Cybersecurity (Main Domain 4)
  {
    mainDomainId: 4,
    subDomainId: '4-1',
    name: 'Supply Chain and Third-Party Cybersecurity',
  },
];

const subDomainSchema = new mongoose.Schema(
  {
    mainDomainId: {
      type: Number,
      required: true,
      ref: 'MainDomain',
    },
    subDomainId: {
      type: String,
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

const SubDomain =
  mongoose.models.SubDomain || mongoose.model('SubDomain', subDomainSchema);

async function seedSubDomains(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected to MongoDB.');

    // Clear existing data
    await SubDomain.deleteMany({});
    console.log('Cleared existing sub domains.');

    // Insert new data
    await SubDomain.insertMany(subDomains);
    console.log('Successfully seeded sub domains.');

    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding sub domains:', error);
    process.exit(1);
  }
}

seedSubDomains();
