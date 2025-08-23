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
      // Try multiple font sources for better reliability
      const fontSources = [
        // CDN fallback (preferred for production)
        'https://cdn.jsdelivr.net/npm/@mdi/font@7.2.96/css/materialdesignicons.min.css',
        // Alternative CDN
        'https://unpkg.com/@mdi/font@7.2.96/css/materialdesignicons.min.css',
        // Local Expo font (fallback)
        '/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.css'
      ];

      let loadedCount = 0;
      const totalSources = fontSources.length;

      const tryLoadFont = (index: number) => {
        if (index >= totalSources) {
          // All sources failed, resolve anyway
          console.warn('⚠️ All font sources failed, using fallback');
          this.isLoaded = true;
          resolve();
          return;
        }

        const fontLink = document.createElement('link');
        fontLink.rel = 'stylesheet';
        fontLink.href = fontSources[index];
        
        fontLink.onload = () => {
          console.log(`✅ Font loaded from: ${fontSources[index]}`);
          this.isLoaded = true;
          resolve();
        };
        
        fontLink.onerror = () => {
          console.log(`⚠️ Failed to load font from: ${fontSources[index]}`);
          loadedCount++;
          if (loadedCount >= totalSources) {
            console.warn('⚠️ All font sources failed, using fallback');
            this.isLoaded = true;
            resolve();
          } else {
            // Try next source
            setTimeout(() => tryLoadFont(index + 1), 100);
          }
        };

        document.head.appendChild(fontLink);
      };

      // Start with first source
      tryLoadFont(0);
    });

    return this.loadPromise;
  }

  // Load fonts from local assets (deprecated, now handled in main loadFonts method)
  private static loadLocalFonts(): void {
    // This method is now deprecated as font loading is handled in the main loadFonts method
    console.log('ℹ️ Local font loading is now handled in main loadFonts method');
  }

  // Check if fonts are loaded
  static isFontsLoaded(): boolean {
    if (Platform.OS !== 'web') {
      return true; // Always true for native platforms
    }

    // Check if Material Design Icons font is available
    if (typeof document !== 'undefined') {
      try {
        // Try to detect if the font is loaded by checking if a test element renders correctly
        const testElement = document.createElement('span');
        testElement.style.fontFamily = 'Material Design Icons';
        testElement.style.visibility = 'hidden';
        testElement.style.position = 'absolute';
        testElement.style.fontSize = '16px';
        testElement.textContent = '\uf159'; // A Material Design Icons character
        document.body.appendChild(testElement);
        
        const isLoaded = testElement.offsetWidth > 0;
        document.body.removeChild(testElement);
        
        return isLoaded || this.isLoaded;
      } catch (error) {
        console.warn('⚠️ Font detection failed:', error);
        return this.isLoaded; // Fallback to internal state
      }
    }

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
