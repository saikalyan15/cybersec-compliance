import { connect, disconnect } from 'mongoose';
import MainControl from '../app/models/MainControl';

const controlsToImport = [
  {
    controlId: 'AC-1',
    name: 'Access Control Policy and Procedures',
    description:
      'The organization develops, documents, and disseminates to [Assignment: organization-defined personnel or roles].',
    levelRequirements: [
      { level: 1, isRequired: true },
      { level: 2, isRequired: true },
      { level: 3, isRequired: true },
      { level: 4, isRequired: true },
    ],
  },
  {
    controlId: '1-1-P-1',
    name: 'Cybersecurity Roles and Responsibilities CSP Control',
    mainDomainId: 1,
    subDomainId: '1-1',
  },
  {
    controlId: '1-1-T-1',
    name: 'Cybersecurity Roles and Responsibilities CST Control',
    mainDomainId: 1,
    subDomainId: '1-1',
  },
  {
    controlId: '1-2-P-1',
    name: 'Cybersecurity risk management CSP Control',
    mainDomainId: 1,
    subDomainId: '1-2',
  },
  {
    controlId: '1-2-T-1',
    name: 'Cybersecurity risk management CST Control',
    mainDomainId: 1,
    subDomainId: '1-2',
  },
  {
    controlId: '1-3-P-1',
    name: 'Compliance with Cybersecurity Standards, Laws and Regulations CSP Controls',
    mainDomainId: 1,
    subDomainId: '1-3',
  },
  {
    controlId: '1-3-T-1',
    name: 'Compliance with Cybersecurity Standards, Laws and Regulations CST Control',
    mainDomainId: 1,
    subDomainId: '1-3',
  },
  {
    controlId: '1-4-P-1',
    name: 'Cybersecurity in Human Resources CSP Control of Personnel',
    mainDomainId: 1,
    subDomainId: '1-4',
  },
  {
    controlId: '1-4-P-2',
    name: 'Cybersecurity in Human Resources for CSP related to Termination/Completion of Personnel',
    mainDomainId: 1,
    subDomainId: '1-4',
  },
  {
    controlId: '1-4-T-1',
    name: 'Cybersecurity in Human Resources for CST Control of Personnel',
    mainDomainId: 1,
    subDomainId: '1-4',
  },
  {
    controlId: '1-5-P-1',
    name: 'Cybersecurity requirements for change management within the CSP shall be identified, documented and approved.',
    mainDomainId: 1,
    subDomainId: '1-5',
  },
  {
    controlId: '1-5-P-2',
    name: 'Cybersecurity requirements for change management within the CSP shall be applied.',
    mainDomainId: 1,
    subDomainId: '1-5',
  },
  {
    controlId: '1-5-P-3',
    name: 'Cybersecurity for change management in the CSP',
    mainDomainId: 1,
    subDomainId: '1-5',
  },
  {
    controlId: '1-5-P-4',
    name: 'Cybersecurity requirements for change management within the CSP shall be applied and reviewed periodically',
    mainDomainId: 1,
    subDomainId: '1-5',
  },
  {
    controlId: '2-1-P-1',
    name: 'Asset Management CSP Control',
    mainDomainId: 2,
    subDomainId: '2-1',
  },
  {
    controlId: '2-1-T-1',
    name: 'Asset Management CST Control',
    mainDomainId: 2,
    subDomainId: '2-1',
  },
  {
    controlId: '2-2-P-1',
    name: 'Identity and Access Management CSP Control',
    mainDomainId: 2,
    subDomainId: '2-2',
  },
  {
    controlId: '2-2-T-1',
    name: 'Identity and Access Management CST Control',
    mainDomainId: 2,
    subDomainId: '2-2',
  },
  {
    controlId: '2-3-P-1',
    name: 'Information System and Information Processing Facilities Protection CSP Control',
    mainDomainId: 2,
    subDomainId: '2-3',
  },
  {
    controlId: '2-3-T-1',
    name: 'Information System and Information Processing Facilities Protection CST Control',
    mainDomainId: 2,
    subDomainId: '2-3',
  },
  {
    controlId: '2-4-P-1',
    name: 'Network Security Management CSP Control',
    mainDomainId: 2,
    subDomainId: '2-4',
  },
  {
    controlId: '2-4-T-1',
    name: 'Network Security Management CSP Control CST Control',
    mainDomainId: 2,
    subDomainId: '2-4',
  },
  {
    controlId: '2-5-P-1',
    name: 'Mobile Devices Security CSP Control',
    mainDomainId: 2,
    subDomainId: '2-5',
  },
  {
    controlId: '2-5-T-1',
    name: 'Mobile Devices Security CST Control',
    mainDomainId: 2,
    subDomainId: '2-5',
  },
  {
    controlId: '2-6-P-1',
    name: 'Data and Information Protection CSP Control',
    mainDomainId: 2,
    subDomainId: '2-6',
  },
  {
    controlId: '2-6-T-1',
    name: 'Data and Information Protection CST Control',
    mainDomainId: 2,
    subDomainId: '2-6',
  },
  {
    controlId: '2-7-P-1',
    name: 'Cryptography CSP Control',
    mainDomainId: 2,
    subDomainId: '2-7',
  },
  {
    controlId: '2-7-T-1',
    name: 'Cryptography CST Control',
    mainDomainId: 2,
    subDomainId: '2-7',
  },
  {
    controlId: '2-8-P-1',
    name: 'Backup and Recovery Management CSP Control',
    mainDomainId: 2,
    subDomainId: '2-8',
  },
  {
    controlId: '2-8-T-1',
    name: 'Backup and Recovery Management CST Control',
    mainDomainId: 2,
    subDomainId: '2-8',
  },
  {
    controlId: '2-9-P-1',
    name: 'Vulnerabilities Management CSP Control',
    mainDomainId: 2,
    subDomainId: '2-9',
  },
  {
    controlId: '2-9-T-1',
    name: 'Vulnerabilities Management CST Control',
    mainDomainId: 2,
    subDomainId: '2-9',
  },
  {
    controlId: '2-10-P-1',
    name: 'Penetration Testing CSP Control',
    mainDomainId: 2,
    subDomainId: '2-10',
  },
  {
    controlId: '2-11-P-1',
    name: 'Cybersecurity Event Logs and Monitoring Management CSP Control',
    mainDomainId: 2,
    subDomainId: '2-11',
  },
  {
    controlId: '2-11-T-1',
    name: 'Cybersecurity Event Logs and Monitoring Management CST Control',
    mainDomainId: 2,
    subDomainId: '2-11',
  },
  {
    controlId: '2-12-P-1',
    name: 'Cybersecurity Incident and Threat Management CSP Control',
    mainDomainId: 2,
    subDomainId: '2-12',
  },
  {
    controlId: '2-13-P-1',
    name: 'Physical Security CSP Control',
    mainDomainId: 2,
    subDomainId: '2-13',
  },
  {
    controlId: '2-14-P-1',
    name: 'Web Application Security CSP Control',
    mainDomainId: 2,
    subDomainId: '2-14',
  },
  {
    controlId: '2-15-P-1',
    name: 'Cybersecurity requirements for key management process within the CSP shall be identified, documented and approved.',
    mainDomainId: 2,
    subDomainId: '2-15',
  },
  {
    controlId: '2-15-P-2',
    name: 'Cybersecurity requirements for key management process within the CSP shall be applied',
    mainDomainId: 2,
    subDomainId: '2-15',
  },
  {
    controlId: '2-15-P-3',
    name: 'Cybersecurity requirements for key management within the CSP',
    mainDomainId: 2,
    subDomainId: '2-15',
  },
  {
    controlId: '2-15-P-4',
    name: 'Cybersecurity requirements for key management within the CSP shall be reviewed periodically',
    mainDomainId: 2,
    subDomainId: '2-15',
  },
  {
    controlId: '2-15-T-1',
    name: 'Cybersecurity requirements for key management within the CST shall be identified, documented and approved',
    mainDomainId: 2,
    subDomainId: '2-15',
  },
  {
    controlId: '2-15-T-2',
    name: 'Cybersecurity requirements for key management within the CST shall applied',
    mainDomainId: 2,
    subDomainId: '2-15',
  },
  {
    controlId: '2-15-T-3',
    name: 'Cybersecurity requirements for key management within the CST',
    mainDomainId: 2,
    subDomainId: '2-15',
  },
  {
    controlId: '2-15-T-4',
    name: 'Cybersecurity requirements for key management within the CST shall be applied and reviewed periodically',
    mainDomainId: 2,
    subDomainId: '2-15',
  },
  {
    controlId: '2-16-P-1',
    name: 'Cybersecurity requirements for system development within the CSP shall be identified, documented and approved',
    mainDomainId: 2,
    subDomainId: '2-16',
  },
  {
    controlId: '2-16-P-2',
    name: 'Cybersecurity requirements for system development within the CSP shall be applied',
    mainDomainId: 2,
    subDomainId: '2-16',
  },
  {
    controlId: '2-16-P-3',
    name: 'Cybersecurity requirements for system development within the CSP',
    mainDomainId: 2,
    subDomainId: '2-16',
  },
  {
    controlId: '2-16-P-4',
    name: 'Cybersecurity requirements for system development within the CSP shall be applied and reviewed periodically',
    mainDomainId: 2,
    subDomainId: '2-16',
  },
  {
    controlId: '2-17-P-1',
    name: 'Cybersecurity requirements for usage of information and data media within the CSP shall be identified, documented and approved',
    mainDomainId: 2,
    subDomainId: '2-17',
  },
  {
    controlId: '2-17-P-2',
    name: 'Cybersecurity requirements for usage of information and data media within the CSP shall be applied',
    mainDomainId: 2,
    subDomainId: '2-17',
  },
  {
    controlId: '2-17-P-3',
    name: 'Cybersecurity requirements for usage of information and data media within the CSP',
    mainDomainId: 2,
    subDomainId: '2-17',
  },
  {
    controlId: '2-17-P-4',
    name: 'Cybersecurity requirements for usage of information and data media within the CSP shall be applied and reviewed periodically',
    mainDomainId: 2,
    subDomainId: '2-17',
  },
  {
    controlId: '3-1-P-1',
    name: 'Cybersecurity Resilience CSP Control',
    mainDomainId: 3,
    subDomainId: '3-1',
  },
  {
    controlId: '3-1-T-1',
    name: 'Cybersecurity Resilience CST Control',
    mainDomainId: 3,
    subDomainId: '3-1',
  },
  {
    controlId: '4-1-P-1',
    name: 'Third party Cybersecurity CSP Control',
    mainDomainId: 4,
    subDomainId: '4-1',
  },
];

async function validateControl(control: (typeof controlsToImport)[0]) {
  // Validate control ID format (e.g., "1-1-P-1")
  const controlIdPattern = /^\d+-\d+-[A-Z]-\d+$/;
  if (!controlIdPattern.test(control.controlId)) {
    throw new Error(`Invalid control ID format for ${control.controlId}`);
  }
}

async function seedControls() {
  try {
    await connect(process.env.MONGODB_URI || '');
    console.log('Connected to MongoDB');

    // Clear existing controls
    await MainControl.deleteMany({});
    console.log('Cleared existing controls');

    // Insert new controls
    await MainControl.insertMany(controlsToImport);
    console.log('Inserted new controls');

    await disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding controls:', error);
    process.exit(1);
  }
}

seedControls();
