import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, FlatList, Platform } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useAuth } from '@/components/AuthContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { API_URL } from '@/constants/Config';

export default function ManageRestaurantScreen() {
  const { id } = useLocalSearchParams();
  const { token, user } = useAuth() || {};
  const colorScheme = useColorScheme();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  // New product state
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDescription, setProductDescription] = useState('');

  // Edit state
  const [editingProductId, setEditingProductId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', price: '' });

  const fetchRestaurant = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/restaurants/${id}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setRestaurant(data);
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      Alert.alert('Error', 'Failed to load restaurant details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRestaurant();
  }, [fetchRestaurant]);

  if (!token || user?.role !== 'owner') {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 18 }}>Unauthorized access.</Text>
      </View>
    );
  }

  const [errorMsg, setErrorMsg] = useState('');

  const handleAddProduct = async () => {
    setErrorMsg('');
    if (!productName.trim()) {
      setErrorMsg('Product name is required.');
      return;
    }
    if (!productPrice || isNaN(Number(productPrice))) {
      setErrorMsg('Price must be a valid number.');
      return;
    }

    const newProduct = {
      name: productName,
      price: Number(productPrice),
      description: productDescription
    };

    try {
      const res = await fetch(`${API_URL}/api/restaurants/${id}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newProduct)
      });

      if (res.ok) {
        await fetchRestaurant();
        setProductName('');
        setProductPrice('');
        setProductDescription('');
      } else {
        setErrorMsg('Failed to add product.');
      }
    } catch (error) {
      console.error("Error adding product:", error);
      setErrorMsg('An error occurred while adding the product.');
    }
  };

  const startEditing = (product) => {
    setEditErrorMsg('');
    setEditingProductId(product._id || product.id);
    setEditForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price)
    });
  };

  const handleDeleteProduct = async (productId) => {
    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to delete this product?")) {
        deleteProductApi(productId);
      }
    } else {
      Alert.alert(
        "Delete Product",
        "Are you sure you want to delete this product?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Delete", 
            style: "destructive",
            onPress: () => deleteProductApi(productId)
          }
        ]
      );
    }
  };

  const deleteProductApi = async (productId) => {
    try {
      const res = await fetch(`${API_URL}/api/restaurants/${id}/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        await fetchRestaurant();
      } else {
        Alert.alert('Error', 'Failed to delete product.');
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const [editErrorMsg, setEditErrorMsg] = useState('');

  const handleSaveEdit = async (productId) => {
    setEditErrorMsg('');
    if (!editForm.name.trim()) {
      setEditErrorMsg('Product name is required.');
      return;
    }
    if (!editForm.price || isNaN(Number(editForm.price))) {
      setEditErrorMsg('Price must be a valid number.');
      return;
    }

    try {
      const payload = {
        name: editForm.name,
        description: editForm.description,
        price: Number(editForm.price)
      };

      const res = await fetch(`${API_URL}/api/restaurants/${id}/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchRestaurant();
        setEditingProductId(null);
      } else {
        Alert.alert('Error', 'Failed to update product');
      }
    } catch (error) {
      console.error("Error updating product:", error);
      Alert.alert('Error', 'An error occurred while updating.');
    }
  };

  const handleCompleteSetup = async () => {
    if (productName.trim() || productPrice) {
      if (!productName.trim() || !productPrice || isNaN(Number(productPrice))) {
        Alert.alert('Unsaved Data', 'You have unsaved product data. Add it or clear the fields.');
        return;
      }
      await handleAddProduct();
    }
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: restaurant ? restaurant.name : 'Loading...', headerBackTitle: 'Back' }} />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
        </View>
      ) : !restaurant ? (
        <View style={styles.center}>
          <Text>Restaurant not found.</Text>
        </View>
      ) : (
        <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
          <View style={styles.content}>
        <Text style={styles.headerTitle}>Manage Menu for {restaurant.name}</Text>

        <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground, borderColor: Colors[colorScheme ?? 'light'].border }]}>
          <Text style={styles.sectionTitle}>Add New Product</Text>
          <TextInput style={[styles.input, { color: Colors[colorScheme ?? 'light'].text, borderColor: Colors[colorScheme ?? 'light'].border }]}
            placeholder="Product Name" placeholderTextColor="#888" value={productName} onChangeText={setProductName} />
          <TextInput style={[styles.input, { color: Colors[colorScheme ?? 'light'].text, borderColor: Colors[colorScheme ?? 'light'].border }]}
            placeholder="Description (Optional)" placeholderTextColor="#888" value={productDescription} onChangeText={setProductDescription} />
          <TextInput style={[styles.input, { color: Colors[colorScheme ?? 'light'].text, borderColor: Colors[colorScheme ?? 'light'].border }]}
            placeholder="Price" placeholderTextColor="#888" value={productPrice} onChangeText={setProductPrice} keyboardType="numeric" />
          {errorMsg ? <Text style={{color: '#e74c3c', marginBottom: 10, textAlign: 'center'}}>{errorMsg}</Text> : null}
          <TouchableOpacity style={[styles.btn, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]} onPress={handleAddProduct}>
            <Text style={styles.btnText}>Add Product</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.listTitle}>Current Products</Text>
        {restaurant.products && restaurant.products.length > 0 ? (
          restaurant.products.map(p => {
            const currentId = p._id || p.id;
            const isEditing = editingProductId === currentId;

            return (
              <View key={currentId} style={[styles.productCard, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground, borderColor: Colors[colorScheme ?? 'light'].border }]}>
                {isEditing ? (
                  <View>
                    <TextInput style={[styles.input, { color: Colors[colorScheme ?? 'light'].text, borderColor: Colors[colorScheme ?? 'light'].border }]} value={editForm.name} onChangeText={(t) => setEditForm({...editForm, name: t})} placeholder="Name" />
                    <TextInput style={[styles.input, { color: Colors[colorScheme ?? 'light'].text, borderColor: Colors[colorScheme ?? 'light'].border }]} value={editForm.description} onChangeText={(t) => setEditForm({...editForm, description: t})} placeholder="Description" />
                    <TextInput style={[styles.input, { color: Colors[colorScheme ?? 'light'].text, borderColor: Colors[colorScheme ?? 'light'].border }]} value={editForm.price} onChangeText={(t) => setEditForm({...editForm, price: t})} placeholder="Price" keyboardType="numeric" />
                    {editErrorMsg ? <Text style={{color: '#e74c3c', marginBottom: 10, textAlign: 'center'}}>{editErrorMsg}</Text> : null}
                    <View style={styles.actionRow}>
                      <TouchableOpacity style={[styles.actionBtn, styles.saveBtn]} onPress={() => handleSaveEdit(currentId)}>
                        <Text style={styles.btnText}>Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={() => setEditingProductId(null)}>
                        <Text style={styles.btnText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View>
                    <View style={styles.productInfoRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.productName}>{p.name}</Text>
                        {p.description ? <Text style={styles.productDesc}>{p.description}</Text> : null}
                      </View>
                      <Text style={styles.productPrice}>₪{p.price}</Text>
                    </View>
                    <View style={styles.actionRow}>
                      <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => startEditing(p)}>
                        <Text style={styles.btnText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDeleteProduct(currentId)}>
                        <Text style={styles.btnText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>No products added yet.</Text>
        )}

        <TouchableOpacity style={styles.completeBtn} onPress={handleCompleteSetup}>
          <Text style={styles.completeBtnText}>Complete Setup ✅</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingBottom: 60 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  section: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 10, backgroundColor: 'rgba(150,150,150,0.05)' },
  btn: { padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  btnText: { color: 'white', fontWeight: 'bold' },
  listTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  productCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  productInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  productName: { fontSize: 16, fontWeight: 'bold' },
  productDesc: { fontSize: 13, opacity: 0.7, marginTop: 4 },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: '#4a90e2' },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 6 },
  editBtn: { backgroundColor: '#f39c12' },
  deleteBtn: { backgroundColor: '#e74c3c' },
  saveBtn: { backgroundColor: '#2ecc71' },
  cancelBtn: { backgroundColor: '#95a5a6' },
  emptyText: { textAlign: 'center', opacity: 0.6, marginBottom: 20 },
  completeBtn: { backgroundColor: '#2ecc71', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  completeBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});
