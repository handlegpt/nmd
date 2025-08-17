import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Chip,
  Surface,
  Text,
  IconButton,
  Button,
  Divider,
  List,
  Portal,
  Modal,
} from 'react-native-paper';

interface Tag {
  id: string;
  name: string;
  category: string;
  color: string;
}

interface Emotion {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

interface Topic {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface PostEnhancerProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  selectedEmotion?: string;
  onEmotionChange: (emotion: string) => void;
  selectedTopic?: string;
  onTopicChange: (topic: string) => void;
  content: string;
}

export const PostEnhancer: React.FC<PostEnhancerProps> = ({
  selectedTags,
  onTagsChange,
  selectedEmotion,
  onEmotionChange,
  selectedTopic,
  onTopicChange,
  content,
}) => {
  const [suggestedTags, setSuggestedTags] = useState<Tag[]>([]);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showEmotionModal, setShowEmotionModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);

  // Predefined data
  const emotions: Emotion[] = [
    { id: 'happy', name: 'Happy', emoji: '😊', color: '#10b981' },
    { id: 'excited', name: 'Excited', emoji: '🤩', color: '#f59e0b' },
    { id: 'relaxed', name: 'Relaxed', emoji: '😌', color: '#6366f1' },
    { id: 'inspired', name: 'Inspired', emoji: '✨', color: '#8b5cf6' },
    { id: 'grateful', name: 'Grateful', emoji: '🙏', color: '#06b6d4' },
    { id: 'adventurous', name: 'Adventurous', emoji: '🏔️', color: '#ef4444' },
    { id: 'productive', name: 'Productive', emoji: '💪', color: '#059669' },
    { id: 'creative', name: 'Creative', emoji: '🎨', color: '#ec4899' },
  ];

  const topics: Topic[] = [
    { id: 'travel', name: 'Travel', description: 'Share your travel experiences', icon: 'airplane' },
    { id: 'work', name: 'Work', description: 'Remote work and productivity', icon: 'laptop' },
    { id: 'food', name: 'Food', description: 'Local cuisine and dining', icon: 'food' },
    { id: 'culture', name: 'Culture', description: 'Local culture and traditions', icon: 'account-group' },
    { id: 'nature', name: 'Nature', description: 'Outdoor adventures', icon: 'tree' },
    { id: 'city', name: 'City Life', description: 'Urban experiences', icon: 'city' },
    { id: 'wellness', name: 'Wellness', description: 'Health and wellness', icon: 'heart' },
    { id: 'learning', name: 'Learning', description: 'Skills and knowledge', icon: 'school' },
  ];

  const allTags: Tag[] = [
    // Travel tags
    { id: 'bali', name: 'Bali', category: 'travel', color: '#10b981' },
    { id: 'thailand', name: 'Thailand', category: 'travel', color: '#f59e0b' },
    { id: 'vietnam', name: 'Vietnam', category: 'travel', color: '#ef4444' },
    { id: 'japan', name: 'Japan', category: 'travel', color: '#6366f1' },
    { id: 'europe', name: 'Europe', category: 'travel', color: '#8b5cf6' },
    { id: 'south-america', name: 'South America', category: 'travel', color: '#06b6d4' },
    
    // Work tags
    { id: 'coworking', name: 'Coworking', category: 'work', color: '#059669' },
    { id: 'remote-work', name: 'Remote Work', category: 'work', color: '#6366f1' },
    { id: 'productivity', name: 'Productivity', category: 'work', color: '#10b981' },
    { id: 'freelance', name: 'Freelance', category: 'work', color: '#f59e0b' },
    { id: 'startup', name: 'Startup', category: 'work', color: '#ef4444' },
    
    // Food tags
    { id: 'local-food', name: 'Local Food', category: 'food', color: '#f59e0b' },
    { id: 'street-food', name: 'Street Food', category: 'food', color: '#ef4444' },
    { id: 'cafe', name: 'Cafe', category: 'food', color: '#8b5cf6' },
    { id: 'restaurant', name: 'Restaurant', category: 'food', color: '#06b6d4' },
    { id: 'cooking', name: 'Cooking', category: 'food', color: '#10b981' },
    
    // Lifestyle tags
    { id: 'beach', name: 'Beach', category: 'nature', color: '#06b6d4' },
    { id: 'mountains', name: 'Mountains', category: 'nature', color: '#8b5cf6' },
    { id: 'surfing', name: 'Surfing', category: 'nature', color: '#6366f1' },
    { id: 'hiking', name: 'Hiking', category: 'nature', color: '#10b981' },
    { id: 'yoga', name: 'Yoga', category: 'wellness', color: '#ec4899' },
    { id: 'meditation', name: 'Meditation', category: 'wellness', color: '#8b5cf6' },
    { id: 'fitness', name: 'Fitness', category: 'wellness', color: '#ef4444' },
  ];

  // Generate tag suggestions based on content
  useEffect(() => {
    if (content.length > 0) {
      const words = content.toLowerCase().split(/\s+/);
      const suggestions = allTags.filter(tag => 
        words.some(word => 
          tag.name.toLowerCase().includes(word) || 
          word.includes(tag.name.toLowerCase())
        )
      ).slice(0, 8);
      setSuggestedTags(suggestions);
    } else {
      setSuggestedTags([]);
    }
  }, [content]);

  const handleTagToggle = (tagName: string) => {
    const newTags = selectedTags.includes(tagName)
      ? selectedTags.filter(tag => tag !== tagName)
      : [...selectedTags, tagName];
    onTagsChange(newTags);
  };

  const handleEmotionSelect = (emotionId: string) => {
    onEmotionChange(emotionId);
    setShowEmotionModal(false);
  };

  const handleTopicSelect = (topicId: string) => {
    onTopicChange(topicId);
    setShowTopicModal(false);
  };

  const getSelectedEmotion = () => {
    return emotions.find(e => e.id === selectedEmotion);
  };

  const getSelectedTopic = () => {
    return topics.find(t => t.id === selectedTopic);
  };

  const renderTagModal = () => (
    <Portal>
      <Modal
        visible={showTagModal}
        onDismiss={() => setShowTagModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Tags</Text>
          
          <ScrollView style={styles.tagScrollView}>
            {Object.entries(
              allTags.reduce((acc, tag) => {
                if (!acc[tag.category]) acc[tag.category] = [];
                acc[tag.category].push(tag);
                return acc;
              }, {} as Record<string, Tag[]>)
            ).map(([category, tags]) => (
              <View key={category} style={styles.categorySection}>
                <Text style={styles.categoryTitle}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
                <View style={styles.tagGrid}>
                  {tags.map(tag => (
                    <Chip
                      key={tag.id}
                      selected={selectedTags.includes(tag.name)}
                      onPress={() => handleTagToggle(tag.name)}
                      style={[
                        styles.tagChip,
                        { backgroundColor: selectedTags.includes(tag.name) ? tag.color : '#f1f5f9' }
                      ]}
                      textStyle={[
                        styles.tagText,
                        { color: selectedTags.includes(tag.name) ? '#ffffff' : '#475569' }
                      ]}
                    >
                      {tag.name}
                    </Chip>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
          
          <Button
            mode="contained"
            onPress={() => setShowTagModal(false)}
            style={styles.modalButton}
          >
            Done
          </Button>
        </Surface>
      </Modal>
    </Portal>
  );

  const renderEmotionModal = () => (
    <Portal>
      <Modal
        visible={showEmotionModal}
        onDismiss={() => setShowEmotionModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalContent}>
          <Text style={styles.modalTitle}>How are you feeling?</Text>
          
          <View style={styles.emotionGrid}>
            {emotions.map(emotion => (
              <Button
                key={emotion.id}
                mode={selectedEmotion === emotion.id ? "contained" : "outlined"}
                onPress={() => handleEmotionSelect(emotion.id)}
                style={[
                  styles.emotionButton,
                  { backgroundColor: selectedEmotion === emotion.id ? emotion.color : 'transparent' }
                ]}
                labelStyle={[
                  styles.emotionLabel,
                  { color: selectedEmotion === emotion.id ? '#ffffff' : emotion.color }
                ]}
              >
                {emotion.emoji} {emotion.name}
              </Button>
            ))}
          </View>
          
          <Button
            mode="outlined"
            onPress={() => setShowEmotionModal(false)}
            style={styles.modalButton}
          >
            Cancel
          </Button>
        </Surface>
      </Modal>
    </Portal>
  );

  const renderTopicModal = () => (
    <Portal>
      <Modal
        visible={showTopicModal}
        onDismiss={() => setShowTopicModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalContent}>
          <Text style={styles.modalTitle}>Choose a Topic</Text>
          
          <ScrollView style={styles.topicScrollView}>
            {topics.map(topic => (
              <List.Item
                key={topic.id}
                title={topic.name}
                description={topic.description}
                left={(props) => <List.Icon {...props} icon={topic.icon} color="#6366f1" />}
                onPress={() => handleTopicSelect(topic.id)}
                style={[
                  styles.topicItem,
                  selectedTopic === topic.id && styles.selectedTopicItem
                ]}
              />
            ))}
          </ScrollView>
          
          <Button
            mode="outlined"
            onPress={() => setShowTopicModal(false)}
            style={styles.modalButton}
          >
            Cancel
          </Button>
        </Surface>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <Surface style={styles.selectedTagsContainer}>
          <Text style={styles.sectionTitle}>Selected Tags</Text>
          <View style={styles.selectedTagsGrid}>
            {selectedTags.map(tagName => {
              const tag = allTags.find(t => t.name === tagName);
              return (
                <Chip
                  key={tagName}
                  onPress={() => handleTagToggle(tagName)}
                  style={[styles.selectedTagChip, { backgroundColor: tag?.color || '#6366f1' }]}
                  textStyle={styles.selectedTagText}
                >
                  {tagName}
                </Chip>
              );
            })}
          </View>
        </Surface>
      )}

      {/* Suggested Tags */}
      {suggestedTags.length > 0 && (
        <Surface style={styles.suggestedTagsContainer}>
          <Text style={styles.sectionTitle}>Suggested Tags</Text>
          <View style={styles.suggestedTagsGrid}>
            {suggestedTags.map(tag => (
              <Chip
                key={tag.id}
                onPress={() => handleTagToggle(tag.name)}
                style={styles.suggestedTagChip}
                textStyle={styles.suggestedTagText}
              >
                {tag.name}
              </Chip>
            ))}
          </View>
        </Surface>
      )}

      {/* Enhancement Options */}
      <Surface style={styles.enhancementContainer}>
        <Text style={styles.sectionTitle}>Enhance Your Post</Text>
        
        <View style={styles.enhancementOptions}>
          {/* Add Tags */}
          <Button
            mode="outlined"
            onPress={() => setShowTagModal(true)}
            icon="tag"
            style={styles.enhancementButton}
          >
            Add Tags ({selectedTags.length})
          </Button>

          {/* Select Emotion */}
          <Button
            mode="outlined"
            onPress={() => setShowEmotionModal(true)}
            icon="emoticon"
            style={styles.enhancementButton}
          >
            {getSelectedEmotion() ? `${getSelectedEmotion()?.emoji} ${getSelectedEmotion()?.name}` : 'Add Emotion'}
          </Button>

          {/* Select Topic */}
          <Button
            mode="outlined"
            onPress={() => setShowTopicModal(true)}
            icon="folder"
            style={styles.enhancementButton}
          >
            {getSelectedTopic() ? getSelectedTopic()?.name : 'Choose Topic'}
          </Button>
        </View>
      </Surface>

      {/* Modals */}
      {renderTagModal()}
      {renderEmotionModal()}
      {renderTopicModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  selectedTagsContainer: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
  },
  suggestedTagsContainer: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
  },
  enhancementContainer: {
    padding: 12,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  selectedTagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  suggestedTagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  selectedTagChip: {
    marginBottom: 4,
  },
  selectedTagText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  suggestedTagChip: {
    backgroundColor: '#f1f5f9',
    marginBottom: 4,
  },
  suggestedTagText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '500',
  },
  enhancementOptions: {
    gap: 8,
  },
  enhancementButton: {
    borderColor: '#6366f1',
    justifyContent: 'flex-start',
  },
  modalContainer: {
    margin: 20,
    maxHeight: '80%',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    maxHeight: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  tagScrollView: {
    maxHeight: 400,
    marginBottom: 16,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  emotionButton: {
    marginBottom: 8,
    borderColor: '#6366f1',
  },
  emotionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  topicScrollView: {
    maxHeight: 400,
    marginBottom: 16,
  },
  topicItem: {
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedTopicItem: {
    backgroundColor: '#f1f5f9',
  },
  modalButton: {
    marginTop: 8,
  },
});
