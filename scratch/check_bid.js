const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const REQ_ID = '6a041483ebdfcaf6181c789b';
const VENDOR_ID = '69fc72ce3fc531187ff5195d';

async function checkDb() {
  try {
    console.log('Connecting to:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const Bid = mongoose.model('Bid', new mongoose.Schema({}, { strict: false }));
    const Requirement = mongoose.model('Requirement', new mongoose.Schema({}, { strict: false }));
    const Vendor = mongoose.model('Vendor', new mongoose.Schema({}, { strict: false }));

    const req = await Requirement.findById(REQ_ID);
    console.log('Requirement found:', req ? 'Yes' : 'No');
    if (req) console.log('Requirement details:', JSON.stringify(req, null, 2));

    const vendor = await Vendor.findById(VENDOR_ID);
    console.log('Vendor found:', vendor ? 'Yes' : 'No');
    if (vendor) console.log('Vendor details:', JSON.stringify(vendor, null, 2));

    const bidsByReq = await Bid.find({ requirement: new mongoose.Types.ObjectId(REQ_ID) });
    console.log(`Found ${bidsByReq.length} bids for requirement ${REQ_ID}`);
    bidsByReq.forEach((b, i) => {
      console.log(`Bid ${i}:`, JSON.stringify(b, null, 2));
    });

    const bidsByVendor = await Bid.find({ vendor: new mongoose.Types.ObjectId(VENDOR_ID) });
    console.log(`Found ${bidsByVendor.length} bids for vendor ${VENDOR_ID}`);

    const specificBid = await Bid.findOne({ 
      requirement: new mongoose.Types.ObjectId(REQ_ID),
      vendor: new mongoose.Types.ObjectId(VENDOR_ID)
    });
    console.log('Specific bid found:', specificBid ? 'Yes' : 'No');

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkDb();
