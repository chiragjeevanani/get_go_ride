import mongoose from 'mongoose';
import 'dotenv/config';

async function testConnection() {
    try {
        console.log('Testing connection to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connection successful!');
        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    }
}

testConnection();
