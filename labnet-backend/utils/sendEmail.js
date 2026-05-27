const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Missing email credentials');
  }
  const cleanPassword = process.env.EMAIL_PASS.replace(/\s/g, '');
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: cleanPassword },
    tls: { rejectUnauthorized: false },
  });
  await transporter.verify();
  await transporter.sendMail({
    from: `"LabNet" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html: `<div><h2>${subject}</h2><p>${text}</p><p>OTP valid for 10 min</p></div>`,
  });
  console.log(`✅ Email sent to ${to}`);
};
module.exports = sendEmail;