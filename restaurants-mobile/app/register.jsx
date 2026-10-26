import React, { useState } from 'react';
import { API_URL } from '@/constants/Config';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image, Alert, ImageBackground, StatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import styles from './RegistrationScreenStyles';

export default function RegistrationScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('user');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [image, setImage] = useState(null);

  const [errors, setErrors] = useState({});

  const validatePassword = (pass) => {
    const hasMinLength = pass.length >= 8;
    const hasUpper = /[A-Z]/.test(pass);
    const hasNumber = /\d/.test(pass);
    return hasMinLength && hasUpper && hasNumber;
  };

  const handlePhoneChange = (text) => {
    let digits = text.replace(/\D/g, "").slice(0, 10);
    let formatted = digits;
    if (digits.length > 3 && digits.length <= 6) {
      formatted = `${digits.slice(0,3)}-${digits.slice(3)}`;
    } else if (digits.length > 6) {
      formatted = `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
    }
    setPhone(formatted);
    setErrors({ ...errors, phone: null });
  };

  const handleRegister = async () => {
    let newErrors = {};

    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.trim().length < 3) {
      newErrors.username = 'Min 3 characters';
    }

    if (!lat || isNaN(lat)) {
      newErrors.lat = 'Enter a valid latitude';
    } else if (parseFloat(lat) < 29 || parseFloat(lat) > 34) {
      newErrors.lat = 'Latitude must be in Israel (29-34)';
    }

    if (!lng || isNaN(lng)) {
      newErrors.lng = 'Enter a valid longitude';
    } else if (parseFloat(lng) < 34 || parseFloat(lng) > 36) {
      newErrors.lng = 'Longitude must be in Israel (34-36)';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^05\d{8}$/.test(phone.replace(/[-\s]/g, ""))) {
      newErrors.phone = 'Format: 05X-XXX-XXXX';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 8 chars, 1 uppercase, 1 number.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!image) {
      newErrors.image = 'Profile picture is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    
    try {
      const formData = new FormData();
      formData.append("username", String(username || '').trim());
      formData.append("password", String(password || ''));
      formData.append("fullName", String(fullName || '').trim());
      formData.append("lat", String(lat || ''));
      formData.append("lng", String(lng || ''));
      formData.append("role", String(role || ''));
      formData.append("phone", String(phone || '').trim());
      
      if (image) {
        if (Platform.OS === 'web') {
          const response = await fetch(image);
          const blob = await response.blob();
          formData.append("profileImage", blob, "profile.jpg");
        } else {
          formData.append("profileImage", {
            uri: image,
            name: 'profile.jpg',
            type: 'image/jpeg',
          });
        }
      }

      // Use the actual Wi-Fi IP address of the computer so the physical phone can connect
      const apiUrl = `${API_URL}/api/users`;

      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (response.status === 409) {
          if (Platform.OS === 'web') alert('Username already taken');
          else Alert.alert('Error', 'Username already taken');
        } else if (data.error) {
          if (Platform.OS === 'web') alert(data.error);
          else Alert.alert('Error', data.error);
        } else {
          if (Platform.OS === 'web') alert('Registration failed. Please try again.');
          else Alert.alert('Error', 'Registration failed. Please try again.');
        }
        return;
      }

      if (Platform.OS === 'web') {
        alert('Registered successfully!');
        router.push('/login');
      } else {
        Alert.alert('Success', 'Registered successfully!', [
          { text: 'OK', onPress: () => router.push('/login') }
        ]);
      }
    } catch (err) {
      console.error(err);
      if (Platform.OS === 'web') alert('Server error, please try again.');
      else Alert.alert('Error', 'Server error, please try again.');
    }
  };

  const pickImage = async () => {
    if (Platform.OS === 'web') {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setErrors({ ...errors, image: null });
      }
      return;
    }

    Alert.alert(
      "Select Image",
      "Choose from gallery or take a new photo",
      [
        {
          text: "Camera",
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Sorry', 'We need camera permissions to make this work!');
              return;
            }
            let result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
            });
            if (!result.canceled) {
              setImage(result.assets[0].uri);
              setErrors({ ...errors, image: null });
            }
          }
        },
        {
          text: "Gallery",
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Sorry', 'We need camera roll permissions to make this work!');
              return;
            }
            let result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
            });
            if (!result.canceled) {
              setImage(result.assets[0].uri);
              setErrors({ ...errors, image: null });
            }
          }
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  return (
    <ImageBackground source={require('../assets/food_bg.jpg')} style={styles.backgroundImage}>
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Join Woltish</Text>
              <Text style={styles.subtitle}>Savor the best food in town</Text>
            </View>

            <View style={styles.glassCard}>
              <Text style={styles.cardTitle}>Create an Account</Text>

              <View style={styles.imagePickerContainer}>
                <TouchableOpacity onPress={pickImage} style={[styles.imagePlaceholder, errors.image && styles.inputError]}>
                  {image ? (
                    <Image source={{ uri: image }} style={styles.profileImage} />
                  ) : (
                    <Text style={styles.imagePlaceholderText}>Add Photo</Text>
                  )}
                </TouchableOpacity>
                {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full name *</Text>
                <TextInput
                  style={[styles.input, errors.fullName && styles.inputError]}
                  value={fullName}
                  onChangeText={(text) => { setFullName(text); setErrors({ ...errors, fullName: null }); }}
                  placeholder="Your full name"
                  placeholderTextColor="#999"
                />
                {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Username *</Text>
                <TextInput
                  style={[styles.input, errors.username && styles.inputError]}
                  value={username}
                  onChangeText={(text) => { setUsername(text); setErrors({ ...errors, username: null }); }}
                  placeholder="Choose a username"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                />
                {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>I am a *</Text>
                <View style={styles.roleContainer}>
                  <TouchableOpacity 
                    style={[styles.roleButton, role === 'user' && styles.roleButtonActive]}
                    onPress={() => setRole('user')}
                  >
                    <Text style={[styles.roleText, role === 'user' && styles.roleTextActive]}>Customer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.roleButton, role === 'owner' && styles.roleButtonActive]}
                    onPress={() => setRole('owner')}
                  >
                    <Text style={[styles.roleText, role === 'owner' && styles.roleTextActive]}>Restaurant Owner</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.rowContainer}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Latitude *</Text>
                  <TextInput
                    style={[styles.input, errors.lat && styles.inputError]}
                    value={lat}
                    onChangeText={(text) => { setLat(text); setErrors({ ...errors, lat: null }); }}
                    placeholder="29-34"
                    placeholderTextColor="#999"
                    keyboardType="decimal-pad"
                  />
                  {errors.lat && <Text style={styles.errorText}>{errors.lat}</Text>}
                </View>

                <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Longitude *</Text>
                  <TextInput
                    style={[styles.input, errors.lng && styles.inputError]}
                    value={lng}
                    onChangeText={(text) => { setLng(text); setErrors({ ...errors, lng: null }); }}
                    placeholder="34-36"
                    placeholderTextColor="#999"
                    keyboardType="decimal-pad"
                  />
                  {errors.lng && <Text style={styles.errorText}>{errors.lng}</Text>}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone number *</Text>
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  placeholder="05X-XXX-XXXX"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                />
                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password *</Text>
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  value={password}
                  onChangeText={(text) => { setPassword(text); setErrors({ ...errors, password: null }); }}
                  placeholder="Min. 8 chars"
                  placeholderTextColor="#999"
                  secureTextEntry
                />
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password *</Text>
                <TextInput
                  style={[styles.input, errors.confirmPassword && styles.inputError]}
                  value={confirmPassword}
                  onChangeText={(text) => { setConfirmPassword(text); setErrors({ ...errors, confirmPassword: null }); }}
                  placeholder="Repeat password"
                  placeholderTextColor="#999"
                  secureTextEntry
                />
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>

              <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Create Account</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/login')}>
                <Text style={styles.linkText}>Already have an account? <Text style={styles.linkHighlight}>Log in here</Text></Text>
              </TouchableOpacity>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}
