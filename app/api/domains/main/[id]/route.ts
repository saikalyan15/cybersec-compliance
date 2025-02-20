import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/app/lib/dbConnect';
import MainDomain from '@/app/models/MainDomain';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !['admin', 'owner'].includes(session.user?.role as string)
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    await dbConnect();

    const domain = await MainDomain.findByIdAndUpdate(params.id, data, {
      new: true,
    });

    if (!domain) {
      return NextResponse.json(
        { error: 'Main domain not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(domain);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update main domain' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !['admin', 'owner'].includes(session.user?.role as string)
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const domain = await MainDomain.findByIdAndDelete(params.id);

    if (!domain) {
      return NextResponse.json(
        { error: 'Main domain not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Main domain deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete main domain' },
      { status: 500 }
    );
  }
}
