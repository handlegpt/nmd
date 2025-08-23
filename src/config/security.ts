// Security configuration for the application
export const securityConfig = {
  // Content Security Policy settings
  csp: {
    enabled: true,
    reportOnly: false, // Set to true for testing
    reportUri: '/csp-report', // Endpoint for CSP violations
  },

  // CSRF protection settings
  csrf: {
    enabled: true,
    tokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
    refreshInterval: 60 * 60 * 1000, // 1 hour
  },

  // Input validation settings
  validation: {
    maxInputLength: 10000, // Maximum input length
    allowedHtmlTags: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
    allowedFileTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/ogg'
    ],
    maxFileSize: 10 * 1024 * 1024, // 10MB
  },

  // Rate limiting settings
  rateLimit: {
    enabled: true,
    maxRequests: 100, // Max requests per window
    windowMs: 15 * 60 * 1000, // 15 minutes
  },

  // Session security
  session: {
    secure: true, // Use secure cookies
    httpOnly: true, // Prevent XSS access to cookies
    sameSite: 'strict' as const, // CSRF protection
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Password requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },

  // API security
  api: {
    requireAuth: true,
    validateOrigin: true,
    validateReferrer: true,
    timeout: 30000, // 30 seconds
  },

  // Logging and monitoring
  monitoring: {
    logSecurityEvents: true,
    logFailedAttempts: true,
    alertOnSuspiciousActivity: true,
  },

  // Headers to include
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  },

  // Allowed origins for CORS
  cors: {
    allowedOrigins: [
      'https://nomadnow.app',
      'https://www.nomadnow.app',
      'https://nomadnow.vercel.app',
      'http://localhost:19006',
      'http://localhost:3000'
    ],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-CSRF-Token',
      'X-Requested-With'
    ],
  },

  // File upload security
  upload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/ogg'
    ],
    scanForMalware: true,
    validateDimensions: true,
    maxWidth: 4096,
    maxHeight: 4096,
  },

  // Database security
  database: {
    useSSL: true,
    connectionLimit: 10,
    timeout: 30000,
    validateQueries: true,
  },

  // Environment-specific settings
  environment: {
    development: {
      csp: { reportOnly: true },
      logLevel: 'debug',
      allowInsecureConnections: true,
    },
    production: {
      csp: { reportOnly: false },
      logLevel: 'error',
      allowInsecureConnections: false,
    },
  },
};

// Security utility functions
export const getSecurityConfig = (env: 'development' | 'production' = 'production') => {
  const baseConfig = securityConfig;
  const envConfig = securityConfig.environment[env];
  
  return {
    ...baseConfig,
    ...envConfig,
  };
};

// Validate security configuration
export const validateSecurityConfig = () => {
  const config = getSecurityConfig();
  
  // Validate required settings
  if (!config.csp.enabled) {
    console.warn('[SECURITY] CSP is disabled');
  }
  
  if (!config.csrf.enabled) {
    console.warn('[SECURITY] CSRF protection is disabled');
  }
  
  if (config.validation.maxInputLength > 50000) {
    console.warn('[SECURITY] Max input length is very high');
  }
  
  if (config.upload.maxSize > 50 * 1024 * 1024) {
    console.warn('[SECURITY] Max file size is very high');
  }
  
  return true;
};

// Export default configuration
export default securityConfig;
