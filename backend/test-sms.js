import { sendOtpSMS } from './utils/sendSMS.js';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
  const result = await sendOtpSMS('8130424206', '123456');
  console.log(result);
})();