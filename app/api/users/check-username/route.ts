import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (
      !session ||
      (session.user.role !== 'admin' && session.user.role !== 'owner')
    ) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get username from query parameters
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { message: 'Username is required' },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await dbConnect();

    // Check if username exists
    const existingUser = await db.collection('users').findOne({ username });

    return NextResponse.json({ exists: !!existingUser });
  } catch (error) {
    console.error('Error checking username:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
