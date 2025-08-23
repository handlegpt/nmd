import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {
  Searchbar,
  Card,
  Title,
  Paragraph,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Surface,
  useTheme,
  ActivityIndicator,
  Text,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { SearchService, SearchResult, SearchFilters } from '../../services/searchService';
import { useResponsive } from '../../utils/responsive';
import { colors, spacing, borderRadius } from '../../utils/responsive';
import ResponsiveContainer from '../common/ResponsiveContainer';
import Toast from '../common/Toast';
import LoadingSpinner from '../common/LoadingSpinner';
import { debounce } from '../../utils/performance';

export const GlobalSearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { isPhone } = useResponsive();

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    types: ['user', 'post', 'city', 'meetup'],
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' | 'warning' });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const searchResults = await SearchService.globalSearch(query, filters, 20);
        setResults(searchResults);
      } catch (error) {
        showToast('Search failed', 'error');
      } finally {
        setLoading(false);
      }
    }, 300),
    [filters]
  );

  // Get suggestions
  const getSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const suggestionsData = await SearchService.getSuggestions(query);
        setSuggestions(suggestionsData);
      } catch (error) {
        console.error('Suggestions error:', error);
      }
    }, 200),
    []
  );

  // Handle search query change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setShowSuggestions(query.length > 0);
    
    if (query.length >= 2) {
      debouncedSearch(query);
      getSuggestions(query);
    } else {
      setResults([]);
      setSuggestions([]);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    debouncedSearch(suggestion);
  };

  // Handle result selection
  const handleResultSelect = (result: SearchResult) => {
    setShowSuggestions(false);
    
    switch (result.type) {
      case 'user':
        navigation.navigate('Profile' as never, { userId: result.id } as never);
        break;
      case 'post':
        navigation.navigate('Feed' as never, { postId: result.id } as never);
        break;
      case 'city':
        navigation.navigate('Cities' as never, { cityId: result.id } as never);
        break;
      case 'meetup':
        navigation.navigate('Activities' as never, { meetupId: result.id } as never);
        break;
    }
  };

  // Toggle filter
  const toggleFilter = (type: 'user' | 'post' | 'city' | 'meetup') => {
    const currentTypes = filters.types || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    setFilters({ ...filters, types: newTypes });
    
    if (searchQuery.length >= 2) {
      debouncedSearch(searchQuery);
    }
  };

  // Show toast
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ visible: true, message, type });
  };

  // Hide toast
  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  // Get result icon
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'user': return 'account';
      case 'post': return 'post';
      case 'city': return 'city';
      case 'meetup': return 'calendar';
      default: return 'help';
    }
  };

  // Get result color
  const getResultColor = (type: string) => {
    switch (type) {
      case 'user': return colors.primary;
      case 'post': return colors.secondary;
      case 'city': return colors.success;
      case 'meetup': return colors.warning;
      default: return colors.gray;
    }
  };

  // Render suggestion item
  const renderSuggestion = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionSelect(item)}
    >
      <IconButton icon="magnify" size={20} />
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

  // Render search result
  const renderResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity onPress={() => handleResultSelect(item)}>
      <Card style={styles.resultCard} mode="outlined">
        <Card.Content style={styles.resultContent}>
          <View style={styles.resultHeader}>
            <Avatar.Image
              size={40}
              source={item.image ? { uri: item.image } : undefined}
              style={{ backgroundColor: getResultColor(item.type) }}
            />
            <View style={styles.resultInfo}>
              <Title style={styles.resultTitle}>{item.title}</Title>
              <Paragraph style={styles.resultSubtitle}>{item.subtitle}</Paragraph>
              {item.description && (
                <Paragraph style={styles.resultDescription} numberOfLines={2}>
                  {item.description}
                </Paragraph>
              )}
            </View>
            <IconButton
              icon={getResultIcon(item.type)}
              size={20}
              iconColor={getResultColor(item.type)}
            />
          </View>
          
          {item.metadata && (
            <View style={styles.resultMetadata}>
              {item.metadata.tags && (
                <View style={styles.tagsContainer}>
                  {item.metadata.tags.slice(0, 3).map((tag: string, index: number) => (
                    <Chip key={index} style={styles.tag} textStyle={styles.tagText}>
                      {tag}
                    </Chip>
                  ))}
                </View>
              )}
              {item.metadata.nomadScore && (
                <Chip icon="star" style={styles.scoreChip}>
                  {item.metadata.nomadScore.toFixed(1)}
                </Chip>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  // Render filter chips
  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <Text style={styles.filtersTitle}>Search in:</Text>
      <View style={styles.filtersRow}>
        {(['user', 'post', 'city', 'meetup'] as const).map(type => (
          <Chip
            key={type}
            selected={filters.types?.includes(type)}
            onPress={() => toggleFilter(type)}
            style={styles.filterChip}
            textStyle={styles.filterChipText}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}s
          </Chip>
        ))}
      </View>
    </View>
  );

  return (
    <ResponsiveContainer>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Search Header */}
        <Surface style={styles.searchHeader} elevation={2}>
          <Searchbar
            placeholder="Search users, posts, cities, meetups..."
            onChangeText={handleSearchChange}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={colors.primary}
            inputStyle={styles.searchInput}
          />
        </Surface>

        {/* Filters */}
        {renderFilters()}

        {/* Content */}
        <View style={styles.content}>
          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Suggestions:</Text>
              <FlatList
                data={suggestions}
                renderItem={renderSuggestion}
                keyExtractor={(item) => item}
                style={styles.suggestionsList}
              />
            </View>
          )}

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          )}

          {!loading && results.length > 0 && (
            <FlatList
              data={results}
              renderItem={renderResult}
              keyExtractor={(item) => `${item.type}-${item.id}`}
              style={styles.resultsList}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}

          {!loading && searchQuery.length >= 2 && results.length === 0 && (
            <View style={styles.emptyContainer}>
              <IconButton icon="magnify" size={48} iconColor={colors.gray} />
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptyText}>
                Try different keywords or check your search filters
              </Text>
            </View>
          )}

          {searchQuery.length === 0 && (
            <View style={styles.welcomeContainer}>
              <IconButton icon="magnify" size={64} iconColor={colors.primary} />
              <Text style={styles.welcomeTitle}>Search NomadNow</Text>
              <Text style={styles.welcomeText}>
                Find users, posts, cities, and meetups
              </Text>
            </View>
          )}
        </View>

        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onDismiss={hideToast}
        />
      </KeyboardAvoidingView>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchHeader: {
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  searchBar: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    elevation: 2,
    shadowColor: colors.gray800,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  searchInput: {
    fontSize: 16,
  },
  filtersContainer: {
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    marginRight: spacing.sm,
  },
  filterChipText: {
    fontSize: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  suggestionsContainer: {
    marginBottom: spacing.md,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  suggestionText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
  },
  resultsList: {
    flex: 1,
  },
  resultCard: {
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  resultContent: {
    padding: spacing.md,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  resultInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  resultSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  resultDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  resultMetadata: {
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.primaryLight,
  },
  tagText: {
    fontSize: 11,
    color: colors.primary,
  },
  scoreChip: {
    backgroundColor: colors.successLight,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
  },
  welcomeText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
