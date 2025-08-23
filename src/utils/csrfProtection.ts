// CSRF (Cross-Site Request Forgery) protection utilities
export class CSRFProtection {
  private static instance: CSRFProtection;
  private tokenKey = 'csrf_token';
  private tokenExpiry = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {}

  static getInstance(): CSRFProtection {
    if (!CSRFProtection.instance) {
      CSRFProtection.instance = new CSRFProtection();
    }
    return CSRFProtection.instance;
  }

  // Generate CSRF token
  static generateToken(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    const token = `${timestamp}-${random}`;
    
    // Store token in session storage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('csrf_token', token);
      sessionStorage.setItem('csrf_token_expiry', (Date.now() + this.tokenExpiry).toString());
    }
    
    return token;
  }

  // Get current CSRF token
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;

    const token = sessionStorage.getItem('csrf_token');
    const expiry = sessionStorage.getItem('csrf_token_expiry');

    if (!token || !expiry) {
      return this.generateToken();
    }

    // Check if token is expired
    if (Date.now() > parseInt(expiry)) {
      sessionStorage.removeItem('csrf_token');
      sessionStorage.removeItem('csrf_token_expiry');
      return this.generateToken();
    }

    return token;
  }

  // Validate CSRF token
  static validateToken(token: string): boolean {
    if (!token) return false;

    const storedToken = this.getToken();
    if (!storedToken) return false;

    return token === storedToken;
  }

  // Add CSRF token to request headers
  static addTokenToHeaders(headers: HeadersInit = {}): HeadersInit {
    const token = this.getToken();
    if (!token) return headers;

    return {
      ...headers,
      'X-CSRF-Token': token,
      'X-Requested-With': 'XMLHttpRequest'
    };
  }

  // Add CSRF token to fetch request
  static async fetchWithCSRF(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();
    if (!token) {
      throw new Error('CSRF token not available');
    }

    const headers = {
      ...options.headers,
      'X-CSRF-Token': token,
      'X-Requested-With': 'XMLHttpRequest'
    };

    return fetch(url, {
      ...options,
      headers
    });
  }

  // Add CSRF token to form data
  static addTokenToFormData(formData: FormData): FormData {
    const token = this.getToken();
    if (token) {
      formData.append('csrf_token', token);
    }
    return formData;
  }

  // Create secure form with CSRF token
  static createSecureForm(action: string, method: string = 'POST'): HTMLFormElement {
    const form = document.createElement('form');
    form.action = action;
    form.method = method;
    form.style.display = 'none';

    const token = this.getToken();
    if (token) {
      const tokenInput = document.createElement('input');
      tokenInput.type = 'hidden';
      tokenInput.name = 'csrf_token';
      tokenInput.value = token;
      form.appendChild(tokenInput);
    }

    return form;
  }

  // Verify request origin
  static verifyOrigin(requestOrigin: string): boolean {
    if (typeof window === 'undefined') return true;

    const currentOrigin = window.location.origin;
    return requestOrigin === currentOrigin;
  }

  // Verify referrer
  static verifyReferrer(referrer: string): boolean {
    if (typeof window === 'undefined') return true;

    const currentOrigin = window.location.origin;
    return referrer.startsWith(currentOrigin);
  }

  // Add CSRF protection to all forms
  static protectForms(): void {
    if (typeof window === 'undefined') return;

    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      // Skip if already has CSRF token
      if (form.querySelector('input[name="csrf_token"]')) {
        return;
      }

      const token = this.getToken();
      if (token) {
        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = 'csrf_token';
        tokenInput.value = token;
        form.appendChild(tokenInput);
      }
    });
  }

  // Add CSRF protection to all AJAX requests
  static protectAJAXRequests(): void {
    if (typeof window === 'undefined') return;

    // Override XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method: string, url: string, ...args: any[]) {
      if (method.toUpperCase() !== 'GET') {
        const token = CSRFProtection.getToken();
        if (token) {
          this.setRequestHeader('X-CSRF-Token', token);
          this.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        }
      }
      return originalXHROpen.apply(this, [method, url, ...args]);
    };

    // Override fetch
    const originalFetch = window.fetch;
    window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
      if (init?.method && init.method.toUpperCase() !== 'GET') {
        const token = CSRFProtection.getToken();
        if (token) {
          init.headers = {
            ...init.headers,
            'X-CSRF-Token': token,
            'X-Requested-With': 'XMLHttpRequest'
          };
        }
      }
      return originalFetch(input, init);
    };
  }

  // Initialize CSRF protection
  static initialize(): void {
    // Generate initial token
    this.generateToken();

    // Protect forms
    this.protectForms();

    // Protect AJAX requests
    this.protectAJAXRequests();

    // Watch for dynamically added forms
    if (typeof window !== 'undefined') {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.tagName === 'FORM') {
                CSRFProtection.protectForms();
              }
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    if (__DEV__) {
      console.log('[CSRF] CSRF protection initialized');
    }
  }

  // Clean up CSRF tokens
  static cleanup(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('csrf_token');
      sessionStorage.removeItem('csrf_token_expiry');
    }
  }

  // Refresh CSRF token
  static refreshToken(): string {
    this.cleanup();
    return this.generateToken();
  }
}

// Convenience functions
export const generateCSRFToken = () => CSRFProtection.generateToken();
export const getCSRFToken = () => CSRFProtection.getToken();
export const validateCSRFToken = (token: string) => CSRFProtection.validateToken(token);
export const addCSRFTokenToHeaders = (headers?: HeadersInit) => CSRFProtection.addTokenToHeaders(headers);
export const fetchWithCSRF = (url: string, options?: RequestInit) => CSRFProtection.fetchWithCSRF(url, options);
export const addCSRFTokenToFormData = (formData: FormData) => CSRFProtection.addTokenToFormData(formData);
export const createSecureForm = (action: string, method?: string) => CSRFProtection.createSecureForm(action, method);
export const verifyOrigin = (requestOrigin: string) => CSRFProtection.verifyOrigin(requestOrigin);
export const verifyReferrer = (referrer: string) => CSRFProtection.verifyReferrer(referrer);
export const protectForms = () => CSRFProtection.protectForms();
export const protectAJAXRequests = () => CSRFProtection.protectAJAXRequests();
export const initializeCSRFProtection = () => CSRFProtection.initialize();
export const cleanupCSRFTokens = () => CSRFProtection.cleanup();
export const refreshCSRFToken = () => CSRFProtection.refreshToken();
