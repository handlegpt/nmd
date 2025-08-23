import { Platform } from 'react-native';

// Font loading utility to ensure icons display correctly
export class FontLoader {
  private static isLoaded = false;
  private static loadPromise: Promise<void> | null = null;

  // Load fonts for web platform
  static async loadFonts(): Promise<void> {
    if (this.isLoaded || Platform.OS !== 'web') {
      return;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise<void>((resolve) => {
      // Load Material Community Icons font
      const fontLink = document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://cdn.jsdelivr.net/npm/@mdi/font@7.2.96/css/materialdesignicons.min.css';
      fontLink.onload = () => {
        console.log('✅ Material Design Icons font loaded');
        this.isLoaded = true;
        resolve();
      };
      fontLink.onerror = () => {
        console.warn('⚠️ Failed to load Material Design Icons font, using fallback');
        this.isLoaded = true;
        resolve();
      };
      document.head.appendChild(fontLink);

      // Also try to load from local assets if available
      this.loadLocalFonts();
    });

    return this.loadPromise;
  }

  // Load fonts from local assets
  private static loadLocalFonts(): void {
    try {
      // Try to load from Expo's built-in font
      const expoFontLink = document.createElement('link');
      expoFontLink.rel = 'stylesheet';
      expoFontLink.href = '/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.css';
      expoFontLink.onload = () => {
        console.log('✅ Local Material Community Icons font loaded');
      };
      expoFontLink.onerror = () => {
        console.log('ℹ️ Local font not available, using CDN fallback');
      };
      document.head.appendChild(expoFontLink);
    } catch (error) {
      console.log('ℹ️ Could not load local fonts:', error);
    }
  }

  // Check if fonts are loaded
  static isFontsLoaded(): boolean {
    return this.isLoaded;
  }

  // Force reload fonts
  static async reloadFonts(): Promise<void> {
    this.isLoaded = false;
    this.loadPromise = null;
    return this.loadFonts();
  }

  // Get font loading status
  static getStatus(): { loaded: boolean; promise: Promise<void> | null } {
    return {
      loaded: this.isLoaded,
      promise: this.loadPromise
    };
  }
}

// Convenience functions
export const loadFonts = () => FontLoader.loadFonts();
export const isFontsLoaded = () => FontLoader.isFontsLoaded();
export const reloadFonts = () => FontLoader.reloadFonts();
export const getFontStatus = () => FontLoader.getStatus();

export default FontLoader;
