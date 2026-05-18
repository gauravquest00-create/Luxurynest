import Otp from '../models/Otp.js';
import { sendOtpSMS } from '../utils/sendSMS.js';

export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Valid 10-digit phone required' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Send real SMS
    const smsResult = await sendOtpSMS(phone, otp);
    if (!smsResult.success) {
      return res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }

    // Store OTP in DB
    await Otp.deleteMany({ phone });
    await Otp.create({ phone, otp });

    console.log(`✅ OTP sent to ${phone}`);
    res.json({ success: true, message: 'OTP sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const record = await Otp.findOne({ phone, otp });
    if (!record) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    await Otp.deleteOne({ _id: record._id });
    res.json({ success: true, verified: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};