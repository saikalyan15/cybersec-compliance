import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import { getServerSession } from 'next-auth';
import dbConnect from '@/app/lib/dbConnect';
import MainControl from '@/app/models/MainControl';
import MainDomain from '@/app/models/MainDomain';
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

    // Extract domain ID from control ID (first number)
    const mainDomainId = parseInt(data.controlId.split('-')[0]);

    // Extract subdomain ID (first two parts)
    const subDomainId = data.controlId.split('-').slice(0, 2).join('-');

    // Validate mainDomainId exists
    const mainDomain = await MainDomain.findOne({ domainId: mainDomainId });
    if (!mainDomain) {
      return NextResponse.json(
        { error: 'Main domain not found' },
        { status: 404 }
      );
    }

    // Validate subDomainId exists
    const subDomain = await SubDomain.findOne({ subDomainId: subDomainId });
    if (!subDomain) {
      return NextResponse.json(
        { error: 'Sub domain not found' },
        { status: 404 }
      );
    }

    // Set the domain IDs
    data.mainDomainId = mainDomainId;
    data.subDomainId = subDomainId;

    const control = await MainControl.findByIdAndUpdate(
      id,
      {
        controlId: data.controlId,
        name: data.name,
        mainDomainId: data.mainDomainId,
        subDomainId: data.subDomainId,
      },
      { new: true }
    );

    if (!control) {
      return NextResponse.json(
        { error: 'Main control not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(control);
  } catch (err) {
    console.error('Update control error:', err);
    return NextResponse.json(
      { error: 'Failed to update main control' },
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
    const control = await MainControl.findByIdAndDelete(id);

    if (!control) {
      return NextResponse.json(
        { error: 'Main control not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Main control deleted successfully' });
  } catch (err) {
    console.error('Delete control error:', err);
    return NextResponse.json(
      { error: 'Failed to delete main control' },
      { status: 500 }
    );
  }
}
