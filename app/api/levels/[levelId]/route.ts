import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Level from '@/app/models/Level';

export async function GET(
  request: Request,
  { params }: { params: { levelId: string } }
) {
  try {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI || '');
    }

    const level = await Level.findOne({ levelId: parseInt(params.levelId) });

    if (!level) {
      return NextResponse.json({ error: 'Level not found' }, { status: 404 });
    }

    return NextResponse.json(level);
  } catch (error) {
    console.error('Failed to fetch level:', error);
    return NextResponse.json(
      { error: 'Failed to fetch level' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { levelId: string } }
) {
  try {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI || '');
    }

    const body = await request.json();
    const level = await Level.findOneAndUpdate(
      { levelId: parseInt(params.levelId) },
      body,
      { new: true }
    );

    if (!level) {
      return NextResponse.json({ error: 'Level not found' }, { status: 404 });
    }

    return NextResponse.json(level);
  } catch (error) {
    console.error('Failed to update level:', error);
    return NextResponse.json(
      { error: 'Failed to update level' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { levelId: string } }
) {
  try {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI || '');
    }

    const level = await Level.findOneAndDelete({
      levelId: parseInt(params.levelId),
    });

    if (!level) {
      return NextResponse.json({ error: 'Level not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Level deleted successfully' });
  } catch (error) {
    console.error('Failed to delete level:', error);
    return NextResponse.json(
      { error: 'Failed to delete level' },
      { status: 500 }
    );
  }
}
