import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/app/lib/dbConnect';
import SubDomain from '@/app/models/SubDomain';
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

    // Validate mainDomainId exists
    const mainDomain = await MainDomain.findOne({
      domainId: data.mainDomainId,
    });
    if (!mainDomain) {
      return NextResponse.json(
        { error: 'Main domain not found' },
        { status: 404 }
      );
    }

    // Validate subDomainId format
    const subDomainIdPattern = /^\d+-\d+$/;
    if (!subDomainIdPattern.test(data.subDomainId)) {
      return NextResponse.json(
        { error: 'Invalid sub domain ID format. Should be like "1-1"' },
        { status: 400 }
      );
    }

    // Check if new subDomainId already exists (excluding current document)
    const existingSubDomain = await SubDomain.findOne({
      subDomainId: data.subDomainId,
      _id: { $ne: params.id },
    });
    if (existingSubDomain) {
      return NextResponse.json(
        { error: 'Sub domain ID already exists' },
        { status: 400 }
      );
    }

    const subDomain = await SubDomain.findByIdAndUpdate(params.id, data, {
      new: true,
    });

    if (!subDomain) {
      return NextResponse.json(
        { error: 'Sub domain not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(subDomain);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update sub domain' },
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
    const subDomain = await SubDomain.findByIdAndDelete(params.id);

    if (!subDomain) {
      return NextResponse.json(
        { error: 'Sub domain not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Sub domain deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete sub domain' },
      { status: 500 }
    );
  }
}
