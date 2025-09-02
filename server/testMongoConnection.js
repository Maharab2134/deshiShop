const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB Atlas connected successfully!');
    
    // Test if we can query the users collection
    const User = require('./models/User');
    const adminUser = await User.findOne({ email: 'admin@gmail.com' });
    
    if (adminUser) {
      console.log('✅ Admin user found:', adminUser.email);
      console.log('✅ User role:', adminUser.role);
    } else {
      console.log('❌ Admin user not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

testConnection();