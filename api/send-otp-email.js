import nodemailer from 'nodemailer';

// Enable CORS for all responses
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*'); // or your domain
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
};

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    setCorsHeaders(res);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, html, otpCode, amount, recipient } = req.body;

  if (!to || !subject || !html) {
    setCorsHeaders(res);
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Email transport – use your SMTP settings
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
    from: `"RadiantMoney" <${process.env.EMAIL_USER}>`,
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
    setCorsHeaders(res);
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Email sending error:', error);
    setCorsHeaders(res);
    return res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
}