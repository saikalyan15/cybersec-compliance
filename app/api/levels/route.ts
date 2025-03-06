import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import Level from '@/app/models/Level';
import connectToMongo from '@/app/lib/mongodb';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    await connectToMongo();
    const levels = await Level.find().sort({ levelId: 1 });
    return NextResponse.json(levels);
  } catch (error) {
    console.error('Error fetching levels:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToMongo();
    const data = await request.json();
    const level = await Level.create(data);
    return NextResponse.json(level);
  } catch (error) {
    console.error('Error creating level:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
