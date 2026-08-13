import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- Animasi Confetti ---
const Confetti = () => {
  const pieces = Array.from({ length: 60 }).map((_, i) => i);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map(i => <ConfettiPiece key={i} index={i} />)}
    </View>
  );
};

const ConfettiPiece = ({ index }: { index: number }) => {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const translateX = useRef(new Animated.Value(SCREEN_WIDTH / 2)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const explode = () => {
      // Tipe tembakan: 0 = Kiri, 1 = Kanan, 2 = Bawah Tengah
      const originType = Math.floor(Math.random() * 3);
      
      let startX = 0;
      let startY = 0;
      let newTargetX = 0;
      let newTargetY = 0;

      if (originType === 0) {
        // Tembak dari Kiri
        startX = -20;
        startY = SCREEN_HEIGHT * 0.4 + Math.random() * (SCREEN_HEIGHT * 0.4);
        newTargetX = SCREEN_WIDTH * 0.3 + Math.random() * (SCREEN_WIDTH * 0.6);
        newTargetY = startY - (150 + Math.random() * 200); 
      } else if (originType === 1) {
        // Tembak dari Kanan
        startX = SCREEN_WIDTH + 20;
        startY = SCREEN_HEIGHT * 0.4 + Math.random() * (SCREEN_HEIGHT * 0.4);
        newTargetX = SCREEN_WIDTH * 0.7 - Math.random() * (SCREEN_WIDTH * 0.6);
        newTargetY = startY - (150 + Math.random() * 200);
      } else {
        // Tembak dari Bawah
        startX = SCREEN_WIDTH / 2 + (Math.random() * 100 - 50);
        startY = SCREEN_HEIGHT + 20;
        newTargetX = (SCREEN_WIDTH / 60) * index + (Math.random() * 60 - 30);
        newTargetY = SCREEN_HEIGHT * 0.1 + Math.random() * (SCREEN_HEIGHT * 0.4);
      }

      translateY.setValue(startY);
      translateX.setValue(startX);

      Animated.sequence([
        Animated.parallel([
          Animated.timing(translateY, { toValue: newTargetY, duration: 600 + Math.random() * 400, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: newTargetX, duration: 600 + Math.random() * 400, useNativeDriver: true })
        ]),
        Animated.timing(translateY, { toValue: SCREEN_HEIGHT + 100, duration: 2500 + Math.random() * 1500, useNativeDriver: true })
      ]).start(() => {
        timeout = setTimeout(explode, Math.random() * 500);
      });
    };

    // Initial start
    timeout = setTimeout(explode, Math.random() * 500);
    
    Animated.loop(
      Animated.timing(rotate, { toValue: 1, duration: 800 + Math.random() * 1000, useNativeDriver: true })
    ).start();

    return () => clearTimeout(timeout);
  }, []);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const colors = ['#f4bf3d', '#b0ceb5', '#fe7d5e', '#3b82f6', '#ec4899', '#a855f7'];
  const color = colors[index % colors.length];
  const isCircle = index % 3 === 0;

  return (
    <Animated.View style={{
      position: 'absolute',
      top: 0, left: 0,
      width: 14, height: 14,
      borderRadius: isCircle ? 7 : 2,
      backgroundColor: color,
      transform: [{ translateX }, { translateY }, { rotate: spin }]
    }} />
  );
};

// --- Animasi Hujan ---
const Rain = () => {
  const drops = Array.from({ length: 45 }).map((_, i) => i);
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(71, 85, 105, 0.15)' }]} pointerEvents="none">
      {drops.map(i => <RainDrop key={i} />)}
    </View>
  );
};

const RainDrop = () => {
  const translateY = useRef(new Animated.Value(-50)).current;
  const startX = Math.random() * SCREEN_WIDTH;
  const speed = 600 + Math.random() * 400;
  
  useEffect(() => {
    const fall = () => {
      translateY.setValue(-50);
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT + 50,
        duration: speed,
        useNativeDriver: true,
      }).start(() => fall());
    };
    const timeout = setTimeout(fall, Math.random() * 1000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View style={{
      position: 'absolute',
      top: 0, left: startX,
      width: 2, height: 25,
      backgroundColor: '#94a3b8',
      opacity: 0.6,
      borderRadius: 1,
      transform: [{ translateY }]
    }} />
  );
};

// --- Bouncing Icon ---
const BouncingIcon = ({ isSuccess }: { isSuccess: boolean }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSuccess) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotate, { toValue: 1, duration: 150, useNativeDriver: true }),
          Animated.timing(rotate, { toValue: -1, duration: 150, useNativeDriver: true }),
          Animated.timing(rotate, { toValue: 0, duration: 150, useNativeDriver: true }),
          Animated.delay(1200)
        ])
      ).start();
    }
  }, [isSuccess]);

  const spin = rotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-10deg', '10deg']
  });

  return (
    <Animated.View style={{ transform: [{ scale }, { rotate: isSuccess ? '0deg' : spin }] }}>
      <Ionicons 
        name={isSuccess ? "trophy" : "rainy"} 
        size={72} 
        color={isSuccess ? "#f59e0b" : "#64748b"} 
      />
    </Animated.View>
  );
};

interface WrongAnswer {
  name: string;
  userAnswer: string;
  correctAnswer: string;
}

export default function HasilEvaluasiScreen({ navigation, route }: any) {
  const { score, totalItems, correctCount, wrongAnswers, evaluasiName } = route.params || {
    score: 0, totalItems: 0, correctCount: 0, wrongAnswers: [], evaluasiName: 'Simulasi'
  };
  const lulus = score >= 60;

  const titleText = lulus ? 'Luar Biasa! Kerja Bagus! 🎉' : 'Jangan Menyerah! Tetap Semangat! 💪';
  const messageText = lulus 
    ? 'Kamu berhasil menyelesaikan evaluasi ini dengan nilai memuaskan. Pertahankan prestasimu dan terus jadi pahlawan lingkungan!'
    : 'Nilaimu memang belum mencapai target, tapi tidak apa-apa. Kegagalan adalah awal dari keberhasilan. Yuk, baca lagi materinya dan coba lagi!';

  return (
    <View style={styles.container}>
      {/* Background Animations */}
      {lulus ? <Confetti /> : <Rain />}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Animated Icon */}
        <View style={[styles.iconCircle, { borderColor: lulus ? '#f59e0b' : '#94a3b8' }]}>
          <BouncingIcon isSuccess={lulus} />
        </View>

        <Text style={styles.title}>{titleText}</Text>
        <Text style={styles.subtitle}>{evaluasiName}</Text>
        <Text style={styles.messageText}>{messageText}</Text>

        {/* Score Card */}
        <View style={[styles.scoreCard, { borderColor: lulus ? '#2e7d32' : '#dc2626' }]}>
          <Text style={styles.scoreLabel}>Nilai Akhir Anda</Text>
          <Text style={[styles.scoreValue, { color: lulus ? '#2e7d32' : '#dc2626' }]}>{score}</Text>
          <View style={[styles.badge, { backgroundColor: lulus ? '#f0fdf4' : '#fef2f2', borderColor: lulus ? '#2e7d32' : '#dc2626' }]}>
            <Text style={[styles.badgeText, { color: lulus ? '#2e7d32' : '#dc2626' }]}>
              {lulus ? 'LULUS EVALUASI' : 'BELUM LULUS'}
            </Text>
          </View>
        </View>

        {/* Statistik */}
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { borderColor: '#2e7d32' }]}>
            <Text style={[styles.statVal, { color: '#2e7d32' }]}>{correctCount}</Text>
            <Text style={styles.statLabel}>Jawaban Benar</Text>
          </View>
          <View style={[styles.statBox, { borderColor: '#dc2626', borderStyle: 'dashed' }]}>
            <Text style={[styles.statVal, { color: '#dc2626' }]}>{totalItems - correctCount}</Text>
            <Text style={styles.statLabel}>Kesalahan Pemilahan</Text>
          </View>
        </View>

        {/* Buttons */}
        {wrongAnswers && wrongAnswers.length > 0 && (
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => navigation.navigate('Pembahasan', { wrongAnswers, evaluasiName })}
          >
            <Text style={styles.btnPrimaryText}>Lihat Riwayat Pembahasan</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.btnOutline}
          onPress={() => navigation.navigate('UEQForm', { score, totalItems, wrongAnswers })}
        >
          <Text style={styles.btnOutlineText}>Isi Kuesioner UEQ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnGhost}
          onPress={() => navigation.navigate('UserTabs')}
        >
          <Text style={styles.btnGhostText}>Tutup & Kembali</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fcf9ee' // background
  },
  content: { 
    padding: 24, 
    alignItems: 'center', 
    paddingTop: 60 
  },
  iconCircle: { 
    width: 140, 
    height: 140, 
    borderRadius: 70, 
    borderWidth: 4, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 24, 
    backgroundColor: '#ffffff',
    // Neo-shadow
    shadowColor: '#000', 
    shadowOffset: { width: 5, height: 5 }, 
    shadowOpacity: 1, 
    shadowRadius: 0, 
    elevation: 8,
  },
  iconText: { 
    fontSize: 64, 
    fontWeight: '800' 
  },
  title: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#1c1c15', // on-background
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: { 
    fontSize: 14, 
    color: '#424843', // on-surface-variant
    marginBottom: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  messageText: {
    fontSize: 15,
    color: '#424843',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  scoreCard: { 
    width: '100%', 
    backgroundColor: '#ffffff', 
    borderWidth: 3, 
    borderRadius: 20, 
    padding: 28, 
    alignItems: 'center', 
    marginBottom: 24,
    // Neo-shadow
    shadowColor: '#000', 
    shadowOffset: { width: 4, height: 4 }, 
    shadowOpacity: 1, 
    shadowRadius: 0, 
    elevation: 6,
  },
  scoreLabel: { 
    fontSize: 15, 
    color: '#424843', // on-surface-variant
    marginBottom: 12,
    fontWeight: '700',
  },
  scoreValue: { 
    fontSize: 72, 
    fontWeight: '800', 
    marginBottom: 16 
  },
  badge: { 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 12, 
    borderWidth: 2 
  },
  badgeText: { 
    fontWeight: '800', 
    fontSize: 15,
    letterSpacing: 0.5,
  },
  statsGrid: { 
    flexDirection: 'row', 
    gap: 12, 
    width: '100%', 
    marginBottom: 32 
  },
  statBox: { 
    flex: 1, 
    backgroundColor: '#ffffff', 
    borderWidth: 3, 
    borderRadius: 16, 
    padding: 20, 
    alignItems: 'center' 
  },
  statVal: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#1c1c15' // on-background
  },
  statLabel: { 
    fontSize: 12, 
    color: '#424843', // on-surface-variant
    textAlign: 'center', 
    marginTop: 6,
    fontWeight: '700',
  },
  btnPrimary: { 
    width: '100%', 
    backgroundColor: '#142e1d', // primary-container
    padding: 18, 
    borderRadius: 16, 
    alignItems: 'center', 
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#01190a', // primary
    // Neo-shadow
    shadowColor: '#000', 
    shadowOffset: { width: 4, height: 4 }, 
    shadowOpacity: 1, 
    shadowRadius: 0, 
    elevation: 6,
  },
  btnPrimaryText: { 
    color: '#cbead0', // primary-fixed
    fontWeight: '800', 
    fontSize: 16 
  },
  btnOutline: { 
    width: '100%', 
    borderWidth: 2, 
    borderColor: '#01190a', // primary
    backgroundColor: '#ffffff',
    padding: 18, 
    borderRadius: 16, 
    alignItems: 'center', 
    marginBottom: 12 
  },
  btnOutlineText: { 
    color: '#01190a', // primary
    fontWeight: '800', 
    fontSize: 16 
  },
  btnGhost: { 
    width: '100%', 
    padding: 16, 
    alignItems: 'center' 
  },
  btnGhostText: { 
    color: '#424843', // on-surface-variant
    fontSize: 15,
    fontWeight: '700',
  },
});
