import { StyleSheet, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useCart } from '@/components/CartContext';
import { useAuth } from '@/components/AuthContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { router } from 'expo-router';

import { API_URL } from '@/constants/Config';

export default function CartScreen() {
  const { cartItems, cartTotal, addToCart, removeFromCart, clearCart } = useCart() || { cartItems: [], cartTotal: 0 };
  const { token } = useAuth() || {};
  const colorScheme = useColorScheme();

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    if (!token) {
        Alert.alert(
        'Login Required',
        'Please log in to place an order.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Log In', onPress: () => router.push('/login') }
        ]
      );
      return;
    }

    try {
      const groupedItems = cartItems.reduce((acc, item) => {
        if (!acc[item.restaurantId]) {
          acc[item.restaurantId] = { products: [], totalPrice: 0 };
        }
        acc[item.restaurantId].products.push(item);
        acc[item.restaurantId].totalPrice += item.price * item.quantity;
        return acc;
      }, {});

      const promises = Object.entries(groupedItems).map(([restaurantId, data]) => {
        const orderPayload = {
          restaurantId,
          products: data.products,
          totalPrice: data.totalPrice
        };
        
        return fetch(`${API_URL}/api/orders`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderPayload)
        }).then(response => {
          if (!response.ok) throw new Error('Failed to place order');
        });
      });

      await Promise.all(promises);

      Alert.alert('Success', 'Order placed successfully! 🍔🚚');
      clearCart && clearCart();
      router.push('/(tabs)/orders');

    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    }
  };

  const renderCartItem = ({ item }) => (
    <View style={[styles.cartItem, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground, borderColor: Colors[colorScheme ?? 'light'].border }]}>
      <View style={styles.itemInfo}>
        {item.restaurantName && <Text style={[styles.restaurantName, { color: Colors[colorScheme ?? 'light'].primary }]}>{item.restaurantName}</Text>}
        <Text style={[styles.itemName, { color: Colors[colorScheme ?? 'light'].text }]}>{item.name}</Text>
        <Text style={[styles.itemPrice, { color: Colors[colorScheme ?? 'light'].text }]}>₪{item.price} x {item.quantity}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => removeFromCart && removeFromCart(item.id || item._id)}>
          <Text style={[styles.actionText, { color: Colors[colorScheme ?? 'light'].text }]}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => addToCart && addToCart(item)}>
          <Text style={[styles.actionText, { color: Colors[colorScheme ?? 'light'].text }]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 60, marginBottom: 20 }}>🛍️</Text>
          <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].text }]}>Your cart is empty.</Text>
          <Text style={{ color: Colors[colorScheme ?? 'light'].text, opacity: 0.7, marginTop: 10 }}>Time to order some food!</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => (item.id || item._id).toString()}
            renderItem={renderCartItem}
            contentContainerStyle={styles.listContainer}
          />
          <View style={[styles.footer, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground, borderTopColor: Colors[colorScheme ?? 'light'].border }]}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: Colors[colorScheme ?? 'light'].text }]}>Total:</Text>
              <Text style={[styles.totalValue, { color: Colors[colorScheme ?? 'light'].primary }]}>₪{cartTotal.toFixed(2)}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.checkoutBtn, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutText}>Checkout 🚀</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  itemInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    opacity: 0.8,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
  },
  actionText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    elevation: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  checkoutBtn: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
