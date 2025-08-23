// Security management utilities for XSS protection and CSP
export class SecurityManager {
  private static instance: SecurityManager;
  private isProduction: boolean;

  private constructor() {
    this.isProduction = !__DEV__;
  }

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  // Sanitize HTML content to prevent XSS
  static sanitizeHtml(html: string): string {
    if (!html) return '';

    // Remove potentially dangerous tags and attributes
    const dangerousTags = [
      'script', 'object', 'embed', 'form', 'input', 'textarea', 'select',
      'iframe', 'frame', 'frameset', 'noframes', 'noscript', 'applet',
      'base', 'basefont', 'bgsound', 'link', 'meta', 'title', 'style'
    ];

    const dangerousAttributes = [
      'onload', 'onerror', 'onclick', 'onmouseover', 'onmouseout',
      'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset',
      'onkeydown', 'onkeyup', 'onkeypress', 'onabort', 'onbeforeunload',
      'onerror', 'onhashchange', 'onmessage', 'onoffline', 'ononline',
      'onpagehide', 'onpageshow', 'onpopstate', 'onresize', 'onstorage',
      'onunload', 'javascript:', 'vbscript:', 'data:', 'mocha:'
    ];

    let sanitized = html;

    // Remove dangerous tags
    dangerousTags.forEach(tag => {
      const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>|<${tag}[^>]*/?>`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });

    // Remove dangerous attributes
    dangerousAttributes.forEach(attr => {
      const regex = new RegExp(`${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });

    // Remove javascript: and data: URLs
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/data:/gi, '');

    return sanitized;
  }

  // Sanitize user input
  static sanitizeInput(input: string): string {
    if (!input) return '';

    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/data:/gi, '') // Remove data: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .trim();
  }

  // Validate URL to prevent open redirect
  static validateUrl(url: string): boolean {
    if (!url) return false;

    try {
      const urlObj = new URL(url);
      
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }

      // Block localhost and private IP addresses
      const hostname = urlObj.hostname.toLowerCase();
      if (hostname === 'localhost' || 
          hostname === '127.0.0.1' || 
          hostname.startsWith('192.168.') ||
          hostname.startsWith('10.') ||
          hostname.startsWith('172.')) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  // Escape HTML entities
  static escapeHtml(text: string): string {
    if (!text) return '';

    const htmlEntities: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };

    return text.replace(/[&<>"'/]/g, char => htmlEntities[char] || char);
  }

  // Generate Content Security Policy header
  static generateCSP(): string {
    const cspDirectives = {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'", // Required for React
        "'unsafe-eval'", // Required for some libraries
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com'
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Required for React Native Paper
        'https://fonts.googleapis.com'
      ],
      'font-src': [
        "'self'",
        'https://fonts.gstatic.com',
        'data:'
      ],
      'img-src': [
        "'self'",
        'data:',
        'https:',
        'blob:'
      ],
      'connect-src': [
        "'self'",
        'https://*.supabase.co',
        'https://www.google-analytics.com',
        'wss://*.supabase.co'
      ],
      'media-src': [
        "'self'",
        'data:',
        'https:',
        'blob:'
      ],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'upgrade-insecure-requests': []
    };

    return Object.entries(cspDirectives)
      .map(([directive, sources]) => {
        if (sources.length === 0) {
          return directive;
        }
        return `${directive} ${sources.join(' ')}`;
      })
      .join('; ');
  }

  // Apply CSP to document
  static applyCSP(): void {
    if (typeof window !== 'undefined') {
      const csp = this.generateCSP();
      
      // Create meta tag for CSP
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = csp;
      document.head.appendChild(meta);

      if (__DEV__) {
        console.log('[SECURITY] CSP applied:', csp);
      }
    }
  }

  // Add security headers
  static addSecurityHeaders(): void {
    if (typeof window !== 'undefined') {
      // Add security-related meta tags
      const securityMetaTags = [
        { name: 'X-Content-Type-Options', content: 'nosniff' },
        { name: 'X-Frame-Options', content: 'DENY' },
        { name: 'X-XSS-Protection', content: '1; mode=block' },
        { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
        { name: 'Permissions-Policy', content: 'geolocation=(), microphone=(), camera=()' }
      ];

      securityMetaTags.forEach(tag => {
        const meta = document.createElement('meta');
        meta.httpEquiv = tag.name;
        meta.content = tag.content;
        document.head.appendChild(meta);
      });

      if (__DEV__) {
        console.log('[SECURITY] Security headers added');
      }
    }
  }

  // Validate file upload
  static validateFileUpload(file: File): boolean {
    if (!file) return false;

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return false;
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/ogg'
    ];

    return allowedTypes.includes(file.type);
  }

  // Generate secure random token
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    if (typeof window !== 'undefined' && window.crypto) {
      const array = new Uint8Array(length);
      window.crypto.getRandomValues(array);
      
      for (let i = 0; i < length; i++) {
        result += chars.charAt(array[i] % chars.length);
      }
    } else {
      // Fallback for environments without crypto API
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }
    
    return result;
  }

  // Hash sensitive data
  static async hashData(data: string): Promise<string> {
    if (typeof window !== 'undefined' && window.crypto) {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // Fallback for environments without crypto API
    return btoa(data);
  }

  // Run all security measures
  static runAllSecurityMeasures(): void {
    this.applyCSP();
    this.addSecurityHeaders();

    if (__DEV__) {
      console.log('[SECURITY] All security measures applied');
    }
  }
}

// Convenience functions
export const sanitizeHtml = (html: string) => SecurityManager.sanitizeHtml(html);
export const sanitizeInput = (input: string) => SecurityManager.sanitizeInput(input);
export const validateUrl = (url: string) => SecurityManager.validateUrl(url);
export const escapeHtml = (text: string) => SecurityManager.escapeHtml(text);
export const generateCSP = () => SecurityManager.generateCSP();
export const applyCSP = () => SecurityManager.applyCSP();
export const addSecurityHeaders = () => SecurityManager.addSecurityHeaders();
export const validateFileUpload = (file: File) => SecurityManager.validateFileUpload(file);
export const generateSecureToken = (length?: number) => SecurityManager.generateSecureToken(length);
export const hashData = (data: string) => SecurityManager.hashData(data);
export const runAllSecurityMeasures = () => SecurityManager.runAllSecurityMeasures();
