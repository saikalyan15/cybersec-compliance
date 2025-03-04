import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/options';
import dbConnect from '@/app/lib/dbConnect';
import MainControl from '@/app/models/MainControl';
import MainDomain from '@/app/models/MainDomain';
import SubDomain from '@/app/models/SubDomain';

export async function GET() {
  try {
    await dbConnect();
    const controls = await MainControl.find().sort({ controlId: 1 });
    return NextResponse.json(controls);
  } catch (err) {
    console.error('Fetch controls error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch main controls' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const control = await MainControl.create(data);
    return NextResponse.json(control);
  } catch (err) {
    console.error('Create control error:', err);
    return NextResponse.json(
      { error: 'Failed to create main control' },
      { status: 500 }
    );
  }
}
