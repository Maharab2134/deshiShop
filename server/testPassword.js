const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const testPassword = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully');

    // Find the admin user
    const adminUser = await User.findOne({ email: 'admin@gmail.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }

    console.log('✅ Admin user found:', adminUser.email);
    console.log('📋 Current password hash:', adminUser.password);
    
    // Test password "admin123"
    const isMatch = await bcrypt.compare('admin123', adminUser.password);
    console.log('🔐 Password "admin123" matches:', isMatch);
    
    if (!isMatch) {
      console.log('❌ Password "admin123" does not match');
      
      // Test common password variations
      console.log('\n🔍 Testing common password variations:');
      const variations = [
        'Admin123', 'admin', 'password', '123456', 'admin1234', 
        'admin@123', 'Admin@123', 'admin123!', 'Admin123!'
      ];
      
      for (const variation of variations) {
        const variationMatch = await bcrypt.compare(variation, adminUser.password);
        console.log(`Password "${variation}" matches: ${variationMatch}`);
        if (variationMatch) {
          console.log('🎉 Found matching password:', variation);
          break;
        }
      }
      
      // If no variation matches, reset the password
      if (!isMatch) {
        console.log('\n🔄 No matching password found. Resetting to "admin123"...');
        const hashedPassword = await bcrypt.hash('admin123', 12);
        adminUser.password = hashedPassword;
        await adminUser.save();
        console.log('✅ Password reset to "admin123"');
      }
    } else {
      console.log('✅ Password "admin123" is correct!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testPassword();