// Email service for sending verification codes
// Production-ready email verification system using Resend

interface EmailConfig {
  resendApiKey: string;
  resendFrom: string;
  fromName: string;
}

// Email configuration
const emailConfig: EmailConfig = {
  resendApiKey: process.env.EXPO_PUBLIC_RESEND_API_KEY || '',
  resendFrom: process.env.EXPO_PUBLIC_RESEND_FROM || 'noreply@nomadnow.app',
  fromName: process.env.EXPO_PUBLIC_FROM_NAME || 'NomadNow',
};

// Debug: Log email configuration on load
console.log('📧 Email config loaded:', {
  resendApiKey: emailConfig.resendApiKey ? 'Set' : 'Missing',
  resendFrom: emailConfig.resendFrom,
  fromName: emailConfig.fromName
});

// Debug: Log raw environment variables
console.log('📧 Raw environment variables:');
console.log('EXPO_PUBLIC_RESEND_API_KEY:', emailConfig.resendApiKey ? 'Set' : 'Missing');
console.log('EXPO_PUBLIC_RESEND_FROM:', emailConfig.resendFrom);
console.log('EXPO_PUBLIC_FROM_NAME:', emailConfig.fromName);

// Send email using Resend API
const sendEmailViaResend = async (to: string, subject: string, htmlContent: string): Promise<boolean> => {
  try {
    if (!emailConfig.resendApiKey) {
      console.error('📧 Resend API key not configured');
      return false;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailConfig.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${emailConfig.fromName} <${emailConfig.resendFrom}>`,
        to: [to],
        subject: subject,
        html: htmlContent,
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('📧 Email sent via Resend successfully:', result.id);
      return true;
    } else {
      const error = await response.text();
      console.error('📧 Resend API error:', error);
      return false;
    }
  } catch (error) {
    console.error('📧 Resend API error:', error);
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

    // Check if Resend is configured
    if (!emailConfig.resendApiKey) {
      console.error('Email service not configured. Please set up Resend API key in .env file');
      // Fallback: Log to console for development
      console.log('📧 Development mode - Email would be sent to:', email);
      console.log('📧 Verification code for development:', code);
      return true; // Return true in development mode
    }

    // Create email content
    const subject = 'NomadNow - 验证码';
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
              <h1>欢迎使用 NomadNow！</h1>
              <p>您的数字游民社区</p>
            </div>
            <div class="content">
              <h2>验证码</h2>
              <p>请使用以下验证码完成您的注册：</p>
              <div class="code">${code}</div>
              <p><strong>此验证码将在10分钟后过期。</strong></p>
              <p>如果您没有请求此验证码，请忽略此邮件。</p>
              <div class="footer">
                <p>此致，<br>NomadNow 团队</p>
                <p>加入全球数字游民社区！</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Resend
    const success = await sendEmailViaResend(email, subject, emailContent);
    
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
