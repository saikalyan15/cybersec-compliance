import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';

// GET a single user by ID
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params Promise to get the actual params object
    const params = await context.params;
    const userId = params.id;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

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
    const user = await db.collection('users').findOne(
      { _id: userObjectId },
      { projection: { password: 0 } } // Exclude password field
    );

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT (update) a user
export async function PUT(
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

    const data = await request.json();

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

    // Update user
    const result = await db.collection('users').updateOne(
      { _id: userObjectId },
      {
        $set: {
          ...data,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE a user
export async function DELETE(
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

    // Delete user
    const result = await db
      .collection('users')
      .deleteOne({ _id: userObjectId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
