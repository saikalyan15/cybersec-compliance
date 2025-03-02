import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/app/lib/dbConnect';
import SubDomain from '@/app/models/SubDomain';
import { authOptions } from '@/app/api/auth/options';

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

    const subDomain = await SubDomain.findByIdAndUpdate(
      id,
      {
        mainDomainId: data.mainDomainId,
        subDomainId: data.subDomainId,
        name: data.name,
      },
      { new: true }
    );

    if (!subDomain) {
      return NextResponse.json(
        { error: 'Sub domain not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(subDomain);
  } catch (err) {
    console.error('Update subdomain error:', err);
    return NextResponse.json(
      { error: 'Failed to update sub domain' },
      { status: 500 }
    );
  }
}

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
    const subDomain = await SubDomain.findByIdAndDelete(id);

    if (!subDomain) {
      return NextResponse.json(
        { error: 'Sub domain not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Sub domain deleted successfully' });
  } catch (err) {
    console.error('Delete subdomain error:', err);
    return NextResponse.json(
      { error: 'Failed to delete sub domain' },
      { status: 500 }
    );
  }
}
