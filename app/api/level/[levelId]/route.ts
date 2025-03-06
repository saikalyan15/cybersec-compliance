import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import { getServerSession } from 'next-auth';
import Level from '@/app/models/Level';
import connectToMongo from '@/app/lib/mongodb';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type RouteParams = Promise<{ levelId: string }>;

export async function GET(request: Request, props: { params: RouteParams }) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToMongo();
    const { levelId } = await props.params;
    const level = await Level.findOne({
      levelId: parseInt(levelId),
    });

    if (!level) {
      return NextResponse.json({ error: 'Level not found' }, { status: 404 });
    }

    return NextResponse.json(level);
  } catch (error) {
    console.error('Error fetching level:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, props: { params: RouteParams }) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToMongo();
    const { levelId } = await props.params;
    const updates = await request.json();

    const level = await Level.findOneAndUpdate(
      { levelId: parseInt(levelId) },
      updates,
      { new: true }
    );

    if (!level) {
      return NextResponse.json({ error: 'Level not found' }, { status: 404 });
    }

    return NextResponse.json(level);
  } catch (error) {
    console.error('Error updating level:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, props: { params: RouteParams }) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToMongo();
    const { levelId } = await props.params;
    const level = await Level.findOneAndDelete({
      levelId: parseInt(levelId),
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
