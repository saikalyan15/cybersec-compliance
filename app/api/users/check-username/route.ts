import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import dbConnect from '@/app/lib/dbConnect';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import User from '@/app/models/User';

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get username from request body
    const data = await request.json();
    const { username } = data;

    if (!username) {
      return NextResponse.json(
        { message: 'Username is required' },
        { status: 400 }
      );
    }

    // Check if username exists
    const existingUser = await User.findOne({ username });
    return NextResponse.json({ exists: !!existingUser });
  } catch (error) {
    console.error('Error checking username:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
