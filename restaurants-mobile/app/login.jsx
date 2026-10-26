import React, { useState } from 'react';
import { API_URL } from '@/constants/Config';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ImageBackground, StatusBar, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../components/AuthContext';
import styles from './LoginScreenStyles';

export default function LoginScreen() {
  const router = useRouter();
  const { handleSetToken } = useAuth(); // or login if needed
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    setError('');

    try {
      // Use the actual Wi-Fi IP address of the computer so the physical phone can connect
      const apiUrl = `${API_URL}/api/tokens`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 404) {
          setError('Invalid username or password.');
        } else {
          setError('Server error, please try again later.');
        }
        return;
      }

      const data = await response.json();
      
      // Update global AuthContext with the token
      if (data.token) {
        await handleSetToken(data.token);
      }

      if (Platform.OS === 'web') alert('Logged in successfully!');
      else Alert.alert('Success', 'Logged in successfully!');
      
      // Navigate to tabs
      router.replace('/(tabs)');
      
    } catch (err) {
      console.error(err);
      setError('Server error, please try again.');
    }
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
              <Text style={styles.title}>Woltish</Text>
              <Text style={styles.subtitle}>Savor the best food in town</Text>
            </View>

            <View style={styles.glassCard}>
              <Text style={styles.cardTitle}>Welcome Back</Text>
              
              {error ? <Text style={styles.errorAlert}>{error}</Text> : null}

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={[styles.input, error && (!username) && styles.inputError]}
                  value={username}
                  onChangeText={(text) => { setUsername(text); setError(''); }}
                  placeholder="Enter your username"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={[styles.input, error && (!password) && styles.inputError]}
                  value={password}
                  onChangeText={(text) => { setPassword(text); setError(''); }}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  secureTextEntry
                />
              </View>

              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Sign In</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/register')}>
                <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkHighlight}>Register here</Text></Text>
              </TouchableOpacity>
            </View>
            
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}
