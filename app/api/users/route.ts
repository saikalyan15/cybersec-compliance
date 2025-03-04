import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import { getServerSession } from 'next-auth';
import dbConnect from '@/app/lib/dbConnect';
import User from '@/app/models/User';
import { authOptions } from '@/app/api/auth/options';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    console.log('Session in API:', session); // Debug log

    if (!session) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    if (!['admin', 'owner'].includes(session.user?.role as string)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await dbConnect();
    console.log('Database connected'); // Debug log

    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    console.log('Users found:', users.length); // Debug log

    return NextResponse.json(users);
  } catch (error) {
    console.error('API Error:', error); // Debug log
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
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

    const {
      firstName,
      lastName,
      designation,
      username,
      email,
      password,
      role,
    } = await request.json();

    // Validate all required fields
    if (
      !firstName ||
      !lastName ||
      !designation ||
      !username ||
      !email ||
      !password ||
      !role
    ) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 400 }
      );
    }

    // Create new user - password will be hashed by the model's pre-save middleware
    const user = await User.create({
      firstName,
      lastName,
      designation,
      username,
      email,
      password, // Plain password - will be hashed by the model
      role,
    });

    // Return user without password
    const userWithoutPassword = await User.findById(user._id).select(
      '-password'
    );

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
