import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, html, otpCode, amount, recipient } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // or smtp-mail.outlook.com
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { ciphers: 'SSLv3', rejectUnauthorized: false },
  });

  const mailOptions = {
    from: `"CrestcoastHub Bank" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    headers: {
      'X-OTP-Code': otpCode || 'N/A',
      'X-Transaction-Amount': amount || 'N/A',
      'X-Recipient': recipient || 'N/A',
    },
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
}