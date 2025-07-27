import React, { useState } from 'react';
import { View, Modal, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Button, Searchbar, List } from 'react-native-paper';

interface Country {
  code: string;
  name: string;
  flag: string;
}

interface CountryPickerProps {
  visible: boolean;
  onDismiss: () => void;
  onSelect: (country: Country) => void;
  selectedCountry?: Country;
}

// Common countries for digital nomads
const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'PA', name: 'Panama', flag: '🇵🇦' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'GY', name: 'Guyana', flag: '🇬🇾' },
  { code: 'SR', name: 'Suriname', flag: '🇸🇷' },
  { code: 'GF', name: 'French Guiana', flag: '🇬🇫' },
  { code: 'FK', name: 'Falkland Islands', flag: '🇫🇰' },
  { code: 'GS', name: 'South Georgia', flag: '🇬🇸' },
  { code: 'BV', name: 'Bouvet Island', flag: '🇧🇻' },
  { code: 'HM', name: 'Heard Island', flag: '🇭🇲' },
  { code: 'TF', name: 'French Southern Territories', flag: '🇹🇫' },
  { code: 'AQ', name: 'Antarctica', flag: '🇦🇶' },
  { code: 'IO', name: 'British Indian Ocean Territory', flag: '🇮🇴' },
  { code: 'CX', name: 'Christmas Island', flag: '🇨🇽' },
  { code: 'CC', name: 'Cocos Islands', flag: '🇨🇨' },
  { code: 'NF', name: 'Norfolk Island', flag: '🇳🇫' },
  { code: 'NC', name: 'New Caledonia', flag: '🇳🇨' },
  { code: 'PF', name: 'French Polynesia', flag: '🇵🇫' },
  { code: 'YT', name: 'Mayotte', flag: '🇾🇹' },
  { code: 'RE', name: 'Réunion', flag: '🇷🇪' },
  { code: 'BL', name: 'Saint Barthélemy', flag: '🇧🇱' },
  { code: 'MF', name: 'Saint Martin', flag: '🇲🇫' },
  { code: 'PM', name: 'Saint Pierre and Miquelon', flag: '🇵🇲' },
  { code: 'WF', name: 'Wallis and Futuna', flag: '🇼🇫' },
  { code: 'AI', name: 'Anguilla', flag: '🇦🇮' },
  { code: 'BM', name: 'Bermuda', flag: '🇧🇲' },
  { code: 'IO', name: 'British Indian Ocean Territory', flag: '🇮🇴' },
  { code: 'VG', name: 'British Virgin Islands', flag: '🇻🇬' },
  { code: 'KY', name: 'Cayman Islands', flag: '🇰🇾' },
  { code: 'FK', name: 'Falkland Islands', flag: '🇫🇰' },
  { code: 'GI', name: 'Gibraltar', flag: '🇬🇮' },
  { code: 'MS', name: 'Montserrat', flag: '🇲🇸' },
  { code: 'PN', name: 'Pitcairn Islands', flag: '🇵🇳' },
  { code: 'SH', name: 'Saint Helena', flag: '🇸🇭' },
  { code: 'TC', name: 'Turks and Caicos Islands', flag: '🇹🇨' },
  { code: 'VI', name: 'U.S. Virgin Islands', flag: '🇻🇮' },
  { code: 'AS', name: 'American Samoa', flag: '🇦🇸' },
  { code: 'CK', name: 'Cook Islands', flag: '🇨🇰' },
  { code: 'FJ', name: 'Fiji', flag: '🇫🇯' },
  { code: 'GU', name: 'Guam', flag: '🇬🇺' },
  { code: 'KI', name: 'Kiribati', flag: '🇰🇮' },
  { code: 'MH', name: 'Marshall Islands', flag: '🇲🇭' },
  { code: 'FM', name: 'Micronesia', flag: '🇫🇲' },
  { code: 'NR', name: 'Nauru', flag: '🇳🇷' },
  { code: 'NU', name: 'Niue', flag: '🇳🇺' },
  { code: 'NF', name: 'Norfolk Island', flag: '🇳🇫' },
  { code: 'MP', name: 'Northern Mariana Islands', flag: '🇲🇵' },
  { code: 'PW', name: 'Palau', flag: '🇵🇼' },
  { code: 'PG', name: 'Papua New Guinea', flag: '🇵🇬' },
  { code: 'PN', name: 'Pitcairn Islands', flag: '🇵🇳' },
  { code: 'WS', name: 'Samoa', flag: '🇼🇸' },
  { code: 'SB', name: 'Solomon Islands', flag: '🇸🇧' },
  { code: 'TK', name: 'Tokelau', flag: '🇹🇰' },
  { code: 'TO', name: 'Tonga', flag: '🇹🇴' },
  { code: 'TV', name: 'Tuvalu', flag: '🇹🇻' },
  { code: 'VU', name: 'Vanuatu', flag: '🇻🇺' },
  { code: 'WF', name: 'Wallis and Futuna', flag: '🇼🇫' },
];

export const CountryPicker: React.FC<CountryPickerProps> = ({
  visible,
  onDismiss,
  onSelect,
  selectedCountry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCountries, setFilteredCountries] = useState(COUNTRIES);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredCountries(COUNTRIES);
    } else {
      const filtered = COUNTRIES.filter(
        country =>
          country.name.toLowerCase().includes(query.toLowerCase()) ||
          country.code.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCountries(filtered);
    }
  };

  const handleSelect = (country: Country) => {
    onSelect(country);
    onDismiss();
    setSearchQuery('');
    setFilteredCountries(COUNTRIES);
  };

  const renderCountry = ({ item }: { item: Country }) => (
    <TouchableOpacity
      style={[
        styles.countryItem,
        selectedCountry?.code === item.code && styles.selectedCountry,
      ]}
      onPress={() => handleSelect(item)}
    >
      <Text style={styles.flag}>{item.flag}</Text>
      <View style={styles.countryInfo}>
        <Text style={styles.countryName}>{item.name}</Text>
        <Text style={styles.countryCode}>{item.code}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} onDismiss={onDismiss} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Country</Text>
          <Button onPress={onDismiss}>Cancel</Button>
        </View>
        
        <Searchbar
          placeholder="Search countries..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <FlatList
          data={filteredCountries}
          renderItem={renderCountry}
          keyExtractor={item => item.code}
          style={styles.list}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchbar: {
    margin: 16,
  },
  list: {
    flex: 1,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedCountry: {
    backgroundColor: '#e3f2fd',
  },
  flag: {
    fontSize: 24,
    marginRight: 16,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  countryCode: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default CountryPicker; 