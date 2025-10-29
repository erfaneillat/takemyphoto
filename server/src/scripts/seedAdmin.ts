import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { AdminModel } from '../infrastructure/database/models/AdminModel';

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nero';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get admin credentials from environment
    const emailRaw = process.env.ADMIN_EMAIL || 'admin@nero.com';
    const email = emailRaw.toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const name = process.env.ADMIN_NAME || 'Admin';

    // Check if admin already exists
    const existingAdmin = await AdminModel.findOne({ email });
    if (existingAdmin) {
      console.log(`Admin user already exists for email: ${email}`);
      await mongoose.disconnect();
      return process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    await AdminModel.create({ email, password: hashedPassword, name });

    console.log('Admin user created successfully');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('Please change the password after first login');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error: any) {
    if (error?.code === 11000) {
      console.error('Error: Duplicate admin email. An admin with this email already exists.');
    } else {
      console.error('Error seeding admin:', error?.message || error);
    }
    try {
      await mongoose.disconnect();
    } catch {}
    process.exit(1);
  }
};

seedAdmin();
