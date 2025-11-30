import mongoose from 'mongoose';

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MongoDB Connection Error: MONGODB_URI is not defined');
    process.exit(1);
  }

  const maxRetries = parseInt(process.env.DB_MAX_RETRIES || '5', 10);
  const baseDelay = parseInt(process.env.DB_RETRY_DELAY_MS || '2000', 10); // 2s default

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      const isLast = attempt === maxRetries;
      console.error(`❌ MongoDB Connection Error (attempt ${attempt}/${maxRetries}): ${error.message}`);
      if (isLast) {
        console.error('💥 Exhausted all retries. Exiting.');
        process.exit(1);
      } else {
        const delay = baseDelay * attempt; // linear backoff
        console.log(`🔄 Retrying in ${(delay / 1000).toFixed(1)}s ...`);
        await sleep(delay);
      }
    }
  }
};

export default connectDB;
