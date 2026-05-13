import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGO_URI;
const REQ_ID = '6a041483ebdfcaf6181c789b';
const VENDOR_ID = '69fc72ce3fc531187ff5195d';

async function checkDb() {
  try {
    console.log('Connecting to MongoDB...');
    if (!MONGODB_URI) throw new Error('MONGO_URI is not defined in .env');
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const Bid = mongoose.model('Bid', new mongoose.Schema({}, { strict: false }));
    const Requirement = mongoose.model('Requirement', new mongoose.Schema({}, { strict: false }));
    const Vendor = mongoose.model('Vendor', new mongoose.Schema({}, { strict: false }));

    const req = await Requirement.findById(REQ_ID);
    console.log('Requirement found:', req ? 'Yes' : 'No');
    if (req) {
      console.log('Requirement details:', JSON.stringify({
        _id: req._id,
        status: req.status,
        user: req.user
      }, null, 2));
    }

    const vendor = await Vendor.findById(VENDOR_ID);
    console.log('Vendor found:', vendor ? 'Yes' : 'No');
    if (vendor) {
      console.log('Vendor details:', JSON.stringify({
        _id: vendor._id,
        phone: vendor.phone,
        role: 'vendor'
      }, null, 2));
    }

    const bidsByReq = await Bid.find({ requirement: new mongoose.Types.ObjectId(REQ_ID) });
    console.log(`Found ${bidsByReq.length} bids for requirement ${REQ_ID}`);
    bidsByReq.forEach((b, i) => {
      console.log(`Bid ${i} details:`, JSON.stringify({
        _id: b._id,
        requirement: b.requirement,
        vendor: b.vendor,
        status: b.status
      }, null, 2));
    });

    const specificBid = await Bid.findOne({ 
      requirement: new mongoose.Types.ObjectId(REQ_ID),
      vendor: new mongoose.Types.ObjectId(VENDOR_ID)
    });
    console.log('Specific bid found:', specificBid ? 'Yes' : 'No');

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkDb();
