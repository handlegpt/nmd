// Email service for sending verification codes
// This is a mock implementation - in production, you would use a real email service

interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
  fromName: string;
}

// Mock email configuration
const emailConfig: EmailConfig = {
  smtpHost: process.env.EXPO_PUBLIC_SMTP_HOST || 'smtp.gmail.com',
  smtpPort: parseInt(process.env.EXPO_PUBLIC_SMTP_PORT || '587'),
  smtpUser: process.env.EXPO_PUBLIC_SMTP_USER || '',
  smtpPass: process.env.EXPO_PUBLIC_SMTP_PASS || '',
  fromEmail: process.env.EXPO_PUBLIC_FROM_EMAIL || 'noreply@nomadnow.com',
  fromName: process.env.EXPO_PUBLIC_FROM_NAME || 'NomadNow',
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

    // In development/mock mode, just log the code
    if (__DEV__ || !emailConfig.smtpUser) {
      console.log('📧 Mock Email Sent:');
      console.log(`To: ${email}`);
      console.log(`Subject: Verify your NomadNow account`);
      console.log(`Code: ${code}`);
      console.log(`Expires: ${new Date(expiresAt).toLocaleString()}`);
      return true;
    }

    // In production, send real email
    // This would use a real email service like SendGrid, AWS SES, or SMTP
    const emailContent = `
      <html>
        <body>
          <h2>Welcome to NomadNow!</h2>
          <p>Your verification code is: <strong>${code}</strong></p>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <br>
          <p>Best regards,<br>The NomadNow Team</p>
        </body>
      </html>
    `;

    // Here you would implement real email sending
    // For now, we'll just return true in mock mode
    return true;

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
