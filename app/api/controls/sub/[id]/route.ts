import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/options';
import dbConnect from '@/app/lib/dbConnect';
import SubControl from '@/app/models/SubControl';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
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
    const subControl = await SubControl.findByIdAndUpdate(
      id,
      {
        subControlId,
        name,
        controlId,
        mainDomainId,
        subDomainId,
      },
      { new: true }
    );

    if (!subControl) {
      return NextResponse.json(
        { error: 'Sub-control not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(subControl);
  } catch (error) {
    console.error('Error in PUT /api/controls/sub/[id]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const session = await getServerSession(authOptions);
    if (
      !session ||
      (session.user?.role !== 'admin' && session.user?.role !== 'owner')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const subControl = await SubControl.findByIdAndDelete(id);

    if (!subControl) {
      return NextResponse.json(
        { error: 'Sub-control not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Sub-control deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/controls/sub/[id]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
