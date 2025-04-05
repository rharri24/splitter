import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI;

mongoose.connect(mongoUri)
  .then(() => console.log("Successfully connected to MongoDB!"))
  .catch(err => console.error(" Connection failed:", err));
