import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../utils/responsive';

interface IconFallbackProps {
  icon: string;
  size?: number;
  color?: string;
  style?: any;
}

// Icon mapping for fallback
const iconMap: { [key: string]: string } = {
  'heart': '❤️',
  'heart-outline': '🤍',
  'comment-outline': '💬',
  'share-outline': '📤',
  'map-marker': '📍',
  'calendar': '📅',
  'city': '🏙️',
  'bell': '🔔',
  'account': '👤',
  'home': '🏠',
  'cog': '⚙️',
  'close': '✕',
  'arrow-left': '←',
  'dots-vertical': '⋮',
  'plus': '+',
  'minus': '-',
  'check': '✓',
  'close-circle': '✕',
  'magnify': '🔍',
  'filter': '🔧',
  'sort': '↕️',
  'refresh': '🔄',
  'download': '⬇️',
  'upload': '⬆️',
  'edit': '✏️',
  'delete': '🗑️',
  'save': '💾',
  'send': '📤',
  'camera': '📷',
  'image': '🖼️',
  'video': '🎥',
  'microphone': '🎤',
  'location': '📍',
  'time': '⏰',
  'star': '⭐',
  'star-outline': '☆',
  'like': '👍',
  'dislike': '👎',
  'bookmark': '🔖',
  'bookmark-outline': '📑',
  'eye': '👁️',
  'eye-off': '🙈',
  'lock': '🔒',
  'unlock': '🔓',
  'wifi': '📶',
  'battery': '🔋',
  'volume': '🔊',
  'mute': '🔇',
  'play': '▶️',
  'pause': '⏸️',
  'stop': '⏹️',
  'skip-next': '⏭️',
  'skip-previous': '⏮️',
  'settings': '⚙️',
  'help': '❓',
  'info': 'ℹ️',
  'warning': '⚠️',
  'error': '❌',
  'success': '✅',
  'loading': '⏳',
  'search': '🔍',
  'menu': '☰',
  'more': '⋯',
  'back': '←',
  'forward': '→',
  'up': '↑',
  'down': '↓',
  'left': '←',
  'right': '→',
};

export const IconFallback: React.FC<IconFallbackProps> = ({
  icon,
  size = 24,
  color = colors.textPrimary,
  style,
}) => {
  const emoji = iconMap[icon] || '❓';
  
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Text style={[styles.emoji, { fontSize: size * 0.8, color }]}>
        {emoji}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    textAlign: 'center',
    lineHeight: 1,
  },
});

export default IconFallback;
