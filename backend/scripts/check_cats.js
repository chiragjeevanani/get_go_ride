import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGO_URI;

async function checkDb() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }));
    const cats = await Category.find({});
    console.log('Categories in DB:');
    cats.forEach(c => console.log(`- ${c.name} (slug: ${c.slug})`));

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkDb();
