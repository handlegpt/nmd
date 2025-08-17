import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Platform,
  Image,
} from 'react-native';
import {
  Button,
  IconButton,
  Surface,
  Text,
  Portal,
  Modal,
  List,
  Divider,
} from 'react-native-paper';
import * as ExpoImagePicker from 'expo-image-picker';
import * as ExpoMediaLibrary from 'expo-media-library';

interface MediaItem {
  id: string;
  uri: string;
  type: 'image' | 'video';
  filename: string;
  size: number;
}

interface MediaPickerProps {
  onMediaSelect: (media: MediaItem[]) => void;
  maxItems?: number;
  allowedTypes?: ('image' | 'video')[];
}

export const MediaPicker: React.FC<MediaPickerProps> = ({
  onMediaSelect,
  maxItems = 9,
  allowedTypes = ['image', 'video'],
}) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ExpoImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ExpoMediaLibrary.requestPermissionsAsync();
      
      if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera and media library access is required to select media.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  const handleCameraCapture = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ExpoImagePicker.launchCameraAsync({
        mediaTypes: ExpoImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const mediaItem: MediaItem = {
          id: Date.now().toString(),
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'image',
          filename: asset.fileName || `media_${Date.now()}`,
          size: asset.fileSize || 0,
        };

        addMediaItem(mediaItem);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to capture media');
    }
  };

  const handleGalleryPick = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ExpoImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        selectionLimit: maxItems - selectedMedia.length,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newMediaItems: MediaItem[] = result.assets.map((asset, index) => ({
          id: `${Date.now()}_${index}`,
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'image',
          filename: asset.fileName || `media_${Date.now()}_${index}`,
          size: asset.fileSize || 0,
        }));

        addMediaItems(newMediaItems);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to select media from gallery');
    }
  };

  const addMediaItem = (mediaItem: MediaItem) => {
    if (selectedMedia.length >= maxItems) {
      Alert.alert('Limit Reached', `You can only select up to ${maxItems} media items`);
      return;
    }

    const updatedMedia = [...selectedMedia, mediaItem];
    setSelectedMedia(updatedMedia);
    onMediaSelect(updatedMedia);
  };

  const addMediaItems = (mediaItems: MediaItem[]) => {
    const totalItems = selectedMedia.length + mediaItems.length;
    if (totalItems > maxItems) {
      Alert.alert('Limit Reached', `You can only select up to ${maxItems} media items`);
      return;
    }

    const updatedMedia = [...selectedMedia, ...mediaItems];
    setSelectedMedia(updatedMedia);
    onMediaSelect(updatedMedia);
  };

  const removeMediaItem = (id: string) => {
    const updatedMedia = selectedMedia.filter(item => item.id !== id);
    setSelectedMedia(updatedMedia);
    onMediaSelect(updatedMedia);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderMediaItem = (item: MediaItem) => (
    <Surface key={item.id} style={styles.mediaItem}>
      <Image source={{ uri: item.uri }} style={styles.mediaPreview} />
      <View style={styles.mediaOverlay}>
        <IconButton
          icon="close"
          size={16}
          iconColor="#ffffff"
          style={styles.removeButton}
          onPress={() => removeMediaItem(item.id)}
        />
        {item.type === 'video' && (
          <IconButton
            icon="play"
            size={20}
            iconColor="#ffffff"
            style={styles.playButton}
          />
        )}
      </View>
      <View style={styles.mediaInfo}>
        <Text style={styles.mediaType}>{item.type.toUpperCase()}</Text>
        <Text style={styles.mediaSize}>{formatFileSize(item.size)}</Text>
      </View>
    </Surface>
  );

  return (
    <View style={styles.container}>
      {/* Media Grid */}
      {selectedMedia.length > 0 && (
        <View style={styles.mediaGrid}>
          {selectedMedia.map(renderMediaItem)}
        </View>
      )}

      {/* Add Media Button */}
      {selectedMedia.length < maxItems && (
        <Button
          mode="outlined"
          onPress={() => setModalVisible(true)}
          icon="camera"
          style={styles.addButton}
          labelStyle={styles.addButtonLabel}
        >
          Add Media ({selectedMedia.length}/{maxItems})
        </Button>
      )}

      {/* Media Selection Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Media</Text>
            
            <List.Item
              title="Take Photo/Video"
              description="Capture new media with camera"
              left={(props) => <List.Icon {...props} icon="camera" />}
              onPress={() => {
                setModalVisible(false);
                handleCameraCapture();
              }}
            />
            
            <Divider />
            
            <List.Item
              title="Choose from Gallery"
              description="Select existing media from your device"
              left={(props) => <List.Icon {...props} icon="image-multiple" />}
              onPress={() => {
                setModalVisible(false);
                handleGalleryPick();
              }}
            />
            
            <Divider />
            
            <List.Item
              title="Cancel"
              left={(props) => <List.Icon {...props} icon="close" />}
              onPress={() => setModalVisible(false)}
            />
          </Surface>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  mediaItem: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
  },
  mediaOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 4,
  },
  removeButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    margin: 0,
  },
  playButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    margin: 0,
  },
  mediaInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 4,
  },
  mediaType: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  mediaSize: {
    color: '#ffffff',
    fontSize: 8,
    opacity: 0.8,
  },
  addButton: {
    borderColor: '#6366f1',
    borderStyle: 'dashed',
  },
  addButtonLabel: {
    color: '#6366f1',
  },
  modalContainer: {
    margin: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
});
