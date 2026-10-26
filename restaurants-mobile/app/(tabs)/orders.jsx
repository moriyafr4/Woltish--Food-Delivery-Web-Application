import { StyleSheet, FlatList, ActivityIndicator, Platform, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAuth } from '@/components/AuthContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect, router } from 'expo-router';

import { API_URL } from '@/constants/Config';

export default function OrdersScreen() {
  const { token, user } = useAuth() || {};
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();

  const fetchOrders = async () => {
    if (!token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      const rawOrders = Array.isArray(data) ? data : data.orders ?? [];
      
      const groupedOrdersMap = {};
      rawOrders.forEach(order => {
        const key = order.restaurantId || order._id; // fallback if missing
        if (!groupedOrdersMap[key]) {
          groupedOrdersMap[key] = {
            ...order,
            products: order.products ? JSON.parse(JSON.stringify(order.products)) : [],
            totalPrice: Number(order.totalPrice || order.total || 0)
          };
        } else {
          const acc = groupedOrdersMap[key];
          acc.totalPrice += Number(order.totalPrice || order.total || 0);
          
          if (new Date(order.createdAt) > new Date(acc.createdAt)) {
            acc.createdAt = order.createdAt;
            acc.status = order.status;
          }

          if (order.products) {
            order.products.forEach(newP => {
              const exPIndex = acc.products.findIndex(p => (p.id || p._id) === (newP.id || newP._id));
              if (exPIndex >= 0) {
                acc.products[exPIndex].quantity = (acc.products[exPIndex].quantity || 1) + (newP.quantity || 1);
              } else {
                acc.products.push({ ...newP });
              }
            });
          }
        }
      });
      
      const groupedOrders = Object.values(groupedOrdersMap).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(groupedOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      Alert.alert('Error', 'Failed to load your orders. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [token])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  if (!token) {
    return (
      <View style={[styles.center, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <Text style={{ fontSize: 40, marginBottom: 20 }}>🔒</Text>
        <Text style={[styles.text, { color: Colors[colorScheme ?? 'light'].text }]}>Please log in to view your orders.</Text>
        <TouchableOpacity 
          style={[styles.loginButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderOrder = ({ item }) => (
    <View style={[styles.orderCard, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground, borderColor: Colors[colorScheme ?? 'light'].border }]}>
      <View style={styles.orderHeader}>
        <Text style={[styles.restaurantName, { color: Colors[colorScheme ?? 'light'].text }]}>{item.restaurantName || 'Restaurant'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'delivered' ? Colors[colorScheme ?? 'light'].success : Colors[colorScheme ?? 'light'].primary }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <View style={{ marginBottom: 12, marginTop: -4 }}>
        {item.products && item.products.map((p, idx) => (
          <Text key={idx} style={{ fontSize: 13, color: Colors[colorScheme ?? 'light'].text, opacity: 0.7, marginBottom: 2 }}>
            • {p.name} x{p.quantity || 1}  (₪{(p.price * (p.quantity || 1)).toFixed(2)})
          </Text>
        ))}
      </View>
      <Text style={[styles.date, { color: Colors[colorScheme ?? 'light'].text }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      <Text style={[styles.total, { color: Colors[colorScheme ?? 'light'].text }]}>Total: ₪{item.totalPrice ?? item.total ?? '—'}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
          <Text style={{ marginTop: 10, color: Colors[colorScheme ?? 'light'].text }}>Loading orders...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => (item.id || item._id).toString()}
          renderItem={renderOrder}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors[colorScheme ?? 'light'].primary} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ fontSize: 50, marginBottom: 20 }}>🛍️</Text>
              <Text style={[styles.text, { color: Colors[colorScheme ?? 'light'].text }]}>No orders yet. Time to eat!</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  loginButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  date: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 18,
  },
});
