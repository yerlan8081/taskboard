import mongoose from 'mongoose';

let isConnected = false;

export async function connectToDatabase(uri?: string) {
  const mongoUri = uri || process.env.MONGO_URI || process.env.MONGO_URL;

  if (!mongoUri) {
    throw new Error('MONGO_URI is not defined');
  }

  if (!isConnected) {
    await mongoose.connect(mongoUri);
    isConnected = true;
    console.log('Connected to MongoDB');
  }
}

export async function disconnectFromDatabase() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
}

export async function dropDatabase() {
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
}
