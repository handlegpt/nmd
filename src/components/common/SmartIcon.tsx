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

  useEffect(() => {
    // Check if fonts are loaded
    const checkFonts = () => {
      const loaded = isFontsLoaded();
      setFontsLoaded(loaded);
    };

    checkFonts();
    
    // Check again after a short delay
    const timer = setTimeout(checkFonts, 1000);
    
    return () => clearTimeout(timer);
  }, []);

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
