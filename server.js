import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;   // <-- changed to 3002

app.use(cors());
app.use(express.json());

// Configure Gmail SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000,   // 10 sec timeout
    greetingTimeout: 10000,
    socketTimeout: 10000,
    debug: process.env.NODE_ENV !== 'production', // enable logs only in dev
});

// Log SMTP connection status (non‑blocking)
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Gmail SMTP connection failed:', error.message);
    } else {
        console.log('✅ Gmail SMTP connected successfully!');
    }
});

// API endpoint - send OTP email (non‑blocking)
app.post('/api/send-otp-email', async (req, res) => {
    const { to, subject, html, otpCode, amount, recipient } = req.body;

    if (!to || !subject || !html) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Respond immediately so the login can proceed
    res.json({ success: true, message: 'Email request received' });

    // Send email in the background (no await)
    const mailOptions = {
        from: `"RadiantMoney" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    };

    try {
        console.log(`📧 Sending email to: ${to}`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent! Message ID: ${info.messageId}`);
    } catch (error) {
        console.error('❌ Background email error:', error.message);
        // You could store this failure in a log or queue for retry
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});