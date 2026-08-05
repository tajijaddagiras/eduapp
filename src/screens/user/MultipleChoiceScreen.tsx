import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

  const finishGame = async (finalCorrectCount: number, finalWrongAnswers: any[]) => {
    const totalQuestions = questions.length;
    const poinPerSoal = nilaiPerSoal || 10;
    
    if (totalQuestions === 0) {
      navigation.replace('UserTabs');
      return;
    }
    
    const totalScore = finalCorrectCount * poinPerSoal;
    const maxScore = totalQuestions * poinPerSoal;
    const finalScore = Math.round((totalScore / maxScore) * 100);
    
    try {
      if (user) {
        await addDoc(collection(db, 'progress'), {
          userId: user.uid,
          type: 'pilihan-ganda',
          score: finalScore,
          correctCount: finalCorrectCount,
          totalItems: totalQuestions,
          completedAt: new Date(),
        });
      }
    } catch (e) { console.error(e); }

    navigation.replace('HasilEvaluasi', {
      score: finalScore,
      totalItems: totalQuestions,
      correctCount: finalCorrectCount,
      wrongAnswers: finalWrongAnswers,
      evaluasiName: 'Evaluasi Pilihan Ganda',
    });
  };

  const handleTimeUp = async () => {
    await finishGame(score, wrongAnswers);
  };

  const handleAnswer = (answer: 'A' | 'B' | 'C' | 'D') => {
    if (selectedAnswer) return;
    
    setSelectedAnswer(answer);
    const question = questions[currentIndex];
    const isCorrect = question.correctAnswer === answer;
    
    let currentWrongAnswers = [...wrongAnswers];
    if (!isCorrect) {
      const optionsMap: Record<string, string> = {
        A: question.optionA,
        B: question.optionB,
        C: question.optionC,
        D: question.optionD,
      };
      const newWrongAnswer = {
        name: question.question,
        userAnswer: answer,
        userAnswerText: `${answer}. ${optionsMap[answer]}`,
        correctAnswer: question.correctAnswer,
        correctAnswerText: `${question.correctAnswer}. ${optionsMap[question.correctAnswer]}`,
        imageUrl: question.imageUrl || null,
        explanation: question.explanation,
      };
      currentWrongAnswers.push(newWrongAnswer);
      setWrongAnswers(currentWrongAnswers);
    }
    
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);
    
    setTimeout(async () => {
      const isLastQuestion = currentIndex >= questions.length - 1;
      if (isLastQuestion) {
        await finishGame(newScore, currentWrongAnswers);
      } else {
        setSelectedAnswer(null);
        setCurrentIndex(currentIndex + 1);
      }
    }, 1200);
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
            
            let optionStyle: any[] = [styles.optionBtn];
            let optionTextStyle: any[] = [styles.optionText];
            
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
                {selectedAnswer && opt === currentQuestion.correctAnswer && (
                  <Ionicons name="checkmark-circle" size={24} color="#2e7d32" />
                )}
                {selectedAnswer && opt === selectedAnswer && opt !== currentQuestion.correctAnswer && (
                  <Ionicons name="close-circle" size={24} color="#dc2626" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
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
    color: '#424843', // on-surface-variant
    fontSize: 15,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 20, 
    paddingTop: 50, 
    backgroundColor: '#fcf9ee',
  },
  headerIcon: { 
    width: 40, 
    height: 40, 
    borderWidth: 2, 
    borderColor: '#01190a', // primary
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: 'transparent',
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
  timerBox: { 
    backgroundColor: '#142e1d', // primary-container
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#01190a', // primary
  },
  timerText: { 
    color: '#cbead0', // primary-fixed
    fontWeight: '800', 
    fontSize: 14 
  },
  progressBg: { 
    height: 6, 
    backgroundColor: '#e5e2d8' // outline-variant lighter
  },
  progressFill: { 
    height: 6, 
    backgroundColor: '#fe7d5e' // secondary-container
  },
  scrollContent: { 
    padding: 20, 
    paddingBottom: 100 
  },
  questionCard: { 
    backgroundColor: '#ffffff', 
    borderRadius: 20, 
    padding: 24, 
    marginBottom: 24, 
    borderWidth: 3, 
    borderColor: '#01190a', // primary
    // Neo-shadow
    shadowColor: '#000', 
    shadowOffset: { width: 4, height: 4 }, 
    shadowOpacity: 1, 
    shadowRadius: 0, 
    elevation: 6,
  },
  questionText: { 
    fontSize: 17, 
    fontWeight: '700', 
    color: '#1c1c15', // on-background
    lineHeight: 26, 
    marginBottom: 12 
  },
  questionImage: { 
    width: '100%', 
    height: 180, 
    borderRadius: 12, 
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#01190a', // primary
  },
  optionsContainer: { 
    gap: 12, 
    marginBottom: 24 
  },
  optionBtn: { 
    backgroundColor: '#ffffff', 
    borderWidth: 2, 
    borderColor: '#01190a', // primary
    borderRadius: 16, 
    padding: 18, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 14 
  },
  optionBadge: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: '#f1eee3', // surface-container
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#01190a', // primary
  },
  optionBadgeText: { 
    fontSize: 15, 
    fontWeight: '800', 
    color: '#1c1c15' // on-background
  },
  optionText: { 
    flex: 1, 
    fontSize: 15, 
    color: '#1c1c15', // on-background
    lineHeight: 22,
    fontWeight: '600',
  },
  optionCorrect: { 
    borderColor: '#b0ceb5', // primary-fixed
    backgroundColor: '#dcfce7',
    borderWidth: 3,
  },
  optionTextCorrect: { 
    color: '#01190a', // primary
    fontWeight: '800' 
  },
  optionWrong: { 
    borderColor: '#fe7d5e', // secondary-container
    backgroundColor: '#fee2e2',
    borderWidth: 3,
  },
  optionTextWrong: { 
    color: '#711601', // on-secondary-container
    fontWeight: '800' 
  },
  explanationCard: { 
    backgroundColor: '#ffffff', 
    borderRadius: 20, 
    padding: 24, 
    borderWidth: 3,
    // Neo-shadow
    shadowColor: '#000', 
    shadowOffset: { width: 4, height: 4 }, 
    shadowOpacity: 1, 
    shadowRadius: 0, 
    elevation: 6,
  },
  explanationCorrect: { 
    borderColor: '#b0ceb5', // primary-fixed
    backgroundColor: '#f0fdf4' 
  },
  explanationWrong: { 
    borderColor: '#fe7d5e', // secondary-container
    backgroundColor: '#fef2f2' 
  },
  explanationTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    marginBottom: 12, 
    color: '#1c1c15' // on-background
  },
  explanationText: { 
    fontSize: 15, 
    color: '#424843', // on-surface-variant
    lineHeight: 24, 
    marginBottom: 20 
  },
  nextBtn: { 
    backgroundColor: '#142e1d', // primary-container
    paddingVertical: 16, 
    borderRadius: 16, 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#01190a', // primary
    // Neo-shadow
    shadowColor: '#000', 
    shadowOffset: { width: 3, height: 3 }, 
    shadowOpacity: 1, 
    shadowRadius: 0, 
    elevation: 6,
  },
  nextBtnText: { 
    color: '#cbead0', // primary-fixed
    fontWeight: '800', 
    fontSize: 16 
  },
  emptyText: { 
    textAlign: 'center', 
    marginTop: 40, 
    color: '#9ca3af' 
  },
});
