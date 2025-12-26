// Setup script to create initial admin user
// Run with: node scripts/setup-admin.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Note: URL encode @ as %40 in password
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://shobhitsourceryit_db_user:Shobhit%405655@cluster0.ajvggdr.mongodb.net/service_center?retryWrites=true&w=majority&appName=Cluster0';

const StaffSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['owner', 'admin', 'invoice_biller'] },
  mobile: String,
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
});

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const Staff = mongoose.model('Staff', StaffSchema);

    // Check if admin already exists
    const existingAdmin = await Staff.findOne({ email: 'admin@servicecenter.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const admin = new Staff({
      name: 'Admin User',
      email: 'admin@servicecenter.com',
      password: hashedPassword,
      role: 'owner',
      mobile: '1234567890',
      is_active: true,
    });

    await admin.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@servicecenter.com');
    console.log('Password: admin123');
    console.log('Please change the password after first login!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdmin();

