import { Link, Tabs, Redirect } from 'expo-router';
import { Platform, Pressable, Text } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useCart } from '@/components/CartContext';
import { useAuth } from '@/components/AuthContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { cartItems } = useCart() || { cartItems: [] };
  const { user, isLoading } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        headerShown: useClientOnlyValue(false, true),
        tabBarStyle: {
          backgroundColor: Colors[colorScheme].background,
          borderTopWidth: 1,
          borderTopColor: Colors[colorScheme].border,
        },
        headerStyle: {
          backgroundColor: Colors[colorScheme].background,
        },
        headerTitleStyle: {
          color: Colors[colorScheme].text,
          fontWeight: 'bold',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Restaurants',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, opacity: color === Colors[colorScheme].tint ? 1 : 0.5 }}>🏠</Text>
          ),
          headerRight: () => (
            user ? (
              <Link href="/modal" asChild>
                <Pressable style={{ marginRight: 15 }}>
                  {({ pressed }) => (
                    <Text style={{ fontSize: 24, opacity: pressed ? 0.5 : 1 }}>👤</Text>
                  )}
                </Pressable>
              </Link>
            ) : (
              <View style={{ flexDirection: 'row', gap: 10, marginRight: 15 }}>
                <Link href="/login" asChild>
                  <Pressable>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: Colors[colorScheme].tint }}>Log In</Text>
                  </Pressable>
                </Link>
                <Link href="/register" asChild>
                  <Pressable>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: Colors[colorScheme].tint }}>Sign Up</Text>
                  </Pressable>
                </Link>
              </View>
            )
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          href: user?.role === 'owner' ? null : '/cart',
          title: 'Cart',
          tabBarBadge: cartItems?.length > 0 ? cartItems.length : undefined,
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, opacity: color === Colors[colorScheme].tint ? 1 : 0.5 }}>🛒</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          href: user?.role === 'owner' ? null : '/orders',
          title: 'Orders',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, opacity: color === Colors[colorScheme].tint ? 1 : 0.5 }}>🧾</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="my-restaurants"
        options={{
          href: user?.role === 'owner' ? '/my-restaurants' : null,
          title: 'My Restaurants',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, opacity: color === Colors[colorScheme].tint ? 1 : 0.5 }}>🏪</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="add-restaurant"
        options={{
          href: user?.role === 'owner' ? '/add-restaurant' : null,
          title: 'Add Restaurant',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, opacity: color === Colors[colorScheme].tint ? 1 : 0.5 }}>➕</Text>
          ),
        }}
      />
    </Tabs>
  );
}
