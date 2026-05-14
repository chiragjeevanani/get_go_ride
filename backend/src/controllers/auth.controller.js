import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import OtpSession from '../models/OtpSession.model.js';
import SystemSetting from '../models/SystemSetting.model.js';
import User from '../models/User.model.js';
import Vendor from '../models/Vendor.model.js';
import Admin from '../models/Admin.model.js';
import { generateOtp, sendOtp } from '../services/otp.service.js';
import { success, error } from '../utils/response.js';

// ─── JWT Helpers ──────────────────────────────────────────────────────────────

const signAccess = (payload) =>
  jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });

const signRefresh = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });

// ─── POST /api/auth/send-otp ──────────────────────────────────────────────────

export const sendOtpHandler = async (req, res, next) => {
  try {
    const { phone, role } = req.body;

    // Generate OTP
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Delete any existing OTP session for this phone+role
    await OtpSession.deleteOne({ phone, role });

    // Save new OTP session (expires in 10 minutes)
    await OtpSession.create({
      phone,
      role,
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Send OTP
    const result = await sendOtp(phone, otp);

    const responseData = { phone, role };
    // Expose raw OTP whenever mock provider is active (dev + test)
    if (process.env.OTP_PROVIDER === 'mock' && result._devOtp) {
      responseData._devOtp = result._devOtp;
    }

    return success(res, responseData, 'OTP sent successfully', 200);
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/verify-otp ────────────────────────────────────────────────

export const verifyOtpHandler = async (req, res, next) => {
  try {
    const { phone, otp, role } = req.body;

    // Find OTP session
    const session = await OtpSession.findOne({ phone, role });
    if (!session) {
      return error(res, 'OTP expired or not found. Please request a new one.', 400, 'OTP_EXPIRED');
    }

    // Check attempt limit
    if (session.attempts >= 5) {
      await OtpSession.deleteOne({ _id: session._id });
      return error(res, 'Too many failed attempts. Please request a new OTP.', 400, 'OTP_MAX_ATTEMPTS');
    }

    // Verify OTP
    const isMatch = await bcrypt.compare(otp, session.otp);
    if (!isMatch) {
      session.attempts += 1;
      await session.save();
      return error(res, `Invalid OTP. ${5 - session.attempts} attempt(s) remaining.`, 400, 'OTP_INVALID');
    }

    // OTP valid — delete session
    await OtpSession.deleteOne({ _id: session._id });

    // Find or create account
    let account;
    let isNewUser = false;

    // Fetch signup bonus from settings
    const bonusSetting = await SystemSetting.findOne({ key: 'walletSignupBonus' });
    const signupBonus = bonusSetting ? Number(bonusSetting.value) : 50;

    if (role === 'user') {
      account = await User.findOne({ phone });
      if (!account) {
        account = await User.create({ 
          phone, 
          wallet: { 
            balance: signupBonus,
            transactions: [{
              type: 'credit',
              amount: signupBonus,
              description: 'Sign-up Reward Bonus'
            }]
          }
        });
        isNewUser = true;
      }
    } else if (role === 'vendor') {
      account = await Vendor.findOne({ phone });
      if (!account) {
        account = await Vendor.create({ 
          phone,
          wallet: { 
            balance: signupBonus,
            transactions: [{
              type: 'credit',
              amount: signupBonus,
              description: 'Sign-up Reward Bonus'
            }]
          }
        });
        isNewUser = true;
      }
    }

    // Sign tokens
    const tokenPayload = { id: account._id, phone, role };
    const accessToken = signAccess(tokenPayload);
    const refreshToken = signRefresh(tokenPayload);

    return success(res, {
      accessToken,
      refreshToken,
      isNewUser,
      [role]: account,
    }, 'Verified successfully', 200);
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/admin/login ───────────────────────────────────────────────

export const adminLoginHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Fetch admin with password (select: false by default)
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return error(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return error(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const tokenPayload = { id: admin._id, email: admin.email, role: 'admin' };
    const accessToken = signAccess(tokenPayload);
    const refreshToken = signRefresh(tokenPayload);

    return success(res, {
      accessToken,
      refreshToken,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isSuperAdmin: admin.isSuperAdmin,
      },
    }, 'Admin login successful', 200);
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────

export const refreshTokenHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return error(res, 'Refresh token required', 400, 'MISSING_TOKEN');
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Issue new access token only
    const { iat, exp, ...payload } = decoded;
    const newAccessToken = signAccess(payload);

    return success(res, { accessToken: newAccessToken }, 'Token refreshed', 200);
  } catch (err) {
    return error(res, 'Invalid or expired refresh token', 401, 'INVALID_TOKEN');
  }
};
