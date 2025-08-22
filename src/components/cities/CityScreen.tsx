import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Chip,
  IconButton,
  Button,
  Searchbar,
  Divider,
} from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import { shadowPresets } from '../../utils/platformStyles';
import { colors, spacing, borderRadius } from '../../utils/responsive';
import ResponsiveContainer from '../common/ResponsiveContainer';
import Toast from '../common/Toast';
import LoadingSpinner from '../common/LoadingSpinner';

interface NomadCity {
  id: string;
  name: string;
  country: string;
  continent: string;
  image: string;
  description: string;
  costOfLiving: 'Low' | 'Medium' | 'High';
  internetSpeed: number; // Mbps
  weather: string;
  timezone: string;
  nomadScore: number; // 1-10
  monthlyBudget: {
    accommodation: number;
    food: number;
    transport: number;
    entertainment: number;
  };
  highlights: string[];
  cons: string[];
  isFavorite: boolean;
}

export const CityScreen: React.FC = ({ navigation }: { navigation?: any }) => {
  const { user } = useAuthStore();
  const [cities, setCities] = useState<NomadCity[]>([]);
  const [filteredCities, setFilteredCities] = useState<NomadCity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string>('All');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' | 'warning' });

  const continents = ['All', 'Asia', 'Europe', 'Americas', 'Africa', 'Oceania'];

  useEffect(() => {
    loadCities();
  }, []);

  useEffect(() => {
    filterCities();
  }, [cities, searchQuery, selectedContinent]);

  // Show toast message
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ visible: true, message, type });
  };

  // Hide toast message
  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  // Load cities data
  const loadCities = async () => {
    setLoading(true);
    try {
      // Mock data - in production, this would come from API
      const mockCities: NomadCity[] = [
        {
          id: '1',
          name: 'Bali',
          country: 'Indonesia',
          continent: 'Asia',
          image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800',
          description: 'Tropical paradise with vibrant digital nomad community, affordable living, and stunning beaches.',
          costOfLiving: 'Low',
          internetSpeed: 25,
          weather: 'Tropical (25-32°C)',
          timezone: 'GMT+8',
          nomadScore: 9.2,
          monthlyBudget: {
            accommodation: 800,
            food: 400,
            transport: 150,
            entertainment: 300,
          },
          highlights: ['Affordable living', 'Great community', 'Beautiful beaches', 'Rich culture'],
          cons: ['Rainy season', 'Traffic congestion', 'Limited public transport'],
          isFavorite: false,
        },
        {
          id: '2',
          name: 'Chiang Mai',
          country: 'Thailand',
          continent: 'Asia',
          image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800',
          description: 'Cultural hub with excellent food, affordable living, and strong digital nomad scene.',
          costOfLiving: 'Low',
          internetSpeed: 30,
          weather: 'Tropical (20-35°C)',
          timezone: 'GMT+7',
          nomadScore: 8.8,
          monthlyBudget: {
            accommodation: 600,
            food: 300,
            transport: 100,
            entertainment: 250,
          },
          highlights: ['Excellent food', 'Cultural sites', 'Affordable', 'Good community'],
          cons: ['Burning season', 'Limited nightlife', 'Language barrier'],
          isFavorite: false,
        },
        {
          id: '3',
          name: 'Lisbon',
          country: 'Portugal',
          continent: 'Europe',
          image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
          description: 'Charming European city with great weather, food, and growing tech scene.',
          costOfLiving: 'Medium',
          internetSpeed: 100,
          weather: 'Mediterranean (15-28°C)',
          timezone: 'GMT+0',
          nomadScore: 8.5,
          monthlyBudget: {
            accommodation: 1200,
            food: 500,
            transport: 200,
            entertainment: 400,
          },
          highlights: ['Great weather', 'European culture', 'Good food', 'Safe city'],
          cons: ['Higher cost', 'Tourist crowds', 'Hilly terrain'],
          isFavorite: false,
        },
        {
          id: '4',
          name: 'Mexico City',
          country: 'Mexico',
          continent: 'Americas',
          image: 'https://images.unsplash.com/photo-1522083165195-3424ed129620?w=800',
          description: 'Vibrant metropolis with rich culture, excellent food, and affordable living.',
          costOfLiving: 'Medium',
          internetSpeed: 50,
          weather: 'Subtropical (12-30°C)',
          timezone: 'GMT-6',
          nomadScore: 8.0,
          monthlyBudget: {
            accommodation: 1000,
            food: 400,
            transport: 150,
            entertainment: 300,
          },
          highlights: ['Rich culture', 'Excellent food', 'Affordable', 'Vibrant city'],
          cons: ['Air pollution', 'Safety concerns', 'Traffic'],
          isFavorite: false,
        },
        {
          id: '5',
          name: 'Porto',
          country: 'Portugal',
          continent: 'Europe',
          image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
          description: 'Charming Portuguese city with wine culture, affordable living, and great weather.',
          costOfLiving: 'Medium',
          internetSpeed: 100,
          weather: 'Mediterranean (10-25°C)',
          timezone: 'GMT+0',
          nomadScore: 8.3,
          monthlyBudget: {
            accommodation: 1000,
            food: 450,
            transport: 150,
            entertainment: 350,
          },
          highlights: ['Wine culture', 'Affordable', 'Good weather', 'Less crowded'],
          cons: ['Smaller city', 'Limited international flights', 'Language barrier'],
          isFavorite: false,
        },
      ];
      setCities(mockCities);
    } catch (error) {
      showToast('Failed to load cities', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter cities based on search and continent
  const filterCities = () => {
    let filtered = cities;

    // Filter by continent
    if (selectedContinent !== 'All') {
      filtered = filtered.filter(city => city.continent === selectedContinent);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(city =>
        city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCities(filtered);
  };

  // Toggle favorite status
  const toggleFavorite = (cityId: string) => {
    setCities(prev =>
      prev.map(city =>
        city.id === cityId
          ? { ...city, isFavorite: !city.isFavorite }
          : city
      )
    );
  };

  // Get cost of living color
  const getCostColor = (cost: string) => {
    switch (cost) {
      case 'Low':
        return '#4CAF50';
      case 'Medium':
        return '#FF9800';
      case 'High':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  // Get nomad score color
  const getScoreColor = (score: number) => {
    if (score >= 8) return '#4CAF50';
    if (score >= 6) return '#FF9800';
    return '#F44336';
  };

  // Render city item
  const renderCity = ({ item }: { item: NomadCity }) => (
    <Card style={styles.cityCard}>
      <Card.Cover source={{ uri: item.image }} style={styles.cityImage} />
      <Card.Content>
        <View style={styles.cityHeader}>
          <View style={styles.cityInfo}>
            <Title style={styles.cityName}>{item.name}</Title>
            <Paragraph style={styles.cityCountry}>{item.country}</Paragraph>
          </View>
          <IconButton
            icon={item.isFavorite ? 'heart' : 'heart-outline'}
            iconColor={item.isFavorite ? '#F44336' : colors.gray400}
            size={24}
            onPress={() => toggleFavorite(item.id)}
          />
        </View>

        <Paragraph style={styles.cityDescription}>{item.description}</Paragraph>

        <View style={styles.cityStats}>
          <Chip
            style={[styles.costChip, { backgroundColor: getCostColor(item.costOfLiving) }]}
            textStyle={{ color: '#fff' }}
          >
            {item.costOfLiving} Cost
          </Chip>
          <Chip
            style={[styles.scoreChip, { backgroundColor: getScoreColor(item.nomadScore) }]}
            textStyle={{ color: '#fff' }}
          >
            {item.nomadScore}/10
          </Chip>
          <Chip style={styles.internetChip}>
            {item.internetSpeed} Mbps
          </Chip>
        </View>

        <View style={styles.budgetSection}>
          <Title style={styles.budgetTitle}>Monthly Budget</Title>
          <View style={styles.budgetGrid}>
            <View style={styles.budgetItem}>
              <Paragraph style={styles.budgetLabel}>Accommodation</Paragraph>
              <Paragraph style={styles.budgetAmount}>${item.monthlyBudget.accommodation}</Paragraph>
            </View>
            <View style={styles.budgetItem}>
              <Paragraph style={styles.budgetLabel}>Food</Paragraph>
              <Paragraph style={styles.budgetAmount}>${item.monthlyBudget.food}</Paragraph>
            </View>
            <View style={styles.budgetItem}>
              <Paragraph style={styles.budgetLabel}>Transport</Paragraph>
              <Paragraph style={styles.budgetAmount}>${item.monthlyBudget.transport}</Paragraph>
            </View>
            <View style={styles.budgetItem}>
              <Paragraph style={styles.budgetLabel}>Entertainment</Paragraph>
              <Paragraph style={styles.budgetAmount}>${item.monthlyBudget.entertainment}</Paragraph>
            </View>
          </View>
        </View>

        <View style={styles.highlightsSection}>
          <Title style={styles.sectionTitle}>Highlights</Title>
          <View style={styles.tagsContainer}>
            {item.highlights.map((highlight, index) => (
              <Chip key={index} style={styles.tagChip} textStyle={styles.tagText}>
                {highlight}
              </Chip>
            ))}
          </View>
        </View>

        <Button
          mode="contained"
          onPress={() => showToast(`Learn more about ${item.name}`, 'info')}
          style={styles.learnMoreButton}
        >
          Learn More
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <ResponsiveContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          <Title style={styles.title}>Nomad Cities</Title>
          <Paragraph style={styles.subtitle}>
            Discover the best cities for digital nomads
          </Paragraph>
        </View>

        <Searchbar
          placeholder="Search cities..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        <View style={styles.filterContainer}>
          <FlatList
            data={continents}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Chip
                selected={selectedContinent === item}
                onPress={() => setSelectedContinent(item)}
                style={[
                  styles.filterChip,
                  selectedContinent === item && styles.selectedFilterChip
                ]}
                textStyle={[
                  styles.filterChipText,
                  selectedContinent === item && styles.selectedFilterChipText
                ]}
              >
                {item}
              </Chip>
            )}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.filterList}
          />
        </View>

        <FlatList
          data={filteredCities}
          renderItem={renderCity}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.citiesList}
        />

        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />

        <LoadingSpinner visible={loading} />
      </View>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    ...shadowPresets.small,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  searchbar: {
    margin: spacing.lg,
    marginTop: spacing.base,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    ...shadowPresets.small,
  },
  filterContainer: {
    marginBottom: spacing.base,
  },
  filterList: {
    paddingHorizontal: spacing.lg,
  },
  filterChip: {
    marginRight: spacing.sm,
    backgroundColor: colors.gray100,
  },
  selectedFilterChip: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    color: colors.textSecondary,
  },
  selectedFilterChipText: {
    color: colors.white,
  },
  citiesList: {
    padding: spacing.lg,
  },
  cityCard: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.white,
    ...shadowPresets.medium,
  },
  cityImage: {
    height: 200,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  cityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: spacing.base,
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cityCountry: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  cityDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: spacing.sm,
    marginBottom: spacing.base,
  },
  cityStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.base,
  },
  costChip: {
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  scoreChip: {
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  internetChip: {
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: colors.gray200,
  },
  budgetSection: {
    marginBottom: spacing.base,
  },
  budgetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  budgetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  budgetItem: {
    width: '50%',
    marginBottom: spacing.sm,
  },
  budgetLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  budgetAmount: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  highlightsSection: {
    marginBottom: spacing.base,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
    backgroundColor: colors.gray100,
  },
  tagText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  learnMoreButton: {
    marginTop: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
  },
});
