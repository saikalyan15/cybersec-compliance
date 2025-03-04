import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import mongoose from 'mongoose';
import dbConnect from '@/app/lib/dbConnect';
import User from '@/app/models/User';

export async function GET() {
  try {
    // Ensure database connection is established
    await dbConnect();

    // Check if connection is ready
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database connection not ready');
    }

    // Use a type guard to check if db exists before accessing it
    if (!mongoose.connection.db) {
      throw new Error('Database not available on connection');
    }

    const collections = await mongoose.connection.db.collections();
    console.log(
      'Available collections:',
      collections.map((c) => c.collectionName)
    );

    return NextResponse.json({
      status: 'Connected to MongoDB',
      collections: collections.map((c) => c.collectionName),
    });
  } catch (error) {
    console.error('Setup API error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Database connection error',
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Connect to database and log connection state
    await dbConnect();
    console.log('MongoDB Connection State:', mongoose.connection.readyState);

    if (!mongoose.connection.db) {
      throw new Error('Database not available on connection');
    }
    // Log the current collections
    const collections = await mongoose.connection.db.collections();
    console.log(
      'Available collections:',
      collections.map((c) => c.collectionName)
    );

    // Drop the users collection if it exists
    try {
      await mongoose.connection.db.dropCollection('users');
      console.log('Dropped existing users collection');
    } catch {
      // Collection might not exist, ignore error
      console.log('No users collection to drop');
    }

    // Create admin data
    const adminData = {
      firstName: 'System',
      lastName: 'Admin',
      designation: 'System Administrator',
      username: 'admin',
      email: 'admin@cybersec.com',
      password: 'admin@123',
      role: 'admin',
    };

    console.log('Creating admin user...');

    // Create the user
    const adminUser = await User.create(adminData);

    console.log('Admin user created successfully');

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: adminUser._id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role,
      },
    });
  } catch (error) {
    console.error(
      'Error creating admin user:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    // Don't throw the error, just log it
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create admin user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
      }
    );
  }
}
