import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import MenuItem from './models/MenuItem.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'seedMenu.json'), 'utf8'));

const importData = async () => {
  try {
    const isConnected = await connectDB();
    if (!isConnected) {
      console.log('Skipping MongoDB seeding as MongoDB is not running locally.');
      process.exit(0);
    }

    await MenuItem.deleteMany({});
    await MenuItem.insertMany(seedData);

    console.log('✅ Menu Data successfully seeded into MongoDB database!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

importData();
