// Email service for sending verification codes
// Production-ready email verification system

interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
  fromName: string;
}

// Email configuration
const emailConfig: EmailConfig = {
  smtpHost: process.env.EXPO_PUBLIC_SMTP_HOST || 'smtp.gmail.com',
  smtpPort: parseInt(process.env.EXPO_PUBLIC_SMTP_PORT || '587'),
  smtpUser: process.env.EXPO_PUBLIC_SMTP_USER || '',
  smtpPass: process.env.EXPO_PUBLIC_SMTP_PASS || '',
  fromEmail: process.env.EXPO_PUBLIC_FROM_EMAIL || 'noreply@nomadnow.com',
  fromName: process.env.EXPO_PUBLIC_FROM_NAME || 'NomadNow',
};

// Simple email sending function using SendGrid API
const sendEmailViaAPI = async (to: string, subject: string, htmlContent: string): Promise<boolean> => {
  try {
    const sendGridApiKey = process.env.EXPO_PUBLIC_SENDGRID_API_KEY;
    
    if (sendGridApiKey) {
      // Use SendGrid API (recommended for production)
      const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendGridApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: emailConfig.fromEmail, name: emailConfig.fromName },
          subject: subject,
          content: [{ type: 'text/html', value: htmlContent }]
        })
      });
      
      if (sendGridResponse.ok) {
        console.log('📧 Email sent via SendGrid successfully');
        return true;
      } else {
        const errorText = await sendGridResponse.text();
        console.error('📧 SendGrid error:', errorText);
        return false;
      }
    }
    
    // Fallback: EmailJS (if configured)
    const emailjsServiceId = process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID;
    const emailjsTemplateId = process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID;
    const emailjsUserId = process.env.EXPO_PUBLIC_EMAILJS_USER_ID;
    
    if (emailjsServiceId && emailjsTemplateId && emailjsUserId && typeof window !== 'undefined' && (window as any).emailjs) {
      const emailjs = (window as any).emailjs;
      const result = await emailjs.send(
        emailjsServiceId,
        emailjsTemplateId,
        {
          to_email: to,
          to_name: to.split('@')[0],
          message: htmlContent,
          subject: subject
        },
        emailjsUserId
      );
      return result.status === 200;
    }
    
    console.error('📧 No email service configured');
    return false;
    
  } catch (error) {
    console.error('📧 Email API error:', error);
    return false;
  }
};

// Generate a random 6-digit verification code
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store verification codes in memory (in production, use Redis or database)
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

// Send verification email
export const sendVerificationEmail = async (email: string, code: string): Promise<boolean> => {
  try {
    // Store the verification code with 10-minute expiration
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    verificationCodes.set(email, { code, expiresAt });

    // Check if email configuration is set up
    const hasSendGrid = process.env.EXPO_PUBLIC_SENDGRID_API_KEY;
    const hasSMTP = emailConfig.smtpUser && emailConfig.smtpPass;
    const hasEmailJS = process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID;
    
    if (!hasSendGrid && !hasSMTP && !hasEmailJS) {
      console.error('Email service not configured. Please set up SendGrid API key, SMTP credentials, or EmailJS in .env file');
      return false;
    }

    // Create email content
    const subject = 'NomadNow - Verification Code';
    const emailContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff6b35, #ffa726); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code { background: #fff; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #ff6b35; border: 2px dashed #ff6b35; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to NomadNow!</h1>
              <p>Your Digital Nomad Community</p>
            </div>
            <div class="content">
              <h2>Verification Code</h2>
              <p>Please use the following verification code to complete your registration:</p>
              <div class="code">${code}</div>
              <p><strong>This code will expire in 10 minutes.</strong></p>
              <p>If you didn't request this code, please ignore this email.</p>
              <div class="footer">
                <p>Best regards,<br>The NomadNow Team</p>
                <p>Join the global digital nomad community!</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using API
    const success = await sendEmailViaAPI(email, subject, emailContent);
    
    if (success) {
      console.log(`📧 Verification email sent successfully to: ${email}`);
    } else {
      console.error(`📧 Failed to send verification email to: ${email}`);
    }
    
    return success;

  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
};

// Verify the code
export const verifyCode = (email: string, code: string): boolean => {
  const stored = verificationCodes.get(email);
  
  if (!stored) {
    return false;
  }

  // Check if code is expired
  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(email);
    return false;
  }

  // Check if code matches
  if (stored.code === code) {
    verificationCodes.delete(email);
    return true;
  }

  return false;
};

// Resend verification code
export const resendVerificationCode = async (email: string): Promise<boolean> => {
  const newCode = generateVerificationCode();
  return await sendVerificationEmail(email, newCode);
};

// Clean up expired codes (call this periodically)
export const cleanupExpiredCodes = (): void => {
  const now = Date.now();
  for (const [email, data] of verificationCodes.entries()) {
    if (now > data.expiresAt) {
      verificationCodes.delete(email);
    }
  }
};
