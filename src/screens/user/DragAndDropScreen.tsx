import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, TouchableOpacity, ActivityIndicator } from 'react-native';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

interface Item {
  id: string;
  name: string;
  type: string;
}

export default function DragAndDropScreen({ navigation }: any) {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const pan = useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const q = query(collection(db, 'soal'), where('gameType', '==', 'DragDrop'));
        const querySnapshot = await getDocs(q);
        const fetched: Item[] = [];
        querySnapshot.forEach(doc => {
          fetched.push({ id: doc.id, name: doc.data().name, type: doc.data().type });
        });
        setItems(fetched);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleAnswer = async (isCorrect: boolean, userAnswer: string) => {
    const item = items[currentIndex];
    
    if (!isCorrect) {
      setWrongAnswers(prev => [...prev, {
        name: item.name,
        userAnswer: userAnswer,
        correctAnswer: item.type,
      }]);
    }

    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);

    // Show feedback briefly
    setFeedback(isCorrect ? '✓ Benar!' : '✗ Salah!');
    setTimeout(async () => {
      setFeedback(null);
      if (currentIndex < items.length - 1) {
        setCurrentIndex(currentIndex + 1);
        pan.setValue({ x: 0, y: 0 });
      } else {
        // Game finished — save progress and navigate to result
        const finalScore = Math.round((newScore / items.length) * 100);
        try {
          if (user) {
            await addDoc(collection(db, 'progress'), {
              userId: user.uid,
              type: 'simulasi',
              score: finalScore,
              correctCount: newScore,
              totalItems: items.length,
              completedAt: new Date(),
            });
          }
        } catch (e) { console.error(e); }

        navigation.replace('HasilEvaluasi', {
          score: finalScore,
          totalItems: items.length,
          correctCount: newScore,
          wrongAnswers: wrongAnswers.concat(isCorrect ? [] : [{
            name: item.name, userAnswer, correctAnswer: item.type
          }]),
          evaluasiName: 'Simulasi Praktek Pemilahan',
        });
      }
    }, 800);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gesture) => {
        if (items.length === 0) return;
        const item = items[currentIndex];

        if (gesture.dx < -80) {
          // Swiped left → Organik
          Animated.spring(pan, { toValue: { x: -300, y: gesture.dy }, useNativeDriver: false }).start(() => {
            pan.setValue({ x: 0, y: 0 });
            handleAnswer(item.type === 'organik', 'organik');
          });
        } else if (gesture.dx > 80) {
          // Swiped right → Anorganik
          Animated.spring(pan, { toValue: { x: 300, y: gesture.dy }, useNativeDriver: false }).start(() => {
            pan.setValue({ x: 0, y: 0 });
            handleAnswer(item.type === 'anorganik', 'anorganik');
          });
        } else {
          // Snap back
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Menyiapkan Simulasi...</Text>
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
          <Text style={styles.headerTitle}>Simulasi Item: 0 / 0</Text>
          <View style={{ width: 32 }} />
        </View>
        <Text style={styles.emptyText}>Belum ada soal simulasi.</Text>
      </View>
    );
  }

  const progress = ((currentIndex) / items.length) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
          <Text style={{ fontWeight: 'bold' }}>X</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Simulasi Item: {currentIndex + 1} / {items.length}</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      {/* Instruction */}
      <Text style={styles.instruction}>Praktek Pemilahan:{'\n'}Seret objek ke tong yang tepat!</Text>

      {/* Feedback overlay */}
      {feedback && (
        <View style={[styles.feedbackBadge, { backgroundColor: feedback.includes('Benar') ? '#2e7d32' : '#dc2626' }]}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      )}

      {/* Draggable Item */}
      <Animated.View
        style={[styles.itemCard, { transform: [{ translateX: pan.x }, { translateY: pan.y }] }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.itemImage} />
        <Text style={styles.itemName}>{items[currentIndex]?.name}</Text>
        <Text style={styles.itemHint}>[ Tahan & Geser ]</Text>
      </Animated.View>

      {/* Drop Zones */}
      <View style={styles.dropZones}>
        <View style={[styles.dropZone, { borderColor: '#2e7d32', backgroundColor: '#f0fdf4' }]}>
          <Text style={styles.dropZoneIcon}>[ TONG ]</Text>
          <Text style={[styles.dropZoneLabel, { color: '#2e7d32' }]}>ORGANIK</Text>
          <Text style={styles.dropZoneHint}>← Geser Kiri</Text>
        </View>
        <View style={[styles.dropZone, { borderColor: '#dc2626', backgroundColor: '#fef2f2' }]}>
          <Text style={styles.dropZoneIcon}>[ TONG ]</Text>
          <Text style={[styles.dropZoneLabel, { color: '#dc2626' }]}>ANORGANIK</Text>
          <Text style={styles.dropZoneHint}>Geser Kanan →</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  loadingText: { marginTop: 12, color: '#6b7280' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50 },
  headerIcon: { width: 32, height: 32, borderWidth: 2, borderColor: '#333', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 14, fontWeight: 'bold', color: '#374151' },
  progressBg: { height: 8, backgroundColor: '#e5e7eb', marginHorizontal: 20, borderRadius: 4, marginBottom: 20 },
  progressFill: { height: 8, backgroundColor: '#2e7d32', borderRadius: 4 },
  instruction: { textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#111827', lineHeight: 26, marginBottom: 30, paddingHorizontal: 20 },
  feedbackBadge: { alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginBottom: 10 },
  feedbackText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  itemCard: { width: 140, height: 140, backgroundColor: '#fff', borderWidth: 2, borderColor: '#374151', borderRadius: 16, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6, marginBottom: 40 },
  itemImage: { width: 50, height: 50, backgroundColor: '#e5e7eb', borderRadius: 8, marginBottom: 8 },
  itemName: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', paddingHorizontal: 8 },
  itemHint: { fontSize: 10, color: '#9ca3af', marginTop: 4 },
  dropZones: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, gap: 16 },
  dropZone: { flex: 1, height: 120, borderWidth: 3, borderStyle: 'dashed', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dropZoneIcon: { fontSize: 18, fontWeight: 'bold', marginBottom: 6, color: '#374151' },
  dropZoneLabel: { fontWeight: 'bold', fontSize: 14 },
  dropZoneHint: { fontSize: 10, color: '#9ca3af', marginTop: 4 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#6b7280' },
});
