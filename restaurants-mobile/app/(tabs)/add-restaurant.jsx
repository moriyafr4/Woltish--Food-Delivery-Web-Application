import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Alert, TextInput } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAuth } from '@/components/AuthContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '@/constants/Config';

export default function AddRestaurantScreen() {
  const { token, user } = useAuth() || {};
  const colorScheme = useColorScheme();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '', category: '', phone: '', city: '', lat: '', lng: '', description: ''
  });
  const [errors, setErrors] = useState({});
  const [imageUri, setImageUri] = useState(null);

  if (!token || user?.role !== 'owner') {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 18 }}>Unauthorized access.</Text>
      </View>
    );
  }

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission to access camera roll is required!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const validate = () => {
    let newErrors = {};
    if (!(formData.name || '').trim()) newErrors.name = "Restaurant name is required";
    if (!(formData.category || '').trim()) newErrors.category = "Category is required";
    if (!(formData.city || '').trim()) newErrors.city = "City is required";
    const latStr = String(formData.lat || '').trim();
    if (!latStr) newErrors.lat = "Latitude is required";
    else if (isNaN(Number(latStr))) newErrors.lat = "Latitude must be a valid number";
    
    const lngStr = String(formData.lng || '').trim();
    if (!lngStr) newErrors.lng = "Longitude is required";
    else if (isNaN(Number(lngStr))) newErrors.lng = "Longitude must be a valid number";

    const phoneClean = (formData.phone || '').replace(/[\s-]/g, '');
    if (!phoneClean) {
      newErrors.phone = "Phone number is required";
    } else if (!/^05\d{8}$/.test(phoneClean)) {
      newErrors.phone = "Phone must start with 05 and be exactly 10 digits";
    }

    if (!imageUri) {
      newErrors.image = "Restaurant cover image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', String(formData.name || ''));
      data.append('category', String(formData.category || ''));
      data.append('phone', String(formData.phone || ''));
      data.append('address', String(formData.city || ''));
      data.append('lat', String(formData.lat || ''));
      data.append('lng', String(formData.lng || ''));
      data.append('description', String(formData.description || ''));

      if (imageUri) {
        if (Platform.OS === 'web') {
          const res = await fetch(imageUri);
          const blob = await res.blob();
          data.append('image', blob, 'image.jpg');
        } else {
          const filename = imageUri.split('/').pop() || 'image.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image/jpeg`;
          data.append('image', { uri: imageUri, name: filename, type });
        }
      }

      const response = await fetch(`${API_URL}/api/restaurants`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data,
      });

      if (!response.ok) throw new Error('Failed to create restaurant');
      const dataRes = await response.json();
      
      Alert.alert('Success', 'Restaurant added successfully!');
      
      setFormData({ name: '', description: '' });
      setImageUri(null);
      
      router.replace('/(tabs)/my-restaurants');

    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to add restaurant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <View style={styles.formContainer}>
        <Text style={styles.headerTitle}>Add a New Restaurant 🍽️</Text>
        
        <TouchableOpacity style={[styles.imagePicker, errors.image && { borderColor: '#e74c3c', borderWidth: 1 }]} onPress={handleImagePick}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <View style={[styles.imagePlaceholder, { borderColor: Colors[colorScheme ?? 'light'].border }]}>
              <Text style={styles.imagePlaceholderText}>+ Add Cover Image *</Text>
            </View>
          )}
        </TouchableOpacity>
        {errors.image && <Text style={[styles.errorText, { textAlign: 'center', marginTop: -10, marginBottom: 15 }]}>{errors.image}</Text>}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Restaurant Name *</Text>
          <TextInput style={[styles.input, { color: Colors[colorScheme ?? 'light'].text, borderColor: errors.name ? '#e74c3c' : Colors[colorScheme ?? 'light'].border }]} 
            value={formData.name} onChangeText={t => handleInputChange('name', t)} placeholder="e.g. Big Kahuna Burger" placeholderTextColor="#888" />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category *</Text>
          <TextInput style={[styles.input, { color: Colors[colorScheme ?? 'light'].text, borderColor: errors.category ? '#e74c3c' : Colors[colorScheme ?? 'light'].border }]} 
            value={formData.category} onChangeText={t => handleInputChange('category', t)} placeholder="e.g. Burgers, Pizza..." placeholderTextColor="#888" />
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput style={[styles.input, { color: Colors[colorScheme ?? 'light'].text, borderColor: errors.phone ? '#e74c3c' : Colors[colorScheme ?? 'light'].border }]} 
            value={formData.phone} onChangeText={t => handleInputChange('phone', t.replace(/[^0-9]/g, '').slice(0, 10))} placeholder="e.g. 0501234567" keyboardType="phone-pad" placeholderTextColor="#888" maxLength={10} />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>City (in Israel) *</Text>
          <TextInput style={[styles.input, { color: Colors[colorScheme ?? 'light'].text, borderColor: errors.city ? '#e74c3c' : Colors[colorScheme ?? 'light'].border }]} 
            value={formData.city} onChangeText={t => handleInputChange('city', t)} placeholder="e.g. Tel Aviv" placeholderTextColor="#888" />
          {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Latitude *</Text>
              <TextInput style={[styles.input, { color: Colors[colorScheme ?? 'light'].text, borderColor: errors.lat ? '#e74c3c' : Colors[colorScheme ?? 'light'].border }]} 
                value={formData.lat} onChangeText={t => handleInputChange('lat', t)} placeholder="29-34" keyboardType="numeric" placeholderTextColor="#888" />
              {errors.lat && <Text style={styles.errorText}>{errors.lat}</Text>}
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Longitude *</Text>
              <TextInput style={[styles.input, { color: Colors[colorScheme ?? 'light'].text, borderColor: errors.lng ? '#e74c3c' : Colors[colorScheme ?? 'light'].border }]} 
                value={formData.lng} onChangeText={t => handleInputChange('lng', t)} placeholder="34-36" keyboardType="numeric" placeholderTextColor="#888" />
              {errors.lng && <Text style={styles.errorText}>{errors.lng}</Text>}
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, styles.textArea, { color: Colors[colorScheme ?? 'light'].text, borderColor: Colors[colorScheme ?? 'light'].border }]} 
            value={formData.description} onChangeText={t => handleInputChange('description', t)} placeholder="Tell customers about your food..." multiline numberOfLines={4} placeholderTextColor="#888" />
        </View>

        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.submitBtnText}>{loading ? 'Adding...' : 'Add Restaurant'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  formContainer: { padding: 20, paddingBottom: 50 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  imagePicker: { width: '100%', height: 160, marginBottom: 20, borderRadius: 12, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { flex: 1, borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: 'rgba(150,150,150,0.1)' },
  imagePlaceholderText: { fontSize: 16, opacity: 0.6 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 6, opacity: 0.8 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: 'rgba(150,150,150,0.05)' },
  errorText: { color: '#e74c3c', fontSize: 12, marginTop: 4, fontWeight: '500' },
  textArea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  submitBtn: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});
