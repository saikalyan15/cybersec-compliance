import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({
      status: 'Connected to MongoDB successfully',
      time: new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      'DB Connection error:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return NextResponse.json(
      {
        error: 'Failed to connect to database',
        details: error instanceof Error ? error.message : 'Unknown error',
        time: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
