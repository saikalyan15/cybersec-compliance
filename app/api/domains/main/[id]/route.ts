import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import { getServerSession } from 'next-auth';
import dbConnect from '@/app/lib/dbConnect';
import MainDomain from '@/app/models/MainDomain';
import { authOptions } from '@/app/api/auth/options';

// PUT handler with the correct type signature for Next.js 15+
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);

    if (
      !session ||
      !['admin', 'owner'].includes(session.user?.role as string)
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    await dbConnect();

    const domain = await MainDomain.findByIdAndUpdate(
      id,
      {
        domainId: data.domainId,
        name: data.name,
      },
      { new: true }
    );

    if (!domain) {
      return NextResponse.json(
        { error: 'Main domain not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(domain);
  } catch (err) {
    console.error('Update domain error:', err);
    return NextResponse.json(
      { error: 'Failed to update main domain' },
      { status: 500 }
    );
  }
}

// DELETE handler with the correct type signature for Next.js 15+
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);

    if (
      !session ||
      !['admin', 'owner'].includes(session.user?.role as string)
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const domain = await MainDomain.findByIdAndDelete(id);

    if (!domain) {
      return NextResponse.json(
        { error: 'Main domain not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Main domain deleted successfully' });
  } catch (err) {
    console.error('Delete domain error:', err);
    return NextResponse.json(
      { error: 'Failed to delete main domain' },
      { status: 500 }
    );
  }
}
