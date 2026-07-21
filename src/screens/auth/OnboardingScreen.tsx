import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Mari Belajar Memilah',
    description: 'Kenali perbedaan antara sampah organik dan anorganik untuk menjaga lingkungan kita bersama.',
    image: require('../../../assets/images/onboarding-1.png'), // Placeholder: onboarding-1.png
  },
  {
    id: 2,
    title: 'Modul Edukasi Interaktif',
    description: 'Baca materi komprehensif yang dirancang khusus untuk meningkatkan pemahaman Anda.',
    image: require('../../../assets/images/onboarding-2.png'), // Placeholder: onboarding-2.png
  },
  {
    id: 3,
    title: 'Praktek Simulasi',
    description: 'Uji kemampuan Anda dalam memilah sampah melalui game simulasi interaktif kami!',
    image: require('../../../assets/images/onboarding-3.png'), // Placeholder: onboarding-3.png
  }
];

export default function OnboardingScreen({ navigation }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => {
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
        <Text style={styles.skipText}>Lewati</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Image Card with Neo-shadow */}
        <View style={styles.imageCard}>
          <Image 
            source={slides[currentIndex].image} 
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        
        {/* Text Content Card with Neo-shadow */}
        <View style={styles.textCard}>
          <Text style={styles.title}>{slides[currentIndex].title}</Text>
          <Text style={styles.description}>{slides[currentIndex].description}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.dot, 
                currentIndex === index && styles.activeDot
              ]} 
            />
          ))}
        </View>

        {/* Next/Start Button with Neo-shadow */}
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextText}>
            {currentIndex === slides.length - 1 ? 'Mulai Sekarang' : 'Selanjutnya'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#cbead0" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fcf9ee', // background - konsisten dengan halaman lain
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  
  // Skip Button
  skipBtn: { 
    alignSelf: 'flex-end', 
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#01190a', // primary
    backgroundColor: 'transparent',
  },
  skipText: { 
    color: '#01190a', // primary
    fontWeight: '700',
    fontSize: 14,
  },
  
  // Content Area
  content: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingVertical: 20,
  },
  
  // Image Card with Neo-shadow
  imageCard: {
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: 32, // rounded-[2rem]
    backgroundColor: '#f1eee3', // surface-container
    borderWidth: 4,
    borderColor: '#01190a', // primary
    overflow: 'hidden',
    marginBottom: 32,
    // Neo-shadow effect
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  
  // Text Card with Neo-shadow
  textCard: {
    width: '100%',
    backgroundColor: '#f1eee3', // surface-container
    borderRadius: 24, // rounded-3xl
    borderWidth: 3,
    borderColor: '#01190a', // primary
    paddingVertical: 24,
    paddingHorizontal: 28,
    // Neo-shadow effect
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  title: { 
    fontSize: 24, // headline-lg
    fontWeight: '800', 
    color: '#1c1c15', // on-background
    textAlign: 'center', 
    marginBottom: 12,
    lineHeight: 32,
  },
  description: { 
    fontSize: 16, // body-md
    color: '#424843', // on-surface-variant
    textAlign: 'center', 
    lineHeight: 24,
  },
  
  // Footer
  footer: { 
    paddingBottom: 40,
    paddingTop: 20,
  },
  
  // Pagination Dots
  pagination: { 
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  dot: { 
    width: 10, 
    height: 10, 
    borderRadius: 5, 
    backgroundColor: '#c2c8c0', // outline-variant
    marginHorizontal: 6,
    borderWidth: 2,
    borderColor: '#01190a', // primary
  },
  activeDot: { 
    backgroundColor: '#b0ceb5', // primary-fixed
    width: 32, // elongated
  },
  
  // Next/Start Button with Neo-shadow
  nextBtn: { 
    backgroundColor: '#142e1d', // primary-container
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 20, // rounded-[1.25rem]
    borderWidth: 2,
    borderColor: '#01190a', // primary
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    // Neo-shadow
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  nextText: { 
    color: '#cbead0', // primary-fixed
    fontWeight: '700',
    fontSize: 18, // headline-sm
    lineHeight: 24,
  }
});
