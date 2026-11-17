import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Platform } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { WebView } from 'react-native-webview';

interface NumberedItem {
  title?: string;
  description?: string;
}

interface ContentSection {
  subtitle?: string;
  content: string;
  isNumbered?: boolean;
  numberedSectionDescription?: string;
  numberedItems?: (string | NumberedItem)[];
}

// Variasi warna-warni cerah ceria untuk animasi card per-kata (karaoke pill)
const WORD_HIGHLIGHT_COLORS = [
  '#fde047', // Kuning cerah
  '#86efac', // Hijau mint segar
  '#93c5fd', // Biru muda ceria
  '#fca5a5', // Coral pink lembut
  '#d8b4fe', // Ungu lavender
  '#fed7aa', // Oranye peach
];

// Helper function untuk variasi warna badge - sesuai HTML design system asli
const getNumberColor = (index: number) => {
  const colors = ['#f4bf3d', '#b0ceb5', '#ffb4a3']; // tertiary-fixed-dim, primary-fixed, secondary-fixed-dim
  return colors[index % colors.length];
};

const getYouTubeId = (url?: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function DetailMateriScreen({ route, navigation }: any) {
  const { materi } = route.params;
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // State sinkronisasi kata aktif (Word-by-word karaoke highlight)
  const [activeWordId, setActiveWordId] = useState<number | null>(null);
  const isSpeakingRef = useRef(false);
  const activeSentenceIdxRef = useRef<number>(-1);
  const sentenceTimerRef = useRef<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const blockYMap = useRef<{ [key: string]: number }>({});
  const lastScrolledBlock = useRef<string>('');

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const youtubeId = getYouTubeId(materi?.videoUrl);

  // Parse content sections
  const contentSections: ContentSection[] = materi.sections || [
    { subtitle: '', content: materi.content || `Ini adalah materi tentang ${materi.title}.` }
  ];

  interface KaraokeWord {
    id: number;
    word: string;
  }

  interface KaraokeSentence {
    id: number;
    blockKey: string;
    text: string;
    words: KaraokeWord[];
  }

  // Pre-mapping teks per-kata dan kalimat untuk sinkronisasi kalimat-per-kalimat
  // Ini mengunci sinkronisasi agar TIDAK AKAN PERNAH terjadi akumulasi keterlambatan (drift)
  const { blockWordMap, sentences } = useMemo(() => {
    let wordCounter = 0;
    const map: { [blockKey: string]: KaraokeWord[] } = {};
    const sentenceList: KaraokeSentence[] = [];

    const processBlock = (rawText: string | undefined, blockKey: string) => {
      if (!rawText || !rawText.trim()) return;
      const clean = rawText.trim();
      map[blockKey] = [];

      // Pisahkan per kalimat (berdasarkan tanda titik, seru, tanya)
      // agar setiap kalimat menjadi acoustic anchor independen
      const sentenceStrings = clean.split(/(?<=[.!?])\s+/);

      sentenceStrings.forEach((sStr) => {
        if (!sStr.trim()) return;
        const tokens = sStr.trim().split(/\s+/);
        const sentenceWords: KaraokeWord[] = [];

        tokens.forEach((token) => {
          const id = wordCounter++;
          const item = { id, word: token };
          sentenceWords.push(item);
          map[blockKey].push(item);
        });

        sentenceList.push({
          id: sentenceList.length,
          blockKey,
          text: sStr.trim(),
          words: sentenceWords,
        });
      });
    };

    // 1. Judul materi
    processBlock(materi.title, 'title');

    // 2. Sections materi
    contentSections.forEach((sec, sIdx) => {
      if (sec.isNumbered) {
        if (sec.subtitle && sec.subtitle.trim()) {
          processBlock(sec.subtitle, `sec-${sIdx}-sub`);
        }
        if (sec.numberedSectionDescription && sec.numberedSectionDescription.trim()) {
          processBlock(sec.numberedSectionDescription, `sec-${sIdx}-desc`);
        }
        (sec.numberedItems || []).forEach((item: any, iIdx: number) => {
          const isString = typeof item === 'string';
          const titleStr = isString ? '' : (item.title || '');
          const descStr = isString ? item : (item.description || '');

          if (titleStr.trim()) {
            processBlock(titleStr, `sec-${sIdx}-item-${iIdx}-title`);
          }
          if (descStr.trim()) {
            processBlock(descStr, `sec-${sIdx}-item-${iIdx}-desc`);
          }
        });
      } else {
        if (sec.subtitle && sec.subtitle.trim()) {
          processBlock(sec.subtitle, `sec-${sIdx}-sub`);
        }
        if (sec.content && sec.content.trim()) {
          processBlock(sec.content, `sec-${sIdx}-content`);
        }
      }
    });

    return {
      blockWordMap: map,
      sentences: sentenceList,
    };
  }, [materi, contentSections]);

  const recordBlockY = (blockKey: string, y: number) => {
    blockYMap.current[blockKey] = y;
  };

  const scrollToBlock = (blockKey: string) => {
    if (lastScrolledBlock.current === blockKey) return;
    lastScrolledBlock.current = blockKey;

    const y = blockYMap.current[blockKey];
    if (y !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: Math.max(0, y - 80),
        animated: true,
      });
    }
  };

  // Durasi kata di dalam kalimat (tempo natural TTS 0.95):
  // Rata-rata 1 kata Bahasa Indonesia = ~360ms - 450ms
  const getWordDuration = (word: string) => {
    const clean = word.replace(/[^a-zA-Z0-9]/g, '');
    const vowels = (clean.match(/[aiueoAIUEO]/g) || []).length;
    const syllables = Math.max(1, vowels);

    // 120ms + 160ms per suku kata
    const wordBaseMs = 120 + syllables * 160;

    let pauseMs = 0;
    if (word.includes(',')) {
      pauseMs = 200;
    } else if (word.includes('.') || word.includes('!') || word.includes('?')) {
      pauseMs = 280;
    }

    return wordBaseMs + pauseMs;
  };

  const stopSpeech = () => {
    isSpeakingRef.current = false;
    setIsSpeaking(false);
    setActiveWordId(null);
    activeSentenceIdxRef.current = -1;
    lastScrolledBlock.current = '';

    if (sentenceTimerRef.current) {
      clearTimeout(sentenceTimerRef.current);
      sentenceTimerRef.current = null;
    }

    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    } else {
      try {
        Speech.stop();
      } catch {}
    }
  };

  const playSentence = (sIdx: number) => {
    if (!isSpeakingRef.current || sIdx >= sentences.length) {
      stopSpeech();
      return;
    }

    activeSentenceIdxRef.current = sIdx;
    const sentence = sentences[sIdx];
    scrollToBlock(sentence.blockKey);

    // 1. Jalankan stepper kata khusus untuk kalimat ini saja (tidak ada akumulasi keterlambatan!)
    const words = sentence.words;
    const stepWord = (wIdx: number) => {
      if (!isSpeakingRef.current || activeSentenceIdxRef.current !== sIdx) return;
      if (wIdx < words.length) {
        setActiveWordId(words[wIdx].id);
        const dur = getWordDuration(words[wIdx].word);
        sentenceTimerRef.current = setTimeout(() => {
          stepWord(wIdx + 1);
        }, dur);
      }
    };

    // 2. Putar audio untuk kalimat ini
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(sentence.text);
      utterance.lang = 'id-ID';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        if (!isSpeakingRef.current || activeSentenceIdxRef.current !== sIdx) return;
        stepWord(0);
      };

      // Saat kalimat ini selesai disuarakan oleh speaker browser:
      // Reset timer kata dan langsung lanjutkan ke kalimat berikutnya!
      utterance.onend = () => {
        if (!isSpeakingRef.current || activeSentenceIdxRef.current !== sIdx) return;
        if (sentenceTimerRef.current) clearTimeout(sentenceTimerRef.current);
        // Jeda nafas alami 150ms antar kalimat
        setTimeout(() => {
          if (isSpeakingRef.current) {
            playSentence(sIdx + 1);
          }
        }, 150);
      };

      utterance.onerror = (e: any) => {
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          console.warn('Speech error:', e.error);
          if (isSpeakingRef.current) {
            playSentence(sIdx + 1);
          }
        } else {
          stopSpeech();
        }
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // Native (Android/iOS)
      stepWord(0);
      Speech.speak(sentence.text, {
        language: 'id-ID',
        rate: 0.95,
        pitch: 1.0,
        onDone: () => {
          if (!isSpeakingRef.current || activeSentenceIdxRef.current !== sIdx) return;
          if (sentenceTimerRef.current) clearTimeout(sentenceTimerRef.current);
          setTimeout(() => {
            if (isSpeakingRef.current) {
              playSentence(sIdx + 1);
            }
          }, 150);
        },
        onStopped: () => stopSpeech(),
        onError: () => stopSpeech(),
      });
    }
  };

  const startSpeech = () => {
    stopSpeech();

    if (!sentences.length) return;

    isSpeakingRef.current = true;
    setIsSpeaking(true);

    playSentence(0);
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      stopSpeech();
    } else {
      startSpeech();
    }
  };

  // Helper render teks: Menjaga desain asli 100% utuh tanpa horizontal padding agar teks tidak bergeser/turun baris!
  const renderHighlightedText = (
    text: string | undefined,
    blockKey: string,
    baseStyle: any
  ) => {
    if (!text) return null;
    if (!isSpeaking || activeWordId === null) {
      return (
        <Text
          style={baseStyle}
          onLayout={(e) => recordBlockY(blockKey, e.nativeEvent.layout.y)}
        >
          {text}
        </Text>
      );
    }

    const blockWords = blockWordMap[blockKey];
    if (!blockWords || blockWords.length === 0) {
      return (
        <Text
          style={baseStyle}
          onLayout={(e) => recordBlockY(blockKey, e.nativeEvent.layout.y)}
        >
          {text}
        </Text>
      );
    }

    return (
      <Text
        style={baseStyle}
        onLayout={(e) => recordBlockY(blockKey, e.nativeEvent.layout.y)}
      >
        {blockWords.map((item) => {
          const isActive = activeWordId === item.id;
          const color = WORD_HIGHLIGHT_COLORS[item.id % WORD_HIGHLIGHT_COLORS.length];

          if (isActive) {
            return (
              <React.Fragment key={item.id}>
                <Text
                  style={[
                    styles.karaokeWordCard,
                    { backgroundColor: color }
                  ]}
                >
                  {item.word}
                </Text>
                <Text>{' '}</Text>
              </React.Fragment>
            );
          }

          return (
            <Text key={item.id}>
              {item.word}{' '}
            </Text>
          );
        })}
      </Text>
    );
  };

  const handleMarkDone = async () => {
    if (!user || done) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'progress', `${user.uid}_materi_${materi.id}`), {
        userId: user.uid,
        type: 'materi',
        materiId: materi.id,
        completedAt: new Date()
      });
      setDone(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Materi</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.audioHeaderBtn, isSpeaking && styles.audioHeaderBtnActive]}
              onPress={toggleSpeech}
              activeOpacity={0.7}
              accessibilityLabel={isSpeaking ? "Hentikan Suara" : "Putar Suara Narasi"}
            >
              <Ionicons
                name={isSpeaking ? "stop" : "play"}
                size={18}
                color={isSpeaking ? "#fff" : "#142e1d"}
                style={!isSpeaking ? { marginLeft: 2 } : {}}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuBtn}>
              <Ionicons name="ellipsis-horizontal" size={24} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Banner Image with rounded corners and border */}
        <View style={styles.bannerContainer}>
          {materi.imageUrl ? (
            <Image source={{ uri: materi.imageUrl }} style={styles.bannerImage} />
          ) : (
            <View style={[styles.bannerImage, styles.bannerPlaceholder]}>
              <Ionicons name="image-outline" size={48} color="#9ca3af" />
            </View>
          )}
        </View>

        <View style={styles.body}>
          {/* Category Badge */}
          <View style={styles.badgeRow}>
            <View style={[styles.badge, materi.category === 'Anorganik' ? styles.badgeAnorg : styles.badgeOrg]}>
              <Text style={[styles.badgeText, materi.category === 'Anorganik' ? styles.badgeTextAnorg : styles.badgeTextOrg]}>
                {materi.category?.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Title */}
          {renderHighlightedText(materi.title, 'title', styles.title)}

          {/* Video Edukasi Interaktif Card (Multimedia) */}
          {materi.videoUrl ? (
            <View style={styles.videoCard}>
              <View style={styles.videoHeader}>
                <View style={styles.videoHeaderBadge}>
                  <Ionicons name="videocam" size={14} color="#fff" />
                  <Text style={styles.videoHeaderBadgeText}>VIDEO EDUKASI</Text>
                </View>
                <Text style={styles.videoHeaderTitle}>Tonton Pembelajaran Visual</Text>
              </View>
              {youtubeId ? (
                Platform.OS === 'web' ? (
                  <View style={styles.videoContainer}>
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}?playsinline=1`}
                      style={{ width: '100%', height: 210, border: 'none', borderRadius: 12 }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </View>
                ) : (
                  <View style={styles.videoContainer}>
                    <WebView
                      style={styles.videoWebview}
                      javaScriptEnabled={true}
                      domStorageEnabled={true}
                      allowsFullscreenVideo={true}
                      source={{ uri: `https://www.youtube.com/embed/${youtubeId}?playsinline=1` }}
                    />
                  </View>
                )
              ) : (
                <View style={styles.videoFallback}>
                  <Ionicons name="film-outline" size={28} color="#dc2626" />
                  <Text style={styles.videoFallbackText}>Tautan video:</Text>
                  <Text style={styles.videoFallbackUrl} numberOfLines={1}>{materi.videoUrl}</Text>
                </View>
              )}
            </View>
          ) : null}

          {/* Content Sections */}
          {contentSections.map((section, index) => (
            <View key={index}>
              {section.isNumbered ? (
                // Render numbered section in a card (Desain Asli Utuh)
                <View
                  style={styles.numberedCard}
                  onLayout={(e) => recordBlockY(`sec-${index}-sub`, e.nativeEvent.layout.y)}
                >
                  {section.subtitle && section.subtitle.trim() !== '' && (
                    renderHighlightedText(section.subtitle, `sec-${index}-sub`, styles.numberedCardTitle)
                  )}

                  {/* Deskripsi pembuka sebelum daftar nomor */}
                  {section.numberedSectionDescription && section.numberedSectionDescription.trim() !== '' && (
                    renderHighlightedText(section.numberedSectionDescription, `sec-${index}-desc`, styles.numberedCardDescription)
                  )}

                  <View style={styles.numberedListContainer}>
                    {(section.numberedItems || []).filter((item: any) => {
                      if (!item) return false;
                      if (typeof item === 'string') return item.trim() !== '';
                      const titleStr = typeof item.title === 'string' ? item.title : '';
                      const descStr = typeof item.description === 'string' ? item.description : '';
                      return titleStr.trim() !== '' || descStr.trim() !== '';
                    }).map((item: any, itemIndex, array) => {
                      const isString = typeof item === 'string';
                      const titleStr = isString ? '' : (item.title || '');
                      const descStr = isString ? item : (item.description || '');
                      
                      return (
                        <View
                          key={itemIndex}
                          style={[
                            styles.numberedItem,
                            itemIndex === array.length - 1 && { marginBottom: 0 }
                          ]}
                        >
                          <View style={[styles.numberBadge, { backgroundColor: getNumberColor(itemIndex) }]}>
                            <Text style={styles.numberBadgeText}>{itemIndex + 1}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            {/* Title poin */}
                            {!isString && titleStr.trim() !== '' && (
                              renderHighlightedText(titleStr, `sec-${index}-item-${itemIndex}-title`, styles.numberedItemTitle)
                            )}
                            {/* Penjelasan / legacy string */}
                            {renderHighlightedText(descStr, `sec-${index}-item-${itemIndex}-desc`, styles.numberedText)}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ) : (
                // Render normal paragraph section (Desain Asli Utuh)
                <View
                  style={styles.contentSection}
                  onLayout={(e) => recordBlockY(`sec-${index}-content`, e.nativeEvent.layout.y)}
                >
                  {section.subtitle && section.subtitle.trim() !== '' && (
                    renderHighlightedText(section.subtitle, `sec-${index}-sub`, styles.sectionTitle)
                  )}
                  {renderHighlightedText(section.content, `sec-${index}-content`, styles.sectionContent)}
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.doneBtn, done && styles.doneBtnActive]}
          onPress={handleMarkDone}
          disabled={saving || done}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name={done ? "checkmark-circle" : "checkmark-circle-outline"} size={20} color="#fff" />
              <Text style={styles.doneBtnText}>
                {done ? 'Tandai Telah Selesai Dibaca' : 'Tandai Telah Selesai Dibaca'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcf9ee' }, // background

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, // margin-mobile
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fcf9ee',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#01190a', // primary
  },
  headerTitle: {
    fontSize: 28, // headline-xl-mobile
    fontWeight: '800',
    color: '#1c1c15', // on-background
    lineHeight: 34,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  audioHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#01190a', // primary
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  audioHeaderBtnActive: {
    backgroundColor: '#dc2626',
    borderColor: '#01190a',
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#01190a', // primary
  },

  // Banner Image with neo-shadow
  bannerContainer: {
    paddingHorizontal: 20, // margin-mobile
    marginBottom: 32, // mb-8
  },
  bannerImage: {
    width: '100%',
    aspectRatio: 16 / 9, // aspect-video
    borderRadius: 32, // rounded-[2rem]
    borderWidth: 4,
    borderColor: '#01190a', // primary
    // Neo-shadow effect
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  bannerPlaceholder: {
    backgroundColor: '#e5e2d8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Body Content
  body: {
    paddingHorizontal: 20 // margin-mobile
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // gap-2
    marginBottom: 12, // mb-3
  },
  badge: {
    paddingHorizontal: 16, // px-4
    paddingVertical: 6, // py-1.5
    borderRadius: 9999, // rounded-full
    borderWidth: 2,
    borderColor: '#01190a', // primary
  },
  badgeOrg: {
    backgroundColor: '#fe7d5e', // secondary-container
  },
  badgeAnorg: {
    backgroundColor: '#fe7d5e', // secondary-container
  },
  badgeText: {
    fontSize: 12, // label-sm
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  badgeTextOrg: { color: '#711601' }, // on-secondary-container
  badgeTextAnorg: { color: '#711601' }, // on-secondary-container

  // Title
  title: {
    fontSize: 22, // headline-lg-mobile
    fontWeight: '800',
    color: '#1c1c15', // on-background
    marginBottom: 16, // mb-4
    lineHeight: 28,
  },

  // Content Sections
  contentSection: {
    marginBottom: 24, // space-y-6
  },
  sectionTitle: {
    fontSize: 20, // headline-md
    fontWeight: '700',
    color: '#1c1c15', // on-background
    marginBottom: 12, // mb-3
    lineHeight: 28,
  },
  sectionContent: {
    fontSize: 16, // body-md
    color: '#424843', // on-surface-variant
    lineHeight: 24,
  },

  // Numbered Card - Big card containing title and all numbered items
  numberedCard: {
    backgroundColor: '#f1eee3', // surface-container
    borderRadius: 12, // rounded-xl
    paddingVertical: 20, // py-5 - consistent vertical padding
    paddingHorizontal: 24, // px-6
    marginBottom: 24, // space-y-6
    borderWidth: 2,
    borderColor: '#c2c8c0', // outline-variant
  },
  numberedCardTitle: {
    fontSize: 20, // headline-md
    fontWeight: '700',
    color: '#1c1c15', // on-background
    marginBottom: 20, // mb-5 - consistent with vertical padding
    lineHeight: 28,
  },
  numberedCardDescription: {
    fontSize: 16,
    color: '#424843',
    lineHeight: 24,
    marginBottom: 20,
    backgroundColor: '#d6ebd9', // Light green background
    padding: 12,
    borderRadius: 8,
  },

  // Numbered List within card
  numberedListContainer: {
    // Container untuk list items
  },
  numberedItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16, // space-y-4
  },
  numberedItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1c1c15',
    marginBottom: 4,
  },
  numberBadge: {
    width: 32, // w-8
    height: 32, // h-8
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16, // gap-4
    borderWidth: 2,
    borderColor: '#01190a', // primary
  },
  numberBadgeText: {
    fontSize: 14, // label-bold
    fontWeight: '700',
    color: '#1c1c15', // on-background
    lineHeight: 16,
  },
  numberedText: {
    flex: 1,
    fontSize: 16, // body-md
    color: '#424843', // on-surface-variant
    lineHeight: 24,
  },

  // Animasi Card Per-1-Kata (Karaoke Word Card Highlight) - Zero Horizontal Padding agar layout 100% stabil
  karaokeWordCard: {
    color: '#000000',
    borderRadius: 4,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },

  // Footer Button with neo-shadow
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 30,
    backgroundColor: 'transparent',
  },
  doneBtn: {
    height: 64, // h-16
    backgroundColor: '#142e1d', // primary-container
    borderRadius: 20, // rounded-[1.25rem]
    borderWidth: 2,
    borderColor: '#01190a', // primary
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    // Neo-shadow
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  doneBtnActive: {
    backgroundColor: '#2e7d32',
  },
  doneBtnText: {
    fontWeight: '700',
    fontSize: 20, // headline-md
    color: '#cbead0', // primary-fixed
    lineHeight: 28,
  },

  // Video Card
  videoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 22,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  videoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  videoHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#dc2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  videoHeaderBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  videoHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  videoContainer: {
    height: 210,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  videoWebview: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
  },
  videoFallbackText: {
    fontSize: 13,
    color: '#991b1b',
    marginTop: 8,
    fontWeight: '600',
  },
  videoFallbackUrl: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
});