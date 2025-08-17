import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useResponsive } from '../../utils/responsive';

interface PlaceholderImageProps {
  width: number;
  height: number;
  text?: string;
  backgroundColor?: string;
  textColor?: string;
  style?: any;
}

export const PlaceholderImage: React.FC<PlaceholderImageProps> = ({
  width,
  height,
  text = 'Image',
  backgroundColor = '#f0f0f0',
  textColor = '#666',
  style,
}) => {
  const { isPhone } = useResponsive();

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          backgroundColor,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: textColor,
            fontSize: isPhone ? Math.min(width, height) * 0.15 : Math.min(width, height) * 0.12,
          },
        ]}
        numberOfLines={2}
        adjustsFontSizeToFit
      >
        {text}
      </Text>
    </View>
  );
};

// Avatar placeholder
interface AvatarPlaceholderProps {
  size: number;
  text?: string;
  backgroundColor?: string;
  textColor?: string;
  style?: any;
}

export const AvatarPlaceholder: React.FC<AvatarPlaceholderProps> = ({
  size,
  text = 'U',
  backgroundColor = '#6366f1',
  textColor = '#ffffff',
  style,
}) => {
  const { isPhone } = useResponsive();

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.avatarText,
          {
            color: textColor,
            fontSize: isPhone ? size * 0.4 : size * 0.35,
          },
        ]}
        adjustsFontSizeToFit
      >
        {text.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
};

// Media placeholder
interface MediaPlaceholderProps {
  width: number;
  height: number;
  type?: 'image' | 'video';
  style?: any;
}

export const MediaPlaceholder: React.FC<MediaPlaceholderProps> = ({
  width,
  height,
  type = 'image',
  style,
}) => {
  const { isPhone } = useResponsive();

  return (
    <View
      style={[
        styles.mediaContainer,
        {
          width,
          height,
        },
        style,
      ]}
    >
      <View style={styles.mediaContent}>
        <Text
          style={[
            styles.mediaIcon,
            {
              fontSize: isPhone ? Math.min(width, height) * 0.2 : Math.min(width, height) * 0.15,
            },
          ]}
        >
          {type === 'video' ? '🎥' : '📷'}
        </Text>
        <Text
          style={[
            styles.mediaText,
            {
              fontSize: isPhone ? Math.min(width, height) * 0.08 : Math.min(width, height) * 0.06,
            },
          ]}
        >
          {type === 'video' ? 'Video' : 'Image'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  text: {
    textAlign: 'center',
    fontWeight: '500',
    padding: 8,
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mediaContainer: {
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  mediaContent: {
    alignItems: 'center',
  },
  mediaIcon: {
    marginBottom: 4,
  },
  mediaText: {
    color: '#6c757d',
    fontWeight: '500',
  },
});
