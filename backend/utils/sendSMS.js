// import axios from 'axios';
// import dotenv from 'dotenv';

// dotenv.config();

// const API_KEY = process.env.FAST2SMS_API_KEY?.trim();

// if (!API_KEY) {
//   console.error('❌ FAST2SMS_API_KEY missing in .env');
// }

// /**
//  * Send an SMS using Fast2SMS Quick SMS route (GET /dev/bulkV2)
//  * @param {string} mobile - Recipient mobile number (10 digits, e.g., 9667435358)
//  * @param {string} message - SMS text (max 160 characters)
//  * @returns {Promise<{success: boolean, data?: any, error?: string}>}
//  */
// export const sendSMS = async (mobile, message) => {
//   if (!API_KEY) {
//     return { success: false, error: 'API key missing' };
//   }

//   const cleanMobile = mobile.replace(/\D/g, ''); // keep only digits (10 digits)

//   const url = 'https://www.fast2sms.com/dev/bulkV2';
//   const params = {
//     authorization: API_KEY,
//     route: 'q',
//     message: message,
//     flash: 0,
//     numbers: cleanMobile,
//   };

//   try {
//     const response = await axios.get(url, { params });
//     if (response.data.return === true) {
//       console.log(`✅ SMS sent to ${cleanMobile}`);
//       return { success: true, data: response.data };
//     } else {
//       console.error('❌ Fast2SMS error:', response.data.message);
//       return { success: false, error: response.data.message };
//     }
//   } catch (err) {
//     console.error('❌ SMS send failed:', err.message);
//     return { success: false, error: err.message };
//   }
// };

// /**
//  * Convenience function to send an OTP
//  * @param {string} mobile - Mobile number (10 digits)
//  * @param {string|number} otp - 6-digit OTP
//  * @returns {Promise<{success: boolean, data?: any, error?: string}>}
//  */
// export const sendOtpSMS = async (mobile, otp) => {
//   const message = `Your OTP for LuxuryNest is: ${otp}. Valid for 5 minutes.`;
//   return sendSMS(mobile, message);
// };


import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.FAST2SMS_API_KEY?.trim();

export const sendSMS = async (mobile, message) => {
  if (!API_KEY) return { success: false, error: 'API key missing' };
  const cleanMobile = mobile.replace(/\D/g, '');
  const url = 'https://www.fast2sms.com/dev/bulkV2';
  const params = {
    authorization: API_KEY,
    route: 'q',
    message: message,
    flash: 0,
    numbers: cleanMobile,
  };
  try {
    const response = await axios.get(url, { params });
    if (response.data.return === true) {
      return { success: true, data: response.data };
    } else {
      return { success: false, error: response.data.message };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const sendOtpSMS = async (mobile, otp) => {
  const message = `Your OTP for LuxuryNest is: ${otp}. Valid for 5 minutes.`;
  return sendSMS(mobile, message);
};