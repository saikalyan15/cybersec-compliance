import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import { getServerSession } from 'next-auth';
import MainControl from '@/app/models/MainControl';
import connectToMongo from '@/app/lib/mongodb';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type RouteParams = Promise<{ controlId: string }>;

export async function GET(request: Request, props: { params: RouteParams }) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToMongo();
    const { controlId } = await props.params;
    const control = await MainControl.findOne({
      controlId,
    });

    if (!control) {
      return NextResponse.json({ error: 'Control not found' }, { status: 404 });
    }

    return NextResponse.json(control.levelRequirements);
  } catch (error) {
    console.error('Error fetching control requirements:', error);
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
    const { controlId } = await props.params;
    const requirements = await request.json();

    const control = await MainControl.findByIdAndUpdate(
      controlId,
      { levelRequirements: requirements },
      { new: true }
    );

    if (!control) {
      return NextResponse.json({ error: 'Control not found' }, { status: 404 });
    }

    return NextResponse.json(control.levelRequirements);
  } catch (error) {
    console.error('Error updating level requirements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
