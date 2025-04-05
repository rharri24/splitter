// StudentDatabase.js
import mongoose from 'mongoose';
import 'dotenv/config';

class StudentDatabase {
  constructor() {
    this.connected = false;
  }

  async connect() {
    if (!this.connected) {
      const mongoUri = process.env.MONGODB_URI;
      //console.log("Checking MongoDB URI:", mongoUri); // Debugging Line
      if (!mongoUri) {
        console.error("Missing MONGODB_URI in environment variables!");
        process.exit(1);
      }

      await mongoose.connect(mongoUri);
      console.log("Connected to MongoDB! with mongoose"); 
      this.connected = true;
    }
  }

  async disconnect() {
    if (this.connected) {
      await mongoose.connection.close();
      console.log("Disconnected from MongoDB");
      this.connected = false;
    }
  }
}

export const studentDatabase = new StudentDatabase();