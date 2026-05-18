import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Helper: generic email sender
export const sendEmail = async (to, subject, html) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to,
      subject,
      html,
    });
    if (error) throw new Error(error.message);
    console.log(`✅ Email sent to ${to}`);
    return data;
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    return null;
  }
};

// For admin notification (lead)
export const sendAdvisorNotification = async (adminEmail, leadDetails) => {
  const html = `
    <h2>New Lead Received</h2>
    <p><strong>Name:</strong> ${leadDetails.name}</p>
    <p><strong>Email:</strong> ${leadDetails.email || 'Not provided'}</p>
    <p><strong>Phone:</strong> ${leadDetails.phone}</p>
    <p><strong>Source:</strong> ${leadDetails.source}</p>
    <h3>Requirement Details:</h3>
    <pre>${JSON.stringify(leadDetails.requirementDetails, null, 2)}</pre>
  `;
  return sendEmail(adminEmail, `New Lead from ${leadDetails.name}`, html);
};

// For lead confirmation
export const sendLeadConfirmation = async (leadDetails) => {
  if (!leadDetails.email) return null;
  const html = `
    <h2>Dear ${leadDetails.name},</h2>
    <p>Thank you for contacting LuxuryNest. We will get back to you shortly.</p>
    <h3>Your Requirements:</h3>
    <ul>
      <li><strong>Budget:</strong> ${leadDetails.requirementDetails?.budget || 'Not specified'}</li>
      <li><strong>Bedrooms:</strong> ${leadDetails.requirementDetails?.bedrooms || 'Any'}</li>
      <li><strong>Location:</strong> ${leadDetails.requirementDetails?.location || 'Not specified'}</li>
    </ul>
    <p>Best regards,<br/>LuxuryNest Team</p>
  `;
  return sendEmail(leadDetails.email, 'Thank you for your inquiry', html);
};

// For OTP and general system emails (forgot password, etc.)
export const sendSimpleEmail = sendEmail;