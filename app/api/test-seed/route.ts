import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import User from '@/app/models/User';
import seedDatabase from '@/app/lib/seedDb';

export async function GET() {
  try {
    // Connect to database
    await dbConnect();

    // Check if admin exists
    const adminUser = await User.findOne({ username: 'admin' });

    if (!adminUser) {
      console.log('Admin user not found, running seed...');
      await seedDatabase();

      // Verify seeding
      const verifiedAdmin = await User.findOne({ username: 'admin' });
      if (verifiedAdmin) {
        return NextResponse.json({
          success: true,
          message: 'Admin user created successfully',
          user: {
            username: verifiedAdmin.username,
            email: verifiedAdmin.email,
            role: verifiedAdmin.role,
          },
        });
      } else {
        throw new Error('Failed to create admin user');
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user already exists',
      user: {
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role,
      },
    });
  } catch (error) {
    console.error('Test seed error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
