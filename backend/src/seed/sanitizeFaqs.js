import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const faqSchema = new mongoose.Schema({
  question: String,
  answer: String,
  order: Number
}, { timestamps: true });

const Faq = mongoose.model('Faq', faqSchema);

async function sanitize() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("No MONGO_URI found in env");
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB cluster successfully.");
    
    const faqs = await Faq.find().sort({ order: 1, createdAt: 1 });
    console.log(`Found ${faqs.length} FAQs in database.`);
    
    let counter = 1;
    for (const faq of faqs) {
      faq.order = counter;
      await faq.save();
      console.log(`Updated FAQ "${faq.question}" to order ${counter}`);
      counter++;
    }
    
    console.log("Sanitization complete. All FAQs have unique sequential orders.");
    await mongoose.disconnect();
  } catch (err) {
    console.error("Sanitization failed:", err);
  }
}

sanitize();
