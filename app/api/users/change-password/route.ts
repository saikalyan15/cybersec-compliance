import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import connectDB from '@/app/lib/mongodb';
import User from '@/app/models/User';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface IUser extends mongoose.Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  password: string;
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, currentPassword, newPassword } = await request.json();

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    if (!mongoose.isValidObjectId(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Find user
    const user = (await User.findById(userId)) as IUser;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
