import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/user.model';

dotenv.config();

export const createAdmin = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mern_auth';
  const name = process.env.ADMIN_NAME || 'System Administrator';
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  console.log('🔒 Initializing Admin Account Creation...');

  if (!email || !password) {
    console.error('❌ Error: ADMIN_EMAIL and ADMIN_PASSWORD must be configured in .env');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('❌ Error: ADMIN_PASSWORD must be at least 8 characters long for production security.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // 1. Check if user with this email already exists
    const existingByEmail = await User.findOne({ email });
    if (existingByEmail) {
      console.warn(`⚠️ Warning: An account with email "${email}" already exists (Role: ${existingByEmail.role}).`);
      console.warn('🛡️ Duplicate admin creation prevented.');
      await mongoose.disconnect();
      return;
    }

    // 2. Check if an admin already exists in the system
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.warn(`⚠️ Warning: An admin account already exists in the system (${existingAdmin.email}).`);
      console.warn('🛡️ Duplicate admin creation prevented.');
      await mongoose.disconnect();
      return;
    }

    // 3. Hash password with bcrypt
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create the initial admin account
    const adminUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
    });

    console.log('🎉 Initial Admin Account Created Successfully:');
    console.log(`   - Name:  ${adminUser.name}`);
    console.log(`   - Email: ${adminUser.email}`);
    console.log(`   - Role:  ${adminUser.role}`);
    console.log(`   - ID:    ${adminUser.id}`);
  } catch (err: any) {
    console.error('❌ Error creating admin account:', err.message || err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Execute if run directly
if (require.main === module || process.argv[1]?.includes('create-admin')) {
  createAdmin().catch((err) => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
}
