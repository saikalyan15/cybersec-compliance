import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import connectDB from '@/app/lib/mongodb';
import User from '@/app/models/User';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await User.findById(params.id);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { password } = await request.json();

    // Update user's password
    user.password = password;
    await user.save();

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
