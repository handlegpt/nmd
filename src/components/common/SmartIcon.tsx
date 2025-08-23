import React, { useState, useEffect } from 'react';
import { IconButton } from 'react-native-paper';
import { isFontsLoaded } from '../../utils/fontLoader';
import IconFallback from './IconFallback';

interface SmartIconProps {
  icon: string;
  size?: number;
  color?: string;
  style?: any;
  onPress?: () => void;
  disabled?: boolean;
}

export const SmartIcon: React.FC<SmartIconProps> = ({
  icon,
  size = 24,
  color,
  style,
  onPress,
  disabled = false,
}) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [checkAttempts, setCheckAttempts] = useState(0);

  useEffect(() => {
    // Check if fonts are loaded
    const checkFonts = () => {
      const loaded = isFontsLoaded();
      setFontsLoaded(loaded);
      
      // If fonts are not loaded and we haven't tried too many times, try again
      if (!loaded && checkAttempts < 3) {
        setCheckAttempts(prev => prev + 1);
        setTimeout(checkFonts, 2000); // Wait 2 seconds before next check
      }
    };

    checkFonts();
  }, [checkAttempts]);

  // If fonts are loaded, use IconButton
  if (fontsLoaded) {
    return (
      <IconButton
        icon={icon}
        size={size}
        iconColor={color}
        onPress={onPress}
        disabled={disabled}
        style={style}
      />
    );
  }

  // Fallback to emoji icon
  return (
    <IconFallback
      icon={icon}
      size={size}
      color={color}
      style={style}
    />
  );
};

export default SmartIcon;
