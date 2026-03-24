import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Configure Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',  // Use service instead of host for easier configuration
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
});

// Verify connection with retry logic
let isConnected = false;
let retryCount = 0;
const maxRetries = 3;

function verifyConnection() {
    transporter.verify((error, success) => {
        if (error) {
            console.error(`Gmail SMTP error (attempt ${retryCount + 1}/${maxRetries}):`, error.message);
            if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(verifyConnection, 5000);
            } else {
                console.error('❌ Failed to connect to Gmail SMTP');
                console.error('Please verify:');
                console.error('1. EMAIL_USER in .env is your full Gmail address');
                console.error('2. EMAIL_PASS is your Gmail APP PASSWORD (not regular password)');
                console.error('3. 2-Factor Authentication is enabled on your Gmail');
            }
        } else {
            console.log('✅ Gmail SMTP connected successfully!');
            isConnected = true;
        }
    });
}

verifyConnection();

// API endpoint
app.post('/api/send-otp-email', async (req, res) => {
    try {
        if (!isConnected) {
            return res.status(503).json({ 
                error: 'Email service initializing. Please wait 10 seconds and try again.'
            });
        }

        const { to, subject, html, otpCode, amount, recipient } = req.body;

        if (!to || !subject || !html) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const mailOptions = {
            from: `"CrestcoastHub Bank" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        };

        console.log(`📧 Sending OTP to: ${to}`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent! Message ID: ${info.messageId}`);
        
        res.json({ success: true, messageId: info.messageId });
        
    } catch (error) {
        console.error('❌ Email error:', error.message);
        res.status(500).json({ 
            error: 'Failed to send email', 
            details: error.message 
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        smtp: isConnected ? 'Connected' : 'Connecting',
        provider: 'Gmail',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server on http://localhost:${PORT}`);
    console.log(`📧 Gmail SMTP configured`);
});