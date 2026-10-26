import { StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl, Platform, Alert, ScrollView, TextInput, SafeAreaView, Modal } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useEffect, useState, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '@/components/AuthContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

import { API_URL } from '@/constants/Config';

export default function RestaurantsScreen() {
  const { user, token, logout } = useAuth() || {};

  const handleLogout = async () => {
    if (logout) {
      await logout();
      router.replace('/login');
    }
  };
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const colorScheme = useColorScheme();

  const fetchRestaurants = async () => {
    try {
      const response = await fetch(`${API_URL}/api/restaurants`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      const fetchedRestaurants = Array.isArray(data) ? data : data.restaurants ?? [];
      setRestaurants(fetchedRestaurants);
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
      Alert.alert('Error', 'Failed to fetch restaurants. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRestaurants();
    }, [token])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchRestaurants();
  };

  const closeToYouItems = user?.lat && user?.lng 
    ? restaurants.filter(r => String(r.lat) === String(user.lat) && String(r.lng) === String(user.lng))
    : [];

  const renderRestaurantCard = ({ item }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground, borderColor: Colors[colorScheme ?? 'light'].border }]}
      onPress={() => router.push(`/restaurant/${item.id || item._id}`)}
      activeOpacity={0.8}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl.startsWith('http') ? item.imageUrl : `${API_URL}${item.imageUrl.startsWith('/') ? '' : '/'}${item.imageUrl}` }} style={styles.image} />
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: Colors[colorScheme ?? 'light'].border }]}>
          <Text style={styles.placeholderEmoji}>🍔</Text>
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  const displayedRestaurants = restaurants.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors[colorScheme ?? 'light'].primary} />}
    >
      {/* Sleek Top Navbar */}
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.navbar, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
          {/* Left: Logo */}
          <View style={styles.navbarLeft}>
            <Text style={styles.logoHeart}>🩵</Text>
            <Text style={[styles.logoText, { color: Colors[colorScheme ?? 'light'].text }]}>Woltish</Text>
          </View>
          
      {/* Right: User Avatar Pill & Logout (logged in) OR Login/Register buttons (guest) */}
        <View style={styles.navbarRight}>
          {user ? (
            <>
              <View style={[styles.userPill, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground, borderColor: Colors[colorScheme ?? 'light'].border }]}>
                {user?.profileImage ? (
                  <Image source={{ uri: user.profileImage.startsWith('http') ? user.profileImage : `${API_URL}${user.profileImage.startsWith('/') ? '' : '/'}${user.profileImage}` }} style={styles.pillAvatar} />
                ) : (
                  <View style={[styles.pillAvatarPlaceholder, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                    <Text style={styles.pillInitials}>{(user?.fullName || user?.username || 'U')[0].toUpperCase()}</Text>
                  </View>
                )}
                <Text style={[styles.pillName, { color: Colors[colorScheme ?? 'light'].text }]} numberOfLines={1}>
                  {user?.fullName || user?.username} ({user.role === 'owner' ? 'Owner' : 'Customer'})
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <Text style={styles.logoutButtonText}>Log Out</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.loginNavButton}
                onPress={() => router.push('/login')}
                activeOpacity={0.7}
              >
                <Text style={styles.loginNavButtonText}>Log In</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.registerNavButton}
                onPress={() => router.push('/register')}
                activeOpacity={0.7}
              >
                <Text style={styles.registerNavButtonText}>Sign Up</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        </View>

        {/* Search Bar - Sleek input below navbar */}
        <View style={styles.searchWrapper}>
          <View style={[styles.searchBar, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground, borderColor: Colors[colorScheme ?? 'light'].border }]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[styles.searchInput, { color: Colors[colorScheme ?? 'light'].text }]}
              placeholder="Search restaurants or food..."
              placeholderTextColor={colorScheme === 'dark' ? '#888' : '#aaa'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </SafeAreaView>


      {loading && !refreshing ? (
        <View style={styles.center}>
          <Text style={{ marginTop: 40, color: Colors[colorScheme ?? 'light'].text }}>Loading tastiest options...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {/* All Restaurants Carousel */}
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>Restaurants</Text>
          {displayedRestaurants.length === 0 ? (
            <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].text }]}>No restaurants found.</Text>
          ) : (
            <FlatList
              data={displayedRestaurants}
              keyExtractor={(item) => item.id || item._id}
              renderItem={renderRestaurantCard}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContainer}
            />
          )}

          {/* Close to You Carousel */}
          {user && user.role !== 'owner' && user.lat && user.lng && (
            <View style={styles.sectionSpacing}>
              <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>Close to You</Text>
              {closeToYouItems.length === 0 ? (
                <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].text }]}>No exact matches for your coordinates yet...</Text>
              ) : (
                <FlatList
                  data={closeToYouItems}
                  keyExtractor={(item) => item.id || item._id}
                  renderItem={renderRestaurantCard}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.carouselContainer}
                />
              )}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  navbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoHeart: {
    fontSize: 22,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  userPill: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    paddingRight: 12,
    borderRadius: 30,
    borderWidth: 1,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pillAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  pillAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillInitials: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pillName: {
    fontSize: 14,
    fontWeight: '600',
    maxWidth: 140,
  },
  searchWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
    opacity: 0.7,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },

  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sectionSpacing: {
    marginTop: 30,
  },
  carouselContainer: {
    paddingHorizontal: 12,
  },
  card: {
    width: 250,
    marginHorizontal: 6,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 40,
  },
  cardContent: {
    padding: 12,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  emptyText: {
    fontSize: 14,
    marginHorizontal: 16,
    opacity: 0.7,
  },
  loginNavButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  loginNavButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  registerNavButton: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  registerNavButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
