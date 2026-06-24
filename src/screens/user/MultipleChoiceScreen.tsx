import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Image } from 'react-native';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

interface Question {
  id: string;
  question: string;
  imageUrl?: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  duration: number;
}

export default function MultipleChoiceScreen({ route, navigation }: any) {
  const { user } = useAuth();
  const { levelId, levelName, duration, nilaiPerSoal } = route.params || {};
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<any[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        let q = query(
          collection(db, 'soal'), 
          where('gameType', '==', 'MultipleChoice')
        );
        
        if (levelId) {
          q = query(
            collection(db, 'soal'),
            where('gameType', '==', 'MultipleChoice'),
            where('levelId', '==', levelId)
          );
        }
        
        const querySnapshot = await getDocs(q);
        const fetched: Question[] = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          fetched.push({
            id: doc.id,
            question: data.question,
            imageUrl: data.imageUrl,
            optionA: data.optionA,
            optionB: data.optionB,
            optionC: data.optionC,
            optionD: data.optionD,
            correctAnswer: data.correctAnswer,
            explanation: data.explanation,
            duration: data.duration || duration || 30,
          });
        });
        setQuestions(fetched);
        
        if (fetched.length > 0) {
          const dur = duration ? duration * 60 : 1800;
          setTimeRemaining(dur);
          setTotalDuration(dur);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [levelId, duration]);

  // Timer countdown - TIMER TETAP JALAN SAAT SHOW EXPLANATION
  useEffect(() => {
    if (timeRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, currentIndex]);

  const handleTimeUp = async () => {
    const totalQuestions = questions.length;
    const poinPerSoal = nilaiPerSoal || 10;
    
    if (totalQuestions === 0) {
      navigation.replace('UserTabs');
      return;
    }
    
    const totalScore = score * poinPerSoal;
    const maxScore = totalQuestions * poinPerSoal;
    const finalScore = Math.round((totalScore / maxScore) * 100);
    
    try {
      if (user) {
        await addDoc(collection(db, 'progress'), {
          userId: user.uid,
          type: 'pilihan-ganda',
          score: finalScore,
          correctCount: score,
          totalItems: totalQuestions,
          completedAt: new Date(),
        });
      }
    } catch (e) { console.error(e); }

    navigation.replace('HasilEvaluasi', {
      score: finalScore,
      totalItems: totalQuestions,
      correctCount: score,
      wrongAnswers,
      evaluasiName: 'Evaluasi Pilihan Ganda',
    });
  };

  const handleAnswer = (answer: 'A' | 'B' | 'C' | 'D') => {
    if (selectedAnswer || showExplanation) return;
    
    setSelectedAnswer(answer);
    const question = questions[currentIndex];
    const isCorrect = question.correctAnswer === answer;
    
    if (!isCorrect) {
      setWrongAnswers(prev => [...prev, {
        name: question.question,
        userAnswer: answer,
        correctAnswer: question.correctAnswer,
      }]);
    } else {
      setScore(score + 1);
    }
    
    // Show explanation
    setShowExplanation(true);
  };

  const handleNext = async () => {
    // Cek dulu apakah ini soal terakhir
    const isLastQuestion = currentIndex >= questions.length - 1;
    
    if (isLastQuestion) {
      // SOAL TERAKHIR - Langsung navigate tanpa reset state (hindari flickering)
      const totalQuestions = questions.length;
      const poinPerSoal = nilaiPerSoal || 10;
      
      if (totalQuestions === 0) {
        navigation.replace('UserTabs');
        return;
      }
      
      const totalScore = score * poinPerSoal;
      const maxScore = totalQuestions * poinPerSoal;
      const finalScore = Math.round((totalScore / maxScore) * 100);
      
      try {
        if (user) {
          await addDoc(collection(db, 'progress'), {
            userId: user.uid,
            type: 'pilihan-ganda',
            score: finalScore,
            correctCount: score,
            totalItems: totalQuestions,
            completedAt: new Date(),
          });
        }
      } catch (e) { console.error(e); }

      navigation.replace('HasilEvaluasi', {
        score: finalScore,
        totalItems: totalQuestions,
        correctCount: score,
        wrongAnswers,
        evaluasiName: 'Evaluasi Pilihan Ganda',
      });
    } else {
      // BUKAN SOAL TERAKHIR - Reset state dan lanjut ke soal berikutnya
      setSelectedAnswer(null);
      setShowExplanation(false);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.loadingText}>Menyiapkan Soal...</Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
            <Text style={{ fontWeight: 'bold' }}>X</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pilihan Ganda: 0 / 0</Text>
          <View style={{ width: 32 }} />
        </View>
        <Text style={styles.emptyText}>Belum ada soal pilihan ganda.</Text>
      </View>
    );
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const currentQuestion = questions[currentIndex];
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
          <Text style={{ fontWeight: 'bold' }}>X</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Soal {currentIndex + 1} / {questions.length}</Text>
          {levelName && (
            <Text style={styles.headerSubtitle}>{levelName}</Text>
          )}
        </View>
        <View style={styles.timerBox}>
          <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Question Card */}
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          
          {currentQuestion.imageUrl && (
            <Image 
              source={{ uri: currentQuestion.imageUrl }} 
              style={styles.questionImage}
              resizeMode="contain"
            />
          )}
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {['A', 'B', 'C', 'D'].map((opt) => {
            const optionKey = `option${opt}` as keyof Question;
            const optionText = currentQuestion[optionKey] as string;
            
            let optionStyle = [styles.optionBtn];
            let optionTextStyle = [styles.optionText];
            
            if (selectedAnswer) {
              if (opt === currentQuestion.correctAnswer) {
                optionStyle.push(styles.optionCorrect);
                optionTextStyle.push(styles.optionTextCorrect);
              } else if (opt === selectedAnswer) {
                optionStyle.push(styles.optionWrong);
                optionTextStyle.push(styles.optionTextWrong);
              }
            }
            
            return (
              <TouchableOpacity
                key={opt}
                style={optionStyle}
                onPress={() => handleAnswer(opt as 'A' | 'B' | 'C' | 'D')}
                disabled={selectedAnswer !== null}
              >
                <View style={styles.optionBadge}>
                  <Text style={styles.optionBadgeText}>{opt}</Text>
                </View>
                <Text style={optionTextStyle}>{optionText}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explanation */}
        {showExplanation && (
          <View style={[styles.explanationCard, isCorrect ? styles.explanationCorrect : styles.explanationWrong]}>
            <Text style={styles.explanationTitle}>
              {isCorrect ? '✓ Jawaban Benar!' : '✗ Jawaban Salah!'}
            </Text>
            <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
            
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextBtnText}>
                {currentIndex < questions.length - 1 ? 'Soal Berikutnya' : 'Lihat Hasil'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  loadingText: { marginTop: 12, color: '#6b7280' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerIcon: { width: 32, height: 32, borderWidth: 2, borderColor: '#333', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 14, fontWeight: 'bold', color: '#374151' },
  headerSubtitle: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  timerBox: { backgroundColor: '#dc2626', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  timerText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  progressBg: { height: 6, backgroundColor: '#e5e7eb' },
  progressFill: { height: 6, backgroundColor: '#dc2626' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  questionCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 24, borderWidth: 1.5, borderColor: '#e5e7eb', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  questionText: { fontSize: 16, fontWeight: 'bold', color: '#111827', lineHeight: 24, marginBottom: 12 },
  questionImage: { width: '100%', height: 180, borderRadius: 8, marginTop: 12 },
  optionsContainer: { gap: 12, marginBottom: 24 },
  optionBtn: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#d1d5db', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
  optionBadgeText: { fontSize: 14, fontWeight: 'bold', color: '#374151' },
  optionText: { flex: 1, fontSize: 14, color: '#374151', lineHeight: 20 },
  optionCorrect: { borderColor: '#2e7d32', backgroundColor: '#dcfce7' },
  optionTextCorrect: { color: '#2e7d32', fontWeight: '600' },
  optionWrong: { borderColor: '#dc2626', backgroundColor: '#fee2e2' },
  optionTextWrong: { color: '#dc2626', fontWeight: '600' },
  explanationCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, borderWidth: 2 },
  explanationCorrect: { borderColor: '#2e7d32', backgroundColor: '#f0fdf4' },
  explanationWrong: { borderColor: '#dc2626', backgroundColor: '#fef2f2' },
  explanationTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#111827' },
  explanationText: { fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 20 },
  nextBtn: { backgroundColor: '#374151', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#6b7280' },
});
