import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Searchbar, Surface } from 'react-native-paper';
import { useResponsive } from '../../utils/responsive';
import { shadowPresets } from '../../utils/platformStyles';
import { colors, spacing, borderRadius } from '../../utils/responsive';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  style?: any;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  onSearch,
  onClear,
  style,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { isPhone } = useResponsive();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleClear = () => {
    setSearchQuery('');
    onClear?.();
  };

  return (
    <Surface style={[styles.container, style, ...shadowPresets.small]}>
      <Searchbar
        placeholder={placeholder}
        onChangeText={handleSearch}
        value={searchQuery}
        onClearIconPress={handleClear}
        style={styles.searchbar}
        iconColor={colors.gray500}
        inputStyle={styles.input}
        placeholderTextColor={colors.gray400}
      />
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: spacing.base,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  searchbar: {
    backgroundColor: colors.white,
    elevation: 0,
    borderWidth: 0,
  },
  input: {
    fontSize: 16,
    color: colors.textPrimary,
  },
});

export default SearchBar;
