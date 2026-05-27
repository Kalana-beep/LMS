const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  // Validate credentials
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Missing email credentials');
    throw new Error('Email service not configured');
  }

  // Remove any spaces from the app password (Railway may add them)
  const cleanPassword = process.env.EMAIL_PASS.replace(/\s/g, '');

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: cleanPassword,
    },
    tls: {
      rejectUnauthorized: false, // helps on Railway
    },
  });

  // Verify connection (optional, but helps debugging)
  await transporter.verify();

  const info = await transporter.sendMail({
    from: `"LabNet" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>${subject}</h2>
            <p>${text}</p>
            <p>This OTP is valid for 10 minutes.</p>
            <hr />
            <p style="font-size: 12px; color: #888;">LabNet Education Institute</p>
           </div>`,
  });

  console.log(`Email sent: ${info.messageId}`);
  return info;
};

module.exports = sendEmail;