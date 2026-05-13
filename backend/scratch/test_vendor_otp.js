import request from 'supertest';
import app from '../src/app.js';
import OtpSession from '../src/models/OtpSession.model.js';
import Vendor from '../src/models/Vendor.model.js';
import mongoose from 'mongoose';

async function diagnose() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://chiragj123:chiragcj@chiragjeevanani.u1izmgf.mongodb.net/getgoload?appName=Chiragjeevanani');
    console.log('Connected.');

    const newPhone = '9999000123'; // Simulating a new number
    console.log(`\n--- STEP 1: Sending OTP for phone: ${newPhone} ---`);

    // Ensure we delete any existing OtpSession or Vendor
    await OtpSession.deleteMany({ phone: newPhone });
    await Vendor.deleteMany({ phone: newPhone });

    const sendRes = await request(app)
      .post('/api/auth/send-otp')
      .send({ phone: newPhone, role: 'vendor' });

    console.log('Send OTP Status:', sendRes.status);
    console.log('Send OTP Response:', sendRes.body);

    if (sendRes.status !== 200) {
      console.log('Failed at Send OTP.');
      return;
    }

    const otp = sendRes.body.data._devOtp;
    console.log(`Extracted mock OTP: ${otp}`);

    console.log(`\n--- STEP 2: Verifying OTP for phone: ${newPhone} with OTP: ${otp} ---`);
    const verifyRes = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phone: newPhone, otp, role: 'vendor' });

    console.log('Verify OTP Status:', verifyRes.status);
    console.log('Verify OTP Response:', verifyRes.body);

  } catch (err) {
    console.error('Diagnosis error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

diagnose();
