import React, { useEffect, useState } from 'react';
import { fetchFlightDeals } from '../scripts/apiService';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

type Deal = {
  id: string;
  origin_airport: string;
  origin_airport_code: string;
  destination_airport: string;
  destination_airport_code: string;
  outbound_date: string;
  outbound_departure_time: string;
  outbound_arrival_time: string;
  outbound_price: string;
  outbound_airline: string;
  inbound_date: string;
  inbound_departure_time: string;
  inbound_arrival_time: string;
  inbound_price: string;
  inbound_airline: string;
  total_price: number;
  isFavorite: boolean;
};

const HomeScreen: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [airlines, setAirlines] = useState<string[]>([]); // Airline options
  const [filters, setFilters] = useState({
    airline: '',
    outboundDate: '',
    inboundDate: '',
    currentPage: 1,
    pageSize: 10,
    sortColumn: 'total_price',
    sortOrder: 'asc',
  });

  // Fetch airline options
  useEffect(() => {
    const loadAirlines = async () => {
      try {
        // Simulated API call to fetch airlines
        const airlinesFromDB = ['Ryanair', 'Wizzair'];
        setAirlines(airlinesFromDB);
      } catch (error) {
        console.error('Error fetching airlines:', error);
      }
    };

    loadAirlines();
  }, []);

  // Fetch flight deals whenever filters change
  useEffect(() => {
    const loadDeals = async () => {
      setLoading(true);
      try {
        const fetchedDeals = await fetchFlightDeals(filters);
        setDeals(fetchedDeals || []);
        setError(null);
      } catch (error) {
        console.error('Error loading deals:', error);
        setError('Failed to load flight deals');
      } finally {
        setLoading(false);
      }
    };

    loadDeals();
  }, [filters]);

  // Handle changes in filters
  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Render a single deal item
  const renderDealItem = ({ item }: { item: Deal }) => (
    <View style={styles.dealCard}>
      <View style={styles.dealHeader}>
        <Text style={styles.dealPrice}>€{item.total_price.toFixed(2)}</Text>
        <TouchableOpacity onPress={() => handleFavoriteToggle(item.id)}>
          <FontAwesome
            name={item.isFavorite ? 'star' : 'star-o'}
            size={24}
            color={item.isFavorite ? '#FFD700' : '#333'}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.dealText}>
        From {item.origin_airport} ({item.origin_airport_code}) to{' '}
        {item.destination_airport} ({item.destination_airport_code})
      </Text>
      <Text style={styles.dealText}>
        Outbound: {item.outbound_date}, {item.outbound_departure_time}
      </Text>
      <Text style={styles.dealText}>
        Inbound: {item.inbound_date}, {item.inbound_departure_time}
      </Text>
    </View>
  );

  const handleFavoriteToggle = (dealId: string) => {
    setDeals((prevDeals) =>
      prevDeals.map((deal) =>
        deal.id === dealId ? { ...deal, isFavorite: !deal.isFavorite } : deal
      )
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Flight Deals</Text>

      {/* Filter Section */}
      <View style={styles.filterSection}>
        <Picker
          selectedValue={filters.airline}
          onValueChange={(value) => handleFilterChange('airline', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select Airline" value="" />
          {airlines.map((airline) => (
            <Picker.Item key={airline} label={airline} value={airline} />
          ))}
        </Picker>
      </View>

      {/* Deals List */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={deals}
          keyExtractor={(item) => item.id}
          renderItem={renderDealItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  picker: {
    height: 50,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  dealCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dealPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  dealText: {
    fontSize: 16,
    color: '#555',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default HomeScreen;
