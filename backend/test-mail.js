// test-resend.js
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTest() {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to: process.env.ADMIN_EMAIL || 'adminluxurynest@gmail.com',
      subject: 'Resend Test – LuxuryNest Admin',
      html: '<p><strong>✅ Success!</strong> Your Resend API is working perfectly.</p><p>This email was sent directly from your test script.</p>',
    });

    if (error) throw new Error(error.message);
    console.log('✅ Test email sent! ID:', data.id);
  } catch (err) {
    console.error('❌ Test email failed:', err.message);
  }
}

sendTest();