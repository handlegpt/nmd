const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// SMTP Email sending endpoint
app.post('/api/send-smtp-email', async (req, res) => {
  try {
    const { to, from, subject, html, smtp } = req.body;

    // Validate required fields
    if (!to || !subject || !html || !smtp) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465, // true for 465, false for other ports
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: from,
      to: to,
      subject: subject,
      html: html,
    });

    console.log('Email sent successfully:', info.messageId);
    res.status(200).json({ success: true, messageId: info.messageId });

  } catch (error) {
    console.error('Email sending failed:', error);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'SMTP Email Server' });
});

// Start server
app.listen(PORT, () => {
  console.log(`SMTP Email server running on port ${PORT}`);
});

module.exports = app;
