import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  Searchbar,
  Chip,
  Surface,
} from 'react-native-paper';
import { shadowPresets } from '../../utils/platformStyles';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onFilterChange?: (filters: string[]) => void;
  filters?: string[];
  availableFilters?: string[];
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search nomads, meetups, posts...",
  onSearch,
  onFilterChange,
  filters = [],
  availableFilters = ['Users', 'Meetups', 'Posts', 'Locations'],
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilterToggle = (filter: string) => {
    const newFilters = filters.includes(filter)
      ? filters.filter(f => f !== filter)
      : [...filters, filter];
    onFilterChange?.(newFilters);
  };

  return (
    <Surface style={styles.container}>
      <Searchbar
        placeholder={placeholder}
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchbar}
        iconColor="#6366f1"
        inputStyle={styles.searchInput}
      />
      
      {availableFilters.length > 0 && (
        <View style={styles.filtersContainer}>
          {availableFilters.map((filter) => (
            <Chip
              key={filter}
              selected={filters.includes(filter)}
              onPress={() => handleFilterToggle(filter)}
              style={[
                styles.filterChip,
                filters.includes(filter) && styles.selectedChip
              ]}
              textStyle={[
                styles.filterText,
                filters.includes(filter) && styles.selectedFilterText
              ]}
            >
              {filter}
            </Chip>
          ))}
        </View>
      )}
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#ffffff',
    ...shadowPresets.small,
  },
  searchbar: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    ...shadowPresets.small,
    marginBottom: 12,
  },
  searchInput: {
    fontSize: 16,
    color: '#1e293b',
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    borderWidth: 0,
  },
  selectedChip: {
    backgroundColor: '#6366f1',
  },
  filterText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  selectedFilterText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
