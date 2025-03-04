import { connect, disconnect } from 'mongoose';
import Level from '../app/models/Level';

const levelsToImport = [
  {
    levelId: 1,
    description:
      'A classification level applies to data classified as a (top secret) based on what is issued by the competent authority.',
  },
  {
    levelId: 2,
    description:
      'A classification level applies to data classified as a (secret) based on what is issued by the competent authority.',
  },
  {
    levelId: 3,
    description:
      'A classification level applies to data classified as a (confidential) based on what is issued by the competent authority.',
  },
  {
    levelId: 4,
    description:
      'A classification level applies to data classified as a (public) based on what is issued by the competent authority.',
  },
];

async function importLevels() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    let successCount = 0;
    let failureCount = 0;

    for (const level of levelsToImport) {
      try {
        await Level.findOneAndUpdate({ levelId: level.levelId }, level, {
          upsert: true,
          new: true,
        });
        console.log(`Successfully processed level: ${level.levelId}`);
        successCount++;
      } catch (error) {
        console.error(
          `Failed to process level ${level.levelId}:`,
          error instanceof Error ? error.message : 'Unknown error'
        );
        failureCount++;
      }
    }

    console.log('\nImport Summary:');
    console.log(`Total levels processed: ${levelsToImport.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${failureCount}`);
  } catch (error) {
    console.error(
      'Error:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    process.exit(1);
  } finally {
    await disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the import if this script is executed directly
if (require.main === module) {
  importLevels().catch((error) => {
    console.error('Failed to import levels:', error);
    process.exit(1);
  });
}
