import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

interface Item {
  id: string;
  name: string;
  type: 'organik' | 'anorganik';
  imageUrl?: string | null;
  explanation?: string;
}

export default function DragAndDropScreen({ route, navigation }: any) {
  const { user } = useAuth();
  const { levelId, levelName, duration, nilaiPerSoal } = route.params || {};
  
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration ? duration * 60 : 300);
  const [gameStarted, setGameStarted] = useState(false);
  const [hoveringZone, setHoveringZone] = useState<'organik' | 'anorganik' | null>(null);

  const pan = useRef(new Animated.ValueXY()).current;
  const organikZoneRef = useRef<any>(null);
  const anorganikZoneRef = useRef<any>(null);
  const itemRef = useRef<any>(null);
  
  const itemsRef = useRef(items);
  const currentIndexRef = useRef(currentIndex);
  const scoreRef = useRef(score);
  const wrongAnswersRef = useRef(wrongAnswers);
  
  useEffect(() => {
    itemsRef.current = items;
    currentIndexRef.current = currentIndex;
    scoreRef.current = score;
    wrongAnswersRef.current = wrongAnswers;
  }, [items, currentIndex, score, wrongAnswers]);

  useEffect(() => {
    if (!gameStarted) return;
    
    if (timeLeft <= 0) {
      finishGame(score, wrongAnswers);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameStarted]);

  const finishGame = async (finalScoreValue: number, finalWrongAnswers: any[]) => {
    const totalItems = itemsRef.current.length || items.length;
    const poinPerSoal = nilaiPerSoal || 10;
    
    if (totalItems === 0) {
      navigation.replace('UserTabs');
      return;
    }
    
    const totalScore = finalScoreValue * poinPerSoal;
    const maxScore = totalItems * poinPerSoal;
    const finalScore = Math.round((totalScore / maxScore) * 100);
    
    try {
      if (user) {
        await addDoc(collection(db, 'progress'), {
          userId: user.uid,
          type: 'simulasi',
          score: finalScore,
          correctCount: finalScoreValue,
          totalItems: totalItems,
          completedAt: new Date(),
        });
      }
    } catch (e) { console.error(e); }

    navigation.replace('HasilEvaluasi', {
      score: finalScore,
      totalItems: totalItems,
      correctCount: finalScoreValue,
      wrongAnswers: finalWrongAnswers,
      evaluasiName: 'Simulasi Praktek Pemilahan',
    });
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        let q = query(
          collection(db, 'soal'), 
          where('gameType', '==', 'DragDrop')
        );
        
        if (levelId) {
          q = query(
            collection(db, 'soal'),
            where('gameType', '==', 'DragDrop'),
            where('levelId', '==', levelId)
          );
        }
        
        const querySnapshot = await getDocs(q);
        const fetched: Item[] = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          fetched.push({ 
            id: doc.id, 
            name: data.name, 
            type: data.type,
            imageUrl: data.imageUrl || null,
            explanation: data.explanation || '',
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

  const handleAnswer = async (isCorrect: boolean, userAnswer: string) => {
    const currentItems = itemsRef.current;
    const currentIdx = currentIndexRef.current;
    const currentScore = scoreRef.current;
    const currentWrongAnswers = wrongAnswersRef.current;
    
    if (currentItems.length === 0 || currentIdx >= currentItems.length) {
      return;
    }
    
    const item = currentItems[currentIdx];
    
    const newWrongAnswer = {
      name: item.name,
      userAnswer: userAnswer,
      correctAnswer: item.type,
      imageUrl: item.imageUrl || null,
      explanation: item.explanation,
    };

    if (!isCorrect) {
      setWrongAnswers(prev => [...prev, newWrongAnswer]);
    }

    const newScore = isCorrect ? currentScore + 1 : currentScore;
    if (isCorrect) setScore(newScore);

    setFeedback(isCorrect ? '✓ Benar!' : '✗ Salah!');
    setTimeout(async () => {
      setFeedback(null);
      if (currentIdx < currentItems.length - 1) {
        setCurrentIndex(currentIdx + 1);
        pan.setValue({ x: 0, y: 0 });
      } else {
        const finalWrongAnswers = isCorrect ? currentWrongAnswers : [...currentWrongAnswers, newWrongAnswer];
        await finishGame(newScore, finalWrongAnswers);
      }
    }, 800);
  };

  const checkCollision = (pageX: number, pageY: number): Promise<'organik' | 'anorganik' | null> => {
    return new Promise((resolve) => {
      if (!organikZoneRef.current || !anorganikZoneRef.current) {
        resolve(null);
        return;
      }

      organikZoneRef.current.measureInWindow((ox: number, oy: number, owidth: number, oheight: number) => {
        if (!anorganikZoneRef.current) {
          resolve(null);
          return;
        }

        anorganikZoneRef.current.measureInWindow((ax: number, ay: number, awidth: number, aheight: number) => {
          const padding = 50;
          
          const inOrganik = pageX >= ox - padding &&
                           pageX <= ox + owidth + padding &&
                           pageY >= oy - padding &&
                           pageY <= oy + oheight + padding;
          
          const inAnorganik = pageX >= ax - padding &&
                             pageX <= ax + awidth + padding &&
                             pageY >= ay - padding &&
                             pageY <= ay + aheight + padding;
          
          if (inOrganik) {
            resolve('organik');
          } else if (inAnorganik) {
            resolve('anorganik');
          } else {
            resolve(null);
          }
        });
      });
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
        setHoveringZone(null);
      },
      onPanResponderMove: (_, gesture) => {
        pan.setValue({ x: gesture.dx, y: gesture.dy });
        
        itemRef.current?.measureInWindow((ix: number, iy: number, iwidth: number, iheight: number) => {
          const itemCenterX = ix + iwidth / 2;
          const itemCenterY = iy + iheight / 2;
          
          checkCollision(itemCenterX, itemCenterY).then((zone) => {
            setHoveringZone(zone);
          });
        });
      },
      onPanResponderRelease: () => {
        setIsDragging(false);
        
        const currentItems = itemsRef.current;
        const currentIdx = currentIndexRef.current;
        
        if (currentItems.length === 0) {
          return;
        }
        
        const item = currentItems[currentIdx];

        setTimeout(() => {
          if (!itemRef.current) {
            Animated.spring(pan, { 
              toValue: { x: 0, y: 0 }, 
              useNativeDriver: false 
            }).start();
            return;
          }

          itemRef.current.measureInWindow((ix: number, iy: number, iwidth: number, iheight: number) => {
            const itemCenterX = ix + iwidth / 2;
            const itemCenterY = iy + iheight / 2;
            
            checkCollision(itemCenterX, itemCenterY).then((zone) => {
              if (zone === 'organik') {
                Animated.timing(pan, { 
                  toValue: { x: 0, y: 0 }, 
                  duration: 200,
                  useNativeDriver: false 
                }).start(() => {
                  setHoveringZone(null);
                  handleAnswer(item.type === 'organik', 'organik');
                });
              } else if (zone === 'anorganik') {
                Animated.timing(pan, { 
                  toValue: { x: 0, y: 0 }, 
                  duration: 200,
                  useNativeDriver: false 
                }).start(() => {
                  setHoveringZone(null);
                  handleAnswer(item.type === 'anorganik', 'anorganik');
                });
              } else {
                Animated.spring(pan, { 
                  toValue: { x: 0, y: 0 }, 
                  useNativeDriver: false,
                  tension: 50,
                  friction: 7,
                }).start(() => {
                  setHoveringZone(null);
                });
              }
            }).catch(() => {
              Animated.spring(pan, { 
                toValue: { x: 0, y: 0 }, 
                useNativeDriver: false 
              }).start();
            });
          });
        }, 50);
      },
    })
  ).current;

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  const progress = ((currentIndex + 1) / items.length) * 100;
  const currentItem = items[currentIndex];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
          <Text style={{ fontWeight: 'bold' }}>X</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Simulasi Item: {currentIndex + 1} / {items.length}</Text>
          {levelName && (
            <Text style={styles.headerSubtitle}>{levelName}</Text>
          )}
        </View>
        {/* Timer */}
        <View style={[styles.timerBox, timeLeft < 60 ? { backgroundColor: '#fee2e2', borderColor: '#dc2626' } : {}]}>
          <Text style={[styles.timerText, timeLeft < 60 ? { color: '#dc2626' } : {}]}>
            ⏱ {formatTime(timeLeft)}
          </Text>
        </View>
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
        ref={(ref) => { itemRef.current = ref; }}
        collapsable={false}
        style={[
          styles.itemCard,
          {
            transform: [
              { translateX: pan.x }, 
              { translateY: pan.y },
              { scale: isDragging ? 1.1 : 1 }
            ],
            opacity: isDragging ? 0.9 : 1,
          }
        ]}
        {...panResponder.panHandlers}
      >
        {/* Item Image */}
        {currentItem?.imageUrl ? (
          <Image 
            source={{ uri: currentItem.imageUrl }} 
            style={styles.itemImageReal}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.itemImagePlaceholder}>
            <Text style={styles.placeholderText}>📦</Text>
          </View>
        )}
        <Text style={styles.itemName}>{currentItem?.name}</Text>
        <Text style={styles.itemHint}>
          {isDragging ? '[ Sedang Digeser... ]' : '[ Tahan & Geser ]'}
        </Text>
      </Animated.View>

      {/* Drop Zones with Highlight and Bin Icons */}
      <View style={styles.dropZones}>
        <View 
          ref={(ref) => { organikZoneRef.current = ref; }}
          collapsable={false}
          style={[
            styles.dropZone, 
            { 
              borderColor: '#2e7d32', 
              backgroundColor: hoveringZone === 'organik' ? '#dcfce7' : '#f0fdf4',
              borderWidth: hoveringZone === 'organik' ? 4 : 3,
              transform: hoveringZone === 'organik' ? [{ scale: 1.08 }] : [{ scale: 1 }],
            }
          ]}
        >
          {/* Trash Bin Icon */}
          <Ionicons 
            name={hoveringZone === 'organik' ? 'trash' : 'trash-outline'} 
            size={48} 
            color="#2e7d32" 
            style={[styles.trashIcon, hoveringZone === 'organik' && styles.trashIconOpen]}
          />
          <Text style={[styles.dropZoneLabel, { color: '#2e7d32' }]}>ORGANIK</Text>
          <Text style={[styles.dropZoneHint, hoveringZone === 'organik' && { fontWeight: 'bold', color: '#2e7d32' }]}>
            {hoveringZone === 'organik' ? '✓ Lepas di sini!' : 'Seret ke sini'}
          </Text>
        </View>
        
        <View 
          ref={(ref) => { anorganikZoneRef.current = ref; }}
          collapsable={false}
          style={[
            styles.dropZone, 
            { 
              borderColor: '#dc2626', 
              backgroundColor: hoveringZone === 'anorganik' ? '#fee2e2' : '#fef2f2',
              borderWidth: hoveringZone === 'anorganik' ? 4 : 3,
              transform: hoveringZone === 'anorganik' ? [{ scale: 1.08 }] : [{ scale: 1 }],
            }
          ]}
        >
          {/* Trash Bin Icon */}
          <Ionicons 
            name={hoveringZone === 'anorganik' ? 'trash' : 'trash-outline'} 
            size={48} 
            color="#dc2626" 
            style={[styles.trashIcon, hoveringZone === 'anorganik' && styles.trashIconOpen]}
          />
          <Text style={[styles.dropZoneLabel, { color: '#dc2626' }]}>ANORGANIK</Text>
          <Text style={[styles.dropZoneHint, hoveringZone === 'anorganik' && { fontWeight: 'bold', color: '#dc2626' }]}>
            {hoveringZone === 'anorganik' ? '✓ Lepas di sini!' : 'Seret ke sini'}
          </Text>
        </View>
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
  timerBox: { 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    backgroundColor: '#f1eee3', // surface-container
    borderRadius: 12, 
    borderWidth: 2, 
    borderColor: '#01190a' // primary
  },
  timerText: { 
    fontSize: 13, 
    fontWeight: '800', 
    color: '#01190a' // primary
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
    backgroundColor: '#b0ceb5', // primary-fixed
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
    width: 200, 
    height: 200, 
    backgroundColor: 'transparent', 
    alignSelf: 'center', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 40, 
    padding: 16,
    zIndex: 10,
  },
  itemImageReal: { 
    width: 140, 
    height: 140, 
    marginBottom: 12,
  },
  itemImagePlaceholder: { 
    width: 120, 
    height: 120, 
    backgroundColor: '#f1eee3', // surface-container
    borderRadius: 16, 
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#01190a', // primary
  },
  placeholderText: { fontSize: 48 },
  itemImage: { 
    width: 50, 
    height: 50, 
    backgroundColor: '#e5e7eb', 
    borderRadius: 8, 
    marginBottom: 8 
  },
  itemName: { 
    fontSize: 16, 
    fontWeight: '800', 
    textAlign: 'center', 
    paddingHorizontal: 8,
    color: '#1c1c15', // on-background
  },
  itemHint: { 
    fontSize: 11, 
    color: '#424843', // on-surface-variant
    marginTop: 6,
    fontWeight: '600',
  },
  dropZones: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    gap: 16 
  },
  dropZone: { 
    flex: 1, 
    height: 160, 
    borderWidth: 3, 
    borderStyle: 'dashed', 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  trashIcon: { 
    fontSize: 56, 
    marginBottom: 8,
  },
  trashIconOpen: {
    transform: [{ scale: 1.2 }],
  },
  dropZoneIcon: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 6, 
    color: '#374151' 
  },
  dropZoneLabel: { 
    fontWeight: '800', 
    fontSize: 15 
  },
  dropZoneHint: { 
    fontSize: 11, 
    color: '#424843', // on-surface-variant
    marginTop: 6, 
    textAlign: 'center',
    fontWeight: '600',
  },
  emptyText: { 
    textAlign: 'center', 
    marginTop: 40, 
    color: '#9ca3af' 
  },
});
