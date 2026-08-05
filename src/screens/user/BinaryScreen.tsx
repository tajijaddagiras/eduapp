import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

interface Item {
  id: string;
  name: string;
  type: string;
  imageUrl?: string | null;
  explanation?: string;
}

export default function BinaryScreen({ route, navigation }: any) {
  const { user } = useAuth();
  const { levelId, levelName, duration, nilaiPerSoal } = route.params || {};
  
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [disableButtons, setDisableButtons] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration ? duration * 60 : 120);
  const [gameStarted, setGameStarted] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        let q = query(
          collection(db, 'soal'), 
          where('gameType', '==', 'Binary')
        );
        
        if (levelId) {
          q = query(
            collection(db, 'soal'),
            where('gameType', '==', 'Binary'),
            where('levelId', '==', levelId)
          );
        }
        
        const querySnapshot = await getDocs(q);
        const fetched: Item[] = [];
        querySnapshot.forEach(doc => {
          fetched.push({ 
            id: doc.id, 
            name: doc.data().name, 
            type: doc.data().type, 
            imageUrl: doc.data().imageUrl || null,
            explanation: doc.data().explanation || '',
          });
        });
        setItems(fetched);
        setGameStarted(true);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [levelId]);

  useEffect(() => {
    if (!gameStarted) return;
    if (timeLeft <= 0) {
      // Time up — finish game with current state
      const totalItems = items.length;
      const poinPerSoal = nilaiPerSoal || 10;
      const totalScore = score * poinPerSoal;
      const maxScore = totalItems * poinPerSoal;
      const finalScore = totalItems > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
      navigation.replace('HasilEvaluasi', {
        score: finalScore,
        totalItems,
        correctCount: score,
        wrongAnswers,
        evaluasiName: 'Klasifikasi Cepat',
      });
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameStarted]);

  const handleAnswer = async (userAnswer: string) => {
    setDisableButtons(true);
    const item = items[currentIndex];
    const isCorrect = item.type === userAnswer;
    
    if (!isCorrect) {
      setWrongAnswers(prev => [...prev, {
        name: item.name,
        userAnswer: userAnswer,
        correctAnswer: item.type,
        imageUrl: item.imageUrl || null,
        explanation: item.explanation,
      }]);
    }

    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);

    setFeedback(isCorrect ? '✓ Benar!' : '✗ Salah!');
    setTimeout(async () => {
      setFeedback(null);
      setDisableButtons(false);
      
      if (currentIndex < items.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        const totalItems = items.length;
        const poinPerSoal = nilaiPerSoal || 10;
        
        if (totalItems === 0) {
          navigation.replace('UserTabs');
          return;
        }
        
        const totalScore = newScore * poinPerSoal;
        const maxScore = totalItems * poinPerSoal;
        const finalScore = Math.round((totalScore / maxScore) * 100);
        
        try {
          if (user) {
            await addDoc(collection(db, 'progress'), {
              userId: user.uid,
              type: 'klasifikasi',
              score: finalScore,
              correctCount: newScore,
              totalItems: totalItems,
              completedAt: new Date(),
            });
          }
        } catch (e) { console.error(e); }

        navigation.replace('HasilEvaluasi', {
          score: finalScore,
          totalItems: totalItems,
          correctCount: newScore,
          wrongAnswers: wrongAnswers.concat(isCorrect ? [] : [{
            name: item.name, userAnswer, correctAnswer: item.type, imageUrl: item.imageUrl || null, explanation: item.explanation
          }]),
          evaluasiName: 'Klasifikasi Cepat',
        });
      }
    }, 800);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1d4ed8" />
        <Text style={styles.loadingText}>Menyiapkan Klasifikasi...</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
            <Text style={{ fontWeight: 'bold' }}>X</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Klasifikasi: 0 / 0</Text>
          <View style={{ width: 32 }} />
        </View>
        <Text style={styles.emptyText}>Belum ada soal klasifikasi.</Text>
      </View>
    );
  }

  const progress = ((currentIndex + 1) / items.length) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
          <Text style={{ fontWeight: 'bold' }}>X</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Klasifikasi: {currentIndex + 1} / {items.length}</Text>
          {levelName && (
            <Text style={styles.headerSubtitle}>{levelName}</Text>
          )}
        </View>
        {/* Timer */}
        <View style={[styles.timerBox, timeLeft < 30 ? { backgroundColor: '#fee2e2', borderColor: '#dc2626' } : {}]}>
          <Text style={[styles.timerText, timeLeft < 30 ? { color: '#dc2626' } : {}]}>
            ⏱ {formatTime(timeLeft)}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      {/* Instruction */}
      <Text style={styles.instruction}>Klasifikasi Cepat:{'\n'}Pilih kategori yang tepat!</Text>

      {/* Feedback overlay */}
      {feedback && (
        <View style={[styles.feedbackBadge, { backgroundColor: feedback.includes('Benar') ? '#1d4ed8' : '#dc2626' }]}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      )}

      {/* Item Display */}
      <View style={styles.itemCard}>
        {items[currentIndex]?.imageUrl ? (
          <Image
            source={{ uri: items[currentIndex].imageUrl! }}
            style={styles.itemImageReal}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.itemImagePlaceholder}>
            <Text style={styles.placeholderText}>📦</Text>
          </View>
        )}
        <Text style={styles.itemName}>{items[currentIndex]?.name}</Text>
        <Text style={styles.itemHint}>Pilih kategori yang benar</Text>
      </View>

      {/* Binary Choice Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.choiceBtn, styles.btnOrganik]}
          onPress={() => handleAnswer('organik')}
          disabled={disableButtons}
        >
          <Ionicons name="leaf-outline" size={32} color="#15803d" style={{ marginBottom: 4 }} />
          <Text style={styles.btnText}>ORGANIK</Text>
          <Text style={styles.btnSubtext}>Sampah alami</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.choiceBtn, styles.btnAnorganik]}
          onPress={() => handleAnswer('anorganik')}
          disabled={disableButtons}
        >
          <Ionicons name="sync-outline" size={32} color="#1d4ed8" style={{ marginBottom: 4 }} />
          <Text style={styles.btnText}>ANORGANIK</Text>
          <Text style={styles.btnSubtext}>Sampah buatan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fcf9ee' // background
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#fcf9ee' 
  },
  loadingText: { 
    marginTop: 12, 
    color: '#424843' // on-surface-variant
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 20, 
    paddingTop: 50 
  },
  headerIcon: { 
    width: 40, 
    height: 40, 
    borderWidth: 2, 
    borderColor: '#01190a', // primary
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerTitle: { 
    fontSize: 15, 
    fontWeight: '800', 
    color: '#1c1c15' // on-background
  },
  headerSubtitle: { 
    fontSize: 12, 
    color: '#424843', // on-surface-variant
    marginTop: 2 
  },
  progressBg: { 
    height: 8, 
    backgroundColor: '#e5e2d8', // outline-variant lighter
    marginHorizontal: 20, 
    borderRadius: 4, 
    marginBottom: 20 
  },
  progressFill: { 
    height: 8, 
    backgroundColor: '#f4bf3d', // tertiary-fixed-dim
    borderRadius: 4 
  },
  instruction: { 
    textAlign: 'center', 
    fontSize: 19, 
    fontWeight: '800', 
    color: '#1c1c15', // on-background
    lineHeight: 28, 
    marginBottom: 24, 
    paddingHorizontal: 20 
  },
  feedbackBadge: { 
    alignSelf: 'center', 
    paddingHorizontal: 24, 
    paddingVertical: 12, 
    borderRadius: 20, 
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#01190a', // primary
  },
  feedbackText: { 
    color: '#fff', 
    fontWeight: '800', 
    fontSize: 17 
  },
  itemCard: { 
    width: 180, 
    height: 180, 
    backgroundColor: '#ffffff', 
    borderWidth: 3, 
    borderColor: '#01190a', // primary
    borderRadius: 20, 
    alignSelf: 'center', 
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 8, 
    elevation: 6, 
    marginBottom: 40 
  },
  itemImageReal: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#01190a',
  },
  itemImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#f1eee3',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#01190a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  timerBox: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1.5,
    borderColor: '#01190a',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  timerText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#01190a',
  },
  itemName: { 
    fontSize: 17, 
    fontWeight: '800', 
    textAlign: 'center', 
    paddingHorizontal: 12,
    color: '#1c1c15', // on-background
  },
  itemHint: { 
    fontSize: 12, 
    color: '#424843', // on-surface-variant
    marginTop: 8,
    fontWeight: '600',
  },
  buttonContainer: { 
    flexDirection: 'row', 
    paddingHorizontal: 20, 
    gap: 16 
  },
  choiceBtn: { 
    flex: 1, 
    paddingVertical: 28, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 4, height: 4 }, 
    shadowOpacity: 1, 
    shadowRadius: 0, 
    elevation: 8,
    borderWidth: 3,
    borderColor: '#01190a', // primary
  },
  btnOrganik: { 
    backgroundColor: '#b0ceb5' // primary-fixed
  },
  btnAnorganik: { 
    backgroundColor: '#fe7d5e' // secondary-container
  },
  btnIcon: { 
    fontSize: 36, 
    marginBottom: 8 
  },
  btnText: { 
    color: '#01190a', // primary
    fontWeight: '800', 
    fontSize: 17, 
    marginBottom: 4 
  },
  btnSubtext: { 
    color: '#01190a', // primary
    fontSize: 12, 
    opacity: 0.8,
    fontWeight: '700',
  },
  emptyText: { 
    textAlign: 'center', 
    marginTop: 40, 
    color: '#9ca3af' 
  },
});
