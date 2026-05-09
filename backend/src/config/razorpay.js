import Razorpay from 'razorpay';

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  console.warn("⚠️  [Razorpay] Warning: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing in .env!");
}

let razorpay;
try {
  razorpay = new Razorpay({
    key_id: keyId || 'rzp_test_placeholder_key_id',
    key_secret: keySecret || 'placeholder_key_secret',
  });
} catch (err) {
  console.error("❌ [Razorpay] Failed to instantiate SDK client:", err.message);
  razorpay = null;
}

export default razorpay;
