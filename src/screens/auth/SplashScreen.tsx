import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logoText}>EduSampah</Text>
      <Text style={styles.tagline}>Aplikasi Edukasi Pemilahan Sampah</Text>
      <ActivityIndicator size="large" color="#2e7d32" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 30,
  },
  loader: {
    marginTop: 20,
  }
});
