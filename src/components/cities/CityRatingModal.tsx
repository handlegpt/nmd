import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Modal,
  Portal,
  Surface,
  Title,
  Paragraph,
  Button,
  IconButton,
  TextInput,
  Chip,
  Divider,
  ProgressBar,
} from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, borderRadius } from '../../utils/responsive';
import { shadowPresets } from '../../utils/platformStyles';
import { CityRatingService, RatingCriteria } from '../../services/cityRatingService';
import { NomadCity } from '../../services/cityService';
import { ToastOptimized } from '../common/ToastOptimized';

interface CityRatingModalProps {
  visible: boolean;
  city: NomadCity | null;
  onDismiss: () => void;
  onRatingSubmitted?: () => void;
}

const ratingCategories = [
  { key: 'overall', label: '总体评分', description: '整体体验' },
  { key: 'cost', label: '生活成本', description: '住宿、餐饮、交通费用' },
  { key: 'internet', label: '网络质量', description: '网速和稳定性' },
  { key: 'safety', label: '安全性', description: '治安和人身安全' },
  { key: 'community', label: '社区氛围', description: '数字游民社区' },
  { key: 'weather', label: '天气气候', description: '全年气候条件' },
  { key: 'food', label: '美食文化', description: '当地美食和餐厅' },
  { key: 'transport', label: '交通便利', description: '公共交通和出行' },
];

export const CityRatingModal: React.FC<CityRatingModalProps> = ({
  visible,
  city,
  onDismiss,
  onRatingSubmitted,
}) => {
  const { user } = useAuthStore();
  const [ratings, setRatings] = useState<RatingCriteria>({
    overall: 0,
    cost: 0,
    internet: 0,
    safety: 0,
    community: 0,
    weather: 0,
    food: 0,
    transport: 0,
  });
  const [existingRating, setExistingRating] = useState<RatingCriteria | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' | 'warning' });

  // Show toast
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ visible: true, message, type });
  };

  // Hide toast
  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Load existing rating when modal opens
  useEffect(() => {
    if (visible && city && user) {
      loadExistingRating();
    }
  }, [visible, city, user]);

  // Load existing rating
  const loadExistingRating = async () => {
    if (!city || !user) return;

    try {
      const existing = await CityRatingService.getUserRating(city.id, user.id);
      if (existing) {
        const ratingData: RatingCriteria = {
          overall: existing.overall_rating,
          cost: existing.cost_rating,
          internet: existing.internet_rating,
          safety: existing.safety_rating,
          community: existing.community_rating,
          weather: existing.weather_rating,
          food: existing.food_rating,
          transport: existing.transport_rating,
        };
        setRatings(ratingData);
        setExistingRating(ratingData);
      }
    } catch (error) {
      console.error('Error loading existing rating:', error);
    }
  };

  // Handle rating change
  const handleRatingChange = (category: keyof RatingCriteria, value: number) => {
    setRatings(prev => ({
      ...prev,
      [category]: value,
    }));
  };

  // Submit rating
  const handleSubmit = async () => {
    if (!user || !city) {
      showToast('请先登录', 'warning');
      return;
    }

    // Check if all ratings are provided
    const hasAllRatings = Object.values(ratings).every(rating => rating > 0);
    if (!hasAllRatings) {
      showToast('请完成所有评分项目', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const result = await CityRatingService.submitRating(city.id, user.id, ratings);
      
      if (result) {
        showToast(
          existingRating ? '评分更新成功' : '评分提交成功',
          'success'
        );
        onRatingSubmitted?.();
        onDismiss();
      } else {
        showToast('评分提交失败', 'error');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      showToast('评分提交失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset ratings
  const handleReset = () => {
    setRatings({
      overall: 0,
      cost: 0,
      internet: 0,
      safety: 0,
      community: 0,
      weather: 0,
      food: 0,
      transport: 0,
    });
  };

  // Calculate average rating
  const averageRating = Object.values(ratings).filter(r => r > 0).reduce((a, b) => a + b, 0) / 
    Object.values(ratings).filter(r => r > 0).length;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Title style={styles.headerTitle}>
              {existingRating ? '更新评分' : '为城市评分'}
            </Title>
            <IconButton
              icon="close"
              size={24}
              onPress={onDismiss}
              style={styles.closeButton}
            />
          </View>

          <Divider />

          {/* City Info */}
          {city && (
            <View style={styles.cityInfo}>
              <Title style={styles.cityName}>{city.name}</Title>
              <Paragraph style={styles.cityCountry}>{city.country}</Paragraph>
            </View>
          )}

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Rating Categories */}
            <View style={styles.ratingSection}>
              <Title style={styles.sectionTitle}>评分项目</Title>
              
              {ratingCategories.map((category) => (
                <View key={category.key} style={styles.ratingItem}>
                  <View style={styles.ratingHeader}>
                    <View style={styles.ratingLabel}>
                      <Paragraph style={styles.ratingTitle}>
                        {category.label}
                      </Paragraph>
                      <Paragraph style={styles.ratingDescription}>
                        {category.description}
                      </Paragraph>
                    </View>
                    <View style={styles.ratingValue}>
                      <Paragraph style={styles.ratingNumber}>
                        {ratings[category.key as keyof RatingCriteria]}
                      </Paragraph>
                      <Paragraph style={styles.ratingMax}>/ 5</Paragraph>
                    </View>
                  </View>
                  
                  <ProgressBar
                    progress={ratings[category.key as keyof RatingCriteria] / 5}
                    color={colors.primary}
                    style={styles.progressBar}
                  />
                  
                  <View style={styles.ratingButtons}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Chip
                        key={value}
                        selected={ratings[category.key as keyof RatingCriteria] === value}
                        onPress={() => handleRatingChange(category.key as keyof RatingCriteria, value)}
                        style={styles.ratingChip}
                        textStyle={styles.ratingChipText}
                      >
                        {value}
                      </Chip>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            {/* Average Rating */}
            {averageRating > 0 && (
              <View style={styles.averageSection}>
                <Title style={styles.averageTitle}>平均评分</Title>
                <View style={styles.averageDisplay}>
                  <Paragraph style={styles.averageNumber}>
                    {averageRating.toFixed(1)}
                  </Paragraph>
                  <Paragraph style={styles.averageMax}>/ 5.0</Paragraph>
                </View>
                <ProgressBar
                  progress={averageRating / 5}
                  color={colors.primary}
                  style={styles.averageProgress}
                />
              </View>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={handleReset}
              style={styles.resetButton}
              disabled={submitting}
            >
              重置
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={submitting}
              disabled={averageRating === 0}
              style={styles.submitButton}
            >
              {existingRating ? '更新评分' : '提交评分'}
            </Button>
          </View>
        </Surface>

        <ToastOptimized
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    margin: spacing.md,
  },
  modalContent: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadowPresets.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  closeButton: {
    margin: 0,
  },
  cityInfo: {
    padding: spacing.md,
    paddingTop: 0,
  },
  cityName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cityCountry: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  ratingSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  ratingItem: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.lg,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  ratingLabel: {
    flex: 1,
  },
  ratingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  ratingDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  ratingValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  ratingNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  ratingMax: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: spacing.sm,
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingChip: {
    marginHorizontal: 2,
  },
  ratingChipText: {
    fontSize: 12,
  },
  averageSection: {
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  averageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  averageDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  averageNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.white,
  },
  averageMax: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
    marginLeft: 4,
  },
  averageProgress: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
    opacity: 0.3,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  resetButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  submitButton: {
    flex: 1,
    marginLeft: spacing.sm,
  },
});

export default CityRatingModal;
