import 'dotenv/config';
import http from 'http';
import connectDB from './config/db.js';
import app from './app.js';
import { initSocket } from './config/socket.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  const server = http.createServer(app);
  
  // Initialize Socket.io
  initSocket(server);
  
  server.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV}`);
    console.log(`   OTP Provider: ${process.env.OTP_PROVIDER}`);
    const rzpKey = process.env.RAZORPAY_KEY_ID || 'None';
    console.log(`   Razorpay Key ID: ${rzpKey !== 'None' ? `${rzpKey.substring(0, 12)}...` : 'Not Configured'}`);
  });
};

startServer();
