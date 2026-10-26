import { StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, Image, Platform } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAuth } from '@/components/AuthContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useState, useCallback } from 'react';
import { useFocusEffect, router } from 'expo-router';
import { API_URL } from '@/constants/Config';

export default function MyRestaurantsScreen() {
  const { token, user } = useAuth() || {};
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();

  const fetchMyRestaurants = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/restaurants/my`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch restaurants');
      const data = await response.json();
      setRestaurants(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load your restaurants.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyRestaurants();
    }, [token])
  );

  const handleDelete = (id) => {
    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to delete this restaurant?")) {
        deleteRestaurantApi(id);
      }
    } else {
      Alert.alert(
        "Delete Restaurant",
        "Are you sure you want to delete this restaurant?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Delete", 
            style: "destructive",
            onPress: () => deleteRestaurantApi(id)
          }
        ]
      );
    }
  };

  const deleteRestaurantApi = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/restaurants/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete');
      setRestaurants(prev => prev.filter(r => (r.id || r._id) !== id));
    } catch (err) {
      Alert.alert('Error', 'Failed to delete restaurant.');
    }
  };

  if (!token || user?.role !== 'owner') {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 18 }}>Unauthorized access.</Text>
      </View>
    );
  }

  const renderRestaurant = ({ item }) => (
    <View style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground, borderColor: Colors[colorScheme ?? 'light'].border }]}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl.startsWith('http') ? item.imageUrl : `${API_URL}${item.imageUrl.startsWith('/') ? '' : '/'}${item.imageUrl}` }} style={styles.image} />
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: Colors[colorScheme ?? 'light'].border }]} />
      )}
      <View style={styles.cardBody}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btn, styles.viewBtn]} onPress={() => router.push(`/restaurant/${item.id || item._id}`)}>
            <Text style={styles.btnText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.editBtn]} onPress={() => router.push(`/manage-restaurant/${item.id || item._id}`)}>
            <Text style={styles.btnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.deleteBtn]} onPress={() => handleDelete(item.id || item._id)}>
            <Text style={styles.btnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
        </View>
      ) : restaurants.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 50, marginBottom: 20 }}>🍽️</Text>
          <Text style={{ fontSize: 18, color: Colors[colorScheme ?? 'light'].text }}>No restaurants yet</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/add-restaurant')}>
            <Text style={styles.addBtnText}>Add Restaurant</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => (item.id || item._id).toString()}
          renderItem={renderRestaurant}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContainer: { padding: 16 },
  card: {
    marginBottom: 16, borderRadius: 12, borderWidth: 1, overflow: 'hidden', elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6,
  },
  image: { width: '100%', height: 150, resizeMode: 'cover' },
  imagePlaceholder: { width: '100%', height: 150 },
  cardBody: { padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  description: { fontSize: 14, opacity: 0.8, marginBottom: 16 },
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginHorizontal: 4 },
  viewBtn: { backgroundColor: '#4a90e2' },
  editBtn: { backgroundColor: '#f39c12' },
  deleteBtn: { backgroundColor: '#e74c3c' },
  btnText: { color: 'white', fontWeight: 'bold' },
  addBtn: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#4a90e2', borderRadius: 8 },
  addBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
