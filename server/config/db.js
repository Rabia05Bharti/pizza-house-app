import mongoose from 'mongoose';

export const connectDB = async () => {
  const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pizzahouse';
  try {
    const conn = await mongoose.connect(connString, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[Database Warning] MongoDB local instance not reachable (${error.message}). Running with high-performance in-memory dataset.`);
    return false;
  }
};
