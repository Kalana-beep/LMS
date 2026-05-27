const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  // Validate environment variables
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Missing email credentials in environment');
  }

  // Remove any accidental spaces from the app password
  const cleanPassword = process.env.EMAIL_PASS.replace(/\s/g, '');

  // Create transporter – works on Railway
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: cleanPassword,
    },
    tls: {
      rejectUnauthorized: false, // needed for some hosting environments
    },
    connectionTimeout: 10000,
  });

  // Verify connection (throws error if invalid)
  await transporter.verify();
  console.log('✅ Email transporter verified');

  // Send email
  const info = await transporter.sendMail({
    from: `"LabNet" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html: `<div style="font-family: Arial; padding: 20px;">
            <h2>${subject}</h2>
            <p>${text}</p>
            <p>This OTP expires in 10 minutes.</p>
            <hr />
            <p style="font-size: 12px;">LabNet Education Institute</p>
           </div>`,
  });

  console.log(`✅ Email sent to ${to} – Message ID: ${info.messageId}`);
  return info;
};

module.exports = sendEmail;