import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('');
    console.error('💡 Troubleshooting:');
    console.error('1. Make sure MongoDB is running on your machine');
    console.error('2. Check if .env file exists in backend directory');
    console.error('3. Verify MONGODB_URI in .env file');
    console.error('');
    console.error('To start MongoDB:');
    console.error('- Windows: Run "mongod" in command prompt');
    console.error('- Mac/Linux: Run "sudo systemctl start mongod"');
    process.exit(1);
  }
};

export default connectDB;
