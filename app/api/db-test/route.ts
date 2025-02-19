import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined');
    }

    console.log('Testing connection...');

    // Try to connect with a short timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    console.log('Connection successful');

    // Clean up
    await mongoose.disconnect();

    return NextResponse.json({
      success: true,
      message: 'Successfully connected to MongoDB',
    });
  } catch (error) {
    console.error('Connection test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
