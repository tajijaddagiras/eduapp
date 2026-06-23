import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Mari Belajar Memilah',
    description: 'Kenali perbedaan antara sampah organik dan anorganik untuk menjaga lingkungan kita bersama.',
  },
  {
    id: 2,
    title: 'Modul Edukasi Interaktif',
    description: 'Baca materi komprehensif yang dirancang khusus untuk meningkatkan pemahaman Anda.',
  },
  {
    id: 3,
    title: 'Praktek Simulasi',
    description: 'Uji kemampuan Anda dalam memilah sampah melalui game simulasi interaktif kami!',
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
      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
        <Text style={styles.skipText}>Lewati</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Tempat Gambar Nanti */}
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>[ Gambar {currentIndex + 1} Kosong ]</Text>
        </View>
        
        <Text style={styles.title}>{slides[currentIndex].title}</Text>
        <Text style={styles.description}>{slides[currentIndex].description}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View 
              key={index} 
              style={[styles.dot, currentIndex === index && styles.activeDot]} 
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextText}>
            {currentIndex === slides.length - 1 ? 'Mulai Sekarang' : 'Selanjutnya'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', padding: 20 },
  skipBtn: { alignSelf: 'flex-end', marginTop: 40, padding: 10 },
  skipText: { color: '#6b7280', fontWeight: 'bold' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imagePlaceholder: { width: width * 0.8, height: width * 0.8, backgroundColor: '#f3f4f6', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  placeholderText: { color: '#9ca3af' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 15 },
  description: { fontSize: 14, color: '#6b7280', textAlign: 'center', paddingHorizontal: 20, lineHeight: 22 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 30, paddingHorizontal: 10 },
  pagination: { flexDirection: 'row' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#d1d5db', marginHorizontal: 5 },
  activeDot: { backgroundColor: '#2e7d32', width: 20 },
  nextBtn: { backgroundColor: '#2e7d32', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10 },
  nextText: { color: '#ffffff', fontWeight: 'bold' }
});
