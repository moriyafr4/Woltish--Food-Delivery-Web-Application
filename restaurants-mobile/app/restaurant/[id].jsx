import { StyleSheet, View, Text, Image, FlatList, TouchableOpacity, Platform, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useCart } from '@/components/CartContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { SymbolView } from 'expo-symbols';

import { API_URL } from '@/constants/Config';

export default function RestaurantMenuScreen() {
  const { id } = useLocalSearchParams();
  const { user, token } = useAuth() || {};
  const { addToCart } = useCart() || {};
  
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const response = await fetch(`${API_URL}/api/restaurants/${id}`, {
          method: 'GET',
          headers: headers 
        });

        if (!response.ok) throw new Error('Failed to fetch restaurant data');

        const data = await response.json();
        setRestaurant(data);
      } catch (error) {
        console.error("Error loading restaurant:", error);
        Alert.alert('Error', 'Failed to load restaurant details. Check your connection.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRestaurantData();
  }, [id, token]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
        <Text style={{ marginTop: 10, color: Colors[colorScheme ?? 'light'].text }}>Loading menu...</Text>
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={[styles.center, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <Stack.Screen options={{ title: 'Not Found' }} />
        <Text style={{ color: Colors[colorScheme ?? 'light'].text }}>Restaurant not found.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {restaurant.imageUrl ? (
        <Image source={{ uri: restaurant.imageUrl.startsWith('http') ? restaurant.imageUrl : `${API_URL}${restaurant.imageUrl.startsWith('/') ? '' : '/'}${restaurant.imageUrl}` }} style={styles.bannerImage} />
      ) : (
        <View style={[styles.bannerPlaceholder, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]} />
      )}
      
      <View style={[styles.infoCard, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground, borderColor: Colors[colorScheme ?? 'light'].border }]}>
        <Text style={[styles.restaurantName, { color: Colors[colorScheme ?? 'light'].text }]}>{restaurant.name}</Text>
        {restaurant.category && <Text style={[styles.category, { color: Colors[colorScheme ?? 'light'].secondary }]}>{restaurant.category}</Text>}
        <Text style={[styles.description, { color: Colors[colorScheme ?? 'light'].text }]}>{restaurant.description}</Text>
        
        <View style={styles.metaContainer}>
          {restaurant.address && <Text style={[styles.metaText, { color: Colors[colorScheme ?? 'light'].text }]}>📍 {restaurant.address}</Text>}
          {restaurant.phone && <Text style={[styles.metaText, { color: Colors[colorScheme ?? 'light'].text }]}>📞 {restaurant.phone}</Text>}
        </View>
      </View>
      
      <Text style={[styles.menuTitle, { color: Colors[colorScheme ?? 'light'].text }]}>Menu</Text>
      {(!restaurant.products || restaurant.products.length === 0) && (
        <Text style={{ textAlign: 'center', marginTop: 20, color: Colors[colorScheme ?? 'light'].text }}>No dishes available yet.</Text>
      )}
    </View>
  );

  const renderProduct = ({ item }) => (
    <View style={[styles.productCard, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground, borderColor: Colors[colorScheme ?? 'light'].border }]}>
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: Colors[colorScheme ?? 'light'].text }]}>{item.name}</Text>
        <Text style={[styles.productDesc, { color: Colors[colorScheme ?? 'light'].text }]} numberOfLines={2}>{item.description}</Text>
        <Text style={[styles.productPrice, { color: Colors[colorScheme ?? 'light'].primary }]}>₪{item.price}</Text>
      </View>
      
      {user?.role !== 'owner' && (
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
          onPress={() => addToCart && addToCart({ ...item, restaurantId: id, restaurantName: restaurant.name })}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <Stack.Screen options={{ title: restaurant.name || 'Restaurant' }} />
      <FlatList
        data={restaurant.products || []}
        keyExtractor={(item) => item.id || item._id}
        ListHeaderComponent={renderHeader()}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 20,
  },
  bannerImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  bannerPlaceholder: {
    width: '100%',
    height: 200,
  },
  infoCard: {
    margin: 16,
    marginTop: -40,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  restaurantName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  category: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 22,
  },
  metaContainer: {
    gap: 8,
  },
  metaText: {
    fontSize: 14,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  productCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  productInfo: {
    flex: 1,
    paddingRight: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productDesc: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
  },
});
