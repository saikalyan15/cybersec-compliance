import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Level from '@/app/models/Level';

export async function GET() {
  try {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI || '');
    }

    const levels = await Level.find({}).sort({ levelId: 1 });
    return NextResponse.json(levels);
  } catch (error) {
    console.error('Failed to fetch levels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch levels' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI || '');
    }

    const body = await request.json();

    // Validate levelId range
    if (body.levelId < 1 || body.levelId > 4) {
      return NextResponse.json(
        { error: 'Level ID must be between 1 and 4' },
        { status: 400 }
      );
    }

    // Check if level already exists
    const existingLevel = await Level.findOne({ levelId: body.levelId });
    if (existingLevel) {
      return NextResponse.json(
        { error: 'Level ID already exists' },
        { status: 409 }
      );
    }

    const level = await Level.create(body);
    return NextResponse.json(level, { status: 201 });
  } catch (error) {
    console.error('Failed to create level:', error);
    return NextResponse.json(
      { error: 'Failed to create level' },
      { status: 500 }
    );
  }
}
