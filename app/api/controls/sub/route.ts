import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/options';
import dbConnect from '@/app/lib/dbConnect';
import SubControl from '@/app/models/SubControl';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const subControls = await SubControl.find({}).sort({ subControlId: 1 });
    return NextResponse.json(subControls);
  } catch (error) {
    console.error('Error in GET /api/controls/sub:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      (session.user?.role !== 'admin' && session.user?.role !== 'owner')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subControlId, name, controlId } = body;

    if (!subControlId || !name || !controlId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Parse domain and subdomain IDs from the sub-control ID
    const [domainId, subDomainNumber] = subControlId.split('-');
    const mainDomainId = parseInt(domainId);
    const subDomainId = `${domainId}-${subDomainNumber}`;

    await dbConnect();
    const subControl = await SubControl.create({
      subControlId,
      name,
      controlId,
      mainDomainId,
      subDomainId,
    });

    return NextResponse.json(subControl);
  } catch (error) {
    console.error('Error in POST /api/controls/sub:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
