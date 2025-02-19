import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/app/models/User';
import dbConnect from '@/app/lib/dbConnect';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    await dbConnect();

    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
      });
    }

    const isValid = await bcrypt.compare(password, user.password);

    return NextResponse.json({
      success: true,
      passwordMatch: isValid,
      passwordAttempted: password,
      // Don't send the actual hash in production!
      passwordHash:
        process.env.NODE_ENV === 'development' ? user.password : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
