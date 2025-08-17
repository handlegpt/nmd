// Crypto polyfill for Web environment
// This provides a fallback for crypto.randomUUID when it's not available

declare global {
  interface Crypto {
    randomUUID(): string;
  }
}

// Polyfill for crypto.randomUUID
if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
  crypto.randomUUID = function(): string {
    // Simple UUID v4 implementation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
}

export {};
