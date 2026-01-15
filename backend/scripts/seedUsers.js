import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const defaultUsers = [
  {
    email: 'student@example.com',
    password: 'student123',
    name: 'Student One',
    role: 'student'
  },
  {
    email: 'warden@example.com',
    password: 'warden123',
    name: 'Warden',
    role: 'warden'
  },
  {
    email: 'security@example.com',
    password: 'security123',
    name: 'Security',
    role: 'security'
  }
];

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_db');
    console.log('✅ Connected to MongoDB');

    // Clear existing users (optional - comment out if you want to keep existing users)
    // await User.deleteMany({});

    for (const userData of defaultUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`⏭️  User ${userData.email} already exists, skipping...`);
      } else {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Created user: ${userData.email} (${userData.role})`);
      }
    }

    console.log('🎉 Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedUsers();

