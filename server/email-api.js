const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.EMAIL_API_PORT || 3002;

// CORS configuration
app.use(cors({
  origin: [
    'https://nomadnow.app',
    'https://www.nomadnow.app',
    'http://localhost:19006',
    'http://localhost:3000'
  ],
  credentials: true
}));

app.use(express.json());

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, htmlContent } = req.body;
    
    // Validate required fields
    if (!to || !subject || !htmlContent) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, htmlContent'
      });
    }

    // Get Resend configuration from environment
    const resendApiKey = process.env.EXPO_PUBLIC_RESEND_API_KEY;
    const resendFrom = process.env.EXPO_PUBLIC_RESEND_FROM || 'noreply@nomadnow.app';
    const fromName = process.env.EXPO_PUBLIC_FROM_NAME || 'NomadNow';

    if (!resendApiKey) {
      return res.status(500).json({
        success: false,
        error: 'Resend API key not configured'
      });
    }

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${resendFrom}>`,
        to: [to],
        subject: subject,
        html: htmlContent,
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('📧 Email sent successfully:', result.id);
      res.json({
        success: true,
        messageId: result.id,
        message: 'Email sent successfully'
      });
    } else {
      const error = await response.text();
      console.error('📧 Resend API error:', error);
      res.status(response.status).json({
        success: false,
        error: `Resend API error: ${error}`
      });
    }
  } catch (error) {
    console.error('📧 Email API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'email-api',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`📧 Email API server running on port ${PORT}`);
  console.log(`📧 Resend API Key: ${process.env.EXPO_PUBLIC_RESEND_API_KEY ? 'Configured' : 'Missing'}`);
  console.log(`📧 From Email: ${process.env.EXPO_PUBLIC_RESEND_FROM || 'noreply@nomadnow.app'}`);
});

module.exports = app;
