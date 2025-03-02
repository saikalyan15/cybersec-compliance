import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/options';
import dbConnect from '@/app/lib/dbConnect';
import SubDomain from '@/app/models/SubDomain';
import MainDomain from '@/app/models/MainDomain';

export async function GET() {
  try {
    await dbConnect();
    const subDomains = await SubDomain.find().sort({ subDomainId: 1 });
    return NextResponse.json(subDomains);
  } catch (err) {
    console.error('Fetch sub domains error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch sub domains' },
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

    // Validate mainDomainId exists
    await dbConnect();
    const mainDomain = await MainDomain.findOne({
      domainId: data.mainDomainId,
    });
    if (!mainDomain) {
      return NextResponse.json(
        { error: 'Main domain not found' },
        { status: 404 }
      );
    }

    // Validate subDomainId format (e.g., "1-1")
    const subDomainIdPattern = /^\d+-\d+$/;
    if (!subDomainIdPattern.test(data.subDomainId)) {
      return NextResponse.json(
        { error: 'Invalid sub domain ID format. Should be like "1-1"' },
        { status: 400 }
      );
    }

    // Check if subDomainId already exists
    const existingSubDomain = await SubDomain.findOne({
      subDomainId: data.subDomainId,
    });
    if (existingSubDomain) {
      return NextResponse.json(
        { error: 'Sub domain ID already exists' },
        { status: 400 }
      );
    }

    const subDomain = await SubDomain.create(data);
    return NextResponse.json(subDomain);
  } catch (err) {
    console.error('Create sub domain error:', err);
    return NextResponse.json(
      { error: 'Failed to create sub domain' },
      { status: 500 }
    );
  }
}
