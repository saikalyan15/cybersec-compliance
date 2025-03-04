import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import mongoose from 'mongoose';

export async function GET() {
  try {
    // Check if we're already connected
    if (mongoose.connection.readyState === 1) {
      return NextResponse.json({ status: 'Connected to MongoDB' });
    }

    // Try to connect
    await mongoose.connect(process.env.MONGODB_URI || '');

    return NextResponse.json({ status: 'Successfully connected to MongoDB' });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return NextResponse.json(
      { status: 'Failed to connect to MongoDB', error: String(error) },
      { status: 500 }
    );
  }
}
