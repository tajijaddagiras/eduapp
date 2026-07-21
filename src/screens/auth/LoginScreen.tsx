import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Email dan password harus diisi');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      alert('Login gagal. Periksa email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCard}>
            <Image 
              source={require('../../../assets/icon.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.welcomeText}>Selamat Datang!</Text>
          <Text style={styles.subtitleText}>Masuk untuk melanjutkan belajar</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#424843" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Masukkan email Anda"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#424843" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Masukkan password Anda"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#424843" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
            onPress={handleLogin} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#cbead0" />
            ) : (
              <>
                <Text style={styles.loginButtonText}>Masuk</Text>
                <Ionicons name="arrow-forward" size={20} color="#cbead0" />
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>atau</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Register Link */}
          <TouchableOpacity 
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerLinkText}>
              Belum punya akun? <Text style={styles.registerLinkBold}>Daftar di sini</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fcf9ee', // background - konsisten
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  
  // Logo Section
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCard: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f1eee3', // surface-container
    borderWidth: 4,
    borderColor: '#01190a', // primary
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    // Neo-shadow
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  logo: {
    width: 80,
    height: 80,
  },
  welcomeText: {
    fontSize: 28, // headline-xl-mobile
    fontWeight: '800',
    color: '#1c1c15', // on-background
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 16, // body-md
    color: '#424843', // on-surface-variant
    textAlign: 'center',
  },
  
  // Form Card
  formCard: {
    backgroundColor: '#f1eee3', // surface-container
    borderRadius: 24, // rounded-3xl
    borderWidth: 3,
    borderColor: '#01190a', // primary
    padding: 24,
    // Neo-shadow
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  
  // Input Fields
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14, // label-md
    fontWeight: '700',
    color: '#1c1c15', // on-background
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fcf9ee', // background
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#01190a', // primary
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1c1c15', // on-background
  },
  eyeIcon: {
    padding: 4,
  },
  
  // Login Button
  loginButton: {
    backgroundColor: '#142e1d', // primary-container
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#01190a', // primary
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    // Neo-shadow
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 18, // headline-sm
    fontWeight: '700',
    color: '#cbead0', // primary-fixed
  },
  
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#c2c8c0', // outline-variant
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#424843', // on-surface-variant
    fontWeight: '600',
  },
  
  // Register Link
  registerLink: {
    alignItems: 'center',
  },
  registerLinkText: {
    fontSize: 14,
    color: '#424843', // on-surface-variant
  },
  registerLinkBold: {
    fontWeight: '700',
    color: '#01190a', // primary
  },
});
