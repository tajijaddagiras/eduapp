import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Background Decorative Circles */}
      <View style={styles.circleTopRight} />
      <View style={styles.circleBottomLeft} />

      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.logoWrapper}>
          <Image 
            source={require('../../../assets/images/icon.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.tagline}>Mulai Langkah Kecilmu</Text>
        <Text style={styles.taglineSub}>Selamatkan Bumi Hari Ini</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eff5f1',
    overflow: 'hidden',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoWrapper: {
    width: 140,
    height: 140,
    backgroundColor: '#ffffff',
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#2e7d32',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#e8f0eb',
  },
  logo: {
    width: 100,
    height: 100,
  },
  tagline: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e3a24',
    letterSpacing: -0.5,
  },
  taglineSub: {
    fontSize: 15,
    color: '#424843',
    marginTop: 6,
    fontWeight: '500',
  },
  circleTopRight: {
    position: 'absolute',
    top: -width * 0.3,
    right: -width * 0.3,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: '#dcfce7',
    opacity: 0.6,
  },
  circleBottomLeft: {
    position: 'absolute',
    bottom: -width * 0.4,
    left: -width * 0.3,
    width: width,
    height: width,
    borderRadius: width * 0.5,
    backgroundColor: '#bbf7d0',
    opacity: 0.4,
  },
});
