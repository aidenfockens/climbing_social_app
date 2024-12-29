import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';



export default function AuthScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Default to Login mode
  const router = useRouter();

  const handleAuth = async () => {
    try {
      const url = isLogin ? 'http://127.0.0.1:5001/login' : 'http://127.0.0.1:5001/signup';
      const body = isLogin
        ? { username, password }
        : { username, email, password };

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
          credentials: 'include',
        });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', data.message);
        const userDetailsResponse = await fetch(`http://127.0.0.1:5001/userdetails/${username}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        const userDetailsData = await userDetailsResponse.json();

        if (userDetailsResponse.ok) {
          router.push('/(tabs)');
        } else {
          // Redirect to the user details input page
          router.push('/UserDetailsInput');
        }
      } else {
        Alert.alert('Error', data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Error', 'Failed to connect to the server');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, isLogin && styles.activeButton]}
          onPress={() => setIsLogin(true)}
        >
          <Text style={[styles.toggleText, isLogin && styles.activeText]}>Login</Text>
        </TouchableOpacity>
        <Text style={styles.separator}> / </Text>
        <TouchableOpacity
          style={[styles.toggleButton, !isLogin && styles.activeButton]}
          onPress={() => setIsLogin(false)}
        >
          <Text style={[styles.toggleText, !isLogin && styles.activeText]}>Signup</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title={isLogin ? 'Login' : 'Signup'} onPress={handleAuth} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    padding: 20,
  },
  toggleContainer: {
    flexDirection: 'row', // Align buttons in a row
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20, // Add spacing below the toggle buttons
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#f0f0f0', // Light background for inactive state
    marginHorizontal: 5, // Add spacing between buttons
  },
  activeButton: {
    backgroundColor: '#007BFF', // Blue background for active button
  },
  toggleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333', // Dark text for inactive button
  },
  activeText: {
    color: 'white', // White text for active button
  },
  separator: {
    fontSize: 16,
    marginHorizontal: 5,
  },
  input: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    width: '80%', // Make inputs take up 80% of the width
  },
});
