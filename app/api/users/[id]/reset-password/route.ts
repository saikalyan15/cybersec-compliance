import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import dbConnect from '@/app/lib/dbConnect';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import bcrypt from 'bcryptjs';
import { generateRandomPassword } from '@/app/lib/utils';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params Promise to get the actual params object
    const params = await context.params;
    const userId = params.id;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (
      !session ||
      (session.user.role !== 'admin' && session.user.role !== 'owner')
    ) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('Resetting password for user ID:', userId);

    // Connect to database
    const db = await dbConnect();

    // Try to convert to ObjectId if it's a valid format
    let userObjectId;
    try {
      userObjectId = new ObjectId(userId);
    } catch (error) {
      console.error('Invalid ObjectId format:', error);
      return NextResponse.json(
        { message: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db.collection('users').findOne({ _id: userObjectId });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Generate a new random password
    const newPassword = generateRandomPassword();

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user with new password and set passwordResetRequired flag
    const result = await db.collection('users').updateOne(
      { _id: userObjectId },
      {
        $set: {
          password: hashedPassword,
          passwordResetRequired: true,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Failed to update user password' },
        { status: 500 }
      );
    }

    // Return the new password (in a real app, you might email this instead)
    return NextResponse.json({
      message: 'Password reset successfully',
      newPassword: newPassword,
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
