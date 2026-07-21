import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface ContentSection {
  subtitle?: string;
  content: string;
  isNumbered?: boolean;
  numberedItems?: string[];
}

// Helper function untuk variasi warna badge - sesuai HTML design system
const getNumberColor = (index: number) => {
  const colors = ['#f4bf3d', '#b0ceb5', '#ffb4a3']; // tertiary-fixed-dim, primary-fixed, secondary-fixed-dim
  return colors[index % colors.length];
};

export default function DetailMateriScreen({ route, navigation }: any) {
  const { materi } = route.params;
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  // Parse content sections - jika ada array sections, gunakan itu; jika tidak, convert content jadi section pertama
  const contentSections: ContentSection[] = materi.sections || [
    { subtitle: '', content: materi.content || `Ini adalah materi tentang ${materi.title}.` }
  ];

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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Materi</Text>
          <TouchableOpacity style={styles.menuBtn}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#111827" />
          </TouchableOpacity>
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
          <Text style={styles.title}>{materi.title}</Text>

          {/* Content Sections */}
          {contentSections.map((section, index) => (
            <View key={index}>
              {section.isNumbered ? (
                // Render numbered section in a card
                <View style={styles.numberedCard}>
                  {section.subtitle && section.subtitle.trim() !== '' && (
                    <Text style={styles.numberedCardTitle}>{section.subtitle}</Text>
                  )}
                  
                  <View style={styles.numberedListContainer}>
                    {(section.numberedItems || []).filter(item => item.trim() !== '').map((item, itemIndex, array) => (
                      <View 
                        key={itemIndex} 
                        style={[
                          styles.numberedItem, 
                          itemIndex === array.length - 1 && { marginBottom: 0 } // Remove margin on last item
                        ]}
                      >
                        <View style={[styles.numberBadge, { backgroundColor: getNumberColor(itemIndex) }]}>
                          <Text style={styles.numberBadgeText}>{itemIndex + 1}</Text>
                        </View>
                        <Text style={styles.numberedText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                // Render normal paragraph section
                <View style={styles.contentSection}>
                  {section.subtitle && section.subtitle.trim() !== '' && (
                    <Text style={styles.sectionTitle}>{section.subtitle}</Text>
                  )}
                  <Text style={styles.sectionContent}>{section.content}</Text>
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
    aspectRatio: 16/9, // aspect-video
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
  
  // Numbered List within card
  numberedListContainer: {
    // Container untuk list items
  },
  numberedItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16, // space-y-4
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
});
