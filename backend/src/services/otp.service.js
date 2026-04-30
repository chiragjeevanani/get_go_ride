/**
 * OTP Service — abstraction layer.
 *
 * In development (OTP_PROVIDER=mock):
 *   - Logs OTP to console
 *   - Returns OTP in response for easy testing (never in prod)
 *
 * In production (OTP_PROVIDER=smsindia):
 *   - Sends via SMS India API
 */

/**
 * Generate a 4-digit numeric OTP.
 */
export const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * Send OTP to a phone number.
 * @param {string} phone - 10-digit phone number (without +91)
 * @param {string} otp   - 4-digit OTP string
 * @returns {Promise<{ sent: boolean, _devOtp?: string }>}
 */
export const sendOtp = async (phone, otp) => {
  const provider = process.env.OTP_PROVIDER || 'mock';

  if (provider === 'mock') {
    console.log(`\n📱 [DEV OTP] Phone: +91${phone}  →  OTP: ${otp}\n`);
    // Return OTP in response so frontend can use it without SMS in dev
    return { sent: true, _devOtp: otp };
  }

  if (provider === 'smsindia') {
    // TODO: Integrate SMS India when switching to production
    // const response = await fetch(`https://www.smsindiahub.in/api/mt/SendSMS?...`);
    throw new Error('SMS India integration not yet configured. Set OTP_PROVIDER=mock for development.');
  }

  throw new Error(`Unknown OTP_PROVIDER: ${provider}`);
};
