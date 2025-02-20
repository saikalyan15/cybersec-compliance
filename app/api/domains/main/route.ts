import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/app/lib/dbConnect';
import MainDomain from '@/app/models/MainDomain';

export async function GET() {
  try {
    await dbConnect();
    const domains = await MainDomain.find().sort({ domainId: 1 });
    return NextResponse.json(domains);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch main domains' },
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

    const domain = await MainDomain.create(data);
    return NextResponse.json(domain);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create main domain' },
      { status: 500 }
    );
  }
}
