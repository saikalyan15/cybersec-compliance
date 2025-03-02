import bcrypt from 'bcryptjs';
import dbConnect from './dbConnect';
import User from '../models/User';

export async function createAdminUser() {
  try {
    await dbConnect();

    // Check if admin already exists
    const adminExists = await User.findOne({ username: 'admin' });
    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user with explicit field values
    const adminUser = await User.create({
      firstName: 'System',
      lastName: 'Admin',
      designation: 'System Administrator',
      username: 'admin',
      email: 'admin@cybersec.com',
      password: await bcrypt.hash('admin123', 12),
      role: 'admin',
    });

    console.log('Admin user created successfully:', adminUser.username);
    return adminUser;
  } catch (error) {
    console.error(
      'Error creating admin user:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    // Don't throw the error, just log it
    return null;
  }
}
