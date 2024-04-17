import nodemailer from 'nodemailer';
import { validateEmail } from './validation.js';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_USER_PASSWORD,
  },
});
async function sendMail(userEmail, subject, html) {
  try {
    if ((!userEmail, !subject, !html)) {
      throw new Error('All fields are required');
    }
    if (!validateEmail(userEmail)) {
      throw new Error('User Email is not valid');
    }
    const info = await transporter.sendMail({
      from: `"Video Tube" <${process.env.MAIL_USER}>`,
      to: userEmail,
      subject: subject,
      html: html,
    });

    //   return info.messageId;
    return info;
  } catch (error) {
    throw new Error('Error Found while sending E-mail : ' + error.message);
  }
}

async function sendOTPonEmail(userEmail, otp) {
  const applicationName = 'VideoTube';
  const verificationUrl = '';
  const serviceLink = '';
  const subject = 'Verification OTP for videoTube';
  const html = `
    <p> Dear User </p>
    <p>Thank you for choosing ${applicationName} for your needs. To complete the verification process and ensure the security of your account, please use the following OTP (One-Time Password):</p>
    <h1>${otp}</h1>
    <p>Please enter this OTP in the verification section of the ${applicationName} app ${verificationUrl} within the next 5 Minutes. This OTP is valid for one-time use only.</p>
    <p>If you did not request this OTP or have any concerns regarding your account security, please contact ${serviceLink}</p>
    <p>Thank you for your cooperation.</p>
    <p>Team ${applicationName}</p>
    `;
  const info = await sendMail(userEmail, subject, html);
  return info;
}
export default sendMail;
export {sendOTPonEmail}